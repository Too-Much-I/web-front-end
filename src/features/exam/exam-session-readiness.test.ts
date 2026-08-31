import { describe, expect, it } from "vitest";

import { findUnpresentableQuestions } from "@/features/exam/exam-session-readiness";
import { UNRENDERABLE_EXAM_TABLE } from "@/features/exam/map-exam-table-context";
import type { ExamQuestion, ExamSession, ExamTableContext } from "@/types/exam";

const RENDERABLE_TABLE: ExamTableContext = {
  tableType: "schedule",
  title: "Marketing Workshop",
  subtitles: [],
  metadata: [],
  columns: [{ key: "time", label: "Time", valueType: "string" }],
  items: [
    {
      cells: { time: "9:00 A.M." },
      status: "scheduled",
      statusNote: null,
      strikeThrough: false,
    },
  ],
  notes: [],
};

function question(overrides: Partial<ExamQuestion>): ExamQuestion {
  return {
    partNumber: 1,
    questionNumber: 1,
    prepTimeSec: 45,
    speakTimeSec: 45,
    isFirstInPart: true,
    isLastInPart: true,
    ...overrides,
  };
}

function session(questions: ExamQuestion[]): ExamSession {
  return { examId: "exam-1", title: "모의고사", questions };
}

describe("findUnpresentableQuestions", () => {
  it("표가 없는 문제만 있으면 시작을 막지 않는다", () => {
    const result = findUnpresentableQuestions(
      session([question({}), question({ partNumber: 2, questionNumber: 3 })]),
    );

    expect(result).toEqual([]);
  });

  it("그릴 수 있는 표는 시작을 막지 않는다", () => {
    const result = findUnpresentableQuestions(
      session([
        question({
          partNumber: 4,
          questionNumber: 8,
          tableContext: RENDERABLE_TABLE,
        }),
      ]),
    );

    expect(result).toEqual([]);
  });

  it("못 그리는 표를 가진 문제를 파트·문제 번호와 함께 집어낸다", () => {
    const result = findUnpresentableQuestions(
      session([
        question({}),
        question({
          partNumber: 4,
          questionNumber: 8,
          tableContext: UNRENDERABLE_EXAM_TABLE,
        }),
        question({
          partNumber: 4,
          questionNumber: 9,
          tableContext: UNRENDERABLE_EXAM_TABLE,
        }),
      ]),
    );

    expect(result).toEqual([
      { partNumber: 4, questionNumber: 8, reason: "unrenderable-table" },
      { partNumber: 4, questionNumber: 9, reason: "unrenderable-table" },
    ]);
  });
});
