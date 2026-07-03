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

/** GET /api/v1/exams/{examId}/results 의 result. 서버 스펙 확정 전까지는 형태를 고정하지 않는다. */
export type ExamGradingResult = Record<string, unknown>;
