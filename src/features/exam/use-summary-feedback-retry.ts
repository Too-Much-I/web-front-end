"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { isExamSummaryComplete } from "@/features/exam/exam-summary-completeness";
import { reportSummaryFeedbackIssue } from "@/features/exam/report-summary-feedback-error";
import {
  getSummaryFeedbackRetryDeadlineDelay,
  transitionSummaryFeedbackRetryState,
  type SummaryFeedbackRetryState,
} from "@/features/exam/summary-feedback-retry-state";
import {
  createSummaryFeedbackRetryRequestId,
  isSummaryFeedbackRetryAvailable,
  requestSummaryFeedbackRetry,
  subscribeToSummaryFeedbackRetry,
  SummaryFeedbackRetryError,
} from "@/lib/native-summary-feedback-retry";
import type { AppExamSummaryData } from "@/types/exam";

const RETRY_STORAGE_PREFIX = "summary-feedback-retry:";
const PROMPT_STORAGE_PREFIX = "summary-feedback-prompt-dismissed:";

type PersistedRetry = {
  attempted: true;
  status: "requesting" | "polling" | "failed";
  requestId: string;
  startedAt: number;
  gradingJobId?: string;
};

export type SummaryFeedbackRecovery = {
  state: SummaryFeedbackRetryState;
  supportsRetry: boolean;
  isInitialPromptOpen: boolean;
  requestRetry(): void;
  dismissInitialPrompt(): void;
};

function subscribeToCapability(): () => void {
  return () => undefined;
}

function getServerCapability(): false {
  return false;
}

function retryStorageKey(examId: string): string {
  return `${RETRY_STORAGE_PREFIX}${examId}`;
}

function promptStorageKey(examId: string): string {
  return `${PROMPT_STORAGE_PREFIX}${examId}`;
}

function readPersistedRetry(examId: string): PersistedRetry | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(retryStorageKey(examId));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedRetry>;
    if (
      parsed.attempted !== true ||
      (parsed.status !== "requesting" &&
        parsed.status !== "polling" &&
        parsed.status !== "failed") ||
      typeof parsed.requestId !== "string" ||
      typeof parsed.startedAt !== "number"
    ) {
      return null;
    }
    return parsed as PersistedRetry;
  } catch {
    return null;
  }
}

function writePersistedRetry(examId: string, value: PersistedRetry): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(retryStorageKey(examId), JSON.stringify(value));
}

function clearPersistedRetry(examId: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(retryStorageKey(examId));
}

