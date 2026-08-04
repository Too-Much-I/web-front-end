# 앱 피드백 에러 화면 "홈으로" 버튼 설계

## 문제

`ErrorFallbackScreen`(`src/components/error-fallback-screen.tsx`)은 서버 에러가 났을 때
쓰는 공용 폴백 화면이고, "홈으로 돌아가기" 버튼이 항상 `<Link href="/">`로
하드코딩되어 있다.

이 컴포넌트는 다음 세 경로에서 쓰인다.

- `/app-exam-screen` (`src/app/app-exam-screen/page.tsx`) — 채점 결과 조회 실패
- `/app-question-feedback` (`src/app/app-question-feedback/page.tsx`) — 문제별 피드백 조회 실패
- `src/app/error.tsx` — 모든 라우트의 렌더 에러를 잡는 전역 에러 바운더리 (위 두 앱 라우트에서
  발생한 렌더 에러도 여기로 온다)

앞의 두 경로는 RN 앱이 웹뷰로 띄우는 화면이다. 여기서 "홈으로 돌아가기"를 누르면
같은 웹뷰 안에서 `/`(마케팅 랜딩 페이지)로 이동해버려서, 사용자가 앱 안에 웹
화면이 뜬 상태에 갇힌다.

## 범위

- 고치는 파일은 `src/components/error-fallback-screen.tsx` 하나다. 위 세 경로 모두
  이 컴포넌트를 통해서 문제가 발생하므로, 여기 하나만 고치면 세 곳 다 해결된다.
- `src/app/exam/result/question`(웹 라우트지만 `?source=app` 쿼리로도 열리는 경로)은
  범위에서 뺀다 — 앱은 이 라우트를 호출하지 않는다.
- `/exam/result`, `/exam/result/question`, `grading-wait-screen.tsx`(전부 순수 웹 라우트)의
  기존 동작(`Link href="/"`)은 그대로 둔다.

## 판별 방식

`ErrorFallbackScreen`을 `"use client"`로 바꾸고 `usePathname()`으로 자체 판별한다.

```tsx
const pathname = usePathname();
const isAppWebview = pathname.startsWith("/app-");
```

`src/components/analytics-gate.tsx`가 이미 같은 방식(`pathname.startsWith("/app-")`)으로
웹/앱 라우트를 가르고 있어 새 개념을 도입하지 않는다. 호출부
(`app-exam-screen/page.tsx`, `app-question-feedback/page.tsx`, `error.tsx`) 세 곳 모두
아무것도 바꾸지 않아도 되고, 앞으로 `/app-*` 라우트가 늘어나도 자동으로 적용된다.

## 버튼 동작 분기

- `isAppWebview`가 true면 `<Link href="/">` 대신 `<button type="button" onClick={...}>`을
  쓰고, 클릭 시 네이티브로 `{ type: "GO_HOME_REQUESTED" }` 메시지 하나만 보낸다.
  화면이 스스로 이동하지 않는다 — `REANSWER_REQUESTED`(`QuestionFeedbackScreen.tsx`)와
  같은 fire-and-forget 패턴이다. 실제로 앱 홈으로 이동하는 처리는 RN 쪽(별도 레포)의
  몫이라 이 레포 범위 밖이다.
- 그 외에는 기존 그대로 `<Link href="/">`.
- 버튼 라벨("홈으로 돌아가기")과 스타일(className)은 두 경우 다 동일하게 유지한다 —
  사용자가 원하는 것(홈으로 가기)은 같고 그 목적지 판단만 달라지는 것이다.

## 메시지 계약

```ts
type GoHomeRequestedMessage = {
  type: "GO_HOME_REQUESTED";
};
```

`REANSWER_REQUESTED`, `FEEDBACK_GO_BACK` 등 기존 메시지와 같은 '동사+REQUESTED/상태' 명명
관례를 따른다. RN 쪽에 사전에 합의된 이름이 없으므로 이번에 새로 정의한다. RN 쪽은 이
메시지를 받으면 웹뷰를 닫고 앱 홈 탭으로 이동하는 처리를 하면 된다(구현은 앱 레포 몫).

## 리팩터: 네이티브 브릿지 공용 모듈

`window.ReactNativeWebView` 전역 타입 선언과 `postToNative()` 함수가 지금
`FeedbackScreen.tsx`와 `QuestionFeedbackScreen.tsx`에 각각 따로 선언돼 있다. 이번에
`ErrorFallbackScreen.tsx`가 세 번째로 같은 걸 쓰게 되므로, `src/lib/native-bridge.ts`로
뽑아서 세 파일이 공유하게 한다.

```ts
// src/lib/native-bridge.ts
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage(message: string): void;
    };
  }
}

export function postToNative(message: object) {
  window.ReactNativeWebView?.postMessage(JSON.stringify(message));
}
```

`FeedbackScreen.tsx`, `QuestionFeedbackScreen.tsx`는 각자의 로컬 선언/함수를 지우고 이
모듈을 import해서 쓰도록 바꾼다. 동작 변화는 없고 중복 제거만 한다.

## 테스트/검증 계획

이 레포에는 테스트 프레임워크가 없으므로(`CLAUDE.md`), 다음으로 확인한다.

- `npx tsc --noEmit`으로 타입 체크
- `pnpm lint`
- 수동 확인: `/app-exam-screen?examId=존재하지않는id`, `/app-question-feedback?examId=존재하지않는id&questionNumber=1`로 접속해 에러 화면을 띄우고, "홈으로 돌아가기"가 `<Link>`가 아니라 `<button>`으로 렌더되는지, 클릭 시 콘솔/네트워크에서 `window.ReactNativeWebView`가 없는 브라우저 환경에서는 조용히 아무 일도 안 일어나는지(에러 안 남) 확인
- `/exam/result?examId=...` 등 기존 웹 라우트에서는 여전히 `<Link href="/">`로 렌더되는지 확인
