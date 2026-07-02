"use client";

import { useEffect, useRef } from "react";

/**
 * Plays a list of audio clips back to back and fires onEnded once the last one finishes.
 * Missing sources in the list are skipped; if every source is missing, falls back to a
 * timer of fallbackDurationMs so the exam flow never hangs.
 */
export function useAudioSequence(
  sources: (string | undefined)[],
  fallbackDurationMs: number,
  onEnded: () => void,
  resetKey: string,
  enabled: boolean = true,
) {
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  useEffect(() => {
    if (!enabled) return;

    if (sources.every((src) => !src)) {
      const timeoutId = setTimeout(() => onEndedRef.current(), fallbackDurationMs);
      return () => clearTimeout(timeoutId);
    }

    let cancelled = false;
    let currentAudio: HTMLAudioElement | null = null;

    const playAt = (i: number) => {
      if (cancelled) return;
      if (i >= sources.length) {
        onEndedRef.current();
        return;
      }
      const src = sources[i];
      if (!src) {
        playAt(i + 1);
        return;
      }
      const audio = new Audio(src);
      currentAudio = audio;
      const advance = () => {
        if (cancelled) return;
        playAt(i + 1);
      };
      audio.addEventListener("ended", advance);
      audio.addEventListener("error", advance);
      audio.play().catch(advance);
    };

    playAt(0);

    return () => {
      cancelled = true;
      currentAudio?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, enabled]);
}
