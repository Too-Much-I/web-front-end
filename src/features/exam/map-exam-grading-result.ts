import type { ExamGradingResult, RawExamGradingResult, RawExamPartFeedback } from "@/types/exam";

const DEFAULT_MAX_SCORE = 200;

function parseMaxScore(scoreScale: string): number {
  const max = Number(scoreScale.split("-")[1]);
  return Number.isFinite(max) ? max : DEFAULT_MAX_SCORE;
}

function mapPartFeedback(raw: RawExamPartFeedback) {
  return ([1, 2, 3, 4, 5] as const)
    .map((partNumber) => ({
      partNumber,
      feedback: raw[`part${partNumber}` as keyof RawExamPartFeedback],
    }))
    .filter((part) => Boolean(part.feedback));
}

export function mapExamGradingResult(raw: RawExamGradingResult): ExamGradingResult {
  return {
    examId: raw.mock_exam_id,
    totalScore: raw.suggested_total_score,
    maxScore: parseMaxScore(raw.score_scale),
    levelEstimate: raw.level_estimate,
    summary: raw.summary,
    overallFeedback: raw.overall_feedback,
    partFeedback: mapPartFeedback(raw.part_feedback),
    strengths: raw.strengths,
    weaknesses: raw.weaknesses,
    recommendedPractice: raw.recommended_practice,
  };
}
