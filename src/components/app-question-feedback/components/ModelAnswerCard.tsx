"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { cardShadow, feedbackColors } from "@/components/app-exam-screen/theme";
import { ReadingGuideAnswer } from "@/components/app-question-feedback/components/ReadingGuideAnswer";
import { StickyNote } from "@/components/app-question-feedback/components/StickyNote";
import type { ExamQuestionFeedback } from "@/types/exam";

/**
 * 답안 위를 덮는 가리개. 스스로 먼저 답을 떠올려 보게 하는 용도라
 * 블러가 아니라 불투명 레이어로 덮는다 — 블러는 글자 윤곽이 남아 가리개 역할을 못 한다.
 * 레이어 전체가 버튼이라 어디를 눌러도 공개된다.
 */
function AnswerMask({ onReveal }: { onReveal: () => void }) {
  return (
    <button
      type="button"
      onClick={onReveal}
      aria-label="답안 보기"
      className="absolute inset-0 flex items-center justify-center rounded-sm"
      style={{
        backgroundColor: feedbackColors.cardTint,
        // 글자를 지운 빈 메모지처럼 보이도록 옅은 가로줄만 남긴다.
        backgroundImage: `repeating-linear-gradient(180deg, transparent 0 27px, ${feedbackColors.cardLine}59 27px 28px)`,
      }}
    >
      <span className="rounded-full bg-white/85 px-3 py-1.5 text-xs text-zinc-500 shadow-sm">
        탭하면 답안이 보여요
      </span>
    </button>
  );
}

function MaskToggleButton({
  isMasked,
  onToggle,
}: {
  isMasked: boolean;
  onToggle: () => void;
}) {
  const Icon = isMasked ? Eye : EyeOff;
  return (
    <button
      type="button"
      aria-pressed={isMasked}
      onClick={onToggle}
      className="-mr-2 flex min-h-11 items-center gap-1 px-2 text-xs text-zinc-500"
    >
      <Icon className="size-4" aria-hidden />
      {isMasked ? "보기" : "가리기"}
    </button>
  );
}

/** correctedAnswer가 모범답안, recommendedAnswer가 추천답안. 둘 다 없을 수도, 하나만 있을 수도 있다. */
export function ModelAnswerCard({
  feedback,
  isReadAloud,
}: {
  feedback: ExamQuestionFeedback;
  isReadAloud: boolean;
}) {
  const hasModel = Boolean(feedback.correctedAnswer);
  const hasRecommended = Boolean(feedback.recommendedAnswer);
  const [active, setActive] = useState<"model" | "recommended">(
    hasModel ? "model" : "recommended",
  );
  // 기본은 공개. 탭을 바꿔도 가림 상태는 그대로 둔다.
  const [isMasked, setIsMasked] = useState(false);

  if ((isReadAloud && !hasRecommended) || (!hasModel && !hasRecommended)) {
    return (
      <div className="rounded-3xl bg-white p-6 text-center" style={cardShadow}>
        <p className="text-sm text-zinc-400">
          {isReadAloud
            ? "아직 추천답안이 없어요"
            : "아직 모범·추천 답안이 없어요"}
        </p>
      </div>
    );
  }

  const shown = isReadAloud
    ? feedback.recommendedAnswer
    : active === "model"
      ? feedback.correctedAnswer
      : feedback.recommendedAnswer;

  return (
    <section
      aria-label={isReadAloud ? "추천답안 읽기 안내" : "모범·추천답안"}
      className="flex flex-col gap-4 rounded-3xl bg-white p-5"
      style={cardShadow}
    >
      {!isReadAloud && hasModel && hasRecommended && (
        <>
          <div className="flex gap-2">
            {(["model", "recommended"] as const).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={active === key}
                onClick={() => setActive(key)}
                className={`min-h-11 flex-1 rounded-full px-4 text-sm transition-colors ${
                  active === key
                    ? "bg-blue-950 text-white"
                    : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {key === "model" ? "모범답안" : "추천답안"}
              </button>
            ))}
          </div>
          <p
            className="text-sm leading-6"
            style={{ color: feedbackColors.brand }}
          >
            모범답안은 문제에 맞춰 미리 준비된 예시 답변이고, 추천답안은 내가
            답변한 내용을 다듬어 만든 답변이에요.
          </p>
        </>
      )}

      <StickyNote>
        {/* 가리개는 답안 문단만 덮는다 — 어떤 답안을 보고 있는지는 가려진 상태에서도 남아야 한다. */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm" style={{ color: feedbackColors.brand }}>
            {isReadAloud
              ? "이렇게 읽어보면 좋아요"
              : active === "model"
                ? "토선생의 모범답안"
                : "토선생의 추천답안"}
          </span>
          {/* 읽기 안내(Part 1)는 마크업을 보며 따라 읽는 용도라 가리면 기능이 죽는다. */}
          {!isReadAloud && (
            <MaskToggleButton
              isMasked={isMasked}
              onToggle={() => setIsMasked((masked) => !masked)}
            />
          )}
        </div>

        {isReadAloud ? (
          <div className="mt-3">
            <ReadingGuideAnswer text={shown ?? ""} />
          </div>
        ) : (
          <div className="relative mt-2">
            {/* 가릴 때 높이가 접히면 스크롤이 튀므로 문단은 자리를 지킨 채 숨긴다. */}
            <p
              className={`text-sm leading-relaxed text-zinc-700 ${
                isMasked ? "invisible" : ""
              }`}
            >
              {shown}
            </p>
            {isMasked && <AnswerMask onReveal={() => setIsMasked(false)} />}
          </div>
        )}
      </StickyNote>
    </section>
  );
}
