import { mapExamQuestionDetail } from "@/features/exam/map-exam-question-feedback";
import type {
  ExamQuestionDetail,
  RawExamTableContext,
  RawExamQuestionDetailResult,
  RawExamRetryFeedbackScore,
  RawExamRetryScore,
} from "@/types/exam";

/**
 * `/app-question-feedback?mock=1` 전용 픽스처.
 *
 * 서버와 동일하게 어떤 회차를 조회해도 retryScores / retryFeedbackScores의
 * 전체 배열을 내려준다. mock 파라미터가 있을 때만 이 데이터를 쓴다.
 *
 * 배점은 공식 기준 — 파트 1~4는 문항당 0~3점, 파트 5는 0~5점.
 * 화면의 경계 상황을 전부 확인할 수 있게 네 문제를 서로 다르게 구성했다.
 *  - Q1  (Part 1): 1회차. 목 음성이 있어 단어 클릭 seek·재생과 단일 회차 링을 함께 확인한다.
 *  - Q11 (Part 5): 5회차. 점수가 오르다 한 번 떨어지고 다시 오른다. 내용 적합성은 계속 제자리.
 *  - Q2  (Part 1): 3회차. 낭독이라 내용 적합성이 null(미채점)이고, 2차에서 일부 지표가 하락한다.
 *  - Q6  (Part 3): 1회차. 아직 재도전이 없어 단일 회차 링이 나타난다.
 *  - Q8  (Part 4): 2회차. 표를 보고 답하는 문제라 문제 원문 카드에 표가 함께 나온다.
 */

function retryScores(list: number[]): RawExamRetryScore[] {
  return list.map((score, retryCount) => ({ retryCount, score }));
}

/**
 * detailedScores는 실제 응답처럼 "한 키짜리 객체들의 배열"로 만든다.
 *
 * 스케일이 지표마다 다르다는 점까지 실제 응답을 따른다 — pronunciationFluency와
 * 세부 지표는 0~100이지만 contentRelevance는 파트별 만점(Part 2~4는 2.5, Part 5는 4)이다.
 * 여기서 편하게 100점 스케일로 적으면 만점 대비 %로 환산하는 화면이 목에서만 멀쩡해 보인다.
 */
function feedbackScore(
  retryCount: number,
  pronunciationFluency: number,
  contentRelevance: number | null,
  accuracy: number,
  fluency: number,
  prosody: number,
  completeness: number,
): RawExamRetryFeedbackScore {
  return {
    retryCount,
    pronunciationFluencyScore: pronunciationFluency,
    contentRelevanceScore: contentRelevance,
    detailedScores: [
      { accuracy_score: accuracy },
      { fluency_score: fluency },
      { prosody_score: prosody },
      { completeness_score: completeness },
    ],
  };
}

// Part 5라 내용 적합성 만점은 4점. 계속 3점(75%)에 머물러 제자리 표시를 확인한다.
const Q11_SCORES = [3, 4, 4, 3, 5];
const Q11_FEEDBACK_SCORES = [
  feedbackScore(0, 71, 3, 78, 68, 73, 84),
  feedbackScore(1, 76, 3, 82, 74, 77, 86),
  feedbackScore(2, 79, 3, 85, 79, 78, 87),
  // 4차: 급하게 말하다 유창성과 억양이 무너진 회차 — 하락 표시를 볼 수 있다.
  feedbackScore(3, 72, 3, 84, 64, 69, 85),
  feedbackScore(4, 88, 3, 91, 87, 83, 90),
];

const Q2_SCORES = [1, 2, 3];
const Q2_FEEDBACK_SCORES = [
  feedbackScore(0, 62, null, 61, 70, 57, 79),
  // 2차: 총점은 올랐지만 발음 정확도와 억양은 오히려 조금 떨어진 회차.
  feedbackScore(1, 66, null, 59, 75, 55, 84),
  feedbackScore(2, 80, null, 82, 80, 77, 93),
];

// Part 3라 내용 적합성 만점은 2.5점 — 1.5점이면 60%다.
const Q6_SCORES = [1];
const Q6_FEEDBACK_SCORES = [feedbackScore(0, 58, 1.5, 60, 55, 57, 71)];

