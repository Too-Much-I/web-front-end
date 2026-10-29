import { NextResponse, type NextRequest } from "next/server";

import { buildJoinUrl } from "@/features/invite/join-url";

/**
 * 앱 '공유하기'가 메시지에 넣는 초대 링크: /invite/<추천 코드>
 *
 * UTM을 붙여 초대 페이지(/join)로 넘긴다(이유는 buildJoinUrl 주석).
 * 카카오톡 등의 링크 미리보기 크롤러도 이 리다이렉트를 따라가 /join의 OG 정보를 읽는다.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  // 초대 페이지 주소나 UTM 값은 바뀔 수 있으므로 영구 리다이렉트(308)로 캐시되면 안 된다.
  return NextResponse.redirect(buildJoinUrl(code), 302);
}
