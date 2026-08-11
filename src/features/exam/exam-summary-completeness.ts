import type {
  ExamPartScores,
  ExamSummaryCompleteness,
  ExamSummaryMissingField,
  ExamSummaryPartNumber,
  RawExamPartFeedback,
  RawExamSummaryResult,
} from "@/types/exam";

export const COMPLETE_EXAM_QUESTION_COUNT = 11;
export const EXAM_SUMMARY_PART_NUMBERS = [1, 2, 3, 4, 5] as const;

type InspectedExamSummary = {
  normalized: RawExamSummaryResult;
  completeness: ExamSummaryCompleteness;
};

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function isNonBlankString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function getValidStringItems(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isNonBlankString);
}

function getString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function addMissing(
  missingFields: ExamSummaryMissingField[],
  field: ExamSummaryMissingField,
  isPresent: boolean,
): void {
  if (!isPresent) missingFields.push(field);
}

/**
 * 서버 타입과 무관하게 실제 런타임 값을 검사한다.
 * 누락을 throw하지 않고 표시 가능한 값과 누락 목록을 함께 돌려줘 부분 결과 렌더링을 허용한다.
 */
export function inspectExamSummary(
  rawValue: unknown,
  fallbackExamId: string,
): InspectedExamSummary {
  const raw = asRecord(rawValue);
  const rawPartFeedback = asRecord(raw.partFeedback);
  const rawPartScores = asRecord(raw.partScores);
  const missingFields: ExamSummaryMissingField[] = [];
  const missingFeedbackParts: ExamSummaryPartNumber[] = [];
  const missingScoreParts: ExamSummaryPartNumber[] = [];

  const totalSolvedQuestions = isFiniteNumber(raw.totalSolvedQuestions)
    ? raw.totalSolvedQuestions
    : null;
  addMissing(
    missingFields,
    "totalSolvedQuestions",
    totalSolvedQuestions === COMPLETE_EXAM_QUESTION_COUNT,
  );

  const hasTotalScore = isFiniteNumber(raw.totalScore);
  addMissing(missingFields, "totalScore", hasTotalScore);

  const hasLevelEstimate = isNonBlankString(raw.levelEstimate);
  const hasSummary = isNonBlankString(raw.summary);
  const hasOverallFeedback = isNonBlankString(raw.overallFeedback);
  addMissing(missingFields, "levelEstimate", hasLevelEstimate);
  addMissing(missingFields, "summary", hasSummary);
  addMissing(missingFields, "overallFeedback", hasOverallFeedback);

  const strengths = getValidStringItems(raw.strengths);
  const weaknesses = getValidStringItems(raw.weaknesses);
  const recommendedPractice = getValidStringItems(raw.recommendedPractice);
  const hasStrengths = strengths.length > 0;
  const hasWeaknesses = weaknesses.length > 0;
  const hasRecommendedPractice = recommendedPractice.length > 0;
  addMissing(missingFields, "strengths", hasStrengths);
  addMissing(missingFields, "weaknesses", hasWeaknesses);
  addMissing(missingFields, "recommendedPractice", hasRecommendedPractice);

  const partFeedback = {} as RawExamPartFeedback;
  const partScores: ExamPartScores = {};

  for (const partNumber of EXAM_SUMMARY_PART_NUMBERS) {
    const key = `part${partNumber}` as const;
    const feedback = rawPartFeedback[key];
    const score = rawPartScores[key];

    if (!isNonBlankString(feedback)) {
      missingFields.push(`partFeedback.${key}`);
      missingFeedbackParts.push(partNumber);
    }
    if (!isFiniteNumber(score)) {
      missingFields.push(`partScores.${key}`);
      missingScoreParts.push(partNumber);
    }

    partFeedback[key] = getString(feedback);
    if (isFiniteNumber(score)) partScores[key] = score;
  }

  return {
    normalized: {
      examId: isNonBlankString(raw.examId) ? raw.examId : fallbackExamId,
      totalScore: isFiniteNumber(raw.totalScore) ? raw.totalScore : 0,
      levelEstimate: getString(raw.levelEstimate),
      totalSolvedQuestions: totalSolvedQuestions ?? 0,
      summary: getString(raw.summary),
      overallFeedback: getString(raw.overallFeedback),
      partFeedback,
      strengths,
      weaknesses,
      recommendedPractice,
      partScores,
    },
    completeness: {
      missingFields,
      missingParts: {
        feedback: missingFeedbackParts,
        scores: missingScoreParts,
      },
      presence: {
        hasSummary,
        hasOverallFeedback,
        hasStrengths,
        hasWeaknesses,
        hasRecommendedPractice,
      },
      totalSolvedQuestions,
    },
  };
}

export function isExamSummaryComplete(
  completeness: ExamSummaryCompleteness,
): boolean {
  return completeness.missingFields.length === 0;
}
