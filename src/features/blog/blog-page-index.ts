/**
 * 페이지 번호 기준 변환.
 *
 * 백엔드 목록/검색/댓글 API는 페이지를 0-base로 받고 돌려주지만(`?page=0`이 첫 페이지),
 * 앱은 URL(`/blog/page/2`)과 페이지네이션 UI가 모두 1-base다. 두 기준이 섞이면
 * 한 칸씩 밀린 목록이 조용히 나가므로, 변환은 여기 두 함수로만 한다.
 */

/** 앱 기준(1-base) → 백엔드 기준(0-base). */
export function toApiPage(page: number): number {
  return Math.max(0, Math.trunc(page) - 1);
}

/** 백엔드 기준(0-base) → 앱 기준(1-base). */
export function toAppPage(page: number): number {
  return page + 1;
}
