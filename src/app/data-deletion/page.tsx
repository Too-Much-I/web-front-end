import Link from "next/link";

import {
  LegalPageLayout,
  LegalSection,
} from "@/components/legal/legal-page-layout";

export const metadata = {
  title: "데이터 삭제 요청 | 토선생",
  description:
    "토선생 앱에서 수집한 데이터를 삭제하는 방법과, 삭제되는 데이터 및 삭제 후에도 보관되는 데이터의 종류와 보관 기간을 안내합니다.",
  alternates: { canonical: "/data-deletion" },
};

/**
 * Google Play 콘솔의 "데이터 삭제 URL"로 등록하는 공개 페이지다.
 *
 * `/app-settings/*`가 아니라 웹 라우트에 두는 이유: 이 링크는 Play 스토어
 * 등록정보에 노출되어 일반 브라우저에서 열리고, 앱을 이미 지운 사람도 봐야 한다.
 * 앱 웹뷰용 레이아웃(AppDocLayout)은 헤더·푸터가 없고 noindex라 이 용도에 맞지 않다.
 *
 * Play 정책(support.google.com/googleplay/android-developer/answer/13327111)이
 * 이 링크에 요구하는 것은 네 가지이며, 아래 구성이 그 순서를 그대로 따른다.
 *
 *   1. 앱 또는 개발자 이름 참조 → 제목·도입부의 "토선생"
 *   2. 삭제 요청 경로가 눈에 띄고 검색 가능 → "앱에서 직접 삭제하기"를 첫 조로 두고
 *      단계를 카드로 분리
 *   3. 사용자가 그 경로로 실제 삭제를 요청할 수 있음 → 앱 내 경로 + 이메일 경로
 *   4. 삭제되는 데이터와 보관되는 데이터·보관 기간 명시 → 3·4조
 *
 * 우리 앱은 회원가입이 없어 콘솔에서 "계정 생성을 허용하지 않음"으로 신고하므로
 * 계정 삭제 요건 자체의 적용 대상은 아니다. 그럼에도 이 페이지를 두는 이유는
 * 설치 식별자에 학습 기록과 음성이 지속적으로 묶이고, 그 삭제 수단이 앱 안에만
 * 있어서다. 앱을 지운 뒤에는 앱 안의 삭제 버튼에 닿을 수 없으므로 웹에 경로가
 * 하나 더 필요하다.
 */

const CONTACT_EMAIL = "tosunsaeng093@gmail.com";
const PRIVACY_OFFICER_NAME = "송성환";

// 앱 방침(`src/app/app-settings/privacy/page.tsx`)의 시행일과 별개로 관리한다.
// 본문이 다른 문서이므로 방침 개정일에 자동으로 끌려가지 않게 한다.
const EFFECTIVE_DATE = "2026년 8월 17일";

// 앱 방침 제2조·제10조의 같은 이름 상수와 반드시 같은 값이어야 하고, 그 값은
// Amplitude 프로젝트 콘솔의 데이터 보존 설정과 같아야 한다. 셋 중 하나만 고치면
// 이 페이지가 실제 보관 기간과 어긋난다.
const AMPLITUDE_RETENTION = "24개월";

// 앱 설정 화면의 실제 버튼 문구. 라벨이 바뀌면 이 페이지의 안내가 곧바로 틀린 말이
// 되므로(사용자가 그 문구를 화면에서 찾지 못한다) 앱과 함께 고친다.
const DELETE_MENU_LABEL = "모든 학습 기록 삭제";

/**
 * 삭제 단계 하나. Play가 요구하는 "눈에 잘 띄게 표시"를 문단이 아니라 번호가 붙은
 * 카드로 만족시킨다. 장문의 조문 사이에 섞여 있으면 찾지 못한다.
 */
function DeletionStep({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-orange-200/60 bg-white px-4 py-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
        {step}
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-semibold text-blue-950">{title}</p>
        {children}
      </div>
    </div>
  );
}

