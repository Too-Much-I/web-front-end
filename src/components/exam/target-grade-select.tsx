"use client";

import { useEffect, useState } from "react";

import {
  TARGET_GRADE_OPTIONS,
  getStoredTargetGradeId,
  setStoredTargetGradeId,
} from "@/features/exam/target-grade";
import { cn } from "@/lib/utils";

export function TargetGradeSelect() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedId(getStoredTargetGradeId());
  }, []);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setStoredTargetGradeId(id);
  };

  return (
    <div className="flex w-full flex-col gap-2.5">
      <span className="text-sm font-semibold text-zinc-700">목표 등급</span>

      <div className="overflow-hidden rounded-xl ring-1 ring-zinc-100">
        <div className="grid grid-cols-2 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-950">
          <span>레벨</span>
          <span className="text-right">점수</span>
        </div>

        <div role="radiogroup" aria-label="목표 등급" className="flex flex-col divide-y divide-zinc-100">
          {TARGET_GRADE_OPTIONS.map((option) => {
            const isSelected = selectedId === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleSelect(option.id)}
                className={cn(
                  "grid grid-cols-2 items-center px-3 py-2 text-left text-sm transition-colors",
                  isSelected
                    ? "bg-orange-50 font-bold text-orange-600"
                    : "text-zinc-600 hover:bg-zinc-50",
                )}
              >
                <span>{option.levelLabel}</span>
                <span className="text-right">{option.scoreLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-zinc-400">
        선택한 목표 등급은 채점 결과 페이지에서 현재 예상 점수와 비교돼요.
      </p>
    </div>
  );
}
