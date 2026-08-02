/**
 * 블로그 와이어 타입(Raw*)과 앱에서 쓰는 도메인 타입.
 *
 * 백엔드 실제 스펙(swagger `Blog Post API` / `Blog Comment API` / `Newsletter API`)을
 * 따른다. 다른 백엔드 연동과 마찬가지로 응답은 ApiEnvelope<T>로 감싸져 오고,
 * Raw* → 도메인 타입 변환은 src/features/blog/map-blog-*.ts에서만 한다.
 *
 * 페이지 번호는 백엔드가 0-base, 앱과 URL이 1-base다. 변환은
 * src/features/blog/blog-page-index.ts에서만 한다.
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

/** 상세 응답의 관련 글. 목록 요약과 달리 authorName이 없다(RelatedPostSummary). */
export interface RawRelatedBlogPost {
  slug: string;
  title: string;
  summary: string;
  thumbnailUrl: string | null;
  publishedAt: string;
}

export interface RawBlogPostPage {
  posts: RawBlogPostSummary[];
  /** 0-base. */
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

/** 검색 응답은 목록 응답에 서버가 해석한 검색어가 하나 더 붙는다. */
export interface RawBlogPostSearchPage extends RawBlogPostPage {
  query: string;
}

export interface RawBlogPostDetail extends RawBlogPostSummary {
  contentMarkdown: string;
  updatedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  relatedPosts: RawRelatedBlogPost[];
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

export interface RelatedBlogPost {
  slug: string;
  title: string;
  summary: string;
  thumbnailUrl: string | null;
  publishedAt: Date;
}

export interface BlogPostPage {
  posts: BlogPostSummary[];
  /** 1-base. URL(`/blog/page/2`)과 페이지네이션 UI가 쓰는 번호와 같다. */
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  /** 다음 페이지 존재 여부. 무한 스크롤과 크롤러용 앵커가 함께 쓴다. */
  hasNext: boolean;
}

export interface BlogPostSearchPage extends BlogPostPage {
  query: string;
}

export interface BlogPostDetail extends BlogPostSummary {
  contentMarkdown: string;
  updatedAt: Date | null;
  seoTitle: string;
  seoDescription: string;
  relatedPosts: RelatedBlogPost[];
}

// ---------------------------------------------------------------- 댓글

export interface RawBlogComment {
  id: string;
  nickname: string;
  avatarSeed: string;
  avatarImageUrl: string | null;
  content: string;
  createdAt: string;
}

export interface RawBlogCommentPage {
  comments: RawBlogComment[];
  /** 0-base. */
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

/** 익명 방문자의 표시 정보. 서버가 anon_session 쿠키를 기준으로 결정한다. */
export interface RawAnonymousProfile {
  nickname: string;
  avatarSeed: string;
  avatarImageUrl: string | null;
}

export interface BlogComment {
  id: string;
  nickname: string;
  avatarSeed: string;
  /** 서버가 준 캐릭터 이미지. 없으면 seed 기반 그라디언트로 대체한다. */
  avatarImageUrl: string | null;
  content: string;
  createdAt: Date;
}

export interface BlogCommentPage {
  comments: BlogComment[];
  /** 1-base. */
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export interface AnonymousIdentity {
  nickname: string;
  avatarSeed: string;
  avatarImageUrl: string | null;
}

// ---------------------------------------------------------------- 뉴스레터

/** 구독/해지 공통 응답(StatusResult). 안내 문구는 봉투의 message에 담겨 온다. */
export interface RawNewsletterStatus {
  status: string;
}

export interface NewsletterStatusResult {
  /** 예: "ACTIVE", "UNSUBSCRIBED". */
  status: string;
  message: string;
}
