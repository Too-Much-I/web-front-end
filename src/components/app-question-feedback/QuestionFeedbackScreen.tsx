"use client";

import { ChevronLeft, ChevronRight, Mic } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AtAGlanceSection } from "@/components/app-exam-screen/components/AtAGlanceSection";
import { cardShadow, feedbackColors } from "@/components/app-exam-screen/theme";
import { ModelAnswerCard } from "@/components/app-question-feedback/components/ModelAnswerCard";
import { QuestionFeedbackHeader } from "@/components/app-question-feedback/components/QuestionFeedbackHeader";
import { RetryScoreBoard } from "@/components/app-question-feedback/components/RetryScoreBoard";
import {
  deltaTone,
  formatDelta,
  formatScore,
  getRetryScores,
  indexOfRetryCount,
} from "@/components/app-question-feedback/retry-view-model";
import {
  AnswerAudioPlayer,
  type AnswerAudioPlayerHandle,
} from "@/components/exam/answer-audio-player";
import { ExamMarkedTranscript } from "@/components/exam/exam-marked-transcript";
import { ExamPriorityPanel } from "@/components/exam/exam-priority-panel";
import { ExamPronunciationTranscript } from "@/components/exam/exam-pronunciation-transcript";
import { ExamQuestionPrompt } from "@/components/exam/exam-question-prompt";
import { postToNative } from "@/lib/native-bridge";
import type { ExamQuestionDetail } from "@/types/exam";

const DECK_COUNT = 2;
const DECK_LABELS = ["결과 · 내 답변", "모범답안 · 피드백"] as const;
const PART_FEEDBACK_STEP = 3;

type DeckDirection = "next" | "previous";

/** 네이티브 앱에 "이 문제를 다시 답변하겠다"고 알린다 — 녹음 플로우는 앱이 연다. */
type ReanswerRequestedMessage = {
  type: "REANSWER_REQUESTED";
  examId: string;
  questionNumber: number;
  /** 다음에 만들어질 회차 인덱스(0-base). */
  nextRetryCount: number;
};

/** 앱 하단 뒤로가기가 덱 안에서 먼저 동작해야 하는지 알린다. */
type DeckNavigationStateMessage = {
  type: "QUESTION_FEEDBACK_NAVIGATION_STATE";
  canGoBackWithinFeedback: boolean;
};

function isGoBackMessage(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  return (value as { type?: unknown }).type === "FEEDBACK_GO_BACK";
}

/**
 * 앱 웹뷰용 문제별 피드백. 세로로 긴 한 페이지 대신 덱 2장으로 나누고,
 * 회차 이동은 헤더의 칩과 칠판 그래프의 점이 함께 담당한다.
 *
 * 회차를 바꾸면 상위(page)가 해당 retryCount로 다시 조회한다 — 이 컴포넌트는
 * 지금 회차의 detail 하나만 그린다.
 */
