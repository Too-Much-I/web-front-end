# 앱 피드백 에러 화면 "홈으로" 버튼 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/app-exam-screen`, `/app-question-feedback` 앱 웹뷰 화면에서 에러가 났을 때 뜨는 "홈으로 돌아가기" 버튼이 웹 홈(`/`)으로 이동하는 대신 네이티브 앱에 `GO_HOME_REQUESTED` 메시지를 보내도록 고친다.

**Architecture:** 공용 `ErrorFallbackScreen` 컴포넌트 하나가 `usePathname()`으로 `/app-` 접두사 라우트인지 스스로 판별해서 버튼을 `<Link href="/">` 또는 네이티브 브릿지로 메시지를 보내는 `<button>`으로 분기 렌더링한다. 기존에 두 파일에 중복돼 있던 `window.ReactNativeWebView` 타입 선언과 `postMessage` 헬퍼는 `src/lib/native-bridge.ts`로 뽑아 세 파일이 공유한다.

**Tech Stack:** Next.js App Router (React 19, "use client" 컴포넌트), TypeScript strict mode.

## Global Constraints

- 이 레포에는 테스트 프레임워크가 없다(`CLAUDE.md`) — 각 태스크의 검증은 `npx tsc --noEmit`과 `pnpm lint`로 한다.
- 개발 서버(`pnpm dev`)는 사용자가 직접 띄운다 — 구현 중에 임의로 실행/재시작하지 않는다. 브라우저 수동 확인이 필요한 단계는 사용자에게 안내만 하고 직접 실행은 사용자에게 맡긴다.
- 메시지 타입명은 `GO_HOME_REQUESTED`, 필드는 `{ type: "GO_HOME_REQUESTED" }` 하나뿐이다(설계 문서 `docs/superpowers/specs/2026-08-04-app-feedback-error-home-button-design.md` 참고).
- 범위는 `/app-exam-screen`, `/app-question-feedback` 두 라우트와 이 둘을 통해 렌더되는 전역 `src/app/error.tsx`까지다. `/exam/result/question`의 `?source=app` 케이스는 범위 밖(사용자가 명시적으로 제외).
- 버튼 라벨("홈으로 돌아가기")과 시각 스타일은 두 분기 모두 동일하게 유지한다.

---

### Task 1: 네이티브 브릿지 공용 모듈 생성

**Files:**
- Create: `src/lib/native-bridge.ts`

**Interfaces:**
- Produces: `postToNative(message: object): void` — Task 2, 3, 4가 이 함수를 import해서 쓴다. `Window.ReactNativeWebView` 전역 타입도 이 파일에서 한 번만 선언한다.

- [ ] **Step 1: `src/lib/native-bridge.ts` 작성**

```ts
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage(message: string): void;
    };
  }
}

/** 웹뷰 → 네이티브 앱으로 타입드 메시지를 보낸다. RN이 onMessage로 받아 처리한다. */
export function postToNative(message: object) {
  window.ReactNativeWebView?.postMessage(JSON.stringify(message));
}
```

- [ ] **Step 2: 타입 체크로 검증**

Run: `npx tsc --noEmit`
Expected: 에러 없음 (이 시점엔 아직 아무도 이 파일을 import하지 않으므로 기존과 동일하게 통과)

- [ ] **Step 3: 커밋**

```bash
git add src/lib/native-bridge.ts
git commit -m "feat: 네이티브 웹뷰 브릿지 공용 모듈 추가"
```

---

### Task 2: `FeedbackScreen.tsx`가 공용 브릿지를 쓰도록 이관

**Files:**
- Modify: `src/components/app-exam-screen/FeedbackScreen.tsx:1-47` (import, 로컬 `declare global` 제거), `:71-77` (postMessage 호출부)

**Interfaces:**
- Consumes: `postToNative(message: object): void` (Task 1에서 생성)

- [ ] **Step 1: import 추가 및 로컬 `declare global` 블록 제거**

`src/components/app-exam-screen/FeedbackScreen.tsx` 17번째 줄(`import type { ExamGradingResult } from "@/types/exam";`) 바로 다음에 추가:

```ts
import { postToNative } from "@/lib/native-bridge";
```

그리고 아래 블록(현재 34~40번째 줄)을 통째로 삭제한다:

```ts
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage(message: string): void;
    };
  }
}
```

- [ ] **Step 2: `window.ReactNativeWebView?.postMessage(...)` 호출을 `postToNative`로 교체**

