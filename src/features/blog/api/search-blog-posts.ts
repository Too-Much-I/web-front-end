import { BLOG_PAGE_SIZE } from "@/features/blog/api/get-blog-posts";
import { mapBlogPostPage } from "@/features/blog/map-blog-post";
import {
  isBlogMockEnabled,
  mockSearchBlogPosts,
} from "@/features/blog/mock/blog-mock-api";
import { apiFetch } from "@/lib/api/client";
import type { ApiEnvelope } from "@/types/api";
import type { BlogPostPage, RawBlogPostPage } from "@/types/blog";

/** 검색어 길이 제한(docs/blog.md 7.2). 프론트는 UX용이고 실제 검증은 서버가 한다. */
export const SEARCH_QUERY_MIN_LENGTH = 2;
export const SEARCH_QUERY_MAX_LENGTH = 50;

/** 공백을 정리하고 최대 길이로 자른, 서버에 보낼 형태의 검색어를 만든다. */
export function normalizeSearchQuery(raw: string): string {
  return raw.trim().slice(0, SEARCH_QUERY_MAX_LENGTH);
}

export function isSearchQueryTooShort(query: string): boolean {
  return query.length < SEARCH_QUERY_MIN_LENGTH;
}

/** 제목 부분 일치로 공개 게시글을 검색한다(docs/blog.md 7.1). */
export async function searchBlogPosts({
  query,
  page = 1,
  size = BLOG_PAGE_SIZE,
}: {
  query: string;
  page?: number;
  size?: number;
}): Promise<BlogPostPage> {
  if (isBlogMockEnabled()) {
    return mapBlogPostPage(await mockSearchBlogPosts({ query, page, size }));
  }

  const { result } = await apiFetch<ApiEnvelope<RawBlogPostPage>>(
    `/api/posts/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`,
  );
  return mapBlogPostPage(result);
}
