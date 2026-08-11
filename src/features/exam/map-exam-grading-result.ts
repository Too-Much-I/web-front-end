import type {
  ExamGradingResult,
  RawExamPartFeedback,
  RawExamSummaryResult,
} from "@/types/exam";

/** TOEIC Speaking 만점 기준 */
const TOEIC_SPEAKING_MAX_SCORE = 200;

function mapPartFeedback(
  raw: RawExamPartFeedback,
  preserveEmptyParts: boolean,
) {
  const parts = ([1, 2, 3, 4, 5] as const).map((partNumber) => ({
    partNumber,
    feedback: raw[`part${partNumber}` as keyof RawExamPartFeedback],
  }));

  return preserveEmptyParts
    ? parts
    : parts.filter((part) => Boolean(part.feedback));
}

export function mapExamGradingResult(
  raw: RawExamSummaryResult,
  { preserveEmptyParts = false }: { preserveEmptyParts?: boolean } = {},
): ExamGradingResult {
  return {
    examId: raw.examId,
    totalScore: raw.totalScore,
    maxScore: TOEIC_SPEAKING_MAX_SCORE,
    levelEstimate: raw.levelEstimate,
    totalSolvedQuestions: raw.totalSolvedQuestions,
    summary: raw.summary,
    overallFeedback: raw.overallFeedback,
    partFeedback: mapPartFeedback(raw.partFeedback, preserveEmptyParts),
    strengths: raw.strengths ?? [],
    weaknesses: raw.weaknesses ?? [],
    recommendedPractice: raw.recommendedPractice ?? [],
    partScores: raw.partScores,
  };
}
