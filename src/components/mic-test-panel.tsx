"use client";

import { Mic } from "lucide-react";
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
 * 목소리로 판정된 시간을 누적한 합이 이 값을 넘으면 통과 처리한다. 자음·숨쉬기·문장 사이 pause처럼
 * 자연스러운 발화에 포함된 끊김은 매번 초기화하지 않고 그대로 건너뛴 채 누적만 이어간다
 *  짧은 문장을 읽어도 대부분 이 정도는 금방 채워진다.
 */
const VOICE_SUSTAIN_MS = 400;
/** 녹음을 시작하고 이 시간이 지나도 통과하지 못하면 안내 문구를 보여준다. */
const HINT_DELAY_MS = 3000;
const HINT_VOLUME_TOO_LOW = "목소리를 조금 더 크게 내주세요.";
const HINT_NOISE_DETECTED =
  "주변 소음이 감지돼요. 조용한 곳에서 다시 시도해주세요.";
const HINT_TOO_SHORT = "조금 더 길게 이야기해주세요.";
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

export function MicTestPanel({ onVerified }: { onVerified: () => void }) {
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
  /** 목소리로 판정된(isVoiceLike) 시간의 누적 합(ms). 끊김이 있어도 리셋되지 않고 계속 쌓인다. */
  const voiceAccumulatedMsRef = useRef(0);
  /** 직전 프레임 시각. 프레임 간 실제 경과 시간(delta)을 구해 누적치에 더하는 데 쓴다. */
  const lastTickAtRef = useRef<number | null>(null);
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
    voiceAccumulatedMsRef.current = 0;
    lastTickAtRef.current = null;
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
        const dt =
          lastTickAtRef.current === null ? 0 : now - lastTickAtRef.current;
        lastTickAtRef.current = now;

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

        let verified = false;
        if (isVoiceLike) {
          everVoiceLikeRef.current = true;
          voiceAccumulatedMsRef.current += dt;
          if (voiceAccumulatedMsRef.current >= VOICE_SUSTAIN_MS) {
            verified = true;
            setVoiceVerified(true);
          }
        }

        if (verified) {
          shownHintRef.current = null;
          setHint(null);
        } else if (now - recordingStartRef.current >= HINT_DELAY_MS) {
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
            hint && !voiceVerified ? "text-orange-500" : "text-zinc-500",
          )}
        >
          {voiceVerified
            ? "마이크 테스트를 완료했어요!"
            : (hint ?? "목소리가 잘 녹음되는지 확인해보세요.")}
        </p>
      </div>

      {!voiceVerified && (
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
        {voiceVerified ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center justify-center"
          >
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
            onClick={handleNext}
            className="h-14 w-full flex-col gap-0.5 rounded-xl bg-orange-500 text-white hover:bg-orange-600"
          >
            <span className="text-base font-semibold">다음: 사운드 체크</span>
            <span className="text-xs font-normal opacity-80">
              Next: Sound Check
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
            ? "이어서 소리가 잘 들리는지 확인할게요."
            : "마이크 테스트가 완료되면 사운드 체크로 넘어가요."}
        </p>
      </div>
    </section>
  );
}
