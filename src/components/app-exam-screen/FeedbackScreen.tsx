"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { AtAGlanceSection } from "@/components/app-exam-screen/components/AtAGlanceSection";
import { FeedbackHeader } from "@/components/app-exam-screen/components/FeedbackHeader";
import { PartFeedbackSection } from "@/components/app-exam-screen/components/PartFeedbackSection";
import { PartScoreBoard } from "@/components/app-exam-screen/components/PartScoreBoard";
import { ScoreSummaryCard } from "@/components/app-exam-screen/components/ScoreSummaryCard";
import {
  createFeedbackParts,
  createRadarAxes,
} from "@/components/app-exam-screen/feedback-view-model";
import { feedbackColors } from "@/components/app-exam-screen/theme";
import { postToNative } from "@/lib/native-bridge";
import type { ExamGradingResult } from "@/types/exam";

const FEEDBACK_STEP_COUNT = 3;
const SWIPE_DISTANCE_PX = 56;
const SWIPE_DIRECTION_RATIO = 1.2;

type StepDirection = "next" | "previous";

type FeedbackNavigationStateMessage = {
  type: "FEEDBACK_NAVIGATION_STATE";
  canGoBackWithinFeedback: boolean;
};

type FeedbackGoBackMessage = {
  type: "FEEDBACK_GO_BACK";
};

function isFeedbackGoBackMessage(
  value: unknown,
): value is FeedbackGoBackMessage {
  if (!value || typeof value !== "object") return false;
  return (value as { type?: unknown }).type === "FEEDBACK_GO_BACK";
}

export function AppExamScreen({
  result,
  initialStep = 0,
}: {
  result: ExamGradingResult;
  initialStep?: number;
}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [stepDirection, setStepDirection] = useState<StepDirection>("next");
  const [isScoreBoardRevealed, setIsScoreBoardRevealed] = useState(true);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const suppressNextClickRef = useRef(false);
  const parts = useMemo(() => createFeedbackParts(result), [result]);
  const radarAxes = useMemo(() => createRadarAxes(parts), [parts]);
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === FEEDBACK_STEP_COUNT - 1;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [currentStep]);

  useEffect(() => {
    const message: FeedbackNavigationStateMessage = {
      type: "FEEDBACK_NAVIGATION_STATE",
      canGoBackWithinFeedback: currentStep > 0,
    };
    postToNative(message);
  }, [currentStep]);

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

      if (!isFeedbackGoBackMessage(message)) return;
      setStepDirection("previous");
      setCurrentStep((step) => Math.max(step - 1, 0));
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

  const moveToStep = (direction: StepDirection) => {
    setStepDirection(direction);
    setCurrentStep((step) => {
      const nextStep = direction === "next" ? step + 1 : step - 1;
      return Math.min(Math.max(nextStep, 0), FEEDBACK_STEP_COUNT - 1);
    });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.pointerType === "mouse") return;
    swipeStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const swipeStart = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!swipeStart) return;

    const deltaX = event.clientX - swipeStart.x;
    const deltaY = event.clientY - swipeStart.y;
    const isHorizontalSwipe =
      Math.abs(deltaX) >= SWIPE_DISTANCE_PX &&
      Math.abs(deltaX) > Math.abs(deltaY) * SWIPE_DIRECTION_RATIO;

    if (!isHorizontalSwipe) return;

    suppressNextClickRef.current = true;
    moveToStep(deltaX < 0 ? "next" : "previous");
    window.setTimeout(() => {
      suppressNextClickRef.current = false;
    }, 0);
  };

  const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!suppressNextClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressNextClickRef.current = false;
  };

  const openQuestion = (questionNumber: number) => {
    const params = new URLSearchParams({
      examId: result.examId,
      questionNumber: String(questionNumber),
    });
    router.push(`/app-question-feedback?${params.toString()}`);
  };

  return (
    <main
      className="flex min-h-dvh flex-col overflow-x-clip"
      style={{ backgroundColor: feedbackColors.surfaceSubtle }}
    >
      <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-1 flex-col px-5">
        <FeedbackHeader
          currentStep={currentStep + 1}
          totalSteps={FEEDBACK_STEP_COUNT}
        />

        <div
          key={currentStep}
          className={`flex-1 overflow-x-clip pb-32 motion-reduce:animate-none ${
            stepDirection === "next"
              ? "animate-[app-feedback-step-next_220ms_ease-out]"
              : "animate-[app-feedback-step-previous_220ms_ease-out]"
          }`}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => {
            swipeStartRef.current = null;
          }}
          onClickCapture={handleClickCapture}
        >
          {currentStep === 0 && (
            <section aria-labelledby="app-feedback-summary-heading">
              <h1
                id="app-feedback-summary-heading"
                className="mt-3 text-3xl text-blue-950"
              >
                종합 결과 분석
              </h1>
              <ScoreSummaryCard result={result} />
              <AtAGlanceSection
                strengths={result.strengths}
                weaknesses={result.weaknesses}
              />
            </section>
          )}

          {currentStep === 1 && (
            <PartScoreBoard
              axes={radarAxes}
              isRevealed={isScoreBoardRevealed}
              onToggle={() => setIsScoreBoardRevealed((current) => !current)}
            />
          )}

          {currentStep === 2 && (
            <PartFeedbackSection parts={parts} onOpenQuestion={openQuestion} />
          )}
        </div>

        <nav
          aria-label="피드백 단계 이동"
          className="fixed inset-x-0 bottom-0 z-20 border-t border-orange-100 bg-[#fff9f2]/95 backdrop-blur-sm"
        >
          <div
            className="mx-auto flex w-full max-w-3xl gap-3 px-5 pt-4"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            <button
              type="button"
              disabled={isFirstStep}
              onClick={() => moveToStep("previous")}
              className="flex min-h-12 flex-1 items-center justify-center gap-1 rounded-2xl border border-orange-200 bg-white px-4 py-3 text-base text-orange-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft aria-hidden size={19} />
              이전
            </button>
            <button
              type="button"
              disabled={isLastStep}
              onClick={() => moveToStep("next")}
              className="flex min-h-12 flex-1 items-center justify-center gap-1 rounded-2xl px-4 py-3 text-base text-white disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: feedbackColors.brand }}
            >
              다음
              <ChevronRight aria-hidden size={19} />
            </button>
          </div>
        </nav>
      </div>
    </main>
  );
}
