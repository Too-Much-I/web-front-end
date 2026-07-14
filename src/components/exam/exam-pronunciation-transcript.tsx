import { Fragment } from "react";

import { SEVERITY_COLOR } from "@/components/exam/exam-marked-transcript";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

/** 정확도 숫자 대신 액션 플랜 톤으로 안내 — "부정확하다"는 지적보다 뭘 하면 좋을지에 초점을 둔다. */
const WORD_ACTION_LABEL: Record<WordSeverity, string> = {
  low: "가볍게 연습",
  medium: "연습 필요",
  high: "주의 필요",
};

/** Azure Pronunciation Assessment의 offset/duration은 100ns 단위(tick)라 초 단위로 바꾸려면 나눠야 한다. */
const AZURE_TICKS_PER_SECOND = 10_000_000;

function ScoredWord({
  word,
  currentTimeSec,
}: {
  word: SpokenWord;
  currentTimeSec: number;
}) {
  const severity = getWordSeverity(word);
  const color = severity ? SEVERITY_COLOR[severity] : null;

  const startSec = word.offset / AZURE_TICKS_PER_SECOND;
  const endSec = (word.offset + word.duration) / AZURE_TICKS_PER_SECOND;
  const isSpeaking = currentTimeSec >= startSec && currentTimeSec < endSec;
  const isPlayed = currentTimeSec >= endSec;

  const wordClassName = `inline-block rounded-[3px] px-0.5 transition-[transform,opacity] duration-150 ease-out ${
    isSpeaking ? "scale-125" : "scale-100"
  } ${isPlayed ? "opacity-50" : "opacity-100"}`;
  const wordStyle = color ? { backgroundColor: toHighlightColor(color) } : undefined;

  return (
    <Tooltip>
      <TooltipTrigger
        delay={150}
        render={<span />}
        className={wordClassName}
        style={wordStyle}
      >
        {word.word}
      </TooltipTrigger>
      <TooltipContent>정확도 {Math.round(word.accuracyScore)}%</TooltipContent>
    </Tooltip>
  );
}

const SEVERITY_LEGEND: WordSeverity[] = ["low", "medium", "high"];

/** Part 1 낭독 답변을 단어 단위 발음 정확도에 따라 색으로 구분해 보여준다. */
export function ExamPronunciationTranscript({
  spokenWordSequence,
  currentTimeSec = 0,
}: {
  spokenWordSequence: SpokenWord[];
  /** 답변 오디오의 현재 재생 위치(초) — 발화 중인 단어를 확대 표시하는 데 쓰인다. */
  currentTimeSec?: number;
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
              <ScoredWord word={word} currentTimeSec={currentTimeSec} />{" "}
            </Fragment>
          ))}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {SEVERITY_LEGEND.map((severity) => (
          <span
            key={severity}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500"
          >
            <span
              className="h-3 w-4 rounded-[3px]"
              style={{ backgroundColor: toHighlightColor(SEVERITY_COLOR[severity]) }}
            />
            {WORD_ACTION_LABEL[severity]}
          </span>
        ))}
      </div>
    </div>
  );
}
