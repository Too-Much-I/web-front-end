import type {
  RawBlogComment,
  RawBlogPostDetail,
  RawBlogPostSummary,
} from "@/types/blog";

/**
 * 백엔드 블로그 API가 없는 동안 화면을 확인하기 위한 mock 데이터.
 *
 * 도메인 타입이 아니라 와이어 타입(Raw*)으로 둔다. mock을 쓸 때도 실제와 같은
 * 매퍼를 통과시켜야 매핑 로직까지 함께 검증되기 때문이다.
 */

function summaryOf(post: RawBlogPostDetail): RawBlogPostSummary {
  return {
    slug: post.slug,
    title: post.title,
    summary: post.summary,
    thumbnailUrl: post.thumbnailUrl,
    authorName: post.authorName,
    publishedAt: post.publishedAt,
  };
}

const IH_BODY = `
**IH에서 멈추는 답변은 대부분 문법이 아니라 구조 때문입니다.** 토선생에 쌓인 모의고사 응답을 보면, IM3와 IH를 가르는 지점은 어휘 난이도가 아니라 "60초를 어떻게 나눠 쓰느냐"에 훨씬 가깝습니다.

실제로 IM3 구간 답변의 평균 문장 수는 4.1개, IH 구간은 5.8개입니다. 문장 하나하나는 오히려 IH 쪽이 더 짧습니다. 길게 말하려다 중간에 끊기는 것보다, 짧은 문장을 끊김 없이 이어 붙이는 쪽이 유창성 점수를 더 가져간다는 뜻이에요.

## 1. 감점은 '멈춘 자리'에 몰려 있다

채점 기준에서 유창성은 말이 빠른지를 보지 않습니다. 문장과 문장 사이가 아니라 *문장 한가운데에서* 멈추는 횟수를 봅니다. 단어가 안 떠올라 멈추는 0.8초가 반복되면, 발음이 아무리 좋아도 IH 위로 올라가기 어렵습니다.

> 실전 팁 — 단어가 막히면 멈추지 말고 이미 말한 문장을 다른 말로 한 번 더 풀어 주세요. 내용 중복은 거의 감점되지 않지만, 침묵은 확실히 감점됩니다.

## 2. IH 답변이 공통으로 갖고 있는 3단 구조

- **입장** — 첫 문장에서 결론부터. "I think A is better."
- **이유 2개** — 각각 한 문장 + 근거 한 문장씩.
- **마무리** — 첫 문장을 다른 표현으로 되짚기.

이 구조를 몸에 익히면 준비 시간 15초 안에 뼈대를 세울 수 있고, 답변 도중 다음에 무슨 말을 할지 고민하느라 생기는 침묵이 사라집니다.

| 구간 | 평균 문장 수 | 문장 중간 침묵 |
| --- | --- | --- |
| IM2 | 3.4개 | 5.1회 |
| IM3 | 4.1개 | 3.7회 |
| IH | 5.8개 | 1.2회 |

## 3. 내 답변이 지금 어디쯤인지부터 확인하기

감점 포인트는 사람마다 다릅니다. 발음이 문제인 사람에게 구조 연습을 시키면 시간만 버립니다. 실제 시험과 같은 유형으로 한 세트를 풀고, 항목별 점수가 어디서 깎였는지 먼저 확인하는 편이 훨씬 빠릅니다.
`.trim();

const PART2_BODY = `
Part 2는 사진 한 장을 보고 45초 동안 묘사하는 문제입니다. 할 말이 떨어져서 20초쯤에 멈추는 경우가 가장 흔한데, 순서를 정해두면 이 문제가 대부분 사라집니다.

## 전체 → 인물 → 배경

1. **전체** — 장소와 상황을 한 문장으로. \`This picture was taken at a ...\`
2. **인물** — 가장 눈에 띄는 사람부터. 무엇을 입고, 무엇을 하고 있는지.
3. **배경** — 뒤쪽 사물, 날씨, 분위기.

각 단계에서 두 문장씩만 말해도 여섯 문장이 나옵니다. 45초를 채우기에 충분합니다.

## 자주 쓰는 표현

- \`In the middle of the picture, I can see ...\`
- \`On the left side, there is ...\`
- \`It seems like they are ...\`

마지막 5초가 남았다면 \`Overall, it looks like a busy afternoon.\`처럼 인상을 한 문장으로 마무리하세요. 어색하게 끊기는 것보다 훨씬 낫습니다.
`.trim();

