import { ORGANIZATION_ID, WEBSITE_ID } from "@/lib/json-ld";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";
import type { BlogPostDetail, BlogPostSummary } from "@/types/blog";

/** 목록 화면의 메타·본문과 Blog 구조화 데이터가 같은 문구를 쓰도록 여기서만 정의한다. */
export const BLOG_NAME = "토익 스피킹 학습 블로그";
export const BLOG_DESCRIPTION =
  "토익 스피킹 등급 기준부터 파트별 답변 전략까지, 실제 채점 데이터를 보며 정리한 학습 노트를 모았습니다.";

/** 블로그라는 콘텐츠 묶음 자체의 식별자. 목록 URL(`/blog`)이 가리키는 문서와는 다른 것이다. */
export const BLOG_ID = `${SITE_URL}/blog#blog`;

const blogUrl = `${SITE_URL}/blog`;

function postUrl(slug: string): string {
  return `${SITE_URL}/blog/${slug}`;
}

function postId(slug: string): string {
  return `${postUrl(slug)}#article`;
}

/**
 * 블로그 목록 페이지에 넣을 구조화 데이터.
 *
 * 낱개 글이 BlogPosting이라고만 말하면 "글이 여러 개 있다"까지고, 이 사이트가 블로그를
 * 운영한다는 선언은 어디에도 없다. Blog를 두고 각 글이 `isPartOf`로 되짚게 해야 개별
 * 문서가 아니라 콘텐츠 허브로 읽힌다.
 *
 * `blogPost`에는 첫 페이지 글만 싣는다. 이미 화면 렌더링에 쓰려고 가져온 목록이라 추가
 * 요청이 없고, 전체 목록은 sitemap이 담당한다.
 *
 * `/blog/page/2` 이후에는 넣지 않는다. 같은 `@id`가 여러 URL에서 선언되면 어느 문서가
 * 그 엔티티를 대표하는지 흐려진다.
 */
export function blogJsonLd(posts: BlogPostSummary[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": BLOG_ID,
    name: BLOG_NAME,
    description: BLOG_DESCRIPTION,
    url: blogUrl,
    inLanguage: "ko-KR",
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORGANIZATION_ID },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      "@id": postId(post.slug),
      headline: post.title,
      url: postUrl(post.slug),
      datePublished: post.publishedAt.toISOString(),
    })),
  };
}

/**
 * 게시글 상세에 넣을 구조화 데이터(docs/blog.md 13.3).
 *
 * 댓글은 포함하지 않는다. 운영자가 작성한 본문만 Article로 기술한다.
 *
 * `publisher`는 `@id` 참조만 남기지 않고 인라인 객체를 유지한 채 `@id`를 덧붙인다.
 * 참조를 해석하지 않는 단순 파서에서도 발행자 정보가 남게 하려는 것이고, 해석하는
 * 소비자에게는 루트 레이아웃의 Organization과 같은 노드로 합쳐진다.
 */
export function blogPostingJsonLd(post: BlogPostDetail) {
  const url = postUrl(post.slug);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": postId(post.slug),
    headline: post.seoTitle,
    description: post.seoDescription,
    image: post.thumbnailUrl ? [post.thumbnailUrl] : undefined,
    inLanguage: "ko-KR",
    // author에는 `@id`를 붙이지 않는다. authorName은 글마다 다를 수 있는데 조직 식별자를
    // 함께 주면 "그 조직의 이름이 곧 이 작성자명"이라는 뜻이 되어, 발행 주체의 이름이
    // 글마다 달라지는 모순이 생긴다.
    author: { "@type": "Organization", name: post.authorName },
    publisher: {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
    datePublished: post.publishedAt.toISOString(),
    dateModified: (post.updatedAt ?? post.publishedAt).toISOString(),
    isPartOf: { "@id": BLOG_ID },
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
        item: blogUrl,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: postUrl(post.slug),
      },
    ],
  };
}
