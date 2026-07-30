import { ChevronRight } from "lucide-react";
import Image from "next/image";

import type { FeedbackPartViewModel } from "@/components/app-exam-screen/feedback-view-model";
import { cardShadow, feedbackColors } from "@/components/app-exam-screen/theme";

type PartFeedbackCardProps = {
  part: FeedbackPartViewModel;
  onOpenQuestion: (
    partNumber: FeedbackPartViewModel["partNumber"],
    questionNumber: number,
  ) => void;
};

function getStatusColors(status: FeedbackPartViewModel["status"]) {
  return {
    positive: {
      accent: feedbackColors.part.positive,
      soft: feedbackColors.part.positiveSoft,
    },
    caution: {
      accent: feedbackColors.part.caution,
      soft: feedbackColors.part.cautionSoft,
    },
    improvement: {
      accent: feedbackColors.part.improvement,
      soft: feedbackColors.part.improvementSoft,
    },
    pending: {
      accent: feedbackColors.part.pending,
      soft: feedbackColors.part.pendingSoft,
    },
  }[status];
}

export function PartFeedbackCard({
  part,
  onOpenQuestion,
}: PartFeedbackCardProps) {
  const statusColors = getStatusColors(part.status);
  const firstQuestion = part.questionNumbers[0];

  return (
    <article
      className="relative overflow-hidden rounded-3xl border p-4"
      style={{
        ...cardShadow,
        borderColor: feedbackColors.part.border,
        backgroundColor: feedbackColors.part.surface,
      }}
    >
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ backgroundColor: feedbackColors.part.accent }}
      />
      <div className="flex flex-row items-start gap-3 pl-1">
        <Image
          alt=""
          src={part.mascot}
          width={256}
          height={256}
          className="h-16 w-16 shrink-0 object-contain"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-row flex-wrap items-center justify-between gap-2">
            <div>
              <p
                className="text-lg"
                style={{ color: feedbackColors.part.accent }}
              >
                Part {part.partNumber}
              </p>
              <h3 className="mt-1 text-sm text-zinc-900">{part.titleKo}</h3>
            </div>
            <span
              className="rounded-full px-3 py-1.5 text-sm"
              style={{
                color: statusColors.accent,
                backgroundColor: statusColors.soft,
              }}
            >
              {part.statusLabel}
            </span>
          </div>
          <p
            className="mt-3 text-base leading-7"
            style={{ color: feedbackColors.part.body }}
          >
            {part.feedback}
          </p>
        </div>
      </div>

      <ul className="mt-4 flex flex-row flex-wrap gap-2 pl-1">
        {part.questionNumbers.map((questionNumber) => (
          <li
            key={questionNumber}
            className="rounded-full px-3 py-1.5 text-sm"
            style={{
              color: feedbackColors.part.actionText,
              backgroundColor: feedbackColors.part.action,
            }}
          >
            Q{questionNumber}
          </li>
        ))}
      </ul>

      <button
        type="button"
        aria-label={`Part ${part.partNumber} 문항별 피드백 보기`}
        className="mt-3 flex w-full flex-row items-center justify-between rounded-2xl px-4 py-3 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ backgroundColor: feedbackColors.part.action }}
        disabled={firstQuestion === undefined}
        onClick={() => {
          if (firstQuestion !== undefined) {
            onOpenQuestion(part.partNumber, firstQuestion);
          }
        }}
      >
        <span
          className="text-base"
          style={{ color: feedbackColors.part.actionText }}
        >
          문항별 피드백 보기
        </span>
        <ChevronRight
          aria-hidden
          size={19}
          color={feedbackColors.part.actionText}
        />
      </button>
    </article>
  );
}
