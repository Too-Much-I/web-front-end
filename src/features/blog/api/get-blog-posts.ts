import { mapBlogPostPage } from "@/features/blog/map-blog-post";
import {
  isBlogMockEnabled,
  mockGetBlogPosts,
} from "@/features/blog/mock/blog-mock-api";
import { apiFetch } from "@/lib/api/client";
import type { ApiEnvelope } from "@/types/api";
import type { BlogPostPage, RawBlogPostPage } from "@/types/blog";

/** 목록 한 페이지에 담는 글 수(docs/blog.md 5.1). */
export const BLOG_PAGE_SIZE = 9;

/**
 * 공개 게시글을 최신순으로 조회한다.
 *
 * 목록은 ISR로 프리렌더되므로 재검증 주기를 fetch에도 명시한다. 명시하지 않으면
 * Next 15 기본값(no-store)이 적용되어 라우트가 동적 렌더링으로 전환된다.
 */
export async function getBlogPosts({
  page = 1,
  size = BLOG_PAGE_SIZE,
  revalidate,
}: {
  page?: number;
  size?: number;
  revalidate?: number;
} = {}): Promise<BlogPostPage> {
  if (isBlogMockEnabled()) {
    return mapBlogPostPage(await mockGetBlogPosts({ page, size }));
  }

  const { result } = await apiFetch<ApiEnvelope<RawBlogPostPage>>(
    `/api/posts?page=${page}&size=${size}`,
    revalidate === undefined ? undefined : { next: { revalidate } },
  );
  return mapBlogPostPage(result);
}

/**
 * 목록 조회 실패를 예외 대신 null로 돌려준다.
 *
 * ISR로 프리렌더되는 목록 페이지에서 예외가 그대로 올라가면 빌드가 실패하고,
 * 배포 후에는 백엔드 장애가 곧 500 페이지가 된다. 안내 화면으로 떨어뜨린 뒤
 * 다음 재검증에서 복구되도록 하려는 용도다.
 */
export async function getBlogPostsSafe(
  options?: Parameters<typeof getBlogPosts>[0],
): Promise<BlogPostPage | null> {
  try {
    return await getBlogPosts(options);
  } catch {
    return null;
  }
}
