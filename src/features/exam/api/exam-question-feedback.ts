import { mapExamQuestionDetail } from "@/features/exam/map-exam-question-feedback";
import { apiFetch } from "@/lib/api/client";
import {
  isNativeBridgeAvailable,
  requestFromNative,
} from "@/lib/native-data-bridge";
import type { ApiEnvelope } from "@/types/api";
import type {
  ExamQuestionDetail,
  RawExamQuestionDetailResult,
} from "@/types/exam";

/**
 * 특정 문제의 특정 회차 채점 결과 및 상세 피드백을 조회한다.
 * 최초 응시는 retryCount=0.
 *
 * 앱 웹뷰 안에서는 네이티브가 인증된 상태로 대신 호출한다 — 이 페이지에는 토큰이 없다.
 * 직접 호출 경로는 브라우저 로컬 개발용이며, 인증이 필요한 서버는 이를 거부한다.
 */
export async function getExamQuestionFeedback(
  examId: string,
  questionNumber: number,
  retryCount: number,
): Promise<ExamQuestionDetail> {
  if (isNativeBridgeAvailable()) {
    const result = await requestFromNative<RawExamQuestionDetailResult>(
      "QUESTION_FEEDBACK",
      { examId, questionNumber, retryCount },
    );
    return mapExamQuestionDetail(result);
  }

  const { result } = await apiFetch<ApiEnvelope<RawExamQuestionDetailResult>>(
    `/api/v1/exams/${examId}/questions?questionNumber=${questionNumber}&retryCount=${retryCount}`,
  );
  return mapExamQuestionDetail(result);
}
