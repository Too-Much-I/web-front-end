import { NextResponse, type NextRequest } from "next/server";

import { detectMobilePlatform } from "@/lib/mobile-platform";
import { APP_STORE_URL, PLAY_STORE_URL, SITE_URL } from "@/lib/site-config";

/**
 * 기기에 맞는 스토어로 보내는 고정 주소. 친구 초대 페이지(/join)를 노트북에서 열었을 때
 * 보여주는 QR이 이 주소를 담는다(public/qr/download-app.svg).
 *
 * QR에는 추천 코드를 넣지 않는다. 코드는 노트북 화면에 그대로 보이니 앱을 받은 뒤 보고
 * 입력하면 되고, 덕분에 QR은 사람마다 새로 그릴 필요 없이 이미지 한 장으로 끝난다.
 * 그래서 이 주소를 바꾸면 QR 이미지도 다시 만들어야 한다.
 */

/** UA 헤더를 읽으므로 정적으로 미리 렌더될 수 없다. */
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const platform = detectMobilePlatform(
    request.headers.get("user-agent") ?? "",
  );

  // 휴대폰이 아니면 설치할 기기가 없으니 앱 소개가 있는 랜딩으로 보낸다.
  const destination =
    platform === "ios"
      ? APP_STORE_URL
      : platform === "android"
        ? PLAY_STORE_URL
        : `${SITE_URL}/`;

  // 도착지는 언제든 바뀔 수 있으므로 영구 리다이렉트(308)로 캐시되면 안 된다.
  return NextResponse.redirect(destination, 302);
}
