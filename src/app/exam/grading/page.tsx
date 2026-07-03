"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { ExamHeader } from "@/components/exam/exam-header";
import { GradingWaitScreen } from "@/components/exam/grading-wait-screen";

function ExamGradingContent() {
  const searchParams = useSearchParams();
  const examId = searchParams.get("examId") ?? "";

  return (
    <div className="flex flex-1 flex-col bg-white">
      <ExamHeader label="채점 대기 중" />
      {examId ? (
        <GradingWaitScreen examId={examId} />
      ) : (
        <p className="flex flex-1 items-center justify-center text-sm text-zinc-500">
          잘못된 접근이에요. examId가 없어요.
        </p>
      )}
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
