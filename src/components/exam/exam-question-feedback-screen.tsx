"use client";

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
import { SketchyDashBorder } from "@/components/exam/sketchy-dash-border";
import { TypedText } from "@/components/exam/typed-text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getExamPartMeta,
  getExamPartTimingByQuestionNumber,
} from "@/features/exam/part-meta";
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

function ScoreCircleStat({ label, ratio }: { label: string; ratio: number }) {
  const percent = clampPercent(ratio);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center">
        <ScoreRing percent={percent} size={104} strokeWidth={10} />
        <span className="absolute text-lg font-bold text-orange-600 lg:text-xl">
          {Math.round(percent)}%
        </span>
      </div>
      <span className="text-xs font-semibold text-zinc-500 lg:text-sm">
        {label}
      </span>
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
            onClick={() => setActive("model")}
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
            onClick={() => setActive("recommended")}
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
      <p className="rounded-2xl bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-700 ring-1 ring-zinc-100 lg:p-5 lg:text-base">
        {shown}
      </p>
    </div>
  );
}

export function ExamQuestionFeedbackScreen({
  examId,
  detail,
  onNavigateRetry,
}: {
  examId: string;
  detail: ExamQuestionDetail;
  onNavigateRetry: (nextRetryCount: number) => void;
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
  const audioPlayerRef = useRef<AnswerAudioPlayerHandle>(null);
  const mainRingRef = useRef<HTMLDivElement>(null);
  const mainRingRevealed = useRevealOnScroll(mainRingRef);
  const subRingsRef = useRef<HTMLDivElement>(null);
  const subRingsRevealed = useRevealOnScroll(subRingsRef);

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

  function handleNavigateRetry(nextRetryCount: number) {
    if (!confirmDiscardUnsavedRecording()) return;
    onNavigateRetry(nextRetryCount);
  }

  return (
    <section className="relative mx-auto w-full max-w-3xl px-6 py-10 lg:max-w-4xl xl:max-w-5xl">
      <ExamRetryWingNav
        retryCount={detail.retryCount}
        totalRetryCount={detail.totalRetryCount}
        onNavigate={handleNavigateRetry}
      />

      <Link
        href={`/exam/result?examId=${examId}`}
        className="group inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-zinc-700 lg:text-base"
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-zinc-100 transition-transform duration-200 group-hover:-translate-x-0.5">
          <ArrowLeft className="size-3.5" aria-hidden />
        </span>
        채점 결과로 돌아가기
      </Link>

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
            <TooltipContent side="right" align="start">
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

      <div className="relative mt-8">
        <div className="absolute bottom-0 left-0 z-10 h-40 w-40 -scale-x-100 sm:-left-4 sm:h-48 sm:w-48">
          <Image
            src={mascot.src}
            alt={mascot.alt}
            fill
            sizes="192px"
            className="object-contain drop-shadow-lg"
          />
        </div>

        <div className="relative rounded-3xl border-[10px] border-amber-900 bg-emerald-950 py-6 pr-6 pl-32 shadow-xl sm:pl-36 lg:p-10 lg:pl-40">
          <div className="absolute -top-5 left-4 z-20 -rotate-3 rounded-lg bg-amber-400 px-4 py-2 shadow-md">
            <span
              className={`${jua.className} text-lg text-emerald-950 lg:text-xl`}
            >
              이 문제 점수
            </span>
          </div>
          <div ref={mainRingRef} className="mt-8 flex justify-center">
            <div className="relative flex items-center justify-center">
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

          {detail.partNumber !== 1 ? (
            <ExamMarkedTranscript
              transcript={detail.transcript}
              correctionItems={detail.feedback.correctionItems}
            />
          ) : detail.spokenWordSequence.length > 0 ? (
            <ExamPronunciationTranscript
              spokenWordSequence={detail.spokenWordSequence}
              currentTimeSec={answerPlaybackTime}
              onWordClick={(sec) => audioPlayerRef.current?.seekTo(sec)}
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

          <div
            ref={subRingsRef}
            className="grid grid-cols-2 gap-5 rounded-3xl bg-white p-6 shadow-md ring-1 ring-zinc-100 lg:p-8"
          >
            <ScoreCircleStat
              label="발음 & 유창성"
              ratio={
                subRingsRevealed
                  ? detail.feedback.pronunciationFluencyScore /
                    PRONUNCIATION_FLUENCY_MAX
                  : 0
              }
            />
            {detail.feedback.contentRelevanceScore === null ? (
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <div className="relative h-[104px] w-[104px] shrink-0">
                  <Image
                    src="/mascots/no_score.png"
                    alt="채점하지 않는 항목을 안내하는 캐릭터"
                    fill
                    sizes="104px"
                    className="object-contain"
                  />
                </div>
                <span className="text-xs font-semibold text-zinc-400 lg:text-sm">
                  이 파트는 내용 적합성을
                  <br />
                  채점하지 않아요
                </span>
              </div>
            ) : (
              <ScoreCircleStat
                label="내용 적합성"
                ratio={
                  subRingsRevealed
                    ? detail.feedback.contentRelevanceScore /
                      CONTENT_RELEVANCE_MAX[detail.partNumber]
                    : 0
                }
              />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
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

          <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-md ring-1 ring-zinc-100 lg:p-8">
            <span
              className={`${jua.className} text-base text-blue-950 lg:text-lg`}
            >
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

          <div className="rounded-3xl bg-orange-50 p-6 ring-1 ring-orange-100 lg:p-8">
            <span
              className={`${jua.className} text-base text-blue-950 lg:text-lg`}
            >
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
            examId={examId}
            questionNumber={detail.questionNumber}
            totalRetryCount={detail.totalRetryCount}
            onNavigateRetry={handleNavigateRetry}
            onUnsavedChange={setHasUnsavedRecording}
          />
        </TabsContent>
      </Tabs>
    </section>
  );
}