찾기(현재 71~77번째 줄):

```ts
  useEffect(() => {
    const message: FeedbackNavigationStateMessage = {
      type: "FEEDBACK_NAVIGATION_STATE",
      canGoBackWithinFeedback: currentStep > 0,
    };
    window.ReactNativeWebView?.postMessage(JSON.stringify(message));
  }, [currentStep]);
```

교체:

```ts
  useEffect(() => {
    const message: FeedbackNavigationStateMessage = {
      type: "FEEDBACK_NAVIGATION_STATE",
      canGoBackWithinFeedback: currentStep > 0,
    };
    postToNative(message);
  }, [currentStep]);
```

- [ ] **Step 3: 타입 체크 + 린트로 검증**

Run: `npx tsc --noEmit && pnpm lint`
Expected: 에러 없음. (`window.ReactNativeWebView` 직접 참조가 이 파일에 더 이상 없으므로 로컬 `declare global` 제거로 인한 타입 에러가 없어야 한다.)

- [ ] **Step 4: 커밋**

```bash
git add src/components/app-exam-screen/FeedbackScreen.tsx
git commit -m "refactor(app-exam-screen): 네이티브 브릿지 공용 모듈 사용"
```

---

### Task 3: `QuestionFeedbackScreen.tsx`가 공용 브릿지를 쓰도록 이관

**Files:**
- Modify: `src/components/app-question-feedback/QuestionFeedbackScreen.tsx:1-58` (import, 로컬 `postToNative` 함수 제거)

**Interfaces:**
- Consumes: `postToNative(message: object): void` (Task 1에서 생성)

- [ ] **Step 1: import 추가**

`src/components/app-question-feedback/QuestionFeedbackScreen.tsx` 28번째 줄(`import type { ExamQuestionDetail } from "@/types/exam";`) 바로 다음에 추가:

```ts
import { postToNative } from "@/lib/native-bridge";
```

- [ ] **Step 2: 로컬 `postToNative` 함수 제거**

아래 블록(현재 56~58번째 줄)을 삭제한다:

```ts
function postToNative(message: object) {
  window.ReactNativeWebView?.postMessage(JSON.stringify(message));
}
```

(이 파일 안에서 `postToNative`를 호출하는 두 곳 — `DeckNavigationStateMessage` 전송부와 `requestReanswer()`의 `ReanswerRequestedMessage` 전송부 — 는 코드 변경 없이 그대로 두면 이제 import된 공용 함수를 쓰게 된다.)

- [ ] **Step 3: 타입 체크 + 린트로 검증**

Run: `npx tsc --noEmit && pnpm lint`
Expected: 에러 없음

- [ ] **Step 4: 커밋**

```bash
git add src/components/app-question-feedback/QuestionFeedbackScreen.tsx
git commit -m "refactor(app-question-feedback): 네이티브 브릿지 공용 모듈 사용"
```

---

### Task 4: `ErrorFallbackScreen`이 앱 웹뷰에서 "홈으로"를 네이티브 메시지로 분기

**Files:**
- Modify: `src/components/error-fallback-screen.tsx` (전체 재작성 수준)

**Interfaces:**
- Consumes: `postToNative(message: object): void` (Task 1에서 생성)
- Produces: 이 컴포넌트의 외부 props 시그니처(`title`, `description`, `onRetry`)는 변경 없음 — 기존 호출부(`app/error.tsx`, `app-exam-screen/page.tsx`, `app-question-feedback/page.tsx`, `exam/result/page.tsx`, `exam/result/question/page.tsx`, `grading-wait-screen.tsx`) 전부 코드 변경 불필요.

- [ ] **Step 1: `src/components/error-fallback-screen.tsx` 전체를 아래로 교체**

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { postToNative } from "@/lib/native-bridge";

type GoHomeRequestedMessage = {
  type: "GO_HOME_REQUESTED";
};

const HOME_BUTTON_CLASSNAME =
  "flex h-11 items-center rounded-full border border-orange-200 bg-white px-6 text-base font-semibold text-orange-600 transition-colors hover:bg-orange-50 lg:h-12 lg:px-7 lg:text-lg";

