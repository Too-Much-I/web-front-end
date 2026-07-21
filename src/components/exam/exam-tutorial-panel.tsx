"use client";

import Image from "next/image";
import { type ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * 준비 흐름 맨 앞(동의/마이크/사운드 체크보다 먼저)에서, 실제 시험 화면을 축소한 목업으로
 * 진행 방식을 단계별로 설명하는 튜토리얼 패널. 경험자는 인트로에서 바로 건너뛸 수 있다.
 *
 * 목업의 타이머/인디케이터/버튼은 exam-session-screen.tsx의 실제 UI를 축소 재현한
 * 것이므로, 시험 화면 쪽 디자인이 바뀌면 여기도 함께 맞춰야 한다.
 */

// 설명 중인 요소에 씌우는 하이라이트 링
const HL = "ring-2 ring-orange-500 ring-offset-2";

const BAR_HEIGHTS = [6, 12, 18, 9, 15, 7, 17, 11, 14, 8, 16, 10, 13, 7, 15, 9];

function MockFrame({
  qnum,
  badge,
  highlightQnum = false,
  highlightStop = false,
  // 맛보기 모드 시험 화면에는 중단하기 버튼이 없다 (ExamHeader onStopClick 미전달)
  showStop = true,
  children,
}: {
  qnum: string;
  badge: string;
  highlightQnum?: boolean;
  highlightStop?: boolean;
  showStop?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      aria-hidden
      className="flex w-full max-w-60 shrink-0 flex-col items-center gap-2.5 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm"
    >
      <div className="flex w-full items-center justify-between">
        <span className="flex items-center gap-1 text-[10px] font-extrabold text-orange-500">
          <span className="size-3 rounded-[4px] bg-orange-500" />
          토선생
        </span>
        <span
          className={cn(
            "rounded-sm text-[10px] font-bold text-blue-950",
            highlightQnum && HL,
          )}
        >
          {qnum}
        </span>
        {showStop ? (
          <span
            className={cn(
              "rounded-full border border-red-200 px-2 py-0.5 text-[9px] font-semibold text-red-500",
              highlightStop && HL,
            )}
          >
            중단하기
          </span>
        ) : (
          <span aria-hidden className="w-10" />
        )}
      </div>
      <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[9px] font-bold text-orange-600">
        {badge}
      </span>
      {children}
    </div>
  );
}

function MockTimer({
  label,
  value,
  red = false,
}: {
  label: string;
  value: string;
  red?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="w-36 rounded-t-md bg-blue-950 py-1 text-center text-[8px] font-extrabold tracking-widest text-white">
        {label}
      </span>
      <span
        className={cn(
          "w-36 rounded-b-md border-2 border-t-0 bg-white py-1 text-center font-mono text-base font-bold tabular-nums",
          red ? "border-red-400 text-red-500" : "border-blue-950 text-blue-950",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function MockIndicator({
  color,
  text,
  highlight = false,
}: {
  color: "blue" | "red";
  text: string;
  highlight?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
        color === "blue" ? "text-blue-950" : "text-red-500",
        highlight && HL,
      )}
    >
      <span className="relative flex size-1.5">
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
            color === "blue" ? "bg-blue-400" : "bg-red-400",
          )}
        />
        <span
          className={cn(
            "relative inline-flex size-1.5 rounded-full",
            color === "blue" ? "bg-blue-600" : "bg-red-500",
          )}
        />
      </span>
      {text}
    </span>
  );
}

function MockPillButton({
  children,
  highlight = false,
}: {
  children: ReactNode;
  highlight?: boolean;
}) {
  return (
    <span
      className={cn(
        "rounded-full border border-orange-300 bg-white px-2.5 py-1 text-[9px] font-bold text-orange-600",
        highlight && HL,
      )}
    >
      {children}
    </span>
  );
}

function MockText({ children }: { children: ReactNode }) {
  return (
    <p className="w-full rounded-lg bg-orange-50/70 p-2 text-left text-[8px] leading-relaxed text-blue-950">
      {children}
    </p>
  );
}

type TutorialStep = {
  title: string;
  description: string;
  tip?: string;
  mock: ReactNode;
};

const FULL_TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "11문항이 차례대로 진행돼요",
    description:
      "전체 시험은 5개 파트, 약 20분이에요. 지금 몇 번째 문제인지는 화면 위에서 늘 확인할 수 있어요.",
    tip: "다음 문제로 자동으로 넘어가고, 뒤로 갈 수 없어요.",
    mock: (
      <MockFrame
        qnum="Question 3 of 11"
        badge="Part 2 · Describe a Picture"
        highlightQnum
      >
        <MockText>
          In the picture, I can see a busy outdoor market with several vendors
          selling fresh fruits and vegetables…
        </MockText>
        <MockTimer label="PREPARATION TIME" value="00:45" />
      </MockFrame>
    ),
  },
  {
    title: "먼저 질문을 들려드려요",
    description:
      "파란 불이 켜져 있는 동안은 듣기만 하면 돼요. 질문은 한 번만 나오니 집중해서 들어주세요.",
    mock: (
      <MockFrame qnum="Question 5 of 11" badge="Part 3 · Respond to Questions">
        <MockText>
          Imagine that a marketing firm is doing research in your area. You have
          agreed to answer some questions about shopping.
        </MockText>
        <MockIndicator color="blue" text="질문을 듣고 있어요" highlight />
      </MockFrame>
    ),
  },
  {
    title: "타이머가 보이면 답변을 준비해요",
    description: "PREPARATION TIME이 끝나면 답변이 자동으로 시작돼요.",
    tip: "준비가 일찍 끝났다면 버튼으로 바로 시작할 수 있어요.",
    mock: (
      <MockFrame qnum="Question 5 of 11" badge="Part 3 · Respond to Questions">
        <MockTimer label="PREPARATION TIME" value="00:23" />
        <span className="text-[9px] text-zinc-500">
          곧 답변 시간이 시작돼요.
        </span>
        <MockPillButton highlight>준비 완료, 바로 답변 시작하기</MockPillButton>
      </MockFrame>
    ),
  },
  {
    title: "빨간 타이머가 켜지면 녹음 중이에요",
    description: "마이크에 대고 답변하세요. 시간이 끝나면 자동으로 제출돼요.",
    tip: "답변을 일찍 마쳤다면 '답변 완료' 버튼으로 바로 제출할 수 있어요.",
    mock: (
      <MockFrame qnum="Question 5 of 11" badge="Part 3 · Respond to Questions">
        <MockTimer label="RESPONSE TIME" value="00:12" red />
        <MockIndicator color="red" text="답변을 녹음하고 있어요" />
        <div className="flex h-5 items-center gap-[3px]">
          {BAR_HEIGHTS.map((height, i) => (
            <span
              key={i}
              className="w-[3px] rounded-full bg-red-300"
              style={{ height: `${height}px` }}
            />
          ))}
        </div>
        <MockPillButton highlight>답변 완료, 제출하고 넘어가기</MockPillButton>
      </MockFrame>
    ),
  },
  {
    title: "끝까지 못 봐도 괜찮아요",
    description:
      "중간에 그만둬야 한다면 '중단하기'를 누르세요. 그때까지 푼 문제는 그대로 채점해 드려요.",
    mock: (
      <MockFrame
        qnum="Question 7 of 11"
        badge="Part 4 · Respond Using Information"
        highlightStop
      >
        <MockTimer label="PREPARATION TIME" value="00:03" />
        <p className="max-w-48 text-center text-[8px] leading-relaxed text-zinc-400">
          다음 문제로 자동으로 전환되며 뒤로 갈 수 없어요. 중단하기를 누르면
          지금까지 응시한 문제까지 채점 결과를 받을 수 있어요.
        </p>
      </MockFrame>
    ),
  },
];

