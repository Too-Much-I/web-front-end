export type SummaryFeedbackRetryState =
  | "complete"
  | "incomplete-idle"
  | "retry-requesting"
  | "retry-polling"
  | "retry-failed";

export type SummaryFeedbackRetryEvent =
  "request" | "accepted" | "failed" | "completed";

/** 허용되지 않은 이벤트는 현재 상태를 유지해 중복 요청과 역방향 전이를 막는다. */
export function transitionSummaryFeedbackRetryState(
  state: SummaryFeedbackRetryState,
  event: SummaryFeedbackRetryEvent,
): SummaryFeedbackRetryState {
  if (event === "completed") return "complete";
  if (event === "request" && state === "incomplete-idle") {
    return "retry-requesting";
  }
  if (event === "accepted" && state === "retry-requesting") {
    return "retry-polling";
  }
  if (
    event === "failed" &&
    (state === "retry-requesting" || state === "retry-polling")
  ) {
    return "retry-failed";
  }
  return state;
}
