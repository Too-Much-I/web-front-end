# 앱 설정 화면 웹뷰 페이지 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** React Native 앱의 설정 화면이 웹뷰로 띄울 개인정보 처리방침·이용약관·문의하기 페이지 3장을 `/app-settings` 아래에 만든다.

**Architecture:** 설정 화면 셸은 RN이 네이티브로 그리고, 이 레포는 문서성 페이지만 서빙한다. 웹의 `LegalPageLayout`에서 헤더·푸터(로고와 "홈으로" 링크)를 걷어낸 `AppDocLayout`을 새로 만들고, 조문 컴포넌트 `LegalSection`은 웹과 그대로 공유한다. 페이지 3장은 모두 서버 컴포넌트이며 API 호출도 클라이언트 상태도 없다. 그리고 그 앞단에서, 지금 루트 레이아웃이 모든 페이지에 붙이고 있는 웹 분석 도구를 `app-*` 웹뷰 라우트에서 걷어낸다.

**Tech Stack:** Next.js App Router (서버 컴포넌트), Tailwind v4, TypeScript. 새 의존성 없음.

**설계 문서:** `docs/superpowers/specs/2026-08-03-app-settings-webview-design.md`

## Global Constraints

모든 태스크의 요구사항에 아래가 암묵적으로 포함된다.

- **앱 밖으로 나가는 내부 링크 금지.** `/app-settings/*` 안에는 `next/link`의 `Link`도, `href="/"`도 없어야 한다. 웹뷰에서 마케팅 랜딩으로 빠져나가면 사용자가 앱 안에 갇힌다. 외부 링크는 `mailto:`와 `https://` 절대 URL만 허용한다.
- **`app-*` 라우트에는 웹 분석 도구를 로드하지 않는다.** Microsoft Clarity와 Google Analytics는 웹 화면 전용이다. 앱 쪽 분석은 네이티브 SDK 하나로 모으고 웹뷰 이벤트는 브릿지로 넘기는 것이 맞다(Task 1의 근거 참고).
- **`robots: { index: false, follow: false }`** — `src/app/app-settings/layout.tsx`에서 한 번 선언한다. 웹의 `/privacy`·`/terms`와 중복 색인되면 안 된다.
- **브랜드 색만 사용** — 바탕 `bg-orange-50/40`, 제목 `text-blue-950`, 본문 `text-zinc-600`, 액센트 `text-orange-500`. 새 액센트 색을 만들지 않는다.
- **`font-jua`를 쓰지 않는다.** 기존 `app-exam-screen`·`app-question-feedback` 레이아웃은 `font-jua`(Jua, 둥근 디스플레이 서체)를 쓰지만, 이 페이지들은 장문의 법률 문서라 가독성이 우선이다. 루트 레이아웃의 기본 `font-sans`를 그대로 쓴다.
- **반응형은 `sm → md → lg → xl`을 함께 정의**(CLAUDE.md 규칙). 본문 최대 폭은 `max-w-2xl`이다 — 웹 법률 페이지의 `max-w-3xl`보다 좁게 잡아 줄 길이를 유지한다.
- **React 19 관례** — `forwardRef`를 쓰지 않는다. 이 계획의 컴포넌트들은 `ref`가 필요 없다.
- **dev 서버를 직접 띄우지 않는다.** 사용자가 `pnpm dev`를 직접 실행한다. 육안 확인 단계는 이미 떠 있는 서버를 전제로 한다.
- **커밋 메시지는 한국어**로 쓰고 아래를 붙인다.
  ```
  Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
  ```
- **브랜치:** `feat/#TMI-55`. 이미 생성되어 있고 설계 문서 커밋(`a91633c`)이 얹혀 있다.

## 테스트에 관한 주의

**이 레포에는 테스트 프레임워크가 없다**(CLAUDE.md 명시). 따라서 이 계획은 단위 테스트 대신 아래 세 가지로 검증한다. 각 태스크에 실행 명령과 기대 출력을 그대로 적어 두었다.

1. `npx tsc --noEmit` — 타입
2. `pnpm lint`, `pnpm format:check` — 린트·포맷
3. `grep` 기반 계약 검증 — "앱 밖으로 나가는 링크가 없다" 같은 제약을 실제로 실행 가능한 명령으로 확인한다
4. 육안 확인 — 모바일 폭(375px)과 데스크톱 폭

## File Structure

| 파일 | 책임 |
| --- | --- |
| `src/components/analytics-gate.tsx` | 웹 분석 도구를 웹 화면에서만 렌더한다. `app-*` 라우트에서는 렌더하지 않는다 |
| `src/app/layout.tsx` (수정) | 분석 컴포넌트 두 개를 직접 렌더하는 대신 `AnalyticsGate` 하나를 렌더한다 |
| `src/app/app-settings/layout.tsx` | 세 페이지 공통 셸. `robots` noindex 선언, 하단 safe-area 처리 |
| `src/components/app-settings/app-doc-layout.tsx` | 제목 + 시행일 + 도입문 + 조문을 그리는 문서 레이아웃. 헤더·푸터 없음 |
| `src/app/app-settings/contact/page.tsx` | 문의하기. 웹 `/contact` 본문 재사용 |
| `src/app/app-settings/terms/page.tsx` | 앱 이용약관 |
| `src/app/app-settings/privacy/page.tsx` | 앱 개인정보 처리방침 |
| `docs/app-settings-webview.md` | RN 레포가 지켜야 할 계약(경로, 링크 가로채기, 헤더) |

`LegalSection`(`src/components/legal/legal-page-layout.tsx`)은 **수정하지 않고 그대로 import 해서 재사용**한다. 이미 크롬이 없고 조문 하나를 그리는 역할만 한다.

기존 웹 페이지 `/privacy`, `/terms`, `/contact`는 **건드리지 않는다.**

---

### Task 1: 앱 웹뷰 라우트에서 웹 분석 도구 제외

먼저 한다. 이후 태스크가 만드는 페이지들이 처음부터 분석 스크립트 없이 뜨고, 앱용 개인정보 처리방침의 조문(Task 4)이 이 결과에 의존하기 때문이다.

**근거:** 웹뷰에 웹 분석 SDK를 그대로 두면 같은 사용자가 네이티브 세션과 웹 세션으로 쪼개져 이용자 수가 중복 집계되고 퍼널이 끊긴다. 앱 쪽 분석은 네이티브 SDK 하나로 모으고, 웹뷰 화면의 이벤트는 `window.ReactNativeWebView.postMessage`로 RN에 넘겨 네이티브 SDK로 기록하는 것이 정석이다.

**앱은 Microsoft Clarity를 네이티브 SDK로 붙인다(사용자 결정).** 즉 이 태스크가 웹뷰에서 걷어내는 것은 *웹* Clarity 스크립트이지 Clarity 자체가 아니다. Google Analytics는 앱에 붙이지 않는다. 이 구분이 Task 4의 방침 조문에 그대로 반영된다.

