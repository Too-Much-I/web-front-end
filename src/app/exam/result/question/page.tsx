"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { ExamHeader } from "@/components/exam/exam-header";
import { ExamQuestionFeedbackScreen } from "@/components/exam/exam-question-feedback-screen";
import { getExamQuestionFeedback } from "@/features/exam/api/exam-question-feedback";
import type { ExamQuestionDetail } from "@/types/exam";

/**
 * examId/questionNumber/retryCount로 key를 잡아 부모에서 마운트한다 — 회차가 바뀌면 이 컴포넌트가
 * 통째로 새로 마운트되면서 detail/error가 자연스럽게 초기화된다(effect 안에서 직접 리셋할 필요 없음).
 */
function ExamQuestionFeedbackLoader({
  examId,
  questionNumber,
  retryCount,
  onNavigateRetry,
}: {
  examId: string;
  questionNumber: number;
  retryCount: number;
  onNavigateRetry: (nextRetryCount: number) => void;
}) {
  const [detail, setDetail] = useState<ExamQuestionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getExamQuestionFeedback(examId, questionNumber, retryCount)
      .then((data) => {
        if (!cancelled) setDetail(data);
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

  if (!detail) {
    return (
      <p className="flex flex-1 items-center justify-center text-sm text-zinc-500 lg:text-base">
        불러오는 중이에요...
      </p>
    );
  }

  return (
    <ExamQuestionFeedbackScreen
      examId={examId}
      detail={detail}
      onNavigateRetry={onNavigateRetry}
    />
  );
}

function ExamQuestionFeedbackContent() {
  const searchParams = useSearchParams();
  const examId = searchParams.get("examId") ?? "";
  const questionNumber = Number(searchParams.get("questionNumber"));
  const hasValidParams = Boolean(examId) && Number.isInteger(questionNumber) && questionNumber > 0;

  // 날개 화살표로 회차를 넘기면 이 state만 바뀐다 — URL은 최초 진입 시의 회차만 담당한다.
  const [retryCount, setRetryCount] = useState(() =>
    Number(searchParams.get("retryCount") ?? "0"),
  );

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
          key={`${examId}-${questionNumber}-${retryCount}`}
          examId={examId}
          questionNumber={questionNumber}
          retryCount={retryCount}
          onNavigateRetry={setRetryCount}
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
