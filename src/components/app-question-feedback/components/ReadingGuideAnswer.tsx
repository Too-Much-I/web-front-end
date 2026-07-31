import { Fragment } from "react";

type Intonation = "rise" | "fall" | null;
type Pause = "short" | "long" | null;

interface ReadingTextPart {
  text: string;
  emphasized: boolean;
}

export interface ReadingPhrase {
  parts: ReadingTextPart[];
  intonation: Intonation;
  pause: Pause;
}

// ✓✓를 ✓보다 먼저 두어 긴 쉼을 짧은 쉼 두 개로 잘못 나누지 않는다.
const PHRASE_BOUNDARY = /\s*([↑↓])?\s*(✓✓|✓)\s*/gu;
const EMPHASIS = /\*\*([^*]+)\*\*/gu;

function parseEmphasis(text: string): ReadingTextPart[] {
  const parts: ReadingTextPart[] = [];
  let cursor = 0;

  for (const match of text.matchAll(EMPHASIS)) {
    const start = match.index;
    if (start > cursor) {
      parts.push({ text: text.slice(cursor, start), emphasized: false });
    }
    parts.push({ text: match[1], emphasized: true });
    cursor = start + match[0].length;
  }

  if (cursor < text.length) {
    parts.push({ text: text.slice(cursor), emphasized: false });
  }

  return parts;
}

/** 백엔드 마크업 문자열을 강세·억양·쉼 정보를 가진 읽기 구간으로 바꾼다. */
export function parseReadingGuide(input: string): ReadingPhrase[] {
  const phrases: ReadingPhrase[] = [];
  let cursor = 0;

  for (const match of input.matchAll(PHRASE_BOUNDARY)) {
    const text = input.slice(cursor, match.index).trim();
    if (text) {
      phrases.push({
        parts: parseEmphasis(text),
        intonation:
          match[1] === "↑" ? "rise" : match[1] === "↓" ? "fall" : null,
        pause: match[2] === "✓✓" ? "long" : "short",
      });
    }
    cursor = match.index + match[0].length;
  }

  const remaining = input.slice(cursor).trim();
  if (remaining) {
    phrases.push({
      parts: parseEmphasis(remaining),
      intonation: null,
      pause: null,
    });
  }

  return phrases;
}

/** Part 1 추천답안의 강세·억양·쉼 마크업을 읽기 쉬운 시각 언어로 표현한다. */
export function ReadingGuideAnswer({ text }: { text: string }) {
  const phrases = parseReadingGuide(text);

  return (
    <div>
      <p className="text-sm leading-6 text-zinc-600">
        굵은 단어는 힘주어 읽고, ↗에서는 끝을 살짝 올려 보세요. ↘에서는
        자연스럽게 내려 마무리해요. |에서는 짧게, ‖에서는 한 박자 더 쉬어 읽으면
        좋아요.
      </p>

      <p className="mt-3 text-base leading-9 text-zinc-800">
        {phrases.map((phrase, phraseIndex) => (
          <Fragment key={phraseIndex}>
            {phrase.parts.map((part, partIndex) =>
              part.emphasized ? (
                <strong key={partIndex} className="font-bold text-orange-600">
                  {part.text}
                </strong>
              ) : (
                <Fragment key={partIndex}>{part.text}</Fragment>
              ),
            )}

            {phrase.intonation && (
              <span
                role="img"
                aria-label={
                  phrase.intonation === "rise"
                    ? "끝을 올려 읽기"
                    : "끝을 내려 읽기"
                }
                className={`ml-1 inline-block font-bold ${
                  phrase.intonation === "rise"
                    ? "text-sky-600"
                    : "text-indigo-600"
                }`}
              >
                {phrase.intonation === "rise" ? "↗" : "↘"}
              </span>
            )}

            {phrase.pause && (
              <span
                role="img"
                aria-label={phrase.pause === "long" ? "길게 쉬기" : "짧게 쉬기"}
                className={`inline-block font-bold text-zinc-400 ${
                  phrase.pause === "long" ? "mx-3" : "mx-1.5"
                }`}
              >
                {phrase.pause === "long" ? "‖" : "|"}
              </span>
            )}

            {phrase.pause === "long" && <br />}
          </Fragment>
        ))}
      </p>
    </div>
  );
}