const Q8_SCORES = [1, 2];
const Q8_FEEDBACK_SCORES = [
  feedbackScore(0, 64, 1.5, 66, 61, 63, 74),
  feedbackScore(1, 74, 2, 77, 72, 71, 88),
];

const Q1_SCORES = [2];
const Q1_FEEDBACK_SCORES = [feedbackScore(0, 76, null, 72, 81, 75, 96)];

/** Azure Pronunciation Assessment의 시간 단위(100ns tick). */
const TICKS_PER_SECOND = 10_000_000;
const WORD_SECONDS = 0.42;

/**
 * Part 1의 단어별 발음 채점. [단어, 1차 정확도, 오류 유형] 순이고,
 * 회차가 올라갈수록 정확도가 오르도록 아래 buildSpokenWords에서 보정한다.
 */
type MockSpokenWord = [word: string, accuracy: number, errorType: string];

const Q1_WORDS: MockSpokenWord[] = [
  ["Thank", 96, "None"],
  ["you", 94, "None"],
  ["for", 91, "None"],
  ["calling", 82, "None"],
  ["Riverside", 70, "None"],
  ["Fitness", 86, "None"],
  ["Center.", 88, "None"],
  ["We", 95, "None"],
  ["are", 94, "None"],
  ["excited", 84, "None"],
  ["to", 96, "None"],
  ["announce", 61, "Mispronunciation"],
  ["our", 94, "None"],
  ["new", 93, "None"],
  ["membership", 76, "None"],
  ["plans", 82, "None"],
  ["starting", 88, "None"],
  ["this", 95, "None"],
  ["month.", 90, "None"],
  ["Members", 87, "None"],
  ["can", 96, "None"],
  ["now", 95, "None"],
  ["choose", 83, "None"],
  ["from", 94, "None"],
  ["monthly,", 69, "None"],
  ["quarterly,", 57, "Mispronunciation"],
  ["or", 96, "None"],
  ["annual", 78, "None"],
  ["packages,", 72, "None"],
  ["each", 91, "None"],
  ["including", 79, "None"],
  ["free", 94, "None"],
  ["access", 84, "None"],
  ["to", 96, "None"],
  ["group", 90, "None"],
  ["classes", 82, "None"],
  ["and", 94, "None"],
  ["the", 96, "None"],
  ["swimming", 81, "None"],
  ["pool.", 90, "None"],
  ["To", 96, "None"],
  ["sign", 76, "None"],
  ["up,", 95, "None"],
  ["please", 94, "None"],
  ["visit", 87, "None"],
  ["our", 95, "None"],
  ["front", 90, "None"],
  ["desk", 88, "None"],
  ["or", 96, "None"],
  ["complete", 85, "None"],
  ["the", 96, "None"],
  ["registration", 63, "Mispronunciation"],
  ["form", 91, "None"],
  ["on", 95, "None"],
  ["our", 94, "None"],
  ["website.", 85, "None"],
];

const Q2_WORDS: MockSpokenWord[] = [
  ["Welcome", 96, "None"],
  ["to", 94, "None"],
  ["the", 91, "None"],
  ["Riverside", 68, "None"],
  ["Community", 47, "Mispronunciation"],
  ["Center.", 88, "None"],
  ["Our", 95, "None"],
  ["fall", 93, "None"],
  ["program", 86, "None"],
  ["includes", 83, "None"],
  ["yoga,", 72, "None"],
  ["painting,", 90, "None"],
  ["and", 0, "Omission"],
  ["cooking", 89, "None"],
  ["classes", 84, "None"],
  ["for", 96, "None"],
  ["all", 95, "None"],
  ["ages.", 92, "None"],
  ["Registration", 54, "Mispronunciation"],
  ["begins", 87, "None"],
  ["on", 97, "None"],
  ["Monday,", 93, "None"],
  ["and", 94, "None"],
  ["members", 85, "None"],
  ["receive", 79, "None"],
  ["a", 96, "None"],
  ["ten", 92, "None"],
  ["percent", 88, "None"],
  ["discount.", 91, "None"],
];

