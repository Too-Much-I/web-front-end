"use client";

import { ExamResultScreen } from "@/components/exam/exam-result-screen";
import type { ExamGradingResult } from "@/types/exam";

const mockResult: ExamGradingResult = {
  examId: "preview",
  totalScore: 130,
  maxScore: 200,
  levelEstimate: "IH",
  summary: "전반적으로 발음과 유창성이 좋아요.",
  overallFeedback: "전반적으로 발음과 유창성이 좋아요.",
  partFeedback: [
    { partNumber: 1, feedback: "낭독이 안정적이에요." },
    { partNumber: 2, feedback: "사진 묘사가 구체적이에요." },
  ],
  strengths: ["발음이 명확해요", "속도가 적절해요"],
  weaknesses: ["문법 오류가 있어요", "어휘가 단조로워요"],
  recommendedPractice: ["매일 낭독 연습하기"],
  partScores: { part1: 30, part2: 40, part3: 20, part4: 20, part5: 20 },
};

export default function PreviewPage() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <ExamResultScreen result={mockResult} />
    </div>
  );
}
