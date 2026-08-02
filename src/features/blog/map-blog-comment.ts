import { toAppPage } from "@/features/blog/blog-page-index";
import type {
  AnonymousIdentity,
  BlogComment,
  BlogCommentPage,
  RawAnonymousProfile,
  RawBlogComment,
  RawBlogCommentPage,
} from "@/types/blog";

export function mapBlogComment(raw: RawBlogComment): BlogComment {
  return {
    id: raw.id,
    nickname: raw.nickname,
    avatarSeed: raw.avatarSeed,
    avatarImageUrl: raw.avatarImageUrl || null,
    content: raw.content,
    createdAt: new Date(raw.createdAt),
  };
}

export function mapBlogCommentPage(raw: RawBlogCommentPage): BlogCommentPage {
  return {
    comments: (raw.comments ?? []).map(mapBlogComment),
    page: toAppPage(raw.page),
    size: raw.size,
    totalPages: raw.totalPages,
    totalElements: raw.totalElements,
    hasNext: Boolean(raw.hasNext),
  };
}

export function mapAnonymousIdentity(
  raw: RawAnonymousProfile,
): AnonymousIdentity {
  return {
    nickname: raw.nickname,
    avatarSeed: raw.avatarSeed,
    avatarImageUrl: raw.avatarImageUrl || null,
  };
}
