/**
 * 설문에서 응시권 발송용 연락처(전화번호/이메일)를 수집할 때 받는 개인정보 수집·이용 동의 문구.
 *
 * 문구를 수정할 때는 반드시 버전을 올린다. 버전이 다르면 "다른 내용에 동의"한 것으로 간주해
 * 과거 동의 기록과 구분해야 하기 때문이다 (src/features/consent/consent-content.ts의
 * 음성 동의와 같은 규칙). 동의 이력은 설문 시트의 동의 여부·버전 컬럼으로 보존된다.
 */
export const SURVEY_CONTACT_CONSENT_VERSION = "2026-07-16";

export const SURVEY_CONTACT_CONSENT_ITEM = "연락처 수집 및 이용 동의";

export const SURVEY_CONTACT_CONSENT_DETAILS: { title: string; body: string }[] =
  [
    {
      title: "수집 항목",
      body: "전화번호 또는 이메일 주소",
    },
    {
      title: "수집 및 이용 목적",
      body: "프리미엄형 모의고사 응시권 발송 및 정식 서비스 출시 등 서비스 소식 안내",
    },
    {
      title: "보유 및 이용 기간",
      body: "정식 서비스 출시 안내 시까지 보유하며, 최대 수집일로부터 3개월 이내 파기 (개인정보처리방침에 따름)",
    },
    {
      title: "동의 거부 권리 및 불이익 안내",
      body: "동의를 거부할 권리가 있으며, 동의하지 않아도 설문 제출은 가능합니다. 다만 연락처가 없으면 응시권을 보내드릴 수 없습니다.",
    },
  ];
