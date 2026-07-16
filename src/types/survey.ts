/**
 * 시험 후 만족도 설문 1건의 기록.
 * 개인정보로는 연락처(전화번호/이메일)만 선택적으로 포함하며, 그 외는 익명 식별자로 연결한다.
 */
export interface ExamSurveyRecord {
  /** 개인정보를 포함하지 않는 익명 사용자 식별자 (브라우저 localStorage에 저장된 UUID). */
  anonymousId: string;
  /** 만족도 별점 (1~5, 필수). */
  satisfaction: number;
  /** 이전 실제 응시 등급 id (TARGET_GRADE_OPTIONS의 id 또는 "none"). 미선택 시 null. */
  previousGrade: string | null;
  /** 지불 의향 금액 id (PRICE_OPTIONS의 id). 미선택 시 null. */
  priceWillingness: string | null;
  /** 자유 의견. 미입력 시 빈 문자열. */
  opinion: string;
  /** 응시권 발송용 연락처 (전화번호 또는 이메일). 미입력 시 빈 문자열. */
  contact: string;
  /**
   * 연락처 수집·이용 동의 여부. 연락처가 비어 있지 않으면 반드시 true여야 한다
   * (서버에서도 교차 검증). 연락처 미입력 시에는 항상 false.
   */
  contactConsent: boolean;
  /** 동의한 연락처 수집·이용 동의 문구의 버전 (SURVEY_CONTACT_CONSENT_VERSION). 미동의 시 null. */
  contactConsentVersion: string | null;
  /** 제출한 정확한 시각 (ISO 8601, UTC). */
  submittedAt: string;
  /** 전체 모의고사(응시권 3회) vs 맛보기(응시권 1회) — 운영팀이 보상 수량을 구분해서 발송하기 위한 필드. */
  source: "trial" | "full";
}
