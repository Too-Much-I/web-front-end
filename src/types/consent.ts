/** 동의 방식. 현재는 웹 다이얼로그 내 체크박스 동의만 존재한다. */
export type ConsentMethod = "web_checkbox";

/**
 * 음성 녹음 수집·이용 동의 1건의 기록.
 * 개인정보(이름/이메일/전화번호 등)는 포함하지 않고, 브라우저가 발급한 익명 식별자만 담는다.
 */
export interface VoiceConsentRecord {
  /** 개인정보를 포함하지 않는 익명 사용자 식별자 (브라우저 localStorage에 저장된 UUID). */
  anonymousId: string;
  /** 동의 항목명. 예: "음성 데이터 수집 및 이용 동의" */
  consentItem: string;
  /** 동의 문구 버전. 문구가 바뀌면 값을 올려서 어떤 버전에 동의했는지 추적한다. */
  consentVersion: string;
  /** 동의한 정확한 시각 (ISO 8601, UTC). */
  consentedAt: string;
  /** 동의 방식. */
  method: ConsentMethod;
}
