import { isRenderableExamTable } from "@/features/exam/map-exam-table-context";
import type { ExamSession } from "@/types/exam";

/** 문제를 화면에 온전히 띄울 수 없는 이유. 늘어나면 여기에 코드를 추가한다. */
export type UnpresentableQuestionReason = "unrenderable-table";

export interface UnpresentableExamQuestion {
  partNumber: number;
  questionNumber: number;
  reason: UnpresentableQuestionReason;
}

/**
 * 응시를 시작하기 전에, 받은 세션의 모든 문제를 화면에 온전히 띄울 수 있는지 본다.
 *
 * 표가 계약을 어겼다는 건 그 문제(Part 4)를 읽을 수 없다는 뜻이고, 읽을 수 없는 문제는
 * 답할 수도 없다. 그런데도 시험을 시작하면 응시자는 답변을 못 한 채 시험 회차만 소진한다
 * — 결제가 붙으면 그대로 응시권 손실이 된다. 그래서 시작 전에 한 번에 걸러 낸다.
 *
 * 세션 응답은 응시 도중 바뀌지 않으므로, 여기서 통과한 세션은 진행 중에 같은 이유로
 * 표를 잃지 않는다. 화면 쪽 안내(ExamTable)는 이 검사를 지나쳐 온 경우의 마지막 안전망이다.
 */
export function findUnpresentableQuestions(
  session: ExamSession,
): UnpresentableExamQuestion[] {
  const unpresentable: UnpresentableExamQuestion[] = [];

  for (const question of session.questions) {
    if (
      question.tableContext &&
      !isRenderableExamTable(question.tableContext)
    ) {
      unpresentable.push({
        partNumber: question.partNumber,
        questionNumber: question.questionNumber,
        reason: "unrenderable-table",
      });
    }
  }

  return unpresentable;
}
