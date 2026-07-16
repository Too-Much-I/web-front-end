import { google } from "googleapis";
import { NextResponse } from "next/server";
import { z } from "zod";

import { SURVEY_CONTACT_CONSENT_VERSION } from "@/features/survey/survey-contact-consent";
import { createIpRateLimiter } from "@/lib/rate-limit";

/**
 * 만족도 설문 1건을 구글 시트에 한 행으로 추가한다.
 * 구글 서비스 계정 자격증명은 서버 전용 env로만 다룬다 (NEXT_PUBLIC_* 아님 — 클라이언트 번들에 노출 금지).
 *
 * 필요한 env:
 * - GOOGLE_SERVICE_ACCOUNT_EMAIL: 서비스 계정 이메일
 * - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: 서비스 계정 private key (개행은 \n으로 이스케이프해서 저장)
 * - GOOGLE_SURVEY_SHEET_ID: 설문 기록을 쌓을 구글 시트 ID
 * - GOOGLE_SURVEY_SHEET_RANGE: (선택) 시트/범위. 기본값 "Survey!A:G"
 *
 * 시트는 서비스 계정 이메일을 "편집자"로 공유해야 쓰기가 가능하다.
 *
 * source(전체/맛보기 구분) 컬럼은 H열에, 연락처 수집 동의 여부·동의 문구 버전은 I·J열에
 * 추가된다. append의 range는 표를 찾는 용도일 뿐 실제로 쓰이는 값 개수를 제한하지 않으므로,
 * range를 "Survey!A:G"로 유지해도 H~J열까지 그대로 써진다 — 이 컬럼들을 위해
 * GOOGLE_SURVEY_SHEET_RANGE를 바꿀 필요는 없다.
 */

const surveyRecordSchema = z
  .object({
    anonymousId: z.string().min(1),
    satisfaction: z.number().int().min(1).max(5),
    previousGrade: z.string().nullable(),
    priceWillingness: z.string().nullable(),
    opinion: z.string(),
    contact: z.string(),
    // 동의 버전은 현재 문구 버전과 정확히 일치해야 한다 — 구버전 문구에 대한 동의를
    // 현행 동의로 받아주지 않기 위함 (consent 라우트의 z.literal 검증과 같은 규칙).
    contactConsent: z.boolean(),
    contactConsentVersion: z.literal(SURVEY_CONTACT_CONSENT_VERSION).nullable(),
    submittedAt: z.iso.datetime(),
    source: z.enum(["trial", "full"]),
  })
  .superRefine((data, ctx) => {
    // 연락처(개인정보)는 수집·이용 동의 없이는 저장하면 안 된다. 클라이언트 검증을
    // 우회한 요청도 여기서 걸러낸다.
    if (data.contact.trim() !== "" && !data.contactConsent) {
      ctx.addIssue({
        code: "custom",
        path: ["contactConsent"],
        message: "연락처 수집·이용 동의 없이 연락처를 저장할 수 없습니다.",
      });
    }
    if (data.contactConsent && data.contactConsentVersion === null) {
      ctx.addIssue({
        code: "custom",
        path: ["contactConsentVersion"],
        message: "동의 문구 버전이 누락되었습니다.",
      });
    }
  });

// 단일 인스턴스 기준 IP당 요청 제한 (PoC 배포 범위 한정 — 다중 인스턴스 환경에서는 공유 스토어로 교체 필요)
const rateLimiter = createIpRateLimiter({ windowMs: 60_000, maxRequests: 5 });

// 구글 시트 API 응답이 지연될 때 서버리스 함수가 무기한 붙잡혀 있지 않도록 상한을 둔다.
const GOOGLE_SHEETS_TIMEOUT_MS = 8_000;

function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (rateLimiter.isRateLimited(ip)) {
    return NextResponse.json(
      { message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
  }

  const parsed = surveyRecordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: "잘못된 설문 기록 형식입니다." },
      { status: 400 },
    );
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const sheetId = process.env.GOOGLE_SURVEY_SHEET_ID;
  const range = process.env.GOOGLE_SURVEY_SHEET_RANGE ?? "Survey!A:G";

  if (!email || !privateKey || !sheetId) {
    console.error("[survey] Google Sheets env vars are not configured.");
    return NextResponse.json(
      { message: "설문 저장소가 아직 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  const {
    anonymousId,
    satisfaction,
    previousGrade,
    priceWillingness,
    opinion,
    contact,
    contactConsent,
    contactConsentVersion,
    submittedAt,
    source,
  } = parsed.data;

  try {
    const auth = new google.auth.JWT({
      email,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append(
      {
        spreadsheetId: sheetId,
        range,
        valueInputOption: "RAW",
        requestBody: {
          values: [
            [
              anonymousId,
              satisfaction,
              previousGrade ?? "",
              priceWillingness ?? "",
              opinion,
              contact,
              submittedAt,
              source === "trial" ? "맛보기" : "전체모의고사",
              contactConsent ? "동의" : "",
              contactConsentVersion ?? "",
            ],
          ],
        },
      },
      { timeout: GOOGLE_SHEETS_TIMEOUT_MS },
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[survey] Failed to append survey record to Google Sheets", error);
    return NextResponse.json(
      { message: "설문 저장 중 오류가 발생했습니다." },
      { status: 502 },
    );
  }
}
