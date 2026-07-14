import type { ReactNode } from "react";

import type { ExamCorrectionItem } from "@/types/exam";

type MarkKind = "box" | "underline" | "underline-dashed" | "triangle";

/** 마크 모양은 오류 종류(type)로 정한다. */
const TYPE_KIND: Record<string, MarkKind> = {
  content: "box",
  expression: "underline",
  mispronunciation: "triangle",
  pronunciation: "triangle",
  grammar: "underline-dashed",
};

function getMarkKind(type: string): MarkKind {
  return TYPE_KIND[type] ?? "underline";
}

/** 마크 색은 심각도(severity)로만 정한다 — 색상은 늘리지 않고 주황의 진한 정도로만 구분한다. */
export const SEVERITY_COLOR: Record<ExamCorrectionItem["severity"], string> = {
  high: "#c2410c",
  medium: "#f97316",
  low: "#fdba74",
};

interface MatchSpan {
  start: number;
  end: number;
  item: ExamCorrectionItem;
  num: number;
}

interface SpanNode {
  span: MatchSpan;
  children: SpanNode[];
}

/** correction_items의 original을 transcript 안에서 찾아 [start,end) 구간으로 변환한다. */
function findSpans(transcript: string, items: ExamCorrectionItem[]): MatchSpan[] {
  const spans: MatchSpan[] = [];
  items.forEach((item, i) => {
    const start = transcript.indexOf(item.original);
    if (start === -1 || item.original.length === 0) return;
    spans.push({ start, end: start + item.original.length, item, num: i + 1 });
  });
  return spans;
}

/**
 * 겹치는 구간을 트리로 묶는다. 완전히 포함되는 관계면 중첩 마킹(예: 박스 안 밑줄)으로,
 * 부분적으로만 겹치는 관계면 렌더링이 깨지는 걸 막기 위해 뒤에 나온 구간을 버린다.
 */
function buildSpanForest(spans: MatchSpan[]): SpanNode[] {
  const sorted = [...spans].sort(
    (a, b) => a.start - b.start || b.end - b.start - (a.end - a.start),
  );
  const roots: SpanNode[] = [];
  const stack: SpanNode[] = [];

  for (const span of sorted) {
    while (stack.length > 0 && stack[stack.length - 1].span.end <= span.start) {
      stack.pop();
    }
    const node: SpanNode = { span, children: [] };
    const parent = stack[stack.length - 1];
    if (!parent) {
      roots.push(node);
      stack.push(node);
    } else if (span.start >= parent.span.start && span.end <= parent.span.end) {
      parent.children.push(node);
      stack.push(node);
    }
    // 부분 겹침은 무시(드롭)한다.
  }
  return roots;
}

function MarkedSpan({ item, num, children }: { item: ExamCorrectionItem; num: number; children: ReactNode }) {
  const kind = getMarkKind(item.type);
  const color = SEVERITY_COLOR[item.severity];

  const content =
    kind === "box" ? (
      <span
        className="rounded-md px-1 py-px"
        style={{ border: `1.5px solid ${color}`, background: `${color}14` }}
      >
        {children}
      </span>
    ) : kind === "triangle" ? (
      <span className="relative inline-block">
        {children}
        <span
          aria-hidden
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: "4px solid transparent",
            borderRight: "4px solid transparent",
            borderTop: `6px solid ${color}`,
          }}
        />
      </span>
    ) : (
      <span
        style={{
          textDecorationLine: "underline",
          textDecorationStyle: kind === "underline-dashed" ? "dashed" : "wavy",
          textDecorationColor: color,
          textDecorationThickness: "2px",
          textUnderlineOffset: "3px",
        }}
      >
        {children}
      </span>
    );

  return (
    <span className="whitespace-pre-wrap">
      {content}
      <sup
        className="ml-0.5 inline-flex size-3.5 items-center justify-center rounded-full text-[9px] font-bold text-white"
        style={{ background: color }}
      >
        {num}
      </sup>
    </span>
  );
}

function renderForest(
  text: string,
  forest: SpanNode[],
  rangeStart: number,
  rangeEnd: number,
): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = rangeStart;

  for (const node of forest) {
    if (node.span.start > cursor) {
      nodes.push(text.slice(cursor, node.span.start));
    }
    const inner =
      node.children.length > 0
        ? renderForest(text, node.children, node.span.start, node.span.end)
        : [text.slice(node.span.start, node.span.end)];
    nodes.push(
      <MarkedSpan key={node.span.num} item={node.span.item} num={node.span.num}>
        {inner}
      </MarkedSpan>,
    );
    cursor = node.span.end;
  }
  if (cursor < rangeEnd) {
    nodes.push(text.slice(cursor, rangeEnd));
  }
  return nodes;
}

const TYPE_LABEL: Record<string, string> = {
  content: "내용",
  expression: "표현",
  mispronunciation: "발음",
  pronunciation: "발음",
  grammar: "문법",
};

const SEVERITY_LABEL: Record<ExamCorrectionItem["severity"], string> = {
  high: "심각",
  medium: "보통",
  low: "경미",
};

/** 심각도는 색을 늘리지 않고 주황의 진한 정도로만 구분한다. */
const SEVERITY_BADGE_CLASS: Record<ExamCorrectionItem["severity"], string> = {
  high: "bg-orange-600 text-white",
  medium: "bg-orange-300 text-orange-900",
  low: "bg-orange-100 text-orange-700",
};

export function ExamMarkedTranscript({
  transcript,
  correctionItems,
}: {
  transcript: string;
  correctionItems: ExamCorrectionItem[];
}) {
  const spans = findSpans(transcript, correctionItems);
  const forest = buildSpanForest(spans);
  const marked = renderForest(transcript, forest, 0, transcript.length);

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
        <div aria-hidden className="pointer-events-none absolute top-0 bottom-0 left-8 w-px bg-red-300/60" />
        <p className="relative p-4 pl-4 text-base leading-7 text-zinc-800 sm:text-lg lg:text-xl lg:leading-8">
          {marked}
        </p>
      </div>

      {correctionItems.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {correctionItems.map((item, i) => {
            const color = SEVERITY_COLOR[item.severity];
            return (
              <div
                key={i}
                className="flex gap-3 rounded-xl bg-zinc-50 p-3 text-sm leading-relaxed ring-1 ring-zinc-100"
              >
                <span
                  className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ background: color }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] font-semibold text-zinc-600">
                      {TYPE_LABEL[item.type] ?? "기타"}
                    </span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${SEVERITY_BADGE_CLASS[item.severity]}`}
                    >
                      {SEVERITY_LABEL[item.severity]}
                    </span>
                  </div>
                  <p className="mt-1 text-zinc-700">{item.issue}</p>
                  <p className="mt-1 text-zinc-500">
                    <span className="font-semibold text-zinc-600">추천: </span>
                    {item.suggested}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