이 변경은 새로 만드는 `/app-settings/*`뿐 아니라 **기존 `app-exam-screen`, `app-question-feedback`에도 함께 적용된다.** 셋 다 같은 이유로 웹 분석에서 빠져야 한다.

**Files:**
- Create: `src/components/analytics-gate.tsx`
- Modify: `src/app/layout.tsx:61-62`

**Interfaces:**
- Consumes: 기존 `ClarityAnalytics`(`src/components/clarity-analytics.tsx`), `GoogleAnalyticsTag`(`src/components/google-analytics.tsx`) — 둘 다 수정하지 않는다
- Produces:
  ```ts
  // src/components/analytics-gate.tsx
  export function AnalyticsGate(): React.JSX.Element | null;
  ```

- [ ] **Step 1: 게이트 컴포넌트를 만든다**

`src/components/analytics-gate.tsx`:

```tsx
"use client";

import { usePathname } from "next/navigation";

import { ClarityAnalytics } from "@/components/clarity-analytics";
import { GoogleAnalyticsTag } from "@/components/google-analytics";

/**
 * 웹 분석 도구(Microsoft Clarity, Google Analytics)를 웹 화면에서만 로드한다.
 *
 * app-* 라우트는 네이티브 앱이 웹뷰로 띄우는 화면이다. 여기에 웹 SDK를 그대로
 * 두면 같은 사용자가 네이티브 세션과 웹 세션으로 쪼개져 이용자 수가 중복
 * 집계되고 퍼널이 끊긴다. 앱 쪽 분석은 네이티브 SDK 하나로 모으고, 웹뷰
 * 화면의 이벤트는 브릿지로 넘기는 것이 맞다.
 *
 * 접두사로 가르는 이유: 앱 웹뷰 라우트는 app-exam-screen,
 * app-question-feedback, app-settings처럼 이미 app- 접두사를 관례로 쓰고 있고,
 * 웹 라우트 중에는 이 접두사로 시작하는 것이 없다.
 */
export function AnalyticsGate() {
  const pathname = usePathname();

  if (pathname.startsWith("/app-")) return null;

  return (
    <>
      <ClarityAnalytics />
      <GoogleAnalyticsTag />
    </>
  );
}
```

- [ ] **Step 2: 루트 레이아웃이 게이트를 쓰도록 바꾼다**

`src/app/layout.tsx`의 import 두 줄을 하나로 바꾼다.

바꾸기 전:
```tsx
import { ClarityAnalytics } from "@/components/clarity-analytics";
import { GoogleAnalyticsTag } from "@/components/google-analytics";
```

바꾼 후:
```tsx
import { AnalyticsGate } from "@/components/analytics-gate";
```

그리고 `body` 안의 두 줄을 한 줄로 바꾼다.

바꾸기 전:
```tsx
      <body className="flex min-h-full flex-col">
        <ClarityAnalytics />
        <GoogleAnalyticsTag />
        <Providers>{children}</Providers>
      </body>
```

바꾼 후:
```tsx
      <body className="flex min-h-full flex-col">
        <AnalyticsGate />
        <Providers>{children}</Providers>
      </body>
```

- [ ] **Step 3: 타입·린트·포맷을 확인한다**

Run:
```bash
npx tsc --noEmit && pnpm lint && pnpm format:check
```
Expected: 세 명령 모두 exit 0.

- [ ] **Step 4: 웹 화면에는 분석이 남아 있는지 확인한다**

`.env.local`에 `NEXT_PUBLIC_CLARITY_PROJECT_ID`가 설정되어 있어야 이 검증이 의미가 있다. 설정되어 있지 않으면 두 컴포넌트가 원래부터 `null`을 반환하므로, 먼저 확인한다.

Run:
```bash
grep -c 'NEXT_PUBLIC_CLARITY_PROJECT_ID=.\+' .env.local
```
Expected: `1`. `0`이면 분석 스크립트가 어차피 렌더되지 않으므로 Step 5의 비교가 무의미하다 — 이 경우 사용자에게 알리고 Step 6으로 넘어간다.

Run:
```bash
curl -s http://localhost:3000/ | grep -c 'microsoft-clarity'
```
Expected: `1` 이상 — 랜딩에는 Clarity가 그대로 붙는다.

- [ ] **Step 5: 앱 웹뷰 라우트에서 분석이 빠졌는지 확인한다**

Run:
```bash
for p in app-exam-screen app-question-feedback; do
  printf "%s: " "$p"
  curl -s "http://localhost:3000/$p" | grep -c 'microsoft-clarity\|googletagmanager'
done
```
Expected:
```
app-exam-screen: 0
app-question-feedback: 0
```

`grep -c`가 0을 반환하면 종료 코드가 1이라 `for` 루프가 멈추지는 않지만, 출력에 `0`이 찍히는지를 눈으로 확인한다.

- [ ] **Step 6: 커밋**

```bash
git add src/components/analytics-gate.tsx src/app/layout.tsx
git commit -m "refactor: 앱 웹뷰 라우트에서 웹 분석 도구 제외

Clarity와 GA가 루트 레이아웃에 있어 app-* 웹뷰 화면에도 붙고 있었다.
웹뷰에 웹 SDK를 두면 같은 사용자가 네이티브 세션과 웹 세션으로 쪼개져
이용자 수가 중복 집계되고 퍼널이 끊긴다. 앱 분석은 네이티브 SDK로
모으고 웹뷰 이벤트는 브릿지로 넘기는 것이 맞다.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: 라우트 셸과 문의하기 페이지

가장 단순한 페이지로 셸을 먼저 검증한다. 문의하기는 `AppDocLayout`을 쓰지 않는 중앙 정렬 카드형이라 Task 3과 독립적이다.

**Files:**
- Create: `src/app/app-settings/layout.tsx`
- Create: `src/app/app-settings/contact/page.tsx`

**Interfaces:**
- Consumes: Task 1의 `AnalyticsGate` (이 라우트에서 분석 스크립트가 빠진 상태를 전제한다)
- Produces: `/app-settings` 라우트 세그먼트와 그 아래 noindex 셸. Task 3·4의 페이지가 이 레이아웃 안에 들어간다.

- [ ] **Step 1: 라우트 셸을 만든다**

`src/app/app-settings/layout.tsx`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * 앱 설정 화면이 웹뷰로 띄우는 문서 페이지들의 공통 셸이다.
 *
 * 화면 상단의 뒤로가기와 타이틀바는 RN이 네이티브로 그린다. 그래서 여기서는
 * 상단 safe-area를 다루지 않고 하단 inset만 처리한다. 홈 인디케이터가 본문
 * 마지막 줄을 가리는 것만 막으면 된다.
 *
 * font-jua를 쓰는 다른 app-* 레이아웃과 달리 기본 font-sans를 쓴다.
 * 장문의 법률 문서라 가독성이 우선이다.
 */
export default function AppSettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className="min-h-dvh bg-orange-50/40"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: 문의하기 페이지를 만든다**

웹 `/contact`(`src/app/contact/page.tsx`)의 본문을 그대로 옮기되 `header` 전체와 `next/link` import를 제거한다. `main`의 `pb-24`는 유지한다.

`src/app/app-settings/contact/page.tsx`:

```tsx
import Image from "next/image";

