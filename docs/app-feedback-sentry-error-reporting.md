# 종합 피드백 부분 실패 복구 및 Sentry 리포팅 구현 계획

작성일: 2026-08-11

## 1. 작업 요약 (3줄 이내)

- 종합 피드백의 필수 값이 일부 누락돼도 전체 오류로 처리하지 않고, 이미 생성된 점수와 문제별 피드백을 결과 화면에 유지한다.
- 네이티브 브리지를 통해 종합 피드백 재생성을 요청하고, 인증 토큰을 가진 앱이 3초 간격으로 최대 3분 동안 summary 완성 여부를 확인해 웹에 전달한다.
- 부분 실패와 재생성 실패를 피드백 원문, 토큰, 음성 URL, examId 없이 Sentry에 구조화해 보고한다.

## 2. 영향 받는 핵심 파일/모듈 목록

- `src/types/exam.ts`: [수정] - 런타임에서 누락될 수 있는 summary 원본 타입, 누락 필드 식별자, 완전성 검사 결과 타입 정의
- `src/features/exam/exam-summary-completeness.ts`: [신규] - 원본 summary 필수 값 검사와 `missingFields`, `missingParts` 생성
- `src/features/exam/map-exam-grading-result.ts`: [수정] - 빈 파트를 제거하지 않고 Part 1~5를 보존하며 표시 가능한 값만 안전하게 매핑
- `src/features/exam/api/exam-grading-result.ts`: [수정] - 원본 summary를 매핑 전에 검사하고 부분 결과와 완전성 정보를 함께 반환하는 앱 전용 조회 함수 추가
- `src/lib/native-data-bridge.ts`: [수정] - 종합 피드백 재생성 지원 여부를 나타내는 독립 capability 정의
- `src/lib/native-summary-feedback-retry.ts`: [신규] - 재생성 요청 전송, requestId 기반 접수·완료·실패 push 처리, 응답 타임아웃 관리
- `src/features/exam/use-summary-feedback-retry.ts`: [신규] - 재생성 접수, 앱 polling 결과 구독, 완료, 실패 및 single-flight 상태 관리
- `src/features/exam/report-summary-feedback-error.ts`: [신규] - 종합 피드백 부분 실패용 Sentry 태그, context, fingerprint 생성
- `src/app/app-exam-screen/page.tsx`: [수정] - 불완전한 summary를 query 성공 데이터로 유지하고 재조회 결과로 캐시 갱신
- `src/components/app-exam-screen/FeedbackScreen.tsx`: [수정] - 부분 실패 상태, 재생성 상태 및 고정 복구 UI를 기존 3단계 결과 화면에 연결
- `src/components/app-exam-screen/components/SummaryFeedbackRecoveryDialog.tsx`: [신규] - 최초 부분 실패 감지 시 재생성을 제안하는 팝업 또는 바텀시트 구현
- `src/components/app-exam-screen/components/SummaryFeedbackRecoveryBar.tsx`: [신규] - 모든 피드백 단계에서 유지되는 재생성·진행·실패 상태 UI 구현
- `src/components/app-exam-screen/feedback-view-model.ts`: [수정] - 누락 점수와 누락 피드백을 명시적으로 표현하고 Part 1~5 및 문제 번호 보존
- `src/components/app-exam-screen/components/ScoreSummaryCard.tsx`: [수정] - 총점, 예상 레벨 또는 summary 누락 시 유효한 0점으로 오인되지 않는 대체 상태 표시
- `src/components/app-exam-screen/components/AtAGlanceSection.tsx`: [수정] - 강점 또는 약점 누락 시 빈 카드 대신 생성 실패 안내 표시
- `src/components/app-exam-screen/components/PartFeedbackCard.tsx`: [수정] - 누락된 파트 문구에 복구 안내를 표시하면서 문제별 피드백 버튼 유지
- `src/lib/sentry-privacy.ts`: [신규] - Sentry URL, breadcrumb, request 정보에서 examId와 인증 정보 제거
- `src/instrumentation-client.ts`: [수정] - 클라이언트 Sentry에 공통 개인정보 필터 적용
- `sentry.server.config.ts`: [신규] - 서버 런타임 Sentry 초기화 및 개인정보 필터 적용
- `sentry.edge.config.ts`: [신규] - Edge 런타임 Sentry 초기화 및 개인정보 필터 적용
- `src/instrumentation.ts`: [신규] - Next.js 서버·Edge 런타임별 Sentry 설정 등록
- `src/app/global-error.tsx`: [신규] - App Router 최상위 렌더링 오류 Sentry 보고
- `next.config.ts`: [수정] - Sentry 빌드 플러그인과 운영 source map 업로드 설정 적용
- `package.json`: [수정] - Sentry SDK, 테스트 도구 및 테스트 명령 추가
- `pnpm-lock.yaml`: [수정] - 추가 의존성 잠금 정보 반영
- `pnpm-workspace.yaml`: [수정] - Sentry CLI 빌드 허용 설정 반영
- `.gitignore`: [수정] - 로컬 Sentry 빌드 플러그인 환경 파일 제외
- `src/features/exam/exam-summary-completeness.test.ts`: [신규] - summary 필수 값과 경계값 fixture 단위 테스트
- `src/features/exam/summary-feedback-retry-state.test.ts`: [신규] - 재생성 상태 전이와 중복 방지 테스트
- `src/lib/sentry-privacy.test.ts`: [신규] - URL과 이벤트 개인정보 제거 테스트
- `src/lib/native-summary-feedback-retry.test.ts`: [신규] - capability, requestId 일치 및 접수 응답 브리지 테스트
- `vitest.config.ts`: [신규] - 테스트 환경과 `@` 경로 별칭 설정

