import { toApiPage } from "@/features/blog/blog-page-index";
import {
  mapAnonymousIdentity,
  mapBlogComment,
  mapBlogCommentPage,
} from "@/features/blog/map-blog-comment";
import { apiFetch } from "@/lib/api/client";
import type { ApiEnvelope } from "@/types/api";
import type {
  AnonymousIdentity,
  BlogComment,
  BlogCommentPage,
  RawAnonymousProfile,
  RawBlogComment,
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

/**
 * 게시글 댓글을 최신순으로 조회한다(GET /api/posts/{slug}/comments).
 *
 * 백엔드가 커서가 아니라 page/size 페이지네이션을 쓰므로, `page`는 앱 기준
 * 1-base로 받고 요청할 때만 0-base로 바꾼다.
 */
export async function getBlogComments({
  slug,
  page = 1,
  size = COMMENT_PAGE_SIZE,
}: {
  slug: string;
  page?: number;
  size?: number;
}): Promise<BlogCommentPage> {
  const apiPage = toApiPage(page);

  const params = new URLSearchParams({
    page: String(apiPage),
    size: String(size),
  });

  const { result } = await apiFetch<ApiEnvelope<RawBlogCommentPage>>(
    `/api/posts/${encodeURIComponent(slug)}/comments?${params}`,
    withCredentials,
  );
  return mapBlogCommentPage(result);
}

/**
 * 닉네임과 아바타를 새로 뽑는다(POST /api/comments/nickname/regenerate).
 * 이미 등록된 댓글의 표시 정보는 바뀌지 않는다.
 *
 * 백엔드에 "현재 아이덴티티 조회(GET)"는 없고 재발급만 있다. 그래서 작성 폼이
 * 처음 자기 표시 정보를 얻을 때도 이 엔드포인트를 쓴다. 응답과 함께 서버가
 * anon_session 쿠키를 내려주므로, 첫 호출이 곧 발급이기도 하다.
 */
export async function regenerateAnonymousIdentity(): Promise<AnonymousIdentity> {
  const { result } = await apiFetch<ApiEnvelope<RawAnonymousProfile>>(
    "/api/comments/nickname/regenerate",
    { ...withCredentials, method: "POST" },
  );
  return mapAnonymousIdentity(result);
}

/**
 * 댓글을 작성한다(POST /api/posts/{slug}/comments).
 *
 * 닉네임·아바타·익명 사용자 ID는 보내지 않는다. 서버가 쿠키로 결정하고, 그렇게
 * 결정된 값이 응답으로 돌아온다. `website`는 사용자에게 보이지 않는 허니팟
 * 필드로, 값이 차 있으면 서버가 자동화 요청으로 판단한다(docs/blog.md 8.8).
 */
export async function createBlogComment({
  slug,
  content,
  website,
}: {
  slug: string;
  content: string;
  website: string;
}): Promise<BlogComment> {
  const { result } = await apiFetch<ApiEnvelope<RawBlogComment>>(
    `/api/posts/${encodeURIComponent(slug)}/comments`,
    {
      ...withCredentials,
      method: "POST",
      body: JSON.stringify({ content, website }),
    },
  );
  return mapBlogComment(result);
}
