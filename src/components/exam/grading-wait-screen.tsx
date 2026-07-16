"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ErrorFallbackScreen } from "@/components/error-fallback-screen";
import { useGradingProgress } from "@/features/exam/use-grading-progress";
import { useTrialQuestionProgress } from "@/features/exam/use-trial-question-progress";
import { trackEvent } from "@/lib/analytics";

const STATUS_MESSAGES = [
  "답변을 서버에 안전하게 업로드하고 있어요",
  "발음과 유창성을 분석하고 있어요",
  "문법과 어휘 사용을 확인하고 있어요",
  "채점 결과를 정리하고 있어요",
];

const SPEAKING_TIPS = [
  "파트 1은 연기자 빙의하기! 억양과 끊어읽기만 잘해도 절반은 먹고 들어가요. 🎬",
  "준비 시간엔 침묵 금지! 혼잣말로라도 중얼거리며 입을 계속 풀어두세요. 🗣️",
  "Part 3에서 할 말 없을 땐? 'Because it's convenient and saves time!' 만능 치트키 쓰기.",
  "어설픈 고급 어휘보다 중학생 수준의 쉬운 단어로 절지 않고 말하는 게 고득점 비결! 💡",
  "음, 어... (Um, Uh...) 대신 'Well...', 'Let me see...' 같은 자연스러운 필러(Filler)를 쓰세요.",
  "Part 2 사진 묘사할 때 핵심은 '주변 소품'보다 '인물의 동작과 인상' 위주로! 📸",
  "시간이 남았다고 당황하지 마세요. 할 말 다 했다면 3~4초 남기고 당당하게 끝내도 감점 없음!",
  "Part 4 도표 문제는 의문사(When, Where, How much)를 놓치면 끝장! 질문을 꼭 끝까지 들으세요. 📊",
  "Part 5(의견 말하기)에서는 내 진짜 생각 말고, '영어로 말하기 가장 쉬운 입장'을 선택하는 게 국룰!",
  "시험장 빌런(목소리 너무 큰 사람)에게 기죽지 마세요. 내 페이스대로 마이크에 대고 당당하게! 💪",
  "완벽한 문법보다 중요한 건 '자신감 있는 목소리'와 '끊김 없는 억양'입니다."
];

const MASCOTS = [
  { src: "/mascots/waiting_rabbit.png", alt: "말풍선을 든 토끼 캐릭터" },
  { src: "/mascots/waiting_cat.png", alt: "시계를 든 고양이 캐릭터" },
  { src: "/mascots/waiting_turtle.png", alt: "달력을 든 거북이 캐릭터" },
  { src: "/mascots/waiting_bird.png", alt: "TOEIC Speaking 팻말을 든 앵무새 캐릭터" },
];

/**
 * 말풍선 꼬리가 가리킬 위치. sm 이상에서는 4열로 나열된 마스코트 각각의 중심을,
 * 그 아래(2열 2행으로 줄바꿈되는 구간)에서는 상단 2명만 번갈아 말하는 것처럼
 * 좌/우 2개 지점만 사용한다.
 */
const TAIL_POSITION_CLASSES = [
  "left-[25%] sm:left-[12.5%]",
  "left-[75%] sm:left-[37.5%]",
  "left-[25%] sm:left-[62.5%]",
  "left-[75%] sm:left-[87.5%]",
];

export function GradingWaitScreen({
  examId,
  estimatedWaitLabel = "약 45초",
}: {
  examId: string;
  estimatedWaitLabel?: string;
}) {
  const router = useRouter();

  const handleComplete = useCallback(() => {
    router.replace(`/exam/result?examId=${encodeURIComponent(examId)}`);
  }, [router, examId]);

  const { progress, failed } = useGradingProgress(examId, handleComplete);

  return (
    <GradingWaitVisual
      progress={progress}
      failed={failed}
      gradingType="full"
      estimatedWaitLabel={estimatedWaitLabel}
    />
  );
}

/**
 * 맛보기(문항 1개) 전용. 종합 채점 상태 대신 문항별 채점 상태를 폴링하고,
 * 완료되면 종합 결과 화면이 아니라 그 문항의 피드백 화면으로 곧장 이동한다 —
 * 문항이 하나뿐이라 종합 피드백을 줄 수 없기 때문이다.
 */
