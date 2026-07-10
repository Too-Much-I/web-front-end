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
  useEffect(() => {
    onEndedRef.current = onEnded;
  });

  useEffect(() => {
    if (!enabled) return;

    if (!src) {
      const timeoutId = setTimeout(() => onEndedRef.current(), fallbackDurationMs);
      return () => clearTimeout(timeoutId);
    }

    const audio = new Audio(src);
    let fallbackTimeoutId: ReturnType<typeof setTimeout> | undefined;

    const finish = () => {
      clearTimeout(fallbackTimeoutId);
      onEndedRef.current();
    };
    // Playback failed (bad format, 404, decode error, autoplay block, ...): don't skip
    // the screen instantly, show it for the same fallback duration as a missing src.
    const onError = () => {
      fallbackTimeoutId = setTimeout(finish, fallbackDurationMs);
    };

    audio.addEventListener("ended", finish);
    audio.addEventListener("error", onError);
    audio.play().catch(onError);

    return () => {
      audio.removeEventListener("ended", finish);
      audio.removeEventListener("error", onError);
      clearTimeout(fallbackTimeoutId);
      audio.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, enabled]);
}
