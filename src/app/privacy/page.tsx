import {
  LegalPageLayout,
  LegalSection,
} from "@/components/legal/legal-page-layout";

export const metadata = {
  title: "개인정보처리방침 | 토선생",
  alternates: { canonical: "/privacy" },
};

const CONTACT_EMAIL = "tosunsaeng093@gmail.com";
// 2026-08-16: 제5·6조에 채점 파이프라인(Azure AI Speech·OpenAI)을 반영해 본문이
// 바뀌었다. 제13조가 "변경사항의 시행 최소 7일 전 고지"를 약속하므로 시행일을
// 고지 시점 + 7일 이후로 잡는다. 공지 일정이 확정되면 그 날짜로 맞춘다.
const EFFECTIVE_DATE = "2026년 8월 24일";

// 채점 파이프라인(2026년 8월 기준). 제5·6조는 이 구성을 그대로 옮긴 것이므로
// 파이프라인이 바뀌면 두 조를 함께 고쳐야 한다. 같은 사실을 가리키는 문서가
// 셋이므로(웹 동의 문구 `src/features/consent/consent-content.ts`, 앱 방침
// `src/app/app-settings/privacy/page.tsx`) 한쪽만 고치지 않는다.
//
//   1. Azure AI Speech (STT + Pronunciation Assessment) — 전 문항 음성의
//      발음·유창성 분석. 운영 리전이 koreacentral이라 국외 이전이 아니다.
//      제5조(위탁)에만 적고 제6조(국외 이전)에서는 뺀다.
//   2. OpenAI Audio Transcriptions API (gpt-transcribe) — Q3~Q11 음성을
//      텍스트로 변환. 미국으로 이전된다.
//   3. OpenAI Responses API — 전사문으로 채점·피드백 생성. 음성이 아니라
//      텍스트가 나가므로 제3조 처리 항목에 "전사문"을 따로 적었다.

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
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
            모의고사 응시자 식별 및 서비스 제공: 로그인 없이 브라우저에 저장되는
            익명 식별자를 통해 응시 기록과 동의 이력을 연결
          </li>
          <li>
            음성 답변 녹음 파일을 활용한 AI 자동 채점 및 채점 결과·피드백 제공
          </li>
          <li>음성 데이터 수집·이용 등 서비스 이용 동의 이력의 관리</li>
          <li>
            만족도 조사 응답 분석 및 서비스 개선(별도 동의를 받아 수집한
            연락처는 응시권 발송 및 정식 서비스 출시 등 서비스 소식 안내
            목적으로 활용)
          </li>
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
            음성 답변 녹음 파일: AI 채점 및 결과 제공 등 수집 목적 달성 후 30일
            이내 파기. 채점 과정에서 제5조의 사업자에게 전송된 음성은 해당
            사업자가 위탁받은 처리를 마친 뒤 각 사업자의 정책에 따라 삭제
          </li>
          <li>
            전사문(답변 음성을 변환한 텍스트): 채점 결과 제공 등 목적 달성 후
            30일 이내 파기
          </li>
          <li>
            동의 이력(익명 식별자, 동의 항목·버전·일시·방법): 동의 철회 또는
            삭제 요청 시 지체 없이 파기하며, 별도 요청이 없는 경우 최종
            동의일로부터 3년간 보관 후 파기
          </li>
          <li>
            만족도 조사 응답: 조사 목적 달성 후 지체 없이 파기하되, 통계·연구
            목적으로는 개인을 식별할 수 없는 형태로 가공하여 보관할 수 있음
          </li>
          <li>
            만족도 조사 시 별도 동의를 받아 수집한 연락처(전화번호 또는 이메일):
            응시권 발송 및 정식 서비스 출시 안내 시까지 보유하며, 최대
            수집일로부터 3개월 이내 파기
          </li>
          <li>
            쿠키 등 자동 수집된 행태정보(Microsoft Clarity): 세션 재생 데이터는
            최대 30일, 클릭·이동 경로 등 집계 데이터는 최대 9개월간 보관(제10조
            참조)
          </li>
          <li>
            쿠키 등 자동 수집된 행태정보(Google Analytics): 이용자 단위 이벤트
            데이터는 최대 14개월간 보관하며, 이후 개인을 식별할 수 없는 집계
            형태로만 유지(제10조 참조)
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="제3조 (처리하는 개인정보의 항목)">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            모의고사 응시 시 수집: 음성 답변 녹음 파일, 브라우저가 자동 생성하는
            익명 식별자, 동의 항목·일시·방법·버전
          </li>
          <li>
            채점 과정에서 생성: 답변 음성을 텍스트로 변환한 전사문, 채점 결과 및
            피드백
          </li>
          <li>
            만족도 조사 시 수집(선택): 만족도 점수, 이전 취득 등급, 지불 의향,
            의견, 연락처(전화번호 또는 이메일 — 응시권 발송 목적으로 수집·이용에
            대한 별도 동의를 받은 경우에 한하여 수집) 및 해당 동의 이력(동의
            여부·문구 버전·일시)
          </li>
          <li>
            서비스 이용 과정에서 자동으로 생성·수집: 접속 IP 주소, 쿠키, 서비스
            이용 기록, 기기·브라우저 정보
          </li>
        </ol>
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
                <td className="px-3 py-2 align-top">Google LLC</td>
                <td className="px-3 py-2 align-top">
                  동의 이력 및 만족도 조사 응답의 저장·관리(Google
                  스프레드시트), 웹사이트 방문 및 이용 통계 분석(Google
                  Analytics)
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 align-top">Microsoft Corporation</td>
                <td className="px-3 py-2 align-top">
                  웹사이트 방문 및 이용 행태 분석(Microsoft Clarity)
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
          서비스는 아래와 같이 개인정보를 국외의 수탁자에게 이전하고 있습니다.
        </p>
        <div className="overflow-x-auto rounded-lg border border-orange-200/60">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-orange-50 text-zinc-700">
              <tr>
                <th className="px-3 py-2 font-semibold">이전받는 자</th>
                <th className="px-3 py-2 font-semibold">이전 항목</th>
                <th className="px-3 py-2 font-semibold">이전 목적 · 방법</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100">
              <tr>
                <td className="px-3 py-2 align-top">
                  OpenAI, L.L.C. (미국)
                  <br />
                  privacy@openai.com
                </td>
                <td className="px-3 py-2 align-top">
                  3번~11번 문항의 답변 음성 녹음 파일, 답변 음성을 변환한 전사문
                </td>
                <td className="px-3 py-2 align-top">
                  답변 음성의 텍스트 변환 및 전사문을 이용한 채점 결과·피드백
                  생성 목적으로, 모의고사 채점이 진행되는 시점에 네트워크를 통해
                  전송. 채점 처리 완료 후 OpenAI의 정책에 따라 삭제되며,
                  서비스는 전송된 음성과 전사문이 OpenAI의 인공지능 모델 학습에
                  이용되지 않도록 요구합니다.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 align-top">
                  Microsoft Corporation
                  <br />
                  (미국 등 Microsoft가 데이터를 처리하는 국가)
                </td>
                <td className="px-3 py-2 align-top">
                  쿠키 식별자, 페이지 이동 경로, 클릭·스크롤 등 행태정보
                </td>
                <td className="px-3 py-2 align-top">
                  웹사이트 사용성 분석(Microsoft Clarity) 목적으로 서비스 이용
                  시점에 네트워크를 통해 실시간 전송
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 align-top">Google LLC (미국)</td>
                <td className="px-3 py-2 align-top">
                  익명 식별자, 동의 이력, 만족도 조사 응답
                </td>
                <td className="px-3 py-2 align-top">
                  Google 스프레드시트 저장·관리 목적으로 응답 제출 시점에 전송
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 align-top">
                  Google LLC
                  <br />
                  (미국 등 Google이 데이터를 처리하는 국가)
                </td>
                <td className="px-3 py-2 align-top">
                  쿠키 식별자, 페이지 이동 경로, 서비스 이용 단계·이용 기록 등
                  행태정보
                </td>
                <td className="px-3 py-2 align-top">
                  웹사이트 이용 통계 분석(Google Analytics) 목적으로 서비스 이용
                  시점에 네트워크를 통해 실시간 전송
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          발음·유창성 분석에 이용하는 Azure AI Speech는 국내
          리전(koreacentral)에서 운영되므로 해당 처리에는 국외 이전이 발생하지
          않습니다. 서비스가 보관하는 답변 음성 녹음 파일의 원본도 국내 리전(AWS
          ap-northeast-2)에 위치한 클라우드 스토리지에 저장되며 국외로 이전되지
          않습니다.
        </p>
        <p>
          위 국외 이전에 대해 거부하고자 하는 경우, 각 항목의 성격에 따라 다음과
          같이 거부할 수 있습니다.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            OpenAI(답변 음성 및 전사문): 제11조의 연락처로 거부 의사를 밝힐 수
            있습니다. 다만 음성의 텍스트 변환과 채점·피드백 생성은 서비스의 핵심
            기능을 구성하는 단계이므로, 거부하는 경우 3번~11번 문항에 대한 채점
            결과와 피드백을 제공받을 수 없습니다.
          </li>
          <li>
            Microsoft Clarity·Google Analytics(행태정보): 제10조의 쿠키 거부
            방법을 통해 수집을 차단할 수 있으며, 차단하더라도 모의고사 응시 등
            핵심 기능 이용에는 제한이 없습니다.
          </li>
          <li>
            Google 스프레드시트(만족도 조사 응답): 만족도 조사는 선택적으로
            참여하는 절차이며, 설문에 응답을 제출하지 않으면 해당 정보가 국외로
            이전되지 않습니다. 이미 제출한 응답의 삭제를 원하는 경우 제11조의
            연락처로 요청할 수 있습니다.
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
            서비스는 만 14세 미만 아동을 대상으로 하지 않으며, 만 14세 미만
            아동의 이용을 전제로 한 법정대리인 동의 절차를 별도로 운영하지
            않습니다.
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
        </ol>
      </LegalSection>

      <LegalSection title="제9조 (개인정보의 안전성 확보조치)">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            최소 수집 설계: 로그인 없이 익명 식별자만으로 서비스를 제공하여
            불필요한 개인정보 수집을 최소화합니다.
          </li>
          <li>
            접근 권한의 관리: 개인정보가 저장되는 외부 저장소(Google
            스프레드시트) 접근 자격증명은 서버에서만 보관하며 클라이언트에
            노출하지 않습니다.
          </li>
          <li>
            접근 통제: 동일 IP에서의 반복적인 대량 요청을 제한하는 접근 빈도
            제어를 적용합니다.
          </li>
          <li>
            통신 구간 암호화: 이용자와 서비스 간 통신 구간은
            암호화(HTTPS)됩니다.
          </li>
        </ol>
      </LegalSection>

      <LegalSection title="제10조 (쿠키 등 자동 수집 장치의 설치·운영 및 거부)">
        <p>
          서비스는 이용 행태 분석 도구인 Microsoft Clarity와 Google Analytics를
          통해 쿠키를 설치·운영합니다. 쿠키는 웹사이트 이용 편의를 위해 이용
          정보를 저장하고 수시로 불러오는 기능을 하며, 서비스 개선을 위한 사용성
          분석 및 이용 통계 분석 목적으로만 사용됩니다.
        </p>
        <p>
          이용자는 브라우저 설정을 통해 쿠키 저장을 거부하거나 삭제할 수 있으며,
          Google Analytics의 경우 Google이 제공하는 차단 브라우저 부가기능(
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-500 hover:underline"
          >
            tools.google.com/dlpage/gaoptout
          </a>
          )을 통해서도 수집을 거부할 수 있습니다. 다만 쿠키 저장을 거부하더라도
          모의고사 응시 등 서비스의 핵심 기능 이용에는 제한이 없습니다.
          Microsoft Clarity 및 Google Analytics의 데이터 처리에 관한 자세한
          사항은 각각 Microsoft와 Google의 개인정보처리방침을 통해 확인할 수
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
          <p>담당: 토선생 운영팀</p>
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
            <a
              href="https://www.kopico.go.kr"
              target="_blank"
              rel="noopener noreferrer"
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
              target="_blank"
              rel="noopener noreferrer"
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
          변경사항의 시행 최소 7일 전부터 서비스 내 공지사항을 통하여 고지할
          것입니다.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
