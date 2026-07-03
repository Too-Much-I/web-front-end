"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { ExamFeedbackSurvey } from "@/components/exam/exam-feedback-survey";
import { ExamHeader } from "@/components/exam/exam-header";

function ExamSurveyContent() {
  const searchParams = useSearchParams();
  const satisfactionParam = searchParams.get("satisfaction");
  const initialSatisfaction = satisfactionParam ? Number(satisfactionParam) : null;

  return (
    <div className="flex flex-1 flex-col bg-white">
      <ExamHeader label="만족도 조사" />
      <ExamFeedbackSurvey initialSatisfaction={initialSatisfaction} />
    </div>
  );
}

export default function ExamSurveyPage() {
  return (
    <Suspense fallback={null}>
      <ExamSurveyContent />
    </Suspense>
  );
}
