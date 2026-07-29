import {
  MOCK_COMMENTS,
  MOCK_NICKNAME_ADJECTIVES,
  MOCK_NICKNAME_NOUNS,
  MOCK_POSTS,
  mockPostSummaries,
  mockRelatedPosts,
} from "@/features/blog/mock/blog-mock-data";
import { ApiError } from "@/lib/api/client";
import type {
  RawAnonymousIdentity,
  RawBlogComment,
  RawBlogCommentPage,
  RawBlogPostDetail,
  RawBlogPostPage,
  RawBlogPostSummary,
  RawNewsletterSubscribeResult,
} from "@/types/blog";

/**
 * 백엔드 블로그 API가 준비되기 전까지 화면을 확인하기 위한 mock 구현.
 *
 * `NEXT_PUBLIC_BLOG_MOCK=1`일 때만 켜진다. 실제 응답 형태가 확정되면 이 디렉터리를
 * 통째로 지우고 각 api 모듈의 분기 한 줄씩만 걷어내면 된다.
 */
export function isBlogMockEnabled(): boolean {
  return process.env.NEXT_PUBLIC_BLOG_MOCK === "1";
}

/** 로딩 상태와 무한 스크롤이 눈에 보이도록 약간의 지연을 준다. */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function paginate(
  summaries: RawBlogPostSummary[],
  page: number,
  size: number,
): RawBlogPostPage {
  const start = (page - 1) * size;

  return {
    posts: summaries.slice(start, start + size),
    page,
    size,
    totalPages: Math.max(1, Math.ceil(summaries.length / size)),
    totalElements: summaries.length,
  };
}

export async function mockGetBlogPosts({
  page,
  size,
}: {
  page: number;
  size: number;
}): Promise<RawBlogPostPage> {
  await delay(400);
  return paginate(mockPostSummaries(), page, size);
}

export async function mockSearchBlogPosts({
  query,
  page,
  size,
}: {
  query: string;
  page: number;
  size: number;
}): Promise<RawBlogPostPage> {
  await delay(300);

  // 백엔드 MVP와 동일하게 제목만 부분 일치로 검색한다(docs/blog.md 7.1).
  const matched = mockPostSummaries().filter((post) =>
    post.title.toLowerCase().includes(query.toLowerCase()),
  );

  return paginate(matched, page, size);
}

export async function mockGetBlogPost(
  slug: string,
): Promise<RawBlogPostDetail> {
  await delay(200);

  const post = MOCK_POSTS.find((item) => item.slug === slug);
  // 실제 백엔드와 같은 형태로 404를 던져 호출부의 분기가 그대로 동작하게 한다.
  if (!post) throw new ApiError(404, "Not Found");

  return { ...post, relatedPosts: mockRelatedPosts(slug) };
}

// ---------------------------------------------------------------- 댓글

/** 새로고침 전까지 유지되는 임시 저장소. 브라우저 탭 단위로만 남는다. */
const submittedComments: RawBlogComment[] = [];
let nextCommentId = 1000;

export async function mockGetBlogComments(): Promise<RawBlogCommentPage> {
  await delay(350);
  return {
    comments: [...submittedComments, ...MOCK_COMMENTS],
    nextCursor: null,
    hasNext: false,
  };
}

export async function mockCreateBlogComment({
  content,
}: {
  content: string;
}): Promise<void> {
  await delay(400);
  nextCommentId += 1;
  submittedComments.unshift({
    id: nextCommentId,
    nickname: currentIdentity.nickname,
    avatarSeed: currentIdentity.avatarSeed,
    content,
    createdAt: new Date().toISOString(),
  });
}

// ---------------------------------------------------------------- 익명 아이덴티티

function randomOf<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function makeIdentity(): RawAnonymousIdentity {
  const adjective = randomOf(MOCK_NICKNAME_ADJECTIVES);
  const noun = randomOf(MOCK_NICKNAME_NOUNS);
  return {
    nickname: `${adjective} ${noun.ko}`,
    avatarSeed: `${noun.seed}-${Math.floor(Math.random() * 30) + 1}`,
  };
}

let currentIdentity: RawAnonymousIdentity = makeIdentity();

export async function mockGetAnonymousIdentity(): Promise<RawAnonymousIdentity> {
  await delay(150);
  return currentIdentity;
}

export async function mockRegenerateAnonymousIdentity(): Promise<RawAnonymousIdentity> {
  await delay(250);
  currentIdentity = makeIdentity();
  return currentIdentity;
}

// ---------------------------------------------------------------- 뉴스레터

export async function mockSubscribeNewsletter(): Promise<RawNewsletterSubscribeResult> {
  await delay(500);
  return {
    success: true,
    status: "ACTIVE",
    message: "뉴스레터 구독이 완료되었습니다.",
  };
}
