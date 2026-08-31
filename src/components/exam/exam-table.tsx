"use client";

import { useEffect, useRef, useState } from "react";

import type { ExamTableContext, ExamTableScalar } from "@/types/exam";

/** 열이 늘어나도 셀이 뭉개지지 않게 잡아 두는 최소 열 너비(px). 앱 렌더러와 같은 값. */
const MIN_COLUMN_WIDTH_CLASS = "min-w-36";

function formatExamTableValue(value: ExamTableScalar | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function formatStatus(status: string): string {
  const displayStatus = status.replace(/_/g, " ").trim();
  return (displayStatus || "unknown").toUpperCase();
}

/**
 * Part 4 표를 고정 열 가정 없이 그리는 공용 렌더러 — 앱(app-front-end)의 `Part4Table`과
 * 같은 계약을 웹에서 그대로 그린다. 웹 응시 화면(/exam/session)과 문제별 피드백 화면이
 * 같은 표를 봐야 하므로 두 화면 모두 이 컴포넌트 하나만 쓴다.
 *
 * 일정표·요금표·이력서처럼 표 종류(`tableType`)마다 열 구성이 달라지므로, 화면은
 * `columns`를 순서대로 돌며 각 행의 `cells[column.key]`만 찾아 쓴다. 여기서 특정
 * 열 이름(time/speaker 등)을 알고 있으면 그 종류의 표만 보이고 나머지는 빈칸이 된다.
 */
export function ExamTable({ table }: { table: ExamTableContext }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrollable = useHorizontalOverflow(scrollRef, table);

  return (
    <div className="flex w-full shrink-0 flex-col gap-4 text-left">
      <div className="flex flex-col gap-1">
        <p className="text-center text-lg text-blue-950 sm:text-xl lg:text-2xl">
          {formatExamTableValue(table.title)}
        </p>
        {table.subtitles.map((subtitle, index) => (
          <p
            key={`subtitle-${index}`}
            className="text-center text-xs leading-relaxed text-zinc-500 sm:text-sm"
          >
            {formatExamTableValue(subtitle)}
          </p>
        ))}
      </div>

      {table.metadata.length > 0 && (
        <ul aria-label="표 부가 정보" className="flex flex-wrap gap-2">
          {table.metadata.map((entry, index) => (
            <li
              key={`${entry.key}-${index}`}
              className="min-w-40 flex-1 rounded-xl bg-zinc-50 px-3 py-2 ring-1 ring-zinc-200"
            >
              <p className="text-xs text-zinc-500">{entry.label}</p>
              <p className="mt-0.5 text-sm text-blue-950">
                {formatExamTableValue(entry.value)}
              </p>
            </li>
          ))}
        </ul>
      )}

      {isScrollable && (
        <p className="text-xs text-zinc-500">
          표를 옆으로 밀어 모든 열을 확인하세요.
        </p>
      )}

      <div
        ref={scrollRef}
        className="w-full overflow-x-auto rounded-2xl ring-1 ring-zinc-200"
      >
        <table className="w-full border-collapse text-xs sm:text-sm lg:text-base">
          <caption className="sr-only">{table.title}</caption>
          <thead>
            <tr className="bg-blue-950 text-white">
              {table.columns.map((column, columnIndex) => (
                <th
                  key={`${column.key}-${columnIndex}`}
                  scope="col"
                  className={`${MIN_COLUMN_WIDTH_CLASS} px-4 py-3 text-left font-medium ${
                    columnIndex < table.columns.length - 1
                      ? "border-r border-white/20"
                      : ""
                  }`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.items.length === 0 ? (
              <tr>
                <td
                  colSpan={table.columns.length}
                  className="px-4 py-4 text-center text-zinc-500"
                >
                  표 항목이 없습니다.
                </td>
              </tr>
            ) : (
              table.items.map((item, rowIndex) => (
                <ExamTableRow
                  key={`row-${rowIndex}`}
                  columns={table.columns}
                  item={item}
                  isLast={rowIndex === table.items.length - 1}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {table.notes.length > 0 && (
        <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
          <p className="text-sm text-blue-950">Notes</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {table.notes.map((note, index) => (
              <li
                key={`${note.scope}-${index}`}
                className="flex gap-2 text-xs leading-relaxed text-zinc-500 sm:text-sm"
              >
                <span aria-hidden>•</span>
                <span className="flex-1">{note.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * 표가 지금 화면에서 실제로 잘려 있는지 본다.
 *
 * 열 개수만으로는 안내가 맞지 않는다 — 열이 많아도 넓은 화면에서는 다 보이고,
 * 열이 적어도 좁은 화면에서는 잘린다. 그래서 화면 폭까지 반영된 결과인 스크롤
 * 컨테이너의 넘침 여부를 직접 재고, 창 크기가 바뀌면 다시 잰다.
 *
 * 첫 페인트에는 안내가 없다가 마운트 후 나타나는데, 반대(항상 띄웠다가 지우는 것)보다
 * 눈에 덜 띄고 서버 렌더 결과와도 어긋나지 않는다.
 */
function useHorizontalOverflow(
  ref: React.RefObject<HTMLElement | null>,
  table: ExamTableContext,
): boolean {
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // 소수점 폭 차이로 1px 이내 넘침이 잡히는 경우가 있어 여유를 둔다.
    const measure = () =>
      setIsOverflowing(node.scrollWidth - node.clientWidth > 1);

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    // 폰트 로드처럼 컨테이너 폭은 그대로인데 내용만 넓어지는 경우까지 잡는다.
    const content = node.firstElementChild;
    if (content) observer.observe(content);
    return () => observer.disconnect();
  }, [ref, table]);

  return isOverflowing;
}

/** 취소선·상태 메모처럼 행 단위로 붙는 표시까지 한 행에서 함께 그린다. */
function ExamTableRow({
  columns,
  item,
  isLast,
}: {
  columns: ExamTableContext["columns"];
  item: ExamTableContext["items"][number];
  isLast: boolean;
}) {
  return (
    <>
      <tr>
        {columns.map((column, columnIndex) => {
          const displayValue = formatExamTableValue(item.cells[column.key]);
          return (
            <td
              key={`${column.key}-${columnIndex}`}
              className={`${MIN_COLUMN_WIDTH_CLASS} px-4 py-3 align-top leading-relaxed ${
                columnIndex < columns.length - 1
                  ? "border-r border-zinc-200"
                  : ""
              } ${
                item.strikeThrough
                  ? "text-zinc-400 line-through"
                  : "text-blue-950"
              } ${item.statusNote || !isLast ? "border-b border-zinc-100" : ""}`}
            >
              {displayValue}
            </td>
          );
        })}
      </tr>

      {item.statusNote && (
        <tr>
          <td
            colSpan={columns.length}
            className={`px-4 py-2 ${isLast ? "" : "border-b border-zinc-100"}`}
          >
            <span className="inline-block rounded-full bg-zinc-50 px-3 py-1 text-xs text-zinc-500 ring-1 ring-zinc-200">
              {formatStatus(item.status)} · {item.statusNote}
            </span>
          </td>
        </tr>
      )}
    </>
  );
}
