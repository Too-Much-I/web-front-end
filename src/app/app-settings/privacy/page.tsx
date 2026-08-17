import { AppDocLayout } from "@/components/app-settings/app-doc-layout";
import { LegalSection } from "@/components/legal/legal-page-layout";

export const metadata = {
  title: "개인정보처리방침 | 토선생",
};

const CONTACT_EMAIL = "tosunsaeng093@gmail.com";
// 개인정보 보호법 제30조 제1항 제5호는 "성명 또는 부서의 명칭"을 요구한다.
// 성명과 담당부서를 함께 적어 어느 쪽 기준으로도 충족되게 한다.
const PRIVACY_OFFICER_NAME = "송성환";
// 앱 출시일에 맞춰 갱신한다. 웹 방침(2026년 7월 10일)과 본문이 다르므로
// 시행일도 따로 관리한다.
const EFFECTIVE_DATE = "2026년 8월 15일";

// Amplitude 프로젝트 콘솔의 데이터 보존(retention) 설정과 반드시 같은 값이어야 한다.
// 개인정보 보호법 제28조의8 제2항은 국외 이전 시 "이전받는 자의 보유·이용 기간"을
// 특정해 고지하도록 요구하므로, 콘솔에서 보존 기간을 바꾸면 이 상수도 함께 고쳐야 한다.
const AMPLITUDE_RETENTION = "24개월";

// 채점 파이프라인(2026년 8월 기준). 제5·6조는 이 구성을 그대로 옮긴 것이므로
// 파이프라인이 바뀌면 두 조를 함께 고쳐야 한다.
//
//   1. Azure AI Speech (STT + Pronunciation Assessment) — 전 문항 음성의
//      발음·유창성 분석. 운영 리전이 koreacentral이라 국외 이전이 아니다.
//      제5조(위탁)에만 적고 제6조(국외 이전)에서는 뺀다.
//   2. OpenAI Audio Transcriptions API (gpt-transcribe) — Q3~Q11 음성을
//      텍스트로 변환. 미국으로 이전된다.
//   3. OpenAI Responses API — 전사문으로 채점·피드백 생성. 음성이 아니라
//      텍스트가 나가므로 제3조 처리 항목에 "전사문"을 따로 적었다.

/**
 * 국외 이전 한 건을 개인정보 보호법 제28조의8 제2항이 요구하는 6개 항목
 * (항목 / 국가 · 시기 · 방법 / 이전받는 자와 연락처 / 목적 / 보유·이용 기간 /
 * 거부 방법)으로 나눠 보여준다.
 *
 * 표가 아니라 블록으로 두는 이유: 6개 항목을 열로 펼치면 앱 웹뷰의 좁은 화면에서
 * 가로 스크롤이 생겨 읽기 어렵다. 거부 방법은 수탁자별로 효과가 달라 이 블록
 * 밖에 목록으로 따로 적는다.
 */
