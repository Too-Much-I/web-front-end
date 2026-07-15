import { apiFetch } from "@/lib/api/client";
import type { ApiEnvelope } from "@/types/api";
import type { ExamAnswerSubmitResult } from "@/types/exam";

/** 응시 중인 시험을 중단하고, 그때까지 제출된 답변만으로 채점을 요청한다. */
export async function terminateExam(examId: string): Promise<ExamAnswerSubmitResult> {
  const { result } = await apiFetch<ApiEnvelope<ExamAnswerSubmitResult>>(
    `/api/v1/exams/${examId}/terminate`,
    { method: "POST" },
  );
  return result;
}
