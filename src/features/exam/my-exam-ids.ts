/**
 * 이 브라우저에서 직접 응시한 시험의 examId 목록.
 *
 * 결과 리포트 URL은 examId만 알면 누구나 열 수 있어서(공유 기능도 이를 전제로 한다),
 * 설문 CTA·목표 등급 비교처럼 "응시자 본인"에게만 의미 있는 UI를 공유받은 사람에게
 * 숨기는 용도로 쓴다. 같은 브라우저면 구분할 수 없는 가벼운 휴리스틱이며, 보안 장치가 아니다.
 */
const STORAGE_KEY = "my-exam-ids";

/** 오래 쓴 브라우저에서 목록이 무한히 자라지 않도록 최근 응시분만 남긴다. */
const MAX_STORED_IDS = 30;

export function getStoredMyExamIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? "[]",
    );
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export function addStoredMyExamId(examId: string): void {
  if (typeof window === "undefined") return;
  const ids = getStoredMyExamIds();
  if (ids.includes(examId)) return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([...ids, examId].slice(-MAX_STORED_IDS)),
  );
}

export function isMyExamId(examId: string): boolean {
  return getStoredMyExamIds().includes(examId);
}
