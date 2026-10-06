# 종합 피드백 강제 업데이트

`/app-exam-screen`은 summary API envelope의 `result.appUpdateRequired === true`일 때 업데이트 안내로 대체한다. 직접 API와 네이티브 데이터 브리지 모두 envelope를 벗긴 result를 `createAppExamSummary`에 전달한다. 피드백 본문 검사와 매핑보다 먼저 판별하며, false·누락·문자열 등은 기존 피드백 흐름을 유지한다. 문항별 피드백과 재답변 화면은 변경하지 않는다.

업데이트 상태도 `FEEDBACK_DATA_READY`를 보내며 재시도 다이얼로그를 마운트하지 않는다. 재생성의 completed 이벤트로 전달된 result도 같은 판별을 적용하고 재시도 세션 상태를 정리한다.

## 스토어

구버전은 두 스토어 링크를 표시한다. UA로 플랫폼을 추정하지 않는다. `ReactNativeWebView`가 존재하고 문서 시작 시 주입된 `__nativeCapabilities.platform`과 `storeUrl`이 해당 플랫폼의 공식 앱 HTTPS 주소로 확인되면 해당 링크 하나만 표시한다. 잘못된 URL·플랫폼·누락 값은 두 링크로 폴백한다. 기본 URL은 `site-config.ts`를 사용한다.

링크는 일반 HTTPS 링크이며 같은 창에서 이동한다. 로컬 브라우저에서 링크 탐색 요청까지 검증했으나, 외부 OS 스토어 앱 실행을 보장하는 것은 아니다. 참고한 앱 저장소의 FeedbackScreen에는 외부 스토어 전용 링크 처리가 없고 `setSupportMultipleWindows={false}`가 설정되어 있다. 실제 배포된 구버전 iOS/Android WebView에서 두 버튼을 각각 눌러 외부 스토어 실행과 업데이트 후 복귀를 검증해야 한다. 네이티브 코드는 변경하지 않았다.

추가 한계: 현재 참고한 앱의 `pollSummaryFeedbackUntilComplete`는 피드백 완전성 검사를 통과한 result만 웹에 전달한다. 따라서 재생성 중 본문 없이 업데이트 플래그만 반환하면 앱에서 전달하지 않고 타임아웃할 수 있다. 웹에 전달된 응답은 처리하지만 이 네이티브 전달 조건은 이번 웹 변경의 범위 밖이다.

## 개발 미리보기와 검증

`pnpm dev` 후 http://localhost:3000/app-exam-screen?preview=app-update 를 연다. 실제 API 없이 업데이트 플래그만 가진 데이터를 같은 처리 경로에 넣는다. development에서만 활성화되고 production에서는 무시된다.

- `pnpm test`: strict true 판별, 본문 매핑 우회, API/브리지 envelope, 스토어 URL 검증 및 기존 테스트.
- `pnpm exec tsc --noEmit`, `pnpm lint`.
- 로컬 Chrome 모바일 390×844: 미리보기, native 초기 업데이트, 재생성 completed 업데이트, false·누락의 기존 화면, FEEDBACK_DATA_READY, iOS/Android 단일 링크, iPhone UA에서도 플랫폼 미제공 시 두 링크 검증.
- 320px·390px·1440px 너비에서 가로 넘침 검사. 스토어 탐색은 외부 요청을 가로채 URL을 검증했으며 실제 OS 실행은 미검증.
