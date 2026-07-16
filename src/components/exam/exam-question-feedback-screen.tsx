"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ThumbsUp, TriangleAlert } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

import {
  AnswerAudioPlayer,
  type AnswerAudioPlayerHandle,
} from "@/components/exam/answer-audio-player";
import { ExamMarkedTranscript } from "@/components/exam/exam-marked-transcript";
import { ExamPriorityPanel } from "@/components/exam/exam-priority-panel";
import { ExamPronunciationTranscript } from "@/components/exam/exam-pronunciation-transcript";
import { ExamQuestionPrompt } from "@/components/exam/exam-question-prompt";
import { ExamReanswerPanel } from "@/components/exam/exam-reanswer-panel";
import { ExamRetryWingNav } from "@/components/exam/exam-retry-wing-nav";
import { ScrollSatisfactionPopup } from "@/components/exam/scroll-satisfaction-popup";
import { SketchyDashBorder } from "@/components/exam/sketchy-dash-border";
import { TypedText } from "@/components/exam/typed-text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getExamQuestionFeedback } from "@/features/exam/api/exam-question-feedback";
import {
  getExamPartMeta,
  getExamPartTimingByQuestionNumber,
} from "@/features/exam/part-meta";
import { useReanswerSubmission } from "@/features/exam/use-reanswer-submission";
import { useRevealOnScroll } from "@/features/exam/use-reveal-on-scroll";
import { jua } from "@/lib/fonts";
import type { ExamQuestionDetail, ExamQuestionFeedback } from "@/types/exam";

function clampPercent(ratio: number): number {
  return Math.min(100, Math.max(0, ratio * 100));
}

/** pronunciationFluencyScore는 100점 만점으로 내려온다. */
const PRONUNCIATION_FLUENCY_MAX = 100;

/** contentRelevanceScore의 만점은 파트마다 다르다 (Part 1은 채점 대상이 아니라 null로 내려옴). */
const CONTENT_RELEVANCE_MAX: Record<number, number> = {
  2: 2.5,
  3: 2.5,
  4: 2.5,
  5: 4,
};

/**
 * 재시도 회차의 점수가 첫 답변 대비 얼마나 변했는지, 칠판에 분필로 쓴 듯한 문구/색을 정한다.
 * (색은 emerald-950 칠판 배경 위 기준.) 점수가 소수일 수 있어(예: 내용 적합성 만점 2.5)
 * 정수가 아니면 소수 한 자리로 표기한다.
 */
function getScoreDeltaNote(delta: number): {
  text: string;
  className: string;
} {
  if (delta === 0) {
    return { text: "첫 답변과 같은 점수", className: "text-white/60" };
  }
  const abs = Math.abs(delta);
  const absText = Number.isInteger(abs) ? String(abs) : abs.toFixed(1);
  return delta > 0
    ? { text: `첫 답변보다 +${absText}점`, className: "text-amber-300" }
    : { text: `첫 답변보다 -${absText}점`, className: "text-rose-300" };
}

/** 탭 전환 슬라이드 방향을 정하기 위한 좌→우 순서. */
const TAB_VALUES = ["my-answer", "model-answer", "reanswer"] as const;
type TabValue = (typeof TAB_VALUES)[number];

function ScoreRing({
  percent,
  size,
  strokeWidth,
  trackClassName = "stroke-orange-100",
  progressClassName = "stroke-orange-500",
}: {
  percent: number;
  size: number;
  strokeWidth: number;
  trackClassName?: string;
  progressClassName?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        className={trackClassName}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className={`${progressClassName} transition-[stroke-dashoffset] duration-500`}
      />
    </svg>
  );
}

/**
 * 손글씨로 쓱 그은 듯한 화살표 — 클릭을 유도할 때 시선을 끌기 위한 장식.
 * 몸통은 완만하게만 휘고, 화살촉은 몸통보다 굵고 크게 벌려서 방향이 분명하게 보이도록 했다.
 */
