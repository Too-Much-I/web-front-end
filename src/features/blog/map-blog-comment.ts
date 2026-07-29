import type {
  BlogComment,
  BlogCommentPage,
  RawBlogComment,
  RawBlogCommentPage,
} from "@/types/blog";

export function mapBlogComment(raw: RawBlogComment): BlogComment {
  return {
    id: raw.id,
    nickname: raw.nickname,
    avatarSeed: raw.avatarSeed,
    content: raw.content,
    createdAt: new Date(raw.createdAt),
  };
}

export function mapBlogCommentPage(raw: RawBlogCommentPage): BlogCommentPage {
  return {
    comments: (raw.comments ?? []).map(mapBlogComment),
    nextCursor: raw.nextCursor ?? null,
    hasNext: Boolean(raw.hasNext),
  };
}
