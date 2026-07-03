# 채점 대기 화면 API 연동

`GradingWaitScreen`에 실제 채점 상태 폴링을 붙이면서 결정한 사항들과, 그 과정에서 검토했던 대안들을 정리한다.

## 1. 배경

기존 `GradingWaitScreen`은 `progress` prop을 받아 그리는 순수 데코 컴포넌트였고, 실제 채점 진행 상태는 어디서도 조회하지 않았다. API 명세상 `GET /api/v1/exams/{examId}/status`로 `overallStatus`(`PROCESSING`/`COMPLETED`/`FAILED`)와 `progressPercent`를 폴링할 수 있게 되어, 이 값을 실제 진행률/페이지 전환 트리거로 연결해야 했다.

## 2. 진행률 표시 방식

### 검토한 후보안

- **서버가 준 `progressPercent`를 그대로 표시**: 가장 정직하지만, 폴링 주기(3초)마다 값이 계단식으로 튀고, 서버 계산 로직이 실제 오디오 분석 진행률과 정확히 비례한다는 보장이 없어 막판에 오래 멈춰 있는 것처럼 보일 위험이 있었다.
- **`overallStatus`가 `PROCESSING`인 동안 프로그레스를 아예 고정**: 완료 순간에만 0→100으로 점프. 사용자에게 "멈춘 화면"으로 오인되기 쉬워 제외.

### 채택안: 클라이언트 타이머 기반 시뮬레이션 + 완료 시 강제 100%

예상 대기 시간은 45초이지만, 실제로는 더 걸릴 수 있으므로 **90초에 걸쳐 95%까지만** 차오르는 타이머를 별도로 돌린다(`src/features/exam/use-grading-progress.ts`의 `PROGRESS_DURATION_MS`/`PROGRESS_CAP_PERCENT`). 서버 폴링은 진행률 표시가 아니라 **완료 여부 판단**에만 쓴다. `overallStatus === "COMPLETED"`를 받으면 타이머를 멈추고 즉시 100%로 채운 뒤, 트랜지션이 끝나는 걸 기다렸다가(`COMPLETE_TRANSITION_MS`) 다음 화면으로 넘어간다.

이렇게 분리한 이유는, 진행률 바의 목적이 "정확한 서버 진행률 보고"가 아니라 "사용자가 기다리는 동안 화면이 죽지 않았다는 신호"이기 때문이다. 95%에서 상한을 둔 것도 실제 완료 전에 바가 100%를 찍어 "다 됐나?" 하는 오인을 막기 위함이다.

## 3. 라우팅 구조: 인라인 렌더링을 포기하고 `/exam/grading?examId=...`로 단일화

### 검토한 후보안

- **후보 A (초기 구현): 두 진입 경로를 모두 지원** — 시험이 끝나면 `exam-session-screen.tsx`가 `GradingWaitScreen`을 그 자리에서 인라인으로 렌더링하고, 별도로 `/exam/grading` 라우트도 존재. `examId`는 인라인 쪽은 `session.examId`를 prop으로, 라우트 쪽은 URL 쿼리스트링을 읽어 prop으로 넘기는 이원화된 구조였다.
  - 문제점: `examId`를 얻는 소스가 두 곳(메모리 state, URL)으로 나뉘어 있어, 한쪽만 고치고 다른 쪽을 놓치는 동기화 이슈가 생기기 쉽다.
  - 더 근본적으로, 모의고사 응시 화면과 채점 대기 화면이 **같은 URL(`/exam/session`) 아래 한 컴포넌트의 상태 분기**로 존재해서, 두 화면이 실제로는 성격이 다른데도(하나는 진행 중인 시험, 하나는 결과를 기다리는 화면) 라우트 레벨에서 구분되지 않았다.

### 채택안: 시험이 끝나면 항상 `router.replace(/exam/grading?examId=...)`로 이동, 인라인 렌더링 제거

`exam-session-screen.tsx`의 `finished` state와 인라인 렌더링 분기를 완전히 삭제하고, 마지막 문제가 끝나면 `/exam/grading?examId=${session.examId}`로 라우팅하도록 바꿨다(`exam-session-screen.tsx`의 `handlePhaseComplete` 마지막 분기).

이렇게 바꾼 이유는 세 가지다.

1. **모의고사 화면과 채점 화면은 URL로도 분리되어야 하는 별개의 화면이다.** 하나는 "시험을 보는 중"이고 하나는 "결과를 기다리는 중"이라 성격이 다르고, 브라우저 히스토리·새로고침·뒤로가기 동작도 다르게 다뤄야 한다. 같은 라우트 안에서 컴포넌트 state로만 구분하면 이 차이가 URL에 드러나지 않는다.
2. **`examId` 없이 `/exam/grading`에 직접 들어오는 걸 막아야 한다.** 진입 경로를 라우팅 하나로 고정하면, 외부 사용자가 URL을 임의로 쳐서 들어왔을 때 쿼리스트링에 `examId`가 없다는 것만으로 자연스럽게 "잘못된 접근" 상태를 판별할 수 있다(`app/exam/grading/page.tsx`). 인라인 렌더링 경로가 남아있으면 이 가드가 무의미해진다 — 정상적인 시험 흐름이 아니어도 컴포넌트 트리 진입 자체는 항상 가능하기 때문이다.
3. **`examId`는 API 요청에 필수인데, prop과 URL 두 곳에 동시에 유지하는 비용이 더 크다.** `GradingWaitScreen`은 어차피 `examId`를 prop으로 받는 계약을 유지해야 한다(컴포넌트가 라우팅에 직접 결합되지 않도록). 그런데 그 값의 출처를 두 갈래로 두면, "인라인 쪽은 메모리에서 prop으로 바로 내려주고, 라우트 쪽은 URL에서 읽어 prop으로 내려준다"는 식으로 소스가 나뉘고, 이후 한쪽 흐름만 수정하다가 다른 쪽을 깨뜨릴 여지가 생긴다. URL 쿼리스트링을 유일한 소스로 못박으면, `examId`가 필요한 화면(대기 화면, 결과 화면)은 전부 "URL에서 읽어서 prop으로 넘긴다"는 하나의 규칙만 따르면 된다.

