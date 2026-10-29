import type { Metadata } from "next";
import { headers } from "next/headers";

import { InviteLanding } from "@/components/invite/invite-landing";
import { parseReferralCode } from "@/features/invite/referral-code";
import { detectMobilePlatform } from "@/lib/mobile-platform";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/site-config";

const TITLE = "친구가 토선생 응시권을 보냈어요";
const DESCRIPTION =
  "친구랑 같이 토익스피킹 AI 모의고사 응시권 1장씩 받아가세요.";

/**
 * 앱의 '공유하기'로만 들어오는 친구 초대 페이지. 웹 메뉴에서는 링크하지 않는다.
 *
 * 공유 URL: /invite?code=<추천 코드>&utm_source=native_share&utm_medium=referral&utm_campaign=friend_invite
 *
 * 사람마다 코드만 다른 같은 화면이라 색인할 이유가 없다. 사이트맵에도 넣지 않는다.
 * openGraph를 직접 정의하면 루트 레이아웃의 값이 통째로 교체되므로 이미지도 여기서 넣는다
 * (site-config의 DEFAULT_OG_IMAGE 주석 참고).
 */
export const metadata: Metadata = {
  title: `${TITLE} | 토선생`,
  description: DESCRIPTION,
  robots: { index: false, follow: false },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/invite`,
    siteName: "토선생",
    images: [{ ...DEFAULT_OG_IMAGE, alt: TITLE }],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string | string[] }>;
}) {
  const { code } = await searchParams;
  // 기기 판별을 서버에서 해야 첫 화면부터 맞는 스토어 버튼(또는 QR)이 뜨고 바뀌며 깜빡이지 않는다.
  const userAgent = (await headers()).get("user-agent") ?? "";

  return (
    <InviteLanding
      code={parseReferralCode(code)}
      platform={detectMobilePlatform(userAgent)}
    />
  );
}
