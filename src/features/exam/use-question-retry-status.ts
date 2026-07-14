"use client";

import { useEffect, useRef } from "react";

import { getExamQuestionStatus } from "@/features/exam/api/exam-question-status";

const POLL_INTERVAL_MS = 3000;
/** 이 시간 동안 계속 실패해야 진짜 문제로 간주한다. 그 전까지는 일시적인 네트워크 오류로 보고 조용히 재시도한다. */
const NETWORK_ERROR_TIMEOUT_MS = 60_000;

/**
 * 문제별 "다시 답변하기" 제출 후, 해당 회차(retryCount) 채점이 끝날 때까지 폴링한다.
 * retryCount가 null이면(아직 제출 전) 폴링하지 않는다.
 */
export function useQuestionRetryStatus(
  examId: string,
  questionNumber: number,
  retryCount: number | null,
  onComplete: () => void,
  onFailed: () => void,
): void {
  const onCompleteRef = useRef(onComplete);
  const onFailedRef = useRef(onFailed);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onFailedRef.current = onFailed;
  }, [onComplete, onFailed]);

  useEffect(() => {
    if (retryCount === null) return;

    let settled = false;
    let firstErrorAt: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const checkStatus = async () => {
      if (settled) return;
      try {
        const result = await getExamQuestionStatus(examId, questionNumber, retryCount);
        if (settled) return;
        firstErrorAt = null;
        if (result.status === "COMPLETED") {
          settled = true;
          onCompleteRef.current();
        } else if (result.status === "FAILED") {
          settled = true;
          onFailedRef.current();
        }
      } catch (err) {
        if (settled) return;
        firstErrorAt ??= Date.now();
        if (Date.now() - firstErrorAt >= NETWORK_ERROR_TIMEOUT_MS) {
          console.error("문제별 재시도 채점 상태 조회가 계속 실패했어요", err);
          settled = true;
          onFailedRef.current();
        }
      }
    };

    // setInterval 대신, 이전 요청이 끝난 뒤에야 다음 요청을 예약하는 순차 루프를 사용한다.
    const runPoll = async () => {
      await checkStatus();
      if (settled) return;
      timeoutId = setTimeout(runPoll, POLL_INTERVAL_MS);
    };
    void runPoll();

    return () => {
      settled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [examId, questionNumber, retryCount]);
}
