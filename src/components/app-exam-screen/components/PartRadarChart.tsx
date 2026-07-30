"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

import type { RadarAxis } from "@/components/app-exam-screen/feedback-view-model";
import { feedbackColors } from "@/components/app-exam-screen/theme";

export function PartRadarChart({ axes }: { axes: readonly RadarAxis[] }) {
  const hasCompleteData = axes.every((axis) => axis.ratio !== null);

  return (
    <div>
      <div aria-hidden className="mx-auto h-[300px] w-full max-w-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={axes} outerRadius="68%">
            <PolarGrid stroke={feedbackColors.radarGrid} />
            <PolarAngleAxis
              dataKey="label"
              tick={{ fill: feedbackColors.chalkMuted, fontSize: 12 }}
            />
            <PolarRadiusAxis
              domain={[0, 1]}
              tickCount={5}
              tick={false}
              axisLine={false}
            />
            {hasCompleteData && (
              <Radar
                dataKey="ratio"
                stroke={feedbackColors.radarFill}
                strokeWidth={3}
                fill={feedbackColors.radarFill}
                fillOpacity={0.32}
                dot={{
                  r: 4.5,
                  fill: feedbackColors.radarPoint,
                  stroke: feedbackColors.chalk,
                  strokeWidth: 2,
                }}
                isAnimationActive={false}
              />
            )}
          </RadarChart>
        </ResponsiveContainer>
      </div>

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
