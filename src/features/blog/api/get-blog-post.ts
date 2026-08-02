import { mapBlogPostDetail } from "@/features/blog/map-blog-post";
import { ApiError, apiFetch } from "@/lib/api/client";
import type { ApiEnvelope } from "@/types/api";
import type { BlogPostDetail, RawBlogPostDetail } from "@/types/blog";

/**
 * slug로 게시글 한 건을 조회한다.
 *
 * DRAFT / ARCHIVED / 발행 예정 / 존재하지 않는 slug는 백엔드가 404로 응답한다
 * (docs/blog.md 5.2). 그 경우 null을 반환해 호출부가 notFound()를 부르게 한다.
 */
export async function getBlogPost(
  slug: string,
  { revalidate }: { revalidate?: number } = {},
): Promise<BlogPostDetail | null> {
  try {
    const { result } = await apiFetch<ApiEnvelope<RawBlogPostDetail>>(
      `/api/posts/${encodeURIComponent(slug)}`,
      revalidate === undefined ? undefined : { next: { revalidate } },
    );
    return mapBlogPostDetail(result);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}
