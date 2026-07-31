"use client";

import Image from "next/image";
import { useState } from "react";

import { cardShadow, feedbackColors } from "@/components/app-exam-screen/theme";
import { ReadingGuideAnswer } from "@/components/app-question-feedback/components/ReadingGuideAnswer";
import type { ExamQuestionFeedback } from "@/types/exam";

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
  const answerPanelStyle = {
    backgroundColor: feedbackColors.cardTint,
    // ring 색은 인라인 style로 못 주므로 boxShadow로 테두리를 만든다.
    boxShadow: `inset 0 0 0 1px ${feedbackColors.cardLine}`,
  };

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

      {isReadAloud ? (
        <div
          className="relative rounded-2xl p-4 ring-1"
          style={answerPanelStyle}
        >
          <div className="flex items-center gap-2.5">
            <div className="relative h-14 w-14 shrink-0">
              <Image
                src="/mascots/rabbit_teacher.png"
                alt=""
                aria-hidden
                fill
                sizes="56px"
                className="object-contain drop-shadow-md"
              />
            </div>
            <span className="text-sm" style={{ color: feedbackColors.brand }}>
              이렇게 읽어보면 좋아요
            </span>
          </div>
          <div className="mt-3">
            <ReadingGuideAnswer text={shown ?? ""} />
          </div>
        </div>
      ) : (
        <div className="flex items-end gap-3">
          <div className="relative h-20 w-20 shrink-0">
            <Image
              src="/mascots/rabbit_teacher.png"
              alt=""
              aria-hidden
              fill
              sizes="80px"
              className="object-contain drop-shadow-md"
            />
          </div>
          <div
            className="relative flex-1 rounded-2xl p-4 ring-1"
            style={answerPanelStyle}
          >
            <span className="text-sm" style={{ color: feedbackColors.brand }}>
              {active === "model" ? "토선생의 모범답안" : "토선생의 추천답안"}
            </span>
            <p className="mt-2 text-sm leading-relaxed text-zinc-700">
              {shown}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
