import type {
  BlogPostDetail,
  BlogPostPage,
  BlogPostSummary,
  RawBlogPostDetail,
  RawBlogPostPage,
  RawBlogPostSummary,
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

export function mapBlogPostPage(raw: RawBlogPostPage): BlogPostPage {
  return {
    posts: raw.posts.map(mapBlogPostSummary),
    page: raw.page,
    size: raw.size,
    totalPages: raw.totalPages,
    totalElements: raw.totalElements,
    hasNext: raw.page < raw.totalPages,
  };
}

export function mapBlogPostDetail(raw: RawBlogPostDetail): BlogPostDetail {
  return {
    ...mapBlogPostSummary(raw),
    contentMarkdown: raw.contentMarkdown,
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : null,
    // seo_title / seo_description이 비어 있으면 title / summary로 대체한다(docs/blog.md 13.2).
    seoTitle: raw.seoTitle || raw.title,
    seoDescription: raw.seoDescription || raw.summary,
    relatedPosts: (raw.relatedPosts ?? []).map(mapBlogPostSummary),
  };
}