// 맛보기(Part 1 낭독 1문항)용 — 질문 듣기·중단하기 단계가 없어 3단계로 줄이고,
// 지문을 소리 내어 읽는 Part 1 기준으로 설명한다.
const TRIAL_TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Part 1 문제를 하나만 풀어봐요",
    description:
      "맛보기는 약 1분이에요. 실제 시험(5개 파트, 11문항)의 첫 문제 유형을 그대로 체험해요.",
    tip: "끝나면 바로 채점 결과와 피드백을 확인할 수 있어요.",
    mock: (
      <MockFrame
        qnum="Question 1 of 1"
        badge="Part 1 · Read a Text Aloud"
        highlightQnum
        showStop={false}
      >
        <MockText>
          Welcome aboard Flight 207 to Chicago. In a few minutes, our crew will
          begin the in-flight service with drinks, snacks, and magazines…
        </MockText>
        <MockTimer label="PREPARATION TIME" value="00:45" />
      </MockFrame>
    ),
  },
  {
    title: "타이머가 보이면 읽을 준비를 해요",
    description: "PREPARATION TIME 동안 화면의 지문을 눈으로 미리 읽어봐요.",
    tip: "준비가 일찍 끝났다면 버튼으로 바로 시작할 수 있어요.",
    mock: (
      <MockFrame
        qnum="Question 1 of 1"
        badge="Part 1 · Read a Text Aloud"
        showStop={false}
      >
        <MockTimer label="PREPARATION TIME" value="00:23" />
        <span className="text-[9px] text-zinc-500">
          곧 답변 시간이 시작돼요.
        </span>
        <MockPillButton highlight>준비 완료, 바로 답변 시작하기</MockPillButton>
      </MockFrame>
    ),
  },
  {
    title: "빨간 타이머가 켜지면 녹음 중이에요",
    description:
      "지문을 소리 내어 읽어주세요. 시간이 끝나면 자동으로 제출돼요.",
    tip: "낭독을 일찍 마쳤다면 '답변 완료' 버튼으로 바로 제출할 수 있어요.",
    mock: (
      <MockFrame
        qnum="Question 1 of 1"
        badge="Part 1 · Read a Text Aloud"
        showStop={false}
      >
        <MockTimer label="RESPONSE TIME" value="00:12" red />
        <MockIndicator color="red" text="답변을 녹음하고 있어요" />
        <div className="flex h-5 items-center gap-[3px]">
          {BAR_HEIGHTS.map((height, i) => (
            <span
              key={i}
              className="w-[3px] rounded-full bg-red-300"
              style={{ height: `${height}px` }}
            />
          ))}
        </div>
        <MockPillButton highlight>답변 완료, 제출하고 넘어가기</MockPillButton>
      </MockFrame>
    ),
  },
];

