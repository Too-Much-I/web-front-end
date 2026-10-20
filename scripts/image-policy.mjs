// public/ 이미지 규칙. check-images.mjs(CI)와 images-to-webp.mjs(로컬 변환)가 함께 쓴다.

/** WebP로 바꿔야 하는 래스터 포맷. */
export const RASTER_EXT = /\.(png|jpe?g)$/i;

/** 용량을 검사하는 이미지 포맷. 영상(mp4·webm)은 검사하지 않는다. */
export const IMAGE_EXT = /\.(png|jpe?g|webp|avif|gif|svg)$/i;

/** 새로 추가하거나 고친 이미지 한 장의 최대 용량. 메인 히어로 WebP가 130KB 정도다. */
export const MAX_IMAGE_BYTES = 500 * 1024;

/**
 * PNG·JPG로 남겨야 하는 파일. 외부 서비스가 읽는 이미지라 WebP 지원을 장담할 수 없다.
 * 내용을 바꿀 땐 다른 이미지처럼 이름을 바꿔야 하므로(og-image-v2.png 등) 접두사로 허용한다.
 * - og-image: 카카오톡·슬랙 등 링크 미리보기
 * - logo: JSON-LD(구조화 데이터)의 로고 URL
 * - 아이콘: 파비콘·애플 터치 아이콘
 */
export const RASTER_ALLOWLIST = [
  /^public\/og-image[^/]*\.(png|jpe?g)$/i,
  /^public\/logo[^/]*\.png$/,
  /(^|\/)(favicon|apple-touch-icon|icon)[^/]*\.png$/i,
];

export const isAllowedRaster = (path) =>
  RASTER_ALLOWLIST.some((pattern) => pattern.test(path));

/** PNG·JPG를 base64로 품은 SVG. 벡터가 아니라 래스터를 감싼 껍데기라 용량만 커진다. */
export const EMBEDDED_RASTER = /data:image\/(png|jpe?g|webp);base64/i;
