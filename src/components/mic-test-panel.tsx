"use client";

import { Mic, Pause, Play, RotateCcw } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BAR_COUNT = 24;
const IDLE_BAR_HEIGHT = "4px";
/** 평균 음량이 이 값을 넘어야 목소리로 후보군에 들어간다. */
const VOICE_THRESHOLD = 0.08;
/** 사람 목소리 에너지가 몰려있는 대역(Hz). 스펙트럼 평탄도 계산에 이 대역만 사용한다. */
const SPEECH_BAND_HZ: [number, number] = [300, 3400];
/**
 * 스펙트럼 평탄도(기하평균/산술평균) 임계값. 0에 가까울수록 목소리처럼 특정 대역에 에너지가 몰려있고,
 * 1에 가까울수록 백색소음처럼 평평하다. spectralFlatness()를 선형 파워 도메인으로 고친 뒤
 * (로그 압축이 풀려 값의 스케일 자체가 달라짐) 실측에서 발화 중 p50은 이 값보다 확실히 아래,
 * 무음·배경 소음은 1 근처로 갈라지는 것을 확인하고 그 사이로 잡은 값이다.
 * 튜닝 이력과 근거는 docs/mic-test-voice-verification.md 11절 참고.
 */
const SPECTRAL_FLATNESS_THRESHOLD = 0.5;
/**
 * 녹음을 끝내는 시점(사용자가 "다 읽었어요"를 누른 순간)은 사용자 스스로 판단하므로, 통과 여부는
 * 녹음 중 한 번이라도 목소리로 판정된 순간이 있었는지만 본다 — 얼마나 길게 말했는지는 체크하지 않는다.
 */
/** 녹음을 시작하고 이 시간이 지나도 통과하지 못하면 안내 문구를 보여준다. */
const HINT_DELAY_MS = 3000;
const HINT_VOLUME_TOO_LOW = "목소리를 조금 더 크게 내주세요.";
const HINT_NOISE_DETECTED =
  "주변 소음이 감지돼요. 조용한 곳에서 다시 시도해주세요.";
/**
 * 마이크 테스트 중 사용자가 읽을 문장. 토익 스피킹 실제 문제와 비슷한 톤을 유지하되, 숫자·약어·쉼표를
 * 줄여 막힘 없이 술술 읽히도록 쉬운 단어 위주로 구성했다.
 */
const READING_PROMPT =
  "Welcome to our service. We hope you enjoy your studying experience today.";

/**
 * getByteFrequencyData의 바이트 한 단위가 나타내는 파워 지수. 바이트는 dB를
 * [minDecibels(-100), maxDecibels(-30)] → [0, 255]로 매핑한 값이므로
 * 1바이트 = 70/255 dB, 파워로는 10^(70/255/10)배.
 */
const BYTE_TO_POWER_EXP = 70 / 255 / 10;

/**
 * 지정한 주파수 빈 구간의 스펙트럼 평탄도(기하평균/산술평균)를 계산한다.
 *
 * 주의: AnalyserNode의 바이트 빈은 dB(로그) 스케일이라 그대로 평균내면 배음 피크/골의
 * 파워 배율 차이(수백~수천 배)가 2배 남짓으로 압축돼, 실제 목소리도 평탄도가 0.95+로
 * 나온다(실측 p50 0.957). 바이트를 선형 파워(10^(dB/10))로 되돌린 뒤 계산해야
 * 목소리(낮음)와 백색소음(1에 근접)이 실제로 갈라진다. dB의 상수 오프셋(-100dB)은
 * 기하/산술평균 비율에서 소거되므로 무시한다.
 */
function spectralFlatness(
  bins: Uint8Array,
  loBin: number,
  hiBin: number,
): number {
  let logSum = 0;
  let sum = 0;
  let count = 0;
  for (let i = loBin; i <= hiBin; i++) {
    const power = Math.pow(10, (bins[i] ?? 0) * BYTE_TO_POWER_EXP);
    logSum += Math.log(power);
    sum += power;
    count++;
  }
  if (count === 0) return 1;
  const geometricMean = Math.exp(logSum / count);
  const arithmeticMean = sum / count;
  return geometricMean / arithmeticMean;
}

/** 마이크 테스트의 진행 단계. idle=시작 전/재시도 대기, recording=문장을 읽는 중, reviewing=녹음을 마치고 다시 들어보는 중. */
type Phase = "idle" | "recording" | "reviewing";

