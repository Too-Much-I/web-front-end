"use client";

import { useEffect, useState } from "react";

/** 글자당 지연 시간(ms). 숫자가 클수록 느리게, 작을수록 빠르게 나타난다. */
const TYPEWRITER_SPEED_MS = 40;

/**
 * 타이핑 애니메이션을 한 번만 재생하고, 이후엔 항상 전체 텍스트를 보여준다.
 * enabled가 false인 동안엔 아무 글자도 드러내지 않고 대기하다가 true가 되면 시작한다.
 * 전체 글자를 처음부터 모두 렌더링해두고 opacity만 토글하는 방식이라, 문자가 하나씩
 * "추가"되면서 text-center 정렬이 매번 다시 계산되어 이미 나타난 글자의 위치가
 * 밀리는 문제가 없다 — 레이아웃은 최초 페인트부터 최종 형태로 고정된다.
 */
export function useTypewriterOnce(
  text: string,
  { enabled = true }: { enabled?: boolean } = {},
): {
  chars: string[];
  revealedCount: number;
} {
  const [chars] = useState(() => Array.from(text));
  const [prefersReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [revealedCount, setRevealedCount] = useState(
    prefersReducedMotion ? chars.length : 0,
  );

  useEffect(() => {
    if (!enabled || prefersReducedMotion) return;

    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setRevealedCount(i);
      if (i >= chars.length) clearInterval(id);
    }, TYPEWRITER_SPEED_MS);

    return () => clearInterval(id);
  }, [chars, prefersReducedMotion, enabled]);

  return { chars, revealedCount };
}
