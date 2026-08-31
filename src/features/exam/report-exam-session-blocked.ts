import * as Sentry from "@sentry/nextjs";

import type { UnpresentableExamQuestion } from "@/features/exam/exam-session-readiness";

/**
 * 문제 데이터 때문에 응시를 시작하지 못한 사건을 알린다.
 *
 * 응시자에게는 안내 화면만 보이고 조용히 끝나는 실패라, 서버 데이터가 언제부터 어떤
 * 문제에서 어긋났는지는 여기서만 남는다. reportSummaryFeedbackIssue와 같은 이유로
 * examId 같은 식별자는 싣지 않고, 파트·문제 번호와 사유만 보낸다.
 */
export function reportExamSessionBlocked(
  questions: readonly UnpresentableExamQuestion[],
): void {
  if (questions.length === 0) return;

  Sentry.withScope((scope) => {
    scope.setLevel("error");
    scope.setTags({
      feature: "exam-session",
      route: "exam-session",
      error_code: "EXAM_SESSION_UNPRESENTABLE",
      error_kind: "contract-violation",
    });
    scope.setFingerprint([
      "exam-session-unpresentable",
      [...new Set(questions.map((question) => question.reason))]
        .sort()
        .join(","),
    ]);
    scope.setContext("unpresentable_questions", {
      count: questions.length,
      parts: [...new Set(questions.map((question) => question.partNumber))],
      questionNumbers: questions.map((question) => question.questionNumber),
      reasons: questions.map((question) => question.reason),
    });
    Sentry.captureMessage("Exam session blocked before start");
  });
}