## 3. 단계별 구현 절차 (Sequential Steps)

- [ ] Step 1: summary 완전성 타입과 판정 기준을 정의한다.
  - 정상 완료 시험의 문제 수를 11개로 고정하고 `totalSolvedQuestions === 11`인지 검사한다.
  - `totalScore`와 Part 1~5 점수는 유한한 숫자인지 검사하고 0점은 유효한 값으로 인정한다.
  - `levelEstimate`, `summary`, `overallFeedback`, Part 1~5 피드백은 trim 후 공백이 아닌 문자열인지 검사한다.
  - `strengths`, `weaknesses`, `recommendedPractice`는 공백이 아닌 문자열을 하나 이상 가진 배열인지 검사한다.
  - 누락 필드는 `summary`, `partFeedback.part1`, `partScores.part1`처럼 고정된 식별자로 수집한다.

- [ ] Step 2: 원본 summary 검사와 매핑 순서를 분리한다.
  - 네이티브 브리지 또는 직접 API에서 받은 원본 result를 mapper에 넣기 전에 검사한다.
  - 검사 결과를 `{ result, missingFields, missingParts }` 형태의 앱 결과 모델로 만든다.
  - `.filter(Boolean)`과 `?? []`가 누락 사실을 숨기지 않도록 mapper를 방어적으로 수정한다.
  - 표시용 기본값을 사용하더라도 `missingFields`에 포함된 값은 UI에서 정상 값으로 표현하지 않는다.
  - 일반 웹 결과 화면과 중단 응시 흐름은 기존 `getExamGradingResult()` 계약을 유지하고, 앱 웹뷰 경로에만 완전성 판정을 적용한다.

- [ ] Step 3: 부분 결과와 전체 조회 오류를 분리한다.
  - summary result를 받았다면 `missingFields`가 있어도 React Query 성공 데이터로 저장한다.
  - 결과 자체를 받지 못한 네트워크 오류, 브리지 오류 또는 파싱 불가 응답만 기존 `ErrorFallbackScreen`으로 보낸다.
  - 부분 결과에도 `FEEDBACK_DATA_READY`를 네이티브에 전송해 앱 스켈레톤을 제거한다.
  - 최초 부분 실패 감지는 같은 페이지 인스턴스에서 한 번만 Sentry warning으로 보고한다.

