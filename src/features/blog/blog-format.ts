/** 한국어 기준 분당 읽는 글자 수. 읽는 시간 표시는 어림값이면 충분하다. */
const CHARS_PER_MINUTE = 500;

/**
 * 본문 길이로 읽는 시간을 어림한다.
 *
 * docs/blog.md의 API 응답에는 읽는 시간 필드가 없어 프론트에서 계산한다.
 * 본문을 가진 상세 페이지에서만 쓸 수 있고, 요약만 있는 목록 카드에서는 쓰지 않는다.
 */
export function estimateReadingMinutes(plainText: string): number {
  return Math.max(1, Math.round(plainText.length / CHARS_PER_MINUTE));
}

/**
 * 서버와 클라이언트에서 같은 문자열이 나오도록 타임존을 고정해 날짜를 포맷한다.
 * 고정하지 않으면 서버(UTC)와 브라우저(KST)의 결과가 달라 하이드레이션이 깨진다.
 */
const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function formatBlogDate(date: Date): string {
  return dateFormatter.format(date);
}

/** `<time datetime>`에 넣을 값. 날짜만 필요하므로 KST 기준 YYYY-MM-DD로 만든다. */
export function toDateAttribute(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  return parts;
}

/** 댓글 목록에 쓰는 상대 시간. 하루가 넘어가면 날짜로 떨어뜨린다. */
export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;

  return formatBlogDate(date);
}
