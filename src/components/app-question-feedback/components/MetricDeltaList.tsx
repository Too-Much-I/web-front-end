"use client";

import { feedbackColors } from "@/components/app-exam-screen/theme";
import {
  METRIC_MAX,
  deltaTone,
  formatDelta,
  formatScore,
  getDeltaScale,
  type MetricGroup,
  type MetricRow,
} from "@/components/app-question-feedback/retry-view-model";

/** 막대가 기준선에서 한쪽으로 뻗을 수 있는 최대 폭(트랙 전체의 절반보다 살짝 작게). */
const MAX_HALF_WIDTH = 48;

const TONE_COLOR = {
  up: feedbackColors.radarFill,
  down: "#FDA4AF",
  same: "rgb(255 255 255 / 45%)",
} as const;

/**
 * 첫 회차 대비 지표 증감.
 * 값 자체가 아니라 "얼마나 늘었나"만 보여주면 되므로 가운데 기준선에서 좌우로 뻗는
 * 막대로 그린다 — 길이가 변화 폭, 방향이 부호라 숫자를 읽기 전에 형태로 먼저 파악된다.
 *
 * 첫 회차를 보고 있을 때는 비교 대상이 없다. 이때 전부 "—"만 뜨면 고장난 화면처럼
 * 보이므로, 대신 그 회차의 지표 값 자체를 0부터 채우는 막대로 보여준다.
 */
export function MetricDeltaList({ groups }: { groups: MetricGroup[] }) {
  const scale = getDeltaScale(groups);
  const isBaseline = groups.every((group) =>
    group.rows.every((row) => row.delta === null),
  );

  return (
    <div className="flex w-full flex-col gap-2.5 pt-1 text-left">
      {groups.map((group) => (
        <div key={group.title} className="flex flex-col gap-2.5">
          <p
            className="text-[10px] font-bold tracking-[0.12em]"
            style={{ color: "rgb(255 255 255 / 38%)" }}
          >
            {group.title}
          </p>
          {group.rows.map((row) => (
            <MetricDeltaRow
              key={row.label}
              row={row}
              scale={scale}
              showAbsolute={isBaseline}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function MetricDeltaRow({
  row,
  scale,
  showAbsolute,
}: {
  row: MetricRow;
  scale: number;
  showAbsolute: boolean;
}) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr_3rem] items-center gap-2">
      <span
        className="text-[11px] leading-tight font-semibold"
        style={{ color: "rgb(255 255 255 / 62%)" }}
      >
        {row.label}
      </span>
      <span
        className="relative block h-[18px] rounded-md"
        style={{ backgroundColor: "rgb(255 255 255 / 8%)" }}
      >
        <MetricDeltaBar row={row} scale={scale} showAbsolute={showAbsolute} />
      </span>
      <MetricDeltaValue row={row} showAbsolute={showAbsolute} />
    </div>
  );
}

function MetricDeltaBar({
  row,
  scale,
  showAbsolute,
}: {
  row: MetricRow;
  scale: number;
  showAbsolute: boolean;
}) {
  // 채점 대상이 아닌 지표는 막대 없이 트랙만 비워 둔다.
  if (row.value === null) return null;

  if (showAbsolute) {
    return (
      <>
        <span
          className="absolute inset-y-[-2px] left-0 w-px"
          style={{ backgroundColor: "rgb(255 255 255 / 30%)" }}
        />
        <span
          className="absolute inset-y-1 left-0 rounded"
          style={{
            width: `${(row.value / METRIC_MAX) * 100}%`,
            backgroundColor: feedbackColors.radarFill,
          }}
        />
      </>
    );
  }

  if (row.delta === null) return null;

  const rounded = Math.round(row.delta * 10) / 10;
  const tone = deltaTone(rounded);
  const halfWidth = (Math.abs(rounded) / scale) * MAX_HALF_WIDTH;

  return (
    <>
      <span
        className="absolute inset-y-[-2px] left-1/2 w-px"
        style={{ backgroundColor: "rgb(255 255 255 / 30%)" }}
      />
      {rounded === 0 ? (
        <span
          className="absolute inset-y-1 left-[calc(50%-3px)] w-1.5 rounded"
          style={{ backgroundColor: "rgb(255 255 255 / 28%)" }}
        />
      ) : (
        <span
          className="absolute inset-y-1 rounded"
          style={{
            width: `${halfWidth.toFixed(1)}%`,
            backgroundColor: TONE_COLOR[tone],
            ...(rounded > 0 ? { left: "50%" } : { right: "50%" }),
          }}
        />
      )}
    </>
  );
}

function MetricDeltaValue({
  row,
  showAbsolute,
}: {
  row: MetricRow;
  showAbsolute: boolean;
}) {
  if (row.value === null) {
    return (
      <span className="text-right text-sm" style={{ color: TONE_COLOR.same }}>
        미채점
      </span>
    );
  }

  if (showAbsolute) {
    return (
      <span
        className="text-right text-sm font-bold tabular-nums"
        style={{ color: feedbackColors.radarFill }}
      >
        {formatScore(row.value)}
      </span>
    );
  }

  if (row.delta === null) return <span aria-hidden />;

  const tone = deltaTone(row.delta);
  return (
    <span
      className={`text-right text-sm tabular-nums ${
        tone === "same" ? "" : "font-bold"
      }`}
      style={{ color: TONE_COLOR[tone] }}
    >
      {formatDelta(row.delta)}
    </span>
  );
}
