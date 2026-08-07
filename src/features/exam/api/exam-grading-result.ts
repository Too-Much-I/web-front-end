import { mapExamGradingResult } from "@/features/exam/map-exam-grading-result";
import { apiFetch } from "@/lib/api/client";
import {
  isNativeDataRequestAvailable,
  requestFromNative,
} from "@/lib/native-data-bridge";
import type { ApiEnvelope } from "@/types/api";
import type { ExamGradingResult, RawExamSummaryResult } from "@/types/exam";

/**
 * AI 채점 결과 및 피드백을 조회한다.
 *
 * 앱 웹뷰 안에서는 네이티브가 인증된 상태로 대신 호출한다 — 이 페이지에는 토큰이 없다.
 * 직접 호출 경로는 브라우저 로컬 개발용이며, 인증이 필요한 서버는 이를 거부한다.
 */
export async function getExamGradingResult(
  examId: string,
): Promise<ExamGradingResult> {
  if (isNativeDataRequestAvailable()) {
    const result = await requestFromNative<RawExamSummaryResult>(
      "EXAM_SUMMARY",
      {
        examId,
      },
    );
    return mapExamGradingResult(result);
  }

  const { result } = await apiFetch<ApiEnvelope<RawExamSummaryResult>>(
    `/api/v1/exams/${examId}/summary`,
  );
  return mapExamGradingResult(result);
}
