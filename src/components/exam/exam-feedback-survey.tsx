"use client";

import { Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

import { SatisfactionStars } from "@/components/exam/satisfaction-stars";
import { getOrCreateAnonymousId } from "@/features/consent/anonymous-id";
import { TARGET_GRADE_OPTIONS } from "@/features/exam/target-grade";
import { submitExamSurvey } from "@/features/survey/api/submit-exam-survey";
import { cn } from "@/lib/utils";

const PRICE_OPTIONS = [
  { id: "0", label: "0원 (무료가 아니면 이용하지 않을 것 같아요)" },
  { id: "3000", label: "3,000원" },
  { id: "5000", label: "5,000원" },
  { id: "10000", label: "10,000원" },
  { id: "15000", label: "15,000원 이상" },
];

const PREVIOUS_GRADE_OPTIONS = [
  ...TARGET_GRADE_OPTIONS.map((option) => ({
    id: option.id,
    label: option.levelLabel,
  })),
  { id: "none", label: "안 봄" },
];

const CONFETTI_COLORS = ["#fbbf24", "#f9a8d4", "#7dd3fc", "#6ee7b7", "#fdba74"];

const CONFETTI = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2;
  const distance = 34 + (i % 3) * 12;
  return {
    tx: Math.cos(angle) * distance,
    ty: Math.sin(angle) * distance,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  };
});

