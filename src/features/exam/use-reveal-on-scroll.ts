"use client";

import { type RefObject, useEffect, useState } from "react";

/**
 * ref가 가리키는 요소가 뷰포트에 처음 들어오는 순간 한 번만 true로 바뀐다(이후 유지).
 * ref는 호출하는 쪽에서 직접 `useRef`로 만들어 넘긴다 — 훅이 ref를 감싸서 반환하면
 * "렌더 중 ref 접근" 린트 규칙(react-hooks/refs)에 걸리기 때문이다.
 */
export function useRevealOnScroll(
  ref: RefObject<HTMLElement | null>,
  threshold = 0.3,
): boolean {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return revealed;
}
