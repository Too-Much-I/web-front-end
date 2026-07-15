import { Fragment, useEffect, useRef, useState } from "react";

import {
  SEVERITY_COLOR,
  type Severity,
} from "@/components/exam/exam-marked-transcript";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { jua } from "@/lib/fonts";
import type { SpokenWord } from "@/types/exam";

type WordSeverity = Severity;

/** Azure 발음 평가(accuracyScore/errorType)를 기존 첨삭 색상 언어(주황 3단계)로 환산한다. */
function getWordSeverity(word: SpokenWord): WordSeverity | null {
  if (word.errorType !== "None") return "high";
  if (word.accuracyScore < 75) return "medium";
  if (word.accuracyScore < 90) return "low";
  return null;
}

/**
 * errorType은 그동안 "None이 아니면 다 high"로 뭉개서 보여줬는데, 실제로는 서로 다른 문제라
 * 문구·표시를 구분해서 보여준다. 벡터 아이콘 대신 교정지에 빨간펜으로 표시하듯 손글씨 문장부호를
 * 쓴다 — 빠뜨린 부분은 교정 부호의 "삽입 캐럿(^)", 불필요하게 넣은 부분은 "삭제 표시(✗)",
 * 발음 자체가 틀린 건 "주목 표시(★)"로 구분했다. Azure Pronunciation Assessment가 내려주는 값 중
 * 실측으로 확인된 세 종류만 우선 다루고, 나머지는 일반적인 발음 문제로 fallback한다.
 */
const ERROR_TYPE_META: Record<string, { label: string; mark: string }> = {
  Mispronunciation: { label: "발음이 부정확해요", mark: "★" },
  Omission: { label: "이 부분을 빠뜨렸어요", mark: "^" },
  Insertion: { label: "필요 없는 표현이 들어갔어요", mark: "✗" },
};

function getErrorTypeMeta(errorType: string) {
  if (errorType === "None") return null;
  return (
    ERROR_TYPE_META[errorType] ?? {
      label: "발음에 문제가 있어요",
      mark: "★",
    }
  );
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
  onWordClick,
}: {
  word: SpokenWord;
  currentTimeSec: number;
  /** 단어를 클릭하면 그 시작 시점(초)으로 답변 오디오를 seek + 재생시킨다. */
  onWordClick?: (startSec: number) => void;
}) {
  const severity = getWordSeverity(word);
  const color = severity ? SEVERITY_COLOR[severity] : null;
  const errorMeta = getErrorTypeMeta(word.errorType);

  const startSec = word.offset / AZURE_TICKS_PER_SECOND;
  const endSec = (word.offset + word.duration) / AZURE_TICKS_PER_SECOND;
  const isSpeaking = currentTimeSec >= startSec && currentTimeSec < endSec;
  const isPlayed = currentTimeSec >= endSec;

  // 클릭한 순간 즉시 "여기서부터 재생한다"는 걸 보여주는 링 효과 — isSpeaking은 오디오의
  // timeupdate 이벤트를 한 박자 기다려야 켜지므로, 그 텀 동안 클릭 반응이 없어 보이는 걸 막는다.
  const [justClicked, setJustClicked] = useState(false);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(clickTimeoutRef.current), []);

  function handleWordClick() {
    onWordClick?.(startSec);
    setJustClicked(true);
    clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => setJustClicked(false), 300);
  }

  const wordClassName = `relative inline-block cursor-pointer rounded-[3px] px-0.5 transition-[transform,opacity,box-shadow] duration-150 ease-out ${
    isSpeaking ? "z-10 scale-125" : "scale-100"
  } ${isPlayed ? "opacity-50" : "opacity-100"} ${
    justClicked ? "ring-2 ring-orange-400" : ""
  }`;
  // 확대되는 동안(scale-125)은 transform이라 옆 글자와 레이아웃상 겹치므로, 불투명 배경으로
  // 옆 단어 위에 확실히 떠 보이게 한다. 평소엔 형광펜처럼 반투명 하이라이트만 쓴다.
  const wordStyle = isSpeaking
    ? { backgroundColor: color ?? "#fdfaf1" }
    : color
      ? { backgroundColor: toHighlightColor(color) }
      : undefined;

  return (
    <Tooltip>
      <TooltipTrigger
        delay={150}
        render={<span tabIndex={0} />}
        className={wordClassName}
        style={wordStyle}
        onClick={handleWordClick}
      >
        {errorMeta && (
          <span
            aria-hidden
            className={`${jua.className} absolute -top-3 -right-1.5 rotate-12 text-sm leading-none`}
            style={{ color: color ?? undefined }}
          >
            {errorMeta.mark}
          </span>
        )}
        {word.word}
      </TooltipTrigger>
      <TooltipContent>
        {errorMeta ? `${errorMeta.label} · ` : ""}
        정확도 {Math.round(word.accuracyScore)}%
      </TooltipContent>
    </Tooltip>
  );
}

const SEVERITY_LEGEND: WordSeverity[] = ["low", "medium", "high"];

/** Part 1 낭독 답변을 단어 단위 발음 정확도에 따라 색으로 구분해 보여준다. */
export function ExamPronunciationTranscript({
  spokenWordSequence,
  currentTimeSec = 0,
  onWordClick,
}: {
  spokenWordSequence: SpokenWord[];
  /** 답변 오디오의 현재 재생 위치(초) — 발화 중인 단어를 확대 표시하는 데 쓰인다. */
  currentTimeSec?: number;
  /** 단어를 클릭하면 그 시작 시점(초)으로 답변 오디오를 seek + 재생시킨다. */
  onWordClick?: (startSec: number) => void;
}) {
  return (
    <div className="mt-6 rounded-3xl bg-white p-6 shadow-md ring-1 ring-zinc-100">
      <span className={`${jua.className} text-base text-blue-950`}>
        답변 스크립트
      </span>

      {onWordClick && (
        <p className={`${jua.className} mt-1 text-base text-orange-500`}>
          단어를 클릭하면 그 부분부터 다시 들을 수 있어요.
        </p>
      )}

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
        <p
          className={`${jua.className} relative p-4 pl-4 text-base leading-7 text-zinc-800 sm:text-lg lg:text-xl`}
        >
          {spokenWordSequence.map((word, i) => (
            <Fragment key={i}>
              <ScoredWord
                word={word}
                currentTimeSec={currentTimeSec}
                onWordClick={onWordClick}
              />{" "}
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
              style={{
                backgroundColor: toHighlightColor(SEVERITY_COLOR[severity]),
              }}
            />
            {WORD_ACTION_LABEL[severity]}
          </span>
        ))}
      </div>
    </div>
  );
}
