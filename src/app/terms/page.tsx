import { LegalPageLayout, LegalSection } from "@/components/legal/legal-page-layout";

export const metadata = {
  title: "이용약관 | 토선생",
};

const CONTACT_EMAIL = "tosunsaeng093@gmail.com";
const EFFECTIVE_DATE = "2026년 7월 10일";

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      title="이용약관"
      effectiveDateLabel={`시행일자: ${EFFECTIVE_DATE}`}
      intro={
        <>
          이 약관은 토선생(이하 &ldquo;서비스&rdquo;)이 제공하는 토익
          스피킹 모의고사 및 AI 채점·피드백 서비스의 이용과 관련하여 서비스와
          이용자 간의 권리, 의무 및 책임사항 등을 규정함을 목적으로 합니다.
        </>
      }
    >
      <LegalSection title="제1조 (목적)">
        <p>
          이 약관은 서비스가 제공하는 모든 서비스의 이용조건 및 절차, 이용자와
          서비스의 권리·의무 및 책임사항, 기타 필요한 사항을 규정합니다.
        </p>
      </LegalSection>

      <LegalSection title="제2조 (정의)">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            &ldquo;서비스&rdquo;란 서비스가 웹사이트를 통해 제공하는 토익
            스피킹 모의고사 응시, 음성 답변 녹음, AI 자동 채점 및 결과·피드백
            제공 등 일체의 서비스를 의미합니다.
          </li>
          <li>
            &ldquo;이용자&rdquo;란 이 약관에 따라 서비스가 제공하는 서비스를
            이용하는 자를 의미합니다. 서비스는 별도의 회원가입 절차 없이
            브라우저에 저장되는 익명 식별자를 통해 이용자를 구분합니다.
          </li>
          <li>
            &ldquo;답변 음성&rdquo;이란 이용자가 모의고사 응시 중 서비스를
            통해 녹음하여 제출하는 음성 데이터를 의미합니다.
          </li>
        </ol>
      </LegalSection>

      <LegalSection title="제3조 (약관의 게시와 개정)">
        <ol className="list-decimal space-y-1 pl-5">
          <li>서비스는 이 약관의 내용을 이용자가 알 수 있도록 서비스 초기 화면에 게시합니다.</li>
          <li>
            서비스는 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수
            있으며, 약관을 개정하는 경우 적용일자 및 개정사유를 명시하여 적용
            일자 최소 7일 전부터 서비스 내 공지사항을 통해 공지합니다. 다만
            이용자에게 불리한 개정의 경우 최소 30일 전에 공지합니다.
          </li>
          <li>
            이용자가 개정 약관의 적용에 동의하지 않는 경우 서비스 이용을
            중단할 수 있으며, 공지 후에도 서비스를 계속 이용하는 경우 개정
            약관에 동의한 것으로 봅니다.
          </li>
        </ol>
      </LegalSection>

      <LegalSection title="제4조 (서비스의 제공 및 변경)">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            서비스는 토익 스피킹 시험과 동일한 유형의 문제로 구성된 모의고사를
            제공하고, 이용자가 녹음한 답변 음성을 AI로 분석하여 채점 결과와
            피드백을 제공합니다.
          </li>
          <li>
            서비스는 현재 검증(Proof of Concept) 단계로 운영되며, 문제 유형,
            채점 기준, 화면 구성 등 서비스의 내용은 사전 고지 후 변경될 수
            있습니다.
          </li>
          <li>
            서비스는 무료로 제공되며, 추후 유료 서비스를 도입하는 경우 그
            내용과 적용일자를 사전에 공지합니다.
          </li>
        </ol>
      </LegalSection>

      <LegalSection title="제5조 (서비스 이용시간 및 중단)">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 하나, 시스템 점검,
            서버 증설 및 교체, 백엔드 채점 서버의 장애 등의 사유로 서비스
            제공이 일시 중단될 수 있습니다.
          </li>
          <li>
            서비스는 검증 단계 특성상 서비스 내용의 전부 또는 일부를 사전
            공지 후 종료할 수 있습니다.
          </li>
        </ol>
      </LegalSection>

      <LegalSection title="제6조 (이용자의 의무)">
        <p>이용자는 다음 각 호에 해당하는 행위를 해서는 안 됩니다.</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>타인의 익명 식별자를 도용하거나 부정하게 사용하는 행위</li>
          <li>
            자동화된 수단(매크로, 봇 등)을 이용하여 서비스에 비정상적으로
            대량 접근하거나 요청을 보내는 행위
          </li>
          <li>서비스의 운영을 방해하거나 서비스의 안정적인 운영을 방해할 우려가 있는 행위</li>
          <li>서비스를 통해 취득한 문제, 채점 결과, 피드백 등을 서비스가 허용한 범위를 벗어나 영리 목적으로 복제·배포하는 행위</li>
          <li>관련 법령 및 이 약관에서 금지하는 행위</li>
        </ol>
      </LegalSection>

      <LegalSection title="제7조 (서비스의 의무)">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            서비스는 관련 법령과 이 약관이 금지하거나 미풍양속에 반하는
            행위를 하지 않으며, 이 약관이 정하는 바에 따라 지속적이고
            안정적으로 서비스를 제공하기 위해 노력합니다.
          </li>
          <li>
            서비스는 이용자의 개인정보를 보호하기 위해 개인정보처리방침을
            수립하고 이를 준수합니다.
          </li>
        </ol>
      </LegalSection>

      <LegalSection title="제8조 (지식재산권)">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            서비스가 제공하는 문제, 화면 구성, 채점 로직, AI 피드백 문구 등에
            관한 저작권 및 지식재산권은 서비스에 귀속됩니다.
          </li>
          <li>
            이용자가 녹음하여 제출한 답변 음성에 대한 권리는 이용자 본인에게
            있습니다. 다만 이용자는 서비스에 답변 음성을 제출함으로써 AI
            채점, 결과·피드백 제공 등 서비스 운영 목적 범위 내에서 서비스가
            해당 음성을 사용할 수 있는 권리를 부여합니다.
          </li>
          <li>
            이용자는 서비스를 이용하여 얻은 정보를 서비스의 사전 동의 없이
            복제, 송신, 출판, 배포, 방송 기타 방법으로 영리 목적으로 이용하거나
            제3자에게 이용하게 해서는 안 됩니다.
          </li>
        </ol>
      </LegalSection>

      <LegalSection title="제9조 (AI 채점 결과의 성격)">
        <p>
          서비스가 제공하는 채점 결과 및 피드백은 AI가 공식 채점 기준을
          참고하여 산출한 연습용 참고 자료이며, 한국토익위원회(YBM) 등이
          발급하는 공식 TOEIC Speaking 시험 성적표 및 공인 점수가 아닙니다.
          이용자는 이 점을 이해하고 서비스를 학습 및 실전 감각 연습 목적으로
          이용해야 하며, 서비스는 AI 채점 결과와 실제 공식 시험 성적 간에
          차이가 발생할 수 있음을 안내합니다.
        </p>
      </LegalSection>

      <LegalSection title="제10조 (책임의 제한)">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            서비스는 천재지변, 통신 장애 등 불가항력으로 인하여 서비스를
            제공할 수 없는 경우 서비스 제공에 관한 책임이 면제됩니다.
          </li>
          <li>
            서비스는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는
            책임을 지지 않습니다.
          </li>
          <li>
            서비스는 무료로 제공되는 검증 단계 서비스로서, 서비스가 제공하는
            AI 채점 결과의 정확성이나 특정 목적에의 적합성을 보증하지
            않으며, 이용자가 채점 결과를 신뢰하여 취한 조치로 발생한 손해에
            대해서는 서비스의 고의 또는 중대한 과실이 없는 한 책임을 지지
            않습니다.
          </li>
        </ol>
      </LegalSection>

      <LegalSection title="제11조 (미성년자의 서비스 이용)">
        <p>
          서비스는 만 14세 미만 아동을 대상으로 하지 않습니다. 만 14세 이상
          미성년자가 서비스를 이용하는 경우 법정대리인의 동의를 얻어야 하며,
          법정대리인은 미성년자 이용자가 체결한 이용계약을 취소할 수
          있습니다.
        </p>
      </LegalSection>

      <LegalSection title="제12조 (준거법 및 관할법원)">
        <ol className="list-decimal space-y-1 pl-5">
          <li>서비스와 이용자 간에 발생한 분쟁에 관하여는 대한민국 법을 적용합니다.</li>
          <li>
            서비스 이용과 관련하여 서비스와 이용자 간에 소송이 제기될 경우
            민사소송법상의 관할법원에 제소합니다.
          </li>
        </ol>
      </LegalSection>

      <LegalSection title="제13조 (문의처)">
        <p>
          이 약관 및 서비스 이용에 관한 문의는 아래 이메일로 접수해 주시기
          바랍니다.
        </p>
        <p>
          이메일:{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-orange-500 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
      </LegalSection>

      <LegalSection title="부칙">
        <p>이 약관은 {EFFECTIVE_DATE}부터 시행합니다.</p>
      </LegalSection>
    </LegalPageLayout>
  );
}
