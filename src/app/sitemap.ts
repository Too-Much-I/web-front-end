import type { MetadataRoute } from "next";

import { fetchAllBlogPosts } from "@/features/blog/fetch-all-blog-posts";
import { SITE_URL } from "@/lib/site-config";

// 세그먼트 설정은 정적으로 분석되므로 리터럴이어야 한다(BLOG_REVALIDATE_SECONDS와 동일 값).
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/blog",
    "/guide/toeic-speaking-parts",
    "/contact",
    "/terms",
    "/privacy",
    // Play 콘솔의 데이터 삭제 URL. 스토어 등록정보에 노출되는 링크이므로 색인을 막지 않는다.
    "/data-deletion",
  ].map((route) => ({ url: `${SITE_URL}${route}` }));

  // 백엔드가 응답하지 않아도 정적 경로만이라도 사이트맵이 나가게 한다.
  const posts = await fetchAllBlogPosts().catch(() => []);

  return [
    ...staticRoutes,
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.publishedAt,
    })),
  ];
}
