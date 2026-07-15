"use client";

import { useEffect, useState } from "react";

/**
 * 0에서 target까지 ease-out으로 차오르는 숫자 카운트업.
 * enabled가 다시 true가 될 때마다 0부터 다시 센다.
 * prefers-reduced-motion 환경에서는 애니메이션 없이 바로 target을 보여준다.
 */
export function useCountUp(
  target: number,
  {
    durationMs = 900,
    enabled = true,
  }: { durationMs?: number; enabled?: boolean } = {},
) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }

    const start = performance.now();
    let raf = requestAnimationFrame(function tick(now) {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, enabled]);

  return value;
}