- [ ] Step 4: 종합 피드백 재생성 브리지 계약을 추가한다.
  - 웹에서 네이티브로 다음 요청 메시지를 보낸다.

    ```ts
    type SummaryFeedbackRetryRequestedMessage = {
      type: "SUMMARY_FEEDBACK_RETRY_REQUESTED";
      requestId: string;
      examId: string;
    };
    ```

  - 네이티브는 현재 웹뷰의 시험과 message의 examId가 같은지 확인한 뒤 인증된 재생성 API를 호출한다.
  - 네이티브의 접수·완료·실패 응답은 요청과 동일한 requestId를 포함해야 한다.
  - 네이티브는 `accepted`, 원본 summary를 담은 `completed`, 단계와 사유를 담은 `failed` 이벤트를 JSON 문자열로 직렬화해 `window.__nativeSummaryFeedbackRetryBridge.deliver(...)`로 전달한다.
  - 웹은 pending requestId와 일치하는 접수 응답과 terminal 이벤트만 처리하고 다른 요청의 응답은 무시한다.
  - 기존 데이터 조회 capability와 별개로 앱 소유 polling 계약인 `summaryFeedbackRetryVersion: 2` 지원 여부를 확인한다.
  - capability 미지원 앱에서는 동작하지 않는 버튼을 노출하지 않고 앱 업데이트 필요 안내를 표시한다.

- [ ] Step 5: 재생성 상태 머신과 single-flight 처리를 구현한다.
  - 상태는 `complete`, `incomplete-idle`, `retry-requesting`, `retry-polling`, `retry-failed`로 제한한다.
  - 팝업과 고정 버튼에서 동시에 재생성을 눌러도 requestId 한 건만 생성되도록 ref 기반 잠금을 적용한다.
  - 접수 중에는 재생성 행동만 비활성화하고 결과 단계 이동과 문제별 피드백 진입은 허용한다.
  - 시험별 requestId, 시작 시각, 시도 여부를 sessionStorage에 보존해 문제 상세 화면을 다녀와도 앱의 기존 polling 작업에 재연결할 수 있게 한다.
  - 재생성 완료 또는 제한 시간 종료 시 진행 중 상태를 정리한다.

- [ ] Step 6: 앱 소유 summary polling과 웹 push 처리를 구현한다.
  - 앱은 접수 성공 후 인증 토큰을 사용해 3초 간격으로 summary를 다시 조회한다.
  - 앱은 조회할 때마다 Step 1과 같은 완전성 기준을 적용하고, 웹은 `completed`로 받은 원본에도 동일한 검사를 다시 수행한다.
  - 앱이 완전한 원본을 push하고 웹의 검사도 통과했을 때만 `complete`로 전환하며 React Query 캐시를 새 결과로 교체한다.
  - 데이터 교체 시 `FeedbackScreen`을 remount하지 않아 현재 단계와 탐색 위치를 유지한다.
  - 앱은 시작 후 3분 timeout을 관리하고, 접수 실패·summary 조회 실패·timeout을 웹에 push해 부분 결과를 유지한 채 `retry-failed`로 전환한다.
  - 웹은 API를 polling하지 않으며, 앱 이벤트 유실에 대비해 요청 시작 후 3분 30초에 로딩 UI만 실패 상태로 종료한다.
  - 웹 문서가 다시 열리면 같은 requestId를 앱에 보내고, 앱은 시험별 single-flight 작업의 접수 또는 terminal 결과를 재생한다.
  - 재생성은 세션당 한 번만 허용하고 실패 후에는 재생성 버튼을 제거한 상태로 실패 안내를 유지한다.

