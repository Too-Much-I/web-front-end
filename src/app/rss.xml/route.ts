import { fetchAllBlogPosts } from "@/features/blog/fetch-all-blog-posts";
import { SITE_URL } from "@/lib/site-config";

// 세그먼트 설정은 정적으로 분석되므로 리터럴이어야 한다(BLOG_REVALIDATE_SECONDS와 동일 값).
export const revalidate = 300;

/** RSS는 XML 문서라 &, <, > 등을 그대로 넣을 수 없다. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** 블로그 RSS 피드(docs/blog.md 13.6). */
export async function GET() {
  const posts = await fetchAllBlogPosts().catch(() => []);

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`;
      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <description>${escapeXml(post.summary)}</description>`,
        `      <author>${escapeXml(post.authorName)}</author>`,
        `      <pubDate>${post.publishedAt.toUTCString()}</pubDate>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    "    <title>토선생 블로그</title>",
    `    <link>${SITE_URL}/blog</link>`,
    "    <description>토익 스피킹 학습 콘텐츠와 토선생 업데이트</description>",
    "    <language>ko</language>",
    `    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />`,
    items,
    "  </channel>",
    "</rss>",
  ].join("\n");

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
