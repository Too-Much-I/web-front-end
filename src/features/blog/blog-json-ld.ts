import { SITE_URL } from "@/lib/site-config";
import type { BlogPostDetail } from "@/types/blog";

/**
 * 구조화 데이터를 `<script>` 안에 넣을 수 있는 문자열로 만든다.
 *
 * JSON.stringify 결과를 그대로 넣으면, 값에 `</script>`가 섞였을 때 스크립트
 * 블록이 그 자리에서 닫히고 뒤쪽이 HTML로 해석된다. 여기 들어가는 제목·설명·
 * 작성자명은 백엔드에서 오고 본문과 달리 sanitize를 거치지 않으므로, `<`를
 * 유니코드 이스케이프로 바꿔 태그가 만들어질 여지를 없앤다. JSON 파서는
 * `<`를 `<`로 되돌려 읽으므로 구조화 데이터의 의미는 바뀌지 않는다.
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

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
