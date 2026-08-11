import { postToNative } from "@/lib/native-bridge";

const RESPONSE_TIMEOUT_MS = 15_000;

type PendingRetryRequest = {
  resolve: (result: SummaryFeedbackRetryAccepted) => void;
  reject: (error: SummaryFeedbackRetryError) => void;
  timeoutId: ReturnType<typeof setTimeout>;
};

export type SummaryFeedbackRetryAccepted = {
  requestId: string;
  gradingJobId?: string;
};

export type SummaryFeedbackRetryTerminalEvent =
  | { requestId: string; status: "completed"; result: unknown }
  | {
      requestId: string;
      status: "failed";
      stage: "retry-request" | "retry-polling";
      reason: "request-failed" | "poll-failed" | "poll-timeout";
    };

export class SummaryFeedbackRetryError extends Error {
  constructor(
    public readonly code:
      "BRIDGE_UNAVAILABLE" | "REQUEST_REJECTED" | "RESPONSE_TIMEOUT",
  ) {
    super(code);
    this.name = "SummaryFeedbackRetryError";
  }
}

declare global {
  interface Window {
    __nativeSummaryFeedbackRetryBridge?: {
      deliver(rawPayload: string): void;
    };
  }
}

const pendingRequests = new Map<string, PendingRetryRequest>();
const terminalEvents = new Map<string, SummaryFeedbackRetryTerminalEvent>();
const terminalListeners = new Map<
  string,
  Set<(event: SummaryFeedbackRetryTerminalEvent) => void>
>();

function publishTerminalEvent(event: SummaryFeedbackRetryTerminalEvent): void {
  terminalEvents.set(event.requestId, event);
  for (const listener of terminalListeners.get(event.requestId) ?? []) {
    listener(event);
  }
}

function settle(requestId: string): PendingRetryRequest | undefined {
  const pending = pendingRequests.get(requestId);
  if (!pending) return undefined;
  clearTimeout(pending.timeoutId);
  pendingRequests.delete(requestId);
  return pending;
}

function installBridge(): void {
  if (
    typeof window === "undefined" ||
    window.__nativeSummaryFeedbackRetryBridge
  ) {
    return;
  }

  window.__nativeSummaryFeedbackRetryBridge = {
    deliver(rawPayload: string) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(rawPayload);
      } catch {
        return;
      }
      if (!parsed || typeof parsed !== "object") return;

      const payload = parsed as Record<string, unknown>;
      if (typeof payload.requestId !== "string") return;

      if (payload.ok === true && payload.status === "accepted") {
        const pending = settle(payload.requestId);
        if (!pending) return;
        pending.resolve({
          requestId: payload.requestId,
          gradingJobId:
            typeof payload.gradingJobId === "string"
              ? payload.gradingJobId
              : undefined,
        });
        return;
      }

      if (payload.ok === true && payload.status === "completed") {
        publishTerminalEvent({
          requestId: payload.requestId,
          status: "completed",
          result: payload.result,
        });
        return;
      }

      if (payload.ok === false && payload.status === "failed") {
        settle(payload.requestId)?.reject(
          new SummaryFeedbackRetryError("REQUEST_REJECTED"),
        );
        publishTerminalEvent({
          requestId: payload.requestId,
          status: "failed",
          stage:
            payload.stage === "retry-request"
              ? "retry-request"
              : "retry-polling",
          reason:
            payload.reason === "request-failed" ||
            payload.reason === "poll-timeout"
              ? payload.reason
              : "poll-failed",
        });
      }
    },
  };
}

/** capability는 문서 실행 전에 주입되며 페이지 생명주기 동안 바뀌지 않는다. */
export function isSummaryFeedbackRetryAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    Boolean(window.ReactNativeWebView) &&
    window.__nativeCapabilities?.summaryFeedbackRetryVersion === 2
  );
}

/** 앱이 push하는 완료·실패 이벤트를 구독하며, 먼저 도착한 이벤트도 즉시 재생한다. */
export function subscribeToSummaryFeedbackRetry(
  requestId: string,
  listener: (event: SummaryFeedbackRetryTerminalEvent) => void,
): () => void {
  installBridge();
  const listeners = terminalListeners.get(requestId) ?? new Set();
  listeners.add(listener);
  terminalListeners.set(requestId, listeners);

  const buffered = terminalEvents.get(requestId);
  if (buffered) listener(buffered);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) terminalListeners.delete(requestId);
  };
}

export function createSummaryFeedbackRetryRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** 네이티브에 인증된 종합 피드백 재생성을 요청하고 접수 결과를 기다린다. */
export function requestSummaryFeedbackRetry(
  examId: string,
  requestId: string,
): Promise<SummaryFeedbackRetryAccepted> {
  installBridge();

  if (!isSummaryFeedbackRetryAvailable()) {
    return Promise.reject(new SummaryFeedbackRetryError("BRIDGE_UNAVAILABLE"));
  }

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      pendingRequests.delete(requestId);
      reject(new SummaryFeedbackRetryError("RESPONSE_TIMEOUT"));
    }, RESPONSE_TIMEOUT_MS);

    pendingRequests.set(requestId, { resolve, reject, timeoutId });
    postToNative({
      type: "SUMMARY_FEEDBACK_RETRY_REQUESTED",
      requestId,
      examId,
    });
  });
}