function CrossBorderTransfer({
  recipient,
  contact,
  country,
  items,
  purpose,
  method,
  period,
}: {
  recipient: string;
  contact: string;
  country: string;
  items: string;
  purpose: string;
  method: string;
  period: string;
}) {
  const rows = [
    { label: "이전받는 자", value: recipient },
    { label: "연락처", value: contact },
    { label: "이전되는 국가", value: country },
    { label: "이전되는 항목", value: items },
    { label: "이전받는 자의 이용 목적", value: purpose },
    { label: "이전 시기 및 방법", value: method },
    { label: "이전받는 자의 보유·이용 기간", value: period },
  ];

  return (
    <div className="rounded-lg border border-orange-200/60 bg-white px-4 py-3">
      <dl className="flex flex-col gap-2">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-0.5 sm:flex-row">
            <dt className="font-semibold text-blue-950 sm:w-56 sm:shrink-0">
              {row.label}
            </dt>
            <dd className="sm:flex-1">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function AppPrivacyPolicyPage() {
  return (
    <AppDocLayout
      title="개인정보처리방침"
      effectiveDateLabel={`시행일자: ${EFFECTIVE_DATE}`}
      intro={
        <>
          토선생(이하 &ldquo;서비스&rdquo;)은 이용자의 개인정보를 중요시하며,
          「개인정보 보호법」 등 관련 법령과 개인정보보호위원회의 「개인정보
          처리방침 작성지침(2025. 4.)」을 준수합니다. 서비스는 아래와 같이
          개인정보를 처리하며, 이를 개인정보처리방침을 통해 공개합니다.
        </>
      }
    >
      <LegalSection title="제1조 (개인정보의 처리 목적)">
        <p>서비스는 다음의 목적을 위하여 개인정보를 처리합니다.</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            모의고사 응시자 식별 및 서비스 제공: 회원가입·로그인 절차 없이 앱이
            기기에 저장하는 설치 식별자와 인증 토큰을 통해 이용자를 구분하고
            응시 기록, 학습 기록 및 동의 이력을 연결
          </li>
          <li>
            음성 답변 녹음 파일을 활용한 AI 자동 채점 및 채점 결과·피드백 제공
          </li>
          <li>
            채점 품질 및 안전성 개선(선택 동의 항목): 채점이 정상적으로
            이루어지지 않거나 오류가 발생한 경우 그 원인을 확인하고, 채점의
            기준·절차와 결과를 검토하여 채점 정확도를 높이고 부적절한 채점
            결과가 생성되지 않도록 개선. 이 목적에 한하여 서비스의 담당자가 해당
            답변 음성과 전사문을 직접 확인할 수 있습니다. 다만 이 목적으로 답변
            음성을 인공지능 모델의 학습 데이터로 이용하지는 않습니다.
          </li>
          <li>음성 데이터 수집·이용 등 서비스 이용 동의 이력의 관리</li>
          <li>서비스 이용 통계 분석 및 사용성 개선</li>
          <li>문의 응대 및 민원 처리</li>
        </ol>
      </LegalSection>

      <LegalSection title="제2조 (개인정보의 처리 및 보유 기간)">
        <p>
          서비스는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터
          개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를
          처리·보유합니다. 각 개인정보 처리 항목별 보유 기간은 다음과 같습니다.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            설치 식별자: 이용자가 앱의 「모든 학습 기록 삭제」를 실행하거나 앱을
            기기에서 삭제하는 경우 기기에 저장된 식별자는 즉시 파기하며, 서버에
            저장된 식별자는 학습 기록의 파기와 함께 파기
          </li>
          <li>
            인증 토큰(액세스 토큰, 리프레시 토큰): 토큰 만료 시 파기하며,
            이용자가 앱의 「모든 학습 기록 삭제」를 실행하거나 앱을 기기에서
            삭제하는 경우 기기에 저장된 토큰은 즉시 파기
          </li>
          <li>
            학습 기록(응시 이력, 채점 결과, 피드백): 이용자가 「모든 학습 기록
            삭제」를 실행하거나 삭제를 요청할 때까지 기기와 서버에 보관하며,
            삭제 시 양쪽에서 모두 지체 없이 파기
          </li>
          <li>
            음성 답변 녹음 파일: AI 채점 및 결과 제공 등 수집 목적 달성 후 30일
            이내 파기. 채점 과정에서 제5조의 사업자에게 전송된 음성은 해당
            사업자가 위탁받은 처리를 마친 뒤 각 사업자의 정책에 따라 삭제
          </li>
          <li>
            전사문(답변 음성을 변환한 텍스트): 채점 결과와 함께 학습 기록의
            일부로 보관하며, 학습 기록과 같은 시점에 파기
          </li>
          <li>
            동의 이력(인증 토큰, 동의 항목·버전·일시·방법): 동의 철회 또는 삭제
            요청 시 지체 없이 파기하며, 별도 요청이 없는 경우 최종 동의일로부터
            3년간 보관 후 파기
          </li>
          <li>
            앱 이용 행태정보(Microsoft Clarity): 세션 재생 데이터는 최대 30일,
            화면 이동·터치 등 집계 데이터는 최대 9개월간 보관(제10조 참조)
          </li>
          <li>
            앱 기능 이용 통계(Amplitude): 화면 이동 기록과 모의고사 시작·완료 등
            주요 기능의 이용 시점 기록을 수집일로부터 {AMPLITUDE_RETENTION}간
            보관 후 파기(제10조 참조)
          </li>
          <li>
            접속 IP 주소, 서비스 이용 기록, 기기·운영체제 정보, 앱 버전: 서비스
            운영 및 장애 대응 목적으로 수집일로부터 3개월간 보관 후 파기
          </li>
          <li>
            오류 진단 기록(Sentry): 오류가 발생한 시점의 기기·운영체제 정보, 앱
            버전, 오류 코드 및 발생 위치, 오류 발생 직전의 화면 이동 기록을
            수집일로부터 90일간 보관 후 자동 삭제(제10조 참조)
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="제3조 (처리하는 개인정보의 항목)">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            모의고사 응시 시 수집: 음성 답변 녹음 파일, 동의 항목·일시·방법·버전
          </li>
          <li>
            채점 과정에서 생성: 답변 음성을 텍스트로 변환한 전사문, 채점 결과 및
            피드백
          </li>
          <li>
            앱 설치 및 이용 과정에서 자동으로 생성·수집: 설치 식별자(앱이 설치
            시점에 무작위로 생성하는 임의의 문자열), 인증 토큰(액세스 토큰,
            리프레시 토큰), 접속 IP 주소, 서비스 이용 기록, 기기·운영체제 정보,
            앱 버전, 앱 이용 행태정보(화면 이동 경로, 터치·스크롤 등 화면 조작
            기록), 주요 기능 이용 기록(모의고사 시작·완료, 채점 완료, 피드백
            조회, 재답변 제출 등이 일어난 시점과 순서), 오류 진단 기록(오류 코드
            및 발생 위치, 오류 발생 직전의 화면 이동 기록)
          </li>
        </ol>
        <p>
          서비스는 회원가입 절차를 두지 않으며 이름, 생년월일, 성별, 연락처 등의
          정보를 수집하지 않습니다. 또한 광고 식별자(Android 광고 ID, iOS IDFA),
          전화번호, 연락처 목록, 위치정보, 사진·동영상 등 기기에 저장된 다른
          정보에는 접근하지 않으며, 마이크는 이용자가 권한을 허용한 경우
          모의고사 응시와 마이크 테스트 중에만 사용합니다.
        </p>
        <p>
          설치 식별자와 인증 토큰은 그 자체로 이름·연락처 등 특정 개인을 알아볼
          수 있는 정보를 담고 있지 않으나, 특정 이용자의 응시 기록과 학습 기록을
          지속적으로 연결하는 식별자로 기능하므로 서비스는 이를 개인정보에
          준하여 보호합니다. 접속 IP 주소는 서비스가 별도로 수집·기록하기 위한
          항목이 아니라 앱과 서버 간 통신 과정에서 서버 및 아래 수탁자의 접속
          기록에 자동으로 남는 정보이며, 서비스 운영과 장애 대응 목적으로만
          이용합니다.
        </p>
      </LegalSection>

      <LegalSection title="제4조 (개인정보의 제3자 제공)">
        <p>
          서비스는 정보주체의 개인정보를 제1조에서 명시한 목적 범위 내에서만
          처리하며, 원칙적으로 정보주체의 동의 없이는 개인정보를 외부에 제공하지
          않습니다. 다만 정보주체의 별도 동의가 있거나 법령에 특별한 규정이 있는
          경우는 예외로 합니다.
        </p>
      </LegalSection>

      <LegalSection title="제5조 (개인정보 처리의 위탁)">
        <p>
          서비스는 원활한 업무 처리를 위하여 아래와 같이 개인정보 처리업무를
          위탁하고 있으며, 관계 법령에 따라 위탁계약 시 개인정보가 안전하게
          관리될 수 있도록 필요한 사항을 규정합니다.
        </p>
        <div className="overflow-x-auto rounded-lg border border-orange-200/60">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-orange-50 text-zinc-700">
              <tr>
                <th className="px-3 py-2 font-semibold">수탁자</th>
                <th className="px-3 py-2 font-semibold">위탁업무 내용</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100">
              <tr>
                <td className="px-3 py-2 align-top">MongoDB, Inc.</td>
                <td className="px-3 py-2 align-top">
                  설치 식별자, 인증 토큰, 동의 이력 및 학습 기록의
                  저장·관리(MongoDB Atlas, 국내 리전)
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 align-top">Microsoft Corporation</td>
                <td className="px-3 py-2 align-top">
                  앱 이용 행태 분석(Microsoft Clarity)
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 align-top">Amplitude, Inc.</td>
                <td className="px-3 py-2 align-top">
                  앱 기능 이용 통계 분석(Amplitude)
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 align-top">
                  Functional Software, Inc. (Sentry)
                </td>
                <td className="px-3 py-2 align-top">
                  앱 오류 진단 및 안정성 모니터링(Sentry)
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 align-top">
                  Amazon Web Services, Inc.
                </td>
                <td className="px-3 py-2 align-top">
                  음성 답변 녹음 파일의 저장(클라우드 스토리지, 국내 리전)
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 align-top">Microsoft Corporation</td>
                <td className="px-3 py-2 align-top">
                  전 문항 답변 음성의 음성 인식 및 발음·유창성 분석(Azure AI
                  Speech, 국내 리전)
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 align-top">OpenAI, L.L.C.</td>
                <td className="px-3 py-2 align-top">
                  3번~11번 문항 답변 음성의 텍스트 변환, 변환된 전사문을 이용한
                  채점 및 피드백 생성
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          채점 절차를 총괄하고 이용자에게 제공할 최종 결과를 구성하는 백엔드
          서버는 서비스 운영팀이 직접 운영합니다. 다만 채점의 개별 단계는 위
          표의 사업자가 제공하는 인공지능 서비스를 이용하여 아래 순서로
          수행합니다.
        </p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            전 문항의 답변 음성을 Azure AI Speech로 보내 발음과 유창성을
            분석합니다. 이 처리는 국내 리전(koreacentral)에서 이루어집니다.
          </li>
          <li>
            3번~11번 문항의 답변 음성을 OpenAI의 음성 인식 서비스로 보내
            텍스트로 변환합니다.
          </li>
          <li>
            변환된 전사문을 OpenAI의 언어모델 서비스로 보내 채점 결과와 피드백
            문구를 생성합니다. 이 단계에는 음성이 아니라 텍스트만 전송됩니다.
          </li>
        </ol>
        <p>
          서비스는 이들 사업자와 개인정보 처리 목적을 채점 수행으로 한정하는
          계약을 체결하며, 전송된 음성과 전사문이 해당 사업자의 인공지능 모델
          학습에 이용되지 않도록 요구합니다.
        </p>
      </LegalSection>

      <LegalSection title="제6조 (개인정보의 국외 이전)">
        <p>
          서비스는 아래와 같이 개인정보를 국외로 이전하고 있으며, 모든 이전은
          이용자에게 서비스를 제공하기 위한 처리 위탁에 해당합니다. 다만 각
          이전이 서비스에서 담당하는 역할은 다음과 같이 다릅니다.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            답변 음성과 전사문의 이전은 모의고사 채점과 채점 결과·피드백 제공,
            즉 이용계약의 이행에 직접 필요한 처리입니다.
          </li>
          <li>
            이용 행태, 기능 이용 통계, 오류 진단 기록의 이전은 서비스를
            안정적으로 운영하고 개선하기 위한 처리입니다. 이 이전을 중단하더라도
            모의고사 응시와 채점 결과·피드백 제공에는 영향이 없습니다.
          </li>
        </ul>

        <CrossBorderTransfer
          recipient="OpenAI, L.L.C."
          contact="privacy@openai.com"
          country="미국"
          items="3번~11번 문항의 답변 음성 녹음 파일, 답변 음성을 변환한 전사문"
          purpose="답변 음성의 텍스트 변환 및 전사문을 이용한 채점 결과·피드백 생성"
          method="모의고사 채점이 진행되는 시점에 네트워크를 통해 전송"
          period="채점 처리 완료 후 OpenAI의 정책에 따라 삭제하며, 서비스는 전송된 음성과 전사문이 OpenAI의 인공지능 모델 학습에 이용되지 않도록 요구합니다."
        />

        <CrossBorderTransfer
          recipient="Microsoft Corporation"
          contact="Microsoft 개인정보 보호 문의 창구(privacy.microsoft.com)"
          country="미국 등 Microsoft가 데이터를 처리하는 국가"
          items="기기 식별자, 화면 이동 경로, 터치·스크롤 등 행태정보"
          purpose="앱 사용성 분석(Microsoft Clarity)"
          method="앱 이용 시점에 네트워크를 통해 실시간 전송"
          period="세션 재생 데이터는 최대 30일, 집계 데이터는 최대 9개월"
        />

        <CrossBorderTransfer
          recipient="Amplitude, Inc."
          contact="privacy@amplitude.com"
          country="미국"
          items="Amplitude가 자동으로 생성하는 기기 식별자, 화면 이동 기록, 주요 기능 이용 기록(모의고사 시작·완료, 채점 완료, 피드백 조회, 재답변 제출 등이 일어난 시점과 순서), 기기·운영체제 정보, 앱 버전"
          purpose="앱 기능 이용 통계 분석 및 사용성 개선"
          method="앱 이용 시점에 네트워크를 통해 실시간 전송"
          period={`수집일로부터 ${AMPLITUDE_RETENTION}`}
        />

        <CrossBorderTransfer
          recipient="Functional Software, Inc. (Sentry)"
          contact="compliance@sentry.io"
          country="미국"
          items="기기·운영체제 정보, 앱 버전, 오류 코드 및 발생 위치, 오류 발생 직전의 화면 이동 기록"
          purpose="앱 오류 진단 및 안정성 모니터링"
          method="오류가 발생한 시점에 네트워크를 통해 전송"
          period="수집일로부터 90일"
        />

        <p>
          발음·유창성 분석에 이용하는 Azure AI Speech는 국내
          리전(koreacentral)에서 운영되므로 해당 처리에는 국외 이전이 발생하지
          않습니다. 서비스가 보관하는 답변 음성 녹음 파일의 원본(AWS
          ap-northeast-2)과 설치 식별자·인증 토큰·동의 이력·학습 기록(MongoDB
          Atlas)도 모두 국내 리전에 위치한 서버에 저장되며 국외로 이전되지
          않습니다.
        </p>
        <p>
          위 국외 이전에 대해 거부하고자 하는 경우, 다음과 같이 거부할 수
          있습니다.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            OpenAI(답변 음성 및 전사문): 제11조의 연락처로 거부 의사를 밝힐 수
            있습니다. 다만 음성의 텍스트 변환과 채점·피드백 생성은 서비스의 핵심
            기능을 구성하는 단계이므로, 거부하는 경우 3번~11번 문항에 대한 채점
            결과와 피드백을 제공받을 수 없습니다.
          </li>
          <li>
            Microsoft Clarity(행태정보): 제10조의 거부 방법을 통해 수집을 중단할
            수 있으며, 중단하더라도 모의고사 응시 등 핵심 기능 이용에는 제한이
            없습니다.
          </li>
          <li>
            Amplitude(기능 이용 통계): 제10조의 거부 방법을 통해 수집을 중단할
            수 있으며, 중단하더라도 모의고사 응시 등 핵심 기능 이용에는 제한이
            없습니다.
          </li>
          <li>
            Sentry(오류 진단 기록): 제10조의 거부 방법을 통해 수집을 중단할 수
            있으며, 중단하더라도 모의고사 응시 등 핵심 기능 이용에는 제한이
            없습니다. 다만 오류 발생 시 원인 파악과 수정이 늦어질 수 있습니다.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="제7조 (정보주체와 법정대리인의 권리·의무 및 행사방법)">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            정보주체는 서비스에 대해 언제든지 개인정보 열람·정정·삭제·처리정지
            요구 및 동의 철회 등의 권리를 행사할 수 있습니다.
          </li>
          <li>
            권리 행사는 제11조의 연락처로 이메일을 통해 요청할 수 있으며,
            서비스는 지체 없이 조치합니다.
          </li>
          <li>
            이용자는 별도의 요청 없이도 앱의 설정 화면에서 「모든 학습 기록
            삭제」를 통해 기기와 서버에 저장된 학습 기록 및 기기에 저장된 인증
            토큰을 직접 삭제할 수 있습니다.
          </li>
          <li>
            서비스는 만 14세 미만 아동을 대상으로 하지 않으며, 만 14세 미만
            아동의 이용을 전제로 한 법정대리인 동의 절차를 별도로 운영하지
            않습니다.
          </li>
          <li>
            제1조의 선택 동의 항목(채점 품질 및 안전성 개선)에 대한 동의는
            언제든지 철회할 수 있으며, 철회하더라도 모의고사 응시와 채점
            결과·피드백 제공 등 서비스의 핵심 기능 이용에는 제한이 없습니다.
          </li>
          <li>
            AI 자동 채점 결과에 대하여 정보주체는 채점에 반영된 기준과 절차에
            대한 설명을 요구할 수 있습니다.
          </li>
        </ol>
      </LegalSection>

      <LegalSection title="제8조 (처리하는 개인정보의 파기)">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            서비스는 개인정보 보유기간의 경과, 처리 목적 달성 등 개인정보가
            불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.
          </li>
          <li>
            파기 방법: 전자적 파일 형태로 저장된 개인정보는 복구 및 재생이
            불가능한 기술적 방법을 사용하여 영구 삭제합니다. 서비스는 종이 문서
            형태로 개인정보를 수집하지 않습니다.
          </li>
          <li>
            학습 기록의 파기: 이용자가 「모든 학습 기록 삭제」를 실행하면 기기에
            저장된 학습 기록과 인증 토큰이 삭제되고, 서버에 저장된 학습 기록도
            함께 파기됩니다. 앱을 기기에서 삭제하는 경우에는 기기에 저장된
            정보만 삭제되므로, 서버에 저장된 학습 기록까지 파기하려면 앱을
            삭제하기 전에 「모든 학습 기록 삭제」를 실행하거나 제11조의 연락처로
            삭제를 요청해야 합니다.
          </li>
        </ol>
      </LegalSection>

      <LegalSection title="제9조 (개인정보의 안전성 확보조치)">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            최소 수집 설계: 회원가입·로그인 절차를 두지 않고 인증 토큰만으로
            서비스를 제공하여 불필요한 개인정보 수집을 최소화합니다.
          </li>
          <li>
            접근 권한의 관리: 개인정보가 저장되는 외부 저장소(MongoDB Atlas)
            접근 자격증명은 서버에서만 보관하며 클라이언트에 노출하지 않습니다.
          </li>
          <li>
            접근 통제: 동일 IP에서의 반복적인 대량 요청을 제한하는 접근 빈도
            제어를 적용합니다.
          </li>
          <li>
            통신 구간 암호화: 이용자와 서비스 간 통신 구간은
            암호화(HTTPS)됩니다.
          </li>
          <li>
            인증 정보의 안전한 보관: 설치 식별자와 인증 토큰은 기기의 보안
            저장소(iOS Keychain, Android Keystore)에 저장합니다.
          </li>
          <li>
            외부 전송 전 개인정보 제거: 오류 진단 기록을 Sentry로 보내기 전에
            앱이 이용자 정보, 요청 주소·본문·헤더·쿠키, 인증 토큰, 응시 식별자,
            음성 파일 경로를 자동으로 삭제하거나 마스킹합니다. 오류 메시지 본문
            역시 미리 정해 둔 오류 코드로 대체하여 전송하므로 학습 내용이 오류
            진단 기록에 담기지 않습니다.
          </li>
        </ol>
      </LegalSection>

      <LegalSection title="제10조 (자동 수집 장치의 설치·운영 및 거부)">
        <p>
          서비스는 앱의 사용성 개선과 안정적인 운영을 위하여 아래 세 가지 자동
          수집 도구를 앱에 설치하여 운영합니다. 세 도구가 수집한 정보는 각각의
          목적 범위 내에서만 이용하며, 광고나 마케팅 목적으로는 이용하지
          않습니다.
        </p>

        <p className="font-semibold text-blue-950">
          1. 이용 행태 분석 도구(Microsoft Clarity)
        </p>
        <p>
          Clarity는 이용자가 앱에서 이동한 화면의 경로와 터치·스크롤 등 화면
          조작 기록을 수집하며, 이를 세션 재생 및 집계 형태로 제공합니다.
        </p>
        <p>
          세션 재생은 앱 화면에 실제로 표시된 내용을 기준으로 만들어집니다.
          서비스의 모의고사 응시 화면과 피드백 화면은 앱 안에 웹 화면 형태로
          표시되므로, 해당 화면에 표시된 문항과 채점 결과·피드백 문구가 세션
          재생에 함께 담길 수 있습니다. 다만 서비스는 Clarity를 통해 이름,
          연락처 등 이용자를 직접 식별할 수 있는 정보를 수집하지 않으며,
          이용자가 녹음한 답변 음성 파일은 Clarity로 전송되지 않습니다.
        </p>

        <p className="font-semibold text-blue-950">
          2. 기능 이용 통계 분석 도구(Amplitude)
        </p>
        <p>
          Amplitude는 이용자가 이동한 화면의 이름과, 모의고사 시작·완료, 채점
          완료, 피드백 조회, 재답변 제출 등 주요 기능이 일어난 시점과 순서를
          수집합니다. 서비스는 이를 이용자들이 어느 단계에서 학습을 중단하는지
          파악하여 흐름을 개선하는 목적으로만 이용합니다.
        </p>
        <p>
          Amplitude는 Clarity와 달리 화면을 녹화하지 않습니다. 어떤 기능이 언제
          일어났는지만 기록하므로, 문항 내용과 이용자가 입력하거나 녹음한 답변,
          채점 결과·피드백 문구는 Amplitude로 전송되지 않습니다. 서비스는 앱이
          보관하는 설치 식별자와 응시 식별자를 Amplitude로 전송하지 않으며,
          Amplitude가 자체적으로 생성하는 기기 식별자만 통계 집계에 쓰입니다.
          접속 IP 주소와 광고 식별자(Android 광고 ID, iOS IDFA)도 수집하지
          않도록 설정하여 운영합니다.
        </p>

        <p className="font-semibold text-blue-950">3. 오류 진단 도구(Sentry)</p>
        <p>
          Sentry는 앱에서 오류가 발생한 시점에 한하여 기기·운영체제 정보, 앱
          버전, 오류 코드 및 발생 위치, 오류 발생 직전의 화면 이동 기록을
          수집합니다. 수집된 정보는 오류의 원인을 찾아 수정하는 목적으로만
          이용합니다.
        </p>
        <p>
          서비스는 오류 진단 기록을 전송하기 전에 제9조에 기재된 방식으로 이용자
          정보와 요청 내용을 제거하므로, 답변 음성과 채점 결과 등 학습 내용은
          Sentry로 전송되지 않습니다. 오류가 발생하지 않으면 아무런 정보도
          전송되지 않습니다.
        </p>

        <p className="font-semibold text-blue-950">4. 수집 거부 방법</p>
        <p>
          위 도구의 정보 수집을 원하지 않는 이용자는 제11조의 연락처로 수집
          중단을 요청할 수 있으며, 서비스는 지체 없이 조치합니다. 수집을
          중단하더라도 모의고사 응시 등 서비스의 핵심 기능 이용에는 제한이
          없습니다. 각 도구의 데이터 처리에 관한 자세한 사항은 Microsoft,
          Amplitude 및 Sentry가 각각 공개한 개인정보처리방침을 통해 확인할 수
          있습니다.
        </p>
      </LegalSection>

      <LegalSection title="제11조 (개인정보 보호책임자)">
        <p>
          서비스는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보
          처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이
          개인정보 보호책임자 및 담당부서를 지정하고 있습니다.
        </p>
        <div className="rounded-lg border border-orange-200/60 bg-white px-4 py-3">
          <p className="font-semibold text-blue-950">개인정보 보호책임자</p>
          <p>성명: {PRIVACY_OFFICER_NAME}</p>
          <p>개인정보 보호 담당부서: 토선생 운영팀</p>
          <p>
            이메일:{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-orange-500 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
        <p>
          정보주체는 서비스를 이용하며 발생한 모든 개인정보 보호 관련 문의,
          불만처리, 피해구제 등에 관한 사항을 위 연락처로 문의할 수 있으며,
          서비스는 정보주체의 문의에 대해 지체 없이 답변 및 처리해드릴 것입니다.
        </p>
      </LegalSection>

      <LegalSection title="제12조 (정보주체의 권익침해에 대한 구제방법)">
        <p>
          정보주체는 개인정보침해로 인한 구제를 받기 위하여 개인정보
          분쟁조정위원회, 한국인터넷진흥원 개인정보침해신고센터 등에 분쟁
          해결이나 상담 등을 신청할 수 있습니다. 이 밖에 기타 개인정보침해의
          신고, 상담에 대하여는 아래 기관에 문의하시기 바랍니다.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            개인정보 분쟁조정위원회: (국번없이) 1833-6972 (
            {/* 웹 방침과 달리 target="_blank"를 쓰지 않는다. 이유는 문의하기 페이지 주석 참고. */}
            <a
              href="https://www.kopico.go.kr"
              className="text-orange-500 hover:underline"
            >
              kopico.go.kr
            </a>
            )
          </li>
          <li>
            개인정보침해신고센터: (국번없이) 118 (
            <a
              href="https://privacy.kisa.or.kr"
              className="text-orange-500 hover:underline"
            >
              privacy.kisa.or.kr
            </a>
            , 한국인터넷진흥원 운영)
          </li>
          <li>대검찰청: (국번없이) 1301 (spo.go.kr)</li>
          <li>경찰청: (국번없이) 182 (ecrm.police.go.kr)</li>
        </ul>
      </LegalSection>

      <LegalSection title="제13조 (개인정보 처리방침의 변경)">
        <p>
          이 개인정보처리방침은 {EFFECTIVE_DATE}부터 적용됩니다. 법령·정책 또는
          서비스 내용의 변화에 따라 내용의 추가·삭제 및 수정이 있을 시에는
          변경사항의 시행 최소 7일 전부터 앱 내 공지 또는 설정 화면을 통하여
          고지할 것입니다.
        </p>
      </LegalSection>
    </AppDocLayout>
  );
}
