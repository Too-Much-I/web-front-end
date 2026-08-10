export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://to-teacher.com"
).replace(/\/$/, "");

/** 서비스 이름. 페이지 제목이 아니라 발행 주체의 이름이라 구조화 데이터가 함께 쓴다. */
export const SITE_NAME = "토선생";

/**
 * 로마자 표기. 구조화 데이터의 alternateName으로 나가, 한글 표기를 모르는 소비자가
 * "tosunsaeng" 질의를 같은 엔티티로 묶을 수 있게 한다. 공식 채널 핸들과 철자를 맞춘다.
 */
export const SITE_ALTERNATE_NAME = "tosunsaeng";

/** 서비스 한 줄 소개. 루트 메타 설명과 Organization 설명이 함께 쓴다. */
export const SITE_DESCRIPTION =
  "토선생은 실제 토익 스피킹 시험과 동일한 유형의 문제로 모의고사를 보고, AI가 발음·유창성·문법·어휘를 공식 채점 기준으로 분석해 즉시 피드백을 주는 서비스예요.";

/**
 * 운영 중인 공식 외부 채널.
 *
 * Organization의 sameAs로 나간다. sameAs는 "여기에 콘텐츠가 있다"가 아니라 "이 계정의
 * 주인이 우리다"라는 신원 주장이므로, 아직 콘텐츠가 없는 채널도 소유하고 있다면 넣는다.
 * 앱 출시 후 앱스토어·플레이스토어 주소를 여기에 추가하면 구조화 데이터에 함께 반영된다.
 */
export const SITE_SOCIAL_URLS = [
  "https://www.instagram.com/tosunsaeng/",
  "https://x.com/tossSunSaeng",
  "https://www.youtube.com/@to-teacher",
] as const;

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
