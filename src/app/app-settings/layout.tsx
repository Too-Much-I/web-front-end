import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * viewport-fit=cover가 없으면 iOS가 env(safe-area-inset-*)를 0으로 준다.
 * 아래 paddingBottom이 무효가 되어 홈 인디케이터가 본문 마지막 줄을 가린다.
 *
 * 루트 레이아웃이 아니라 이 세그먼트에만 선언하는 이유: cover는 레이아웃
 * 뷰포트를 노치·인디케이터 영역까지 넓히는 전역 설정이라, env() 대응이 없는
 * 랜딩·블로그·시험 화면까지 콘텐츠가 그 영역으로 들어갈 수 있다.
 */
export const viewport: Viewport = {
  viewportFit: "cover",
};

/**
 * 앱 설정 화면이 웹뷰로 띄우는 문서 페이지들의 공통 셸이다.
 *
 * 화면 상단의 뒤로가기와 타이틀바는 RN이 네이티브로 그린다. 그래서 여기서는
 * 상단 safe-area를 다루지 않고 하단 inset만 처리한다. 홈 인디케이터가 본문
 * 마지막 줄을 가리는 것만 막으면 된다.
 *
 * flex 컨테이너인 이유: 자식 main이 min-h-dvh를 잡으면 border-box 계산상
 * 문서 전체가 100dvh + inset이 되어 내용이 다 들어가도 스크롤이 생긴다.
 * 높이를 채워야 하는 화면(문의하기)은 min-h-dvh 대신 flex-1을 쓴다.
 *
 * font-jua를 쓰는 다른 app-* 레이아웃과 달리 기본 font-sans를 쓴다.
 * 장문의 법률 문서라 가독성이 우선이다.
 */
export default function AppSettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className="flex min-h-dvh flex-col bg-orange-50/40"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {children}
    </div>
  );
}
