"use client";

import { ExamQuestionFeedbackScreen } from "@/components/exam/exam-question-feedback-screen";
import type { ExamQuestionDetail } from "@/types/exam";

const mockDetail: ExamQuestionDetail = {
  examId: "preview",
  partNumber: 2,
  questionNumber: 3,
  audioUrl: "",
  score: 7,
  maxScore: 10,
  transcript: "In the picture, I can see a man sitting at a desk working on a laptop.",
  feedback: {
    summary: "전반적으로 사진 묘사가 구체적이고 유창해요.",
    level: "IH",
    strengths: ["문장 구조가 다양해요", "핵심 사물을 잘 짚었어요"],
    weaknesses: ["세부 묘사가 조금 부족해요"],
    pronunciation: "발음이 명확해요.",
    fluency: "속도가 적절해요.",
    content: "사진의 핵심 요소를 잘 설명했어요.",
    pronunciationFluencyScore: 80,
    contentRelevanceScore: 6,
    grammarVocabulary: "문법 오류가 거의 없어요.",
    actionItems: ["세부 사물 묘사 연습하기"],
    correctionItems: [],
    nextStrategy: "배경 묘사를 조금 더 추가해보세요.",
  },
  spokenWordSequence: [],
};

export default function PreviewPage() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <ExamQuestionFeedbackScreen examId="preview" detail={mockDetail} />
    </div>
  );
}
