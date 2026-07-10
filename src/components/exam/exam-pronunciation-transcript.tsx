import { Fragment } from "react";

import { SEVERITY_COLOR } from "@/components/exam/exam-marked-transcript";
import type { ExamCorrectionItem, SpokenWord } from "@/types/exam";

type WordSeverity = ExamCorrectionItem["severity"];

/** Azure 발음 평가(accuracyScore/errorType)를 기존 첨삭 색상 언어(주황 3단계)로 환산한다. */
function getWordSeverity(word: SpokenWord): WordSeverity | null {
  if (word.errorType !== "None") return "high";
  if (word.accuracyScore < 75) return "medium";
  if (word.accuracyScore < 90) return "low";
  return null;
}

/** 형광펜처럼 보이도록 심각도 색에 알파(35%)를 섞어 단어 배경에 바로 칠한다. */
function toHighlightColor(color: string): string {
  return `${color}59`;
}

function ScoredWord({ word }: { word: SpokenWord }) {
  const severity = getWordSeverity(word);
  const color = severity ? SEVERITY_COLOR[severity] : null;

  return (
    <span
      className="rounded-[3px] px-0.5"
      style={color ? { backgroundColor: toHighlightColor(color) } : undefined}
      title={`${word.word} · 정확도 ${Math.round(word.accuracyScore)}%`}
    >
      {word.word}
    </span>
  );
}

const SEVERITY_LEGEND: { severity: WordSeverity; label: string }[] = [
  { severity: "low", label: "약간 부정확" },
  { severity: "medium", label: "부정확" },
  { severity: "high", label: "발음 오류" },
];

/** Part 1 낭독 답변을 단어 단위 발음 정확도에 따라 색으로 구분해 보여준다. */
export function ExamPronunciationTranscript({
  spokenWordSequence,
}: {
  spokenWordSequence: SpokenWord[];
}) {
  return (
    <div className="mt-6 rounded-3xl bg-white p-6 shadow-md ring-1 ring-zinc-100">
      <span className="text-sm font-bold text-blue-950">답변 스크립트</span>

      <div className="relative mt-3 overflow-hidden rounded-2xl bg-[#fdfaf1] pl-12 ring-1 ring-zinc-100">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(120,53,15,0.10) 27px, rgba(120,53,15,0.10) 28px)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 bottom-0 left-8 w-px bg-red-300/60"
        />
        <p className="relative p-4 pl-4 font-mono text-[13.5px] leading-[28px] text-zinc-800">
          {spokenWordSequence.map((word, i) => (
            <Fragment key={i}>
              <ScoredWord word={word} />{" "}
            </Fragment>
          ))}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {SEVERITY_LEGEND.map(({ severity, label }) => (
          <span
            key={severity}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500"
          >
            <span
              className="h-3 w-4 rounded-[3px]"
              style={{ backgroundColor: toHighlightColor(SEVERITY_COLOR[severity]) }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
