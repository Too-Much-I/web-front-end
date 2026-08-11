import { describe, expect, it } from "vitest";

import {
  COMPLETE_EXAM_QUESTION_COUNT,
  inspectExamSummary,
  isExamSummaryComplete,
} from "@/features/exam/exam-summary-completeness";

function createCompleteSummary() {
  return {
    examId: "exam-1",
    totalScore: 0,
    levelEstimate: "Novice Low",
    totalSolvedQuestions: COMPLETE_EXAM_QUESTION_COUNT,
    summary: "요약",
    overallFeedback: "종합 피드백",
    strengths: ["강점"],
    weaknesses: ["약점"],
    recommendedPractice: ["연습"],
    partFeedback: {
      part1: "파트 1",
      part2: "파트 2",
      part3: "파트 3",
      part4: "파트 4",
      part5: "파트 5",
    },
    partScores: {
      part1: 0,
      part2: 1,
      part3: 2,
      part4: 3,
      part5: 4,
    },
  };
}

describe("inspectExamSummary", () => {
  it("0점을 포함한 완전한 summary를 통과시킨다", () => {
    const inspected = inspectExamSummary(createCompleteSummary(), "fallback");

    expect(inspected.completeness.missingFields).toEqual([]);
    expect(isExamSummaryComplete(inspected.completeness)).toBe(true);
    expect(inspected.normalized.totalScore).toBe(0);
    expect(inspected.normalized.partScores.part1).toBe(0);
  });

  it.each([null, undefined, "", "   "])(
    "필수 문자열 %j을 누락으로 판정한다",
    (summary) => {
      const inspected = inspectExamSummary(
        { ...createCompleteSummary(), summary },
        "fallback",
      );

      expect(inspected.completeness.missingFields).toContain("summary");
    },
  );

  it("빈 배열과 공백 문자열 배열을 누락으로 판정한다", () => {
    const inspected = inspectExamSummary(
      {
        ...createCompleteSummary(),
        strengths: [],
        weaknesses: ["   "],
        recommendedPractice: null,
      },
      "fallback",
    );

    expect(inspected.completeness.missingFields).toEqual(
      expect.arrayContaining([
        "strengths",
        "weaknesses",
        "recommendedPractice",
      ]),
    );
  });

  it.each([NaN, Infinity, -Infinity, null, undefined])(
    "유한하지 않은 점수 %j을 누락으로 판정한다",
    (totalScore) => {
      const inspected = inspectExamSummary(
        { ...createCompleteSummary(), totalScore },
        "fallback",
      );

      expect(inspected.completeness.missingFields).toContain("totalScore");
    },
  );

  it("파트 객체가 없어도 예외 없이 모든 파트를 누락으로 수집한다", () => {
    const raw = createCompleteSummary();
    const inspected = inspectExamSummary(
      { ...raw, partFeedback: null, partScores: undefined },
      "fallback",
    );

    expect(inspected.completeness.missingParts.feedback).toEqual([
      1, 2, 3, 4, 5,
    ]);
    expect(inspected.completeness.missingParts.scores).toEqual([1, 2, 3, 4, 5]);
    expect(inspected.normalized.partFeedback.part1).toBe("");
  });

  it("11문제가 아니면 totalSolvedQuestions를 누락으로 분류한다", () => {
    const inspected = inspectExamSummary(
      { ...createCompleteSummary(), totalSolvedQuestions: 10 },
      "fallback",
    );

    expect(inspected.completeness.missingFields).toContain(
      "totalSolvedQuestions",
    );
  });
});
