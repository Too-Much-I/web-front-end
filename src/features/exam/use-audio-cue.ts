"use client";

import { useEffect, useRef } from "react";

/**
 * Plays a cue audio clip and fires onEnded when it finishes.
 * If no src is given (audio not produced yet) or playback fails/is blocked,
 * falls back to a timer of fallbackDurationMs so the exam flow never hangs.
 */
export function useAudioCue(
  src: string | undefined,
  fallbackDurationMs: number,
  onEnded: () => void,
  resetKey: string,
  enabled: boolean = true,
) {
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  useEffect(() => {
    if (!enabled) return;

    if (!src) {
      const timeoutId = setTimeout(() => onEndedRef.current(), fallbackDurationMs);
      return () => clearTimeout(timeoutId);
    }

    const audio = new Audio(src);
    const finish = () => onEndedRef.current();

    audio.addEventListener("ended", finish);
    audio.addEventListener("error", finish);
    audio.play().catch(finish);

    return () => {
      audio.removeEventListener("ended", finish);
      audio.removeEventListener("error", finish);
      audio.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, enabled]);
}
