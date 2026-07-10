"use client";

import { ChevronRight, ThumbsUp, TriangleAlert } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ExamPartScoreRadar } from "@/components/exam/exam-part-score-radar";
import { ScrollSatisfactionPopup } from "@/components/exam/scroll-satisfaction-popup";
import { SketchyDashBorder } from "@/components/exam/sketchy-dash-border";
import { TargetGradeMascot } from "@/components/exam/target-grade-mascot";
import { TypedText } from "@/components/exam/typed-text";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getExamPartQuestionNumbers } from "@/features/exam/part-meta";
import {
  getStoredTargetGradeId,
  getTargetGradeOption,
  type TargetGradeOption,
} from "@/features/exam/target-grade";
import { gaegu } from "@/lib/fonts";
import type { ExamGradingResult } from "@/types/exam";

const PART_MASCOTS = [
  { src: "/mascots/rabbit.png", alt: "토끼 캐릭터" },
  { src: "/mascots/book.png", alt: "책을 든 거북이 캐릭터" },
  { src: "/mascots/mike.png", alt: "마이크를 든 앵무새 캐릭터" },
  { src: "/mascots/scoring.png", alt: "필기하는 고양이 캐릭터" },
  { src: "/mascots/books.png", alt: "쌓여있는 책들" },
];

