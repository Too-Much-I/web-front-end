export type ExamTableScalar = string | number | boolean | null;

export interface RawExamTableMetadata {
  key: string;
  label: string;
  value: ExamTableScalar;
}

export interface RawExamTableColumn {
  key: string;
  label: string;
  value_type: string;
}

export interface RawExamTableItem {
  cells: Record<string, ExamTableScalar>;
  status: string;
  status_note: string | null;
  strike_through: boolean;
}

export interface RawExamTableNote {
  scope: string;
  text: string;
}

/** Part 4 public wire contract. 내부 필드는 서버 규격의 snake_case를 그대로 적는다. */
export interface RawExamTableContext {
  table_type: string;
  title: string;
  subtitles: string[];
  metadata: RawExamTableMetadata[];
  columns: RawExamTableColumn[];
  items: RawExamTableItem[];
  notes: RawExamTableNote[];
}

export interface ExamTableMetadata {
  key: string;
  label: string;
  value: ExamTableScalar;
}

export interface ExamTableColumn {
  key: string;
  label: string;
  valueType: string;
}

export interface ExamTableItem {
  cells: Record<string, ExamTableScalar>;
  status: string;
  statusNote: string | null;
  strikeThrough: boolean;
}

export interface ExamTableNote {
  scope: string;
  text: string;
}

/**
 * 화면이 소비하는 Part 4 표. 표 종류마다 열 구성이 다르므로 고정 열을 가정하지 않고
 * columns/cells 쌍으로만 그린다 — 종류·상태·키는 서버가 늘릴 수 있어 string으로 둔다.
 */
export interface ExamTableContext {
  tableType: string;
  title: string;
  subtitles: string[];
  metadata: ExamTableMetadata[];
  columns: ExamTableColumn[];
  items: ExamTableItem[];
  notes: ExamTableNote[];
}

/**
 * 계약을 못 지켜 그릴 수 없는 표. 중복 열·누락 셀처럼 화면에 보이는 표가 서버가 보낸
 * 데이터와 달라질 수 있는 위반은 전부 이 상태로 떨어뜨리고, 표 대신 안내를 그린다.
 */
export interface UnrenderableExamTable {
  unrenderable: true;
}

/**
 * 화면의 표 자리 — 그릴 수 있는 표이거나, 계약 위반으로 못 그리는 표이거나.
 * 표가 아예 없는 문제는 이 필드 자체가 undefined다.
 *
 * 앱(app-front-end)은 같은 위반에서 예외를 던져 Part 4 진입을 막지만, 웹은 표만
 * 안내로 바꾸고 나머지 화면은 계속 그린다 — 그래서 이 타입만 앱과 다르다.
 */
export type ExamTableSlot = ExamTableContext | UnrenderableExamTable;

export interface RawExamQuestion {
  part: number;
  questionNumber: number;
  referenceText?: string;
  imageUrl?: string;
  text?: string;
  tableContext?: RawExamTableContext;
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
  tableContext?: ExamTableSlot;
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
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
}

/** GET /api/v1/exams/{examId}/questions/status (문항별 재시도 채점 진행 상태 폴링)의 result */
export interface ExamQuestionPollResult {
  examId: string;
  questionNumber: number;
  retryCount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
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
  /** 중단(terminate)한 응시는 여기까지만 풀렸다 — 앞/뒤로 이동 없이 순서대로 응시하므로,
   * 1부터 이 값까지의 전체 문제 번호(EXAM_PART_QUESTION_NUMBERS 참고)가 곧 풀린 문제다. */
  totalSolvedQuestions: number;
  summary: string;
  overallFeedback: string;
  partFeedback: RawExamPartFeedback;
  /** 다른 AI 채점 필드처럼(RawExamQuestionFeedback 참고) 내용이 없으면 빈 배열 대신 null로
   * 내려올 수 있다 — 특히 중단(terminate)해서 일부 파트만 채점된 경우 관측됨. */
  strengths: string[] | null;
  weaknesses: string[] | null;
  recommendedPractice: string[] | null;
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
  totalSolvedQuestions: number;
  summary: string;
  overallFeedback: string;
  partFeedback: ExamPartFeedback[];
  strengths: string[];
  weaknesses: string[];
  recommendedPractice: string[];
  partScores: ExamPartScores;
}

export type ExamSummaryPartNumber = 1 | 2 | 3 | 4 | 5;

export type ExamSummaryMissingField =
  | "totalSolvedQuestions"
  | "totalScore"
  | "levelEstimate"
  | "summary"
  | "overallFeedback"
  | "strengths"
  | "weaknesses"
  | "recommendedPractice"
  | `partFeedback.part${ExamSummaryPartNumber}`
  | `partScores.part${ExamSummaryPartNumber}`;

