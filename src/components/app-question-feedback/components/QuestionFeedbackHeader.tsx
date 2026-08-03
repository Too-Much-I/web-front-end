"use client";

import { ChevronLeft } from "lucide-react";

import { feedbackColors } from "@/components/app-exam-screen/theme";

/**
 * 문제별 피드백 헤더. 회차 칩을 여기 두는 이유는 헤더가 스크롤을 따라가지 않아서다 —
 * 덱 1(칠판·내 답변)이든 덱 2(모범답안·피드백)든 어디서든 회차를 바꿀 수 있어야 한다.
 *
 * 칩의 개수는 API가 명시적으로 주는 totalRetryCount로 정한다.
 * retryScores는 그래프 데이터이고, 회차 탐색 범위의 기준은 totalRetryCount다.
 * 시도가 하나뿐이면 고를 게 없어 칩을 내지 않는다.
 */
export function QuestionFeedbackHeader({
  partNumber,
  questionNumber,
  currentStep,
  totalSteps,
  totalRetryCount,
  activeRetryCount,
  onSelectRetry,
  onBack,
}: {
  partNumber: number;
  questionNumber: number;
  currentStep: number;
  totalSteps: number;
  totalRetryCount: number;
  activeRetryCount: number;
  onSelectRetry: (retryCount: number) => void;
  onBack: () => void;
}) {
  const progressPercent = (currentStep / totalSteps) * 100;
  const attempts = Array.from({ length: totalRetryCount }, (_, i) => i);

  return (
    <header className="sticky top-0 z-20 bg-[#fff9f2]/95 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
      <div className="pt-3 pb-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-1">
            <button
              type="button"
              aria-label="파트별 피드백으로 돌아가기"
              onClick={onBack}
              className="-ml-2 flex size-11 shrink-0 items-center justify-center rounded-full text-blue-950 transition-colors active:bg-orange-100"
            >
              <ChevronLeft aria-hidden size={24} />
            </button>
            <p
              className="truncate text-sm"
              style={{ color: feedbackColors.brand }}
            >
              Part {partNumber} · 문제 {questionNumber}번
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

        {attempts.length > 1 && (
          <div
            role="group"
            aria-label="회차 선택"
            className="-mx-5 mt-3 flex [scrollbar-width:none] gap-1.5 overflow-x-auto px-5 [&::-webkit-scrollbar]:hidden"
          >
            {attempts.map((retryCount) => {
              const isActive = retryCount === activeRetryCount;
              return (
                <button
                  key={retryCount}
                  type="button"
                  aria-current={isActive}
                  onClick={() => onSelectRetry(retryCount)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-[13px] whitespace-nowrap transition-colors ${
                    isActive
                      ? "border-orange-500 bg-orange-500 text-white"
                      : "border-orange-200 bg-white text-zinc-500"
                  }`}
                >
                  {retryCount + 1}차
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
