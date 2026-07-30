import type { RadarAxis } from "@/components/app-exam-screen/feedback-view-model";
import { feedbackColors } from "@/components/app-exam-screen/theme";

const GRID_LEVELS = [0.25, 0.5, 0.75, 1] as const;
const SIZE = 300;
const CENTER = SIZE / 2;
const RADIUS = SIZE * 0.4;

function joinPoints(points: readonly { x: number; y: number }[]) {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

export function PartRadarChart({ axes }: { axes: readonly RadarAxis[] }) {
  const axisEnds = axes.map((axis) => {
    const radians = (axis.angleDegrees * Math.PI) / 180;
    return {
      x: CENTER + Math.cos(radians) * RADIUS,
      y: CENTER + Math.sin(radians) * RADIUS,
    };
  });
  const dataPoints = axes.map((axis) =>
    axis.point
      ? { x: CENTER + axis.point.x * RADIUS, y: CENTER + axis.point.y * RADIUS }
      : null,
  );
  const hasCompleteData = dataPoints.every((point) => point !== null);

  return (
    <div>
      <svg
        aria-hidden
        className="mx-auto aspect-square w-full max-w-[300px]"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
      >
        {GRID_LEVELS.map((level) => (
          <polygon
            key={level}
            points={joinPoints(
              axisEnds.map((point) => ({
                x: CENTER + (point.x - CENTER) * level,
                y: CENTER + (point.y - CENTER) * level,
              })),
            )}
            fill="none"
            stroke={feedbackColors.radarGrid}
            strokeWidth={level === 1 ? 2 : 1}
            opacity={level === 1 ? 0.9 : 0.55}
          />
        ))}
        {axisEnds.map((point, index) => (
          <line
            key={axes[index].label}
            x1={CENTER}
            y1={CENTER}
            x2={point.x}
            y2={point.y}
            stroke={feedbackColors.radarGrid}
            strokeWidth={1}
            opacity={0.65}
          />
        ))}
        {hasCompleteData && (
          <polygon
            points={joinPoints(dataPoints.filter((point) => point !== null))}
            fill={feedbackColors.radarFill}
            fillOpacity={0.32}
            stroke={feedbackColors.radarFill}
            strokeWidth={3}
            strokeLinejoin="round"
          />
        )}
        {dataPoints.map((point, index) =>
          point ? (
            <circle
              key={axes[index].label}
              cx={point.x}
              cy={point.y}
              r={4.5}
              fill={feedbackColors.radarPoint}
              stroke={feedbackColors.chalk}
              strokeWidth={2}
            />
          ) : null,
        )}
      </svg>

      <ul className="mt-2 flex flex-col gap-2">
        {axes.map((axis) => (
          <li
            key={axis.partNumber}
            className="flex flex-row items-center justify-between gap-3"
          >
            <span className="flex min-w-0 flex-1 flex-row items-center gap-2">
              <span
                aria-hidden
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: feedbackColors.radarPoint }}
              />
              <span className="text-sm" style={{ color: feedbackColors.chalk }}>
                {axis.label}
              </span>
              <span
                className="min-w-0 flex-1 text-xs"
                style={{ color: feedbackColors.chalkMuted }}
              >
                {axis.titleKo}
              </span>
            </span>
            <span
              className="text-sm"
              style={{ color: feedbackColors.radarFill }}
            >
              {axis.score === null
                ? "점수 없음"
                : `${axis.score} / ${axis.maxScore}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
