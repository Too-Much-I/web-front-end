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
  /** Part 3 setup narration text ("Imagine a cooking magazine..."), read once before the part's first question. */
  partIntroText?: string;
  /** Narrated audio for partIntroText. */
  guideAudioUrl?: string;
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
  /** Part 3 setup narration text ("Imagine a cooking magazine..."), read once before the part's first question. */
  partIntroText?: string;
  /** Narrated audio for partIntroText. */
  guideAudioUrl?: string;
  prepTimeSec: number;
  speakTimeSec: number;
  /** 같은 파트의 첫 문제인지. Part 4의 첫 문제(Q8) 앞에는 정보를 읽는 45초가 별도로 주어진다. */
  isFirstInPart: boolean;
  /** 같은 파트의 마지막 문제인지. Part 4의 마지막 문제(Q10)는 질문 오디오를 두 번 들려준다. */
  isLastInPart: boolean;
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

/** 문장/구간 단위 첨삭 항목. correctionItems, offTopicItems가 이 모양을 공유한다. */
export interface RawExamCorrectionItem {
  type: string;
  original: string;
  issue: string;
  explanation: string;
  suggested: string;
  severity: "high" | "medium" | "low";
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
  /** Part 1(낭독)에는 내용 적합성 개념이 없어 null로 내려온다. */
  contentRelevanceScore: number | null;
  grammarVocabulary: string;
  actionItems: string[];
  /** 채점 항목에 문제가 없으면 빈 배열이 아니라 null로 내려오기도 한다. */
  correctionItems: RawExamCorrectionItem[] | null;
  nextStrategy: string;
}

/**
 * Azure Pronunciation Assessment 기반 단어별 발음 채점. Part 1(낭독)에서만 내려오며,
 * word는 실제로 인식된(발화된) 단어 순서라 transcript(정제된 참고 답안)와 1:1로 대응하지 않는다.
 */
export interface RawSpokenWord {
  index: number;
  segmentIndex: number;
  wordIndex: number;
  word: string;
  offset: number;
  duration: number;
  accuracyScore: number;
  pronunciationScore: number;
  /** Azure 오류 태그. "None"이면 정상, 그 외(Mispronunciation/Omission/Insertion 등)는 오류. */
  errorType: string;
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
  spokenWordSequence?: RawSpokenWord[];
}

/** GET /api/v1/exams/{examId}/questions/{questionNumber} 의 result */
export interface RawExamQuestionDetailResult {
  examId: string;
  question: RawExamQuestionDetail;
}

export interface ExamCorrectionItem {
  type: string;
  original: string;
  issue: string;
  explanation: string;
  suggested: string;
  severity: "high" | "medium" | "low";
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
  contentRelevanceScore: number | null;
  grammarVocabulary: string;
  actionItems: string[];
  correctionItems: ExamCorrectionItem[];
  nextStrategy: string;
}

export interface SpokenWord {
  segmentIndex: number;
  word: string;
  accuracyScore: number;
  errorType: string;
  /** Azure Pronunciation Assessment 기준 100ns 단위(tick). 오디오 상 발화 시작 위치. */
  offset: number;
  /** Azure Pronunciation Assessment 기준 100ns 단위(tick). 발화 지속 시간. */
  duration: number;
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
  spokenWordSequence: SpokenWord[];
}
