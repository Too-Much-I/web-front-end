import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // `/exam/`은 일부러 여기서 막지 않는다. 색인을 막는 것은 `next.config.ts`의
      // `X-Robots-Tag: noindex, nofollow` 헤더인데, 이 헤더는 크롤러가 실제로
      // 요청을 보내 응답을 받아야만 읽힌다. 여기서 Disallow를 걸면 크롤러가 아예
      // 요청하지 않으므로 noindex를 보지 못하고, 외부에 링크가 노출된 경우
      // 내용 없이 URL만 색인될 수 있다(개인 채점 결과가 `?examId=`로 열린다).
      // 크롤은 허용하되 색인은 헤더로 거절하는 조합이 의도한 동작이다.
      disallow: ["/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
