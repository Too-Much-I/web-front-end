import { google } from "googleapis";
import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * 동의 기록 1건을 구글 시트에 한 행으로 추가한다.
 * 구글 서비스 계정 자격증명은 서버 전용 env로만 다룬다 (NEXT_PUBLIC_* 아님 — 클라이언트 번들에 노출 금지).
 *
 * 필요한 env:
 * - GOOGLE_SERVICE_ACCOUNT_EMAIL: 서비스 계정 이메일
 * - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: 서비스 계정 private key (개행은 \n으로 이스케이프해서 저장)
 * - GOOGLE_CONSENT_SHEET_ID: 동의 기록을 쌓을 구글 시트 ID
 * - GOOGLE_CONSENT_SHEET_RANGE: (선택) 시트/범위. 기본값 "Consent!A:E"
 *
 * 시트는 서비스 계정 이메일을 "편집자"로 공유해야 쓰기가 가능하다.
 */

const consentRecordSchema = z.object({
  anonymousId: z.string().min(1),
  consentItem: z.string().min(1),
  consentVersion: z.string().min(1),
  consentedAt: z.string().min(1),
  method: z.literal("web_checkbox"),
});

export async function POST(request: Request) {
  const parsed = consentRecordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: "잘못된 동의 기록 형식입니다." },
      { status: 400 },
    );
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const sheetId = process.env.GOOGLE_CONSENT_SHEET_ID;
  const range = process.env.GOOGLE_CONSENT_SHEET_RANGE ?? "Consent!A:E";

  if (!email || !privateKey || !sheetId) {
    console.error("[consent] Google Sheets env vars are not configured.");
    return NextResponse.json(
      { message: "동의 기록 저장소가 아직 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  const { anonymousId, consentItem, consentVersion, consentedAt, method } = parsed.data;

  try {
    const auth = new google.auth.JWT({
      email,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range,
      valueInputOption: "RAW",
      requestBody: {
        values: [[anonymousId, consentItem, consentedAt, method, consentVersion]],
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[consent] Failed to append consent record to Google Sheets", error);
    return NextResponse.json(
      { message: "동의 기록 저장 중 오류가 발생했습니다." },
      { status: 502 },
    );
  }
}
