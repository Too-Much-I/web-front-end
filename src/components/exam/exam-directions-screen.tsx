"use client";

import { getExamPartDirections } from "@/features/exam/part-directions";
import { useAudioCue } from "@/features/exam/use-audio-cue";

const WORDS_PER_SEC = 2.5;
const MIN_FALLBACK_MS = 3000;

export function ExamDirectionsScreen({
  partNumber,
  onComplete,
}: {
  partNumber: number;
  onComplete: () => void;
}) {
  const directions = getExamPartDirections(partNumber);

  const wordCount = directions?.lines.join(" ").split(/\s+/).length ?? 0;
  const fallbackDurationMs = Math.max(MIN_FALLBACK_MS, (wordCount / WORDS_PER_SEC) * 1000);

  useAudioCue(directions?.audioUrl, fallbackDurationMs, onComplete, `directions-${partNumber}`);

  if (!directions) return null;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-orange-50/60 px-8 text-center">
      <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl">{directions.title}</h2>
      <div className="flex max-w-2xl flex-col gap-3">
        {directions.lines.map((line, i) => {
          const isFirst = i === 0;
          const prefix = "Directions: ";
          const body = isFirst && line.startsWith(prefix) ? line.slice(prefix.length) : line;

          return (
            <p key={i} className="text-base leading-relaxed text-zinc-700 sm:text-lg">
              {isFirst && line.startsWith(prefix) && (
                <span className="font-semibold text-zinc-900">{prefix}</span>
              )}
              {body}
            </p>
          );
        })}
      </div>
    </div>
  );
}
