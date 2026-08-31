import type {
  ExamTableColumn,
  ExamTableContext,
  ExamTableItem,
  ExamTableMetadata,
  ExamTableNote,
  ExamTableScalar,
  ExamTableSlot,
  UnrenderableExamTable,
} from "@/types/exam";

export type ExamTableContractIssueCode =
  | "invalid-context"
  | "invalid-field"
  | "invalid-entry"
  | "invalid-scalar"
  | "missing-cell"
  | "extra-cell"
  | "duplicate-column";

export interface ExamTableContractIssue {
  code: ExamTableContractIssueCode;
  path: string;
}

export type ExamTableContextMapping =
  | {
      ok: true;
      value: ExamTableContext;
      issues: ExamTableContractIssue[];
    }
  | {
      ok: false;
      issues: ExamTableContractIssue[];
    };

const EMPTY_DISPLAY_VALUE = "—";
const UNKNOWN_STATUS = "unknown";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isScalar(value: unknown): value is ExamTableScalar {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value))
  );
}

function issue(
  issues: ExamTableContractIssue[],
  code: ExamTableContractIssueCode,
  path: string,
): void {
  issues.push({ code, path });
}

function stringOr(
  value: unknown,
  fallback: string,
  path: string,
  issues: ExamTableContractIssue[],
): string {
  if (typeof value === "string") return value;
  issue(issues, "invalid-field", path);
  return fallback;
}

function arrayOrEmpty(
  value: unknown,
  path: string,
  issues: ExamTableContractIssue[],
): unknown[] {
  if (Array.isArray(value)) return value;
  issue(issues, "invalid-field", path);
  return [];
}

function mapMetadata(
  raw: unknown,
  index: number,
  issues: ExamTableContractIssue[],
): ExamTableMetadata {
  const path = `metadata[${index}]`;
  if (!isRecord(raw)) {
    issue(issues, "invalid-entry", path);
    return {
      key: `metadata-${index}`,
      label: EMPTY_DISPLAY_VALUE,
      value: null,
    };
  }

  const key = stringOr(raw.key, `metadata-${index}`, `${path}.key`, issues);
  const label = stringOr(
    raw.label,
    key || EMPTY_DISPLAY_VALUE,
    `${path}.label`,
    issues,
  );
  const value = isScalar(raw.value) ? raw.value : null;
  if (!isScalar(raw.value)) issue(issues, "invalid-scalar", `${path}.value`);
  return { key, label, value };
}

function mapColumn(
  raw: unknown,
  index: number,
  issues: ExamTableContractIssue[],
): ExamTableColumn | null {
  const path = `columns[${index}]`;
  if (!isRecord(raw)) {
    issue(issues, "invalid-entry", path);
    return null;
  }
  if (typeof raw.key !== "string" || raw.key.length === 0) {
    issue(issues, "invalid-field", `${path}.key`);
    return null;
  }

  return {
    key: raw.key,
    label: stringOr(raw.label, raw.key, `${path}.label`, issues),
    valueType: stringOr(
      raw.value_type,
      "unknown",
      `${path}.value_type`,
      issues,
    ),
  };
}

function mapCells(
  raw: unknown,
  path: string,
  issues: ExamTableContractIssue[],
): Record<string, ExamTableScalar> {
  if (!isRecord(raw)) {
    issue(issues, "invalid-field", path);
    return {};
  }

  const entries: Array<[string, ExamTableScalar]> = [];
  for (const [key, value] of Object.entries(raw)) {
    if (isScalar(value)) {
      entries.push([key, value]);
    } else {
      issue(issues, "invalid-scalar", `${path}.${key}`);
      entries.push([key, null]);
    }
  }
  return Object.fromEntries(entries);
}

function mapItem(
  raw: unknown,
  index: number,
  issues: ExamTableContractIssue[],
): ExamTableItem {
  const path = `items[${index}]`;
  if (!isRecord(raw)) {
    issue(issues, "invalid-entry", path);
    return {
      cells: {},
      status: UNKNOWN_STATUS,
      statusNote: null,
      strikeThrough: false,
    };
  }

  let statusNote: string | null = null;
  if (typeof raw.status_note === "string" || raw.status_note === null) {
    statusNote = raw.status_note;
  } else {
    issue(issues, "invalid-field", `${path}.status_note`);
  }

  const strikeThrough =
    typeof raw.strike_through === "boolean" && raw.strike_through;
  if (typeof raw.strike_through !== "boolean") {
    issue(issues, "invalid-field", `${path}.strike_through`);
  }

  return {
    cells: mapCells(raw.cells, `${path}.cells`, issues),
    status: stringOr(raw.status, UNKNOWN_STATUS, `${path}.status`, issues),
    statusNote,
    strikeThrough,
  };
}

function mapNote(
  raw: unknown,
  index: number,
  issues: ExamTableContractIssue[],
): ExamTableNote {
  const path = `notes[${index}]`;
  if (!isRecord(raw)) {
    issue(issues, "invalid-entry", path);
    return { scope: "unknown", text: EMPTY_DISPLAY_VALUE };
  }
  return {
    scope: stringOr(raw.scope, "unknown", `${path}.scope`, issues),
    text: stringOr(raw.text, EMPTY_DISPLAY_VALUE, `${path}.text`, issues),
  };
}

