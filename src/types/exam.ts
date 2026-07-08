export interface ExamTableItem {
  time: string;
  sessionTitle: string;
  speaker?: string | null;
  note?: string;
}

export interface ExamTableContext {
  title: string;
  location: string;
  date: string;
  fee: string;
  items: ExamTableItem[];
}

export interface RawExamQuestion {
  part: number;
  questionNumber: number;
  referenceText?: string;
  imageUrl?: string;
  text?: string;
  tableContext?: ExamTableContext;
  audioUrl?: string;
}

export interface RawExamSession {
  examId: string;
  title: string;
  questions: RawExamQuestion[];
}

export interface ExamQuestion {
  partNumber: number;
  questionNumber: number;
  referenceText?: string;
  imageUrl?: string;
  question?: string;
  audioUrl?: string;
  tableContext?: ExamTableContext;
  prepTimeSec: number;
  speakTimeSec: number;
}

export interface ExamSession {
  examId: string;
  title: string;
  questions: ExamQuestion[];
}

export interface ExamAttempt {
  id: string;
  status: "in_progress" | "uploading" | "grading" | "completed" | "failed";
  startedAt: string;
}

/** GET /api/v1/exams/{examId}/questions/{questionId}/upload-url 의 result */
export interface ExamAnswerUploadUrl {
  uploadUrl: string;
  fileKey: string;
  expiresIn: number;
}

/** POST /api/v1/exams/{examId}/questions/{questionId}/submit 의 result */
export interface ExamAnswerSubmitResult {
  status: "PROCESSING";
}

/** GET /api/v1/exams/{examId}/status 의 result */
export interface ExamGradingStatus {
  examId: string;
  overallStatus: "PROCESSING" | "COMPLETED" | "FAILED";
  progressPercent: number;
}

/** AI 채점 에이전트가 파트별로 내려주는 피드백. part1~part5 고정 키. */
export interface RawExamPartFeedback {
  part1: string;
  part2: string;
  part3: string;
  part4: string;
  part5: string;
}

/** 파트별 세부 점수. 채점 대상 파트만 내려온다 (예: 재응시한 파트만 포함). */
export interface ExamPartScores {
  part1?: number;
  part2?: number;
  part3?: number;
  part4?: number;
  part5?: number;
}

/** GET /api/v1/exams/{examId}/summary 의 result */
export interface RawExamSummaryResult {
  examId: string;
  totalScore: number;
  levelEstimate: string;
  summary: string;
  overallFeedback: string;
  partFeedback: RawExamPartFeedback;
  strengths: string[];
  weaknesses: string[];
  recommendedPractice: string[];
  partScores: ExamPartScores;
}

export interface ExamPartFeedback {
  partNumber: number;
  feedback: string;
}

export interface ExamGradingResult {
  examId: string;
  totalScore: number;
  maxScore: number;
  levelEstimate: string;
  summary: string;
  overallFeedback: string;
  partFeedback: ExamPartFeedback[];
  strengths: string[];
  weaknesses: string[];
  recommendedPractice: string[];
  partScores: ExamPartScores;
}

/** GET /api/v1/exams/{examId}/questions/{questionNumber} 의 result.question.feedback */
export interface RawExamQuestionFeedback {
  summary: string;
  level: string;
  strengths: string[];
  weaknesses: string[];
  pronunciation: string;
  fluency: string;
  content: string;
  pronunciationFluencyScore: number;
  contentRelevanceScore: number;
  grammarVocabulary: string;
  actionItems: string[];
}

/** GET /api/v1/exams/{examId}/questions/{questionNumber} 의 result.question */
export interface RawExamQuestionDetail {
  partNumber: number;
  questionNumber: number;
  audioUrl: string;
  score: number;
  maxScore: number;
  transcript: string;
  feedback: RawExamQuestionFeedback;
}

/** GET /api/v1/exams/{examId}/questions/{questionNumber} 의 result */
export interface RawExamQuestionDetailResult {
  examId: string;
  question: RawExamQuestionDetail;
}

export interface ExamQuestionFeedback {
  summary: string;
  level: string;
  strengths: string[];
  weaknesses: string[];
  pronunciation: string;
  fluency: string;
  content: string;
  pronunciationFluencyScore: number;
  contentRelevanceScore: number;
  grammarVocabulary: string;
  actionItems: string[];
}

export interface ExamQuestionDetail {
  examId: string;
  partNumber: number;
  questionNumber: number;
  audioUrl: string;
  score: number;
  maxScore: number;
  transcript: string;
  feedback: ExamQuestionFeedback;
}
