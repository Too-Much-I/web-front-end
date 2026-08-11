import { describe, expect, it } from "vitest";

import { transitionSummaryFeedbackRetryState } from "@/features/exam/summary-feedback-retry-state";

describe("transitionSummaryFeedbackRetryState", () => {
  it("요청 접수부터 완료까지 순서대로 전이한다", () => {
    const requesting = transitionSummaryFeedbackRetryState(
      "incomplete-idle",
      "request",
    );
    const polling = transitionSummaryFeedbackRetryState(requesting, "accepted");
    const complete = transitionSummaryFeedbackRetryState(polling, "completed");

    expect(requesting).toBe("retry-requesting");
    expect(polling).toBe("retry-polling");
    expect(complete).toBe("complete");
  });

  it("요청 중의 중복 request 이벤트를 무시한다", () => {
    expect(
      transitionSummaryFeedbackRetryState("retry-requesting", "request"),
    ).toBe("retry-requesting");
  });

  it.each(["retry-requesting", "retry-polling"] as const)(
    "%s에서 실패 상태로 전이한다",
    (state) => {
      expect(transitionSummaryFeedbackRetryState(state, "failed")).toBe(
        "retry-failed",
      );
    },
  );

  it("실패 뒤의 재요청을 허용하지 않는다", () => {
    expect(transitionSummaryFeedbackRetryState("retry-failed", "request")).toBe(
      "retry-failed",
    );
  });
});