export const metadata = {
  title: "문의하기 | 토선생",
};

const CONTACT_EMAIL = "tosunsaeng093@gmail.com";
const GMAIL_COMPOSE_URL = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=${encodeURIComponent(
  CONTACT_EMAIL,
)}&su=${encodeURIComponent("토선생 문의")}`;

export default function AppContactPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <div className="relative h-40 w-40 sm:h-48 sm:w-48">
        <Image
          src="/mascots/mail.png"
          alt="편지를 든 토선생 캐릭터"
          fill
          sizes="200px"
          className="object-contain"
        />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-blue-950 sm:text-3xl">
          문의하기
        </h1>
        <p className="text-sm leading-relaxed text-zinc-600 sm:text-base">
          서비스 이용 중 궁금한 점이나 의견이 있다면
          <br />이 메일로 보내주세요.
        </p>
      </div>

      <div className="rounded-full border border-orange-200 bg-white px-5 py-2 text-sm font-medium text-blue-950 sm:text-base">
        {CONTACT_EMAIL}
      </div>

      {/*
        이 두 링크는 웹뷰 안에서 열리면 안 된다. RN의
        onShouldStartLoadWithRequest가 mail.google.com과 mailto: 스킴을
        Linking.openURL로 넘긴다. docs/app-settings-webview.md 참고.
      */}
      <a
        href={GMAIL_COMPOSE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-12 items-center justify-center rounded-full bg-orange-500 px-8 text-base font-semibold text-white hover:bg-orange-600"
      >
        메일 보내기
      </a>

      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="text-xs text-zinc-400 hover:text-orange-500"
      >
        다른 메일 앱으로 보내기
      </a>
    </main>
  );
}
```

- [ ] **Step 3: 앱 밖으로 나가는 링크가 없는지 검증한다**

Run:
```bash
grep -rn 'next/link\|href="/"' src/app/app-settings/ || echo "OK: 내부 링크 없음"
```
Expected: `OK: 내부 링크 없음`

Run:
```bash
grep -rno 'href={\?"[^"]*"' src/app/app-settings/contact/page.tsx
```
Expected: `mailto:` 템플릿 리터럴과 `GMAIL_COMPOSE_URL` 변수 참조만 나오고, `/`로 시작하는 경로는 나오지 않는다.

- [ ] **Step 4: 타입·린트·포맷을 확인한다**

Run:
```bash
npx tsc --noEmit && pnpm lint && pnpm format:check
```
Expected: 세 명령 모두 에러 없이 종료(exit 0). `pnpm lint`는 `✔ No ESLint warnings or errors`를 출력한다.

포맷 에러가 나면 `pnpm format`으로 고치고 다시 실행한다.

- [ ] **Step 5: 육안으로 확인한다**

사용자가 띄워 둔 dev 서버에서 `http://localhost:3000/app-settings/contact`를 연다. 브라우저 개발자도구의 기기 툴바로 폭 375px과 데스크톱 폭을 각각 본다.

확인 사항:
- 상단에 로고나 "홈으로"가 없다
- 마스코트 이미지, 메일 주소, 버튼 두 개가 세로 중앙에 정렬된다
- 가로 스크롤이 생기지 않는다

- [ ] **Step 6: 커밋**

```bash
git add src/app/app-settings/layout.tsx src/app/app-settings/contact/page.tsx
git commit -m "feat(app-settings): 앱 웹뷰 문의하기 페이지 추가

RN 설정 화면이 띄울 /app-settings 라우트 셸을 만들고 문의하기를 옮겼다.
웹 /contact의 본문을 그대로 쓰되 로고·홈으로 헤더는 뺐다. 웹뷰에서
마케팅 랜딩으로 빠져나가면 앱 안에 갇히기 때문이다.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: 문서 레이아웃과 앱 이용약관

**Files:**
- Create: `src/components/app-settings/app-doc-layout.tsx`
- Create: `src/app/app-settings/terms/page.tsx`
- Read (수정하지 않음): `src/components/legal/legal-page-layout.tsx`, `src/app/terms/page.tsx`

**Interfaces:**
- Consumes: Task 2의 `src/app/app-settings/layout.tsx` 셸
- Produces:
  ```ts
  // src/components/app-settings/app-doc-layout.tsx
  export function AppDocLayout(props: {
    title: string;
    effectiveDateLabel: string;
    intro: React.ReactNode;
    children: React.ReactNode;
  }): React.JSX.Element;
  ```
  Task 4의 방침 페이지가 같은 컴포넌트를 쓴다. 조문은 기존 `LegalSection`을 `@/components/legal/legal-page-layout`에서 import 한다.

- [ ] **Step 1: 문서 레이아웃을 만든다**

`LegalPageLayout`(`src/components/legal/legal-page-layout.tsx:21-72`)에서 `header`와 `footer`를 뺀 형태다. `main`의 클래스는 `max-w-3xl` → `max-w-2xl`, `pt-6 pb-24` → `py-8`로 바꾸고 나머지 타이포는 그대로 둔다.

`src/components/app-settings/app-doc-layout.tsx`:

```tsx
/**
 * 앱 설정 화면이 웹뷰로 띄우는 법률 문서용 레이아웃이다.
 *
 * 웹의 LegalPageLayout에서 헤더와 푸터를 걷어낸 것이다. 그쪽에는 로고와
 * "홈으로" 링크가 있어서, 웹뷰에서 그대로 띄우면 사용자가 앱 안에서 마케팅
 * 랜딩으로 빠져나간다. 화면 헤더와 뒤로가기는 RN이 네이티브로 그린다.
 *
 * 조문은 LegalSection을 웹과 그대로 공유한다. 조문 타이포를 고칠 때 한 곳만
 * 고치면 되고, 웹과 앱의 조문 모양이 자동으로 같아진다.
 */
