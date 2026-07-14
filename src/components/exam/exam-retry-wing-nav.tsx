"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * 회차 이동 버튼. 카드 좌우에 "날개"처럼 뷰포트에 고정되어 스크롤 위치와 무관하게 항상 눌를 수 있다.
 * 표시 여부는 탭 활성 상태가 아니라 totalRetryCount(재시도 기록 존재 여부)로만 결정한다.
 *
 * totalRetryCount는 최초 응시를 포함한 전체 시도 "횟수"(1부터 시작 — 재시도가 전혀 없어도 1)이고,
 * retryCount는 0-base 인덱스다. 그래서 유효한 마지막 인덱스는 totalRetryCount - 1이며,
 * canGoNext는 retryCount < totalRetryCount가 아니라 retryCount < totalRetryCount - 1로 비교해야 한다.
 * (실제 백엔드 응답으로 확인됨: 재시도 0회인 문제도 totalRetryCount=1로 내려온다.)
 *
 * 넓은 화면에서는 뷰포트의 진짜 좌우 끝이 아니라 본문 컬럼(max-w-3xl~5xl) 바로 바깥에 붙도록
 * max()로 앵커링하고, 좁은 화면에서는 최소 0.75rem을 띄워 엣지 스와이프 뒤로가기 제스처와
 * 겹치지 않게 한다.
 */
export function ExamRetryWingNav({
  retryCount,
  totalRetryCount,
  onNavigate,
}: {
  retryCount: number;
  totalRetryCount: number;
  onNavigate: (nextRetryCount: number) => void;
}) {
  if (totalRetryCount <= 1) return null;

  const canGoPrev = retryCount > 0;
  const canGoNext = retryCount < totalRetryCount - 1;

  const wingBase =
    "fixed top-1/2 z-30 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-blue-950 shadow-lg ring-1 ring-zinc-200 hover:bg-zinc-50";

  return (
    <>
      {canGoPrev && (
        <button
          type="button"
          aria-label="이전 시도 보기"
          onClick={() => onNavigate(retryCount - 1)}
          className={`${wingBase} [left:max(0.75rem,calc(50%-24rem-3.25rem))] lg:[left:max(0.75rem,calc(50%-28rem-3.25rem))] xl:[left:max(0.75rem,calc(50%-32rem-3.25rem))]`}
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>
      )}
      {canGoNext && (
        <button
          type="button"
          aria-label="다음 시도 보기"
          onClick={() => onNavigate(retryCount + 1)}
          className={`${wingBase} [right:max(0.75rem,calc(50%-24rem-3.25rem))] lg:[right:max(0.75rem,calc(50%-28rem-3.25rem))] xl:[right:max(0.75rem,calc(50%-32rem-3.25rem))]`}
        >
          <ChevronRight className="size-5" aria-hidden />
        </button>
      )}
    </>
  );
}