function shortBody(intro: string): string {
  return `
${intro}

## 왜 중요한가

토익 스피킹은 유형이 정해져 있는 시험입니다. 유형을 알고 들어가면 준비 시간에 무엇을 메모할지가 명확해지고, 답변 도중 헤매는 시간이 줄어듭니다.

- 준비 시간에 할 일을 미리 정해둔다
- 답변 구조를 문장 단위로 외워둔다
- 시간이 남으면 마무리 문장으로 정리한다

## 다음 단계

지금 실력이 어디쯤인지 모른 채 연습하면 방향을 잘못 잡기 쉽습니다. 실제 시험과 같은 유형으로 한 세트를 풀어보고, 항목별로 어디서 깎이는지부터 확인해 보세요.
`.trim();
}

export const MOCK_POSTS: RawBlogPostDetail[] = [
  {
    slug: "toeic-speaking-ih-vs-im3",
    title: "토익 스피킹 IH, 실제로 뭘 못해서 못 넘을까",
    summary:
      "IM3와 IH를 가르는 건 어휘가 아니라 60초를 나눠 쓰는 방식입니다. 실제 응답 데이터로 확인해 봤어요.",
    thumbnailUrl: null,
    authorName: "토선생",
    publishedAt: "2026-07-21T09:00:00+09:00",
    updatedAt: "2026-07-24T11:20:00+09:00",
    seoTitle: "토익 스피킹 IH 등급, 감점 원인과 넘는 법",
    seoDescription:
      "IM3에서 IH로 올라가지 못하는 진짜 이유를 실제 모의고사 응답 데이터로 분석했습니다.",
    contentMarkdown: IH_BODY,
    relatedPosts: [],
  },
  {
    slug: "part-2-picture-description",
    title: "Part 2 사진 묘사, 45초를 채우는 3단 템플릿",
    summary:
      "전체 → 인물 → 배경 순서만 지켜도 할 말이 떨어지지 않습니다. 문장별 예시 표현까지 정리했습니다.",
    thumbnailUrl: null,
    authorName: "토선생",
    publishedAt: "2026-07-18T09:00:00+09:00",
    updatedAt: null,
    seoTitle: "",
    seoDescription: "",
    contentMarkdown: PART2_BODY,
    relatedPosts: [],
  },
  {
    slug: "fluency-over-pronunciation",
    title: "발음보다 유창성 — AI 채점기가 진짜 보는 것",
    summary:
      "원어민 발음이 아니어도 AL은 나옵니다. 대신 문장 중간의 침묵은 생각보다 크게 깎입니다.",
    thumbnailUrl: null,
    authorName: "토선생",
    publishedAt: "2026-07-15T09:00:00+09:00",
    updatedAt: null,
    seoTitle: "",
    seoDescription: "",
    contentMarkdown: shortBody(
      "발음이 좋아야 점수가 잘 나온다는 오해가 널리 퍼져 있습니다. 하지만 공식 채점 기준에서 발음은 여러 항목 중 하나일 뿐이고, 실제로 등급을 가르는 건 유창성인 경우가 훨씬 많습니다.",
    ),
    relatedPosts: [],
  },
  {
    slug: "toeic-speaking-score-levels",
    title: "토익 스피킹 등급표 완전 정리 (NH·IM1~3·IH·AL)",
    summary:
      "등급별 점수 구간과 기업에서 실제로 요구하는 등급을 한 표로 묶었습니다.",
    thumbnailUrl: null,
    authorName: "토선생",
    publishedAt: "2026-07-11T09:00:00+09:00",
    updatedAt: null,
    seoTitle: "",
    seoDescription: "",
    contentMarkdown: shortBody(
      "토익 스피킹은 점수가 아니라 등급으로 소통되는 시험입니다. 채용 공고에 IH라고만 적혀 있으면 몇 점을 받아야 하는지 헷갈리기 쉬워서, 등급과 점수 구간을 한 번에 정리했습니다.",
    ),
    relatedPosts: [],
  },
  {
    slug: "part-5-opinion-structure",
    title: "Part 5 의견 제시, 60초 안에 논리를 만드는 법",
    summary:
      "준비 시간 15초에 뼈대를 세우는 메모법. 이유 2개를 고르는 기준부터 잡아 드립니다.",
    thumbnailUrl: null,
    authorName: "토선생",
    publishedAt: "2026-07-08T09:00:00+09:00",
    updatedAt: null,
    seoTitle: "",
    seoDescription: "",
    contentMarkdown: shortBody(
      "Part 5는 준비 시간이 15초뿐입니다. 이 15초에 무엇을 적느냐가 60초 전체를 좌우합니다.",
    ),
    relatedPosts: [],
  },
  {
    slug: "two-week-study-plan",
    title: "시험 2주 전, 하루 30분 학습 플랜",
    summary:
      "1주차는 유형 익히기, 2주차는 실전 타이밍. 요일별로 무엇을 할지 그대로 따라 하면 됩니다.",
    thumbnailUrl: null,
    authorName: "토선생",
    publishedAt: "2026-07-04T09:00:00+09:00",
    updatedAt: null,
    seoTitle: "",
    seoDescription: "",
    contentMarkdown: shortBody(
      "시험이 2주 남았다면 새로운 공부법을 찾을 시간이 없습니다. 지금 할 수 있는 것만 정확히 반복하는 편이 낫습니다.",
    ),
    relatedPosts: [],
  },
  {
    slug: "before-you-register",
    title: "응시료 84,000원 아끼는 사전 점검 리스트",
    summary:
      "접수 전에 확인하면 좋은 것들. 컴퓨터·마이크 환경부터 시험장 선택 기준까지.",
    thumbnailUrl: null,
    authorName: "토선생",
    publishedAt: "2026-07-01T09:00:00+09:00",
    updatedAt: null,
    seoTitle: "",
    seoDescription: "",
    contentMarkdown: shortBody(
      "토익 스피킹 응시료는 84,000원입니다. 한 번 더 보는 것과 한 번에 끝내는 것의 차이가 작지 않으니, 접수 전에 몇 가지만 확인해 보세요.",
    ),
    relatedPosts: [],
  },
  {
    slug: "part-3-third-question",
    title: "Part 3 세 번째 문제, 왜 다들 여기서 무너질까",
    summary:
      "질문이 길어지는 마지막 문항. 다 못 들었을 때 쓸 수 있는 복구 전략을 정리했습니다.",
    thumbnailUrl: null,
    authorName: "토선생",
    publishedAt: "2026-06-27T09:00:00+09:00",
    updatedAt: null,
    seoTitle: "",
    seoDescription: "",
    contentMarkdown: shortBody(
      "Part 3의 마지막 문제는 앞의 두 문제보다 질문이 길고 답변 시간도 깁니다. 질문을 놓치면 30초가 통째로 날아갑니다.",
    ),
    relatedPosts: [],
  },
  {
    slug: "record-yourself",
    title: "혼자 연습할 때 내 답변을 녹음해서 들어야 하는 이유",
    summary:
      "머릿속 발음과 실제 발음의 간격. 녹음 후 체크할 5가지 항목을 만들었습니다.",
    thumbnailUrl: null,
    authorName: "토선생",
    publishedAt: "2026-06-23T09:00:00+09:00",
    updatedAt: null,
    seoTitle: "",
    seoDescription: "",
    contentMarkdown: shortBody(
      "말할 때 스스로 듣는 소리와 녹음된 소리는 다릅니다. 이 간격이 연습의 방향을 잘못 잡게 만드는 가장 큰 원인입니다.",
    ),
    relatedPosts: [],
  },
  {
    slug: "grammar-mistakes-allowed",
    title: "문법 실수, 몇 개까지 괜찮을까",
    summary:
      "감점되는 실수와 그냥 넘어가는 실수는 다릅니다. 의미 전달을 막는 실수만 잡으세요.",
    thumbnailUrl: null,
    authorName: "토선생",
    publishedAt: "2026-06-19T09:00:00+09:00",
    updatedAt: null,
    seoTitle: "",
    seoDescription: "",
    contentMarkdown: shortBody(
      "문법을 완벽하게 말하려다 오히려 말이 끊기는 경우가 많습니다. 어떤 실수가 실제로 깎이는지 알면 훨씬 편하게 말할 수 있습니다.",
    ),
    relatedPosts: [],
  },
  {
    slug: "start-here-first-time",
    title: "토익 스피킹 처음이라면 이 순서대로 준비하세요",
    summary:
      "유형 파악 → 모의고사 1회 → 약점 파악 → 반복. 첫 2주를 헤매지 않는 방법.",
    thumbnailUrl: null,
    authorName: "토선생",
    publishedAt: "2026-06-14T09:00:00+09:00",
    updatedAt: null,
    seoTitle: "",
    seoDescription: "",
    contentMarkdown: shortBody(
      "처음 준비하는 사람이 가장 많이 하는 실수는 교재부터 사는 것입니다. 유형을 먼저 보고, 한 세트를 풀어 내 위치를 확인하는 게 순서입니다.",
    ),
    relatedPosts: [],
  },
  {
    slug: "part-1-chunking",
    title: "Part 1 지문 읽기, 끊어 읽기 표시부터 하세요",
    summary:
      "쉼표가 없어도 끊어야 할 자리가 있습니다. 의미 단위로 나누는 연습법.",
    thumbnailUrl: null,
    authorName: "토선생",
    publishedAt: "2026-06-10T09:00:00+09:00",
    updatedAt: null,
    seoTitle: "",
    seoDescription: "",
    contentMarkdown: shortBody(
      "Part 1은 준비 시간 45초 동안 지문을 눈으로 읽는 게 전부가 아닙니다. 어디서 끊어 읽을지 미리 정해두는 것이 핵심입니다.",
    ),
    relatedPosts: [],
  },
];

