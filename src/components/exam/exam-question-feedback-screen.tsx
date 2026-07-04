"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { getExamPartMeta } from "@/features/exam/part-meta";
import type { ExamQuestionDetail } from "@/types/exam";

function clampPercent(ratio: number): number {
  return Math.min(100, Math.max(0, ratio * 100));
}

function ScoreBar({ label, ratio }: { label: string; ratio: number }) {
  const percent = clampPercent(ratio);

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-500">{label}</span>
        <span className="text-xs font-bold text-orange-600">{Math.round(percent)}%</span>
      </div>
      <div className="mt-1.5 h-2 w-full rounded-full bg-orange-100">
        <div
          className="h-full rounded-full bg-orange-500 transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
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
  const scorePercent = clampPercent(detail.maxScore > 0 ? detail.score / detail.maxScore : 0);

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

      <div className="mt-8 rounded-3xl bg-white p-6 shadow-md ring-1 ring-zinc-100">
        <span className="inline-block rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
          이 문제 점수
        </span>
        <p className="mt-4 text-4xl font-extrabold text-orange-600 sm:text-5xl">
          {detail.score}
          <span className="text-xl font-semibold text-zinc-400"> / {detail.maxScore}</span>
        </p>

        <div className="mt-6 h-2 w-full rounded-full bg-orange-100">
          <div
            className="h-full rounded-full bg-orange-500 transition-[width] duration-500"
            style={{ width: `${scorePercent}%` }}
          />
        </div>

        <p className="mt-6 text-sm leading-relaxed text-zinc-600">{detail.feedback.summary}</p>
      </div>

      {detail.audioUrl && (
        <div className="mt-6 rounded-3xl bg-white p-6 shadow-md ring-1 ring-zinc-100">
          <span className="text-sm font-bold text-blue-950">내 답변 음성</span>
          <audio className="mt-3 w-full" controls src={detail.audioUrl} />
        </div>
      )}

      <div className="mt-6 rounded-3xl bg-white p-6 shadow-md ring-1 ring-zinc-100">
        <span className="text-sm font-bold text-blue-950">답변 스크립트</span>
        <p className="mt-3 rounded-2xl bg-zinc-50 p-4 text-sm leading-relaxed whitespace-pre-line text-zinc-700 ring-1 ring-zinc-100">
          {detail.transcript}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 rounded-3xl bg-white p-6 shadow-md ring-1 ring-zinc-100 sm:grid-cols-2">
        <ScoreBar label="발음 & 유창성" ratio={detail.feedback.pronunciationFluencyScore} />
        <ScoreBar label="내용 적합성" ratio={detail.feedback.contentRelevanceScore} />
      </div>

      <div className="mt-6 rounded-3xl bg-white p-6 shadow-md ring-1 ring-zinc-100">
        <span className="text-sm font-bold text-blue-950">강점 &amp; 약점</span>

        <div className="mt-4">
          <p className="text-xs font-semibold text-emerald-600">강점</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {detail.feedback.strengths.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-zinc-700">
                <span className="text-emerald-500">+</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold text-rose-600">약점</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {detail.feedback.weaknesses.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-zinc-700">
                <span className="text-rose-500">−</span>
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
        <DetailBlock title="문법 & 어휘" body={detail.feedback.grammarVocabulary} />
      </div>

      <div className="mt-6 rounded-3xl bg-orange-50 p-6 ring-1 ring-orange-100">
        <span className="text-sm font-bold text-blue-950">실천 과제</span>
        <ol className="mt-4 flex flex-col gap-3">
          {detail.feedback.actionItems.map((item, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-2xl bg-white p-4 text-sm leading-relaxed text-zinc-700 shadow-sm"
            >
              <span className="shrink-0 font-bold text-orange-600">{i + 1}</span>
              {item}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
