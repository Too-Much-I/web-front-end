"use client";

import type { BaseTickContentProps, DotItemDotProps } from "recharts";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { getExamPartMeta } from "@/features/exam/part-meta";
import type { ExamPartScores } from "@/types/exam";

const ACCENT = "#f97316";

/** TOEIC Speaking 파트별 배점 (Part1~2: 6점, Part3~4: 9점, Part5: 5점) */
const PART_MAX_SCORES: Record<number, number> = {
  1: 6,
  2: 6,
  3: 9,
  4: 9,
  5: 5,
};

interface PartScoreDatum {
  partNumber: number;
  partLabel: string;
  score: number | null;
  maxScore: number;
  percent: number;
}

function buildChartData(partScores: ExamPartScores): PartScoreDatum[] {
  return ([1, 2, 3, 4, 5] as const).map((partNumber) => {
    const maxScore = PART_MAX_SCORES[partNumber];
    const score = partScores[`part${partNumber}` as keyof ExamPartScores] ?? null;
    return {
      partNumber,
      partLabel: `Part ${partNumber}`,
      score,
      maxScore,
      percent: score === null ? 0 : Math.min(100, Math.max(0, (score / maxScore) * 100)),
    };
  });
}

function AngleTick(chartData: PartScoreDatum[]) {
  const topPercent = Math.max(...chartData.map((d) => d.percent));

  return function renderTick(props: BaseTickContentProps) {
    const { x, y, index, textAnchor } = props;
    const datum = chartData[index];
    const isTop = datum.percent > 0 && datum.percent === topPercent;

    return (
      <g>
        <text
          x={x}
          y={y}
          textAnchor={textAnchor}
          fontSize={13}
          fontWeight={isTop ? 700 : 500}
          fill={isTop ? ACCENT : "#71717a"}
        >
          {datum.partLabel}
        </text>
        <text
          x={x}
          y={Number(y) + 15}
          textAnchor={textAnchor}
          fontSize={11}
          fill="#a1a1aa"
        >
          {datum.score === null ? "미채점" : `${datum.score} / ${datum.maxScore}점`}
        </text>
      </g>
    );
  };
}

function ScoreDot(props: DotItemDotProps) {
  const { cx, cy, payload } = props;
  const datum = payload as PartScoreDatum;

  if (datum.score === null) {
    return <circle cx={cx} cy={cy} r={3} fill="#d4d4d8" />;
  }

  return (
    <g>
      <circle cx={cx} cy={cy} r={3} fill={ACCENT} />
      <text
        x={cx}
        y={Number(cy) - 8}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill={ACCENT}
      >
        {datum.score}
      </text>
    </g>
  );
}

function RadarTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: PartScoreDatum }[];
}) {
  if (!active || !payload?.length) return null;
  const datum = payload[0].payload;

  return (
    <div className="rounded-lg bg-white px-3 py-2 text-xs shadow-md ring-1 ring-zinc-200">
      <p className="font-semibold text-blue-950">{datum.partLabel}</p>
      <p className="mt-0.5 text-zinc-500">
        {datum.score === null ? "아직 채점되지 않았어요" : `${datum.score} / ${datum.maxScore}점`}
      </p>
    </div>
  );
}

/** 채점된 파트를 점수순으로 정렬해 상/하위 파트를 강점·보완 필요로 나눈다 (가운데 파트는 제외). */
function buildStrengthWeakness(chartData: PartScoreDatum[]) {
  const scored = chartData.filter((d) => d.score !== null);
  const sorted = [...scored].sort((a, b) => b.percent - a.percent);
  const highlightCount = Math.floor(sorted.length / 2);

  const toLabels = (data: PartScoreDatum[]) =>
    data.map((d) => getExamPartMeta(d.partNumber).titleKo);

  return {
    strengths: highlightCount > 0 ? toLabels(sorted.slice(0, highlightCount)) : [],
    weaknesses: highlightCount > 0 ? toLabels(sorted.slice(-highlightCount)) : [],
  };
}

export function ExamPartScoreRadar({ partScores }: { partScores: ExamPartScores }) {
  const chartData = buildChartData(partScores);
  const { strengths, weaknesses } = buildStrengthWeakness(chartData);

  return (
    <div className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-zinc-100">
      <span className="text-sm font-bold text-blue-950">파트별 세부 점수</span>

      <div className="mt-2 h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} outerRadius="65%">
            <PolarGrid stroke="#e4e4e7" />
            <PolarAngleAxis dataKey="partLabel" tick={AngleTick(chartData)} />
            <PolarRadiusAxis
              domain={[0, 100]}
              tickCount={5}
              tick={false}
              axisLine={false}
            />
            <Radar
              name="내 점수"
              dataKey="percent"
              stroke={ACCENT}
              fill={ACCENT}
              fillOpacity={0.35}
              dot={ScoreDot}
              isAnimationActive={false}
            />
            <Tooltip content={<RadarTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {(strengths.length > 0 || weaknesses.length > 0) && (
        <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
          <div>
            <p className="text-xs font-semibold text-emerald-600">강점</p>
            <p className="mt-1 text-sm font-medium text-zinc-700">
              {strengths.length > 0 ? strengths.join(", ") : "-"}
            </p>
          </div>
          <div className="border-l border-zinc-200 pl-3">
            <p className="text-xs font-semibold text-rose-600">보완 필요</p>
            <p className="mt-1 text-sm font-medium text-zinc-700">
              {weaknesses.length > 0 ? weaknesses.join(", ") : "-"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
