"use client";

import { Mic } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BAR_COUNT = 24;
const IDLE_BAR_HEIGHT = "4px";
/** 평균 음량이 이 값을 넘는 상태가 VOICE_SUSTAIN_MS만큼 끊기지 않고 이어지면 마이크 입력이 정상인 것으로 판단한다. */
const VOICE_THRESHOLD = 0.08;
/** 사람 목소리 에너지가 몰려있는 대역(Hz). 스펙트럼 평탄도 계산에 이 대역만 사용한다. */
const SPEECH_BAND_HZ: [number, number] = [300, 3400];
/** 스펙트럼 평탄도(기하평균/산술평균) 임계값. 0에 가까울수록 목소리처럼 특정 대역에 에너지가 몰려있고, 1에 가까울수록 백색소음처럼 평평하다. */
const SPECTRAL_FLATNESS_THRESHOLD = 0.5;
const VOICE_SUSTAIN_MS = 200;
/** 녹음을 시작하고 이 시간이 지나도 통과하지 못하면 안내 문구를 보여준다. */
const HINT_DELAY_MS = 3000;
const HINT_VOLUME_TOO_LOW = "목소리를 조금 더 크게 내주세요.";
const HINT_NOISE_DETECTED = "주변 소음이 감지돼요. 조용한 곳에서 다시 시도해주세요.";
const HINT_TOO_SHORT = "조금 더 길게 이야기해주세요.";

/** 지정한 주파수 빈 구간의 스펙트럼 평탄도를 계산한다. */
function spectralFlatness(bins: Uint8Array, loBin: number, hiBin: number): number {
  let logSum = 0;
  let sum = 0;
  let count = 0;
  for (let i = loBin; i <= hiBin; i++) {
    const v = Math.max(bins[i] ?? 0, 1);
    logSum += Math.log(v);
    sum += v;
    count++;
  }
  if (count === 0) return 1;
  const geometricMean = Math.exp(logSum / count);
  const arithmeticMean = sum / count;
  return geometricMean / arithmeticMean;
}

