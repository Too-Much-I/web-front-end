import localFont from "next/font/local";

/** 프레젠테이션과 웹 전체에서 공유하는 단일 굵기 폰트. */
export const siteFont = localFont({
  src: "./cafe24-ssurround.woff2",
  variable: "--font-site",
  weight: "400",
  display: "swap",
  // 이 폰트는 en dash(U+2013)·em dash(U+2014) 자리에 빈 글리프만 들어 있어서
  // "1–2번"이 "1 2번"처럼 보인다. 글리프가 cmap에 있으면 브라우저가 대체 폰트로
  // 넘어가지 않으므로, unicode-range에서 두 글자를 빼 다음 폰트가 그리게 한다.
  declarations: [
    { prop: "unicode-range", value: "U+0000-2012, U+2015-10FFFF" },
  ],
});
