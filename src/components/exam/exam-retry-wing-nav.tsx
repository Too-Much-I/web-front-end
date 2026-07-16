"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { jua } from "@/lib/fonts";

/** 비교 힌트(pulse + 말풍선)가 자동으로 사라지기까지의 시간. */
const COMPARE_HINT_DURATION_MS = 8000;

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
 *
 * showCompareHint: "다시 답변하기" 채점이 끝나 새 회차로 자동 이동한 직후에만 true로 내려온다 —
 * 사용자가 "답변이 여러 개가 됐다"는 걸 확실히 아는 유일한 순간이라, 이때 한 번만 왼쪽 버튼에
 * pulse + 말풍선으로 회차 이동 버튼의 존재를 가르친다. 클릭하거나 일정 시간이 지나면 사라진다.
 */
export function ExamRetryWingNav({
  retryCount,
  totalRetryCount,
  onNavigate,
  showCompareHint = false,
}: {
  retryCount: number;
  totalRetryCount: number;
  onNavigate: (nextRetryCount: number) => void;
  showCompareHint?: boolean;
}) {
  // 피드백 스크린은 회차가 바뀔 때마다 key로 리마운트되므로, 힌트 표시 여부는 마운트 시점의
  // prop 값으로 초기화하면 충분하다 (마운트 후 false→true로 바뀌는 경로는 없다).
  const [isHintVisible, setIsHintVisible] = useState(showCompareHint);

  useEffect(() => {
    if (!showCompareHint) return;
    const timeoutId = setTimeout(
      () => setIsHintVisible(false),
      COMPARE_HINT_DURATION_MS,
    );
    return () => clearTimeout(timeoutId);
  }, [showCompareHint]);

  if (totalRetryCount <= 1) return null;

  const canGoPrev = retryCount > 0;
  const canGoNext = retryCount < totalRetryCount - 1;

  const wingButton =
    "flex size-11 items-center justify-center rounded-full bg-white text-blue-950 shadow-lg ring-1 ring-zinc-200 hover:bg-zinc-50";

  return (
    <>
      {canGoPrev && (
        <div className="fixed top-1/2 [left:max(0.75rem,calc(50%-24rem-3.25rem))] z-30 flex -translate-y-1/2 items-center gap-2 lg:[left:max(0.75rem,calc(50%-28rem-3.25rem))] xl:[left:max(0.75rem,calc(50%-32rem-3.25rem))]">
          <div className="relative">
            {isHintVisible && (
              <span
                aria-hidden
                className="absolute inset-0 animate-ping rounded-full bg-orange-400 opacity-60 motion-reduce:hidden"
              />
            )}
            <button
              type="button"
              aria-label="이전 시도 보기"
              onClick={() => {
                setIsHintVisible(false);
                onNavigate(retryCount - 1);
              }}
              className={`relative ${wingButton}`}
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
          </div>
          {isHintVisible && (
            <span
              className={`${jua.className} animate-[hint-pop-in_240ms_ease-out] rounded-xl bg-blue-950 px-3 py-2 text-xs whitespace-nowrap text-white shadow-lg motion-reduce:animate-none lg:text-sm`}
            >
              이전 답변과 비교해 보세요
            </span>
          )}
        </div>
      )}
      {canGoNext && (
        <button
          type="button"
          aria-label="다음 시도 보기"
          onClick={() => onNavigate(retryCount + 1)}
          className={`fixed top-1/2 z-30 -translate-y-1/2 ${wingButton} [right:max(0.75rem,calc(50%-24rem-3.25rem))] lg:[right:max(0.75rem,calc(50%-28rem-3.25rem))] xl:[right:max(0.75rem,calc(50%-32rem-3.25rem))]`}
        >
          <ChevronRight className="size-5" aria-hidden />
        </button>
      )}
    </>
  );
}
