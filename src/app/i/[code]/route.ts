import { NextResponse, type NextRequest } from "next/server";

import { parseReferralCode } from "@/features/invite/referral-code";
import { withUtm } from "@/lib/share-url";
import { SITE_URL } from "@/lib/site-config";

/**
 * 앱 '공유하기'가 메시지에 넣는 짧은 초대 링크: /i/<추천 코드>
 *
 * 공유 메시지에는 UTM 없는 짧은 주소만 보이게 하고, 여기서 UTM을 붙여 초대 페이지로 넘긴다.
 * 반대로(UTM 링크를 공유하고 서버에서 UTM을 떼어 리다이렉트) 하면 안 된다. GA는 브라우저가
 * 마지막에 도착한 주소에서 UTM을 읽기 때문에, 도착 주소에 UTM이 없으면 유입이 기록되지 않는다.
 *
 * 카카오톡 등의 링크 미리보기 크롤러도 이 리다이렉트를 따라가 /invite의 OG 정보를 읽는다.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const target = new URL(`${SITE_URL}/invite`);
  // 형식이 틀린 코드는 넘기지 않는다. 초대 페이지가 코드 없이 안내만 보여준다.
  const referralCode = parseReferralCode(code);
  if (referralCode) target.searchParams.set("code", referralCode);

  const destination = withUtm(target.toString(), {
    source: "native_share",
    medium: "referral",
    campaign: "friend_invite",
  });

  // 초대 페이지 주소나 UTM 값은 바뀔 수 있으므로 영구 리다이렉트(308)로 캐시되면 안 된다.
  return NextResponse.redirect(destination, 302);
}
