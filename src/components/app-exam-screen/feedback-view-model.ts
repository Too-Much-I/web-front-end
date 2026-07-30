import {
  EXAM_PART_META,
  getExamPartQuestionNumbers,
} from "@/features/exam/part-meta";
import { feedbackMascots } from "@/components/app-exam-screen/assets";
import type { ExamGradingResult } from "@/types/exam";

export const FEEDBACK_PART_NUMBERS = [1, 2, 3, 4, 5] as const;

export type FeedbackPartNumber = (typeof FEEDBACK_PART_NUMBERS)[number];
export type FeedbackPartStatus =
  "positive" | "caution" | "improvement" | "pending";

export type FeedbackPartViewModel = {
  partNumber: FeedbackPartNumber;
  titleKo: string;
  score: number | null;
  maxScore: number;
  ratio: number | null;
  status: FeedbackPartStatus;
  statusLabel: string;
  feedback: string;
  questionNumbers: number[];
  mascot: string;
};

export type RadarAxis = {
  partNumber: FeedbackPartNumber;
  label: `Part ${FeedbackPartNumber}`;
  titleKo: string;
  score: number | null;
  maxScore: number;
  ratio: number | null;
};

type PartPresentation = {
  maxScore: number;
  mascot: string;
};

const PART_PRESENTATION: Record<FeedbackPartNumber, PartPresentation> = {
  1: {
    maxScore: 6,
    mascot: feedbackMascots.part1,
  },
  2: {
    maxScore: 6,
    mascot: feedbackMascots.part2,
  },
  3: {
    maxScore: 9,
    mascot: feedbackMascots.part3,
  },
  4: {
    maxScore: 9,
    mascot: feedbackMascots.part4,
  },
  5: {
    maxScore: 5,
    mascot: feedbackMascots.part5,
  },
};

function getPartStatus(ratio: number | null): {
  status: FeedbackPartStatus;
  statusLabel: string;
} {
  if (ratio === null) {
    return { status: "pending", statusLabel: "점수 없음" };
  }
  if (ratio >= 0.8) {
    return { status: "positive", statusLabel: "좋음" };
  }
  if (ratio >= 0.6) {
    return { status: "caution", statusLabel: "보통" };
  }
  return { status: "improvement", statusLabel: "개선 필요" };
}

function getPartScore(
  result: ExamGradingResult,
  partNumber: FeedbackPartNumber,
) {
  switch (partNumber) {
    case 1:
      return result.partScores.part1;
    case 2:
      return result.partScores.part2;
    case 3:
      return result.partScores.part3;
    case 4:
      return result.partScores.part4;
    case 5:
      return result.partScores.part5;
  }
}

function normalizeScore(
  score: number | undefined,
  maxScore: number,
): number | null {
  if (
    score === undefined ||
    !Number.isFinite(score) ||
    maxScore <= 0 ||
    score < 0 ||
    score > maxScore
  ) {
    return null;
  }
  return score / maxScore;
}

/** 총점이 만점의 절반을 넘으면 웃는 토끼, 넘지 못하면 갸웃하는 토끼를 보여준다. */
export function selectScoreMascot(
  totalScore: number,
  maxScore: number,
): string {
  const ratio = normalizeScore(totalScore, maxScore);
  return ratio !== null && ratio > 0.5
    ? feedbackMascots.scoreGood
    : feedbackMascots.scoreHmm;
}

export function createFeedbackParts(
  result: ExamGradingResult,
): FeedbackPartViewModel[] {
  return FEEDBACK_PART_NUMBERS.map((partNumber) => {
    const presentation = PART_PRESENTATION[partNumber];
    const rawScore = getPartScore(result, partNumber);
    const ratio = normalizeScore(rawScore, presentation.maxScore);
    const score = ratio === null || rawScore === undefined ? null : rawScore;
    const { status, statusLabel } = getPartStatus(ratio);
    const questionNumbers = getExamPartQuestionNumbers(partNumber).filter(
      (questionNumber) => questionNumber <= result.totalSolvedQuestions,
    );

    return {
      partNumber,
      titleKo: EXAM_PART_META[partNumber].titleKo,
      score,
      maxScore: presentation.maxScore,
      ratio,
      status,
      statusLabel,
      feedback:
        result.partFeedback.find((item) => item.partNumber === partNumber)
          ?.feedback ?? "아직 제공된 피드백이 없어요.",
      questionNumbers,
      mascot: presentation.mascot,
    };
  });
}

export function createRadarAxes(
  parts: readonly FeedbackPartViewModel[],
): RadarAxis[] {
  return FEEDBACK_PART_NUMBERS.map((partNumber) => {
    const part = parts.find((item) => item.partNumber === partNumber);
    const maxScore = part?.maxScore ?? PART_PRESENTATION[partNumber].maxScore;
    const score = part?.score ?? null;
    const ratio = part?.ratio ?? null;

    return {
      partNumber,
      label: `Part ${partNumber}`,
      titleKo: part?.titleKo ?? EXAM_PART_META[partNumber].titleKo,
      score,
      maxScore,
      ratio,
    };
  });
}
