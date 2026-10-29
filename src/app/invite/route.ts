import { NextResponse, type NextRequest } from "next/server";

import { buildJoinUrl } from "@/features/invite/join-url";

/**
 * 코드 없이 /invite로 들어오거나 쿼리로 넘긴 경우(/invite?code=...)도 초대 페이지로 보낸다.
 * 앱이 공유하는 형식은 /invite/<추천 코드>다(src/app/invite/[code]/route.ts).
 */
export function GET(request: NextRequest) {
  return NextResponse.redirect(
    buildJoinUrl(request.nextUrl.searchParams.get("code")),
    302,
  );
}
