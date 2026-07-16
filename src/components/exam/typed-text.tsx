"use client";

import { useTypewriterOnce } from "@/features/exam/use-typewriter-once";

/**
 * 글자가 하나씩 나타나듯 보여주는 텍스트. enabled가 true가 되는 시점에 한 번 재생된다.
 * 타이핑 상태를 이 컴포넌트 안에 격리해서, 매 tick마다 상위 트리 전체가
 * 리렌더링되며 옆에 있는 recharts 차트 같은 무거운 형제 컴포넌트까지
 * 같이 깜빡이는 문제를 막는다.
 */
export function TypedText({
  text,
  className,
  enabled = true,
}: {
  text: string;
  className?: string;
  enabled?: boolean;
}) {
  const { chars, revealedCount } = useTypewriterOnce(text, { enabled });

  return (
    <p className={className}>
      {chars.map((ch, i) => (
        <span
          key={i}
          className={i < revealedCount ? "opacity-100" : "opacity-0"}
        >
          {ch}
        </span>
      ))}
    </p>
  );
}
