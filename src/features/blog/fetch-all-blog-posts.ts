import { getBlogPosts } from "@/features/blog/api/get-blog-posts";
import { BLOG_REVALIDATE_SECONDS } from "@/features/blog/blog-cache";
import type { BlogPostSummary } from "@/types/blog";

/** 한 번에 요청하는 최대 크기. 페이지 수를 줄이려고 목록 화면보다 크게 잡는다. */
const BATCH_SIZE = 100;
/** 글이 폭증했을 때 생성이 무한정 길어지지 않도록 두는 상한. */
const MAX_BATCHES = 50;

/**
 * 공개 글 전체를 마지막 페이지까지 따라가며 모은다.
 *
 * sitemap.xml과 rss.xml처럼 "전체 목록"이 필요한 곳에서만 쓴다. 화면 렌더링에는
 * 쓰지 않는다.
 */
export async function fetchAllBlogPosts(): Promise<BlogPostSummary[]> {
  const all: BlogPostSummary[] = [];
  let page = 1;

  for (let batch = 0; batch < MAX_BATCHES; batch += 1) {
    const result = await getBlogPosts({
      page,
      size: BATCH_SIZE,
      revalidate: BLOG_REVALIDATE_SECONDS,
    });
    all.push(...result.posts);
    if (!result.hasNext) break;
    page += 1;
  }

  return all;
}
