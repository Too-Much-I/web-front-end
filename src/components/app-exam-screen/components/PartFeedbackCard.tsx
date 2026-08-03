import { ChevronRight } from "lucide-react";
import Image from "next/image";

import type { FeedbackPartViewModel } from "@/components/app-exam-screen/feedback-view-model";
import { cardShadow, feedbackColors } from "@/components/app-exam-screen/theme";

type PartFeedbackCardProps = {
  part: FeedbackPartViewModel;
  onOpenQuestion: (questionNumber: number) => void;
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
              <h3 className="mt-1 text-sm text-blue-950">{part.titleKo}</h3>
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
          <li key={questionNumber}>
            <button
              type="button"
              aria-label={`문제 ${questionNumber}번 피드백 보기`}
              className="flex min-h-11 items-center gap-1 rounded-full px-3.5 py-2 text-sm transition-transform active:scale-95"
              style={{
                color: feedbackColors.part.actionText,
                backgroundColor: feedbackColors.part.action,
              }}
              onClick={() => onOpenQuestion(questionNumber)}
            >
              <span>Q{questionNumber}</span>
              <ChevronRight aria-hidden size={16} />
            </button>
          </li>
        ))}
      </ul>
    </article>
  );
}
