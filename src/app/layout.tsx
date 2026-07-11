import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ClarityAnalytics } from "@/components/clarity-analytics";
import { SITE_URL } from "@/lib/site-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const TITLE = "토선생 - 토익 스피킹 AI 모의고사 채점";
const DESCRIPTION =
  "토선생은 실제 토익 스피킹 시험과 동일한 유형의 문제로 모의고사를 보고, AI가 발음·유창성·문법·어휘를 공식 채점 기준으로 분석해 즉시 피드백을 주는 서비스예요.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "토선생",
    images: ["/logo.png"],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ClarityAnalytics />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