export interface ExamSummaryCompleteness {
  missingFields: ExamSummaryMissingField[];
  missingParts: {
    feedback: ExamSummaryPartNumber[];
    scores: ExamSummaryPartNumber[];
  };
  presence: {
    hasSummary: boolean;
    hasOverallFeedback: boolean;
    hasStrengths: boolean;
    hasWeaknesses: boolean;
    hasRecommendedPractice: boolean;
  };
  totalSolvedQuestions: number | null;
}

export type ExamSummaryDataSource = "native-bridge" | "direct-api";

export interface AppExamSummaryData {
  result: ExamGradingResult;
  completeness: ExamSummaryCompleteness;
  dataSource: ExamSummaryDataSource;
}

/** 문장/구간 단위 첨삭 항목. correctionItems, offTopicItems가 이 모양을 공유한다. */
export interface RawExamCorrectionItem {
  type: string;
  original: string;
  issue: string;
  explanation: string;
  suggested: string;
  /** AI 채점 결과라 어휘가 고정돼 있지 않다 — "high"/"medium"/"low"뿐 아니라 "major"/"minor" 등
   * 다른 값도 실측으로 확인됐다. 문자열 그대로 두고 소비하는 쪽에서 정규화한다. */
  severity: string;
}

/**
 * Azure Pronunciation Assessment 세부 지표 하나. 실측 응답에서 배열의 각 원소가 4개 키
 * (accuracy_score/fluency_score/completeness_score/prosody_score) 중 딱 하나만 담은
 * 채로 내려온다 — 예: [{accuracy_score: 94.7}, {fluency_score: 93.3}, ...]. 원소 순서나
 * 개수가 보장되지 않아 매퍼(map-exam-question-feedback.ts)에서 하나의 객체로 합친다.
 */
export type RawExamDetailedScoreItem = Partial<
  Record<
    "accuracy_score" | "fluency_score" | "completeness_score" | "prosody_score",
    number
  >
>;

/**
 * GET /api/v1/exams/{examId}/questions/{questionNumber} 의 result.question.feedback.
 * 스웨거 스펙(v3/api-docs)에는 이 안이 snake_case로 문서화돼 있지만,
 * 실제 서버 응답은 camelCase로 내려온다 — 스펙이 실제 구현과 어긋나 있으니
 * 필드명은 실측(콘솔 로그) 기준으로 맞춘다.
 */
export interface RawExamQuestionFeedback {
  summary: string;
  level: string;
  /** 다른 항목처럼 값이 없으면 빈 배열 대신 null로 내려올 수 있다. */
  strengths: string[] | null;
  weaknesses: string[] | null;
  pronunciation: string;
  fluency: string;
  content: string;
  /** Azure Pronunciation Assessment 세부 지표(정확도/유창성/완전성/운율), 0~100점. */
  detailedScores?: RawExamDetailedScoreItem[] | null;
  /** retryFeedbackScores의 같은 이름 필드와 동일한 지표 — 조회 중인 회차의 값이 여기에도 내려온다. */
  pronunciationFluencyScore: number | null;
  /** Part 1(낭독)에는 내용 적합성 개념이 없어 null로 내려온다. */
  contentRelevanceScore: number | null;
  grammarVocabulary: string;
  actionItems: string[] | null;
  /** 채점 항목에 문제가 없으면 빈 배열이 아니라 null로 내려오기도 한다. */
  correctionItems: RawExamCorrectionItem[] | null;
  offTopicItems: string[] | null;
  /** "모범답안" 탭에 대응. */
  correctedAnswer: string | null;
  /** "추천답안" 탭에 대응. Part 1은 **강세**, ↑/↓ 억양, ✓/✓✓ 쉼 마크업을 포함할 수 있다. */
  recommendedAnswer: string | null;
  nextStrategy: string | null;
}

/**
 * Azure Pronunciation Assessment 기반 단어별 발음 채점. Part 1(낭독)에서만 내려오며,
 * word는 실제로 인식된(발화된) 단어 순서라 transcript(정제된 참고 답안)와 1:1로 대응하지 않는다.
 * 스웨거 스펙은 snake_case로 문서화돼 있지만 실제 응답은 camelCase다 (feedback과 동일한 불일치).
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

/** GET /api/v1/exams/{examId}/questions/{questionNumber} 의 result.question.questionInfo — 문제 원문. */
export interface RawExamQuestionInfo {
  part: number;
  questionNumber: number;
  text?: string;
  referenceText?: string;
  partIntroText?: string;
  audioUrl?: string;
  guideAudioUrl?: string;
  imageUrl?: string;
  tableContext?: RawExamTableContext;
  prepTimeSec: number;
  speakTimeSec: number;
}

/**
 * result.question.retryScores — 회차별 총점. 조회 중인 회차뿐 아니라 그 문제의 전체
 * 시도가 한 번에 내려오므로, 회차를 오가며 재조회하지 않고도 성장 그래프를 그릴 수 있다.
 */
export interface RawExamRetryScore {
  retryCount: number;
  score: number;
}

