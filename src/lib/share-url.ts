/**
 * 앱이 만들어내는 공유 링크에 UTM 파라미터를 붙인다.
 *
 * medium은 GA4 기본 채널 그룹이 인식하는 표준값만 허용한다. 여기서 벗어난 값을 쓰면
 * (예전에 커뮤니티 홍보 링크를 utm_medium=community로 뿌렸다가 겪었듯) 채널이 전부
 * Unassigned로 떨어지고, 맞춤 채널 그룹을 따로 만들기 전까지는 어디서 들어왔는지 알 수
 * 없다. 세부 구분은 medium이 아니라 source/campaign으로 한다.
 *
 * 중요: "같은 사람이 다시 들어오는 링크"에는 붙이지 않는다. UTM이 붙은 링크로 재방문하면
 * 그 세션의 소스/매체가 덮어써져서 본인의 재방문이 외부 유입으로 집계된다. 시험 결과
 * 페이지처럼 본인 보관용에 가까운 링크는 UTM 대신 이벤트(result_share)로 측정한다.
 */

/** GA4 기본 채널 그룹이 Referral/Organic Social/Email로 분류해주는 표준 medium만 둔다. */
export type UtmMedium = "referral" | "social" | "email";

/** 앱 안에서 링크를 만들어내는 지점들. 손으로 뿌리는 홍보 링크는 이 함수의 범위 밖이다. */
export type UtmSource = "x" | "naver" | "facebook" | "native_share" | "copy_link";

export type UtmParams = {
  source: UtmSource;
  medium: UtmMedium;
  campaign: string;
};

/** url은 절대 URL이어야 한다 (URL 생성자가 상대 경로를 파싱하지 못한다). */
export function withUtm(url: string, { source, medium, campaign }: UtmParams): string {
  const next = new URL(url);
  next.searchParams.set("utm_source", source);
  next.searchParams.set("utm_medium", medium);
  next.searchParams.set("utm_campaign", campaign);
  return next.toString();
}
