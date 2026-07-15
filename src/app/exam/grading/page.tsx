"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { ExamHeader } from "@/components/exam/exam-header";
import {
  GradingWaitScreen,
  TrialGradingWaitScreen,
} from "@/components/exam/grading-wait-screen";

function ExamGradingContent() {
  const searchParams = useSearchParams();
  const examId = searchParams.get("examId") ?? "";
  const isTrial = searchParams.get("mode") === "trial";
  const questionNumber = Number(searchParams.get("questionNumber"));
  const hasValidQuestionNumber = Number.isInteger(questionNumber) && questionNumber > 0;

  return (
    <div className="flex flex-1 flex-col bg-white">
      <ExamHeader label="채점 대기 중" />
      {!examId && (
        <p className="flex flex-1 items-center justify-center text-sm text-zinc-500 lg:text-base">
          잘못된 접근이에요. examId가 없어요.
        </p>
      )}
      {examId && isTrial && hasValidQuestionNumber && (
        <TrialGradingWaitScreen examId={examId} questionNumber={questionNumber} />
      )}
      {examId && isTrial && !hasValidQuestionNumber && (
        <p className="flex flex-1 items-center justify-center text-sm text-zinc-500 lg:text-base">
          잘못된 접근이에요. questionNumber가 없어요.
        </p>
      )}
      {examId && !isTrial && <GradingWaitScreen examId={examId} />}
    </div>
  );
}

export default function ExamGradingPage() {
  return (
    <Suspense fallback={null}>
      <ExamGradingContent />
    </Suspense>
  );
}