export function AppDocLayout({
  title,
  effectiveDateLabel,
  intro,
  children,
}: {
  title: string;
  effectiveDateLabel: string;
  intro: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-5 py-8 sm:px-6 md:px-8 lg:px-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-blue-950 sm:text-3xl md:text-3xl lg:text-4xl">
          {title}
        </h1>
        <p className="text-sm text-zinc-500 sm:text-base">
          {effectiveDateLabel}
        </p>
        <p className="text-sm leading-relaxed text-zinc-600 sm:text-base">
          {intro}
        </p>
      </div>

      {children}
    </main>
  );
}
```

- [ ] **Step 2: 앱 이용약관 페이지를 만든다**

웹 약관(`src/app/terms/page.tsx`)을 출발점으로 삼는다. **제1조·제5조·제7조·제8조·제10조·제11조·제12조·제13조는 웹 파일에서 조문을 그대로 옮긴다**(문구 변경 없음). 아래에 적은 조문만 새로 쓰거나 고친다.

파일의 머리 부분:

```tsx
import { AppDocLayout } from "@/components/app-settings/app-doc-layout";
import { LegalSection } from "@/components/legal/legal-page-layout";

export const metadata = {
  title: "이용약관 | 토선생",
};

const CONTACT_EMAIL = "tosunsaeng093@gmail.com";
// 앱 출시일에 맞춰 갱신한다. 웹 약관(2026년 7월 10일)과 본문이 다르므로
// 시행일도 따로 관리한다.
const EFFECTIVE_DATE = "2026년 8월 3일";

export default function AppTermsOfServicePage() {
  return (
    <AppDocLayout
      title="이용약관"
      effectiveDateLabel={`시행일자: ${EFFECTIVE_DATE}`}
      intro={
        <>
          이 약관은 토선생(이하 &ldquo;서비스&rdquo;)이 모바일 애플리케이션을
          통해 제공하는 토익 스피킹 모의고사 및 AI 채점·피드백 서비스의 이용과
          관련하여 서비스와 이용자 간의 권리, 의무 및 책임사항 등을 규정함을
          목적으로 합니다.
        </>
      }
    >
```

제1조는 웹과 동일하게 옮긴다. 제2조는 아래로 교체한다 — 매체가 웹사이트에서 앱으로 바뀌고, 이용자 구분 수단이 브라우저 익명 식별자에서 인증 토큰으로 바뀐다:

```tsx
      <LegalSection title="제2조 (정의)">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            &ldquo;앱&rdquo;이란 서비스가 제공하는 모바일 애플리케이션을
            의미합니다.
          </li>
          <li>
            &ldquo;서비스&rdquo;란 서비스가 앱을 통해 제공하는 토익 스피킹
            모의고사 응시, 음성 답변 녹음, AI 자동 채점 및 결과·피드백 제공
            등 일체의 서비스를 의미합니다.
          </li>
          <li>
            &ldquo;이용자&rdquo;란 이 약관에 따라 서비스가 제공하는 서비스를
            이용하는 자를 의미합니다. 서비스는 별도의 회원가입 절차 없이 앱이
            기기에 저장하는 인증 토큰을 통해 이용자를 구분합니다.
          </li>
          <li>
            &ldquo;답변 음성&rdquo;이란 이용자가 모의고사 응시 중 앱을 통해
            녹음하여 제출하는 음성 데이터를 의미합니다.
          </li>
          <li>
            &ldquo;학습 기록&rdquo;이란 이용자의 응시 이력, 채점 결과 및
            피드백 등 앱이 기기 또는 서버에 저장하는 이용 기록을 의미합니다.
          </li>
        </ol>
      </LegalSection>
```

제3조는 게시 위치만 바꾼다. 웹의 제3조를 옮기되 1항을 아래로 교체한다:

```tsx
          <li>
            서비스는 이 약관의 내용을 이용자가 알 수 있도록 앱의 설정 화면에
            게시합니다.
          </li>
```

제3조 2항·3항은 웹과 동일하게 옮긴다.

제4조는 웹의 제4조를 옮기되 1항의 "모의고사를 제공하고"는 그대로 두고, 2항의 "화면 구성"은 그대로 두며, 아래 4항을 **추가**한다 — 앱은 스토어를 통해 배포되므로 업데이트 조항이 필요하다:

```tsx
          <li>
            서비스는 기능 개선 및 오류 수정을 위하여 앱을 갱신할 수 있으며,
            이용자는 앱 마켓을 통해 최신 버전을 내려받아 이용할 수 있습니다.
            구버전을 계속 사용하는 경우 일부 기능이 제한될 수 있습니다.
          </li>
```

제5조는 웹과 동일하게 옮긴다.

제6조로 **새 조문**을 추가하고, 이후 조문 번호를 하나씩 밀어 쓴다(웹의 제6조 이용자의 의무 → 앱의 제8조가 된다). 새 조문 둘:

```tsx
      <LegalSection title="제6조 (학습 알림)">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            서비스는 이용자가 동의한 경우 오늘의 문제 안내, 학습 리마인드 등
            학습 알림을 푸시 알림으로 발송합니다.
          </li>
          <li>
            학습 알림 수신은 선택 사항이며, 수신에 동의하지 않더라도 모의고사
            응시 등 서비스의 핵심 기능 이용에는 제한이 없습니다.
          </li>
          <li>
            이용자는 앱의 설정 화면에 있는 학습 알림 설정 또는 기기의 운영체제
            알림 설정을 통해 언제든지 수신 동의를 철회할 수 있습니다.
          </li>
        </ol>
      </LegalSection>

      <LegalSection title="제7조 (학습 기록의 저장과 삭제)">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            서비스는 이용자에게 학습 이력을 제공하기 위하여 응시 이력, 채점
            결과 및 피드백 등의 학습 기록을 기기에 저장합니다.
          </li>
          <li>
            이용자는 앱의 설정 화면에 있는 「모든 학습 기록 삭제」를 통해
            저장된 학습 기록을 직접 삭제할 수 있습니다. 삭제된 학습 기록은
            복구할 수 없습니다.
          </li>
          <li>
            앱을 기기에서 삭제하는 경우에도 기기에 저장된 학습 기록과 인증
            토큰은 함께 삭제됩니다.
          </li>
        </ol>
      </LegalSection>
```

제8조(이용자의 의무)는 웹 제6조를 옮기되 첫 항을 아래로 교체한다:

```tsx
          <li>타인의 인증 토큰을 도용하거나 부정하게 사용하는 행위</li>
```

나머지 항과 제9조(서비스의 의무, 웹 제7조), 제10조(지식재산권, 웹 제8조), 제11조(AI 채점 결과의 성격, 웹 제9조), 제12조(책임의 제한, 웹 제10조), 제13조(미성년자, 웹 제11조), 제14조(준거법 및 관할법원, 웹 제12조), 제15조(문의처, 웹 제13조), 부칙은 **웹 파일에서 제목의 번호만 바꿔 그대로 옮긴다.**

제10조(지식재산권) 3항의 "서비스를 이용하여 얻은 정보"는 그대로 둔다.

부칙:

```tsx
      <LegalSection title="부칙">
        <p>이 약관은 {EFFECTIVE_DATE}부터 시행합니다.</p>
      </LegalSection>
    </AppDocLayout>
  );
}
```

- [ ] **Step 3: 조문 번호가 연속인지 검증한다**

조문을 옮겨 쓰면서 번호를 미는 작업이라 빠지거나 겹치기 쉽다. 실제로 확인한다.

Run:
```bash
grep -o 'title="제[0-9]*조' src/app/app-settings/terms/page.tsx | grep -o '[0-9]*'
```
Expected: `1`부터 `15`까지 중복·누락 없이 순서대로 출력된다.

Run:
```bash
grep -c 'LegalSection title=' src/app/app-settings/terms/page.tsx
```
Expected: `16` (제1조~제15조 + 부칙)

- [ ] **Step 4: 앱 밖으로 나가는 링크가 없는지 검증한다**

Run:
```bash
grep -rn 'next/link\|href="/"' src/app/app-settings/ src/components/app-settings/ || echo "OK: 내부 링크 없음"
```
Expected: `OK: 내부 링크 없음`

- [ ] **Step 5: 타입·린트·포맷을 확인한다**

Run:
```bash
npx tsc --noEmit && pnpm lint && pnpm format:check
```
Expected: 세 명령 모두 exit 0.

- [ ] **Step 6: 육안으로 확인한다**

`http://localhost:3000/app-settings/terms`를 폭 375px과 데스크톱 폭에서 본다.

