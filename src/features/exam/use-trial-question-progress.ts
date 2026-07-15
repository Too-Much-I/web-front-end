"use client";

import { useEffect, useRef, useState } from "react";

import { getExamQuestionStatus } from "@/features/exam/api/exam-question-status";

/** 단일 문항 채점이라 전체 모의고사(45초)보다 훨씬 빨리 끝나는 걸 가정한 가짜 진행률 램프. */
const PROGRESS_DURATION_MS = 20_000;
/** 실제 완료 전까지는 100%로 보이지 않도록 상한을 둔다. */
const PROGRESS_CAP_PERCENT = 95;
const POLL_INTERVAL_MS = 3000;
/** 100%로 채워지는 트랜지션이 끝난 뒤 페이지를 이동시키기까지의 여유 시간. */
const COMPLETE_TRANSITION_MS = 700;
/** 이 시간 동안 계속 실패해야 진짜 문제로 간주한다. 그 전까지는 일시적인 네트워크 오류로 보고 조용히 재시도한다. */
const NETWORK_ERROR_TIMEOUT_MS = 60_000;

/**
 * 맛보기 모드(문항 1개)의 채점 대기용. useGradingProgress와 동일한 "가짜 진행률 + 폴링"
 * 패턴이지만, 종합 상태(GET .../status) 대신 문항별 상태(GET .../questions/status,
 * retryCount=0 — 첫 응시)를 폴링한다는 점만 다르다.
 */
export function useTrialQuestionProgress(
  examId: string,
  questionNumber: number,
  onComplete: () => void,
) {
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

    let completeTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let pollTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const checkStatus = async () => {
      if (settled) return;
      try {
        const result = await getExamQuestionStatus(examId, questionNumber, 0);
        if (settled) return;
        firstErrorAt = null;
        if (result.status === "COMPLETED") {
          settled = true;
          clearInterval(progressId);
          setProgress(100);
          completeTimeoutId = setTimeout(() => onCompleteRef.current(), COMPLETE_TRANSITION_MS);
        } else if (result.status === "FAILED") {
          settled = true;
          clearInterval(progressId);
          setFailed(true);
        }
      } catch (err) {
        if (settled) return;
        firstErrorAt ??= Date.now();
        if (Date.now() - firstErrorAt >= NETWORK_ERROR_TIMEOUT_MS) {
          console.error("맛보기 문항 채점 상태 조회가 계속 실패했어요", err);
          settled = true;
          clearInterval(progressId);
          setFailed(true);
        }
      }
    };

    // setInterval 대신, 이전 요청이 끝난 뒤에야 다음 요청을 예약하는 순차 루프를 사용한다.
    const runPoll = async () => {
      await checkStatus();
      if (settled) return;
      pollTimeoutId = setTimeout(runPoll, POLL_INTERVAL_MS);
    };
    void runPoll();

    return () => {
      settled = true;
      clearInterval(progressId);
      if (pollTimeoutId) clearTimeout(pollTimeoutId);
      if (completeTimeoutId) clearTimeout(completeTimeoutId);
    };
  }, [examId, questionNumber]);

  return { progress, failed };
}