/**
 * 서버 응답을 받지 못했을 때(채점 결과/피드백 조회 실패, 채점 에러 등) 쓰는 공용 폴백 화면.
 * 404 페이지(src/app/not-found.tsx)와 같은 디자인 언어를 공유한다.
 *
 * "홈으로 돌아가기"는 /app-* 웹뷰 라우트(app-exam-screen, app-question-feedback)에서
 * 열렸을 때는 "/"로 이동하지 않는다 — 웹뷰 안에서 그대로 열리면 사용자가 앱 안에 웹
 * 마케팅 홈이 뜬 채로 갇힌다. 대신 네이티브에 GO_HOME_REQUESTED를 보내고 실제 이동은
 * 앱이 처리한다.
 */
export function ErrorFallbackScreen({
  title = "잠깐 문제가 생겼어요",
  description,
  onRetry,
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
}) {
  const pathname = usePathname();
  const isAppWebview = pathname.startsWith("/app-");

  function requestGoHome() {
    const message: GoHomeRequestedMessage = { type: "GO_HOME_REQUESTED" };
    postToNative(message);
  }

  return (
    <div
      role="alert"
      className="flex flex-1 flex-col items-center justify-center bg-orange-50/40 px-6 py-16 text-center"
    >
      <p
        aria-hidden
        className="font-jua text-7xl leading-none text-orange-500 sm:text-8xl md:text-9xl lg:text-[9rem]"
      >
        OOPS!
      </p>

      <div className="relative z-10 -mt-2 w-[130px] sm:-mt-4 sm:w-[160px] md:w-[180px] lg:w-[200px]">
        <Image
          src="/mascots/error.png"
          alt="눈이 핑핑 도는 토끼 캐릭터"
          width={800}
          height={1372}
          priority
          className="h-auto w-full"
        />
      </div>

      <h2 className="font-jua mt-8 text-2xl text-blue-950 sm:text-3xl md:text-4xl lg:text-[2.5rem]">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-500 sm:text-base md:text-lg lg:text-xl">
        {description}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex h-11 items-center rounded-full bg-orange-500 px-6 text-base font-semibold text-white transition-colors hover:bg-orange-600 lg:h-12 lg:px-7 lg:text-lg"
          >
            다시 시도하기
          </button>
        )}
        {isAppWebview ? (
          <button
            type="button"
            onClick={requestGoHome}
            className={HOME_BUTTON_CLASSNAME}
          >
            홈으로 돌아가기
          </button>
        ) : (
          <Link href="/" className={HOME_BUTTON_CLASSNAME}>
            홈으로 돌아가기
          </Link>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 타입 체크 + 린트로 검증**

Run: `npx tsc --noEmit && pnpm lint`
Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add src/components/error-fallback-screen.tsx
git commit -m "fix(error-fallback): 앱 웹뷰에서 홈으로 버튼이 네이티브 홈 이동을 요청하도록 변경"
```

---

### Task 5: 전체 동작 수동 확인

**Files:** 없음 (검증 전용 태스크)

**Interfaces:** 없음

- [ ] **Step 1: 빌드 전체 검증**

Run: `npx tsc --noEmit && pnpm lint`
Expected: 둘 다 에러 없음

- [ ] **Step 2: 사용자에게 수동 확인 안내**

이 레포는 개발 서버를 에이전트가 직접 띄우지 않는다 — 사용자가 `pnpm dev`를 이미 띄워 두었다면 아래를 직접 확인해 달라고 안내한다.

1. `http://localhost:3000/app-exam-screen?examId=존재하지않는id` 접속 → 에러 화면에서 "홈으로 돌아가기"가 `<a href="/">`가 아니라 `<button>`으로 렌더되는지(브라우저 개발자 도구 Elements 탭에서 확인)
2. `http://localhost:3000/app-question-feedback?examId=존재하지않는id&questionNumber=1` 접속 → 동일하게 `<button>`인지 확인
3. 위 두 화면에서 버튼 클릭 시 콘솔에 에러가 없는지(브라우저 환경엔 `window.ReactNativeWebView`가 없으므로 `postToNative`가 조용히 아무 일도 안 해야 정상)
4. `http://localhost:3000/exam/result?examId=존재하지않는id` 접속 → 에러 화면의 "홈으로 돌아가기"가 여전히 `<a href="/">`로 렌더되고 클릭 시 실제로 `/`로 이동하는지(회귀 확인)

- [ ] **Step 3: 최종 커밋 (필요 시)**

수동 확인에서 문제가 없으면 별도 커밋 불필요 — Task 1~4의 커밋으로 이미 반영 완료. 문제가 발견되면 해당 태스크로 돌아가 수정 후 재커밋한다.