확인 사항:
- 제목 "이용약관", 시행일자, 도입문이 순서대로 보이고 그 위에 아무 헤더도 없다
- 조문 제목과 본문의 크기·색이 `http://localhost:3000/terms`(웹)와 같다
- 본문이 `max-w-2xl` 안에 들어오고 가로 스크롤이 없다
- 페이지 맨 아래에 푸터("© 2026 토선생", "홈으로 돌아가기")가 없다

- [ ] **Step 7: 커밋**

```bash
git add src/components/app-settings/app-doc-layout.tsx src/app/app-settings/terms/page.tsx
git commit -m "feat(app-settings): 앱 웹뷰 이용약관 페이지 추가

LegalPageLayout에서 헤더·푸터만 걷어낸 AppDocLayout을 만들고 조문
컴포넌트 LegalSection은 웹과 그대로 공유한다. 약관 본문은 매체가 앱으로
바뀐 점, 이용자 구분이 인증 토큰인 점, 학습 알림과 학습 기록 삭제
조문을 반영해 새로 썼다.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: 앱 개인정보 처리방침

**Files:**
- Create: `src/app/app-settings/privacy/page.tsx`
- Read (수정하지 않음): `src/app/privacy/page.tsx`

**Interfaces:**
- Consumes: Task 3의 `AppDocLayout`, 기존 `LegalSection`, Task 1의 분석 제외 결과
- Produces: 없음 (최종 소비자)

**출발점:** 웹 방침(`src/app/privacy/page.tsx`)을 옮기되 아래 조문만 고친다. **제4조·제11조·제12조는 웹에서 그대로 옮긴다**(제3자 제공, 보호책임자, 구제방법 — 문구 변경 없음).

**행태정보 조문이 웹과 갈리는 지점:** 앱은 Microsoft Clarity를 **네이티브 SDK**로 붙이고, Google Analytics는 붙이지 않는다. 그래서 앱용 방침에서 Clarity는 위탁(제5조)·국외 이전(제6조)·자동 수집 장치(제10조)에 그대로 남기되, Google Analytics는 모든 조문에서 뺀다. 또한 앱의 Clarity는 쿠키가 아니라 SDK로 동작하므로 제10조의 서술을 쿠키 기준에서 SDK 기준으로 바꾼다.

- [ ] **Step 1: 파일의 머리와 제1조를 쓴다**

```tsx
import { AppDocLayout } from "@/components/app-settings/app-doc-layout";
import { LegalSection } from "@/components/legal/legal-page-layout";

export const metadata = {
  title: "개인정보처리방침 | 토선생",
};

const CONTACT_EMAIL = "tosunsaeng093@gmail.com";
// 앱 출시일에 맞춰 갱신한다. 웹 방침(2026년 7월 10일)과 본문이 다르므로
// 시행일도 따로 관리한다.
const EFFECTIVE_DATE = "2026년 8월 3일";

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
            기기에 저장하는 인증 토큰을 통해 이용자를 구분하고 응시 기록, 학습
            기록 및 동의 이력을 연결
          </li>
          <li>
            음성 답변 녹음 파일을 활용한 AI 자동 채점 및 채점 결과·피드백 제공
          </li>
          <li>음성 데이터 수집·이용 등 서비스 이용 동의 이력의 관리</li>
          <li>
            학습 알림 발송: 이용자가 수신에 동의한 경우 오늘의 문제 안내 및
            학습 리마인드 알림 발송
          </li>
          <li>
            만족도 조사 응답 분석 및 서비스 개선(별도 동의를 받아 수집한
            연락처는 응시권 발송 및 정식 서비스 출시 등 서비스 소식 안내
            목적으로 활용)
          </li>
          <li>서비스 이용 통계 분석 및 사용성 개선</li>
          <li>문의 응대 및 민원 처리</li>
        </ol>
      </LegalSection>
```

- [ ] **Step 2: 제2조(보유 기간)를 쓴다**

웹 제2조에서 맨 앞에 인증 토큰·푸시 토큰·학습 기록 세 항목을 넣고, "동의 이력(익명 식별자, ...)"은 "익명 식별자" → "인증 토큰"으로 바꾸며, **Clarity 항목은 앱 기준으로 고쳐 남기고 Google Analytics 항목은 뺀다.**

```tsx
      <LegalSection title="제2조 (개인정보의 처리 및 보유 기간)">
        <p>
          서비스는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터
          개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서
          개인정보를 처리·보유합니다. 각 개인정보 처리 항목별 보유 기간은
          다음과 같습니다.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            인증 토큰(액세스 토큰, 리프레시 토큰): 토큰 만료 시 파기하며,
            이용자가 앱의 「모든 학습 기록 삭제」를 실행하거나 앱을 기기에서
            삭제하는 경우 기기에 저장된 토큰은 즉시 파기
          </li>
          <li>
            기기에 저장되는 학습 기록(응시 이력, 채점 결과, 피드백): 이용자가
            「모든 학습 기록 삭제」를 실행하거나 앱을 기기에서 삭제할 때까지
            보관
          </li>
          <li>
            학습 알림 발송을 위한 푸시 토큰: 알림 수신 동의 철회 시 또는 앱
            삭제 시 지체 없이 파기
          </li>
          <li>
            음성 답변 녹음 파일: AI 채점 및 결과 제공 등 수집 목적 달성 후 30일
            이내 파기
          </li>
          <li>
            동의 이력(인증 토큰, 동의 항목·버전·일시·방법): 동의 철회 또는
            삭제 요청 시 지체 없이 파기하며, 별도 요청이 없는 경우 최종
            동의일로부터 3년간 보관 후 파기
          </li>
          <li>
            만족도 조사 응답: 조사 목적 달성 후 지체 없이 파기하되,
            통계·연구 목적으로는 개인을 식별할 수 없는 형태로 가공하여
            보관할 수 있음
          </li>
          <li>
            만족도 조사 시 별도 동의를 받아 수집한 연락처(전화번호 또는
            이메일): 응시권 발송 및 정식 서비스 출시 안내 시까지 보유하며,
            최대 수집일로부터 3개월 이내 파기
          </li>
          <li>
            앱 이용 행태정보(Microsoft Clarity): 세션 재생 데이터는 최대 30일,
            화면 이동·터치 등 집계 데이터는 최대 9개월간 보관(제10조 참조)
          </li>
        </ul>
      </LegalSection>
