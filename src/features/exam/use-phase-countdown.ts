"use client";

import { useEffect, useState } from "react";

export function usePhaseCountdown(
  durationSec: number,
  resetKey: string,
  onComplete: () => void,
  enabled: boolean = true,
) {
  const [remainingMs, setRemainingMs] = useState(durationSec * 1000);

  const resetSignature = `${resetKey}:${enabled}`;
  const [prevResetSignature, setPrevResetSignature] = useState(resetSignature);
  if (prevResetSignature !== resetSignature) {
    setPrevResetSignature(resetSignature);
    setRemainingMs(durationSec * 1000);
  }

  useEffect(() => {
    if (!enabled) return;

    const deadline = Date.now() + durationSec * 1000;

    const tick = () => {
      const next = deadline - Date.now();
      if (next <= 0) {
        setRemainingMs(0);
        onComplete();
        return;
      }
      setRemainingMs(next);
    };

    const intervalId = setInterval(tick, 200);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, enabled]);

  return remainingMs;
}

export function formatSeconds(ms: number) {
  const totalSec = Math.ceil(ms / 1000);
  const mm = Math.floor(totalSec / 60);
  const ss = totalSec % 60;
  return `00:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}
