import { PartFeedbackCard } from "@/components/app-exam-screen/components/PartFeedbackCard";
import type { FeedbackPartViewModel } from "@/components/app-exam-screen/feedback-view-model";

type PartFeedbackSectionProps = {
  parts: readonly FeedbackPartViewModel[];
  onOpenQuestion: (
    partNumber: FeedbackPartViewModel["partNumber"],
    questionNumber: number,
  ) => void;
};

export function PartFeedbackSection({
  parts,
  onOpenQuestion,
}: PartFeedbackSectionProps) {
  return (
    <section className="mt-10">
      <h2 className="text-2xl text-blue-950">파트별 피드백</h2>
      <p className="mt-2 text-base text-zinc-500">
        버튼을 누르면 해당 문제의 상세 피드백으로 이어져요.
      </p>
      <div className="mt-5 flex flex-col gap-4">
        {parts.map((part) => (
          <PartFeedbackCard
            key={part.partNumber}
            part={part}
            onOpenQuestion={onOpenQuestion}
          />
        ))}
      </div>
    </section>
  );
}
