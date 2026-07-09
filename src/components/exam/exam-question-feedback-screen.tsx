"use client";

import { ArrowLeft, ThumbsUp, TriangleAlert } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { AnswerAudioPlayer } from "@/components/exam/answer-audio-player";
import { SketchyDashBorder } from "@/components/exam/sketchy-dash-border";
import { TypedText } from "@/components/exam/typed-text";
import {
  getExamPartMeta,
  getExamPartTimingByQuestionNumber,
} from "@/features/exam/part-meta";
import { useRevealOnScroll } from "@/features/exam/use-reveal-on-scroll";
import { gaegu } from "@/lib/fonts";
import type { ExamQuestionDetail } from "@/types/exam";

function clampPercent(ratio: number): number {
  return Math.min(100, Math.max(0, ratio * 100));
}

/** pronunciationFluencyScore / contentRelevanceScore는 10점 만점으로 내려온다. */
const SUB_SCORE_MAX = 10;

function ScoreRing({
  percent,
  size,
  strokeWidth,
  trackClassName = "stroke-orange-100",
  progressClassName = "stroke-orange-500",
}: {
  percent: number;
  size: number;
  strokeWidth: number;
  trackClassName?: string;
  progressClassName?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        className={trackClassName}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className={`${progressClassName} transition-[stroke-dashoffset] duration-500`}
      />
    </svg>
  );
}

function ScoreCircleStat({ label, ratio }: { label: string; ratio: number }) {
  const percent = clampPercent(ratio);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center">
        <ScoreRing percent={percent} size={104} strokeWidth={10} />
        <span className="absolute text-lg font-bold text-orange-600">
          {Math.round(percent)}%
        </span>
      </div>
      <span className="text-xs font-semibold text-zinc-500">{label}</span>
    </div>
  );
}

function DetailBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-100">
      <p className="text-xs font-bold text-sky-700">{title}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-sky-900">{body}</p>
    </div>
  );
}

export function ExamQuestionFeedbackScreen({
  examId,
  detail,
}: {
  examId: string;
  detail: ExamQuestionDetail;
}) {
  const partMeta = getExamPartMeta(detail.partNumber);
  const scorePercent = clampPercent(
    detail.maxScore > 0 ? detail.score / detail.maxScore : 0,
  );
  const isAboveHalf = scorePercent > 50;
  const mascot = isAboveHalf
    ? { src: "/mascots/good_rabbit.png", alt: "만족스러워하는 토끼 캐릭터" }
    : { src: "/mascots/hmm_rabbit.png", alt: "고민하는 토끼 캐릭터" };
  const { speakTimeSec } = getExamPartTimingByQuestionNumber(
    detail.partNumber,
    detail.questionNumber,
  );
  const mainRingRef = useRef<HTMLDivElement>(null);
  const mainRingRevealed = useRevealOnScroll(mainRingRef);
  const subRingsRef = useRef<HTMLDivElement>(null);
  const subRingsRevealed = useRevealOnScroll(subRingsRef);

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link
        href={`/exam/result?examId=${examId}`}
        className="group inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-zinc-700"
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-zinc-100 transition-transform duration-200 group-hover:-translate-x-0.5">
          <ArrowLeft className="size-3.5" aria-hidden />
        </span>
        채점 결과로 돌아가기
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold tracking-wide text-orange-600">
            Part {detail.partNumber} · {partMeta.titleKo}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-blue-950 sm:text-3xl">
            문제 {detail.questionNumber}번 피드백
          </h1>
        </div>
        <span className="rounded-full bg-blue-950 px-4 py-1.5 text-sm font-semibold text-white">
          {detail.feedback.level}
        </span>
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

        <div className="relative rounded-3xl border-[10px] border-amber-900 bg-emerald-950 py-6 pr-6 pl-32 shadow-xl sm:pl-36">
          <div className="absolute -top-5 left-4 z-20 -rotate-3 rounded-lg bg-amber-400 px-4 py-2 shadow-md">
            <span className={`${gaegu.className} text-lg text-emerald-950`}>
              이 문제 점수
            </span>
          </div>
          <div ref={mainRingRef} className="mt-8 flex justify-center">
            <div className="relative flex items-center justify-center">
              <ScoreRing
                percent={mainRingRevealed ? scorePercent : 0}
                size={140}
                strokeWidth={12}
                trackClassName="stroke-white/15"
                progressClassName="stroke-amber-300"
              />
              <div className="absolute flex flex-col items-center">
                <span className={`${gaegu.className} text-4xl text-amber-50`}>
                  {detail.score}
                </span>
                <span className={`${gaegu.className} text-sm text-white/60`}>
                  / {detail.maxScore}
                </span>
              </div>
            </div>
          </div>

          <TypedText
            text={detail.feedback.summary}
            className={`${gaegu.className} mt-6 text-center text-base leading-relaxed text-white/90`}
          />
        </div>
      </div>

      {detail.audioUrl && (
        <div className="mt-6 rounded-3xl bg-white p-6 shadow-md ring-1 ring-zinc-100">
          <span className="text-sm font-bold text-blue-950">내 답변 음성</span>
          <div className="mt-3">
            <AnswerAudioPlayer
              audioUrl={detail.audioUrl}
              durationSec={speakTimeSec}
            />
          </div>
        </div>
      )}

      <div className="mt-6 rounded-3xl bg-white p-6 shadow-md ring-1 ring-zinc-100">
        <span className="text-sm font-bold text-blue-950">답변 스크립트</span>
        <p className="mt-3 rounded-2xl bg-zinc-50 p-4 text-sm leading-relaxed whitespace-pre-line text-zinc-700 ring-1 ring-zinc-100">
          {detail.transcript}
        </p>
      </div>

      <div
        ref={subRingsRef}
        className="mt-6 grid grid-cols-2 gap-5 rounded-3xl bg-white p-6 shadow-md ring-1 ring-zinc-100"
      >
        <ScoreCircleStat
          label="발음 & 유창성"
          ratio={
            subRingsRevealed
              ? detail.feedback.pronunciationFluencyScore / SUB_SCORE_MAX
              : 0
          }
        />
        <ScoreCircleStat
          label="내용 적합성"
          ratio={
            subRingsRevealed
              ? detail.feedback.contentRelevanceScore / SUB_SCORE_MAX
              : 0
          }
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="relative rounded-3xl bg-white p-6">
          <SketchyDashBorder />
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-950">
            <ThumbsUp className="size-4 text-orange-500" aria-hidden />
            강점
          </span>
          <ul className="mt-4 flex flex-col gap-2">
            {detail.feedback.strengths.map((item, i) => (
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
            {detail.feedback.weaknesses.map((item, i) => (
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

      <div className="mt-6 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-md ring-1 ring-zinc-100">
        <span className="text-sm font-bold text-blue-950">세부 피드백</span>
        <DetailBlock title="발음" body={detail.feedback.pronunciation} />
        <DetailBlock title="유창성" body={detail.feedback.fluency} />
        <DetailBlock title="내용" body={detail.feedback.content} />
        <DetailBlock
          title="문법 & 어휘"
          body={detail.feedback.grammarVocabulary}
        />
      </div>

      <div className="mt-6 rounded-3xl bg-orange-50 p-6 ring-1 ring-orange-100">
        <span className="text-sm font-bold text-blue-950">실천 과제</span>
        <ol className="mt-4 flex flex-col gap-3">
          {detail.feedback.actionItems.map((item, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-2xl bg-white p-4 text-sm leading-relaxed text-zinc-700 shadow-sm"
            >
              <span className="shrink-0 font-bold text-orange-600">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
