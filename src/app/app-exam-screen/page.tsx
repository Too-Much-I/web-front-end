"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { AppExamScreen } from "@/components/app-exam-screen/FeedbackScreen";
import { ErrorFallbackScreen } from "@/components/error-fallback-screen";
import { getExamGradingResult } from "@/features/exam/api/exam-grading-result";

const FEEDBACK_STEP_COUNT = 3;

function parseInitialStep(raw: string | null): number {
  const step = Number(raw);
  return Number.isInteger(step) && step >= 1 && step <= FEEDBACK_STEP_COUNT
    ? step - 1
    : 0;
}

function AppExamScreenContent() {
  const searchParams = useSearchParams();
  const examId = searchParams.get("examId") ?? "";
  const initialStep = parseInitialStep(searchParams.get("step"));
  const {
    data: result,
    error,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ["exam-grading-result", examId],
    queryFn: () => getExamGradingResult(examId),
    enabled: Boolean(examId),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  if (!examId) {
    return (
      <p className="flex min-h-dvh items-center justify-center text-sm text-zinc-500">
        잘못된 접근이에요. examId가 없어요.
      </p>
    );
  }

  if (error) {
    return (
      <ErrorFallbackScreen
        description="채점 결과를 불러오지 못했어요. 잠시 후 다시 시도해 주세요."
        onRetry={() => void refetch()}
      />
    );
  }

  if (isPending || !result) {
    return (
      <p className="flex min-h-dvh items-center justify-center text-sm text-zinc-500">
        불러오는 중이에요...
      </p>
    );
  }

  return <AppExamScreen result={result} initialStep={initialStep} />;
}

export default function AppExamScreenPage() {
  return (
    <Suspense fallback={null}>
      <AppExamScreenContent />
    </Suspense>
  );
}