export default function DataDeletionPage() {
  return (
    <LegalPageLayout
      title="데이터 삭제 요청"
      effectiveDateLabel={`시행일자: ${EFFECTIVE_DATE}`}
      intro={
        <>
          토선생(TOEIC Speaking 모의고사 앱, 이하 &ldquo;서비스&rdquo;)에서
          수집한 데이터를 삭제하는 방법과, 삭제 시 지워지는 데이터 및 삭제
          후에도 일정 기간 보관되는 데이터를 안내합니다. 서비스는 회원가입
          절차를 두지 않으므로 아래 절차는 계정 대신 앱 설치 시점에 발급된
          이용자의 학습 기록을 대상으로 합니다.
        </>
      }
    >
      <LegalSection title="1. 앱에서 직접 삭제하기">
        <p>
          서비스는 별도의 요청이나 승인 절차 없이 이용자가 앱에서 직접 데이터를
          삭제할 수 있도록 하고 있습니다. 아래 세 단계로 기기와 서버에 저장된
          학습 기록이 모두 삭제됩니다.
        </p>
        <div className="flex flex-col gap-2">
          <DeletionStep step={1} title="토선생 앱을 실행합니다." />
          <DeletionStep
            step={2}
            title={`설정 화면에서 「${DELETE_MENU_LABEL}」를 선택합니다.`}
          />
          <DeletionStep step={3} title="확인 창에서 삭제를 확정합니다.">
            <p>
              삭제가 완료되면 앱은 학습 기록이 없는 상태로 다시 시작됩니다. 앱을
              계속 이용할 수 있으나, 삭제된 응시 이력과 채점 결과는 복구할 수
              없습니다.
            </p>
          </DeletionStep>
        </div>
        <p>
          <strong className="font-semibold text-blue-950">
            앱을 기기에서 삭제(제거)하는 것만으로는 서버에 저장된 학습 기록이
            지워지지 않습니다.
          </strong>{" "}
          앱을 제거하면 기기에 저장된 인증 토큰과 설치 식별자만 사라지므로, 서버
          기록까지 지우려면 앱을 제거하기 전에 위 절차를 실행하거나 아래 2항의
          방법으로 삭제를 요청해 주세요.
        </p>
      </LegalSection>

      <LegalSection title="2. 이메일로 삭제를 요청하기">
        <p>
          앱을 이미 제거하여 위 절차를 실행할 수 없는 경우, 또는 앱에서의 삭제가
          정상적으로 되지 않는 경우에는 아래 연락처로 삭제를 요청할 수 있습니다.
          서비스는 요청을 확인한 후 지체 없이 조치하고 처리 결과를 회신합니다.
        </p>
        <div className="rounded-lg border border-orange-200/60 bg-white px-4 py-3">
          <p className="font-semibold text-blue-950">데이터 삭제 요청 접수처</p>
          <p>서비스명: 토선생</p>
          <p>개인정보 보호책임자: {PRIVACY_OFFICER_NAME}</p>
          <p>
            이메일:{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                "[토선생] 데이터 삭제 요청",
              )}`}
              className="text-orange-500 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
        <p>
          서비스는 이름·연락처 등 이용자를 직접 식별할 수 있는 정보를 수집하지
          않고 기기에 저장된 설치 식별자로만 학습 기록을 구분합니다. 그래서 앱을
          제거한 뒤에는 어느 기록이 요청자의 것인지 확인하기 어려울 수 있습니다.
          이 경우 서비스가 회신을 통해 확인에 필요한 정보를 안내하며, 확인이
          가능한 범위에서 해당 기록을 파기합니다. 확실한 삭제를 위해서는 앱을
          제거하기 전에 1항의 절차를 실행하는 방법을 권장합니다.
        </p>
      </LegalSection>

      <LegalSection title="3. 삭제되는 데이터">
        <p>
          위 1항 또는 2항의 절차를 통해 아래 데이터가 기기와 서버에서 모두
          파기됩니다. 파기된 데이터는 복구 및 재생이 불가능한 기술적 방법으로
          영구 삭제되므로 되돌릴 수 없습니다.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            서버에 저장된 이용자 정보: 설치 식별자, 인증 토큰(액세스 토큰,
            리프레시 토큰), 동의 이력
          </li>
          <li>학습 기록: 응시 이력, 채점 결과, 피드백</li>
          <li>답변 음성을 텍스트로 변환한 전사문</li>
          <li>음성 답변 녹음 파일</li>
          <li>기기의 보안 저장소에 저장된 인증 토큰</li>
        </ul>
        <p>
          기기에 저장된 동의 기록과 설치 식별자는 삭제 후에도 앱이 재동의 화면을
          반복해서 띄우지 않도록 기기 안에만 남으며, 서버의 이용자 정보가 이미
          파기되었으므로 이전 학습 기록과 다시 연결되지 않습니다. 이 두 값은
          앱을 기기에서 제거하면 함께 사라집니다.
        </p>
      </LegalSection>

      <LegalSection title="4. 삭제 후에도 보관되는 데이터와 보관 기간">
        <p>
          서비스 운영과 장애 대응, 오류 수정 및 이용 통계 분석을 위하여 아래
          데이터는 학습 기록의 삭제와 별개로 각각의 기간까지 보관한 후
          파기합니다. 아래 데이터에는 이용자의 답변 음성과 채점 결과·피드백
          문구가 포함되지 않으며, 학습 기록이 파기된 뒤에는 삭제된 학습 기록과
          연결할 수 없습니다.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            접속 IP 주소, 서비스 이용 기록, 기기·운영체제 정보, 앱 버전:
            수집일로부터 3개월
          </li>
          <li>
            오류 진단 기록(Sentry: 오류 코드 및 발생 위치, 오류 직전의 화면 이동
            기록): 수집일로부터 90일
          </li>
          <li>
            앱 이용 행태정보(Microsoft Clarity: 화면 이동 경로, 터치·스크롤 등
            화면 조작 기록): 세션 재생 데이터는 최대 30일, 집계 데이터는 최대
            9개월
          </li>
          <li>
            앱 기능 이용 통계(Amplitude: 화면 이동 기록과 모의고사 시작·완료 등
            주요 기능의 이용 시점): 수집일로부터 {AMPLITUDE_RETENTION}. 이
            통계는 설치 식별자가 아니라 Amplitude가 자체적으로 생성하는 기기
            식별자로만 집계됩니다.
          </li>
          <li>
            채점 과정에서 외부 사업자(Azure AI Speech, OpenAI)에게 전송된 음성
            및 전사문: 해당 사업자가 위탁받은 처리를 마친 뒤 각 사업자의 정책에
            따라 삭제
          </li>
        </ul>
        <p>
          위 자동 수집 도구의 정보 수집 자체를 원하지 않는 경우에도 이메일로
          수집 중단을 요청할 수 있으며, 중단하더라도 모의고사 응시 등 서비스의
          핵심 기능 이용에는 제한이 없습니다.
        </p>
      </LegalSection>

      <LegalSection title="5. 관련 문서">
        <p>
          서비스가 처리하는 개인정보의 항목과 목적, 보유 기간, 위탁 및 국외
          이전에 관한 자세한 사항은{" "}
          <Link href="/privacy" className="text-orange-500 hover:underline">
            개인정보처리방침
          </Link>
          에서 확인할 수 있습니다. 앱 이용자는 앱의 설정 화면에서도 같은 내용을
          볼 수 있습니다.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