- [ ] Step 7: 최초 복구 안내와 고정 재생성 UI를 구현한다.
  - 부분 완료를 처음 감지하면 접근성 있는 Dialog 또는 바텀시트를 한 번 표시한다.
  - 제목은 `종합 피드백을 아직 만들지 못했어요`로 표시한다.
  - 설명은 `문제별 피드백은 모두 준비됐어요. 종합 피드백만 다시 생성할까요?`로 표시한다.
  - 주요 행동은 `종합 피드백 다시 생성`, 보조 행동은 `나중에`로 구성한다.
  - `나중에` 또는 닫기를 선택해도 부분 결과를 그대로 유지한다.
  - 안내를 닫은 뒤에는 기존 이전·다음 영역 위에 복구 상태 바를 고정한다.
  - 요청 직후부터 접수 중에는 `재생성 요청을 접수하고 있어요`, 접수 성공 뒤에는 `종합 피드백을 만들고 있어요` 문구와 주황색 indeterminate 로딩바를 표시한다.
  - 로딩바는 완료, 접수 실패, polling 실패 또는 3분 timeout 상태에서만 제거한다.
  - 복구 상태 바와 기존 하단 navigation을 하나의 footer 영역으로 구성하고 실제 footer 높이만큼 본문 하단 여백을 확보한다.
  - safe area와 큰 글자 설정에서도 고정 UI와 본문 또는 버튼이 겹치지 않는지 확인한다.

- [ ] Step 8: 부분 결과 표시 컴포넌트를 보완한다.
  - Part 1~5 카드는 누락 여부와 관계없이 모두 유지한다.
  - 누락된 파트 문구는 `종합 피드백을 준비하지 못했어요`와 재생성 가능 안내로 대체한다.
  - Q1~Q11 문제별 피드백 진입 버튼은 그대로 유지한다.
  - 누락된 점수는 0점으로 표시하지 않고 `점수 없음` 또는 생성 실패 상태로 표시한다.
  - 누락된 summary, 강점, 약점은 빈 영역으로 두지 않고 준비 실패 안내를 표시한다.
  - 재생성 중에도 기존에 존재하는 점수와 피드백은 계속 렌더링한다.

- [ ] Step 9: 종합 피드백 전용 Sentry 이벤트를 구현한다.
  - 공통 태그로 `feature=exam-feedback`, `route=app-exam-screen`, `error_code=SUMMARY_FEEDBACK_INCOMPLETE`, `error_kind=partial-generation`을 사용한다.
  - 단계별로 `stage=initial-load`, `retry-request`, `retry-polling`을 구분한다.
  - 데이터 출처는 `data_source=native-bridge` 또는 `direct-api`로 구분한다.
  - context 또는 extra에는 누락 필드, 누락 파트, 문제 수, 각 종합 요소의 존재 여부, retryAttempt만 넣는다.
  - requestId 또는 gradingJobId가 제공되는 경우에만 로그 연결 식별자로 사용한다.
  - fingerprint는 다음 규칙으로 고정한다.

    ```ts
    scope.setFingerprint([
      "exam-summary-incomplete",
      [...missingFields].sort().join(","),
    ]);
    ```

  - 최초 부분 실패, 접수 실패, polling 실패 및 시간 초과는 각각 한 번만 보고한다.

- [ ] Step 10: Sentry 개인정보 제거와 source map 설정을 완료한다.
  - `sendDefaultPii`는 `false`로 유지한다.
  - `beforeSend`에서 request URL의 examId query, Authorization, cookie 및 토큰성 데이터를 제거한다.
  - `beforeBreadcrumb`에서 현재 URL과 navigation breadcrumb의 examId 값을 제거한다.
  - 기능 전용 Sentry reporter에는 피드백·요약·강점·약점 원문, 사용자 답변, 음성 URL, API 응답 전체를 전달하지 않는다.
  - client, server, edge 설정에 동일한 개인정보 정책을 적용한다.
  - CI에서 Sentry 인증 토큰을 주입하고 source map 업로드가 성공하는지 확인한다.

