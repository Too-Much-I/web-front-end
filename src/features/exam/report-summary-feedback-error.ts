import * as Sentry from "@sentry/nextjs";

import type {
  ExamSummaryCompleteness,
  ExamSummaryDataSource,
} from "@/types/exam";

export type SummaryFeedbackReportStage =
  "initial-load" | "retry-request" | "retry-polling";

type SummaryFeedbackReportOptions = {
  stage: SummaryFeedbackReportStage;
  dataSource: ExamSummaryDataSource;
  retryAttempt: number;
  requestId?: string;
  gradingJobId?: string;
  failureReason?:
    | "request-rejected"
    | "request-timeout"
    | "poll-failed"
    | "poll-timeout"
    | "poll-incomplete";
};

/** 실제 피드백과 시험 식별자를 받지 않는 전용 reporter다. */
export function reportSummaryFeedbackIssue(
  completeness: ExamSummaryCompleteness,
  options: SummaryFeedbackReportOptions,
): void {
  Sentry.withScope((scope) => {
    scope.setLevel(options.stage === "initial-load" ? "warning" : "error");
    scope.setTags({
      feature: "exam-feedback",
      route: "app-exam-screen",
      error_code: "SUMMARY_FEEDBACK_INCOMPLETE",
      error_kind: "partial-generation",
      stage: options.stage,
      data_source: options.dataSource,
    });
    scope.setFingerprint([
      "exam-summary-incomplete",
      [...completeness.missingFields].sort().join(","),
    ]);
    scope.setContext("summary_completeness", {
      missingFields: completeness.missingFields,
      missingFeedbackParts: completeness.missingParts.feedback,
      missingScoreParts: completeness.missingParts.scores,
      totalSolvedQuestions: completeness.totalSolvedQuestions,
      ...completeness.presence,
      retryAttempt: options.retryAttempt,
      requestId: options.requestId,
      gradingJobId: options.gradingJobId,
      failureReason: options.failureReason,
    });
    Sentry.captureMessage("Exam summary incomplete");
  });
}
