"use client";

import { useAudioCue } from "@/features/exam/use-audio-cue";

const WORDS_PER_SEC = 2.5;
const MIN_FALLBACK_MS = 3000;

export function ExamPartIntroScreen({
  text,
  audioUrl,
  resetKey,
  onComplete,
}: {
  text: string;
  audioUrl: string | undefined;
  resetKey: string;
  onComplete: () => void;
}) {
  const wordCount = text.split(/\s+/).length;
  const fallbackDurationMs = Math.max(MIN_FALLBACK_MS, (wordCount / WORDS_PER_SEC) * 1000);

  useAudioCue(audioUrl, fallbackDurationMs, onComplete, resetKey);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-orange-50/60 px-8 text-center">
      <p className="max-w-2xl text-base leading-relaxed text-zinc-700 sm:text-lg">{text}</p>
    </div>
  );
}