/**
 * 네트워크 표 값을 화면 domain으로 옮긴다. 앱(app-front-end)의 같은 이름 매퍼와
 * 동일한 public 계약을 쓴다 — 표 종류마다 열이 다르므로 고정 열을 가정하지 않는다.
 *
 * 표 전체를 구성할 수 없는 오류만 실패로 돌려주고, 개별 행·셀 오류는 순서를 유지한 채
 * fallback 값과 issue로 복구한다. issue에는 사용자 데이터 본문을 넣지 않는다.
 */
export function mapExamTableContext(raw: unknown): ExamTableContextMapping {
  const issues: ExamTableContractIssue[] = [];
  if (!isRecord(raw)) {
    issue(issues, "invalid-context", "tableContext");
    return { ok: false, issues };
  }

  if (
    typeof raw.table_type !== "string" ||
    typeof raw.title !== "string" ||
    !Array.isArray(raw.columns) ||
    raw.columns.length === 0 ||
    !Array.isArray(raw.items)
  ) {
    issue(issues, "invalid-context", "tableContext");
    return { ok: false, issues };
  }

  const columns = raw.columns.map((column, index) =>
    mapColumn(column, index, issues),
  );
  if (columns.some((column) => column === null)) return { ok: false, issues };
  const validColumns: ExamTableColumn[] = [];
  for (const column of columns) {
    if (column) validColumns.push(column);
  }

  const seenColumnKeys = new Set<string>();
  for (let index = 0; index < validColumns.length; index += 1) {
    const column = validColumns[index];
    if (seenColumnKeys.has(column.key)) {
      issue(issues, "duplicate-column", `columns[${index}].key`);
    }
    seenColumnKeys.add(column.key);
  }

  const items = raw.items.map((item, index) => mapItem(item, index, issues));
  for (let rowIndex = 0; rowIndex < items.length; rowIndex += 1) {
    const cells = items[rowIndex].cells;
    for (const column of validColumns) {
      if (!Object.prototype.hasOwnProperty.call(cells, column.key)) {
        issue(issues, "missing-cell", `items[${rowIndex}].cells.${column.key}`);
      }
    }
    for (const cellKey of Object.keys(cells)) {
      if (!seenColumnKeys.has(cellKey)) {
        issue(issues, "extra-cell", `items[${rowIndex}].cells.${cellKey}`);
      }
    }
  }

  const subtitles = arrayOrEmpty(raw.subtitles, "subtitles", issues).map(
    (subtitle, index) =>
      stringOr(subtitle, EMPTY_DISPLAY_VALUE, `subtitles[${index}]`, issues),
  );
  const metadata = arrayOrEmpty(raw.metadata, "metadata", issues).map(
    (entry, index) => mapMetadata(entry, index, issues),
  );
  const notes = arrayOrEmpty(raw.notes, "notes", issues).map((entry, index) =>
    mapNote(entry, index, issues),
  );

  return {
    ok: true,
    value: {
      tableType: raw.table_type,
      title: raw.title,
      subtitles,
      metadata,
      columns: validColumns,
      items,
      notes,
    },
    issues,
  };
}

export function reportExamTableContractIssues(
  location: string,
  issues: readonly ExamTableContractIssue[],
): void {
  if (process.env.NODE_ENV === "production" || issues.length === 0) return;
  console.warn("[ExamTable] public contract issue", { location, issues });
}

/** 계약 위반으로 못 그리는 표를 가리키는 단일 값. 매번 새 객체를 만들지 않는다. */
export const UNRENDERABLE_EXAM_TABLE: UnrenderableExamTable = Object.freeze({
  unrenderable: true,
});

export function isRenderableExamTable(
  slot: ExamTableSlot,
): slot is ExamTableContext {
  return !("unrenderable" in slot);
}

/**
 * 표를 화면에 그릴 수 있는 상태로 바꾼다.
 *
 * 계약 위반은 **하나라도 있으면 전부 치명적으로 본다** — 표는 응시자가 답변 근거로
 * 읽는 데이터라, 중복 열·누락 셀·계약에 없는 셀처럼 표시 결과가 서버 데이터와
 * 달라질 수 있는 상태를 "복구했다"고 치고 그리면 잘못된 정보를 사실처럼 보여 준다.
 * 그래서 매퍼가 fallback으로 채운 값(라벨 "—" 등)도 화면에 내보내지 않는다.
 * 개별 fallback 자체는 mapExamTableContext에 그대로 남겨 둔다 — issue 목록으로
 * 어디가 어떻게 어긋났는지 보고하려면 끝까지 매핑해 봐야 한다.
 *
 * 표가 없는 문제(undefined/null)와 못 그리는 표는 구분해서 돌려준다. 앞은 표 자리가
 * 아예 없는 문제고, 뒤는 화면에 안내를 띄워야 하는 오류다.
 */
export function toExamTableSlot(
  raw: unknown,
  location: string,
): ExamTableSlot | undefined {
  if (raw === undefined || raw === null) return undefined;
  const mapping = mapExamTableContext(raw);
  reportExamTableContractIssues(location, mapping.issues);
  if (!mapping.ok || mapping.issues.length > 0) return UNRENDERABLE_EXAM_TABLE;
  return mapping.value;
}
