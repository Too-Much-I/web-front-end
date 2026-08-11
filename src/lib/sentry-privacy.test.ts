import type { ErrorEvent } from "@sentry/nextjs";
import { describe, expect, it } from "vitest";

import {
  redactIdentifiersInText,
  scrubSentryBreadcrumb,
  scrubSentryEvent,
} from "@/lib/sentry-privacy";

describe("Sentry privacy scrubber", () => {
  it("URL query와 API path의 examId를 제거한다", () => {
    expect(
      redactIdentifiersInText(
        "https://to-teacher.com/app-exam-screen?examId=exam-123&step=3",
      ),
    ).toContain("examId=[Filtered]");
    expect(redactIdentifiersInText("/api/v1/exams/exam-123/summary")).toBe(
      "/api/v1/exams/[Filtered]/summary",
    );
  });

  it("이벤트의 사용자, 요청 본문, 인증 헤더와 식별자를 제거한다", () => {
    const event: ErrorEvent = {
      type: undefined,
      request: {
        url: "/app-exam-screen?examId=exam-123",
        headers: { authorization: "Bearer secret" },
        cookies: { session: "secret" },
        data: { feedback: "민감한 피드백" },
      },
      user: { email: "user@example.com" },
      extra: { examId: "exam-123", requestId: "request-1" },
    };

    const scrubbed = scrubSentryEvent(event);

    expect(scrubbed?.request?.url).toContain("examId=[Filtered]");
    expect(scrubbed?.request?.headers).toBeUndefined();
    expect(scrubbed?.request?.cookies).toBeUndefined();
    expect(scrubbed?.request?.data).toBeUndefined();
    expect(scrubbed?.user).toBeUndefined();
    expect(scrubbed?.extra).toEqual({
      examId: "[Filtered]",
      requestId: "request-1",
    });
  });

  it("navigation breadcrumb의 examId만 가린다", () => {
    const scrubbed = scrubSentryBreadcrumb({
      category: "navigation",
      data: {
        from: "/app-exam-screen?examId=before",
        to: "/app-question-feedback?examId=after&questionNumber=1",
      },
    });

    expect(scrubbed.data?.from).toContain("examId=[Filtered]");
    expect(scrubbed.data?.to).toContain("examId=[Filtered]");
  });
});