function buildSpokenWords(
  words: MockSpokenWord[],
  attempt: number,
  wordSeconds = WORD_SECONDS,
) {
  return words.map(([word, baseAccuracy, errorType], index) => {
    // 누락(Omission)은 회차가 지나면 사라진 것으로 본다.
    const recovered = errorType === "Omission" && attempt > 0;
    const accuracy = recovered
      ? 88
      : Math.min(100, baseAccuracy + (baseAccuracy > 0 ? attempt * 9 : 0));
    return {
      index,
      segmentIndex: 0,
      wordIndex: index,
      word,
      offset: Math.round(index * wordSeconds * TICKS_PER_SECOND),
      duration: Math.round(wordSeconds * TICKS_PER_SECOND),
      accuracyScore: accuracy,
      pronunciationScore: accuracy,
      errorType: recovered ? "None" : errorType,
    };
  });
}

/**
 * Part 4 표 픽스처. 서버가 주는 wire 형태(snake_case) 그대로 두고 매퍼를 태운다.
 *
 * 표 종류마다 열 구성이 달라지는 계약을 확인하려는 픽스처라, 화면이 아는 열 이름 없이
 * columns/cells 쌍만으로 그려지는지(취소된 세션의 취소선·상태 메모 포함) 함께 본다.
 */
const Q8_TABLE_CONTEXT: RawExamTableContext = {
  table_type: "conference_schedule",
  title: "Wilson Marketing Conference",
  subtitles: ["Saturday, October 18", "Bayside Convention Center, Hall B"],
  metadata: [
    { key: "organizer", label: "Organizer", value: "Wilson Business Group" },
    { key: "fee", label: "Registration Fee", value: "$45" },
    { key: "lunch_included", label: "Lunch Included", value: true },
  ],
  columns: [
    { key: "time", label: "Time", value_type: "time_range" },
    { key: "session", label: "Session", value_type: "text" },
    { key: "speaker", label: "Speaker", value_type: "text" },
    { key: "room", label: "Room", value_type: "text" },
  ],
  items: [
    {
      cells: {
        time: "9:00 A.M. - 9:30 A.M.",
        session: "Registration and Coffee",
        speaker: null,
        room: "Lobby",
      },
      status: "scheduled",
      status_note: null,
      strike_through: false,
    },
    {
      cells: {
        time: "9:30 A.M. - 10:45 A.M.",
        session: "Understanding Online Customers",
        speaker: "Dr. Amelia Sato",
        room: "Hall B",
      },
      status: "scheduled",
      status_note: null,
      strike_through: false,
    },
    {
      cells: {
        time: "11:00 A.M. - 12:00 P.M.",
        session: "Social Media Budgeting",
        speaker: "Marcus Reed",
        room: "Room 204",
      },
      status: "cancelled",
      status_note: "Replaced by an open Q&A session",
      strike_through: true,
    },
    {
      cells: {
        time: "1:30 P.M. - 3:00 P.M.",
        session: "Workshop: Writing Better Ads",
        speaker: "Grace Lim",
        room: "Room 204",
      },
      status: "scheduled",
      status_note: null,
      strike_through: false,
    },
  ],
  notes: [
    { scope: "table", text: "Workshop seats are limited to 30 participants." },
    { scope: "table", text: "Parking is free for registered attendees." },
  ],
};

const MOCK_QUESTIONS: Record<
  number,
  {
    partNumber: number;
    maxScore: number;
    scores: number[];
    feedbackScores: RawExamRetryFeedbackScore[];
    transcripts: string[];
    questionText: string;
    referenceText?: string;
    spokenWords?: MockSpokenWord[];
    /** mock에서도 단어 클릭 seek·재생을 확인해야 하는 문제에만 둔다. */
    audioUrl?: string;
    wordSeconds?: number;
    summaries?: string[];
    recommendedAnswer?: string;
    /** 표를 보고 답하는 문제(Part 4)에만 둔다. */
    tableContext?: RawExamTableContext;
  }