export function QuestionFeedbackScreen({
  detail,
  isFetching,
  onSelectRetry,
}: {
  detail: ExamQuestionDetail;
  isFetching: boolean;
  onSelectRetry: (retryCount: number) => void;
}) {
  const router = useRouter();
  const [deck, setDeck] = useState(0);
  const [direction, setDirection] = useState<DeckDirection>("next");
  const [playbackTime, setPlaybackTime] = useState(0);
  const audioPlayerRef = useRef<AnswerAudioPlayerHandle>(null);

  const isFirstDeck = deck === 0;
  const feedbackDeckLabel =
    detail.partNumber === 1 ? "추천답안 · 피드백" : DECK_LABELS[1];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [deck]);

  useEffect(() => {
    const message: DeckNavigationStateMessage = {
      type: "QUESTION_FEEDBACK_NAVIGATION_STATE",
      canGoBackWithinFeedback: deck > 0,
    };
    postToNative(message);
  }, [deck]);

  useEffect(() => {
    const handleNativeMessage = (event: MessageEvent<unknown>) => {
      let message: unknown = event.data;
      if (typeof message === "string") {
        try {
          message = JSON.parse(message);
        } catch {
          return;
        }
      }
      if (!isGoBackMessage(message)) return;
      setDirection("previous");
      setDeck((step) => Math.max(step - 1, 0));
    };

    window.addEventListener("message", handleNativeMessage);
    document.addEventListener("message", handleNativeMessage as EventListener);
    return () => {
      window.removeEventListener("message", handleNativeMessage);
      document.removeEventListener(
        "message",
        handleNativeMessage as EventListener,
      );
    };
  }, []);

  function moveDeck(next: DeckDirection) {
    setDirection(next);
    setDeck((step) =>
      Math.min(
        Math.max(next === "next" ? step + 1 : step - 1, 0),
        DECK_COUNT - 1,
      ),
    );
  }

  function requestReanswer() {
    const message: ReanswerRequestedMessage = {
      type: "REANSWER_REQUESTED",
      examId: detail.examId,
      questionNumber: detail.questionNumber,
      nextRetryCount: detail.totalRetryCount,
    };
    postToNative(message);
  }

  function returnToPartFeedback() {
    const params = new URLSearchParams({
      examId: detail.examId,
      step: String(PART_FEEDBACK_STEP),
    });
    router.replace(`/app-exam-screen?${params.toString()}`);
  }

  return (
    <main
      className="flex min-h-dvh flex-col overflow-x-clip"
      style={{ backgroundColor: feedbackColors.surfaceSubtle }}
    >
      <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-1 flex-col px-5">
        <QuestionFeedbackHeader
          partNumber={detail.partNumber}
          questionNumber={detail.questionNumber}
          currentStep={deck + 1}
          totalSteps={DECK_COUNT}
          totalRetryCount={detail.totalRetryCount}
          activeRetryCount={detail.retryCount}
          onSelectRetry={onSelectRetry}
          onBack={returnToPartFeedback}
        />

        <div
          key={`${detail.retryCount}-${deck}`}
          className={`flex-1 pb-32 motion-reduce:animate-none ${
            direction === "next"
              ? "animate-[app-feedback-step-next_220ms_ease-out]"
              : "animate-[app-feedback-step-previous_220ms_ease-out]"
          } ${isFetching ? "opacity-60" : ""}`}
        >
          {isFirstDeck ? (
            <ScoreAndAnswerDeck
              detail={detail}
              playbackTime={playbackTime}
              onPlaybackTimeChange={setPlaybackTime}
              audioPlayerRef={audioPlayerRef}
              onSelectRetry={onSelectRetry}
            />
          ) : (
            <FeedbackDeck detail={detail} onReanswer={requestReanswer} />
          )}
        </div>

        <nav
          aria-label="피드백 단계 이동"
          className="fixed inset-x-0 bottom-0 z-20 border-t border-orange-100 bg-[#fff9f2]/95 backdrop-blur-sm"
        >
          <div
            className="mx-auto w-full max-w-3xl px-5 pt-4"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            <button
              type="button"
              onClick={() => moveDeck(isFirstDeck ? "next" : "previous")}
              className="flex min-h-12 w-full items-center justify-center gap-1 rounded-2xl px-4 py-3 text-base text-white"
              style={{ backgroundColor: feedbackColors.brand }}
            >
              {isFirstDeck ? (
                <>
                  {feedbackDeckLabel}
                  <ChevronRight aria-hidden size={19} />
                </>
              ) : (
                <>
                  <ChevronLeft aria-hidden size={19} />
                  {DECK_LABELS[0]}
                </>
              )}
            </button>
          </div>
        </nav>
      </div>
    </main>
  );
}

