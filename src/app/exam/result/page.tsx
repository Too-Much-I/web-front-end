"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { ExamHeader } from "@/components/exam/exam-header";
import { ExamResultScreen } from "@/components/exam/exam-result-screen";
import { getExamGradingResult } from "@/features/exam/api/exam-grading-result";
import type { ExamGradingResult } from "@/types/exam";

function ExamResultContent() {
  const searchParams = useSearchParams();
  const examId = searchParams.get("examId") ?? "";

  const [result, setResult] = useState<ExamGradingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isLoading = Boolean(examId) && !result && !error;

  useEffect(() => {
    if (!examId) return;
    let cancelled = false;
    getExamGradingResult(examId)
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("채점 결과 조회에 실패했어요", err);
        setError("채점 결과를 불러오지 못했어요.");
      });
    return () => {
      cancelled = true;
    };
  }, [examId]);

  return (
    <div className="flex flex-1 flex-col bg-white">
      <ExamHeader label="채점 결과" />
      {!examId && (
        <p className="flex flex-1 items-center justify-center text-sm text-zinc-500 lg:text-base">
          잘못된 접근이에요. examId가 없어요.
        </p>
      )}
      {isLoading && (
        <p className="flex flex-1 items-center justify-center text-sm text-zinc-500 lg:text-base">
          불러오는 중이에요...
        </p>
      )}
      {error && (
        <p className="flex flex-1 items-center justify-center text-sm text-red-500 lg:text-base">
          {error}
        </p>
      )}
      {result && <ExamResultScreen result={result} />}
    </div>
  );
}

export default function ExamResultPage() {
  return (
    <Suspense fallback={null}>
      <ExamResultContent />
    </Suspense>
  );
}