export function ExamResultScreen({ result }: { result: ExamGradingResult }) {
  const scorePercent = Math.min(
    100,
    Math.max(0, (result.totalScore / result.maxScore) * 100),
  );

  const [targetGrade, setTargetGrade] = useState<TargetGradeOption | null>(null);
  const [isBetaTooltipOpen, setIsBetaTooltipOpen] = useState(false);

  useEffect(() => {
    // localStorage는 서버에 없으므로, SSR/하이드레이션 불일치를 피하기 위해 마운트 후에만 읽는다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTargetGrade(getTargetGradeOption(getStoredTargetGradeId()));
  }, []);

  const scoreGap = targetGrade ? targetGrade.score - result.totalScore : null;
  const mascot =
    scorePercent > 50
      ? { src: "/mascots/good_rabbit.png", alt: "만족스러워하는 토끼 캐릭터" }
      : { src: "/mascots/hmm_rabbit.png", alt: "고민하는 토끼 캐릭터" };

  return (
    <>
      <section className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-5">
            <Tooltip open={isBetaTooltipOpen} onOpenChange={setIsBetaTooltipOpen}>
              <TooltipTrigger
                className="shrink-0 cursor-help rounded-full"
                onClick={() => setIsBetaTooltipOpen((open) => !open)}
              >
                <Image
                  src="/mascots/beta.png"
                  alt="BETA"
                  width={88}
                  height={88}
                  className="drop-shadow-sm"
                />
              </TooltipTrigger>
              <TooltipContent side="right" align="start">
                현재 POC 단계에서 채점 결과에 부정확한 내용이 있을 수 있어요.
                정식 출시 시 더 정확한 채점을 제공해 드릴게요.
              </TooltipContent>
            </Tooltip>

            <div>
              <p className="text-sm font-semibold tracking-wide text-orange-600">
                SESSION ANALYSIS
              </p>
              <h1 className="mt-1 text-2xl font-bold text-blue-950 sm:text-3xl">
                채점 결과 리포트
              </h1>
            </div>
          </div>

          {targetGrade && scoreGap !== null && (
            <TargetGradeMascot targetGrade={targetGrade} scoreGap={scoreGap} />
          )}
        </div>

        <div className="relative mt-8">
          <div className="absolute bottom-0 left-0 z-10 h-40 w-40 -scale-x-100 sm:-left-4 sm:h-48 sm:w-48">
            <Image
              src={mascot.src}
              alt={mascot.alt}
              fill
              sizes="192px"
              className="object-contain drop-shadow-lg"
            />
          </div>

          <div className="rounded-3xl border-[10px] border-amber-900 bg-emerald-950 py-6 pr-6 pl-32 shadow-xl sm:pl-36">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-300">★</span>
                  <span className={`${gaegu.className} text-xl text-amber-100`}>
                    예상 총점
                  </span>
                </div>

                <p
                  className={`${gaegu.className} mt-4 text-5xl text-amber-50 sm:text-6xl`}
                >
                  {result.totalScore}
                  <span className="text-2xl text-white/50">
                    {" "}
                    / {result.maxScore}
                  </span>
                </p>
                <p className={`${gaegu.className} mt-2 text-base text-amber-200`}>
                  {result.levelEstimate}
                </p>

                <div className="mt-6 h-2 w-full rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-amber-300 transition-[width] duration-500"
                    style={{ width: `${scorePercent}%` }}
                  />
                </div>

                <TypedText
                  text={result.summary}
                  className={`${gaegu.className} mt-6 text-base leading-relaxed text-white/90`}
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-300">★</span>
                  <span className={`${gaegu.className} text-xl text-amber-100`}>
                    파트별 세부 점수
                  </span>
                </div>

                <div className="mt-2">
                  <ExamPartScoreRadar partScores={result.partScores} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="relative rounded-3xl bg-white p-6">
            <SketchyDashBorder />
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-950">
              <ThumbsUp className="size-4 text-orange-500" aria-hidden />
              강점
            </span>
            <ul className="mt-4 flex flex-col gap-2">
              {result.strengths.map((item, i) => (
                <li
                  key={i}
                  className="rounded-xl bg-zinc-50 p-3 text-sm leading-relaxed text-zinc-700 ring-1 ring-zinc-100"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative rounded-3xl bg-white p-6">
            <SketchyDashBorder />
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-950">
              <TriangleAlert className="size-4 text-orange-500" aria-hidden />
              보완 필요
            </span>
            <ul className="mt-4 flex flex-col gap-2">
              {result.weaknesses.map((item, i) => (
                <li
                  key={i}
                  className="rounded-xl bg-zinc-50 p-3 text-sm leading-relaxed text-zinc-700 ring-1 ring-zinc-100"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative mt-6 rounded-3xl bg-white p-6">
          <SketchyDashBorder />
          <span className="text-sm font-bold text-blue-950">종합 피드백</span>
          <p className="mt-3 text-sm leading-relaxed text-zinc-700">
            {result.overallFeedback}
          </p>
        </div>
      </section>

      <section className="px-6 py-10">
        <div className="mx-auto w-full max-w-5xl rounded-[2rem] bg-gradient-to-br from-orange-500 to-orange-300 p-6 shadow-[0_20px_45px_-20px_rgba(249,115,22,0.45)] sm:p-10">
          <h2 className="text-center text-2xl font-extrabold text-white sm:text-3xl">
            파트별 피드백
          </h2>

          <div className="mt-8 flex flex-col gap-10">
            {result.partFeedback.map((part, i) => {
              const mascot = PART_MASCOTS[i % PART_MASCOTS.length];
              return (
                <div key={part.partNumber} className="relative pt-5">
                  <div className="absolute top-0 left-0 z-10 rounded-t-xl bg-white px-4 py-1.5">
                    <span className="text-base font-extrabold text-orange-600">
                      Part {part.partNumber}
                    </span>
                  </div>

                  <div className="absolute -top-6 right-4 z-10 h-20 w-20 sm:right-8">
                    <Image
                      src={mascot.src}
                      alt={mascot.alt}
                      fill
                      sizes="80px"
                      className="object-contain drop-shadow-sm"
                    />
                  </div>

                  <div className="rounded-2xl rounded-tl-none bg-white p-5 text-left shadow-sm">
                    <p className="rounded-xl bg-sky-50 p-3 text-sm leading-relaxed text-sky-900 ring-1 ring-sky-100">
                      {part.feedback}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-sky-700">
                        문제별 피드백 보기
                      </span>
                      {getExamPartQuestionNumbers(part.partNumber).map((questionNumber) => (
                        <Link
                          key={questionNumber}
                          href={`/exam/result/question?examId=${result.examId}&questionNumber=${questionNumber}`}
                          className="group inline-flex items-center gap-1.5 rounded-full bg-sky-500 py-1.5 pr-1.5 pl-4 text-sm font-semibold text-white transition-colors hover:bg-sky-600"
                        >
                          Q{questionNumber}
                          <span className="flex size-5 items-center justify-center rounded-full bg-white/25 transition-transform duration-200 group-hover:translate-x-0.5">
                            <ChevronRight className="size-3.5" aria-hidden />
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 py-10">
        <h2 className="text-lg font-bold text-blue-950">추천 학습법</h2>
        <ol className="mt-4 flex flex-col gap-3">
          {result.recommendedPractice.map((item, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-2xl bg-orange-50 p-4 text-sm leading-relaxed text-zinc-700"
            >
              <span className="shrink-0 font-bold text-orange-600">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
      </section>

      <ScrollSatisfactionPopup examId={result.examId} />
    </>
  );
}