> = {
  1: {
    partNumber: 1,
    maxScore: 3,
    scores: Q1_SCORES,
    feedbackScores: Q1_FEEDBACK_SCORES,
    questionText: "",
    referenceText:
      "Thank you for calling Riverside Fitness Center. We are excited to announce our new membership plans starting this month. Members can now choose from monthly, quarterly, or annual packages, each including free access to group classes and the swimming pool. To sign up, please visit our front desk or complete the registration form on our website.",
    transcripts: [
      "Thank you for calling Riverside Fitness Center. We are excited to announce our new membership plans starting this month. Members can now choose from monthly, quarterly, or annual packages, each including free access to group classes and the swimming pool. To sign up, please visit our front desk or complete the registration form on our website.",
    ],
    spokenWords: Q1_WORDS,
    audioUrl: "/assets/audio/mock-question-1.m4a",
    // 21.38초 목 음성 안에 마지막 단어 시작점까지 들어오게 맞춘 평균 간격이다.
    wordSeconds: 0.38,
    summaries: [
      "첫 낭독이에요. 전체 문장은 빠짐없이 읽었고, 표시된 단어의 끝소리를 조금 더 또렷하게 내면 좋아요.",
    ],
    recommendedAnswer:
      "**Thank** you ↑ ✓ for calling Riverside Fitness **Center**. ↓ ✓✓ We are excited to **announce** ↑ ✓ our new membership **plans** ↑ ✓ starting this **month**. ↓ ✓✓ Members can now choose from **monthly**, ↑ ✓ **quarterly**, ↑ ✓ or annual **packages**, ↑ ✓ each including free **access** to ↑ ✓ group classes and the swimming **pool**. ↓ ✓✓ To **sign** up, ↑ ✓ please visit our front **desk** ↑ ✓ or complete the registration **form** ↑ ✓ on our **website**. ↓ ✓✓",
  },
  11: {
    partNumber: 5,
    maxScore: 5,
    scores: Q11_SCORES,
    feedbackScores: Q11_FEEDBACK_SCORES,
    questionText:
      "Do you agree or disagree with the following statement? It is better for companies to allow employees to work from home. Give reasons or examples to support your opinion.",
    transcripts: [
      "I agree with this statement. Because working from home is more comfortable and, uh, employees can save many time for commuting. Also company can reduce office cost. So I think work from home is good for both.",
      "I agree with this statement for two reasons. First, working from home saves a lot of time for commuting. Second, company can reduce office cost. So I think it is good for both.",
      "I agree with this statement for two reasons. First, working from home saves a lot of time that would be spent commuting. Second, companies can reduce office costs. For these reasons, I think it benefits both sides.",
      "I agree. Working from home saves time and companies save cost, uh, and also people can, um, focus better I think. So it is good for both sides.",
      "I strongly agree with this statement for two reasons. First, working from home removes the daily commute, so employees start the day with more energy. Second, companies can reduce office costs and hire people from other cities. For these reasons, I believe remote work benefits both sides.",
    ],
  },
  2: {
    partNumber: 1,
    maxScore: 3,
    scores: Q2_SCORES,
    feedbackScores: Q2_FEEDBACK_SCORES,
    questionText: "",
    referenceText:
      "Welcome to the Riverside Community Center. Our fall program includes yoga, painting, and cooking classes for all ages. Registration begins on Monday, and members receive a ten percent discount.",
    transcripts: [
      "Welcome to the Riverside Community Center. Our fall program includes yoga, painting, cooking classes for all ages. Registration begins on Monday, members receive a ten percent discount.",
      "Welcome to the Riverside Community Center. Our fall program includes yoga, painting, and cooking classes for all ages. Registration begins on Monday, and members receive a ten percent discount.",
      "Welcome to the Riverside Community Center. Our fall program includes yoga, painting, and cooking classes for all ages. Registration begins on Monday, and members receive a ten percent discount.",
    ],
    spokenWords: Q2_WORDS,
    recommendedAnswer:
      "**Welcome** ↑ ✓ to the Riverside Community **Center**. ↓ ✓✓ Our **fall** program includes ↑ ✓ yoga, ↑ ✓ painting, ↑ ✓ and cooking **classes** for all **ages**. ↓ ✓✓ Registration begins on **Monday**, ↑ ✓ and members receive a ten percent **discount**. ↓ ✓✓",
  },
  8: {
    partNumber: 4,
    maxScore: 3,
    scores: Q8_SCORES,
    feedbackScores: Q8_FEEDBACK_SCORES,
    questionText:
      "I heard there is a session about social media budgeting in the morning. Could you tell me who is leading it?",
    tableContext: Q8_TABLE_CONTEXT,
    transcripts: [
      "Uh, the social media budgeting session is at eleven o'clock and, um, Marcus Reed is the speaker I think.",
      "I'm sorry, but that session has been cancelled. It was scheduled for eleven A.M. with Marcus Reed, but it will be replaced by an open Q and A session instead.",
    ],
  },
  6: {
    partNumber: 3,
    maxScore: 3,
    scores: Q6_SCORES,
    feedbackScores: Q6_FEEDBACK_SCORES,
    questionText: "How often do you go to the library, and who do you go with?",
    transcripts: [
      "Uh, I go to library maybe two times in a month. Usually I go alone because I can concentrate more.",
    ],
  },
};

