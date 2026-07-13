"use client";

import { getExamPartMeta } from "@/features/exam/part-meta";
import { useAudioCue } from "@/features/exam/use-audio-cue";

const WORDS_PER_SEC = 2.5;
const MIN_FALLBACK_MS = 3000;

export function ExamPartIntroScreen({
  partNumber,
  text,
  audioUrl,
  resetKey,
  onComplete,
  enabled = true,
}: {
  partNumber: number;
  text: string;
  audioUrl: string | undefined;
  resetKey: string;
  onComplete: () => void;
  enabled?: boolean;
}) {
  const wordCount = text.split(/\s+/).length;
  const fallbackDurationMs = Math.max(MIN_FALLBACK_MS, (wordCount / WORDS_PER_SEC) * 1000);

  useAudioCue(audioUrl, fallbackDurationMs, onComplete, resetKey, enabled);

  const partMeta = getExamPartMeta(partNumber);

  return (
    <main className="mx-auto flex w-full min-h-0 max-w-2xl flex-1 flex-col items-center gap-4 overflow-y-auto px-6 pt-8 pb-6 text-center md:max-w-3xl md:gap-6 lg:max-w-4xl lg:gap-8 xl:max-w-5xl">
      <span className="w-fit shrink-0 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 sm:text-sm lg:text-base">
        Part {partNumber} · {partMeta.titleEn}
      </span>
      <p className="rounded-xl bg-orange-50/60 p-5 text-left text-base leading-relaxed text-blue-950 sm:text-lg md:p-7 md:text-xl lg:p-8 lg:text-2xl">
        {text}
      </p>
    </main>
  );
}