export function useSummaryFeedbackRetry({
  examId,
  summaryData,
  applyPushedSummary,
}: {
  examId: string;
  summaryData: AppExamSummaryData;
  applyPushedSummary: (rawSummary: unknown) => AppExamSummaryData;
}): SummaryFeedbackRecovery {
  const isComplete = isExamSummaryComplete(summaryData.completeness);
  const [state, setState] = useState<SummaryFeedbackRetryState>(
    isComplete ? "complete" : "incomplete-idle",
  );
  const [isInitialPromptOpen, setIsInitialPromptOpen] = useState(false);
  const supportsRetry = useSyncExternalStore(
    subscribeToCapability,
    isSummaryFeedbackRetryAvailable,
    getServerCapability,
  );
  const requestInFlightRef = useRef(false);
  const attemptedRef = useRef(false);
  const requestIdRef = useRef<string | null>(null);
  const gradingJobIdRef = useRef<string | undefined>(undefined);
  const startedAtRef = useRef(0);
  const resumeNeededRef = useRef(false);
  const reportedInitialRef = useRef(false);
  const summaryDataRef = useRef(summaryData);

  useEffect(() => {
    summaryDataRef.current = summaryData;
  }, [summaryData]);

  useEffect(() => {
    if (isComplete) {
      clearPersistedRetry(examId);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState((current) =>
        transitionSummaryFeedbackRetryState(current, "completed"),
      );
      setIsInitialPromptOpen(false);
      return;
    }

    const persisted = readPersistedRetry(examId);
    if (persisted) {
      attemptedRef.current = true;
      requestIdRef.current = persisted.requestId;
      gradingJobIdRef.current = persisted.gradingJobId;
      startedAtRef.current = persisted.startedAt;
      resumeNeededRef.current = persisted.status !== "failed";
      setState(
        persisted.status === "requesting"
          ? "retry-requesting"
          : persisted.status === "polling"
            ? "retry-polling"
            : "retry-failed",
      );
      setIsInitialPromptOpen(false);
      return;
    }

    setState("incomplete-idle");
    setIsInitialPromptOpen(
      sessionStorage.getItem(promptStorageKey(examId)) !== "true",
    );
  }, [examId, isComplete]);

  useEffect(() => {
    if (isComplete || reportedInitialRef.current) return;
    reportedInitialRef.current = true;
    reportSummaryFeedbackIssue(summaryData.completeness, {
      stage: "initial-load",
      dataSource: summaryData.dataSource,
      retryAttempt: attemptedRef.current ? 1 : 0,
    });
  }, [isComplete, summaryData]);

  const dismissInitialPrompt = useCallback(() => {
    sessionStorage.setItem(promptStorageKey(examId), "true");
    setIsInitialPromptOpen(false);
  }, [examId]);

  const failRetry = useCallback(
    (
      reason:
        | "request-rejected"
        | "request-timeout"
        | "poll-failed"
        | "poll-timeout"
        | "poll-incomplete",
      data: AppExamSummaryData,
      stage: "retry-request" | "retry-polling",
    ) => {
      const requestId = requestIdRef.current ?? "unknown";
      writePersistedRetry(examId, {
        attempted: true,
        status: "failed",
        requestId,
        startedAt: startedAtRef.current || Date.now(),
        gradingJobId: gradingJobIdRef.current,
      });
      setState((current) =>
        transitionSummaryFeedbackRetryState(current, "failed"),
      );
      reportSummaryFeedbackIssue(data.completeness, {
        stage,
        dataSource: data.dataSource,
        retryAttempt: 1,
        requestId: requestIdRef.current ?? undefined,
        gradingJobId: gradingJobIdRef.current,
        failureReason: reason,
      });
    },
    [examId],
  );

  const requestRetry = useCallback(() => {
    if (
      !supportsRetry ||
      attemptedRef.current ||
      requestInFlightRef.current ||
      state !== "incomplete-idle"
    ) {
      return;
    }

    requestInFlightRef.current = true;
    attemptedRef.current = true;
    dismissInitialPrompt();

    const requestId = createSummaryFeedbackRetryRequestId();
    const startedAt = Date.now();
    requestIdRef.current = requestId;
    startedAtRef.current = startedAt;
    resumeNeededRef.current = false;
    setState((current) =>
      transitionSummaryFeedbackRetryState(current, "request"),
    );
    writePersistedRetry(examId, {
      attempted: true,
      status: "requesting",
      requestId,
      startedAt,
    });

    void requestSummaryFeedbackRetry(examId, requestId)
      .then((accepted) => {
        gradingJobIdRef.current = accepted.gradingJobId;
        writePersistedRetry(examId, {
          attempted: true,
          status: "polling",
          requestId,
          startedAt,
          gradingJobId: accepted.gradingJobId,
        });
        setState((current) =>
          transitionSummaryFeedbackRetryState(current, "accepted"),
        );
      })
      .catch((error: unknown) => {
        const reason =
          error instanceof SummaryFeedbackRetryError &&
          error.code === "RESPONSE_TIMEOUT"
            ? "request-timeout"
            : "request-rejected";
        failRetry(reason, summaryDataRef.current, "retry-request");
      })
      .finally(() => {
        requestInFlightRef.current = false;
      });
  }, [dismissInitialPrompt, examId, failRetry, state, supportsRetry]);

  /** 요청 접수 중 웹 문서가 다시 열린 경우 앱의 기존 작업에 같은 requestId로 재연결한다. */
  useEffect(() => {
    if (state !== "retry-requesting" || !resumeNeededRef.current) return;

    const requestId = requestIdRef.current;
    if (!requestId) return;

    resumeNeededRef.current = false;
    requestInFlightRef.current = true;

    void requestSummaryFeedbackRetry(examId, requestId)
      .then((accepted) => {
        gradingJobIdRef.current = accepted.gradingJobId;
        writePersistedRetry(examId, {
          attempted: true,
          status: "polling",
          requestId,
          startedAt: startedAtRef.current,
          gradingJobId: accepted.gradingJobId,
        });
        setState((current) =>
          transitionSummaryFeedbackRetryState(current, "accepted"),
        );
      })
      .catch((error: unknown) => {
        const reason =
          error instanceof SummaryFeedbackRetryError &&
          error.code === "RESPONSE_TIMEOUT"
            ? "request-timeout"
            : "request-rejected";
        failRetry(reason, summaryDataRef.current, "retry-request");
      })
      .finally(() => {
        requestInFlightRef.current = false;
      });
  }, [examId, failRetry, state]);

  /** 앱이 인증된 polling을 끝낸 뒤 push하는 완료·실패 결과만 소비한다. */
  useEffect(() => {
    if (state !== "retry-polling") return;

    const requestId = requestIdRef.current;
    if (!requestId) return;

    let cancelled = false;
    let terminalHandled = false;
    let deadlineTimerId: ReturnType<typeof setTimeout> | undefined;

    const unsubscribe = subscribeToSummaryFeedbackRetry(requestId, (event) => {
      if (cancelled) return;
      terminalHandled = true;

      if (event.status === "completed") {
        try {
          const nextData = applyPushedSummary(event.result);
          if (isExamSummaryComplete(nextData.completeness)) {
            clearPersistedRetry(examId);
            setState((current) =>
              transitionSummaryFeedbackRetryState(current, "completed"),
            );
            return;
          }

          failRetry("poll-incomplete", nextData, "retry-polling");
        } catch {
          failRetry("poll-failed", summaryDataRef.current, "retry-polling");
        }
        return;
      }

      failRetry(
        event.reason === "request-failed" ? "request-rejected" : event.reason,
        summaryDataRef.current,
        event.stage,
      );
    });

    if (!terminalHandled) {
      const deadlineDelay = getSummaryFeedbackRetryDeadlineDelay(
        startedAtRef.current || Date.now(),
        Date.now(),
      );
      deadlineTimerId = setTimeout(() => {
        if (cancelled || terminalHandled) return;
        failRetry("poll-timeout", summaryDataRef.current, "retry-polling");
      }, deadlineDelay);
    }

    if (resumeNeededRef.current) {
      resumeNeededRef.current = false;
      void requestSummaryFeedbackRetry(examId, requestId).catch(
        (error: unknown) => {
          if (cancelled || terminalHandled) return;
          const reason =
            error instanceof SummaryFeedbackRetryError &&
            error.code === "RESPONSE_TIMEOUT"
              ? "request-timeout"
              : "request-rejected";
          failRetry(reason, summaryDataRef.current, "retry-request");
        },
      );
    }

    return () => {
      cancelled = true;
      if (deadlineTimerId !== undefined) clearTimeout(deadlineTimerId);
      unsubscribe();
    };
  }, [applyPushedSummary, examId, failRetry, state]);

  return {
    state,
    supportsRetry,
    isInitialPromptOpen,
    requestRetry,
    dismissInitialPrompt,
  };
}
