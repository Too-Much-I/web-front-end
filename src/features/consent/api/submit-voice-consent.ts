import type { VoiceConsentRecord } from "@/types/consent";

export class VoiceConsentSubmitError extends Error {}

/**
 * 동의 기록을 서버(구글 시트 연동 API 라우트, /api/consent)로 전송한다.
 * 백엔드(NEXT_PUBLIC_API_BASE_URL)가 아니라 이 Next.js 앱 자체의 API 라우트를 호출한다 —
 * 구글 서비스 계정 자격증명은 서버에서만 다뤄야 하므로 클라이언트가 구글 API를 직접 호출하지 않는다.
 */
export async function submitVoiceConsent(
  record: VoiceConsentRecord,
): Promise<void> {
  const res = await fetch("/api/consent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new VoiceConsentSubmitError(
      body || "동의 기록 저장에 실패했습니다.",
    );
  }
}
