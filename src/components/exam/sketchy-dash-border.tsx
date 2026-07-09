"use client";

import { useId } from "react";

/**
 * 카드 테두리에 손으로 그린 듯한 둥근 점선을 그린다.
 * feTurbulence + feDisplacementMap으로 반듯한 rect를 살짝 흔들어
 * 형광펜으로 표시한 듯한 느낌을 낸다. 부모 요소에 `relative`가 필요하다.
 */
export function SketchyDashBorder({
  radius = 24,
  strokeClassName = "stroke-orange-500",
}: {
  radius?: number;
  strokeClassName?: string;
}) {
  const filterId = useId();

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full overflow-visible"
    >
      <defs>
        <filter id={filterId} x="-6%" y="-6%" width="112%" height="112%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02"
            numOctaves="2"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="2.2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        rx={radius}
        fill="none"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="0.2 3.6"
        vectorEffect="non-scaling-stroke"
        filter={`url(#${filterId})`}
        className={strokeClassName}
      />
    </svg>
  );
}
