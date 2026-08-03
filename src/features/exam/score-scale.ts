/**
 * 문제별 피드백 지표의 만점 정의. 지표마다 스케일이 달라서, 원점수를 그대로 나란히
 * 놓으면(예: 발음 정확도 85와 내용 적합성 2.5) 서로 비교되지 않는다.
 * 웹 상세 피드백과 앱 재시도 지표 모두 여기서 만점을 가져와 "만점 대비 %"로 환산해 보여준다.
 */

/** detailedScores(정확도/유창성/완전성/운율)는 Azure Pronunciation Assessment 계열이라 0~100점. */
export const DETAILED_SCORE_MAX = 100;

/**
 * pronunciationFluencyScore도 0~100 스케일로 관측된다.
 * 스웨거에 만점이 명시돼 있지 않아 실측 기준이며, 다른 스케일이 확인되면 여기만 고치면 된다.
 */
export const PRONUNCIATION_FLUENCY_MAX = 100;

/** contentRelevanceScore의 만점은 파트마다 다르다 (Part 1은 채점 대상이 아니라 null로 내려옴). */
const CONTENT_RELEVANCE_MAX: Record<number, number> = {
  2: 2.5,
  3: 2.5,
  4: 2.5,
  5: 4,
};

/** 내용 적합성 만점. 채점 대상이 아닌 파트(Part 1)나 미지의 파트면 null. */
export function getContentRelevanceMax(partNumber: number): number | null {
  return CONTENT_RELEVANCE_MAX[partNumber] ?? null;
}

/**
 * 점수를 만점 대비 0~100 비율로 바꾼다.
 * 미채점(null)이거나 만점을 알 수 없으면 null을 흘려보내, 소비하는 쪽이
 * 0%가 아니라 "미채점" 플레이스홀더를 그리게 한다.
 */
export function toScorePercent(
  score: number | null,
  max: number | null,
): number | null {
  if (score === null || max === null || max <= 0) return null;
  return Math.min(100, Math.max(0, (score / max) * 100));
}