/** 상세 응답의 관련 글은 자기 자신을 제외한 최신 글 3개로 채운다. */
export function mockRelatedPosts(slug: string): RawBlogPostSummary[] {
  return MOCK_POSTS.filter((post) => post.slug !== slug)
    .slice(0, 3)
    .map(summaryOf);
}

export function mockPostSummaries(): RawBlogPostSummary[] {
  return MOCK_POSTS.map(summaryOf);
}

export const MOCK_COMMENTS: RawBlogComment[] = [
  {
    id: 104,
    nickname: "당당한 펭귄",
    avatarSeed: "penguin-3",
    content:
      "모의고사 한 번 보고 왔는데 진짜 유창성만 유독 낮게 나왔어요. 글이랑 정확히 같은 진단이라 신기합니다.",
    createdAt: "2026-07-27T21:12:00+09:00",
  },
  {
    id: 103,
    nickname: "차분한 너구리",
    avatarSeed: "raccoon-9",
    content:
      "IM3에서 세 번 미끄러졌는데 어휘만 파고 있었어요. 방향을 잘못 잡았던 거네요…",
    createdAt: "2026-07-16T10:40:00+09:00",
  },
  {
    id: 102,
    nickname: "졸린 수달",
    avatarSeed: "otter-14",
    content:
      "이유 2개 + 근거 1문장씩 구조 그대로 연습했더니 확실히 60초가 안 남아요. 감사합니다!",
    createdAt: "2026-07-09T18:05:00+09:00",
  },
  {
    id: 101,
    nickname: "야무진 부엉이",
    avatarSeed: "owl-7",
    content:
      "문장 중간에 멈추는 게 감점이라는 걸 이제 알았네요. 저는 계속 완벽한 문장 만들려다 침묵만 늘었던 것 같아요.",
    createdAt: "2026-07-05T14:30:00+09:00",
  },
];

export const MOCK_NICKNAME_ADJECTIVES = [
  "성실한",
  "졸린",
  "긴장한",
  "차분한",
  "말많은",
  "야무진",
  "느긋한",
  "당당한",
  "부지런한",
  "수줍은",
];

export const MOCK_NICKNAME_NOUNS = [
  { ko: "당근", seed: "carrot" },
  { ko: "토끼", seed: "rabbit" },
  { ko: "부엉이", seed: "owl" },
  { ko: "고양이", seed: "cat" },
  { ko: "너구리", seed: "raccoon" },
  { ko: "다람쥐", seed: "squirrel" },
  { ko: "수달", seed: "otter" },
  { ko: "펭귄", seed: "penguin" },
  { ko: "고슴도치", seed: "hedgehog" },
  { ko: "판다", seed: "panda" },
];