export function MicTestPanel() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [voiceVerified, setVoiceVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const rafRef = useRef<number | null>(null);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const micButtonRef = useRef<HTMLButtonElement | null>(null);
  /** 음량이 임계값을 넘기 시작한 시각. 끊기면 null로 리셋된다. */
  const voiceStreakStartRef = useRef<number | null>(null);
  /** 녹음을 시작한 시각. 안내 문구를 보여줄 시점을 계산하는 데 사용한다. */
  const recordingStartRef = useRef(0);
  /** 녹음 중 한 번이라도 임계 음량을 넘겼는지 여부. 음량 문제와 지속시간/잡음 문제를 구분하는 데 사용한다. */
  const everExceededThresholdRef = useRef(false);
  /** 임계 음량을 넘긴 순간 중 스펙트럼상 실제 목소리로 판단된 적이 있는지 여부. 잡음 문제와 지속시간 문제를 구분하는 데 사용한다. */
  const everVoiceLikeRef = useRef(false);
  /** 마지막으로 화면에 표시한 안내 문구. 매 프레임 동일한 값으로 setState하는 것을 방지한다. */
  const shownHintRef = useRef<string | null>(null);

  const resetVisuals = () => {
    barRefs.current.forEach((el) => {
      if (el) el.style.height = IDLE_BAR_HEIGHT;
    });
    if (micButtonRef.current) micButtonRef.current.style.transform = "";
  };

  const stopRecording = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    analyserRef.current = null;
    dataRef.current = null;
    setIsRecording(false);
    setHint(null);
    shownHintRef.current = null;
    resetVisuals();
  }, []);

  useEffect(() => stopRecording, [stopRecording]);

  const startRecording = useCallback(async () => {
    setError(null);
    setVoiceVerified(false);
    setHint(null);
    voiceStreakStartRef.current = null;
    everExceededThresholdRef.current = false;
    everVoiceLikeRef.current = false;
    shownHintRef.current = null;
    recordingStartRef.current = performance.now();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);

      analyserRef.current = analyser;
      dataRef.current = new Uint8Array(
        new ArrayBuffer(analyser.frequencyBinCount),
      );
      setIsRecording(true);

      const step = Math.max(1, Math.floor(analyser.frequencyBinCount / BAR_COUNT));
      const binHz = audioCtx.sampleRate / analyser.fftSize;
      const speechLoBin = Math.max(1, Math.round(SPEECH_BAND_HZ[0] / binHz));
      const speechHiBin = Math.min(
        analyser.frequencyBinCount - 1,
        Math.round(SPEECH_BAND_HZ[1] / binHz),
      );

      const tick = () => {
        const analyserNode = analyserRef.current;
        const data = dataRef.current;
        if (!analyserNode || !data) return;

        analyserNode.getByteFrequencyData(data);

        let sum = 0;
        for (let i = 0; i < BAR_COUNT; i++) {
          const v = (data[i * step] ?? 0) / 255;
          sum += v;
          const el = barRefs.current[i];
          if (el) el.style.height = `${Math.max(4, v * 40)}px`;
        }

        const avg = sum / BAR_COUNT;

        if (micButtonRef.current) {
          micButtonRef.current.style.transform = `scale(${1 + avg * 0.12})`;
        }

        const flatness = spectralFlatness(data, speechLoBin, speechHiBin);
        const isVoiceLike = avg >= VOICE_THRESHOLD && flatness <= SPECTRAL_FLATNESS_THRESHOLD;

        if (avg >= VOICE_THRESHOLD) {
          everExceededThresholdRef.current = true;
        }

        let verified = false;
        if (isVoiceLike) {
          everVoiceLikeRef.current = true;
          if (voiceStreakStartRef.current === null) {
            voiceStreakStartRef.current = performance.now();
          } else if (performance.now() - voiceStreakStartRef.current >= VOICE_SUSTAIN_MS) {
            verified = true;
            setVoiceVerified(true);
          }
        } else {
          voiceStreakStartRef.current = null;
        }

        if (verified) {
          shownHintRef.current = null;
          setHint(null);
        } else if (
          performance.now() - recordingStartRef.current >=
          HINT_DELAY_MS
        ) {
          const nextHint = !everExceededThresholdRef.current
            ? HINT_VOLUME_TOO_LOW
            : !everVoiceLikeRef.current
              ? HINT_NOISE_DETECTED
              : HINT_TOO_SHORT;
          if (shownHintRef.current !== nextHint) {
            shownHintRef.current = nextHint;
            setHint(nextHint);
          }
        }

        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      setError("마이크 접근 권한이 필요해요. 브라우저 설정을 확인해주세요.");
      toast.error("마이크에 접근할 수 없어요");
    }
  }, []);

  const handleToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleStartExam = () => {
    router.push("/exam/session");
  };

  return (
    <section className="flex w-full flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
      <div className="flex flex-col items-center gap-1 text-center">
        <h2 className="text-base font-bold text-orange-500">마이크 테스트</h2>
        <p
          className={cn(
            "text-sm",
            hint && !voiceVerified ? "text-orange-500" : "text-zinc-500",
          )}
        >
          {voiceVerified
            ? "마이크 테스트를 완료했어요!"
            : hint ?? "목소리가 잘 녹음되는지 확인해보세요."}
        </p>
      </div>

      <div className="flex flex-col items-center gap-5">
        {voiceVerified ? (
          <button type="button" onClick={handleStartExam} className="flex items-center justify-center">
            <Image
              src="/mascots/mike_test_ok.png"
              alt="마이크 테스트 성공"
              width={400}
              height={220}
              className="w-64 sm:w-72"
            />
          </button>
        ) : (
          <button
            ref={micButtonRef}
            type="button"
            onClick={handleToggle}
            aria-pressed={isRecording}
            className={cn(
              "flex size-24 items-center justify-center rounded-full shadow-md transition-transform duration-100",
              isRecording ? "bg-red-500" : "bg-orange-600",
            )}
          >
            <Image
              src="/mic-icon.png"
              alt=""
              width={985}
              height={706}
              className="w-12"
              priority
            />
          </button>
        )}

        <div className="flex h-10 items-center gap-1">
          {Array.from({ length: BAR_COUNT }, (_, i) => (
            <span
              key={i}
              ref={(el) => {
                barRefs.current[i] = el;
              }}
              className={cn(
                "w-1 rounded-full transition-[height] duration-75",
                isRecording ? "bg-orange-400" : "bg-orange-200",
              )}
              style={{ height: IDLE_BAR_HEIGHT }}
            />
          ))}
        </div>

        {error && <p className="text-center text-xs text-red-500">{error}</p>}
      </div>

      <div className="flex flex-col gap-2">
        {voiceVerified ? (
          <Button
            size="lg"
            onClick={handleStartExam}
            className="h-14 w-full flex-col gap-0.5 rounded-full bg-orange-500 text-white hover:bg-orange-600"
          >
            <span className="text-base font-semibold">모의고사 시작하기</span>
            <span className="text-xs font-normal opacity-80">
              Start Test Now
            </span>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="lg"
            onClick={handleToggle}
            className="h-12 w-full border-orange-300 text-base text-orange-600 hover:bg-orange-50"
          >
            <Mic className="size-4" />
            {isRecording ? "녹음 테스트 중지" : "녹음 테스트 시작"}
          </Button>
        )}
        <p className="text-center text-xs text-zinc-400">
          {voiceVerified
            ? "클릭 시 약 20분간의 모의고사가 즉시 시작됩니다."
            : "마이크 테스트가 완료되면 모의고사를 시작할 수 있어요."}
        </p>
      </div>
    </section>
  );
}
