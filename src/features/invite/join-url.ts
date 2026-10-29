import { withUtm } from "@/lib/share-url";
import { SITE_URL } from "@/lib/site-config";

import { parseReferralCode } from "./referral-code";

/**
 * 공유 링크(/invite, /invite/<추천 코드>)가 리다이렉트할 초대 페이지 주소.
 *
 * 공유 메시지에는 UTM 없는 주소만 보이게 하고, 리다이렉트하면서 UTM을 붙인다.
 * 반대로(UTM 링크를 공유하고 서버에서 UTM을 떼어 리다이렉트) 하면 안 된다. GA는 브라우저가
 * 마지막에 도착한 주소에서 UTM을 읽기 때문에, 도착 주소에 UTM이 없으면 유입이 기록되지 않는다.
 *
 * 형식이 틀린 코드는 넘기지 않는다. 초대 페이지가 코드 없이 안내만 보여준다.
 */
export function buildJoinUrl(rawCode: string | null): string {
  const target = new URL(`${SITE_URL}/join`);
  const code = parseReferralCode(rawCode ?? undefined);
  if (code) target.searchParams.set("code", code);

  return withUtm(target.toString(), {
    source: "native_share",
    medium: "referral",
    campaign: "friend_invite",
  });
}