export function MicTestPanel({ onVerified }: { onVerified: () => void }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  /** 녹음을 마친 뒤 다시 들어볼 수 있도록 만든 blob URL. */
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const rafRef = useRef<number | null>(null);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const micButtonRef = useRef<HTMLButtonElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  /** 녹음을 시작한 시각. 안내 문구를 보여줄 시점을 계산하는 데 사용한다. */
  const recordingStartRef = useRef(0);
  /** 녹음 중 한 번이라도 임계 음량을 넘겼는지 여부. 음량 문제와 잡음 문제를 구분하는 데 사용한다. */
  const everExceededThresholdRef = useRef(false);
  /** 임계 음량을 넘긴 순간 중 스펙트럼상 실제 목소리로 판단된 적이 있는지 여부. 이게 한 번이라도 있었으면 통과 처리한다. */
  const everVoiceLikeRef = useRef(false);
  /** finishRecording이 recorder.onstop을 기다리는 동안 CTA가 다시 눌려 재진입하는 것을 막는다. */
  const isFinishingRef = useRef(false);
  /** 마지막으로 화면에 표시한 안내 문구. 매 프레임 동일한 값으로 setState하는 것을 방지한다. */
  const shownHintRef = useRef<string | null>(null);

  const resetVisuals = () => {
    barRefs.current.forEach((el) => {
      if (el) el.style.height = IDLE_BAR_HEIGHT;
    });
    if (micButtonRef.current) micButtonRef.current.style.transform = "";
  };

  // 컴포넌트가 언마운트될 때(탭 전환 등) 마이크 스트림/레코더가 계속 켜진 채로 남지 않도록
  // 강제로 정리한다. blob은 필요 없으므로 onstop 핸들러를 붙이지 않고 그냥 멈춘다.
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      audioCtxRef.current?.close();
    };
  }, []);

  // recordedUrl이 바뀌거나(재시도) 언마운트될 때 이전 blob URL을 해제한다.
  useEffect(() => {
    return () => {
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, [recordedUrl]);

  const startRecording = useCallback(async () => {
    setError(null);
    setRecordedUrl(null);
    setHint(null);
    everExceededThresholdRef.current = false;
    everVoiceLikeRef.current = false;
    shownHintRef.current = null;
    recordingStartRef.current = performance.now();
    try {
      // 마이크 테스트에서만 AGC·노이즈 억제를 켠다(실제 답변 녹음은 별개 훅이라 영향 없음).
      // AGC를 끈 구성에서는 캡처 신호가 약해 목소리조차 스펙트럼 평탄도가 0.95~0.96대로 나와
      // 잡음과 구분이 어려웠다(docs/mic-test-voice-verification.md 9절).
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // 시각화용 AnalyserNode와 별개로, 실제 오디오도 녹음해둔다 — 사용자가 다 읽고
      // 녹음을 마치면 자기 목소리를 다시 들어볼 수 있게 하기 위함.
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();

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
      setPhase("recording");

      const step = Math.max(
        1,
        Math.floor(analyser.frequencyBinCount / BAR_COUNT),
      );
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

        const now = performance.now();

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
        const isVoiceLike =
          avg >= VOICE_THRESHOLD && flatness <= SPECTRAL_FLATNESS_THRESHOLD;

        if (avg >= VOICE_THRESHOLD) {
          everExceededThresholdRef.current = true;
        }

        if (isVoiceLike) {
          everVoiceLikeRef.current = true;
        }

        if (everVoiceLikeRef.current) {
          shownHintRef.current = null;
          setHint(null);
        } else if (now - recordingStartRef.current >= HINT_DELAY_MS) {
          const nextHint = !everExceededThresholdRef.current
            ? HINT_VOLUME_TOO_LOW
            : HINT_NOISE_DETECTED;
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

  /**
   * 사용자가 "다 읽었어요"를 눌러 녹음을 마쳤을 때 호출된다. 목소리로 판정된 순간이 한 번이라도
   * 있었으면 통과 처리하고(얼마나 길게 말했는지는 보지 않음 — 그건 재생 화면에서 본인이 직접
   * 들어보고 판단할 몫이다), 방금 녹음한 오디오를 재생해볼 수 있는 단계로 넘어간다(reviewing).
   * 실패했다면 이유에 맞는 안내 문구를 보여주고 처음으로 되돌린다.
   */
  const finishRecording = useCallback(() => {
    // recorder.stop()은 state를 동기적으로 "inactive"로 바꾸지만, 실제 onstop(blob 생성)은
    // 비동기로 뒤늦게 발생한다. 그 사이 CTA가 다시 눌려 finishRecording이 재진입하면 두 번째
    // 호출은 이미 "inactive"라 finalize(null)로 즉시 idle로 되돌리고, 뒤이어 첫 번째 호출의
    // onstop이 뒤늦게 finalize(blob)을 실행해 reviewing으로 다시 튀는 상태 꼬임이 생길 수
    // 있다. isFinishingRef로 이미 종료 처리 중이면 재진입 자체를 막는다.
    if (isFinishingRef.current) return;
    isFinishingRef.current = true;

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    const passed = everVoiceLikeRef.current;
    const recorder = mediaRecorderRef.current;

    const releaseHardware = () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
      analyserRef.current = null;
      dataRef.current = null;
      resetVisuals();
    };

    const finalize = (blob: Blob | null) => {
      releaseHardware();
      if (passed && blob && blob.size > 0) {
        setRecordedUrl(URL.createObjectURL(blob));
        setHint(null);
        shownHintRef.current = null;
        setPhase("reviewing");
      } else {
        const nextHint = !everExceededThresholdRef.current
          ? HINT_VOLUME_TOO_LOW
          : HINT_NOISE_DETECTED;
        setHint(nextHint);
        setPhase("idle");
      }
      isFinishingRef.current = false;
    };

    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        chunksRef.current = [];
        mediaRecorderRef.current = null;
        finalize(blob);
      };
      recorder.stop();
    } else {
      mediaRecorderRef.current = null;
      finalize(null);
    }
  }, []);

  const handlePrimaryAction = () => {
    if (phase === "recording") {
      finishRecording();
    } else {
      startRecording();
    }
  };

  const handleRetry = () => {
    setRecordedUrl(null);
    setIsPlaying(false);
    setPhase("idle");
  };

  const handleTogglePlayback = () => {
    const audioEl = audioElRef.current;
    if (!audioEl) return;
    if (isPlaying) {
      audioEl.pause();
      setIsPlaying(false);
    } else {
      audioEl.currentTime = 0;
      void audioEl.play();
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    onVerified();
  };

  return (
    <section className="flex w-full flex-col gap-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
      <div className="flex flex-col items-center gap-1 text-center">
        <h2 className="text-base font-bold text-orange-500">마이크 테스트</h2>
        <p
          className={cn(
            "text-sm",
            hint && phase !== "reviewing" ? "text-orange-500" : "text-zinc-500",
          )}
        >
          {phase === "reviewing"
            ? "녹음을 마쳤어요! 내 목소리를 다시 들어보세요."
            : (hint ?? "문장을 다 읽으면 버튼을 눌러 녹음을 마쳐주세요.")}
        </p>
      </div>

      {phase !== "reviewing" && (
        <div className="rounded-xl bg-zinc-50 p-4 text-center">
          <p className="mb-1 text-xs font-medium text-zinc-400">
            아래 문장을 소리 내어 읽어보세요
          </p>
          <p className="text-sm leading-relaxed text-zinc-700">
            {READING_PROMPT}
          </p>
        </div>
      )}

      <div className="flex flex-col items-center gap-5">
        {phase === "reviewing" ? (
          <div className="flex flex-col items-center gap-3">
            <Image
              src="/mascots/mike_test_ok.png"
              alt="마이크 테스트 성공"
              width={320}
              height={176}
              className="w-52 sm:w-60"
            />
            <button
              type="button"
              onClick={handleTogglePlayback}
              aria-pressed={isPlaying}
              aria-label={isPlaying ? "재생 일시정지" : "내 목소리 재생"}
              className={cn(
                "flex size-16 items-center justify-center rounded-full shadow-md transition-transform duration-100",
                isPlaying ? "bg-red-500" : "bg-orange-600",
              )}
            >
              {isPlaying ? (
                <Pause className="size-6 text-white" />
              ) : (
                <Play className="size-6 translate-x-0.5 text-white" />
              )}
            </button>
            <p className="text-xs text-zinc-400">
              {isPlaying ? "재생 중이에요" : "눌러서 내 목소리를 들어보세요"}
            </p>
            <audio
              ref={audioElRef}
              src={recordedUrl ?? undefined}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>
        ) : (
          <button
            ref={micButtonRef}
            type="button"
            onClick={handlePrimaryAction}
            aria-pressed={phase === "recording"}
            className={cn(
              "flex size-24 items-center justify-center rounded-full shadow-md transition-transform duration-100",
              phase === "recording" ? "bg-red-500" : "bg-orange-600",
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

        {phase !== "reviewing" && (
          <div className="flex h-10 items-center gap-1">
            {Array.from({ length: BAR_COUNT }, (_, i) => (
              <span
                key={i}
                ref={(el) => {
                  barRefs.current[i] = el;
                }}
                className={cn(
                  "w-1 rounded-full transition-[height] duration-75",
                  phase === "recording" ? "bg-orange-400" : "bg-orange-200",
                )}
                style={{ height: IDLE_BAR_HEIGHT }}
              />
            ))}
          </div>
        )}

        {error && <p className="text-center text-xs text-red-500">{error}</p>}
      </div>

      <div className="flex flex-col gap-2">
        {phase === "reviewing" ? (
          <>
            <Button
              size="lg"
              onClick={handleNext}
              className="h-14 w-full flex-col gap-0.5 rounded-xl bg-orange-500 text-white hover:bg-orange-600"
            >
              <span className="text-base font-semibold">다음: 사운드 체크</span>
              <span className="text-xs font-normal opacity-80">
                Next: Sound Check
              </span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetry}
              className="h-9 w-full text-zinc-500 hover:bg-zinc-50 hover:text-orange-600"
            >
              <RotateCcw className="size-3.5" />
              다시 녹음하기
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrimaryAction}
            className="h-12 w-full border-orange-300 text-base text-orange-600 hover:bg-orange-50"
          >
            <Mic className="size-4" />
            {phase === "recording" ? "다 읽었어요" : "녹음 테스트 시작"}
          </Button>
        )}
        {phase !== "reviewing" && (
          <p className="text-center text-xs text-zinc-400">
            문장을 다 읽으면 버튼을 눌러 녹음을 마쳐주세요.
          </p>
        )}
      </div>
    </section>
  );
}
