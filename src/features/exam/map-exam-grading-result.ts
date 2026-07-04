import type {
  ExamGradingResult,
  ExamPartScores,
  RawExamPartFeedback,
  RawExamSummaryResult,
} from "@/types/exam";

/** TOEIC Speaking 만점 기준 */
const TOEIC_SPEAKING_MAX_SCORE = 200;

/** 채점 서버가 아직 모든 파트의 세부 점수를 내려주지 않아, 없는 파트는 임시로 이 값을 채워 보여준다. */
const MOCK_PART_SCORES: Required<ExamPartScores> = {
  part1: 4,
  part2: 4,
  part3: 6,
  part4: 7,
  part5: 3,
};

function mapPartFeedback(raw: RawExamPartFeedback) {
  return ([1, 2, 3, 4, 5] as const)
    .map((partNumber) => ({
      partNumber,
      feedback: raw[`part${partNumber}` as keyof RawExamPartFeedback],
    }))
    .filter((part) => Boolean(part.feedback));
}

function mapPartScores(raw: ExamPartScores): ExamPartScores {
  return {
    part1: raw.part1 ?? MOCK_PART_SCORES.part1,
    part2: raw.part2 ?? MOCK_PART_SCORES.part2,
    part3: raw.part3 ?? MOCK_PART_SCORES.part3,
    part4: raw.part4 ?? MOCK_PART_SCORES.part4,
    part5: raw.part5 ?? MOCK_PART_SCORES.part5,
  };
}

export function mapExamGradingResult(raw: RawExamSummaryResult): ExamGradingResult {
  return {
    examId: raw.examId,
    totalScore: raw.totalScore,
    maxScore: TOEIC_SPEAKING_MAX_SCORE,
    levelEstimate: raw.levelEstimate,
    summary: raw.summary,
    overallFeedback: raw.overallFeedback,
    partFeedback: mapPartFeedback(raw.partFeedback),
    strengths: raw.strengths,
    weaknesses: raw.weaknesses,
    recommendedPractice: raw.recommendedPractice,
    partScores: mapPartScores(raw.partScores),
  };
}
