import type { Metadata } from "next";
import { Geist, Geist_Mono, Jua } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AnalyticsGate } from "@/components/analytics-gate";
import { JsonLd } from "@/components/json-ld";
import { ORGANIZATION_JSON_LD, WEBSITE_JSON_LD } from "@/lib/json-ld";
import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_URL,
} from "@/lib/site-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jua = Jua({
  variable: "--font-jua-kr",
  weight: "400",
  subsets: ["latin"],
});

const TITLE = "토선생 - 토익 스피킹 AI 모의고사 채점";
// 구조화 데이터의 Organization 설명과 같은 문구를 써야 해서 site-config에서 가져온다.
const DESCRIPTION = SITE_DESCRIPTION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
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

/**
 * 앱 웹뷰가 넘긴 rem 스케일을 첫 페인트 전에 반영한다.
 *
 * layout은 searchParams를 받지 못하고, 웹뷰 진입 페이지 두 개
 * (app-exam-screen, app-question-feedback)는 "use client" + useSearchParams라
 * 하이드레이션 이후에야 값이 잡힌다. 그 경로로 적용하면 글자 크기가 한 번 튄다.
 * body 첫 자식의 인라인 스크립트는 파싱 중 동기 실행되므로 깜빡임이 없다
 * (next-themes가 테마 적용에 쓰는 것과 같은 패턴이다).
 *
 * 기준이 16인 이유는 브라우저 기본 루트 font-size가 16px이기 때문이다.
 * 앱의 기준(14)과 숫자는 다르지만 각자 1.0에서 "현재와 동일"이라는 성질은 같다.
 *
 * 클램프 범위는 app-front-end의 src/theme/rem-scale.ts와 같아야 한다.
 * 쿼리는 신뢰할 수 없는 입력이므로 웹에서도 독립적으로 자른다.
 *
 * scale이 없으면 아무것도 하지 않으므로 일반 웹 방문자는 영향받지 않는다.
 */
const REM_SCALE_SCRIPT = `(function(){try{
var s=parseFloat(new URLSearchParams(location.search).get('scale'));
if(!isFinite(s))return;
s=Math.min(1.35,Math.max(0.92,s));
document.documentElement.style.fontSize=(16*s)+'px';
}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} ${jua.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script dangerouslySetInnerHTML={{ __html: REM_SCALE_SCRIPT }} />
        {/*
          모든 페이지에 싣는다. 하위 페이지의 구조화 데이터가 `@id`로 조직을 참조하는데,
          소비자는 한 페이지 안의 블록들만 하나의 그래프로 합치므로 참조가 항상 같은
          문서에서 풀려야 한다.
        */}
        <JsonLd data={ORGANIZATION_JSON_LD} />
        <JsonLd data={WEBSITE_JSON_LD} />
        <AnalyticsGate />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