const SUMMARIES = [
  "첫 답변이에요. 하고 싶은 말은 분명했지만 근거를 받쳐 주는 문장이 짧았어요.",
  "지난번보다 문장이 정돈됐어요. 연결어를 조금 더 다양하게 써 보면 좋겠어요.",
  "구성이 안정적으로 자리 잡았어요. 이제 구체적인 예시 하나만 더 붙이면 충분해요.",
  "이번엔 조금 서둘러 말하면서 흐름이 끊겼어요. 속도를 한 단계만 늦춰 볼까요?",
  "가장 좋은 답변이에요. 근거와 예시가 모두 들어갔고 마무리도 깔끔했어요.",
];

/**
 * 회차가 올라갈수록 첨삭 항목이 줄어드는 게 자연스러워 앞 회차에서만 붙이고,
 * 그 회차 스크립트에 실제로 등장하는 문구만 남긴다 — 스크립트에 없는 항목이 남으면
 * 마킹은 안 되는데 우선순위 패널의 심각도 개수에만 잡혀서 어긋나 보인다.
 */
function correctionItems(retryCount: number, transcript: string) {
  if (retryCount >= 2) return [];
  return ALL_CORRECTION_ITEMS.filter((item) =>
    transcript.includes(item.original),
  );
}

const ALL_CORRECTION_ITEMS = [
  {
    type: "grammar",
    original: "save many time",
    issue: "수량 표현이 맞지 않아요",
    explanation: "time은 셀 수 없는 명사라 many를 쓸 수 없어요.",
    suggested: "save a lot of time",
    severity: "high",
  },
  {
    type: "content",
    original: "Also company can reduce office cost.",
    issue: "근거를 뒷받침할 예시가 없어요",
    explanation: "구체적인 수치나 경험을 한 가지 붙이면 좋아요.",
    suggested:
      "Also, companies can reduce office costs — my previous company closed one floor after going remote.",
    severity: "medium",
  },
];

