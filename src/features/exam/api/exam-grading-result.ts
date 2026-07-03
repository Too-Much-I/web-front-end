import { MOCK_EXAM_GRADING_RESULT } from "@/features/exam/mock-grading-result";
import type { ExamGradingResult } from "@/types/exam";

/**
 * AI 채점 결과 및 피드백을 조회한다.
 * 채점 서버가 아직 배포되지 않아, 배포 전까지는 AI 채점 에이전트가 내려주는 형태 그대로의 mock 데이터를 반환한다.
 */
export async function getExamGradingResult(examId: string): Promise<ExamGradingResult> {
  return { ...MOCK_EXAM_GRADING_RESULT, examId };
}
