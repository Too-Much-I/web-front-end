import Image from "next/image";
import type { ReactNode } from "react";

import { jua } from "@/lib/fonts";
import type { ExamQuestionInfo } from "@/types/exam";

/**
 * 파트 2 피드백에서 사진만 덩그러니 보이지 않도록 붙이는 안내문.
 * EXAM_PART_DIRECTIONS(part-directions.ts) 파트 2 디렉션의 핵심 문장.
 */
const PART2_DIRECTION_TEXT =
  "In this part of the test, you will describe the picture on your screen in as much detail as you can.";

const GRID_TONES = {
  /** 읽었던 지문 — 시험지에 인쇄된 읽기 지문 */
  slate: {
    label: "text-slate-600",
    box: "bg-[#f4f7fb] ring-slate-200",
    line: "rgba(71,85,105,0.12)",
    text: "text-slate-700",
  },
  /** 디렉션/지문 소개 — 문제를 소개하는 안내문 */
  sky: {
    label: "text-sky-700",
    box: "bg-sky-50 ring-sky-100",
    line: "rgba(2,132,199,0.12)",
    text: "text-sky-900",
  },
} as const;

/** 디렉션/지문 소개/읽었던 지문처럼 "시험지에 인쇄된 안내문" 류에 공통으로 쓰는 모눈종이 박스. */
function GridPaperNote({
  tone,
  label,
  children,
}: {
  tone: keyof typeof GRID_TONES;
  label?: string;
  children: ReactNode;
}) {
  const t = GRID_TONES[tone];
  return (
    <div>
      {label && (
        <p className={`${jua.className} mb-2 text-sm lg:text-base ${t.label}`}>
          {label}
        </p>
      )}
      <div
        className={`relative overflow-hidden rounded-2xl ring-1 ${t.box}`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent 27px, ${t.line} 27px, ${t.line} 28px), repeating-linear-gradient(to right, transparent, transparent 27px, ${t.line} 27px, ${t.line} 28px)`,
          }}
        />
        <div className={`relative p-4 lg:p-5 ${t.text}`}>{children}</div>
      </div>
    </div>
  );
}

/** 문제별 피드백 화면에서 문제 원문을 파트별 구성 요소(디렉션/지문 소개/읽기 지문/사진/표/질문)에 맞춰 보여준다. */
export function ExamQuestionPrompt({
  questionInfo,
}: {
  questionInfo: ExamQuestionInfo;
}) {
  return (
    <div className="mt-6 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-md ring-1 ring-zinc-100 lg:p-8">
      <span className={`${jua.className} text-base text-blue-950 lg:text-lg`}>
        문제
      </span>

      {questionInfo.partNumber === 2 && (
        <GridPaperNote tone="sky">
          <p className="text-sm leading-relaxed lg:text-base">
            {PART2_DIRECTION_TEXT}
          </p>
        </GridPaperNote>
      )}

      {questionInfo.partNumber === 3 && questionInfo.partIntroText && (
        <GridPaperNote tone="sky">
          <p className="text-sm leading-relaxed lg:text-base">
            {questionInfo.partIntroText}
          </p>
        </GridPaperNote>
      )}

      {questionInfo.partNumber === 1 && questionInfo.referenceText && (
        <GridPaperNote tone="slate" label="읽었던 지문">
          <p className="text-base leading-7 whitespace-pre-line sm:text-lg lg:text-xl">
            {questionInfo.referenceText}
          </p>
        </GridPaperNote>
      )}

      {questionInfo.imageUrl && (
        <div className="relative aspect-[4/3] w-full max-w-md shrink-0 self-center overflow-hidden rounded-2xl ring-1 ring-zinc-200">
          <Image
            src={questionInfo.imageUrl}
            alt="문제 이미지"
            fill
            sizes="(min-width: 1024px) 448px, 100vw"
            className="object-cover"
          />
        </div>
      )}

      {questionInfo.tableContext && (
        <div className="w-full shrink-0 rounded-2xl border border-zinc-200">
          <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3">
            <p className="font-semibold text-blue-950 lg:text-lg">
              {questionInfo.tableContext.title}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500 lg:text-sm">
              {questionInfo.tableContext.location} ·{" "}
              {questionInfo.tableContext.date} · Fee:{" "}
              {questionInfo.tableContext.fee}
            </p>
          </div>
          <table className="w-full text-xs lg:text-sm">
            <tbody>
              {questionInfo.tableContext.items.map((item) => (
                <tr
                  key={item.time}
                  className="border-b border-zinc-100 last:border-0"
                >
                  <td className="px-4 py-2 font-medium whitespace-nowrap text-zinc-500">
                    {item.time}
                  </td>
                  <td className="px-4 py-2 text-zinc-800">
                    {item.sessionTitle}
                    {item.note && (
                      <span className="block text-zinc-400">({item.note})</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right text-zinc-500">
                    {item.speaker ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {questionInfo.text && (
        <div className="border-l-4 border-orange-400 py-0.5 pl-3.5">
          <p className="text-base leading-relaxed font-medium text-blue-950 lg:text-lg">
            <span
              className={`${jua.className} mr-1.5 text-lg text-orange-500 lg:text-xl`}
            >
              Q.
            </span>
            {questionInfo.text}
          </p>
        </div>
      )}
    </div>
  );
}