```

- [ ] **Step 3: 제3조(처리 항목)를 쓴다**

토큰과 푸시 토큰을 **자동 수집 항목**으로 분류하는 것이 핵심이다. 이용자가 입력하는 것이 아니라 앱이 발급받아 저장하기 때문이다.

```tsx
      <LegalSection title="제3조 (처리하는 개인정보의 항목)">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            모의고사 응시 시 수집: 음성 답변 녹음 파일, 동의 항목·일시·방법·버전
          </li>
          <li>
            만족도 조사 시 수집(선택): 만족도 점수, 이전 취득 등급, 지불
            의향, 의견, 연락처(전화번호 또는 이메일 — 응시권 발송 목적으로
            수집·이용에 대한 별도 동의를 받은 경우에 한하여 수집) 및 해당
            동의 이력(동의 여부·문구 버전·일시)
          </li>
          <li>
            앱 설치 및 이용 과정에서 자동으로 생성·수집: 인증 토큰(액세스
            토큰, 리프레시 토큰), 학습 알림 수신에 동의한 경우의 푸시 토큰,
            접속 IP 주소, 서비스 이용 기록, 기기·운영체제 정보, 앱 버전, 앱
            이용 행태정보(화면 이동 경로, 터치·스크롤 등 화면 조작 기록)
          </li>
        </ol>
        <p>
          서비스는 회원가입 절차를 두지 않으며 이름, 생년월일, 성별 등의
          정보를 수집하지 않습니다. 다만 인증 토큰은 특정 이용자의 응시 기록과
          학습 기록을 지속적으로 연결하는 식별자로 기능하므로, 서비스는 이를
          개인정보에 준하여 보호합니다.
        </p>
      </LegalSection>
```

- [ ] **Step 4: 제4조~제6조를 쓴다**

제4조(제3자 제공)는 웹에서 그대로 옮긴다.

제5조(위탁)는 웹의 표에서 Google LLC 행의 위탁업무에서 **Google Analytics를 빼고 FCM을 넣으며**, Microsoft 행은 **앱 기준으로 문구를 고쳐 남긴다.** APNs를 위한 Apple 행을 추가한다. 표의 `overflow-x-auto` 래퍼는 반드시 유지한다 — 375px 폭에서 표가 페이지 전체를 가로로 밀어내는 것을 막는다.

```tsx
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
                  스프레드시트), Android 기기로의 학습 알림 발송(Firebase
                  Cloud Messaging)
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 align-top">Apple Inc.</td>
                <td className="px-3 py-2 align-top">
                  iOS 기기로의 학습 알림 발송(Apple Push Notification service)
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 align-top">Microsoft Corporation</td>
                <td className="px-3 py-2 align-top">
                  앱 이용 행태 분석(Microsoft Clarity)
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
            </tbody>
          </table>
        </div>
        <p>
          음성 답변 채점을 위한 백엔드 서버는 서비스 운영팀이 직접 운영하며,
          별도의 외부 채점 업체에 위탁하지 않습니다. 다만 음성 답변 녹음
          파일의 저장을 위해 위 표와 같이 클라우드 스토리지를 이용합니다.
        </p>
      </LegalSection>
```

제6조(국외 이전)는 웹의 표에서 **Google Analytics 행을 빼고**, Microsoft 행은 앱 기준 문구로 고쳐 남기며, Google 스프레드시트 행은 "익명 식별자" → "인증 토큰"으로 바꾸고, 푸시 알림 행을 추가한다:

```tsx
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
                  기기 식별자, 화면 이동 경로, 터치·스크롤 등 행태정보
                </td>
                <td className="px-3 py-2 align-top">
                  앱 사용성 분석(Microsoft Clarity) 목적으로 앱 이용 시점에
                  네트워크를 통해 실시간 전송
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 align-top">Google LLC (미국)</td>
                <td className="px-3 py-2 align-top">
                  인증 토큰, 동의 이력, 만족도 조사 응답
                </td>
                <td className="px-3 py-2 align-top">
                  Google 스프레드시트 저장·관리 목적으로 응답 제출 시점에
                  전송
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 align-top">
                  Google LLC (미국), Apple Inc. (미국)
                </td>
                <td className="px-3 py-2 align-top">푸시 토큰, 알림 내용</td>
                <td className="px-3 py-2 align-top">
                  학습 알림 발송 목적으로 각 운영체제의 푸시 알림
                  서비스(Android는 Firebase Cloud Messaging, iOS는 Apple Push
                  Notification service)를 통해 알림 발송 시점에 전송
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          음성 답변 녹음 파일 자체는 국내 리전(AWS ap-northeast-2)에 위치한
          클라우드 스토리지에 저장되며, 국외로 이전되지 않습니다.
        </p>
        <p>
          위 국외 이전에 대해 거부하고자 하는 경우, 각 항목의 성격에 따라
          다음과 같이 거부할 수 있습니다.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Microsoft Clarity(행태정보): 제10조의 거부 방법을 통해 수집을
            중단할 수 있으며, 중단하더라도 모의고사 응시 등 핵심 기능 이용에는
            제한이 없습니다.
          </li>
          <li>
            푸시 알림 서비스(FCM·APNs): 앱의 설정 화면에 있는 학습 알림 설정을
            끄거나 기기의 운영체제 알림 설정에서 알림을 차단하면 푸시 토큰이
            전송되지 않으며, 차단하더라도 모의고사 응시 등 핵심 기능 이용에는
            제한이 없습니다.
          </li>
          <li>
            Google 스프레드시트(만족도 조사 응답): 만족도 조사는 선택적으로
            참여하는 절차이며, 설문에 응답을 제출하지 않으면 해당 정보가
            국외로 이전되지 않습니다. 이미 제출한 응답의 삭제를 원하는 경우
            제11조의 연락처로 요청할 수 있습니다.
          </li>
        </ul>
      </LegalSection>
