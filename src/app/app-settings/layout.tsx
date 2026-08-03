import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * 앱 설정 화면이 웹뷰로 띄우는 문서 페이지들의 공통 셸이다.
 *
 * 화면 상단의 뒤로가기와 타이틀바는 RN이 네이티브로 그린다. 그래서 여기서는
 * 상단 safe-area를 다루지 않고 하단 inset만 처리한다. 홈 인디케이터가 본문
 * 마지막 줄을 가리는 것만 막으면 된다.
 *
 * font-jua를 쓰는 다른 app-* 레이아웃과 달리 기본 font-sans를 쓴다.
 * 장문의 법률 문서라 가독성이 우선이다.
 */
export default function AppSettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className="min-h-dvh bg-orange-50/40"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {children}
    </div>
  );
}
