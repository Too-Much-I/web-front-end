"use client";

import { ChevronLeft } from "lucide-react";

import { feedbackColors } from "@/components/app-exam-screen/theme";

type FeedbackHeaderProps = {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
};

export function FeedbackHeader({
  currentStep,
  totalSteps,
  onBack,
}: FeedbackHeaderProps) {
  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <header className="sticky top-0 z-20 bg-[#fff9f2]/95 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
      <div className="pt-3 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-1">
            <button
              type="button"
              aria-label="모의고사 이력으로 돌아가기"
              onClick={onBack}
              className="-ml-2 flex size-11 shrink-0 items-center justify-center rounded-full text-blue-950 transition-colors active:bg-orange-100"
            >
              <ChevronLeft aria-hidden size={24} />
            </button>
            <p
              className="truncate text-sm"
              style={{ color: feedbackColors.positive }}
            >
              SESSION ANALYSIS
            </p>
          </div>
          <p className="text-sm text-zinc-500" aria-hidden>
            {currentStep} / {totalSteps}
          </p>
        </div>

        <div
          role="progressbar"
          aria-label={`피드백 확인 진행률 ${currentStep}/${totalSteps}`}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-valuenow={currentStep}
          className="mt-3 h-2 overflow-hidden rounded-full bg-orange-100"
        >
          <div
            className="h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: feedbackColors.brand,
            }}
          />
        </div>
      </div>
    </header>
  );
}
