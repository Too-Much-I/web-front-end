export type SummaryFeedbackRetryState =
  | "complete"
  | "incomplete-idle"
  | "retry-requesting"
  | "retry-polling"
  | "retry-failed";

export type SummaryFeedbackRetryEvent =
  "request" | "accepted" | "failed" | "completed";

/** 앱의 3분 polling과 요청 접수 시간을 모두 넘긴 뒤 UI만 종료하는 안전 마감 시간이다. */
export const SUMMARY_FEEDBACK_RETRY_WEB_DEADLINE_MS = 3.5 * 60 * 1_000;

export function getSummaryFeedbackRetryDeadlineDelay(
  startedAt: number,
  now: number,
): number {
  return Math.max(
    0,
    SUMMARY_FEEDBACK_RETRY_WEB_DEADLINE_MS - (now - startedAt),
  );
}

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
