/**
 * 문구를 수정할 때는 반드시 버전을 올린다. 버전이 다르면 "다른 내용에 동의"한 것으로 간주해
 * 과거 동의 기록과 구분해야 하기 때문이다 (개인정보보호법상 동의 이력 추적 요건).
 *
 * TODO(법무 검토 필요): 보관 기간과 위탁·제3자 제공 여부는 실제 인프라(채점 API 제공사,
 * 스토리지 보관 정책)가 확정된 뒤 정확한 값으로 교체해야 한다. 현재 값은 placeholder다.
 */
export const VOICE_CONSENT_VERSION = "2026-07-08";

export const VOICE_CONSENT_ITEM = "음성 데이터 수집 및 이용 동의";

export const VOICE_CONSENT_SUMMARY =
  "음성 답변을 녹음해 AI 채점에 활용하는 것에 동의합니다.";

export const VOICE_CONSENT_DETAILS: { title: string; body: string }[] = [
  {
    title: "수집 항목",
    body: "모의고사 응시 중 녹음되는 답변 음성 데이터",
  },
  {
    title: "수집 및 이용 목적",
    body: "AI를 이용한 스피킹 답변 자동 채점, 채점 결과·피드백 제공, 서비스 품질 개선",
  },
  {
    title: "보유 및 이용 기간",
    body: "채점 결과 제공 등 목적 달성 후 30일 이내 파기 (별도 개인정보처리방침에 따름)",
  },
  {
    title: "동의 거부 권리 및 불이익 안내",
    body: "동의를 거부할 권리가 있으나, 음성 답변 채점은 서비스의 핵심 기능이므로 동의하지 않을 경우 모의고사 응시가 제한됩니다.",
  },
];
