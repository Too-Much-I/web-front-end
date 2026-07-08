"use client";

import { cn } from "@/lib/utils";

interface ExamQaNavBarProps {
  currentIndex: number;
  total: number;
  currentPartNumber: number;
  availableParts: number[];
  onPrev: () => void;
  onNext: () => void;
  onJumpToPart: (partNumber: number) => void;
  onSkipPhase: () => void;
  onGoToGrading: () => void;
  onGoToResult: () => void;
}

/**
 * QA/멘토 검수용 임시 이동 바. 실제 시험 흐름과 무관하게 화면을 자유롭게 넘나들기 위한 도구.
 * 다같이 검수 후 제거 예정.
 */
export function ExamQaNavBar({
  currentIndex,
  total,
  currentPartNumber,
  availableParts,
  onPrev,
  onNext,
  onJumpToPart,
  onSkipPhase,
  onGoToGrading,
  onGoToResult,
}: ExamQaNavBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col gap-2 border-t-2 border-dashed border-yellow-400 bg-zinc-900/95 px-4 py-2.5 text-white shadow-[0_-4px_12px_rgba(0,0,0,0.25)]">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="rounded bg-yellow-400 px-1.5 py-0.5 text-[10px] font-bold text-zinc-900">
          QA 전용
        </span>

        <div className="flex items-center gap-1">
          {availableParts.map((part) => (
            <button
              key={part}
              type="button"
              onClick={() => onJumpToPart(part)}
              className={cn(
                "rounded px-2 py-1 text-xs font-semibold transition-colors",
                part === currentPartNumber
                  ? "bg-orange-500 text-white"
                  : "bg-zinc-700 text-zinc-200 hover:bg-zinc-600",
              )}
            >
              Part {part}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="rounded bg-zinc-700 px-2 py-1 text-xs font-semibold text-zinc-200 hover:bg-zinc-600 disabled:opacity-40"
          >
            이전 문제
          </button>
          <span className="text-xs tabular-nums text-zinc-300">
            {currentIndex + 1} / {total}
          </span>
          <button
            type="button"
            onClick={onNext}
            disabled={currentIndex === total - 1}
            className="rounded bg-zinc-700 px-2 py-1 text-xs font-semibold text-zinc-200 hover:bg-zinc-600 disabled:opacity-40"
          >
            다음 문제
          </button>
        </div>

        <button
          type="button"
          onClick={onSkipPhase}
          className="rounded bg-blue-600 px-2 py-1 text-xs font-semibold text-white hover:bg-blue-500"
        >
          현재 단계 건너뛰기
        </button>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={onGoToGrading}
            className="rounded bg-zinc-700 px-2 py-1 text-xs font-semibold text-zinc-200 hover:bg-zinc-600"
          >
            채점 대기 화면으로
          </button>
          <button
            type="button"
            onClick={onGoToResult}
            className="rounded bg-zinc-700 px-2 py-1 text-xs font-semibold text-zinc-200 hover:bg-zinc-600"
          >
            결과 화면으로
          </button>
        </div>
      </div>
    </div>
  );
}