- [ ] Step 11: 자동 테스트와 통합 검증을 수행한다.
  - 완전성 검사와 개인정보 scrubber는 순수 함수 단위 테스트로 검증한다.
  - 웹 재생성 상태 머신은 접수·완료·실패 전이와 중복 방지를 검증한다.
  - 앱 polling은 3초 간격, 실제 완전성 판정과 3분 timeout을 검증한다.
  - 네이티브 브리지 mock으로 capability 지원 여부, requestId 일치, 접수, terminal push 및 먼저 도착한 결과 재생을 검증한다.
  - UI는 부분 결과 fixture를 사용해 최초 안내, 모든 단계의 고정 행동, 문제 상세 왕복 및 완료 후 데이터 교체를 검증한다.
  - lint, TypeScript 검사, production build를 실행해 정적 오류와 Sentry 빌드 설정을 확인한다.

## 4. 핵심 기술적 결정 및 이유 (Trade-offs)

- **선택한 방식**: 서버 상태 코드가 아니라 원본 summary의 실제 필수 값을 웹에서 검사한다.
- **이유 및 대안 대비 장점**: 서버가 성공 상태를 내려도 데이터가 비어 있는 경우를 탐지할 수 있다. 별도 `summaryStatus`나 오류 코드에 의존하지 않아 앱·웹·백엔드 독립 배포 중에도 잘못된 완료 판정을 방지한다.

- **선택한 방식**: 불완전한 summary를 query 오류가 아닌 성공 데이터와 별도 완전성 상태로 관리한다.
- **이유 및 대안 대비 장점**: 예외를 발생시켜 전체 fallback으로 보내는 방식과 달리 이미 생성된 점수, 파트 정보와 문제별 피드백을 사용자에게 계속 제공할 수 있다.

- **선택한 방식**: 원본 검사 후 표시 가능한 값을 기존 도메인 모델로 방어적으로 매핑한다.
- **이유 및 대안 대비 장점**: mapper의 `.filter(Boolean)`이나 `?? []`가 누락 원인을 숨기는 것을 막으면서 기존 결과 컴포넌트의 재사용 범위를 유지할 수 있다. 전체 화면을 nullable 모델로 바꾸는 것보다 변경 범위도 작다.

- **선택한 방식**: 재생성 요청은 웹 직접 API가 아닌 독립 capability를 가진 네이티브 브리지로 처리한다.
- **이유 및 대안 대비 장점**: 웹뷰에 액세스 토큰을 전달하지 않아도 인증된 요청이 가능하고, 구버전 앱에서는 미지원 기능을 안전하게 숨길 수 있다. 기존 데이터 조회 capability와 분리하므로 기능별 호환성도 명확하다.

- **선택한 방식**: 재생성 흐름을 명시적인 상태 머신과 single-flight 잠금으로 관리한다.
- **이유 및 대안 대비 장점**: 여러 boolean 조합보다 가능한 상태와 전이가 분명하다. 팝업과 고정 버튼의 동시 입력, React Strict Mode effect 재실행 및 중복 브리지 요청을 방지하기 쉽다.

- **선택한 방식**: 접수 성공만으로 완료 처리하지 않고 summary를 다시 조회해 같은 완전성 검사를 통과해야 완료로 간주한다.
- **이유 및 대안 대비 장점**: 네이티브 또는 백엔드의 접수 성공은 작업 완료를 의미하지 않는다. 실제 화면에 필요한 값이 모두 생성됐는지를 최종 기준으로 삼아 거짓 완료 상태를 방지한다.

- **선택한 방식**: 인증 토큰을 가진 앱이 polling을 소유하며 3초 간격, 최대 3분으로 제한하고 결과를 웹에 push한다.
- **이유 및 대안 대비 장점**: 토큰이 없는 웹이 인증 API를 직접 호출하지 않아도 되고, 앱 백그라운드 작업과 WebView 화면 상태의 책임이 분명해진다. 무제한 polling과 달리 종료 조건도 명확하다.

