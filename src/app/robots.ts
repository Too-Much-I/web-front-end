import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site-config";

/**
 * 친구 초대 공유 경로. 앱의 '공유하기'로만 들어오고 사람마다 코드만 다른 같은 화면이라
 * 검색 봇이 긁어갈 이유가 없다. /invite는 /invite/<코드>까지 접두사로 함께 막힌다.
 *
 * `/exam/`과 달리 여기는 크롤 자체를 막는다. 외부에 링크가 노출되면 URL만 색인될 수 있지만,
 * 드러나는 건 추천 코드뿐이라 개인 채점 결과(`?examId=`)만큼 민감하지 않다.
 */
const INVITE_PATHS = ["/invite", "/join", "/download"];

/**
 * 링크 미리보기 봇. 메신저에 초대 링크를 붙이면 이 봇들이 OG 태그를 읽어 카드를 만드는데,
 * 일부는 robots.txt를 따르므로 위 경로를 막으면 미리보기 카드가 사라진다.
 * robots.txt는 자기 이름의 그룹이 있으면 `*` 그룹을 무시하므로, 이름을 따로 적어 허용한다.
 */
const LINK_PREVIEW_BOTS = [
  "kakaotalk-scrap",
  "facebookexternalhit",
  "Twitterbot",
  "Slackbot",
  "Discordbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // `/exam/`은 일부러 여기서 막지 않는다. 색인을 막는 것은 `next.config.ts`의
        // `X-Robots-Tag: noindex, nofollow` 헤더인데, 이 헤더는 크롤러가 실제로
        // 요청을 보내 응답을 받아야만 읽힌다. 여기서 Disallow를 걸면 크롤러가 아예
        // 요청하지 않으므로 noindex를 보지 못하고, 외부에 링크가 노출된 경우
        // 내용 없이 URL만 색인될 수 있다(개인 채점 결과가 `?examId=`로 열린다).
        // 크롤은 허용하되 색인은 헤더로 거절하는 조합이 의도한 동작이다.
        disallow: ["/api/", ...INVITE_PATHS],
      },
      {
        userAgent: LINK_PREVIEW_BOTS,
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
