import type {
  ExamQuestionDetail,
  ExamRetryFeedbackScore,
  ExamRetryScore,
} from "@/types/exam";

/** 세부 지표 만점. Azure Pronunciation Assessment 계열 지표라 0~100 스케일이다. */
export const METRIC_MAX = 100;

/** 지표 증감 막대가 최대 길이로 뻗는 기준의 하한.
 * 이걸 두지 않으면 전부 1~2점만 움직인 회차에서 +1이 최대 길이 막대가 되어 큰 향상처럼 읽힌다. */
const MIN_DELTA_SCALE = 10;

export interface MetricRow {
  label: string;
  /** 채점 대상이 아닌 지표(Part 1의 내용 적합성 등)는 null로 내려온다. */
  value: number | null;
  /** 첫 회차 대비 증감. 첫 회차를 보고 있거나 비교 불가면 null. */
  delta: number | null;
}

export interface MetricGroup {
  title: string;
  rows: MetricRow[];
}

/** 소수 점수를 다루므로 정수면 정수로, 아니면 소수 한 자리로 적는다. */
export function formatScore(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function formatDelta(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  if (rounded > 0) return `+${formatScore(rounded)}`;
  if (rounded < 0) return formatScore(rounded);
  return "—";
}

export type DeltaTone = "up" | "down" | "same";

export function deltaTone(value: number): DeltaTone {
  const rounded = Math.round(value * 10) / 10;
  if (rounded > 0) return "up";
  if (rounded < 0) return "down";
  return "same";
}

/**
 * 그래프에 쓸 회차별 총점.
 * retryScores가 비어 있는(재시도 기능 이전에 채점된) 응답에서는 지금 보고 있는 회차
 * 하나만으로 배열을 만들어, 화면이 "점 하나짜리 그래프"로 정상 동작하게 한다.
 */
export function getRetryScores(detail: ExamQuestionDetail): ExamRetryScore[] {
  if (detail.retryScores.length > 0) return detail.retryScores;
  return [{ retryCount: detail.retryCount, score: detail.score }];
}

/** 회차 인덱스(0-base)를 retryScores 배열의 위치로 바꾼다. 없으면 -1. */
export function indexOfRetryCount(
  scores: ExamRetryScore[],
  retryCount: number,
): number {
  return scores.findIndex((item) => item.retryCount === retryCount);
}

function findFeedbackScore(
  detail: ExamQuestionDetail,
  retryCount: number,
): ExamRetryFeedbackScore | null {
  return (
    detail.retryFeedbackScores.find((item) => item.retryCount === retryCount) ??
    null
  );
}

/**
 * 지금 보고 있는 회차의 지표를 API가 나눠 놓은 대로 두 묶음으로 만든다.
 * 완전성은 Part 1(낭독)에만, 내용 적합성은 Part 2~5에만 의미가 있어 파트로 갈라 낸다 —
 * 웹 화면(exam-question-feedback-screen.tsx)이 쓰는 규칙과 같다.
 *
 * retryFeedbackScores에 해당 회차가 없으면 detail.feedback의 값으로 대신 채운다.
 * 그 경우 비교 대상도 없으므로 delta는 전부 null이 된다.
 */
export function buildMetricGroups(
  detail: ExamQuestionDetail,
  retryCount: number,
): MetricGroup[] {
  const current = findFeedbackScore(detail, retryCount);
  const baseline = detail.retryFeedbackScores[0] ?? null;
  const isBaseline = baseline === null || baseline.retryCount === retryCount;

  const currentDetailed =
    current?.detailedScores ?? detail.feedback.detailedScores;
  const currentPronunciationFluency =
    current?.pronunciationFluencyScore ?? null;
  const currentContentRelevance =
    current?.contentRelevanceScore ?? detail.feedback.contentRelevanceScore;

  function toRow(
    label: string,
    value: number | null,
    baseValue: number | null,
  ): MetricRow {
    const comparable =
      !isBaseline && current !== null && value !== null && baseValue !== null;
    return {
      label,
      value,
      delta: comparable ? value - baseValue : null,
    };
  }

  const voiceRows: MetricRow[] = [
    toRow(
      "발음 정확도",
      currentDetailed.accuracyScore,
      baseline?.detailedScores.accuracyScore ?? null,
    ),
    toRow(
      "유창성",
      currentDetailed.fluencyScore,
      baseline?.detailedScores.fluencyScore ?? null,
    ),
    toRow(
      "억양·강세",
      currentDetailed.prosodyScore,
      baseline?.detailedScores.prosodyScore ?? null,
    ),
  ];
  if (detail.partNumber === 1) {
    voiceRows.push(
      toRow(
        "완전성",
        currentDetailed.completenessScore,
        baseline?.detailedScores.completenessScore ?? null,
      ),
    );
  }

  return [
    {
      title: "평가 항목",
      rows: [
        toRow(
          "발음·유창성",
          currentPronunciationFluency,
          baseline?.pronunciationFluencyScore ?? null,
        ),
        toRow(
          "내용 적합성",
          currentContentRelevance,
          baseline?.contentRelevanceScore ?? null,
        ),
      ],
    },
    { title: "음성 분석", rows: voiceRows },
  ];
}

/** 증감 막대 길이를 정할 기준값 — 그 화면 안에서 가장 큰 변화 폭(하한 적용). */
export function getDeltaScale(groups: MetricGroup[]): number {
  const peak = groups.reduce((max, group) => {
    const groupPeak = group.rows.reduce(
      (rowMax, row) =>
        row.delta === null ? rowMax : Math.max(rowMax, Math.abs(row.delta)),
      0,
    );
    return Math.max(max, groupPeak);
  }, 0);
  return Math.max(MIN_DELTA_SCALE, peak);
}
