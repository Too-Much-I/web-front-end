import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  isRenderableExamTable,
  mapExamTableContext,
  toExamTableSlot,
} from "@/features/exam/map-exam-table-context";
import type { RawExamTableContext } from "@/types/exam";

/** 계약을 지키는 최소 표 하나. 각 테스트는 여기서 한 군데만 어긋뜨린다. */
function validRawTable(): RawExamTableContext {
  return {
    table_type: "schedule",
    title: "Marketing Workshop",
    subtitles: ["Tuesday, June 4"],
    metadata: [{ key: "location", label: "Location", value: "Room 302" }],
    columns: [
      { key: "time", label: "Time", value_type: "string" },
      { key: "session", label: "Session", value_type: "string" },
    ],
    items: [
      {
        cells: { time: "9:00 A.M.", session: "Opening Remarks" },
        status: "scheduled",
        status_note: null,
        strike_through: false,
      },
    ],
    notes: [{ scope: "all", text: "Lunch is provided." }],
  };
}

function issueCodes(raw: unknown): string[] {
  return mapExamTableContext(raw).issues.map((issue) => issue.code);
}

let warn: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  warn.mockRestore();
});

describe("toExamTableSlot", () => {
  it("계약을 지킨 표는 그대로 그릴 수 있게 돌려준다", () => {
    const slot = toExamTableSlot(validRawTable(), "test");

    expect(slot).toBeDefined();
    if (!slot || !isRenderableExamTable(slot)) throw new Error("표가 필요하다");
    expect(slot.tableType).toBe("schedule");
    expect(slot.columns.map((column) => column.key)).toEqual([
      "time",
      "session",
    ]);
    expect(slot.items[0].cells.session).toBe("Opening Remarks");
    expect(warn).not.toHaveBeenCalled();
  });

  it("표가 없는 문제와 못 그리는 표를 구분한다", () => {
    expect(toExamTableSlot(undefined, "test")).toBeUndefined();
    expect(toExamTableSlot(null, "test")).toBeUndefined();
  });

  it("중복 열이 있으면 표를 그리지 않는다", () => {
    const raw = validRawTable();
    raw.columns = [
      { key: "time", label: "Time", value_type: "string" },
      { key: "time", label: "Start", value_type: "string" },
    ];

    expect(issueCodes(raw)).toContain("duplicate-column");
    expect(toExamTableSlot(raw, "test")).toEqual({ unrenderable: true });
  });

  it("선언된 열의 셀이 빠지면 표를 그리지 않는다", () => {
    const raw = validRawTable();
    raw.items[0].cells = { time: "9:00 A.M." };

    expect(mapExamTableContext(raw).issues).toContainEqual({
      code: "missing-cell",
      path: "items[0].cells.session",
    });
    expect(toExamTableSlot(raw, "test")).toEqual({ unrenderable: true });
  });

  it("열에 없는 셀이 들어오면 표를 그리지 않는다", () => {
    const raw = validRawTable();
    raw.items[0].cells = { ...raw.items[0].cells, speaker: "Ms. Alvarez" };

    expect(mapExamTableContext(raw).issues).toContainEqual({
      code: "extra-cell",
      path: "items[0].cells.speaker",
    });
    expect(toExamTableSlot(raw, "test")).toEqual({ unrenderable: true });
  });

  it("셀 값 타입이 계약을 벗어나면 표를 그리지 않는다", () => {
    const raw = validRawTable();
    // 서버가 스칼라 대신 객체를 보낸 경우.
    raw.items[0].cells = {
      ...raw.items[0].cells,
      session: { text: "Opening Remarks" } as never,
    };

    expect(issueCodes(raw)).toContain("invalid-scalar");
    expect(toExamTableSlot(raw, "test")).toEqual({ unrenderable: true });
  });

  it("표를 구성할 수 없는 응답은 표를 그리지 않는다", () => {
    expect(toExamTableSlot({ title: "열 없는 표" }, "test")).toEqual({
      unrenderable: true,
    });
    expect(toExamTableSlot("표", "test")).toEqual({ unrenderable: true });
  });

  it("매퍼가 fallback으로 복구한 표시 값도 그리지 않는다", () => {
    const raw = validRawTable();
    // 매퍼는 문자열이 아닌 subtitle을 "—"로 대체하지만, 그대로 보여 주면
    // 서버가 보낸 내용과 다른 표가 된다.
    raw.subtitles = [42 as never];

    const mapping = mapExamTableContext(raw);
    expect(mapping.ok).toBe(true);
    expect(issueCodes(raw)).toContain("invalid-field");
    expect(toExamTableSlot(raw, "test")).toEqual({ unrenderable: true });
  });

  it("못 그리는 표는 개발 모드에서 위치와 함께 보고한다", () => {
    const raw = validRawTable();
    raw.items[0].cells = { time: "9:00 A.M." };

    toExamTableSlot(raw, "question detail 8");

    expect(warn).toHaveBeenCalledWith(
      "[ExamTable] public contract issue",
      expect.objectContaining({ location: "question detail 8" }),
    );
  });
});