function HintArrow({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 48 32" fill="none" className={className}>
      <path
        d="M44 6 C 30 4, 16 12, 8 20"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M16 15 L8 20 L15 25"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function ScoreCircleStat({
  label,
  ratio,
  size = 104,
  strokeWidth = 10,
  trackClassName,
  progressClassName,
  valueClassName = "absolute text-lg font-bold text-orange-600 lg:text-xl",
  labelClassName = "text-xs font-semibold text-zinc-500 lg:text-sm",
}: {
  label: string;
  ratio: number;
  size?: number;
  strokeWidth?: number;
  trackClassName?: string;
  progressClassName?: string;
  valueClassName?: string;
  labelClassName?: string;
}) {
  const percent = clampPercent(ratio);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative flex items-center justify-center">
        <ScoreRing
          percent={percent}
          size={size}
          strokeWidth={strokeWidth}
          trackClassName={trackClassName}
          progressClassName={progressClassName}
        />
        <span className={valueClassName}>{Math.round(percent)}%</span>
      </div>
      <span className={labelClassName}>{label}</span>
    </div>
  );
}

function DetailBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-100 lg:p-5">
      <p className={`${jua.className} text-sm text-sky-700 lg:text-base`}>
        {title}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-sky-900 lg:text-base">
        {body}
      </p>
    </div>
  );
}

/** "모범·추천답안" 탭 — correctedAnswer가 모범답안, recommendedAnswer가 추천답안. 둘 다 없을 수도, 하나만 있을 수도 있다. */
function ExamModelAnswerTab({ feedback }: { feedback: ExamQuestionFeedback }) {
  const hasModel = Boolean(feedback.correctedAnswer);
  const hasRecommended = Boolean(feedback.recommendedAnswer);
  const [active, setActive] = useState<"model" | "recommended">(
    hasModel ? "model" : "recommended",
  );
  // 모범답안(왼쪽) → 추천답안(오른쪽)으로 이동하면 오른쪽에서, 반대면 왼쪽에서 슬라이드 인.
  const [slideDir, setSlideDir] = useState(1);

  function switchActive(next: "model" | "recommended") {
    setSlideDir(next === "recommended" ? 1 : -1);
    setActive(next);
  }

  if (!hasModel && !hasRecommended) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-3xl bg-white p-6 text-center shadow-md ring-1 ring-zinc-100 lg:p-8">
        <span className="text-sm font-semibold text-zinc-400 lg:text-base">
          아직 모범·추천 답안이 없어요
        </span>
      </div>
    );
  }

  const shown =
    active === "model" ? feedback.correctedAnswer : feedback.recommendedAnswer;

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-md ring-1 ring-zinc-100 lg:p-8">
      {hasModel && hasRecommended && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => switchActive("model")}
            aria-pressed={active === "model"}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              active === "model"
                ? "bg-blue-950 text-white"
                : "bg-zinc-100 text-zinc-500"
            }`}
          >
            모범답안
          </button>
          <button
            type="button"
            onClick={() => switchActive("recommended")}
            aria-pressed={active === "recommended"}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              active === "recommended"
                ? "bg-blue-950 text-white"
                : "bg-zinc-100 text-zinc-500"
            }`}
          >
            추천답안
          </button>
        </div>
      )}
      <p
        key={active}
        style={
          {
            "--exam-model-answer-slide-x": `${slideDir * 12}px`,
          } as React.CSSProperties
        }
        className="animate-[exam-model-answer-slide_220ms_ease-out] rounded-2xl bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-700 ring-1 ring-zinc-100 motion-reduce:animate-none lg:p-5 lg:text-base"
      >
        {shown}
      </p>
    </div>
  );
}

