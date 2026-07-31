"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import { ErrorFallbackScreen } from "@/components/error-fallback-screen";
import { ExamHeader } from "@/components/exam/exam-header";
import { ExamQuestionFeedbackScreen } from "@/components/exam/exam-question-feedback-screen";
import { getExamQuestionFeedback } from "@/features/exam/api/exam-question-feedback";
import type { ExamQuestionDetail } from "@/types/exam";

/** 잘못되거나 없는 값(예: "abc", 음수)은 최초 응시(0)로 취급한다. */
function parseRetryCount(raw: string | null): number {
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

/**
 * examId/questionNumber로만 key를 잡는다 — retryCount는 여기 포함하지 않아서, 회차만 바뀔 때는
 * 컴포넌트를 리마운트하지 않고 fetch가 끝날 때까지 이전 회차의 콘텐츠(shownDetail)를 그대로 보여준다
 * (대기 자체가 짧아 별도 로딩 표시는 없음). 새 데이터가 도착하는 순간 이전 콘텐츠는 사라지고
 * (outgoingDetail) 새 콘텐츠는 나타나는 크로스페이드로 교체한다.
 */
function ExamQuestionFeedbackLoader({
  examId,
  questionNumber,
  retryCount,
  isTrial,
  navigationSource,
  onNavigateRetry,
  showCompareHint,
}: {
  examId: string;
  questionNumber: number;
  retryCount: number;
  isTrial: boolean;
  navigationSource?: "app";
  onNavigateRetry: (
    nextRetryCount: number,
    options?: { fromReanswer?: boolean },
  ) => void;
  showCompareHint: boolean;
}) {
  const [shownDetail, setShownDetail] = useState<ExamQuestionDetail | null>(
    null,
  );
  const [outgoingDetail, setOutgoingDetail] =
    useState<ExamQuestionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** 지금 shownDetail로 표시 중인 데이터. 최신 값을 동기적으로 읽기 위한 ref (state는 다음 렌더까지 갱신되지 않음). */
  const shownDetailRef = useRef<ExamQuestionDetail | null>(null);

  useEffect(() => {
    let cancelled = false;
    getExamQuestionFeedback(examId, questionNumber, retryCount)
      .then((data) => {
        if (cancelled) return;
        setError(null);
        const prevShown = shownDetailRef.current;
        if (prevShown && prevShown.retryCount !== retryCount) {
          setOutgoingDetail(prevShown);
        }
        setShownDetail(data);
        shownDetailRef.current = data;
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("문제별 피드백 조회에 실패했어요", err);
        setError("문제별 피드백을 불러오지 못했어요.");
      });
    return () => {
      cancelled = true;
    };
  }, [examId, questionNumber, retryCount]);

  if (error) {
    return (
      <ErrorFallbackScreen
        description={`${error} 잠시 후 다시 시도해 주세요.`}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!shownDetail) {
    return (
      <p className="flex flex-1 items-center justify-center text-sm text-zinc-500 lg:text-base">
        불러오는 중이에요...
      </p>
    );
  }

  return (
    <div className="relative">
      {outgoingDetail && (
        <div
          key={`out-${outgoingDetail.retryCount}`}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 animate-[exam-page-fade-out_200ms_ease-in_forwards] motion-reduce:[animation-duration:0.01ms]"
          onAnimationEnd={() => setOutgoingDetail(null)}
        >
          <ExamQuestionFeedbackScreen
            examId={examId}
            detail={outgoingDetail}
            isTrial={isTrial}
            navigationSource={navigationSource}
            onNavigateRetry={onNavigateRetry}
          />
        </div>
      )}

      <div
        key={`in-${shownDetail.retryCount}`}
        className="animate-[exam-page-fade-in_220ms_ease-out] motion-reduce:[animation-duration:0.01ms]"
      >
        <ExamQuestionFeedbackScreen
          examId={examId}
          detail={shownDetail}
          isTrial={isTrial}
          navigationSource={navigationSource}
          onNavigateRetry={onNavigateRetry}
          showCompareHint={
            showCompareHint && shownDetail.retryCount === retryCount
          }
        />
      </div>
    </div>
  );
}

function ExamQuestionFeedbackContent() {
  const searchParams = useSearchParams();
  const examId = searchParams.get("examId") ?? "";
  const questionNumber = Number(searchParams.get("questionNumber"));
  const hasValidParams =
    Boolean(examId) && Number.isInteger(questionNumber) && questionNumber > 0;
  const isTrial = searchParams.get("mode") === "trial";
  const navigationSource =
    searchParams.get("source") === "app" ? "app" : undefined;

  /**
   * 회차는 URL만을 단일 소스로 쓴다 — 로컬 state로 복사해 두면 URL과 어긋날 수 있고,
   * 그걸 다시 맞추는 코드가 필요해진다.
   */
  const retryCount = parseRetryCount(searchParams.get("retryCount"));

  // "다시 답변하기" 채점 완료로 새 회차에 도착했는지 여부 — 도착 직후 날개 버튼 비교 힌트를
  // 한 번 보여주기 위한 신호. 날개 버튼 등 다른 경로로 이동하면 다시 꺼진다.
  // 이건 URL에 담을 일이 아닌 순수 화면 상태라 로컬 state로 둔다.
  const [showCompareHint, setShowCompareHint] = useState(false);

  /**
   * 날개 화살표(와 재답변 채점 완료)로 회차를 넘길 때 URL만 바꾼다.
   * App Router의 router.push/replace는 서버 왕복이 생기지만, 네이티브 History API는
   * Next가 가로채서 usePathname/useSearchParams만 갱신해 준다(next/dist/client/
   * components/app-router.js의 replaceState 패치 참고). 그래서 재로드 없이 위
   * retryCount가 새 값으로 다시 계산되고, 새로고침·공유 시에도 같은 회차를 보게 된다.
   *
   * push가 아니라 replace인 이유: 회차를 옮길 때마다 history가 쌓이면 뒤로가기가
   * 화면을 벗어나지 못하고 회차만 되짚게 된다.
   */
  function handleNavigateRetry(
    nextRetryCount: number,
    options?: { fromReanswer?: boolean },
  ) {
    setShowCompareHint(Boolean(options?.fromReanswer));
    const url = new URL(window.location.href);
    url.searchParams.set("retryCount", String(nextRetryCount));
    window.history.replaceState(null, "", url);
  }

  return (
    <div className="flex flex-1 flex-col bg-white">
      <ExamHeader label="문제별 피드백" confirmBeforeLeave />
      {!hasValidParams && (
        <p className="flex flex-1 items-center justify-center text-sm text-zinc-500 lg:text-base">
          잘못된 접근이에요. examId 또는 questionNumber가 없어요.
        </p>
      )}
      {hasValidParams && (
        <ExamQuestionFeedbackLoader
          key={`${examId}-${questionNumber}`}
          examId={examId}
          questionNumber={questionNumber}
          retryCount={retryCount}
          isTrial={isTrial}
          navigationSource={navigationSource}
          onNavigateRetry={handleNavigateRetry}
          showCompareHint={showCompareHint}
        />
      )}
    </div>
  );
}

export default function ExamQuestionFeedbackPage() {
  return (
    <Suspense fallback={null}>
      <ExamQuestionFeedbackContent />
    </Suspense>
  );
}
