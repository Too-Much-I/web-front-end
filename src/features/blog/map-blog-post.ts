import { toAppPage } from "@/features/blog/blog-page-index";
import type {
  BlogPostDetail,
  BlogPostPage,
  BlogPostSearchPage,
  BlogPostSummary,
  RawBlogPostDetail,
  RawBlogPostPage,
  RawBlogPostSearchPage,
  RawBlogPostSummary,
  RawRelatedBlogPost,
  RelatedBlogPost,
} from "@/types/blog";

export function mapBlogPostSummary(raw: RawBlogPostSummary): BlogPostSummary {
  return {
    slug: raw.slug,
    title: raw.title,
    summary: raw.summary,
    thumbnailUrl: raw.thumbnailUrl || null,
    authorName: raw.authorName,
    publishedAt: new Date(raw.publishedAt),
  };
}

export function mapRelatedBlogPost(raw: RawRelatedBlogPost): RelatedBlogPost {
  return {
    slug: raw.slug,
    title: raw.title,
    summary: raw.summary,
    thumbnailUrl: raw.thumbnailUrl || null,
    publishedAt: new Date(raw.publishedAt),
  };
}

export function mapBlogPostPage(raw: RawBlogPostPage): BlogPostPage {
  return {
    posts: (raw.posts ?? []).map(mapBlogPostSummary),
    page: toAppPage(raw.page),
    size: raw.size,
    totalPages: raw.totalPages,
    totalElements: raw.totalElements,
    // 마지막 페이지 판정은 서버가 내려주는 값을 그대로 쓴다.
    hasNext: Boolean(raw.hasNext),
  };
}

export function mapBlogPostSearchPage(
  raw: RawBlogPostSearchPage,
): BlogPostSearchPage {
  return { ...mapBlogPostPage(raw), query: raw.query ?? "" };
}

export function mapBlogPostDetail(raw: RawBlogPostDetail): BlogPostDetail {
  return {
    ...mapBlogPostSummary(raw),
    contentMarkdown: raw.contentMarkdown,
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : null,
    // seoTitle / seoDescription이 비어 있으면 title / summary로 대체한다(docs/blog.md 13.2).
    seoTitle: raw.seoTitle || raw.title,
    seoDescription: raw.seoDescription || raw.summary,
    relatedPosts: (raw.relatedPosts ?? []).map(mapRelatedBlogPost),
  };
}
