import type { ExamSession, RawExamQuestion, RawExamSession } from "@/types/exam";

function getTiming(partNumber: number, isFirstInPart: boolean, isLastInPart: boolean) {
  switch (partNumber) {
    case 1: // Read a Text Aloud
      return { prepTimeSec: 45, speakTimeSec: 45 };
    case 2: // Describe a Picture
      return { prepTimeSec: 45, speakTimeSec: 30 };
    case 3: // Respond to Questions
      return isLastInPart
        ? { prepTimeSec: 3, speakTimeSec: 30 }
        : { prepTimeSec: 3, speakTimeSec: 15 };
    case 4: // Respond to Questions Using Information Provided
      return {
        prepTimeSec: isFirstInPart ? 45 : 3,
        speakTimeSec: isLastInPart ? 30 : 15,
      };
    case 5: // Express an Opinion
      return { prepTimeSec: 45, speakTimeSec: 60 };
    default:
      return { prepTimeSec: 30, speakTimeSec: 30 };
  }
}

export function mapExamSession(raw: RawExamSession): ExamSession {
  const partGroups = new Map<number, RawExamQuestion[]>();
  for (const q of raw.questions) {
    const group = partGroups.get(q.part) ?? [];
    group.push(q);
    partGroups.set(q.part, group);
  }

  const questions = raw.questions.map((q) => {
    const group = partGroups.get(q.part) ?? [q];
    const positionInPart = group.indexOf(q);

    return {
      partNumber: q.part,
      questionNumber: q.questionNumber,
      referenceText: q.referenceText,
      imageUrl: q.imageUrl,
      question: q.text,
      audioUrl: q.audioUrl,
      tableContext: q.tableContext,
      ...getTiming(q.part, positionInPart === 0, positionInPart === group.length - 1),
    };
  });

  return {
    examId: raw.examId,
    title: raw.title,
    questions,
  };
}
