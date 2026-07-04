export interface ExamPartMeta {
  titleKo: string;
  titleEn: string;
}

export const EXAM_PART_META: Record<number, ExamPartMeta> = {
  1: { titleKo: "지문 읽기", titleEn: "Read a Text Aloud" },
  2: { titleKo: "사진 묘사", titleEn: "Describe a Picture" },
  3: { titleKo: "질문에 답하기", titleEn: "Respond to Questions" },
  4: {
    titleKo: "정보를 활용해 답하기",
    titleEn: "Respond to Questions Using Information Provided",
  },
  5: { titleKo: "의견 제시하기", titleEn: "Express an Opinion" },
};

export function getExamPartMeta(part: number): ExamPartMeta {
  return EXAM_PART_META[part] ?? { titleKo: `Part ${part}`, titleEn: `Part ${part}` };
}

/** 파트별 문제 번호. 토익 스피킹 정규 구성(Part1~2: 2문제, Part3~4: 3문제, Part5: 1문제) 기준. */
export const EXAM_PART_QUESTION_NUMBERS: Record<number, number[]> = {
  1: [1, 2],
  2: [3, 4],
  3: [5, 6, 7],
  4: [8, 9, 10],
  5: [11],
};

export function getExamPartQuestionNumbers(part: number): number[] {
  return EXAM_PART_QUESTION_NUMBERS[part] ?? [];
}
