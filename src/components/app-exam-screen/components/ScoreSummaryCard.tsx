"use client";

import { Star } from "lucide-react";
import Image from "next/image";

import { selectScoreMascot } from "@/components/app-exam-screen/feedback-view-model";
import { cardShadow, feedbackColors } from "@/components/app-exam-screen/theme";
import { TypedText } from "@/components/exam/typed-text";
import { getLevelAbbreviation } from "@/features/exam/target-grade";
import { useCountUp } from "@/lib/use-count-up";
import type { ExamGradingResult } from "@/types/exam";

export function ScoreSummaryCard({ result }: { result: ExamGradingResult }) {
  const displayScore = useCountUp(result.totalScore);
  const displayPercent = Math.min(
    100,
    Math.max(0, (displayScore / result.maxScore) * 100),
  );
  const levelAbbreviation = getLevelAbbreviation(result.levelEstimate);
  const scoreMascot = selectScoreMascot(result.totalScore, result.maxScore);

  return (
    <section
      aria-labelledby="app-exam-total-score-heading"
      className="relative rounded-3xl p-2"
      style={{ ...cardShadow, backgroundColor: feedbackColors.wood }}
    >
      <div
        className="rounded-2xl border-2 p-5"
        style={{
          borderColor: feedbackColors.woodLight,
          backgroundColor: feedbackColors.scoreSurface,
        }}
      >
        <div className="flex flex-row items-center gap-2">
          <Star aria-hidden size={18} color={feedbackColors.radarFill} />
          <h2
            id="app-exam-total-score-heading"
            className="text-base"
            style={{ color: feedbackColors.radarFill }}
          >
            예상 총점
          </h2>
        </div>

        <div className="mt-4 flex flex-row items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="flex flex-row flex-nowrap items-end gap-2 whitespace-nowrap">
              <strong className="shrink-0 text-3xl font-normal text-white">
                {displayScore}
              </strong>
              <span
                className="shrink-0 pb-1 text-lg"
                style={{ color: feedbackColors.chalkMuted }}
              >
                / {result.maxScore}
              </span>
            </p>
            <p
              className="mt-1 text-sm"
              style={{ color: feedbackColors.radarFill }}
            >
              {levelAbbreviation} 예상
            </p>
          </div>
          <div
            className="w-20 shrink-0 rounded-2xl border px-3 py-2"
            style={{ borderColor: feedbackColors.radarFill }}
          >
            <p
              className="text-center text-xs"
              style={{ color: feedbackColors.radarFill }}
            >
              LEVEL
            </p>
            <p className="mt-1 text-center text-xl text-white">
              {levelAbbreviation}
            </p>
          </div>
        </div>

        <div
          role="progressbar"
          aria-label={`예상 점수 ${result.totalScore}점, 만점 ${result.maxScore}점`}
          aria-valuemin={0}
          aria-valuemax={result.maxScore}
          aria-valuenow={result.totalScore}
          className="mt-5 h-3 overflow-hidden rounded-full"
          style={{ backgroundColor: feedbackColors.scoreTrack }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${displayPercent}%`,
              backgroundColor: feedbackColors.radarFill,
            }}
          />
        </div>

        <div className="mt-5">
          <TypedText
            text={result.summary}
            className="text-base leading-7 text-white"
          />
          <div
            aria-hidden
            className="pointer-events-none relative mt-2 h-8 w-16"
          >
            <Image
              alt=""
              src={scoreMascot}
              width={256}
              height={256}
              className="absolute -bottom-14 -left-5 z-10 h-24 w-16 max-w-none object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
