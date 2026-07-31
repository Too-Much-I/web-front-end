"use client";

import { feedbackColors } from "@/components/app-exam-screen/theme";
import { formatScore } from "@/components/app-question-feedback/retry-view-model";
import type { ExamRetryScore } from "@/types/exam";

const VIEW_WIDTH = 280;
const VIEW_HEIGHT = 128;
const PAD_X = 26;
const PAD_TOP = 14;
const PAD_BOTTOM = 30;
const DOT_RADIUS = 5;
/** 점 위에 덮는 투명 원 — 점 자체는 작아서 터치 타깃이 따로 필요하다. */
const HIT_RADIUS = 16;

/**
 * 칠판에 분필로 그은 듯한 회차별 총점 그래프.
 * 서버가 전체 회차를 내려주므로, 현재 선택한 회차까지는 실선으로 그리고
 * 이후 회차는 점선으로 연결해 다음 시도의 흐름을 미리 비교할 수 있게 한다.
 *
 * y축은 0~만점 절대 축이다. 변화 폭에 맞춰 확대하면 선이 더 극적으로 보이지만,
 * 만점까지 얼마나 남았는지를 잃어버려서 총점 그래프에는 맞지 않는다.
 */
export function RetryScoreChart({
  scores,
  maxScore,
  activeIndex,
  onSelect,
}: {
  scores: ExamRetryScore[];
  maxScore: number;
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const count = scores.length;
  const plotBottom = VIEW_HEIGHT - PAD_BOTTOM;

  const x = (index: number) =>
    count === 1
      ? VIEW_WIDTH / 2
      : PAD_X + (index * (VIEW_WIDTH - PAD_X * 2)) / (count - 1);
  const y = (value: number) =>
    maxScore <= 0
      ? plotBottom
      : plotBottom - (value / maxScore) * (plotBottom - PAD_TOP);

  const gridLines = Array.from(
    { length: Math.floor(maxScore) + 1 },
    (_, i) => i,
  );
  const solidScores = scores.slice(0, activeIndex + 1);
  // 선택한 점에서 시작해야 이후 회차와의 연결 구간 전체가 점선으로 보인다.
  const laterScores = scores.slice(activeIndex);

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label={`회차별 총점 그래프. ${scores
        .map((item) => `${item.retryCount + 1}차 ${formatScore(item.score)}점`)
        .join(", ")}. 선택 회차까지는 실선, 이후 회차는 점선.`}
      className="block h-auto w-full"
    >
      {gridLines.map((line) => (
        <line
          key={line}
          x1={0}
          x2={VIEW_WIDTH}
          y1={y(line)}
          y2={y(line)}
          stroke="rgb(255 255 255 / 9%)"
          strokeWidth={1}
        />
      ))}

      {solidScores.length > 1 && (
        <polyline
          fill="none"
          stroke={feedbackColors.radarFill}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          points={solidScores
            .map((item, i) => `${x(i)},${y(item.score)}`)
            .join(" ")}
        />
      )}

      {laterScores.length > 1 && (
        <polyline
          fill="none"
          stroke={feedbackColors.radarFill}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="5 6"
          points={laterScores
            .map((item, i) => `${x(activeIndex + i)},${y(item.score)}`)
            .join(" ")}
        />
      )}

      {scores.map((item, i) => {
        const isActive = i === activeIndex;
        return (
          <circle
            key={`dot-${item.retryCount}`}
            cx={x(i)}
            cy={y(item.score)}
            r={isActive ? DOT_RADIUS + 1.5 : DOT_RADIUS}
            fill={
              isActive ? feedbackColors.radarFill : feedbackColors.chalkboard
            }
            stroke={feedbackColors.radarFill}
            strokeWidth={2.5}
          />
        );
      })}

      {scores.map((item, i) => (
        <text
          key={`label-${item.retryCount}`}
          x={x(i)}
          y={VIEW_HEIGHT - 4}
          textAnchor="middle"
          fontSize={11}
          fill={
            i === activeIndex
              ? feedbackColors.radarFill
              : "rgb(255 255 255 / 50%)"
          }
        >
          {item.retryCount + 1}차
        </text>
      ))}

      {count > 1 &&
        scores.map((item, i) => (
          <circle
            key={`hit-${item.retryCount}`}
            className="cursor-pointer focus-visible:outline-2"
            cx={x(i)}
            cy={y(item.score)}
            r={HIT_RADIUS}
            fill="transparent"
            role="button"
            tabIndex={0}
            aria-label={`${item.retryCount + 1}차 피드백 보기`}
            // 점은 회차 이동이라, 칠판 전체에 걸린 지표 전환 토글까지 같이 돌면 안 된다.
            onClick={(event) => {
              event.stopPropagation();
              onSelect(i);
            }}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              event.stopPropagation();
              onSelect(i);
            }}
          >
            <title>
              {item.retryCount + 1}차 · {formatScore(item.score)}점
            </title>
          </circle>
        ))}
    </svg>
  );
}
