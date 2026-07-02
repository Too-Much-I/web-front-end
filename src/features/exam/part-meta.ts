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
