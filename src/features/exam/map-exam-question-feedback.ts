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
      pronunciationFluencyScore: question.feedback.pronunciation_fluency_score,
      contentRelevanceScore: question.feedback.content_relevance_score,
      grammarVocabulary: question.feedback.grammar_vocabulary,
      actionItems: question.feedback.action_items,
    },
  };
}
