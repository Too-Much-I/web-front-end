import { MessageCircle } from "lucide-react";
import Image from "next/image";

import { feedbackMascots } from "@/components/app-exam-screen/assets";
import { cardShadow, feedbackColors } from "@/components/app-exam-screen/theme";

export function OverallCommentCard({ feedback }: { feedback: string }) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-row items-center gap-2">
        <MessageCircle aria-hidden size={20} color={feedbackColors.ink} />
        <h2 className="text-xl">종합 피드백</h2>
      </div>
      <div
        className="overflow-hidden rounded-3xl border p-5"
        style={{
          ...cardShadow,
          backgroundColor: feedbackColors.cardTint,
          borderColor: feedbackColors.cardLine,
        }}
      >
        <p className="text-base leading-8 text-zinc-800">{feedback}</p>
        <div className="mt-5 flex flex-row items-end justify-end">
          <Image
            alt=""
            src={feedbackMascots.overall}
            width={256}
            height={256}
            className="h-28 w-20 object-contain"
          />
        </div>
      </div>
    </section>
  );
}