/**
 * result.question.retryFeedbackScores — 회차별 세부 지표.
 * detailedScores는 feedback.detailedScores와 같은 "한 키짜리 객체들의 배열" 형태다.
 */
export interface RawExamRetryFeedbackScore {
  retryCount: number;
  pronunciationFluencyScore: number | null;
  /** Part 1(낭독)에는 내용 적합성 개념이 없어 null로 내려온다. */
  contentRelevanceScore: number | null;
  detailedScores?: RawExamDetailedScoreItem[] | null;
}

/** GET /api/v1/exams/{examId}/questions/{questionNumber} 의 result.question */
export interface RawExamQuestionDetail {
  partNumber: number;
  questionNumber: number;
  /** 지금 조회 중인 회차. 최초 응시가 0-base 인덱스 0이고, 재답변마다 1씩 늘어난다. */
  retryCount: number;
  /**
   * 최초 응시를 포함한 전체 시도 "횟수"(1부터 시작 — 실제 응답으로 확인됨: 재시도가 전혀
   * 없는 문제도 1로 내려온다). retryCount가 0-base 인덱스이므로 유효한 마지막 인덱스는
   * totalRetryCount - 1이다.
   */
  totalRetryCount: number;
  audioUrl: string;
  score: number;
  maxScore: number;
  transcript: string;
  feedback: RawExamQuestionFeedback;
  /** 재시도 기능 이전에 채점된 응답에는 없을 수 있어 optional로 둔다. */
  retryScores?: RawExamRetryScore[] | null;
  retryFeedbackScores?: RawExamRetryFeedbackScore[] | null;
  spokenWordSequence?: RawSpokenWord[];
  questionInfo: RawExamQuestionInfo;
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
  /** AI 채점 결과라 어휘가 고정돼 있지 않다 — "high"/"medium"/"low"뿐 아니라 "major"/"minor" 등
   * 다른 값도 실측으로 확인됐다. 문자열 그대로 두고 소비하는 쪽에서 정규화한다. */
  severity: string;
}

/**
 * Azure Pronunciation Assessment 세부 지표(0~100점). completeness는 Part 1(낭독)에만
 * 의미가 있어 파트 2 이후 화면에서는 값이 있어도 표시하지 않는다 —
 * src/components/exam/exam-question-feedback-screen.tsx 참고.
 */
export interface ExamDetailedScores {
  accuracyScore: number | null;
  fluencyScore: number | null;
  completenessScore: number | null;
  prosodyScore: number | null;
}

export interface ExamQuestionFeedback {
  summary: string;
  level: string;
  strengths: string[];
  weaknesses: string[];
  pronunciation: string;
  fluency: string;
  content: string;
  detailedScores: ExamDetailedScores;
  pronunciationFluencyScore: number | null;
  contentRelevanceScore: number | null;
  grammarVocabulary: string;
  actionItems: string[];
  correctionItems: ExamCorrectionItem[];
  offTopicItems: string[];
  correctedAnswer: string | null;
  /** Part 1은 **강세**, ↑/↓ 억양, ✓/✓✓ 쉼 마크업을 포함할 수 있다. */
  recommendedAnswer: string | null;
  nextStrategy: string | null;
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

/** 문제별 피드백 화면에서 쓰는 문제 원문 — 라이브 응시 화면의 ExamQuestion과 구조는 비슷하지만
 * isFirstInPart/isLastInPart처럼 응시 흐름 전용인 필드는 없다. */
export interface ExamQuestionInfo {
  partNumber: number;
  questionNumber: number;
  text?: string;
  referenceText?: string;
  partIntroText?: string;
  audioUrl?: string;
  guideAudioUrl?: string;
  imageUrl?: string;
  tableContext?: ExamTableSlot;
  prepTimeSec: number;
  speakTimeSec: number;
}

/** 회차별 총점 한 점. retryCount 오름차순으로 정렬된 상태로 매퍼가 넘겨준다. */
export interface ExamRetryScore {
  retryCount: number;
  score: number;
}

/** 회차별 세부 지표. detailedScores는 매퍼에서 하나의 객체로 합쳐진 뒤 넘어온다. */
export interface ExamRetryFeedbackScore {
  retryCount: number;
  pronunciationFluencyScore: number | null;
  contentRelevanceScore: number | null;
  detailedScores: ExamDetailedScores;
}

export interface ExamQuestionDetail {
  examId: string;
  partNumber: number;
  questionNumber: number;
  retryCount: number;
  totalRetryCount: number;
  audioUrl: string;
  score: number;
  maxScore: number;
  transcript: string;
  feedback: ExamQuestionFeedback;
  /** 이 문제의 전체 회차 총점. 응답에 없으면 빈 배열. */
  retryScores: ExamRetryScore[];
  /** 이 문제의 전체 회차 세부 지표. 응답에 없으면 빈 배열. */
  retryFeedbackScores: ExamRetryFeedbackScore[];
  spokenWordSequence: SpokenWord[];
  questionInfo: ExamQuestionInfo;
}
