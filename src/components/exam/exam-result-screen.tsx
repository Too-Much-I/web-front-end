"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { TargetGradeMascot } from "@/components/exam/target-grade-mascot";
import {
  getStoredTargetGradeId,
  getTargetGradeOption,
  type TargetGradeOption,
} from "@/features/exam/target-grade";
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

  useEffect(() => {
    setTargetGrade(getTargetGradeOption(getStoredTargetGradeId()));
  }, []);

  const scoreGap = targetGrade ? targetGrade.score - result.totalScore : null;

  return (
    <>
      <section className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-wide text-orange-600">
              SESSION ANALYSIS
            </p>
            <h1 className="mt-1 text-2xl font-bold text-blue-950 sm:text-3xl">
              채점 결과 리포트
            </h1>
          </div>

          {targetGrade && scoreGap !== null && (
            <TargetGradeMascot targetGrade={targetGrade} scoreGap={scoreGap} />
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-zinc-100">
            <span className="inline-block rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
              예상 총점
            </span>
            <p className="mt-4 text-4xl font-extrabold text-orange-600 sm:text-5xl">
              {result.totalScore}
              <span className="text-xl font-semibold text-zinc-400">
                {" "}
                / {result.maxScore}
              </span>
            </p>
            <p className="mt-2 text-sm font-semibold text-blue-950">
              {result.levelEstimate}
            </p>

            <div className="mt-6 h-2 w-full rounded-full bg-orange-100">
              <div
                className="h-full rounded-full bg-orange-500 transition-[width] duration-500"
                style={{ width: `${scorePercent}%` }}
              />
            </div>

            <p className="mt-6 text-sm leading-relaxed text-zinc-600">
              {result.summary}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-zinc-100">
            <span className="text-sm font-bold text-blue-950">
              강점 &amp; 약점
            </span>

            <div className="mt-4">
              <p className="text-xs font-semibold text-emerald-600">강점</p>
              <ul className="mt-2 flex flex-col gap-1.5">
                {result.strengths.map((item, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm leading-relaxed text-zinc-700"
                  >
                    <span className="text-emerald-500">+</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold text-rose-600">약점</p>
              <ul className="mt-2 flex flex-col gap-1.5">
                {result.weaknesses.map((item, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm leading-relaxed text-zinc-700"
                  >
                    <span className="text-rose-500">−</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-white p-6 shadow-md ring-1 ring-zinc-100">
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

                    <button
                      type="button"
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-600"
                    >
                      문제별 피드백 보기
                      <span aria-hidden>→</span>
                    </button>
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
    </>
  );
}
