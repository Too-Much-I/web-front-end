"use client";

import { usePathname } from "next/navigation";

import { ClarityAnalytics } from "@/components/clarity-analytics";
import { GoogleAnalyticsTag } from "@/components/google-analytics";

/**
 * 웹 분석 도구(Microsoft Clarity, Google Analytics)를 웹 화면에서만 로드한다.
 *
 * app-* 라우트는 네이티브 앱이 웹뷰로 띄우는 화면이다. 여기에 웹 SDK를 그대로
 * 두면 같은 사용자가 네이티브 세션과 웹 세션으로 쪼개져 이용자 수가 중복
 * 집계되고 퍼널이 끊긴다. 앱 쪽 분석은 네이티브 SDK 하나로 모으고, 웹뷰
 * 화면의 이벤트는 브릿지로 넘기는 것이 맞다.
 *
 * 걷어내는 것은 웹 Clarity 스크립트이지 Clarity 자체가 아니다 — 앱은 Clarity를
 * 네이티브 SDK로 붙인다. 자세한 배경은 docs/app-settings-webview.md 참고.
 *
 * 접두사로 가르는 이유: 앱 웹뷰 라우트는 app-exam-screen,
 * app-question-feedback, app-settings처럼 이미 app- 접두사를 관례로 쓰고 있고,
 * 웹 라우트 중에는 이 접두사로 시작하는 것이 없다.
 */
export function AnalyticsGate() {
  const pathname = usePathname();

  if (pathname.startsWith("/app-")) return null;

  return (
    <>
      <ClarityAnalytics />
      <GoogleAnalyticsTag />
    </>
  );
}
