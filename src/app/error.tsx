"use client";

import { useEffect } from "react";

import { ErrorFallbackScreen } from "@/components/error-fallback-screen";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("예상하지 못한 오류가 발생했어요", error);
  }, [error]);

  return (
    <ErrorFallbackScreen
      title="예상하지 못한 문제가 생겼어요"
      description="일시적인 오류일 수 있어요. 잠시 후 다시 시도해 주세요."
      onRetry={reset}
    />
  );
}
