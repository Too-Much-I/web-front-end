"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { ExamHeader } from "@/components/exam/exam-header";
import { ExamQuestionFeedbackScreen } from "@/components/exam/exam-question-feedback-screen";
import { getExamQuestionFeedback } from "@/features/exam/api/exam-question-feedback";
import type { ExamQuestionDetail } from "@/types/exam";

function ExamQuestionFeedbackContent() {
  const searchParams = useSearchParams();
  const examId = searchParams.get("examId") ?? "";
  const questionNumber = Number(searchParams.get("questionNumber"));
  const hasValidParams = Boolean(examId) && Number.isInteger(questionNumber) && questionNumber > 0;

  const [detail, setDetail] = useState<ExamQuestionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isLoading = hasValidParams && !detail && !error;

  useEffect(() => {
    if (!hasValidParams) return;
    let cancelled = false;
    getExamQuestionFeedback(examId, questionNumber)
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
  }, [examId, questionNumber, hasValidParams]);

  return (
    <div className="flex flex-1 flex-col bg-white">
      <ExamHeader label="문제별 피드백" />
      {!hasValidParams && (
        <p className="flex flex-1 items-center justify-center text-sm text-zinc-500">
          잘못된 접근이에요. examId 또는 questionNumber가 없어요.
        </p>
      )}
      {isLoading && (
        <p className="flex flex-1 items-center justify-center text-sm text-zinc-500">
          불러오는 중이에요...
        </p>
      )}
      {error && (
        <p className="flex flex-1 items-center justify-center text-sm text-red-500">{error}</p>
      )}
      {detail && <ExamQuestionFeedbackScreen examId={examId} detail={detail} />}
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
