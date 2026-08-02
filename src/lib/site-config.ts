export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://to-teacher.com"
).replace(/\/$/, "");

/**
 * 공유 카드 기본 이미지. 루트 레이아웃의 기본 메타와 각 페이지의 폴백이 함께 쓴다.
 *
 * Next.js는 하위 세그먼트가 `openGraph`/`twitter`를 정의하면 상위 값을 병합하지 않고
 * 통째로 교체한다. 즉 상위에서 이미지만 물려받을 수 없으므로, 자체 메타를 가진 페이지는
 * 이 값을 직접 넣어 og:image 누락을 막는다.
 * 상대 경로는 루트 레이아웃의 `metadataBase`가 절대 URL로 바꿔 준다.
 */
export const DEFAULT_OG_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 600,
} as const;