export function TrialGradingWaitScreen({
  examId,
  questionNumber,
  estimatedWaitLabel = "약 15초",
}: {
  examId: string;
  questionNumber: number;
  estimatedWaitLabel?: string;
}) {
  const router = useRouter();

  const handleComplete = useCallback(() => {
    // mode=trial 플래그로 이 문항별 피드백 화면이 맛보기 플로우에서 왔다는 걸 표시한다 —
    // 같은 화면을 전체 모의고사 사용자도 요약 결과에서 문항을 눌러 들어올 수 있어서
    // (exam-result-screen.tsx), 이 플래그 없이는 둘을 구분할 방법이 없다.
    router.replace(
      `/exam/result/question?examId=${encodeURIComponent(examId)}&questionNumber=${questionNumber}&retryCount=0&mode=trial`,
    );
  }, [router, examId, questionNumber]);

  const { progress, failed } = useTrialQuestionProgress(examId, questionNumber, handleComplete);

  return (
    <GradingWaitVisual
      progress={progress}
      failed={failed}
      gradingType="trial_question"
      estimatedWaitLabel={estimatedWaitLabel}
    />
  );
}

function GradingWaitVisual({
  progress,
  failed,
  gradingType,
  estimatedWaitLabel,
}: {
  progress: number;
  failed: boolean;
  gradingType: "full" | "trial_question";
  estimatedWaitLabel: string;
}) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (failed) trackEvent("grading_fail", { grading_type: gradingType });
  }, [failed, gradingType]);

  useEffect(() => {
    const id = setInterval(() => {
      setMessageIndex((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setTipIndex((i) => (i + 1) % SPEAKING_TIPS.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const clampedProgress = Math.min(100, Math.max(0, progress));
  const speakerIndex = tipIndex % MASCOTS.length;

  if (failed) {
    return (
      <ErrorFallbackScreen
        title="채점 중 문제가 생겼어요"
        description="서버에서 응답을 받지 못했어요. 잠시 후 다시 시도해 주세요."
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[#ffe0b2] px-6 py-10 text-center">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white p-6 shadow-md sm:p-8 lg:max-w-5xl lg:p-10">
        <span className="w-fit rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 sm:text-sm lg:text-base">
          토익 스피킹 꿀팁
        </span>
        <p
          key={tipIndex}
          className="animate-in fade-in mt-3 text-base leading-relaxed font-medium text-blue-950 duration-500 sm:text-lg lg:text-xl"
        >
          {SPEAKING_TIPS[tipIndex]}
        </p>
        <div
          aria-hidden
          className={`absolute bottom-0 size-5 bg-white transition-[left] duration-500 ${TAIL_POSITION_CLASSES[speakerIndex]}`}
          style={{ transform: "translate(-50%, 50%) rotate(45deg)" }}
        />
      </div>

      <div className="mt-10 grid w-full max-w-4xl grid-cols-2 items-end justify-items-center gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-8 md:gap-x-14 lg:max-w-5xl lg:gap-x-20">
        {MASCOTS.map((mascot, i) => (
          <div
            key={mascot.src}
            className="relative aspect-square w-full max-w-[160px] animate-bounce sm:max-w-[220px] md:max-w-[288px] lg:max-w-[320px]"
            style={{ animationDuration: "2.4s", animationDelay: `${i * 0.2}s` }}
          >
            <Image
              src={mascot.src}
              alt={mascot.alt}
              fill
              sizes="(min-width: 1024px) 200px, (min-width: 768px) 190px, (min-width: 640px) 160px, 45vw"
              className="object-contain"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      <div className="mt-10 w-full max-w-md lg:max-w-lg">
        <div className="relative h-2 w-full rounded-full bg-orange-100 lg:h-2.5">
          <div
            className="h-full rounded-full bg-orange-500 transition-[width] duration-500"
            style={{ width: `${clampedProgress}%` }}
          />
          <div
            className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-orange-500 bg-white shadow transition-[left] duration-500 lg:size-5"
            style={{ left: `${clampedProgress}%` }}
          />
        </div>
      </div>

      <p className="mt-4 text-sm text-zinc-500 lg:text-base">
        예상 대기 시간:{" "}
        <span className="font-semibold text-orange-600">{estimatedWaitLabel}</span>
      </p>

      <p className="mt-6 text-xs text-zinc-400 lg:text-sm" aria-live="polite">
        {STATUS_MESSAGES[messageIndex]}
      </p>
    </div>
  );
}