function ScoreAndAnswerDeck({
  detail,
  playbackTime,
  onPlaybackTimeChange,
  audioPlayerRef,
  onSelectRetry,
}: {
  detail: ExamQuestionDetail;
  playbackTime: number;
  onPlaybackTimeChange: (seconds: number) => void;
  audioPlayerRef: React.RefObject<AnswerAudioPlayerHandle | null>;
  onSelectRetry: (retryCount: number) => void;
}) {
  const isReadAloud = detail.partNumber === 1;

  return (
    <section aria-labelledby="app-question-feedback-heading">
      <h1
        id="app-question-feedback-heading"
        className="mt-3 text-3xl text-blue-950"
      >
        문제 {detail.questionNumber}번 피드백
      </h1>

      <RetryScoreBoard detail={detail} onSelectRetry={onSelectRetry} />

      {!isReadAloud && (
        <div className="mt-6">
          <ExamPriorityPanel
            correctionItems={detail.feedback.correctionItems}
            nextStrategy={detail.feedback.nextStrategy}
          />
        </div>
      )}

      <div className="mt-6">
        <ExamQuestionPrompt questionInfo={detail.questionInfo} />
      </div>

      <div className="mt-6 rounded-3xl bg-white p-5" style={cardShadow}>
        <h2 className="text-lg text-blue-950">내 답변</h2>

        {detail.audioUrl && (
          <>
            <div className="mt-3">
              <AnswerAudioPlayer
                ref={audioPlayerRef}
                audioUrl={detail.audioUrl}
                onTimeUpdate={onPlaybackTimeChange}
                compact
              />
            </div>
            <hr className="mt-4 border-zinc-100" />
          </>
        )}

        <div className={detail.audioUrl ? "mt-4" : "mt-3"}>
          {!isReadAloud ? (
            <ExamMarkedTranscript
              transcript={detail.transcript}
              correctionItems={detail.feedback.correctionItems}
            />
          ) : detail.spokenWordSequence.length > 0 ? (
            <ExamPronunciationTranscript
              spokenWordSequence={detail.spokenWordSequence}
              currentTimeSec={playbackTime}
              onWordClick={
                detail.audioUrl
                  ? (seconds) => audioPlayerRef.current?.seekTo(seconds)
                  : undefined
              }
            />
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-zinc-50 p-6 text-center ring-1 ring-zinc-100">
              <div className="relative h-16 w-16">
                <Image
                  src="/mascots/hmm_rabbit.png"
                  alt=""
                  aria-hidden
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </div>
              <p className="text-sm text-zinc-400">응답이 감지되지 않았어요</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FeedbackDeck({
  detail,
  onReanswer,
}: {
  detail: ExamQuestionDetail;
  onReanswer: () => void;
}) {
  const isReadAloud = detail.partNumber === 1;
  const details: [string, string][] = [
    ["발음", detail.feedback.pronunciation],
    ["유창성", detail.feedback.fluency],
  ];
  if (!isReadAloud) {
    details.push(["내용", detail.feedback.content]);
    details.push(["문법 & 어휘", detail.feedback.grammarVocabulary]);
  }

  return (
    <section
      aria-label={
        isReadAloud ? "추천답안과 상세 피드백" : "모범답안과 상세 피드백"
      }
      className="mt-3"
    >
      <ModelAnswerCard feedback={detail.feedback} isReadAloud={isReadAloud} />

      <AtAGlanceSection
        strengths={detail.feedback.strengths}
        weaknesses={detail.feedback.weaknesses}
      />

      <div
        className="mt-8 flex flex-col gap-4 rounded-3xl bg-white p-5"
        style={cardShadow}
      >
        <h2 className="text-lg text-blue-950">세부 피드백</h2>
        {details.map(([title, body]) => (
          <div
            key={title}
            className="rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-100"
          >
            <p className="text-sm text-sky-700">{title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-sky-900">
              {body}
            </p>
          </div>
        ))}
      </div>

      <ReanswerCta detail={detail} onReanswer={onReanswer} />
    </section>
  );
}

/**
 * 피드백을 다 읽은 자리에 두는 인라인 CTA.
 * 탭이었을 때는 "이걸 보는 대신 저걸 본다"는 배타적 선택이었지만, 여기서는 상세 피드백을
 * 막 읽어 동기가 가장 높은 순간을 잡는다.
 */
function ReanswerCta({
  detail,
  onReanswer,
}: {
  detail: ExamQuestionDetail;
  onReanswer: () => void;
}) {
  const scores = getRetryScores(detail);
  /**
   * 시도 횟수는 API의 명시적인 totalRetryCount로 센다.
   * 점수 비교는 전체 배열의 마지막이 아니라 "첫 답변 → 지금 보는 회차"로 잡는다.
   */
  const hasRetried = detail.totalRetryCount > 1;
  const first = scores[0].score;
  const activeIndex = Math.max(0, indexOfRetryCount(scores, detail.retryCount));
  const current = scores[activeIndex]?.score ?? detail.score;
  const delta = current - first;
  const tone = deltaTone(delta);

  return (
    <section
      aria-label="다시 답변하기"
      className="mt-6 overflow-hidden rounded-3xl bg-white p-5 ring-1 ring-orange-200"
    >
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 shrink-0">
          <Image
            src="/mascots/rabbit_face.png"
            alt=""
            aria-hidden
            fill
            sizes="64px"
            className="object-contain drop-shadow"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg text-orange-900">
            {hasRetried
              ? "이 문제, 한 번 더 해볼까요?"
              : "지금 바로 다시 답변해 볼까요?"}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-orange-800">
            {hasRetried
              ? "피드백을 반영해서 말해 보면 어디가 달라졌는지 바로 확인할 수 있어요."
              : "방금 확인한 피드백을 적용해 다시 말해 보기 좋은 순간이에요."}
          </p>
        </div>
      </div>

      {hasRetried && (
        <p className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-white/70 px-3.5 py-2.5 text-sm text-orange-800">
          <span>
            총 {detail.totalRetryCount}차 · 첫 답변 {formatScore(first)}점 →
            이번 회차 {formatScore(current)}점
          </span>
          <span
            className="shrink-0 font-bold tabular-nums"
            style={{
              color:
                tone === "up"
                  ? feedbackColors.positive
                  : tone === "down"
                    ? feedbackColors.part.improvement
                    : feedbackColors.inkMuted,
            }}
          >
            {formatDelta(delta)}
          </span>
        </p>
      )}

      <button
        type="button"
        onClick={onReanswer}
        className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl text-base text-white"
        style={{ backgroundColor: feedbackColors.brand }}
      >
        <Mic aria-hidden size={18} />
        다시 답변하기
      </button>
    </section>
  );
}
