/**
 * 블로그 와이어 타입(Raw*)과 앱에서 쓰는 도메인 타입.
 *
 * 엔드포인트 규격은 docs/blog.md 15장을 따른다. 다른 백엔드 연동과 마찬가지로
 * 응답은 ApiEnvelope<T>로 감싸져 오고, Raw* → 도메인 타입 변환은
 * src/features/blog/map-blog-*.ts에서만 한다.
 */

// ---------------------------------------------------------------- 게시글

export interface RawBlogPostSummary {
  slug: string;
  title: string;
  summary: string;
  thumbnailUrl: string | null;
  authorName: string;
  publishedAt: string;
}

export interface RawBlogPostPage {
  posts: RawBlogPostSummary[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

export interface RawBlogPostDetail extends RawBlogPostSummary {
  contentMarkdown: string;
  updatedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  relatedPosts: RawBlogPostSummary[];
}

export interface BlogPostSummary {
  slug: string;
  title: string;
  summary: string;
  /** 없으면 카드에서 그라디언트 폴백을 그린다. */
  thumbnailUrl: string | null;
  authorName: string;
  publishedAt: Date;
}

export interface BlogPostPage {
  posts: BlogPostSummary[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  /** 다음 페이지 존재 여부. 무한 스크롤과 크롤러용 앵커가 함께 쓴다. */
  hasNext: boolean;
}

export interface BlogPostDetail extends BlogPostSummary {
  contentMarkdown: string;
  updatedAt: Date | null;
  seoTitle: string;
  seoDescription: string;
  relatedPosts: BlogPostSummary[];
}

// ---------------------------------------------------------------- 댓글

export interface RawBlogComment {
  id: number;
  nickname: string;
  avatarSeed: string;
  content: string;
  createdAt: string;
}

export interface RawBlogCommentPage {
  comments: RawBlogComment[];
  nextCursor: string | null;
  hasNext: boolean;
}

/** 익명 방문자의 표시 정보. 서버가 anon_session 쿠키를 기준으로 결정한다. */
export interface RawAnonymousIdentity {
  nickname: string;
  avatarSeed: string;
}

export interface BlogComment {
  id: number;
  nickname: string;
  avatarSeed: string;
  content: string;
  createdAt: Date;
}

export interface BlogCommentPage {
  comments: BlogComment[];
  nextCursor: string | null;
  hasNext: boolean;
}

export interface AnonymousIdentity {
  nickname: string;
  avatarSeed: string;
}

// ---------------------------------------------------------------- 뉴스레터

export interface RawNewsletterSubscribeResult {
  success: boolean;
  status?: string;
  message: string;
}

export interface NewsletterSubscribeResult {
  message: string;
}