type Stage = "intro" | "done" | number; // number = 튜토리얼 단계 인덱스

export function ExamTutorialPanel({
  examMode,
  isReview = false,
  finishLabel,
  onFinish,
}: {
  examMode: "trial" | "full";
  /** 준비 화면의 "미리 보기"로 열린 경우 — 퍼널 이벤트를 남기지 않는다. */
  isReview?: boolean;
  finishLabel: string;
  /** 완료 화면의 마침 버튼 또는 건너뛰기를 눌렀을 때 호출. */
  onFinish: () => void;
}) {
  const [stage, setStage] = useState<Stage>("intro");
  const steps =
    examMode === "trial" ? TRIAL_TUTORIAL_STEPS : FULL_TUTORIAL_STEPS;

  const handleStart = () => {
    if (!isReview) trackEvent("tutorial_start", { exam_mode: examMode });
    setStage(0);
  };

  // step: 0 = 인트로에서 건너뜀(경험자), 1~ = 해당 단계까지 보다가 건너뜀
  const handleSkip = (step: number) => {
    if (!isReview) trackEvent("tutorial_skip", { exam_mode: examMode, step });
    onFinish();
  };

  const handleNext = () => {
    if (typeof stage !== "number") return;
    if (stage + 1 < steps.length) {
      setStage(stage + 1);
      return;
    }
    if (!isReview) trackEvent("tutorial_complete", { exam_mode: examMode });
    setStage("done");
  };

  return (
    <section className="flex w-full flex-col gap-5 rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
      {stage === "intro" && (
        <div className="flex flex-col items-center gap-5 py-2 text-center">
          <Image
            src="/mascots/rabbit_teacher.png"
            alt=""
            width={240}
            height={240}
            className="w-28 sm:w-32"
            priority
          />
          <div className="flex flex-col gap-1">
            <p className="text-lg font-bold text-blue-950">
              토익 스피킹이 처음이신가요?
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              30초면 충분해요. 실제 시험 화면으로
              <br className="hidden sm:block" /> 진행 방식을 미리 보여드릴게요.
            </p>
          </div>
          <div className="flex w-full flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              onClick={handleStart}
              className="h-12 w-full rounded-full bg-orange-500 text-base text-white hover:bg-orange-600 sm:w-auto sm:px-8"
            >
              시험 방법 알아보기
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => handleSkip(0)}
              className="h-12 w-full rounded-full text-base text-zinc-500 hover:text-zinc-700 sm:w-auto sm:px-6"
            >
              이미 알아요, 건너뛰기
            </Button>
          </div>
        </div>
      )}

      {typeof stage === "number" && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest text-zinc-400">
              STEP {stage + 1} / {steps.length}
            </span>
            <button
              type="button"
              onClick={() => handleSkip(stage + 1)}
              className="rounded-full px-2.5 py-1 text-sm text-zinc-400 hover:bg-orange-50 hover:text-orange-600"
            >
              건너뛰기
            </button>
          </div>

          <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
            {steps[stage].mock}
            <div className="flex flex-1 flex-col gap-2.5 text-center sm:text-left">
              <h3 className="text-base font-bold text-blue-950 sm:text-lg">
                {steps[stage].title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-500">
                {steps[stage].description}
              </p>
              {steps[stage].tip && (
                <p className="rounded-lg bg-orange-50 p-2.5 text-xs leading-relaxed text-zinc-600">
                  <span className="font-bold text-orange-600">참고</span> ·{" "}
                  {steps[stage].tip}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => setStage(stage - 1)}
              disabled={stage === 0}
              className="rounded-full px-5"
            >
              이전
            </Button>
            <div className="flex gap-1.5" aria-hidden>
              {steps.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  tabIndex={-1}
                  onClick={() => setStage(i)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === stage
                      ? "w-5 bg-orange-500"
                      : "w-2 bg-zinc-200 hover:bg-zinc-300",
                  )}
                />
              ))}
            </div>
            <Button
              onClick={handleNext}
              className="rounded-full bg-orange-500 px-5 text-white hover:bg-orange-600"
            >
              {stage + 1 === steps.length ? "완료" : "다음"}
            </Button>
          </div>
        </>
      )}

      {stage === "done" && (
        <div className="flex flex-col items-center gap-5 py-2 text-center">
          <Image
            src="/mascots/good_rabbit.png"
            alt=""
            width={240}
            height={240}
            className="w-28 sm:w-32"
          />
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-bold text-orange-500">좋아요!</h2>
            <p className="text-lg font-bold text-blue-950">
              이제 시험 볼 준비를 마쳐볼까요?
            </p>
          </div>
          <Button
            size="lg"
            onClick={onFinish}
            className="h-12 w-full rounded-full bg-orange-500 text-base text-white hover:bg-orange-600"
          >
            {finishLabel}
          </Button>
        </div>
      )}
    </section>
  );
}
