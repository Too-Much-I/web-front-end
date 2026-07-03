"use client";

import { useEffect, useRef, useState } from "react";

import { getExamGradingStatus } from "@/features/exam/api/exam-grading-status";

/** 예상 대기 시간(45초)보다 여유 있게, 90초에 걸쳐 진행률을 채워나간다. */
const PROGRESS_DURATION_MS = 90_000;
/** 실제 완료 전까지는 100%로 보이지 않도록 상한을 둔다. */
const PROGRESS_CAP_PERCENT = 95;
const POLL_INTERVAL_MS = 3000;
/** 100%로 채워지는 트랜지션이 끝난 뒤 페이지를 이동시키기까지의 여유 시간. */
const COMPLETE_TRANSITION_MS = 700;
/** 이 시간 동안 계속 실패해야 진짜 문제로 간주한다. 그 전까지는 일시적인 네트워크 오류로 보고 조용히 재시도한다. */
const NETWORK_ERROR_TIMEOUT_MS = 120_000;

export function useGradingProgress(examId: string, onComplete: () => void) {
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let settled = false;
    let firstErrorAt: number | null = null;
    const startedAt = Date.now();

    const progressId = setInterval(() => {
      if (settled) return;
      const elapsed = Date.now() - startedAt;
      setProgress(Math.min(PROGRESS_CAP_PERCENT, (elapsed / PROGRESS_DURATION_MS) * 100));
    }, 300);

    const checkStatus = async () => {
      if (settled) return;
      try {
        const status = await getExamGradingStatus(examId);
        firstErrorAt = null;
        if (status.overallStatus === "COMPLETED") {
          settled = true;
          clearInterval(progressId);
          clearInterval(pollId);
          setProgress(100);
          setTimeout(() => onCompleteRef.current(), COMPLETE_TRANSITION_MS);
        } else if (status.overallStatus === "FAILED") {
          settled = true;
          clearInterval(progressId);
          clearInterval(pollId);
          setFailed(true);
        }
      } catch (err) {
        firstErrorAt ??= Date.now();
        if (Date.now() - firstErrorAt >= NETWORK_ERROR_TIMEOUT_MS) {
          console.error("채점 상태 조회가 계속 실패했어요", err);
          settled = true;
          clearInterval(progressId);
          clearInterval(pollId);
          setFailed(true);
        }
      }
    };

    const pollId = setInterval(checkStatus, POLL_INTERVAL_MS);
    void checkStatus();

    return () => {
      settled = true;
      clearInterval(progressId);
      clearInterval(pollId);
    };
  }, [examId]);

  return { progress, failed };
}