export function ExamFeedbackSurvey({
  initialSatisfaction = null,
}: {
  initialSatisfaction?: number | null;
}) {
  const [contact, setContact] = useState("");
  const [satisfaction, setSatisfaction] = useState<number | null>(
    initialSatisfaction,
  );
  const [opinion, setOpinion] = useState("");
  const [priceId, setPriceId] = useState<string | null>(null);
  const [previousGradeId, setPreviousGradeId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isPopping, setIsPopping] = useState(false);

  // initialSatisfaction이 null로 바뀌어도 satisfaction은 의도적으로 유지한다.
  // 이미 별점을 골랐다면 그 선택을 지우지 않기 위함(사용자가 스크롤 팝업에서 평가한 뒤
  // 설문 페이지로 넘어오는 흐름에서, URL 쿼리 유무와 무관하게 선택이 보존돼야 함).
  const [prevInitialSatisfaction, setPrevInitialSatisfaction] = useState(initialSatisfaction);
  if (initialSatisfaction !== prevInitialSatisfaction) {
    setPrevInitialSatisfaction(initialSatisfaction);
    if (initialSatisfaction !== null) setSatisfaction(initialSatisfaction);
  }

  const handleGiftClick = () => {
    if (isPopping) return;
    setIsPopping(true);
    setTimeout(() => setIsPopping(false), 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (satisfaction === null || submitting) return;

    setSubmitting(true);
    try {
      await submitExamSurvey({
        anonymousId: getOrCreateAnonymousId(),
        satisfaction,
        previousGrade: previousGradeId,
        priceWillingness: priceId,
        opinion,
        contact,
        submittedAt: new Date().toISOString(),
      });
      setSubmitted(true);
      toast.success("설문 제출 완료!", {
        description: "프리미엄형 모의고사 1회 응시권을 곧 보내드릴게요.",
        className: "toast-face-icon",
        icon: (
          <Image
            src="/mascots/rabbit_face.png"
            alt=""
            width={40}
            height={40}
            className="object-contain"
          />
        ),
      });
    } catch {
      toast.error("설문 제출에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="exam-feedback-survey" className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-200 via-sky-100 to-blue-50 p-6 shadow-md sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-pink-200/70 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-14 left-1/4 h-36 w-36 rounded-full bg-amber-100/70 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/3 -right-10 h-40 w-40 rounded-full bg-emerald-100/60 blur-2xl"
        />

        <Star
          aria-hidden
          className="pointer-events-none absolute top-6 left-[38%] size-5 rotate-12 fill-amber-300 text-amber-300 sm:size-6"
        />
        <Star
          aria-hidden
          className="pointer-events-none absolute top-14 left-[52%] size-3 -rotate-12 fill-white text-white sm:size-4"
        />
        <Star
          aria-hidden
          className="pointer-events-none absolute top-4 right-[26%] size-4 rotate-6 fill-pink-300 text-pink-300"
        />
        <Star
          aria-hidden
          className="pointer-events-none absolute bottom-24 left-6 size-4 -rotate-6 fill-sky-300 text-sky-300 sm:bottom-28"
        />

        <button
          type="button"
          onClick={handleGiftClick}
          aria-label="선물 상자 열어보기"
          className="absolute top-4 right-6 h-16 w-16 cursor-pointer sm:top-6 sm:right-12 sm:h-24 sm:w-24"
        >
          <div
            className={cn(
              isPopping
                ? "absolute top-1/2 left-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 animate-[gift-pop_0.5s_ease-out] sm:h-52 sm:w-52"
                : "relative h-full w-full rotate-6",
            )}
          >
            <Image
              src={isPopping ? "/mascots/pop_gift.png" : "/mascots/gift.png"}
              alt="선물 상자"
              fill
              sizes={isPopping ? "208px" : "96px"}
              className="object-contain drop-shadow-lg"
            />
          </div>

          {isPopping && (
            <div aria-hidden className="pointer-events-none absolute inset-0">
              {CONFETTI.map((c, i) => (
                <span
                  key={i}
                  className="absolute top-1/2 left-1/2 size-1.5 rounded-full"
                  style={
                    {
                      backgroundColor: c.color,
                      "--tx": `${c.tx}px`,
                      "--ty": `${c.ty}px`,
                      animation: "confetti-burst 0.6s ease-out forwards",
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          )}
        </button>

        <span className="relative inline-block rounded-full bg-orange-400 px-3 py-1 text-xs font-semibold text-white">
          EVENT
        </span>
        <h2 className="relative mt-3 text-xl font-bold text-blue-950 sm:text-2xl">
          설문에 참여하고 프리미엄형 모의고사 1회 받기
        </h2>
        <p className="relative mt-2 text-sm leading-relaxed text-blue-800">
          아래 설문에 답해주시면 프리미엄형 모의고사 1회 응시권을 무료로
          드려요. 만족도만 필수이고 나머지 항목은 선택이에요.
        </p>

        <div className="relative mx-auto mt-2 h-16 w-full max-w-md sm:h-24">
          <Image
            src={submitted ? "/mascots/smile.png" : "/mascots/please.png"}
            alt={
              submitted
                ? "웃고 있는 토선생 캐릭터들"
                : "설문을 부탁하는 토선생 캐릭터들"
            }
            fill
            sizes="400px"
            className="object-contain"
          />
        </div>

        {submitted ? (
          <div className="relative mt-6 rounded-2xl bg-white p-6 text-center text-zinc-700 shadow-lg">
            <p className="text-base font-semibold text-blue-950">
              소중한 의견 감사해요!
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              프리미엄형 모의고사 1회 응시권을 곧 보내드릴게요.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="relative mt-6 flex flex-col gap-5 rounded-2xl bg-white p-5 text-zinc-900 shadow-lg sm:p-6"
          >
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-blue-950">
                만족도 <span className="font-normal text-orange-500">(필수)</span>
              </span>
              <SatisfactionStars
                value={satisfaction}
                onChange={(score) =>
                  setSatisfaction((prev) => (prev === score ? null : score))
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-blue-950">
                이전에 실제로 응시했던 토익스피킹 등급{" "}
                <span className="font-normal text-zinc-400">(선택)</span>
              </span>
              <div
                role="radiogroup"
                aria-label="이전 실제 응시 등급"
                className="flex flex-wrap gap-2"
              >
                {PREVIOUS_GRADE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={previousGradeId === option.id}
                    onClick={() =>
                      setPreviousGradeId((prev) =>
                        prev === option.id ? null : option.id,
                      )
                    }
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 transition-colors",
                      previousGradeId === option.id
                        ? "bg-orange-50 text-orange-600 ring-orange-300"
                        : "text-zinc-600 ring-zinc-200 hover:bg-zinc-50",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-400">
                토익 스피킹을 이미 응시해 본 적이 있다면 실제로 받았던 등급을
                선택해 주세요. 응시한 적이 없다면 &apos;안 봄&apos;을
                선택해 주세요.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-blue-950">
                이 모의고사에 지불할 의향이 있는 금액{" "}
                <span className="font-normal text-zinc-400">(선택)</span>
              </span>
              <div role="radiogroup" aria-label="지불 의향 금액" className="flex flex-wrap gap-2">
                {PRICE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={priceId === option.id}
                    onClick={() =>
                      setPriceId((prev) => (prev === option.id ? null : option.id))
                    }
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 transition-colors",
                      priceId === option.id
                        ? "bg-orange-50 text-orange-600 ring-orange-300"
                        : "text-zinc-600 ring-zinc-200 hover:bg-zinc-50",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="survey-opinion" className="text-sm font-semibold text-blue-950">
                의견 <span className="font-normal text-zinc-400">(선택)</span>
              </label>
              <textarea
                id="survey-opinion"
                value={opinion}
                onChange={(e) => setOpinion(e.target.value)}
                rows={3}
                placeholder="개선했으면 하는 점이나 느낀 점을 자유롭게 남겨주세요"
                className="resize-none rounded-xl px-3 py-2 text-sm text-zinc-900 ring-1 ring-zinc-200 placeholder:text-zinc-400 focus:ring-2 focus:ring-orange-300 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="survey-contact" className="text-sm font-semibold text-blue-950">
                전화번호 또는 이메일{" "}
                <span className="font-normal text-zinc-400">(선택)</span>
              </label>
              <input
                id="survey-contact"
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="010-0000-0000 또는 example@email.com"
                className="rounded-xl px-3 py-2 text-sm text-zinc-900 ring-1 ring-zinc-200 placeholder:text-zinc-400 focus:ring-2 focus:ring-orange-300 focus:outline-none"
              />
              <p className="text-xs font-semibold text-orange-500">
                남기지 않으면 응시권을 보내드릴 수 없으니 꼭 남겨주세요!
              </p>
            </div>

            <button
              type="submit"
              disabled={satisfaction === null || submitting}
              className="mt-1 rounded-full bg-orange-400 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400 disabled:hover:bg-zinc-200"
            >
              {submitting ? "제출 중..." : "설문 제출하고 응시권 받기"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
