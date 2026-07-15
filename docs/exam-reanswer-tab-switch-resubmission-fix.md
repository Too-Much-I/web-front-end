# "다시 답변하기" 탭 전환 시 제출 상태 유실 수정

문제별 피드백 화면에서 "다시 답변하기"로 제출한 뒤 다른 탭으로 이동했다가 돌아오면 제출 진행 상태가 사라지는 문제를 검토하고 고친 과정을 정리한다.

## 1. 배경

"연속적인 답변 재제출을 막는 플래그가 따로 있는가"를 점검하다가, 문제별 피드백 화면(`ExamQuestionFeedbackScreen`)의 "다시 답변하기" 탭(`ExamReanswerPanel`)에 재시도 횟수 상한이 전혀 없다는 것과는 별개로, 제출 도중 탭을 전환하면 제출 진행 상태 자체가 사라진다는 더 근본적인 구조 문제를 발견했다.

## 2. 원인

- 상단 탭(`Tabs`/`TabsContent`, `src/components/ui/tabs.tsx`가 감싸는 `@base-ui/react` `Tabs.Panel`)은 기본적으로 비활성 탭의 콘텐츠를 DOM에서 완전히 제거한다(`keepMounted` 기본값 `false`).
- 기존 `ExamReanswerPanel`은 제출~채점 폴링 상태(`status`, `pollingRetryCount`, `errorMessage`)를 전부 자신의 로컬 `useState`로 들고 있었다.
- 그래서 "다시 답변하기" → 다른 탭 전환 → `ExamReanswerPanel` 언마운트 → 로컬 state 소멸이 그대로 일어난다.
- 반면 실제 업로드에 쓰는 `uploadExamAnswer`(`src/features/exam/api/exam-answer-upload.ts`)가 내부에서 쓰는 `apiFetch`의 `AbortController`(`src/lib/api/client.ts`)는 컴포넌트 생명주기와 무관하게 함수 호출 안에서 매번 새로 만들어진다. 즉 컴포넌트가 언마운트돼도 이미 나간 업로드/채점 요청은 취소되지 않고 서버까지 그대로 진행된다.
- 결과적으로 "요청은 서버에 도달했는데, 그 결과(채점 폴링 시작 → 완료 시 자동 이동, 실패 시 에러 표시)를 받아 처리할 컴포넌트가 이미 사라진" 상태가 된다. 탭으로 돌아오면 새로 마운트된 패널이 `idle`부터 시작해, 사용자가 같은 문제에 대해 또 녹음·제출할 수 있었다 — 이전 제출이 아직 진행 중이면 같은 `retryCount` 슬롯으로 충돌할 여지도 있었다.

## 3. 검토한 해결 방안

- **탭 콘텐츠를 언마운트하지 않기(`keepMounted`)** — 원인 자체(언마운트)를 없애는 방법이라 깔끔해 보이지만, 이 화면의 다른 탭들이 "언마운트되면서 자연히 정리되는" 것에 기대고 있는 부분(마이크 스트림 해제, 오디오 재생 중지, 탭 전환 슬라이드 인 애니메이션 재생)까지 전부 다시 설계해야 해서 이번 문제 하나에 비해 변경 범위가 과했다. DOM 자체가 무거워서가 아니라(텍스트·오디오 엘리먼트 하나 수준이라 메모리 부담은 미미) 이 사이드 이펙트들을 다시 관리해야 하는 비용 때문에 기각했다.
- **제출/채점 중엔 탭 전환 자체를 하드 블록** — 구현은 가장 간단하지만, 채점을 기다리는 동안 모범답안 등 다른 탭을 보는 정상적인 사용 흐름까지 막아 UX가 나빠진다.
- **제출~채점 상태를 탭 상위로 끌어올려 controlled로 전환 (채택)** — 상태가 사는 위치를 `ExamReanswerPanel`(언마운트되는 자식)에서 `ExamQuestionFeedbackScreen`(탭이 바뀌어도 안 사라지는 부모)으로만 옮기면, 언마운트/마운트와 무관하게 진행 상태가 유지된다. 다른 탭들의 사이드 이펙트는 그대로 둘 수 있어 변경 범위가 가장 작다.

## 4. 구현

- `src/features/exam/use-reanswer-submission.ts` (신규): `status`("idle"/"submitting"/"grading"/"error") · `errorMessage` · 채점 폴링(`useQuestionRetryStatus`)을 소유하는 훅. `submit(blob, retryCount)`와 `reset()`을 제공한다. `ExamQuestionFeedbackScreen`에서 호출하므로, 탭이 바뀌어도 이 훅의 state는 사라지지 않는다.
- `src/components/exam/exam-reanswer-panel.tsx`: `examId`/`questionNumber`/`totalRetryCount`/`onNavigateRetry`를 더 이상 받지 않고, `status`/`errorMessage`/`onSubmit`/`onReset`을 props로 받는 controlled 컴포넌트로 축소했다. 로컬 state로는 녹음 자체(`isRecording`, `recordedBlob`)와 마이크 권한 에러만 남긴다 — 이건 원래도 언마운트 시 잃어도 되는(제출 전) 정보라 그대로 로컬에 둬도 안전하다.
- `src/components/exam/exam-question-feedback-screen.tsx`: `useReanswerSubmission`을 호출해 `ExamReanswerPanel`에 상태와 콜백을 내려준다.
- "저장 안 한 녹음이 있어요" 경고(`hasUnsavedRecording`)의 조건에서 `status === "submitting"`도 `"grading"`과 함께 제외했다 — 제출 요청을 보낸 이후엔 탭을 벗어나도 더 이상 아무것도 유실되지 않으므로, "지금 이동하면 사라진다"는 경고를 띄우는 게 오히려 부정확했다.

## 5. 남은 과제

- 이번 수정은 "같은 화면 인스턴스에서 탭을 벗어났다 돌아왔을 때"의 상태 유실만 막는다. 새로고침이나 여러 탭/기기에서의 동시 제출까지 막지는 못하므로, 서버 쪽에서 (examId, questionNumber, retryCount) 조합의 중복 제출을 어떻게 처리하는지는 별도 확인이 필요하다.
- 애초에 재제출 횟수 자체에 상한(예: `MAX_RETRY_COUNT`)이 없다는 점은 이번 수정 범위에 포함하지 않았다 — 필요하면 별도로 논의한다.
