import { mapBlogCommentPage } from "@/features/blog/map-blog-comment";
import {
  isBlogMockEnabled,
  mockCreateBlogComment,
  mockGetAnonymousIdentity,
  mockGetBlogComments,
  mockRegenerateAnonymousIdentity,
} from "@/features/blog/mock/blog-mock-api";
import { apiFetch } from "@/lib/api/client";
import type { ApiEnvelope } from "@/types/api";
import type {
  AnonymousIdentity,
  BlogCommentPage,
  RawAnonymousIdentity,
  RawBlogCommentPage,
} from "@/types/blog";

/** 한 번에 불러오는 댓글 수(docs/blog.md 8.6). */
export const COMMENT_PAGE_SIZE = 20;

export const COMMENT_MIN_LENGTH = 2;
export const COMMENT_MAX_LENGTH = 500;

/**
 * 익명 방문자를 식별하는 anon_session 쿠키는 HttpOnly라 JS로 읽을 수 없고,
 * 백엔드가 프론트와 다른 오리진이므로 요청마다 명시적으로 쿠키를 실어 보내야 한다
 * (docs/blog.md 8.4). 백엔드 CORS도 credentials를 허용해야 동작한다.
 */
const withCredentials: RequestInit = { credentials: "include" };

/** 커서 기반으로 댓글을 최신순 조회한다. */
export async function getBlogComments({
  slug,
  cursor,
  size = COMMENT_PAGE_SIZE,
}: {
  slug: string;
  cursor?: string | null;
  size?: number;
}): Promise<BlogCommentPage> {
  if (isBlogMockEnabled()) {
    return mapBlogCommentPage(await mockGetBlogComments());
  }

  const params = new URLSearchParams({ size: String(size) });
  if (cursor) params.set("cursor", cursor);

  const { result } = await apiFetch<ApiEnvelope<RawBlogCommentPage>>(
    `/api/posts/${encodeURIComponent(slug)}/comments?${params}`,
    withCredentials,
  );
  return mapBlogCommentPage(result);
}

/**
 * 현재 브라우저에 배정된 닉네임과 아바타를 조회한다.
 *
 * 닉네임·아바타는 클라이언트가 정하지 않고 서버가 익명 쿠키를 기준으로 결정하므로
 * (docs/blog.md 8.5), 작성 폼이 내 표시 정보를 보여주려면 조회 수단이 필요하다.
 * docs/blog.md 15.2의 API 목록에는 재발급(POST)만 있고 조회(GET)가 빠져 있어,
 * 백엔드에 함께 요청해야 하는 엔드포인트다.
 */
export async function getAnonymousIdentity(): Promise<AnonymousIdentity> {
  if (isBlogMockEnabled()) return mockGetAnonymousIdentity();

  const { result } = await apiFetch<ApiEnvelope<RawAnonymousIdentity>>(
    "/api/comments/nickname",
    withCredentials,
  );
  return { nickname: result.nickname, avatarSeed: result.avatarSeed };
}

/** 닉네임과 아바타를 새로 뽑는다. 기존 댓글의 표시 정보는 바뀌지 않는다. */
export async function regenerateAnonymousIdentity(): Promise<AnonymousIdentity> {
  if (isBlogMockEnabled()) return mockRegenerateAnonymousIdentity();

  const { result } = await apiFetch<ApiEnvelope<RawAnonymousIdentity>>(
    "/api/comments/nickname/regenerate",
    { ...withCredentials, method: "POST" },
  );
  return { nickname: result.nickname, avatarSeed: result.avatarSeed };
}

/**
 * 댓글을 작성한다.
 *
 * 닉네임·아바타·익명 사용자 ID는 보내지 않는다. 서버가 쿠키로 결정한다.
 * `website`는 사용자에게 보이지 않는 허니팟 필드로, 값이 차 있으면 서버가
 * 자동화 요청으로 판단한다(docs/blog.md 8.8).
 */
export async function createBlogComment({
  slug,
  content,
  website,
}: {
  slug: string;
  content: string;
  website: string;
}): Promise<void> {
  if (isBlogMockEnabled()) return mockCreateBlogComment({ content });

  await apiFetch<ApiEnvelope<unknown>>(
    `/api/posts/${encodeURIComponent(slug)}/comments`,
    {
      ...withCredentials,
      method: "POST",
      body: JSON.stringify({ content, website }),
    },
  );
}
