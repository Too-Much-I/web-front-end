"use client";

import { useCallback, useState } from "react";

import {
  ExamAnswerUploadError,
  uploadExamAnswer,
} from "@/features/exam/api/exam-answer-upload";
import { useQuestionRetryStatus } from "@/features/exam/use-question-retry-status";
import { trackEvent } from "@/lib/analytics";

export type ReanswerSubmissionStatus = "idle" | "submitting" | "grading" | "error";

/**
 * "다시 답변하기" 제출 → 채점 폴링까지의 상태를 ExamQuestionFeedbackScreen(탭 상위) 레벨에서 들고 있는다.
 * ExamReanswerPanel 안에 두면 다른 탭으로 전환할 때 패널이 언마운트되면서 제출/채점 진행 상태가
 * 그대로 사라져, uploadExamAnswer는 여전히 서버에 도달했는데 그 결과(채점 폴링 시작·자동 이동·실패
 * 표시)를 받아줄 컴포넌트가 없어지는 문제가 생긴다 — 심하면 탭을 나갔다 돌아와 같은 문제를
 * 한 번 더 제출해버릴 수도 있다. 탭 전환에 영향받지 않는 이 레벨로 끌어올려 막는다.
 */
export function useReanswerSubmission({
  examId,
  questionNumber,
  onNavigateRetry,
}: {
  examId: string;
  questionNumber: number;
  /** 채점 완료 시 새 회차로 넘어갈 때 쓰는, 날개 버튼과 동일한 history.replaceState 기반 콜백. */
  onNavigateRetry: (nextRetryCount: number) => void;
}) {
  const [status, setStatus] = useState<ReanswerSubmissionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pollingRetryCount, setPollingRetryCount] = useState<number | null>(null);

  const handleGradingComplete = useCallback(() => {
    if (pollingRetryCount === null) return;
    onNavigateRetry(pollingRetryCount);
  }, [pollingRetryCount, onNavigateRetry]);

  const handleGradingFailed = useCallback(() => {
    setPollingRetryCount(null);
    setStatus("error");
    setErrorMessage("채점 결과를 확인하지 못했어요. 결과 페이지를 새로고침해서 확인해 주세요.");
  }, []);

  useQuestionRetryStatus(
    examId,
    questionNumber,
    pollingRetryCount,
    handleGradingComplete,
    handleGradingFailed,
  );

  const submit = useCallback(
    async (blob: Blob, nextRetryCount: number) => {
      setStatus("submitting");
      setErrorMessage(null);
      trackEvent("reanswer_submit", {
        question_number: questionNumber,
        retry_count: nextRetryCount,
      });
      try {
        await uploadExamAnswer(examId, String(questionNumber), blob, nextRetryCount);
        setStatus("grading");
        setPollingRetryCount(nextRetryCount);
      } catch (err) {
        setStatus("error");
        setErrorMessage(
          err instanceof ExamAnswerUploadError
            ? err.message
            : "제출 중 문제가 생겼어요. 다시 시도해 주세요.",
        );
      }
    },
    [examId, questionNumber],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setErrorMessage(null);
    setPollingRetryCount(null);
  }, []);

  return { status, errorMessage, submit, reset };
}