- **선택한 방식**: 재생성은 세션당 한 번만 허용하고 실패 후 버튼을 제거한다.
- **이유 및 대안 대비 장점**: 동일 시험에서 반복 요청이 쌓이는 것을 막고 백엔드 중복 작업 가능성을 낮춘다. 반복 재시도보다 복구 가능성은 낮지만 문서의 1회 제한 요구사항을 우선한다.

- **선택한 방식**: 고정 복구 UI와 기존 navigation을 하나의 footer로 구성하고 실제 높이를 본문 여백에 반영한다.
- **이유 및 대안 대비 장점**: 고정 px 여백보다 safe area와 큰 글자 환경에 유연하며, 세 단계 공통 행동이 기존 이전·다음 버튼을 가리는 문제를 줄인다.

- **선택한 방식**: Sentry에는 실제 오류 응답이 아니라 프론트에서 생성한 오류 코드와 구조 정보만 전송한다.
- **이유 및 대안 대비 장점**: 사후 scrubber에만 의존하는 방식보다 민감한 피드백 원문과 examId가 이벤트 객체에 처음부터 포함되지 않는다. 누락 필드와 stage만으로도 운영 원인 분류와 그룹핑이 가능하다.

## 5. 검증 계획 (How to Test)

- [ ] 모든 필수 값이 유효한 fixture에서 `missingFields`가 빈 배열이고 기존 3단계 결과 화면만 표시되는지 확인한다.
- [ ] `totalSolvedQuestions`가 11이 아니거나 누락됐을 때 부분 실패로 판정하는지 확인한다.
- [ ] `totalScore`와 Part 점수의 0은 정상 값으로 인정하는지 확인한다.
- [ ] 숫자 필드의 `null`, `undefined`, `NaN`, `Infinity`, `-Infinity`를 누락으로 판정하는지 확인한다.
- [ ] 필수 문자열의 `null`, 누락, 빈 문자열과 공백 문자열을 누락으로 판정하는지 확인한다.
- [ ] 필수 배열의 `null`, 빈 배열과 공백 문자열만 포함한 배열을 누락으로 판정하는지 확인한다.
- [ ] `partFeedback` 또는 `partScores` 객체 전체가 없을 때 Part 1~5를 모두 누락으로 수집하고 mapper가 예외를 발생시키지 않는지 확인한다.
- [ ] Part 피드백 하나만 누락됐을 때 해당 파트만 `missingParts`에 포함되는지 확인한다.
- [ ] summary result를 받은 부분 실패가 `ErrorFallbackScreen`이 아니라 부분 결과 화면으로 진입하는지 확인한다.
- [ ] 결과 조회 자체가 실패했을 때만 기존 전체 오류 화면과 재조회 행동이 표시되는지 확인한다.
- [ ] 부분 결과에서도 `FEEDBACK_DATA_READY`가 전송되어 네이티브 스켈레톤이 제거되는지 확인한다.
- [ ] 부분 실패 최초 진입 시 재생성 안내가 한 번만 표시되는지 확인한다.
- [ ] 안내의 `나중에`, 닫기 및 바깥 영역 선택 후 결과 화면과 고정 복구 행동이 유지되는지 확인한다.
- [ ] 세 단계 모두에서 고정 복구 행동이 노출되고 이전·다음 버튼, safe area 및 본문과 겹치지 않는지 확인한다.
- [ ] 큰 글자 배율 0.92, 1.0, 1.35에서 footer 높이와 본문 여백이 올바르게 반영되는지 확인한다.
- [ ] 누락된 Part 카드에도 Part 1~~5 카드와 Q1~~Q11 문제별 피드백 버튼이 유지되는지 확인한다.
- [ ] 누락된 점수와 문구가 0점 또는 정상적인 빈 내용으로 오인되지 않는지 확인한다.
- [ ] capability 미지원 앱에서 재생성 요청 버튼 대신 앱 업데이트 안내가 표시되는지 확인한다.
- [ ] 팝업과 고정 버튼을 동시에 눌러도 `SUMMARY_FEEDBACK_RETRY_REQUESTED`가 한 번만 전송되는지 확인한다.
- [ ] 네이티브 응답 requestId가 pending 요청과 다르면 무시하는지 확인한다.
- [ ] 접수 중과 polling 중에도 단계 이동과 문제별 피드백 진입이 가능한지 확인한다.
- [ ] 요청 버튼을 누른 직후 주황색 로딩바가 표시되고 접수 성공 뒤 polling 상태에서도 끊기지 않는지 확인한다.
- [ ] 문제별 피드백 화면을 다녀온 뒤 재생성 진행 상태와 1회 시도 제한이 유지되는지 확인한다.
- [ ] 앱이 접수 성공 후 인증된 summary API를 3초 간격으로 재조회하는지 확인한다.
- [ ] 앱의 재조회 결과가 계속 불완전하면 polling을 유지하고 재생성 API를 다시 호출하지 않는지 확인한다.
- [ ] 웹 문서가 다시 열려 같은 requestId를 보내도 앱이 시험별 작업을 재사용하고 현재 또는 terminal 결과를 다시 전달하는지 확인한다.
- [ ] 완전한 summary를 받으면 현재 피드백 단계에서 데이터만 교체되고 복구 UI가 제거되는지 확인한다.
- [ ] 재생성 접수 실패, summary 재조회 실패 및 3분 timeout에서 부분 결과를 유지하고 실패 안내로 전환하는지 확인한다.
- [ ] 재생성 실패 후 요청 버튼이 제거되어 두 번째 요청을 보낼 수 없는지 확인한다.
- [ ] 최초 부분 실패 Sentry 이벤트가 같은 페이지 인스턴스에서 한 번만 전송되는지 확인한다.
- [ ] Sentry 이벤트에 `feature`, `route`, `error_code`, `error_kind`, `stage`, `data_source` 태그가 설정되는지 확인한다.
- [ ] 서로 같은 누락 필드 조합은 정렬된 fingerprint로 같은 이슈에 그룹핑되는지 확인한다.
- [ ] 재생성 접수 실패와 polling timeout이 서로 다른 stage와 retryAttempt로 기록되는지 확인한다.
- [ ] Sentry event, breadcrumb, request URL과 context에 examId 원문이 포함되지 않는지 확인한다.
- [ ] Sentry에 피드백, summary, 강점, 약점, 사용자 답변, 음성 URL, Authorization, 토큰 및 쿠키가 포함되지 않는지 확인한다.
- [ ] 스테이징 빌드에서 source map 업로드가 성공하고 Sentry stack trace가 원본 TypeScript 파일과 줄 번호를 가리키는지 확인한다.
- [ ] `SUMMARY_FEEDBACK_INCOMPLETE` 태그와 누락 필드 fingerprint로 Sentry 이벤트를 검색할 수 있는지 확인한다.
- [ ] `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`가 모두 통과하는지 확인한다.

## 외부 연동 선행 조건

- app-front-end는 재생성 capability, requestId 기반 브리지 응답, 현재 examId 검증 및 인증된 재생성 API 대리 호출을 제공해야 한다.
- 백엔드는 문제별 피드백이 완성된 부분 실패에서 표시 가능한 summary를 2xx result로 반환해야 한다.
- 백엔드 재생성 API는 시험 단위 종합 피드백만 갱신하고 기존 문제별 피드백과 사용자 답변을 변경하지 않아야 한다.
- 동일 시험의 동시 재생성 요청은 백엔드 또는 앱에서 멱등하게 처리돼야 한다.
- 가능하면 백엔드는 개인정보가 아닌 requestId 또는 gradingJobId를 제공해 앱·웹·서버 로그를 연결할 수 있게 해야 한다.