```

> **확인 필요:** 앱이 Expo Push 등 중계 서비스를 거쳐 알림을 보낸다면 그 사업자(Expo, 미국)를 제5조 위탁 표와 제6조 이전 표에 모두 추가해야 한다. 앱 레포의 푸시 구현을 확인한 뒤 확정한다. 마지막 절의 미완료 항목에 포함되어 있다.

- [ ] **Step 5: 제7조·제8조·제9조를 쓴다**

제7조는 웹 제7조를 옮기되 2항 뒤에 직접 삭제 수단을 **추가**한다:

```tsx
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
            삭제」를 통해 기기에 저장된 학습 기록과 인증 토큰을 직접 삭제할 수
            있으며, 학습 알림 설정을 통해 알림 수신 동의를 직접 철회할 수
            있습니다.
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
```

제8조는 웹 제8조를 옮기되 3항을 **추가**한다:

```tsx
          <li>
            기기 내 파기: 기기에 저장된 학습 기록과 인증 토큰은 이용자가
            「모든 학습 기록 삭제」를 실행하거나 앱을 삭제할 때 기기에서
            삭제됩니다.
          </li>
```

제9조는 웹 제9조를 옮기되 1항을 교체하고 5항을 **추가**한다:

```tsx
          <li>
            최소 수집 설계: 회원가입·로그인 절차를 두지 않고 인증 토큰만으로
            서비스를 제공하여 불필요한 개인정보 수집을 최소화합니다.
          </li>
```

```tsx
          <li>
            인증 정보의 안전한 보관: 인증 토큰은 기기의 보안 저장소(iOS
            Keychain, Android Keystore)에 저장합니다.
          </li>
```

제9조의 2항·3항·4항은 웹과 동일하게 옮긴다.

- [ ] **Step 6: 제10조~제13조를 쓴다**

제10조는 웹의 쿠키 조문을 **옮기지 않고 아래로 교체한다.** 앱의 Clarity는 브라우저 쿠키가 아니라 네이티브 SDK로 동작하고, Google Analytics는 앱에 붙이지 않기 때문이다. 조문 번호는 유지한다:

```tsx
      <LegalSection title="제10조 (자동 수집 장치의 설치·운영 및 거부)">
        <p>
          서비스는 앱의 사용성 개선을 위하여 이용 행태 분석 도구인 Microsoft
          Clarity를 앱에 설치하여 운영합니다. Clarity는 이용자가 앱에서 이동한
          화면의 경로와 터치·스크롤 등 화면 조작 기록을 수집하며, 이를 세션
          재생 및 집계 형태로 제공합니다. 수집된 정보는 서비스 개선을 위한
          사용성 분석 목적으로만 사용됩니다.
        </p>
        <p>
          서비스는 Clarity를 통해 이름, 연락처 등 이용자를 직접 식별할 수 있는
          정보를 수집하지 않으며, 답변 음성과 채점 결과 등 학습 내용은 수집
          대상이 아닙니다.
        </p>
        <p>
          행태정보 수집을 원하지 않는 이용자는 제11조의 연락처로 수집 중단을
          요청할 수 있으며, 서비스는 지체 없이 조치합니다. 수집을 중단하더라도
          모의고사 응시 등 서비스의 핵심 기능 이용에는 제한이 없습니다.
          Microsoft Clarity의 데이터 처리에 관한 자세한 사항은 Microsoft의
          개인정보처리방침을 통해 확인할 수 있습니다.
        </p>
      </LegalSection>
```

> **후속 검토 사항:** 지금 조문은 수집 거부를 이메일 요청으로 받도록 적혀 있다. 설정 화면에 행태정보 수집 여부 토글을 두면 이용자가 직접 끌 수 있어 더 낫다. 앱 레포에서 검토할 항목이며 마지막 절에 적어 두었다.

제11조(보호책임자)와 제12조(구제방법)는 웹에서 그대로 옮긴다.

제13조는 고지 위치를 바꾼다:

```tsx
      <LegalSection title="제13조 (개인정보 처리방침의 변경)">
        <p>
          이 개인정보처리방침은 {EFFECTIVE_DATE}부터 적용됩니다. 법령·정책
          또는 서비스 내용의 변화에 따라 내용의 추가·삭제 및 수정이 있을
          시에는 변경사항의 시행 최소 7일 전부터 앱 내 공지 또는 설정 화면을
          통하여 고지할 것입니다.
        </p>
      </LegalSection>
    </AppDocLayout>
  );
}
```

- [ ] **Step 7: 조문 번호와 링크를 검증한다**

Run:
```bash
grep -o 'title="제[0-9]*조' src/app/app-settings/privacy/page.tsx | grep -o '[0-9]*'
```
Expected: `1`부터 `13`까지 중복·누락 없이 순서대로 출력된다.

Run:
```bash
grep -rn 'next/link\|href="/"' src/app/app-settings/ src/components/app-settings/ || echo "OK: 내부 링크 없음"
```
Expected: `OK: 내부 링크 없음`

Run:
```bash
grep -c 'overflow-x-auto' src/app/app-settings/privacy/page.tsx
```
Expected: `2` (제5조 위탁 표, 제6조 국외 이전 표)

Run:
```bash
grep -n '익명 식별자\|브라우저에 저장' src/app/app-settings/privacy/page.tsx || echo "OK: 웹 전용 표현 없음"
```
Expected: `OK: 웹 전용 표현 없음` — 앱 방침에 브라우저 기준 표현이 남아 있으면 안 된다.

Run:
```bash
grep -c 'Microsoft Clarity' src/app/app-settings/privacy/page.tsx
```
Expected: `3` 이상 — 앱은 Clarity를 네이티브 SDK로 쓰므로 제2조·제5조·제6조·제10조에 남아 있어야 한다.

Run:
```bash
grep -n 'Google Analytics\|googletagmanager' src/app/app-settings/privacy/page.tsx || echo "OK: GA 언급 없음"
```
Expected: `OK: GA 언급 없음` — GA는 앱에 붙이지 않으므로 방침에 남아 있으면 실제와 어긋난다.

- [ ] **Step 8: 타입·린트·포맷을 확인하고 육안 확인한다**

Run:
```bash
npx tsc --noEmit && pnpm lint && pnpm format:check
```
Expected: 세 명령 모두 exit 0.

`http://localhost:3000/app-settings/privacy`를 폭 375px에서 본다.

확인 사항:
- 제5조·제6조의 표가 **표 안에서만** 가로 스크롤되고, 페이지 본문은 가로로 밀리지 않는다
- 조문 번호가 제1조부터 제13조까지 순서대로 보인다
- 상단 헤더와 하단 푸터가 없다

