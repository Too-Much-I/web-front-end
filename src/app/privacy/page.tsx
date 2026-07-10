import { LegalPageLayout, LegalSection } from "@/components/legal/legal-page-layout";

export const metadata = {
  title: "개인정보처리방침 | 토선생",
};

const CONTACT_EMAIL = "tosunsaeng093@gmail.com";
const EFFECTIVE_DATE = "2026년 7월 10일";

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
            만족도 조사 응답 분석 및 서비스 개선(이용자가 자율적으로 남긴
            연락처가 있는 경우, 후속 안내 목적으로 활용)
          </li>
          <li>서비스 이용 통계 분석 및 사용성 개선</li>
          <li>문의 응대 및 민원 처리</li>
        </ol>
      </LegalSection>

      <LegalSection title="제2조 (개인정보의 처리 및 보유 기간)">
        <p>
          서비스는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터
          개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서
          개인정보를 처리·보유합니다. 각 개인정보 처리 항목별 보유 기간은
          다음과 같습니다.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            음성 답변 녹음 파일: AI 채점 및 결과 제공 등 수집 목적 달성 후 30일
            이내 파기
          </li>
          <li>
            동의 이력(익명 식별자, 동의 항목·버전·일시·방법): 동의 이력 분쟁
            대비 및 법령상 추적 요건 충족을 위해 서비스 운영 종료 시까지 보관
          </li>
          <li>
            만족도 조사 응답(자율 기재 연락처 포함): 조사 목적 달성 후 지체
            없이 파기하되, 통계·연구 목적으로는 개인을 식별할 수 없는 형태로
            가공하여 보관할 수 있음
          </li>
          <li>
            쿠키 등 자동 수집된 행태정보: 분석 도구(Microsoft Clarity) 자체
            보유기간 정책에 따름(제10조 참조)
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="제3조 (처리하는 개인정보의 항목)">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            모의고사 응시 시 수집: 음성 답변 녹음 파일, 브라우저가 자동
            생성하는 익명 식별자, 동의 항목·일시·방법·버전
          </li>
          <li>
            만족도 조사 시 수집(선택): 만족도 점수, 이전 취득 등급, 지불
            의향, 의견, 이용자가 자율적으로 입력한 연락처(이메일 등)
          </li>
          <li>
            서비스 이용 과정에서 자동으로 생성·수집: 접속 IP 주소, 쿠키,
            서비스 이용 기록, 기기·브라우저 정보
          </li>
        </ol>
      </LegalSection>

      <LegalSection title="제4조 (개인정보의 제3자 제공)">
        <p>
          서비스는 정보주체의 개인정보를 제1조에서 명시한 목적 범위 내에서만
          처리하며, 원칙적으로 정보주체의 동의 없이는 개인정보를 외부에
          제공하지 않습니다. 다만 정보주체의 별도 동의가 있거나 법령에 특별한
          규정이 있는 경우는 예외로 합니다.
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
                  동의 이력 및 만족도 조사 응답의 저장·관리(Google 스프레드시트)
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 align-top">Microsoft Corporation</td>
                <td className="px-3 py-2 align-top">
                  웹사이트 방문 및 이용 행태 분석(Microsoft Clarity)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          음성 답변 녹음 파일의 채점·저장을 위한 서버(백엔드)는 서비스
          운영팀이 직접 운영하며, 별도의 외부 업체에 위탁하지 않습니다.
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
                  Microsoft Corporation
                  <br />
                  (미국 등 Microsoft가 데이터를 처리하는 국가)
                </td>
                <td className="px-3 py-2 align-top">
                  쿠키 식별자, 페이지 이동 경로, 클릭·스크롤 등 행태정보
                </td>
                <td className="px-3 py-2 align-top">
                  웹사이트 사용성 분석(Microsoft Clarity) 목적으로 서비스
                  이용 시점에 네트워크를 통해 실시간 전송
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 align-top">Google LLC (미국)</td>
                <td className="px-3 py-2 align-top">
                  익명 식별자, 동의 이력, 만족도 조사 응답
                </td>
                <td className="px-3 py-2 align-top">
                  Google 스프레드시트 저장·관리 목적으로 응답 제출 시점에
                  전송
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          음성 답변 녹음 파일 자체는 국내 리전(AWS ap-northeast-2)에 위치한
          클라우드 스토리지에 저장되며, 국외로 이전되지 않습니다. 국외 이전을
          거부하고자 하는 경우 제10조의 쿠키 거부 방법을 통해 행태정보 수집을
          차단할 수 있으며, 이 경우에도 모의고사 응시 등 핵심 기능 이용에는
          제한이 없습니다.
        </p>
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
            AI 자동 채점 결과에 대하여 정보주체는 채점에 반영된 기준과
            절차에 대한 설명을 요구할 수 있습니다.
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
            불가능한 기술적 방법을 사용하여 영구 삭제합니다. 서비스는 종이
            문서 형태로 개인정보를 수집하지 않습니다.
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
          <li>통신 구간 암호화: 이용자와 서비스 간 통신 구간은 암호화(HTTPS)됩니다.</li>
        </ol>
      </LegalSection>

      <LegalSection title="제10조 (쿠키 등 자동 수집 장치의 설치·운영 및 거부)">
        <p>
          서비스는 이용 행태 분석 도구인 Microsoft Clarity를 통해 쿠키를
          설치·운영합니다. 쿠키는 웹사이트 이용 편의를 위해 이용 정보를
          저장하고 수시로 불러오는 기능을 하며, 서비스 개선을 위한 사용성
          분석 목적으로만 사용됩니다.
        </p>
        <p>
          이용자는 브라우저 설정을 통해 쿠키 저장을 거부하거나 삭제할 수
          있습니다. 다만 쿠키 저장을 거부하더라도 모의고사 응시 등 서비스의
          핵심 기능 이용에는 제한이 없습니다. Microsoft Clarity의 데이터
          처리에 관한 자세한 사항은 Microsoft의 개인정보처리방침을 통해
          확인할 수 있습니다.
        </p>
      </LegalSection>

      <LegalSection title="제11조 (개인정보 보호책임자)">
        <p>
          서비스는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보
          처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와
          같이 개인정보 보호책임자 및 담당부서를 지정하고 있습니다.
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
          서비스는 정보주체의 문의에 대해 지체 없이 답변 및 처리해드릴
          것입니다.
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
          <li>개인정보 분쟁조정위원회: (국번없이) 1833-6972 (privacy.go.kr)</li>
          <li>
            개인정보침해신고센터: (국번없이) 118 (privacy.go.kr, 한국인터넷진흥원 운영)
          </li>
          <li>대검찰청: (국번없이) 1301 (spo.go.kr)</li>
          <li>경찰청: (국번없이) 182 (ecrm.police.go.kr)</li>
        </ul>
      </LegalSection>

      <LegalSection title="제13조 (개인정보 처리방침의 변경)">
        <p>
          이 개인정보처리방침은 {EFFECTIVE_DATE}부터 적용됩니다. 법령·정책
          또는 서비스 내용의 변화에 따라 내용의 추가·삭제 및 수정이 있을
          시에는 변경사항의 시행 최소 7일 전부터 서비스 내 공지사항을 통하여
          고지할 것입니다.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
