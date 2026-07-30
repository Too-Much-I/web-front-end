"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AtAGlanceSection } from "@/components/app-exam-screen/components/AtAGlanceSection";
import { FeedbackHeader } from "@/components/app-exam-screen/components/FeedbackHeader";
import { OverallCommentCard } from "@/components/app-exam-screen/components/OverallCommentCard";
import { PartFeedbackSection } from "@/components/app-exam-screen/components/PartFeedbackSection";
import { PartScoreBoard } from "@/components/app-exam-screen/components/PartScoreBoard";
import { ScoreSummaryCard } from "@/components/app-exam-screen/components/ScoreSummaryCard";
import {
  createFeedbackParts,
  createRadarAxes,
} from "@/components/app-exam-screen/feedback-view-model";
import { feedbackColors } from "@/components/app-exam-screen/theme";
import type { ExamGradingResult } from "@/types/exam";

export function AppExamScreen({ result }: { result: ExamGradingResult }) {
  const router = useRouter();
  const [isScoreBoardRevealed, setIsScoreBoardRevealed] = useState(false);
  const parts = useMemo(() => createFeedbackParts(result), [result]);
  const radarAxes = useMemo(() => createRadarAxes(parts), [parts]);

  return (
    <main
      className="min-h-dvh"
      style={{ backgroundColor: feedbackColors.surfaceSubtle }}
    >
      <div className="mx-auto w-full max-w-3xl px-5 pb-14">
        <FeedbackHeader />
        <ScoreSummaryCard result={result} />
        <AtAGlanceSection
          strengths={result.strengths}
          weaknesses={result.weaknesses}
        />
        <OverallCommentCard feedback={result.overallFeedback} />
        <PartFeedbackSection
          parts={parts}
          onOpenQuestion={(_partNumber, questionNumber) => {
            const params = new URLSearchParams({
              examId: result.examId,
              questionNumber: String(questionNumber),
              source: "app",
            });
            router.push(`/exam/result/question?${params.toString()}`);
          }}
        />
        <PartScoreBoard
          axes={radarAxes}
          isRevealed={isScoreBoardRevealed}
          onToggle={() => setIsScoreBoardRevealed((current) => !current)}
        />
      </div>
    </main>
  );
}