- [ ] **Step 9: 커밋**

```bash
git add src/app/app-settings/privacy/page.tsx
git commit -m "feat(app-settings): 앱 웹뷰 개인정보 처리방침 페이지 추가

로그인이 없어도 인증 토큰이 학습 기록을 지속적으로 연결하는 식별자로
기능하므로 자동 수집 항목으로 명시했다. 푸시 토큰과 기기 내 학습 기록의
보유·파기 조문, 설정 화면에서 직접 삭제·철회할 수 있다는 권리 행사
조문을 함께 넣었다.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: RN 계약 문서

앱 레포는 이 레포와 코드를 공유하지 않으므로(설계 문서 1절 참고), 계약을 글로 남기지 않으면 전달되지 않는다.

**Files:**
- Create: `docs/app-settings-webview.md`

**Interfaces:**
- Consumes: Task 2~4가 만든 세 경로, Task 1의 분석 제외
- Produces: 없음

- [ ] **Step 1: 계약 문서를 쓴다**

`docs/app-settings-webview.md`:

````markdown
# 앱 설정 화면 웹뷰 계약

RN 앱의 설정 화면이 웹뷰로 띄우는 페이지와 그 전제를 적는다. 설계 배경은
`docs/superpowers/specs/2026-08-03-app-settings-webview-design.md`에 있다.

## 경로

세 개가 계약이며 쿼리 파라미터는 쓰지 않는다.

| 설정 항목 | 경로 |
| --- | --- |
| 개인정보 처리방침 | `/app-settings/privacy` |
| 이용약관 | `/app-settings/terms` |
| 문의하기 | `/app-settings/contact` |

## RN이 지켜야 하는 것

**1. 화면 헤더는 RN이 그린다.** 웹 페이지에는 뒤로가기 버튼도 타이틀바도
없다. 웹은 상단 safe-area를 다루지 않고 하단 inset만 처리한다
(`src/app/app-settings/layout.tsx`).

**2. 외부 링크는 웹뷰 밖으로 넘긴다.** 문의하기의 `mailto:`와 Gmail 작성
링크가 웹뷰 안에서 열리면 앱이 메일 화면에 갇힌다.

```tsx
<WebView
  source={{ uri: `${WEB_BASE_URL}/app-settings/contact` }}
  onShouldStartLoadWithRequest={(request) => {
    const isExternal =
      !request.url.startsWith(WEB_BASE_URL) ||
      request.url.startsWith("mailto:");
    if (isExternal) {
      Linking.openURL(request.url);
      return false;
    }
    return true;
  }}
/>
```

**3. 이 페이지들은 앱 밖으로 나가는 내부 링크를 두지 않는다.** 웹 쪽 제약이며
`grep -rn 'next/link\|href="/"' src/app/app-settings/`로 확인할 수 있다.

## 웹 쪽 제약

- `robots` noindex — 웹의 `/privacy`·`/terms`와 중복 색인되면 안 된다.
- 시행일(`EFFECTIVE_DATE`)은 웹 문서와 따로 관리한다. 본문이 다르기 때문이다.
- **`app-*` 라우트에는 웹 분석 도구가 붙지 않는다.** `src/components/analytics-gate.tsx`가
  경로 접두사로 가른다. 웹뷰에 웹 SDK를 두면 같은 사용자가 네이티브 세션과 웹
  세션으로 쪼개져 이용자 수가 중복 집계되고 퍼널이 끊기기 때문이다.

## 앱 쪽 분석

앱의 이용 분석은 네이티브 SDK 하나로 모은다. 웹뷰 화면에서 일어난 일을 남기고
싶으면 웹 SDK를 붙이지 말고 브릿지로 넘긴다.

```js
window.ReactNativeWebView?.postMessage(
  JSON.stringify({ type: "analytics", event: "privacy_viewed" }),
);
```

RN이 `onMessage`로 받아 네이티브 SDK로 기록한다. 어떤 도구를 쓸지는 앱 레포의
결정이며 아직 정하지 않았다.
````

- [ ] **Step 2: 세 경로가 실제로 응답하는지 확인한다**

Run:
```bash
for p in privacy terms contact; do
  printf "%s: " "$p"
  curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/app-settings/$p"
done
```
Expected:
```
privacy: 200
terms: 200
contact: 200
```

- [ ] **Step 3: noindex가 실제로 나가는지 확인한다**

Run:
```bash
curl -s http://localhost:3000/app-settings/privacy | grep -o '<meta name="robots"[^>]*>'
```
Expected: `<meta name="robots" content="noindex, nofollow"/>`

- [ ] **Step 4: 커밋**

```bash
git add docs/app-settings-webview.md
git commit -m "docs: 앱 설정 웹뷰 계약 문서 추가

경로 3개, RN의 외부 링크 가로채기, 헤더를 누가 그리는지를 적었다.
앱 레포와 코드를 공유하지 않으므로 글로 남기지 않으면 전달되지 않는다.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## 완료 후 남는 것 (이 계획의 범위 밖)

구현이 끝나도 아래는 **하지 않은 상태**로 남는다. 스스로 진행하지 말고 사용자에게 알린다.

- **법률 검토.** 앱용 방침·약관은 웹 버전을 앱 상황에 맞춰 고친 초안이며 법률 자문이 아니다. 공개 전 검토가 필요하다.
- **앱에 Clarity 네이티브 SDK 실제 적용.** 앱용 방침은 앱이 Microsoft Clarity를 쓰는 것을 전제로 쓰여 있다. 앱 레포에서 SDK를 붙이지 않으면 방침이 실제보다 넓게 적혀 있는 상태가 된다. 반대로 Clarity 외의 도구를 추가로 붙이면 제2조·제3조·제5조·제6조·제10조에 그 사업자를 추가해야 한다.
- **행태정보 수집 거부 토글 검토.** 지금 제10조는 수집 거부를 이메일 요청으로 받도록 적혀 있다. 설정 화면에 토글을 두면 이용자가 직접 끌 수 있어 더 낫다.
- **푸시 제공자 확정.** 제5조 위탁 표와 제6조 국외 이전 표의 FCM·APNs 행은 앱이 중계 서비스(Expo Push 등)를 쓰는 경우 이전받는 자를 추가해야 한다.
- **시행일 확정.** 두 문서의 `EFFECTIVE_DATE`가 `2026년 8월 3일`로 되어 있다. 실제 앱 출시일로 갱신해야 한다.
- **RN 설정 화면.** 리스트, 학습 알림 토글, 앱 평가하기, 버전 정보, 모든 학습 기록 삭제는 앱 레포에서 네이티브로 만든다.
- **마이크·음향 테스트.** 1차 범위에서 제외했다. 시험 녹음 구조가 확정된 뒤 결정한다.
