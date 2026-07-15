"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

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
  onNavigateRetry,
}: {
  examId: string;
  questionNumber: number;
  retryCount: number;
  isTrial: boolean;
  onNavigateRetry: (nextRetryCount: number) => void;
}) {
  const [shownDetail, setShownDetail] = useState<ExamQuestionDetail | null>(null);
  const [outgoingDetail, setOutgoingDetail] = useState<ExamQuestionDetail | null>(null);
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
      <p className="flex flex-1 items-center justify-center text-sm text-red-500 lg:text-base">
        {error}
      </p>
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
          onNavigateRetry={onNavigateRetry}
        />
      </div>
    </div>
  );
}

function ExamQuestionFeedbackContent() {
  const searchParams = useSearchParams();
  const examId = searchParams.get("examId") ?? "";
  const questionNumber = Number(searchParams.get("questionNumber"));
  const hasValidParams = Boolean(examId) && Number.isInteger(questionNumber) && questionNumber > 0;
  const isTrial = searchParams.get("mode") === "trial";

  const [retryCount, setRetryCount] = useState(() =>
    parseRetryCount(searchParams.get("retryCount")),
  );

  // useSearchParams()는 실제 Next.js 라우터 내비게이션(예: ExamReanswerPanel의 router.replace)에만
  // 반응한다 — 날개 버튼이 쓰는 raw history.replaceState는 이 훅을 갱신하지 않으므로, 이 effect는
  // 오직 진짜 페이지 전환에서만 실행되어 로컬 state를 URL에 맞춰 동기화한다.
  useEffect(() => {
    const urlRetryCount = parseRetryCount(searchParams.get("retryCount"));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 실제 라우터 내비게이션(URL)에 로컬 state를 동기화하는 용도.
    setRetryCount((prev) => (prev === urlRetryCount ? prev : urlRetryCount));
  }, [searchParams]);

  // 날개 화살표로 회차를 넘기면 state를 바꾸는 동시에, 새로고침/공유 시에도 같은 회차를
  // 보게끔 URL도 맞춰준다. App Router의 router.push/replace는 항상 서버 왕복(재로드)이
  // 생기므로, 여기서는 history.replaceState로 URL만 조용히 바꾼다.
  function handleNavigateRetry(nextRetryCount: number) {
    setRetryCount(nextRetryCount);
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
          onNavigateRetry={handleNavigateRetry}
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
