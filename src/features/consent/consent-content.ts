/**
 * 문구를 수정할 때는 반드시 버전을 올린다. 버전이 다르면 "다른 내용에 동의"한 것으로 간주해
 * 과거 동의 기록과 구분해야 하기 때문이다 (개인정보보호법상 동의 이력 추적 요건).
 *
 * 2026-08-16: 채점 파이프라인이 확정되어 위탁·국외이전 항목을 채웠다. 전 문항은 Azure AI
 * Speech(koreacentral, 국내)로 발음·유창성을 분석하고, 3~11번 문항은 OpenAI(미국)로 보내
 * 텍스트로 변환한 뒤 그 전사문으로 채점·피드백을 생성한다. 웹 개인정보처리방침
 * (`src/app/privacy/page.tsx`)과 앱 개인정보처리방침
 * (`src/app/app-settings/privacy/page.tsx`)의 제5·6조가 같은 사실을 가리켜야 하므로 한쪽만
 * 고치지 않는다.
 */
export const VOICE_CONSENT_VERSION = "2026-08-16";

export const VOICE_CONSENT_ITEM = "음성 데이터 수집 및 이용 동의";

export const VOICE_CONSENT_SUMMARY =
  "음성 답변을 녹음해 AI 채점에 활용하는 것에 동의합니다.";

export const VOICE_CONSENT_DETAILS: { title: string; body: string }[] = [
  {
    title: "수집 항목",
    body: "모의고사 응시 중 녹음되는 답변 음성 데이터, 답변 음성을 변환한 전사문",
  },
  {
    title: "수집 및 이용 목적",
    body: "AI를 이용한 스피킹 답변 자동 채점, 채점 결과·피드백 제공",
  },
  {
    title: "처리 위탁",
    body: "채점 수행을 위해 Microsoft(Azure AI Speech, 국내 리전)와 OpenAI에 답변 음성 및 전사문의 처리를 위탁합니다. 위탁받은 사업자는 채점 목적으로만 처리하며, 인공지능 모델 학습에는 이용하지 않습니다.",
  },
  {
    title: "국외 이전",
    body: "3번~11번 문항의 답변 음성과 전사문이 음성 인식 및 채점 생성을 위해 OpenAI, L.L.C.(미국, privacy@openai.com)로 이전됩니다. 발음·유창성 분석은 국내 리전에서 처리되어 국외로 이전되지 않습니다.",
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
