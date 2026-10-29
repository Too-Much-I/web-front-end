/**
 * 친구 초대 추천 코드.
 *
 * 백엔드가 발급하는 형식: 영문 대문자·숫자 10자리, 서로 헷갈리는 I·O·0·1은 쓰지 않는다.
 * 공유 링크의 쿼리는 누구나 고칠 수 있으므로 형식이 맞을 때만 화면에 보여준다.
 * 사람이 손으로 옮겨 적다 소문자나 공백이 섞이는 경우는 받아준다.
 */
const REFERRAL_CODE_PATTERN = /^[A-HJ-NP-Z2-9]{10}$/;

export function parseReferralCode(
  raw: string | string[] | undefined,
): string | null {
  if (typeof raw !== "string") return null;
  const code = raw.trim().toUpperCase();
  return REFERRAL_CODE_PATTERN.test(code) ? code : null;
}
