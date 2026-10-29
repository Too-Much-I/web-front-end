export type MobilePlatform = "ios" | "android";

/**
 * User-Agent로 스토어를 고를 휴대폰 OS를 가려낸다. 휴대폰이 아니면 null.
 *
 * iPadOS Safari는 UA를 데스크톱 Mac으로 위장하므로 서버에서는 아이패드를 가려낼 수 없다.
 * 아이패드는 null(데스크톱)로 떨어진다.
 *
 * 카카오톡·인스타그램 인앱 브라우저도 UA에 iPhone/Android를 그대로 남기므로 같은 규칙으로 잡힌다.
 */
export function detectMobilePlatform(userAgent: string): MobilePlatform | null {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "ios";
  if (/Android/i.test(userAgent)) return "android";
  return null;
}
