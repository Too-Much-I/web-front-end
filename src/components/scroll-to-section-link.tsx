"use client";

import type { MouseEvent, ReactNode } from "react";

// 3차 이징: 처음엔 천천히 가속하고 끝에서 천천히 감속해 사람이 스크롤하는 듯한 느낌을 준다.
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function ScrollToSectionLink({
  targetId,
  duration = 900,
  className,
  children,
}: {
  targetId: string;
  duration?: number;
  className?: string;
  children: ReactNode;
}) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(targetId);
    if (!target) return;
    event.preventDefault();

    const startY = window.scrollY;
    const targetY = startY + target.getBoundingClientRect().top;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo({ top: targetY, behavior: "auto" });
      return;
    }

    const distance = targetY - startY;
    const startTime = performance.now();
    const safeDuration = Number.isFinite(duration) ? Math.max(duration, 0) : 0;

    function step(now: number) {
      const progress =
        safeDuration === 0 ? 1 : Math.min((now - startTime) / safeDuration, 1);
      window.scrollTo({
        top: startY + distance * easeInOutCubic(progress),
        behavior: "auto",
      });
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  };

  return (
    <a href={`#${targetId}`} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
