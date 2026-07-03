import { apiFetch } from "@/lib/api/client";
import type { ExamGradingStatus } from "@/types/exam";

interface ApiEnvelope<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

/** 채점 진행 상태를 조회한다. */
export async function getExamGradingStatus(examId: string): Promise<ExamGradingStatus> {
  const { result } = await apiFetch<ApiEnvelope<ExamGradingStatus>>(
    `/api/v1/exams/${examId}/status`,
  );
  return result;
}
