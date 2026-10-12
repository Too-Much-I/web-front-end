import localFont from "next/font/local";

/** 프레젠테이션과 웹 전체에서 공유하는 단일 굵기 폰트. */
export const siteFont = localFont({
  src: "./cafe24-ssurround.woff",
  variable: "--font-site",
  weight: "400",
  display: "swap",
});
