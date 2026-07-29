import { SITE_URL } from "@/lib/site-config";
import type { BlogPostDetail } from "@/types/blog";

/**
 * 게시글 상세에 넣을 구조화 데이터(docs/blog.md 13.3).
 *
 * 댓글은 포함하지 않는다. 운영자가 작성한 본문만 Article로 기술한다.
 */
export function blogPostingJsonLd(post: BlogPostDetail) {
  const url = `${SITE_URL}/blog/${post.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.seoTitle,
    description: post.seoDescription,
    image: post.thumbnailUrl ? [post.thumbnailUrl] : undefined,
    author: { "@type": "Organization", name: post.authorName },
    publisher: {
      "@type": "Organization",
      name: "토선생",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
    datePublished: post.publishedAt.toISOString(),
    dateModified: (post.updatedAt ?? post.publishedAt).toISOString(),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
  };
}

export function blogBreadcrumbJsonLd(post: BlogPostDetail) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "블로그",
        item: `${SITE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${SITE_URL}/blog/${post.slug}`,
      },
    ],
  };
}
