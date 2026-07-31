"use client";

import { feedbackColors } from "@/components/app-exam-screen/theme";
import { formatScore } from "@/components/app-question-feedback/retry-view-model";

const SIZE = 132;
const STROKE_WIDTH = 10;
const CENTER = SIZE / 2;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** 재도전 전에는 추이 대신 첫 답변의 만점 대비 달성도를 보여준다. */
export function SingleAttemptScoreRing({
  score,
  maxScore,
}: {
  score: number;
  maxScore: number;
}) {
  const ratio = maxScore > 0 ? Math.min(Math.max(score / maxScore, 0), 1) : 0;
  const dashOffset = CIRCUMFERENCE * (1 - ratio);

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={`첫 답변 점수 ${formatScore(score)}점, 만점 ${formatScore(maxScore)}점`}
      className="mx-auto block h-32 w-32"
    >
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        fill="none"
        stroke={feedbackColors.scoreTrack}
        strokeWidth={STROKE_WIDTH}
      />
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        fill="none"
        stroke={feedbackColors.radarFill}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${CENTER} ${CENTER})`}
        className="app-score-ring-progress"
        style={
          {
            "--app-score-ring-circumference": CIRCUMFERENCE,
          } as React.CSSProperties
        }
      />
      <text
        x={CENTER}
        y={CENTER - 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={14}
        fill={feedbackColors.chalk}
      >
        첫 답변
      </text>
      <text
        x={CENTER}
        y={CENTER + 18}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={11}
        fill={feedbackColors.chalkMuted}
      >
        만점의 {Math.round(ratio * 100)}%
      </text>
    </svg>
  );
}
