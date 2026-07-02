"use client";

import { ExamSessionScreen } from "@/components/exam/exam-session-screen";
import { MOCK_EXAM_SESSION } from "@/features/exam/mock-questions";

export default function ExamSessionPage() {
  return <ExamSessionScreen session={MOCK_EXAM_SESSION} />;
}
