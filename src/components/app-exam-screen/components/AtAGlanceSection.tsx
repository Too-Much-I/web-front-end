import { ArrowUpRight, Check, Star } from "lucide-react";

import { cardShadow, feedbackColors } from "@/components/app-exam-screen/theme";

type AtAGlanceSectionProps = {
  strengths: readonly string[];
  weaknesses: readonly string[];
  missingStrengths?: boolean;
  missingWeaknesses?: boolean;
};

function InsightCard({
  kind,
  items,
  isMissing = false,
}: {
  kind: "strength" | "weakness";
  items: readonly string[];
  isMissing?: boolean;
}) {
  const isStrength = kind === "strength";
  const accent = isStrength
    ? feedbackColors.positive
    : feedbackColors.part.improvement;
  const backgroundColor = isStrength
    ? feedbackColors.positiveSoft
    : feedbackColors.part.improvementSoft;
  const Icon = isStrength ? Check : ArrowUpRight;

  return (
    <article
      className="min-w-[150px] flex-1 rounded-3xl border border-zinc-200 bg-white p-4"
      style={cardShadow}
    >
      <div className="flex flex-row items-center gap-2">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor }}
        >
          <Icon aria-hidden size={19} color={accent} />
        </div>
        <h3 className="text-base" style={{ color: accent }}>
          {isStrength ? "강점" : "보완 포인트"}
        </h3>
      </div>
      <ul className="mt-4 flex flex-col gap-3">
        {isMissing && (
          <li className="text-sm leading-6 text-zinc-500">
            종합 피드백을 준비하지 못했어요.
          </li>
        )}
        {!isMissing &&
          items.map((item) => (
            <li key={item} className="flex flex-row items-start gap-2">
              <span
                aria-hidden
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: accent }}
              />
              <span className="min-w-0 flex-1 text-sm leading-6 text-zinc-500">
                {item}
              </span>
            </li>
          ))}
      </ul>
    </article>
  );
}

export function AtAGlanceSection({
  strengths,
  weaknesses,
  missingStrengths = false,
  missingWeaknesses = false,
}: AtAGlanceSectionProps) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-row items-center gap-2">
        <Star aria-hidden size={20} color={feedbackColors.ink} />
        <h2 className="text-xl">한눈에 보기</h2>
      </div>
      <div className="flex flex-row flex-wrap items-stretch gap-3">
        <InsightCard
          kind="strength"
          items={strengths}
          isMissing={missingStrengths}
        />
        <InsightCard
          kind="weakness"
          items={weaknesses}
          isMissing={missingWeaknesses}
        />
      </div>
    </section>
  );
}
