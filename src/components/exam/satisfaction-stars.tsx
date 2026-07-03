"use client";

import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

const SCORES = [1, 2, 3, 4, 5];

export function SatisfactionStars({
  value,
  onChange,
  size = "size-8",
}: {
  value: number | null;
  onChange: (score: number) => void;
  size?: string;
}) {
  return (
    <div role="radiogroup" aria-label="만족도" className="flex gap-1">
      {SCORES.map((score) => {
        const filled = value !== null && score <= value;
        return (
          <button
            key={score}
            type="button"
            role="radio"
            aria-checked={value === score}
            aria-label={`${score}점`}
            onClick={() => onChange(score)}
            className="rounded-full p-1 transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                size,
                "transition-colors",
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-zinc-300",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