## 4. 네트워크 에러 처리: 실패할 때마다 로그를 남기지 않는다

### 문제

첫 구현은 폴링(3초 간격)이 실패할 때마다 `console.error`를 찍었다. 그런데 백엔드가 아직 없는 개발 환경이나, 실제 운영 중 일시적인 네트워크 지연 같은 경우 3초마다 콘솔이 에러로 도배된다 — 진짜 문제(서버가 계속 응답하지 않는 상황)와 일시적 흔들림을 구분하지 못하는 신호였다.

### 채택안

첫 실패 시각(`firstErrorAt`)만 기록해두고, 이후 요청이 한 번이라도 성공하면 초기화한다. **연속으로 120초(`NETWORK_ERROR_TIMEOUT_MS`) 이상 실패가 이어질 때만** `console.error`를 한 번 찍고 `failed` 상태로 전환해 에러 UI를 보여준다. 서버가 명시적으로 내려주는 `overallStatus === "FAILED"`는 이 유예 없이 즉시 반영한다 — 이건 네트워크 문제가 아니라 서버가 확정적으로 알려준 실패이기 때문이다.

## 5. 남은 과제

- `/exam/grading`, `/exam/result` 모두 `examId` 문자열 자체를 서버에 검증하지 않는다. 존재하지 않는 `examId`로 들어왔을 때 서버가 404/400을 주면, 그에 맞는 에러 UI가 아직 없다.
- `/exam/result`는 `GET /api/v1/exams/{examId}/results` 응답을 그대로 JSON으로 찍어주는 자리표시(placeholder) 화면이다. 실제 결과/피드백 UI로 교체 필요.
- 개발 서버에서 백엔드 없이 대기 화면만 확인하려면 `/exam/grading?examId=아무값`으로 직접 접근하면 된다(상태 조회는 실패하지만 진행률 타이머는 클라이언트에서 독립적으로 돈다). 다만 `COMPLETED` 응답이 없으므로 결과 페이지로의 전환까지는 이 방법으로 확인할 수 없다.

## 6. CodeRabbit 리뷰 반영 (PR #8)

- **폴링 언마운트 후 늦은 응답 처리** (`use-grading-progress.ts`): `checkStatus`가 `await` 중일 때 `examId` 변경이나 언마운트로 effect가 정리되면, 응답이 늦게 도착해도 상태 업데이트나 `onComplete` 콜백(페이지 이동)이 실행되지 않도록 `await` 직후에도 `settled`를 재확인하도록 수정. 완료 트랜지션용 `setTimeout`도 `completeTimeoutId`로 추적해 cleanup에서 `clearTimeout`하도록 변경.
- **문서 오타 수정**: 위 4절의 네트워크 에러 유예 시간을 코드(`NETWORK_ERROR_TIMEOUT_MS`)와 동일한 120초로 정정(기존 90초로 잘못 기재됨).
- **`/exam/result` 로딩/경쟁 상태 처리**: fetch가 끝날 때까지 화면이 비어 보이던 문제를 `isLoading`(파생 상태)으로 표시. 또한 `examId`가 바뀌기 전에 시작된 요청이 뒤늦게 도착해 최신 상태를 덮어쓰지 않도록 `cancelled` 플래그를 추가.
- **`ApiEnvelope<T>` 타입 공통화**: `exam-grading-status.ts`와 `exam-grading-result.ts`에 중복 정의되어 있던 응답 envelope 타입을 `src/types/api.ts`로 추출.
- **`ExamHeader` 컴포넌트 분리**: `exam-session-screen.tsx`(녹음/오디오/타이머 등 무거운 클라이언트 로직 포함)에 있던 `ExamHeader`를 `src/components/exam/exam-header.tsx`로 분리해, `/exam/grading`·`/exam/result`가 시험 진행 화면의 의존성을 불필요하게 가져오지 않도록 정리.
- **폴링 순차 실행 + 요청 타임아웃 추가**: 기존에는 `setInterval`로 3초마다 무조건 `checkStatus`를 실행해, 요청 하나가 오래 걸리면 다음 요청과 겹칠 수 있었다. 이 경우 `firstErrorAt`(4절)을 서로 다른 요청이 동시에 건드리면서 "얼마나 오래 실패가 이어졌는지" 판단이 꼬일 수 있었다. `setInterval` 대신 이전 `checkStatus` 호출이 끝난 뒤에만 다음 호출을 `setTimeout`으로 예약하는 순차 루프(`runPoll`)로 바꿔, 한 번에 요청이 하나만 떠 있도록 보장했다.
  - 이와 함께 `apiFetch`(`src/lib/api/client.ts`)에 `AbortController` 기반 요청 타임아웃(기본 10초)을 추가했다. 순차 루프로 바꾸면서 요청 하나가 서버 무응답으로 영원히 멈추면(hang) 전체 폴링이 그 자리에서 멈춰버리는 새로운 위험이 생기기 때문에, 반드시 타임아웃과 함께 적용해야 한다 — 타임아웃 없이 순차 루프만 적용하면 오히려 기존보다 더 나쁜 상태(폴링 완전 정지)가 될 수 있다.
