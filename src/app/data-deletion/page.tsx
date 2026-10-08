import Link from "next/link";

import {
  LegalPageLayout,
  LegalSection,
} from "@/components/legal/legal-page-layout";

export const metadata = {
  title: "데이터 삭제 요청 | 토선생",
  description:
    "토선생 앱의 회원 계정과 학습 기록을 삭제하는 방법과, 삭제되는 데이터 및 삭제 후에도 보관되는 데이터의 종류와 보관 기간을 안내합니다.",
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
 *   2. 삭제 요청 경로가 눈에 띄고 검색 가능 → "앱에서 회원 탈퇴하기"를 첫 조로 두고
 *      단계를 카드로 분리
 *   3. 사용자가 그 경로로 실제 삭제를 요청할 수 있음 → 앱 내 경로 + 이메일 경로
 *   4. 삭제되는 데이터와 보관되는 데이터·보관 기간 명시 → 4·5조
 *
 * 앱에 SNS 회원가입이 생기면서 콘솔에서 계정 생성을 허용한다고 신고하므로 계정
 * 삭제 요건의 적용 대상이다. 처리 기한과 탈퇴 후 보관 항목은 서버 팀의 "회원정보
 * 저장 및 삭제 정책" 회신(2026-10-08)을 옮긴 것이므로, 서버 정책이 바뀌면 이
 * 페이지와 앱 방침(`src/app/app-settings/privacy/page.tsx`) 제2·8조를 함께 고친다.
 */

const CONTACT_EMAIL = "tosunsaeng093@gmail.com";
const PRIVACY_OFFICER_NAME = "송성환";

// 앱 방침(`src/app/app-settings/privacy/page.tsx`)의 시행일과 별개로 관리한다.
// 본문이 다른 문서이므로 방침 개정일에 자동으로 끌려가지 않게 한다.
const EFFECTIVE_DATE = "2026년 10월 8일";

// 앱 방침 제2조·제10조의 같은 이름 상수와 반드시 같은 값이어야 하고, 그 값은
// 각 프로젝트 콘솔의 데이터 보존 설정과 같아야 한다. 셋 중 하나만 고치면
// 이 페이지가 실제 보관 기간과 어긋난다.
const AMPLITUDE_RETENTION = "24개월";
const FIREBASE_EVENT_RETENTION = "2개월";
const FIREBASE_USER_RETENTION = "14개월";

// 앱 설정 화면의 실제 섹션·버튼 문구. 라벨이 바뀌면 이 페이지의 안내가 곧바로
// 틀린 말이 되므로(사용자가 그 문구를 화면에서 찾지 못한다) 앱과 함께 고친다.
const ACCOUNT_SECTION_LABEL = "계정";
const WITHDRAW_MENU_LABEL = "회원 탈퇴";
const WITHDRAW_CONFIRM_LABEL = "탈퇴하기";
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
          토선생(TOEIC Speaking 모의고사 앱, 이하 &ldquo;서비스&rdquo;)의 회원
          계정과 학습 기록을 삭제하는 방법과, 삭제 시 지워지는 데이터 및 삭제
          후에도 일정 기간 보관되는 데이터를 안내합니다.
        </>
      }
    >
      <LegalSection title="1. 앱에서 회원 탈퇴하기">
        <p>
          회원은 별도의 요청이나 승인 절차 없이 앱에서 직접 탈퇴할 수 있습니다.
          탈퇴하면 계정과 함께 기기와 서버에 저장된 학습 기록이 삭제됩니다.
        </p>
        <div className="flex flex-col gap-2">
          <DeletionStep step={1} title="토선생 앱을 실행하고 로그인합니다." />
          <DeletionStep
            step={2}
            title={`설정 화면의 「${ACCOUNT_SECTION_LABEL}」에서 「${WITHDRAW_MENU_LABEL}」를 선택합니다.`}
          >
            <p>
              Apple 계정으로 가입한 경우 iPhone에서는 Apple 로그인 확인 창이 한
              번 더 표시됩니다.
            </p>
          </DeletionStep>
          <DeletionStep
            step={3}
            title={`확인 창에서 「${WITHDRAW_CONFIRM_LABEL}」를 누릅니다.`}
          >
            <p>
              탈퇴가 접수되면 즉시 로그인이 해제되고 계정을 다시 이용할 수
              없습니다. 삭제된 응시 이력과 채점 결과는 복구할 수 없으며, 같은
              SNS 계정으로 다시 가입하면 새 계정으로 시작합니다.
            </p>
          </DeletionStep>
        </div>
        <p>
          <strong className="font-semibold text-blue-950">
            앱을 기기에서 삭제(제거)하는 것만으로는 회원 계정과 서버에 저장된
            학습 기록이 지워지지 않습니다.
          </strong>{" "}
          앱을 제거하기 전에 위 절차를 실행하거나 아래 3항의 방법으로 삭제를
          요청해 주세요. 서비스에서 탈퇴하더라도 가입에 사용한
          카카오·Google·Apple 계정 자체는 삭제되지 않습니다.
        </p>
      </LegalSection>

      <LegalSection title="2. 계정은 유지하고 학습 기록만 삭제하기">
        <p>
          계정은 그대로 두고 학습 기록만 지우려면 앱 설정 화면에서 「
          {DELETE_MENU_LABEL}」를 선택하고 확인 창에서 삭제를 확정합니다. 응시
          이력, 채점 결과, 피드백, 음성 답변 녹음 파일과 전사문이 삭제되며,
          계정과 로그인 상태는 유지됩니다.
        </p>
      </LegalSection>

      <LegalSection title="3. 이메일로 삭제를 요청하기">
        <p>
          앱을 이미 제거하여 위 절차를 실행할 수 없는 경우, 또는 앱에서의 삭제가
          정상적으로 되지 않는 경우에는 아래 연락처로 탈퇴 또는 학습 기록 삭제를
          요청할 수 있습니다. 서비스는 요청을 접수한 날부터 2영업일 이내에 접수
          사실과 본인 확인에 필요한 절차를 안내하는 것을 목표로 합니다.
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
          다른 사람이 계정을 삭제하지 못하도록, 서비스는 가입에 사용한 SNS
          계정으로 로그인하거나 전화번호를 인증하여 기존 계정과의 연결을 확인한
          뒤에 요청을 수락합니다. 이메일 주소나 전화번호를 적어 보내는
          것만으로는 계정을 삭제하지 않습니다. 서비스는 비밀번호나 인증 토큰을
          이메일로 요청하지 않으며, 본인 확인을 위해 추가로 받은 자료는 처리를
          마친 뒤 30일 이내에 파기합니다. 아래 4항의 삭제 기한은 본인 확인을
          거쳐 요청을 수락한 시점부터 계산합니다.
        </p>
      </LegalSection>

      <LegalSection title="4. 삭제되는 데이터와 처리 기한">
        <p>
          탈퇴 요청이 수락되면 즉시 계정 이용과 인증 토큰 재발급을 차단하고,
          이메일·닉네임 등 프로필 정보를 제거합니다. 이후 아래 데이터를 순서대로
          파기하며, 장애 등의 사유가 있더라도 모든 삭제 처리를 최대 30일 이내에
          마칩니다. 파기된 데이터는 복구 및 재생이 불가능한 기술적 방법으로 영구
          삭제되므로 되돌릴 수 없습니다.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            회원 정보: 내부 회원 ID, 닉네임, 회원 유형·상태, 가입·변경 시각, SNS
            제공자 종류 및 SNS 계정 식별자, 마스킹된 SNS 계정 이메일, 인증 세션
            정보 — 프로필 정보는 탈퇴 수락 즉시 제거
          </li>
          <li>
            로그인 인증 정보(Firebase Authentication)와 SNS 계정 연결: 24시간
            이내 삭제 목표
          </li>
          <li>
            학습 기록(응시 이력, 채점 결과, 피드백), 음성 답변 녹음 파일, 답변
            음성을 텍스트로 변환한 전사문 및 관련 파일: 7일 이내 삭제 목표
          </li>
          <li>
            기기에 저장된 로그인 정보, 인증 토큰, 설치 식별자 및 앱이 저장한
            데이터: 앱에서 탈퇴하는 즉시 삭제
          </li>
        </ul>
        <p>
          2항의 「{DELETE_MENU_LABEL}」로 학습 기록만 삭제하는 경우에도 학습
          기록, 음성 파일, 전사문, 채점 결과와 관련 파일을 7일 이내 삭제를
          목표로, 최대 30일 이내에 파기합니다.
        </p>
      </LegalSection>

      <LegalSection title="5. 삭제 후에도 보관되는 데이터와 보관 기간">
        <p>
          아래 데이터는 각 목적을 위하여 탈퇴 또는 학습 기록 삭제와 별개로
          정해진 기간까지 보관한 후 파기합니다. 아래 데이터에는 이용자의 답변
          음성과 채점 결과·피드백 문구가 포함되지 않습니다.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            전화번호 식별값(전화번호 원문이 아닌 HMAC-SHA256 식별값)과 가입 혜택
            사용 여부: 반복 가입에 따른 혜택 악용 방지를 위해 탈퇴일부터 3년
          </li>
          <li>
            최소 동의·탈퇴 증빙(내부 회원 ID, 동의 항목·버전·시각, 탈퇴
            요청·완료 시각): 동의 및 삭제 처리 사실 확인을 위해 탈퇴일부터 3년
          </li>
          <li>
            로그인 인증 정보 정리 작업 기록(Firebase UID 포함): 정리 완료 후
            30일 이내 제거
          </li>
          <li>
            운영·보안 로그 및 백업: 생성일부터 최대 30일. 백업에서 데이터를
            복원하는 경우에도 이미 접수된 삭제 요청을 다시 반영합니다.
          </li>
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
            통계는 회원 정보가 아니라 Amplitude가 자체적으로 생성하는 기기
            식별자로만 집계됩니다.
          </li>
          <li>
            광고 성과 측정 기록(Firebase Analytics: 회원가입 완료·모의고사 완료
            등의 발생 시점, Android 광고 ID): 이벤트 단위 데이터는 수집일로부터{" "}
            {FIREBASE_EVENT_RETENTION}, 사용자 단위 데이터는 마지막 이용일로부터{" "}
            {FIREBASE_USER_RETENTION}. 이 기록은 회원 정보와 연결하여 보내지
            않습니다.
          </li>
          <li>
            채점 과정에서 외부 사업자(Azure AI Speech, OpenAI)에게 전송된 음성
            및 전사문: 해당 사업자가 위탁받은 처리를 마친 뒤 각 사업자의 정책에
            따라 삭제
          </li>
        </ul>
        <p>
          법령에 따라 보존할 의무가 있는 기록은 해당 법령이 정한 항목과 기간에
          따라 별도로 보관하며, 보관 목적이나 기간이 끝나면 파기합니다. 위 자동
          수집 도구의 정보 수집 자체를 원하지 않는 경우에도 이메일로 수집 중단을
          요청할 수 있으며, 중단하더라도 모의고사 응시 등 서비스의 핵심 기능
          이용에는 제한이 없습니다.
        </p>
      </LegalSection>

      <LegalSection title="6. 관련 문서">
        <p>
          서비스가 처리하는 개인정보의 항목과 목적, 보유 기간, 위탁 및 국외
          이전에 관한 자세한 사항은{" "}
          <Link
            href="/app-settings/privacy"
            className="text-orange-500 hover:underline"
          >
            앱 개인정보처리방침
          </Link>
          에서 확인할 수 있습니다. 같은 방침은 앱의 설정 화면에서도 볼 수
          있습니다.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
