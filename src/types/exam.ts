export interface ExamTableItem {
  time: string;
  session_title: string;
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
  part_number: number;
  question_number: number;
  reference_text?: string;
  image_url?: string;
  question?: string;
  table_context?: ExamTableContext;
  /** Narrated audio of `question`. Mocked locally for now; the real exam will get this from the server. */
  audio_url?: string;
}

export interface RawExamSession {
  mock_exam_id: string;
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

/** GET /api/v1/exams/{examId}/results 의 result. AI 채점 에이전트가 내려주는 mock 응답 스펙을 그대로 따른다. */
export interface RawExamGradingResult {
  _id: string;
  user_id: string;
  mock_exam_id: string;
  item_count: number;
  expected_item_count: number;
  source_evaluation_item_ids: string[];
  suggested_total_score: number;
  /** 예: "0-200" */
  score_scale: string;
  level_estimate: string;
  summary: string;
  overall_feedback: string;
  part_feedback: RawExamPartFeedback;
  strengths: string[];
  weaknesses: string[];
  recommended_practice: string[];
  missing_questions: string[];
  model_reasoning_summary: string;
  created_at: string;
  updated_at: string;
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
}
