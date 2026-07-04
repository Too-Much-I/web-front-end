import { mapExamQuestionDetail } from "@/features/exam/map-exam-question-feedback";
import { MOCK_EXAM_QUESTION_FEEDBACK_RAW } from "@/features/exam/mock-question-feedback";
import type { ExamQuestionDetail } from "@/types/exam";

/**
 * 특정 문제의 채점 결과 및 상세 피드백을 조회한다.
 * 채점 서버가 아직 안정적으로 응답하지 않아, 안정화 전까지는 mock 데이터를 반환한다.
 */
export async function getExamQuestionFeedback(
  examId: string,
  questionNumber: number,
): Promise<ExamQuestionDetail> {
  const raw = MOCK_EXAM_QUESTION_FEEDBACK_RAW[questionNumber];
  if (!raw) {
    throw new Error(`문제 ${questionNumber}에 대한 mock 데이터가 없어요.`);
  }
  return mapExamQuestionDetail({ ...raw, examId });
}