export function ExamQuestionFeedbackScreen({
  examId,
  detail,
  isTrial,
  onNavigateRetry,
  showCompareHint = false,
}: {
  examId: string;
  detail: ExamQuestionDetail;
  isTrial: boolean;
  onNavigateRetry: (
    nextRetryCount: number,
    options?: { fromReanswer?: boolean },
  ) => void;
  /** "다시 답변하기" 채점 완료로 이 회차에 도착했을 때만 true — 날개 버튼 비교 힌트를 켠다. */
  showCompareHint?: boolean;
}) {
  const partMeta = getExamPartMeta(detail.partNumber);
  const scorePercent = clampPercent(
    detail.maxScore > 0 ? detail.score / detail.maxScore : 0,
  );
  const isAboveHalf = scorePercent > 50;
  const mascot = isAboveHalf
    ? { src: "/mascots/good_rabbit.png", alt: "만족스러워하는 토끼 캐릭터" }
    : { src: "/mascots/hmm_rabbit.png", alt: "고민하는 토끼 캐릭터" };
  const { speakTimeSec } = getExamPartTimingByQuestionNumber(
    detail.partNumber,
    detail.questionNumber,
  );
  const [isBetaTooltipOpen, setIsBetaTooltipOpen] = useState(false);
  const [answerPlaybackTime, setAnswerPlaybackTime] = useState(0);
  const [showSubScores, setShowSubScores] = useState(false);

  /**
   * 메인 점수 원 ↔ 서브 점수 원 전환이 조건부 렌더링만으로는 순식간에 스냅되어 보여서,
   * 지원 브라우저에서는 View Transitions API로 전/후 스냅샷을 자동 크로스페이드시킨다.
   * 미지원 브라우저·"모션 줄이기" 설정에서는 그냥 즉시 전환된다.
   */
  function toggleShowSubScores() {
    const flip = () => setShowSubScores((v) => !v);
    const supportsViewTransition =
      typeof document !== "undefined" && "startViewTransition" in document;
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (supportsViewTransition && !prefersReducedMotion) {
      document.startViewTransition(flip);
    } else {
      flip();
    }
  }

  const audioPlayerRef = useRef<AnswerAudioPlayerHandle>(null);
  const mainRingRef = useRef<HTMLDivElement>(null);
  const mainRingRevealed = useRevealOnScroll(mainRingRef);

  const [activeTab, setActiveTab] = useState<TabValue>("my-answer");
  // 이전 탭보다 오른쪽으로 이동하면 오른쪽에서, 왼쪽으로 이동하면 왼쪽에서 슬라이드 인.
  const [slideDir, setSlideDir] = useState(1);
  // "다시 답변하기" 탭에 저장 안 한 녹음이 있는 동안 true — 탭/회차 이동 전에 확인이 필요한지 판단.
  const [hasUnsavedRecording, setHasUnsavedRecording] = useState(false);

  function confirmDiscardUnsavedRecording(): boolean {
    if (activeTab !== "reanswer" || !hasUnsavedRecording) return true;
    return window.confirm(
      "저장하지 않은 녹음이 있어요. 지금 이동하면 녹음이 사라져요. 계속할까요?",
    );
  }

  function handleTabChange(next: TabValue) {
    if (!confirmDiscardUnsavedRecording()) return;
    setSlideDir(
      TAB_VALUES.indexOf(next) > TAB_VALUES.indexOf(activeTab) ? 1 : -1,
    );
    setActiveTab(next);
  }

  function handleNavigateRetry(
    nextRetryCount: number,
    options?: { fromReanswer?: boolean },
  ) {
    if (!confirmDiscardUnsavedRecording()) return;
    onNavigateRetry(nextRetryCount, options);
  }

  // 재시도 회차를 보고 있을 때 첫 답변 대비 점수 변화 배지를 달기 위해 첫 답변(retryCount=0)
  // 점수를 가져온다. 회차 점수는 불변이므로 캐시를 무기한 신선하게 둬서 회차를 오가도 재요청하지 않는다.
  const { data: firstAttempt } = useQuery({
    queryKey: ["exam-question-feedback", examId, detail.questionNumber, 0],
    queryFn: () => getExamQuestionFeedback(examId, detail.questionNumber, 0),
    enabled: detail.retryCount > 0,
    staleTime: Infinity,
  });
  const scoreDeltaNote =
    detail.retryCount > 0 && firstAttempt
      ? getScoreDeltaNote(detail.score - firstAttempt.score)
      : null;

  // 탭 상위(여기)에서 들고 있어야, "다시 답변하기" 탭을 벗어나 ExamReanswerPanel이 언마운트돼도
  // 제출~채점 진행 상태가 사라지지 않는다 (자세한 이유는 useReanswerSubmission 참고).
  const reanswerSubmission = useReanswerSubmission({
    examId,
    questionNumber: detail.questionNumber,
    // fromReanswer 표시를 달아, 새 회차 도착 직후 날개 버튼 비교 힌트가 한 번 뜨게 한다.
    onNavigateRetry: (nextRetryCount) =>
      handleNavigateRetry(nextRetryCount, { fromReanswer: true }),
  });

  return (
    <section className="relative mx-auto w-full max-w-3xl px-6 py-10 lg:max-w-4xl xl:max-w-5xl">
      <ExamRetryWingNav
        retryCount={detail.retryCount}
        totalRetryCount={detail.totalRetryCount}
        onNavigate={handleNavigateRetry}
        showCompareHint={showCompareHint}
      />

      {!isTrial && (
        <Link
          href={`/exam/result?examId=${examId}`}
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-zinc-700 lg:text-base"
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-zinc-100 transition-transform duration-200 group-hover:-translate-x-0.5">
            <ArrowLeft className="size-3.5" aria-hidden />
          </span>
          채점 결과로 돌아가기
        </Link>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-5">
          <Tooltip open={isBetaTooltipOpen} onOpenChange={setIsBetaTooltipOpen}>
            <TooltipTrigger
              className="shrink-0 cursor-help rounded-full"
              onClick={() => setIsBetaTooltipOpen((open) => !open)}
              aria-label="BETA 안내 보기"
            >
              <Image
                src="/mascots/beta.png"
                alt="BETA"
                width={72}
                height={72}
                className="drop-shadow-sm lg:h-20 lg:w-20"
              />
            </TooltipTrigger>
            <TooltipContent
              side="right"
              align="start"
              className="max-w-72 lg:max-w-80"
            >
              현재 POC 단계에서 채점 결과에 부정확한 내용이 있을 수 있어요. 정식
              출시 시 더 정확한 채점을 제공해 드릴게요.
            </TooltipContent>
          </Tooltip>

          <div>
            <p className="text-sm font-semibold tracking-wide text-orange-600 lg:text-base">
              Part {detail.partNumber} · {partMeta.titleKo}
            </p>
            <h1
              className={`${jua.className} mt-1 text-3xl text-blue-950 sm:text-4xl lg:text-5xl`}
            >
              문제 {detail.questionNumber}번 피드백
            </h1>
          </div>
        </div>
        <span className="rounded-full bg-blue-950 px-4 py-1.5 text-sm font-semibold text-white lg:text-base">
          {detail.feedback.level}
        </span>
      </div>

      {/* 모바일에서는 토끼가 칠판 왼쪽 아래 모서리 바깥에 서서 살짝만 겹치고(콘텐츠는 전체 폭 사용),
          sm부터는 칠판 왼쪽에 크게 서 있는 원래 배치로 돌아간다. 아래로 튀어나온 만큼 mb로 다음 섹션과 간격 확보. */}
      <div className="relative mt-8 mb-14 sm:mb-0">
        <div className="absolute -bottom-20 -left-1 z-10 h-32 w-32 -scale-x-100 sm:bottom-0 sm:-left-4 sm:h-48 sm:w-48">
          <Image
            src={mascot.src}
            alt={mascot.alt}
            fill
            sizes="192px"
            className="object-contain drop-shadow-lg"
          />
        </div>

        <div className="relative rounded-3xl border-[10px] border-amber-900 bg-emerald-950 px-5 py-6 pb-14 shadow-xl sm:pr-6 sm:pb-6 sm:pl-36 lg:p-10 lg:pl-40">
          <div className="absolute -top-5 left-4 z-20 -rotate-3 rounded-lg bg-amber-400 px-4 py-2 shadow-md">
            <span
              className={`${jua.className} text-lg text-emerald-950 lg:text-xl`}
            >
              이 문제 점수
            </span>
          </div>
          <div
            ref={mainRingRef}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            {/* 두 상태를 같은 그리드 셀에 겹쳐 두고 보이지 않는 쪽은 visibility로만 숨겨서,
                토글해도 칠판 높이가 더 큰 쪽 기준으로 고정되도록 한다. */}
            <div
              style={{ viewTransitionName: "exam-score-display" }}
              className="relative grid place-items-center"
            >
              <button
                type="button"
                onClick={toggleShowSubScores}
                aria-pressed={showSubScores}
                aria-label="세부 평가 지표로 보기"
                className={`relative col-start-1 row-start-1 flex cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                  showSubScores ? "invisible" : ""
                }`}
              >
                <ScoreRing
                  percent={mainRingRevealed ? scorePercent : 0}
                  size={140}
                  strokeWidth={12}
                  trackClassName="stroke-white/15"
                  progressClassName="stroke-amber-300"
                />
                <div className="absolute flex flex-col items-center">
                  <span
                    className={`${jua.className} text-4xl text-amber-50 lg:text-5xl`}
                  >
                    {detail.score}
                  </span>
                  <span
                    className={`${jua.className} text-sm text-white/60 lg:text-base`}
                  >
                    / {detail.maxScore}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={toggleShowSubScores}
                aria-pressed={showSubScores}
                aria-label="전체 점수로 보기"
                className={`col-start-1 row-start-1 flex cursor-pointer flex-col items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-amber-300 sm:flex-row sm:gap-4 ${
                  showSubScores ? "" : "invisible"
                }`}
              >
                <ScoreCircleStat
                  label="발음 & 유창성"
                  ratio={
                    detail.feedback.pronunciationFluencyScore /
                    PRONUNCIATION_FLUENCY_MAX
                  }
                  size={96}
                  strokeWidth={9}
                  trackClassName="stroke-white/15"
                  progressClassName="stroke-amber-300"
                  valueClassName="absolute text-sm font-bold text-amber-50"
                  labelClassName="w-20 text-center text-[11px] leading-tight font-semibold text-white/60"
                />
                {detail.partNumber !== 1 &&
                  (detail.feedback.contentRelevanceScore === null ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className="relative flex items-center justify-center"
                        style={{ width: 96, height: 96 }}
                      >
                        <ScoreRing
                          percent={0}
                          size={96}
                          strokeWidth={9}
                          trackClassName="stroke-white/15"
                          progressClassName="stroke-amber-300"
                        />
                        <span className="absolute text-sm font-bold text-white/40">
                          —
                        </span>
                      </div>
                      <span className="w-20 text-center text-[11px] leading-tight font-semibold text-white/60">
                        내용 적합성 (미채점)
                      </span>
                    </div>
                  ) : (
                    <ScoreCircleStat
                      label="내용 적합성"
                      ratio={
                        detail.feedback.contentRelevanceScore /
                        CONTENT_RELEVANCE_MAX[detail.partNumber]
                      }
                      size={96}
                      strokeWidth={9}
                      trackClassName="stroke-white/15"
                      progressClassName="stroke-amber-300"
                      valueClassName="absolute text-sm font-bold text-amber-50"
                      labelClassName="w-20 text-center text-[11px] leading-tight font-semibold text-white/60"
                    />
                  ))}
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {/* 첫 답변 대비 점수 변화 — 칠판에 분필로 덧쓴 메모처럼 그래프 옆에 붙는다.
                  세부 지표 토글과 무관하게 항상 보인다. */}
              {scoreDeltaNote && (
                <span
                  className={`${jua.className} text-sm lg:text-base ${scoreDeltaNote.className}`}
                >
                  ★ {scoreDeltaNote.text}
                </span>
              )}
              <div
                className={`flex items-center gap-1.5 ${showSubScores ? "invisible" : ""}`}
              >
                <HintArrow className="h-8 w-10 shrink-0 text-amber-300" />
                <span
                  className={`${jua.className} max-w-32 text-sm leading-tight text-amber-200`}
                >
                  그래프를 클릭하면 세부 평가 지표가 보여요
                </span>
              </div>
            </div>
          </div>

          <TypedText
            text={detail.feedback.summary}
            className={`${jua.className} mt-6 text-center text-base leading-relaxed text-white/90 lg:text-lg`}
          />
        </div>
      </div>

      <ExamQuestionPrompt questionInfo={detail.questionInfo} />

      <Tabs
        value={activeTab}
        onValueChange={(value) => handleTabChange(value as TabValue)}
        className="mt-6"
        style={
          { "--exam-tab-slide-x": `${slideDir * 16}px` } as React.CSSProperties
        }
      >
        <TabsList className="h-auto w-full gap-1 bg-zinc-100 p-1">
          <TabsTrigger value="my-answer" className="h-9 text-sm lg:text-base">
            내 답변
          </TabsTrigger>
          <TabsTrigger
            value="model-answer"
            className="h-9 text-sm lg:text-base"
          >
            모범·추천답안
          </TabsTrigger>
          <TabsTrigger value="reanswer" className="h-9 text-sm lg:text-base">
            다시 답변하기
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="my-answer"
          className="mt-6 flex animate-[exam-tab-slide_220ms_ease-out] flex-col gap-6 motion-reduce:animate-none"
        >
          {(detail.partNumber !== 1 || detail.audioUrl) && (
            <div
              className={`grid grid-cols-1 gap-4 lg:gap-6 ${
                detail.partNumber !== 1 && detail.audioUrl
                  ? "lg:grid-cols-2"
                  : ""
              }`}
            >
              {detail.partNumber !== 1 && (
                <ExamPriorityPanel
                  correctionItems={detail.feedback.correctionItems}
                  nextStrategy={detail.feedback.nextStrategy}
                />
              )}

              {detail.audioUrl && (
                <div className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-zinc-100 lg:p-8">
                  <span
                    className={`${jua.className} text-base text-blue-950 lg:text-lg`}
                  >
                    내 답변 음성
                  </span>
                  <div className="mt-3">
                    <AnswerAudioPlayer
                      ref={audioPlayerRef}
                      audioUrl={detail.audioUrl}
                      durationSec={speakTimeSec}
                      onTimeUpdate={setAnswerPlaybackTime}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {detail.partNumber !== 1 ? (
            <ExamMarkedTranscript
              transcript={detail.transcript}
              correctionItems={detail.feedback.correctionItems}
            />
          ) : detail.spokenWordSequence.length > 0 ? (
            <ExamPronunciationTranscript
              spokenWordSequence={detail.spokenWordSequence}
              currentTimeSec={answerPlaybackTime}
              onWordClick={
                detail.audioUrl
                  ? (sec) => audioPlayerRef.current?.seekTo(sec)
                  : undefined
              }
            />
          ) : (
            <div className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-zinc-100 lg:p-8">
              <span
                className={`${jua.className} text-base text-blue-950 lg:text-lg`}
              >
                답변 스크립트
              </span>
              <div className="mt-3 flex flex-col items-center justify-center gap-2 rounded-2xl bg-zinc-50 p-6 text-center ring-1 ring-zinc-100">
                <div className="relative h-16 w-16 shrink-0">
                  <Image
                    src="/mascots/hmm_rabbit.png"
                    alt="응답이 감지되지 않았음을 안내하는 캐릭터"
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                </div>
                <span className="text-sm font-semibold text-zinc-400 lg:text-base">
                  응답이 감지되지 않았어요
                </span>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="model-answer"
          className="mt-6 animate-[exam-tab-slide_220ms_ease-out] motion-reduce:animate-none"
        >
          <ExamModelAnswerTab feedback={detail.feedback} />
        </TabsContent>

        <TabsContent
          value="reanswer"
          className="mt-6 animate-[exam-tab-slide_220ms_ease-out] motion-reduce:animate-none"
        >
          <ExamReanswerPanel
            status={reanswerSubmission.status}
            errorMessage={reanswerSubmission.errorMessage}
            onSubmit={(blob) =>
              reanswerSubmission.submit(blob, detail.totalRetryCount)
            }
            onReset={reanswerSubmission.reset}
            onUnsavedChange={setHasUnsavedRecording}
          />
        </TabsContent>
      </Tabs>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
        <div className="relative rounded-3xl bg-white p-6 lg:p-8">
          <SketchyDashBorder />
          <span
            className={`${jua.className} inline-flex items-center gap-1.5 text-base text-blue-950 lg:text-lg`}
          >
            <ThumbsUp className="size-4 text-orange-500" aria-hidden />
            강점
          </span>
          <ul className="mt-4 flex flex-col gap-2">
            {detail.feedback.strengths.map((item, i) => (
              <li
                key={i}
                className="rounded-xl bg-zinc-50 p-3 text-sm leading-relaxed text-zinc-700 ring-1 ring-zinc-100 lg:text-base"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative rounded-3xl bg-white p-6 lg:p-8">
          <SketchyDashBorder />
          <span
            className={`${jua.className} inline-flex items-center gap-1.5 text-base text-blue-950 lg:text-lg`}
          >
            <TriangleAlert className="size-4 text-orange-500" aria-hidden />
            보완 필요
          </span>
          <ul className="mt-4 flex flex-col gap-2">
            {detail.feedback.weaknesses.map((item, i) => (
              <li
                key={i}
                className="rounded-xl bg-zinc-50 p-3 text-sm leading-relaxed text-zinc-700 ring-1 ring-zinc-100 lg:text-base"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-md ring-1 ring-zinc-100 lg:p-8">
        <span className={`${jua.className} text-base text-blue-950 lg:text-lg`}>
          세부 피드백
        </span>
        <DetailBlock title="발음" body={detail.feedback.pronunciation} />
        <DetailBlock title="유창성" body={detail.feedback.fluency} />
        {detail.partNumber !== 1 && (
          <>
            <DetailBlock title="내용" body={detail.feedback.content} />
            <DetailBlock
              title="문법 & 어휘"
              body={detail.feedback.grammarVocabulary}
            />
          </>
        )}
      </div>

      <div className="mt-6 rounded-3xl bg-orange-50 p-6 ring-1 ring-orange-100 lg:p-8">
        <span className={`${jua.className} text-base text-blue-950 lg:text-lg`}>
          실천 과제
        </span>
        <ol className="mt-4 flex flex-col gap-3">
          {detail.feedback.actionItems.map((item, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-2xl bg-white p-4 text-sm leading-relaxed text-zinc-700 shadow-sm lg:text-base"
            >
              <span className="shrink-0 font-bold text-orange-600">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
      </div>

      {/* 전체 모의고사 사용자는 요약 결과 화면(/exam/result)에서 이미 이 팝업을 봤으므로,
          여기서는 종합 결과 화면을 거치지 않는 맛보기 플로우에서만 보여준다. */}
      {isTrial && <ScrollSatisfactionPopup examId={examId} mode="trial" />}
    </section>
  );
}
