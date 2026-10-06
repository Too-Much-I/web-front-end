import { mapExamGradingResult } from "@/features/exam/map-exam-grading-result";
import { inspectExamSummary } from "@/features/exam/exam-summary-completeness";
import { apiFetch } from "@/lib/api/client";
import {
  isNativeDataRequestAvailable,
  requestFromNative,
} from "@/lib/native-data-bridge";
import type { ApiEnvelope } from "@/types/api";
import type {
  AppExamSummaryData,
  ExamGradingResult,
  ExamSummaryDataSource,
  RawExamSummaryResult,
} from "@/types/exam";

async function getRawExamSummary(
  examId: string,
): Promise<{ result: unknown; dataSource: ExamSummaryDataSource }> {
  if (isNativeDataRequestAvailable()) {
    const result = await requestFromNative<unknown>("EXAM_SUMMARY", { examId });
    return { result, dataSource: "native-bridge" };
  }

  const { result } = await apiFetch<ApiEnvelope<unknown>>(
    `/api/v1/exams/${examId}/summary`,
  );
  return { result, dataSource: "direct-api" };
}

/**
 * AI 채점 결과 및 피드백을 조회한다.
 *
 * 앱 웹뷰 안에서는 네이티브가 인증된 상태로 대신 호출한다 — 이 페이지에는 토큰이 없다.
 * 직접 호출 경로는 브라우저 로컬 개발용이며, 인증이 필요한 서버는 이를 거부한다.
 */
export async function getExamGradingResult(
  examId: string,
): Promise<ExamGradingResult> {
  const { result } = await getRawExamSummary(examId);
  return mapExamGradingResult(result as RawExamSummaryResult);
}

/** 앱 피드백 화면 전용: 불완전한 summary도 표시 가능한 성공 데이터로 반환한다. */
export async function getAppExamSummary(
  examId: string,
): Promise<AppExamSummaryData> {
  const { result, dataSource } = await getRawExamSummary(examId);
  return createAppExamSummary(result, examId, dataSource);
}

/** 앱이 polling 완료 뒤 push한 원본 summary에도 초기 조회와 같은 검사·매핑을 적용한다. */
export function createAppExamSummary(
  result: unknown,
  examId: string,
  dataSource: ExamSummaryDataSource = "native-bridge",
): AppExamSummaryData {
  const inspected = inspectExamSummary(result, examId);

  return {
    result: mapExamGradingResult(inspected.normalized, {
      preserveEmptyParts: true,
    }),
    completeness: inspected.completeness,
    dataSource,
  };
}
