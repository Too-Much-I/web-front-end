import { apiFetch } from "@/lib/api/client";
import type { ApiEnvelope } from "@/types/api";
import type { ExamGradingResult } from "@/types/exam";

/** AI 채점 결과 및 피드백을 조회한다. */
export async function getExamGradingResult(examId: string): Promise<ExamGradingResult> {
  const { result } = await apiFetch<ApiEnvelope<ExamGradingResult>>(
    `/api/v1/exams/${examId}/results`,
  );
  return result;
}
