"use client";

import { ChevronDown, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2] as const;
/** 파형을 이 해상도로 디코딩해두고, 실제 렌더링 막대 수는 컨테이너 폭에 맞춰 리샘플링한다. */
const RAW_PEAK_COUNT = 120;
const FALLBACK_RAW_PEAKS = Array(RAW_PEAK_COUNT).fill(0.3);
/** 막대 1개가 차지하는 최소 폭(간격 포함, px). 좁은 화면에서 막대가 0px로 찌그러지지 않도록 이 값 기준으로 막대 수를 줄인다. */
const MIN_BAR_SLOT_PX = 4;
const MIN_BAR_COUNT = 12;

/**
 * `<audio>`의 duration을 읽어 콜백에 반영한다. MediaRecorder(webm/opus 등)로 만든 오디오는
 * Chrome에서 duration이 Infinity로 잡히는 알려진 버그가 있어, 끝으로 seek했다가 되돌려 실제 길이를 다시 계산시킨다.
 */
function resolveAudioDuration(
  audio: HTMLAudioElement,
  isFixingDurationRef: React.RefObject<boolean>,
  setDuration: (seconds: number) => void,
) {
  if (Number.isFinite(audio.duration)) {
    setDuration(audio.duration);
    return;
  }
  isFixingDurationRef.current = true;
  audio.currentTime = 1e101;
  const handleTimeUpdate = () => {
    audio.removeEventListener("timeupdate", handleTimeUpdate);
    audio.currentTime = 0;
    isFixingDurationRef.current = false;
    if (Number.isFinite(audio.duration)) setDuration(audio.duration);
  };
  audio.addEventListener("timeupdate", handleTimeUpdate);
}

function resamplePeaks(rawPeaks: number[], targetCount: number): number[] {
  if (targetCount <= 0 || rawPeaks.length === 0) return [];
  const bucketSize = rawPeaks.length / targetCount;
  const result: number[] = [];
  for (let i = 0; i < targetCount; i++) {
    const start = Math.floor(i * bucketSize);
    const end = Math.max(start + 1, Math.floor((i + 1) * bucketSize));
    let max = 0;
    for (let j = start; j < end && j < rawPeaks.length; j++) {
      if (rawPeaks[j] > max) max = rawPeaks[j];
    }
    result.push(max);
  }
  return result;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** 오디오를 디코딩해 파형 막대별 최대 진폭(0~1)을 뽑는다. S3 버킷에 GET용 CORS가 없으면 null을 반환한다. */
async function extractWaveformPeaks(
  audioUrl: string,
  barCount: number,
): Promise<number[] | null> {
  try {
    const res = await fetch(audioUrl);
    if (!res.ok) return null;

    const arrayBuffer = await res.arrayBuffer();
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0);
    const samplesPerBar = Math.max(
      1,
      Math.floor(channelData.length / barCount),
    );

    const peaks: number[] = [];
    for (let i = 0; i < barCount; i++) {
      const start = i * samplesPerBar;
      let max = 0;
      for (let j = 0; j < samplesPerBar; j++) {
        const value = Math.abs(channelData[start + j] ?? 0);
        if (value > max) max = value;
      }
      peaks.push(max);
    }

    await audioContext.close();

    const peakMax = Math.max(...peaks, 0.01);
    return peaks.map((p) => p / peakMax);
  } catch {
    return null;
  }
}

export function AnswerAudioPlayer({ audioUrl }: { audioUrl: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const rateMenuRef = useRef<HTMLDivElement>(null);
  const waveformRef = useRef<HTMLButtonElement>(null);
  const isFixingDurationRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isRateMenuOpen, setIsRateMenuOpen] = useState(false);
  const [peaks, setPeaks] = useState<number[] | null>(null);
  const [barCount, setBarCount] = useState(RAW_PEAK_COUNT);

  useEffect(() => {
    let cancelled = false;
    extractWaveformPeaks(audioUrl, RAW_PEAK_COUNT).then((result) => {
      if (!cancelled) setPeaks(result);
    });
    return () => {
      cancelled = true;
    };
  }, [audioUrl]);

  useEffect(() => {
    const el = waveformRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      const nextBarCount = Math.max(
        MIN_BAR_COUNT,
        Math.floor(width / MIN_BAR_SLOT_PX),
      );
      setBarCount(Math.min(RAW_PEAK_COUNT, nextBarCount));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    if (!isRateMenuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (!rateMenuRef.current?.contains(e.target as Node))
        setIsRateMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isRateMenuOpen]);

  useEffect(() => {
    const audio = audioRef.current;
    // 서버 렌더링된 <audio src>는 하이드레이션 전부터 로드가 시작되므로, loadedmetadata가
    // React 리스너 연결 전에 이미 발생해 있을 수 있다. 마운트 시점에 한 번 직접 확인한다.
    if (audio && audio.readyState >= 1) {
      resolveAudioDuration(audio, isFixingDurationRef, setDuration);
    }
  }, []);

  function handleTogglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play();
    else audio.pause();
  }

  function handleSeek(e: React.MouseEvent<HTMLButtonElement>) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(
      1,
      Math.max(0, (e.clientX - rect.left) / rect.width),
    );
    audio.currentTime = ratio * duration;
  }

  const progressRatio = duration > 0 ? currentTime / duration : 0;
  const bars = resamplePeaks(peaks ?? FALLBACK_RAW_PEAKS, barCount);

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={(e) =>
          resolveAudioDuration(
            e.currentTarget,
            isFixingDurationRef,
            setDuration,
          )
        }
        onDurationChange={(e) => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d)) setDuration(d);
        }}
        onTimeUpdate={(e) => {
          if (isFixingDurationRef.current) return;
          setCurrentTime(e.currentTarget.currentTime);
        }}
        className="hidden"
      />

      <button
        type="button"
        onClick={handleTogglePlay}
        aria-label={isPlaying ? "일시정지" : "재생"}
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white transition-colors hover:bg-orange-600"
      >
        {isPlaying ? (
          <Pause className="size-5" fill="currentColor" />
        ) : (
          <Play className="size-5 translate-x-0.5" fill="currentColor" />
        )}
      </button>

      <button
        ref={waveformRef}
        type="button"
        onClick={handleSeek}
        aria-label="재생 위치 선택"
        className="flex h-8 min-w-0 flex-1 items-center gap-[2px]"
      >
        {bars.map((peak, i) => {
          const heightPercent = Math.max(12, peak * 100);
          const isPlayed = i / bars.length < progressRatio;
          return (
            <span
              key={i}
              className={`flex-1 rounded-full transition-colors ${
                isPlayed ? "bg-orange-500" : "bg-zinc-300"
              }`}
              style={{ height: `${heightPercent}%` }}
            />
          );
        })}
      </button>

      <span className="shrink-0 text-xs text-zinc-400 tabular-nums">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>

      <div ref={rateMenuRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setIsRateMenuOpen((v) => !v)}
          className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
        >
          {playbackRate.toFixed(1)}x
          <ChevronDown className="size-3.5" />
        </button>

        {isRateMenuOpen && (
          <div className="absolute right-0 z-10 mt-1 w-20 rounded-lg bg-white py-1 shadow-lg ring-1 ring-zinc-200">
            {PLAYBACK_RATES.map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => {
                  setPlaybackRate(rate);
                  setIsRateMenuOpen(false);
                }}
                className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-orange-50 ${
                  rate === playbackRate
                    ? "font-semibold text-orange-600"
                    : "text-zinc-600"
                }`}
              >
                {rate.toFixed(1)}x
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
