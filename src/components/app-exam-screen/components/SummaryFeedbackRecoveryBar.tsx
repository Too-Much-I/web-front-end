"use client";

import { LoaderCircle, RefreshCw, TriangleAlert } from "lucide-react";

import type { SummaryFeedbackRecovery } from "@/features/exam/use-summary-feedback-retry";

function RecoveryLoadingStatus({ children }: { children: React.ReactNode }) {
  return (
    <div role="status" className="px-5 py-3">
      <div className="flex items-center gap-3">
        <LoaderCircle
          aria-hidden
          className="size-5 shrink-0 animate-spin text-orange-600 motion-reduce:animate-none"
        />
        <p className="text-sm text-blue-950">{children}</p>
      </div>
      <div
        aria-hidden
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-orange-100"
      >
        <div className="summary-feedback-loading-bar h-full w-2/5 rounded-full bg-orange-500" />
      </div>
    </div>
  );
}

export function SummaryFeedbackRecoveryBar({
  recovery,
}: {
  recovery: SummaryFeedbackRecovery;
}) {
  if (recovery.state === "complete") return null;

  if (recovery.state === "retry-requesting") {
    return (
      <RecoveryLoadingStatus>
        재생성 요청을 접수하고 있어요.
      </RecoveryLoadingStatus>
    );
  }

  if (recovery.state === "retry-polling") {
    return (
      <RecoveryLoadingStatus>
        종합 피드백을 만들고 있어요. 결과는 계속 볼 수 있어요.
      </RecoveryLoadingStatus>
    );
  }

  if (recovery.state === "retry-failed") {
    return (
      <div role="status" className="flex items-start gap-3 px-5 py-3">
        <TriangleAlert
          aria-hidden
          className="mt-0.5 size-5 shrink-0 text-red-600"
        />
        <p className="text-sm leading-5 text-blue-950">
          종합 피드백을 다시 만들지 못했어요. 현재 결과와 문제별 피드백은 계속
          확인할 수 있어요.
        </p>
      </div>
    );
  }

  if (!recovery.supportsRetry) {
    return (
      <div role="status" className="flex items-start gap-3 px-5 py-3">
        <TriangleAlert
          aria-hidden
          className="mt-0.5 size-5 shrink-0 text-orange-600"
        />
        <p className="text-sm leading-5 text-blue-950">
          앱을 업데이트하면 종합 피드백을 다시 생성할 수 있어요.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3">
      <p className="text-sm leading-5 text-blue-950">
        일부 종합 피드백이 아직 준비되지 않았어요.
      </p>
      <button
        type="button"
        onClick={recovery.requestRetry}
        className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-2xl bg-orange-500 px-3 py-2 text-sm text-white"
      >
        <RefreshCw aria-hidden size={16} />
        다시 생성
      </button>
    </div>
  );
}
