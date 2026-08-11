import { afterEach, describe, expect, it, vi } from "vitest";

import {
  requestSummaryFeedbackRetry,
  subscribeToSummaryFeedbackRetry,
  SummaryFeedbackRetryError,
} from "@/lib/native-summary-feedback-retry";

const globalWithWindow = globalThis as typeof globalThis & { window?: Window };
const originalWindow = globalWithWindow.window;

function installNativeWindow() {
  const postMessage = vi.fn();
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    writable: true,
    value: {
      ReactNativeWebView: { postMessage },
      __nativeCapabilities: { summaryFeedbackRetryVersion: 2 },
    } as unknown as Window,
  });
  return postMessage;
}

afterEach(() => {
  if (originalWindow) {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      writable: true,
      value: originalWindow,
    });
  } else {
    Reflect.deleteProperty(globalThis, "window");
  }
});

describe("native summary feedback retry bridge", () => {
  it("examId와 requestId를 보내고 같은 requestId의 접수 결과를 받는다", async () => {
    const postMessage = installNativeWindow();
    const promise = requestSummaryFeedbackRetry("exam-123", "request-1");

    expect(JSON.parse(postMessage.mock.calls[0][0] as string)).toEqual({
      type: "SUMMARY_FEEDBACK_RETRY_REQUESTED",
      requestId: "request-1",
      examId: "exam-123",
    });

    window.__nativeSummaryFeedbackRetryBridge?.deliver(
      JSON.stringify({
        requestId: "request-1",
        ok: true,
        status: "accepted",
        gradingJobId: "job-1",
      }),
    );

    await expect(promise).resolves.toEqual({
      requestId: "request-1",
      gradingJobId: "job-1",
    });
  });

  it("다른 requestId의 응답을 무시한다", async () => {
    installNativeWindow();
    const promise = requestSummaryFeedbackRetry("exam-123", "request-2");

    window.__nativeSummaryFeedbackRetryBridge?.deliver(
      JSON.stringify({ requestId: "other", ok: true, status: "accepted" }),
    );
    window.__nativeSummaryFeedbackRetryBridge?.deliver(
      JSON.stringify({
        requestId: "request-2",
        ok: true,
        status: "accepted",
      }),
    );

    await expect(promise).resolves.toEqual({
      requestId: "request-2",
      gradingJobId: undefined,
    });
  });

  it("capability가 없으면 요청을 보내지 않는다", async () => {
    const postMessage = installNativeWindow();
    window.__nativeCapabilities = {};

    await expect(
      requestSummaryFeedbackRetry("exam-123", "request-3"),
    ).rejects.toEqual(
      expect.objectContaining<Partial<SummaryFeedbackRetryError>>({
        code: "BRIDGE_UNAVAILABLE",
      }),
    );
    expect(postMessage).not.toHaveBeenCalled();
  });

  it("구독 전에 도착한 완료 결과도 requestId별로 재생한다", () => {
    installNativeWindow();
    const promise = requestSummaryFeedbackRetry("exam-123", "request-4");

    window.__nativeSummaryFeedbackRetryBridge?.deliver(
      JSON.stringify({
        requestId: "request-4",
        ok: true,
        status: "accepted",
      }),
    );
    window.__nativeSummaryFeedbackRetryBridge?.deliver(
      JSON.stringify({
        requestId: "request-4",
        ok: true,
        status: "completed",
        result: { summary: "완료" },
      }),
    );

    const listener = vi.fn();
    const unsubscribe = subscribeToSummaryFeedbackRetry("request-4", listener);

    expect(listener).toHaveBeenCalledWith({
      requestId: "request-4",
      status: "completed",
      result: { summary: "완료" },
    });
    unsubscribe();
    return promise;
  });

  it("앱 polling 실패의 단계와 사유를 구독자에게 전달한다", async () => {
    installNativeWindow();
    const promise = requestSummaryFeedbackRetry("exam-123", "request-5");
    const listener = vi.fn();
    const unsubscribe = subscribeToSummaryFeedbackRetry("request-5", listener);

    window.__nativeSummaryFeedbackRetryBridge?.deliver(
      JSON.stringify({
        requestId: "request-5",
        ok: true,
        status: "accepted",
      }),
    );
    await promise;
    window.__nativeSummaryFeedbackRetryBridge?.deliver(
      JSON.stringify({
        requestId: "request-5",
        ok: false,
        status: "failed",
        stage: "retry-polling",
        reason: "poll-timeout",
      }),
    );

    expect(listener).toHaveBeenCalledWith({
      requestId: "request-5",
      status: "failed",
      stage: "retry-polling",
      reason: "poll-timeout",
    });
    unsubscribe();
  });
});
