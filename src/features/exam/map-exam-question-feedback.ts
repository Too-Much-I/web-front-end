import type { ExamQuestionDetail, RawExamQuestionDetailResult } from "@/types/exam";

export function mapExamQuestionDetail(raw: RawExamQuestionDetailResult): ExamQuestionDetail {
  const { question } = raw;

  return {
    examId: raw.examId,
    partNumber: question.partNumber,
    questionNumber: question.questionNumber,
    audioUrl: question.audioUrl,
    score: question.score,
    maxScore: question.maxScore,
    transcript: question.transcript,
    feedback: {
      summary: question.feedback.summary,
      level: question.feedback.level,
      strengths: question.feedback.strengths,
      weaknesses: question.feedback.weaknesses,
      pronunciation: question.feedback.pronunciation,
      fluency: question.feedback.fluency,
      content: question.feedback.content,
      pronunciationFluencyScore: question.feedback.pronunciationFluencyScore,
      contentRelevanceScore: question.feedback.contentRelevanceScore,
      grammarVocabulary: question.feedback.grammarVocabulary,
      actionItems: question.feedback.actionItems,
      correctionItems: (question.feedback.correctionItems ?? []).map((item) => ({
        type: item.type,
        original: item.original,
        issue: item.issue,
        explanation: item.explanation,
        suggested: item.suggested,
        severity: item.severity,
      })),
      nextStrategy: question.feedback.nextStrategy,
    },
  };
}