function buildRaw(
  examId: string,
  questionNumber: number,
  retryCount: number,
): RawExamQuestionDetailResult {
  const question = MOCK_QUESTIONS[questionNumber];
  const attempt = Math.min(retryCount, question.scores.length - 1);
  const isReadAloud = question.partNumber === 1;
  const scores = question.feedbackScores[attempt];

  return {
    examId,
    question: {
      partNumber: question.partNumber,
      questionNumber,
      retryCount: attempt,
      totalRetryCount: question.scores.length,
      audioUrl: question.audioUrl ?? "",
      score: question.scores[attempt],
      maxScore: question.maxScore,
      transcript: question.transcripts[attempt],
      // 실제 API처럼 조회 회차와 무관하게 전체 회차를 내려준다.
      retryScores: retryScores(question.scores),
      retryFeedbackScores: question.feedbackScores,
      // 단어별 발음 채점은 낭독(Part 1)에서만 내려온다.
      spokenWordSequence: isReadAloud
        ? buildSpokenWords(
            question.spokenWords ?? [],
            attempt,
            question.wordSeconds,
          )
        : undefined,
      feedback: {
        summary:
          question.summaries?.[attempt] ??
          SUMMARIES[attempt] ??
          SUMMARIES[SUMMARIES.length - 1],
        level: "양호",
        strengths: [
          "하고 싶은 말의 요지가 첫 문장에 분명히 드러났어요.",
          "속도가 일정해서 듣기 편했어요.",
        ],
        weaknesses: [
          "주저어(uh, um)가 흐름을 끊었어요.",
          "마무리 문장이 앞 내용을 그대로 반복했어요.",
        ],
        pronunciation:
          "어말 자음이 자주 탈락합니다. cost의 -st를 끝까지 발음해 보세요.",
        fluency:
          "분당 112단어로 다소 느립니다. 문장 사이 공백을 조금 줄여 보세요.",
        content: isReadAloud
          ? "지문을 빠짐없이 읽었어요."
          : "근거는 있으나 구체적 예시가 없습니다. 경험 한 가지를 덧붙이면 점수가 오릅니다.",
        detailedScores: scores.detailedScores,
        // 실제 응답처럼 조회 중인 회차의 값이 retryFeedbackScores와 feedback 양쪽에 담긴다.
        pronunciationFluencyScore: scores.pronunciationFluencyScore,
        contentRelevanceScore: scores.contentRelevanceScore,
        grammarVocabulary: isReadAloud
          ? "지문을 그대로 읽는 문제라 문법적으로는 문제가 없었어요."
          : "가산명사 앞 관사 누락이 반복됩니다 (company → a company).",
        actionItems: [
          "“a lot of / plenty of” 수량 표현으로 5문장 만들어 소리 내 읽기",
          "모범답안을 가린 뒤 30초 안에 재구성해 말하기",
          "First–Second–For these reasons 패턴으로 다른 주제 1개 답변하기",
        ],
        correctionItems: isReadAloud
          ? []
          : correctionItems(attempt, question.transcripts[attempt]),
        offTopicItems: [],
        correctedAnswer: isReadAloud
          ? null
          : "I strongly agree that companies should allow employees to work from home. First, remote work removes the daily commute, so people start the day with more energy. Second, it widens the hiring pool — a company is no longer limited to candidates who live near the office.",
        recommendedAnswer:
          question.recommendedAnswer ??
          question.transcripts[question.transcripts.length - 1],
        nextStrategy: isReadAloud
          ? "쉼표마다 0.4초씩 쉬며 지문 전체를 다시 낭독해 보세요."
          : '근거 하나당 경험을 한 문장씩 붙여 보세요. "For example, my previous company…" 패턴이면 충분해요.',
      },
      questionInfo: {
        part: question.partNumber,
        questionNumber,
        text: question.questionText || undefined,
        referenceText: question.referenceText,
        tableContext: question.tableContext,
        prepTimeSec: isReadAloud ? 45 : 45,
        speakTimeSec: isReadAloud ? 45 : 60,
      },
    },
  };
}

/** mock 모드에서 지원하는 문제 번호. 화면 안내에 쓴다. */
export const MOCK_QUESTION_NUMBERS = Object.keys(MOCK_QUESTIONS).map(Number);

export function hasMockQuestion(questionNumber: number): boolean {
  return questionNumber in MOCK_QUESTIONS;
}

/** 실제 조회와 같은 매퍼를 태워, 매핑 단계까지 함께 확인되도록 한다. */
export function getMockQuestionFeedback(
  examId: string,
  questionNumber: number,
  retryCount: number,
): ExamQuestionDetail {
  if (!hasMockQuestion(questionNumber)) {
    throw new Error(
      `mock 데이터가 없는 문제예요. 사용 가능한 번호: ${MOCK_QUESTION_NUMBERS.join(", ")}`,
    );
  }
  return mapExamQuestionDetail(buildRaw(examId, questionNumber, retryCount));
}
