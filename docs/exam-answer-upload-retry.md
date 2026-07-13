# 답변 업로드(S3 PUT) 실패 시 재시도 로직 도입

시험 답변 녹음이 S3 업로드 단계에서 실패하면 어떻게 되는지 점검하다가 발견한 문제와, 재시도 로직을 설계·구현한 과정을 정리한다.

## 1. 배경

`uploadExamAnswer`(`src/features/exam/api/exam-answer-upload.ts`)는 presigned URL 발급 → S3 PUT 업로드 → 채점 요청, 3단계로 답변 녹음을 서버에 넘긴다. 호출부인 `ExamSessionScreen`(`src/components/exam/exam-session-screen.tsx`)은 이 호출을 문항이 끝날 때(`speaking` phase의 `useEffect` cleanup)마다 다음과 같이 fire-and-forget으로 실행한다.

```js
uploadExamAnswer(session.examId, String(currentQuestion.questionNumber), audioBlob).catch(
  console.error,
);
```

점검 결과 두 가지 문제가 있었다.

- S3 PUT이 실패해도 `.catch(console.error)`로 콘솔에만 로그가 찍힐 뿐, 사용자에게는 아무 피드백이 가지 않는다. 시험은 그대로 다음 문항으로 진행된다.
- 실패한 시점의 `audioBlob`은 별도 로컬 저장소(IndexedDB 등) 없이 순수 메모리 값으로만 존재한다(`use-answer-recorder.ts` 상단 주석에도 "별도의 로컬 임시 저장소는 두지 않는다"고 명시돼 있다). 업로드 시도가 끝나면(성공이든 실패든) 그 Blob을 참조하는 코드가 없어져 가비지 컬렉션 대상이 되므로, 재시도 없이 실패하면 해당 답변은 복구 수단 없이 영구 유실된다.

요구사항은 "문제 진행 자체는 실패해도 계속되되, 내부적으로는 재시도를 시도한다"는 것이었다 — 즉 재시도는 UI를 막지 않는 백그라운드 동작이어야 한다.

## 2. 검토한 재시도 횟수·전략

재시도가 얼마나 길게/많이 이어져야 하는지 판단할 기준으로, `GradingWaitScreen`/`useGradingProgress`(`src/features/exam/use-grading-progress.ts`)가 폴링 에러를 **120초**(`NETWORK_ERROR_TIMEOUT_MS`) 연속으로 겪어야 실패로 간주한다는 점을 참고했다. 마지막 문항의 업로드가 다소 늦게 끝나더라도 이 여유 안에 들어오면 채점 대기 화면에서 흡수된다.

- **안 A — 3회, 짧은 선형 백오프(1s→2s→4s, 총 ~7초)**: 구현이 단순하고 실패가 빨리 확정되지만, 몇 초 이상 가는 네트워크 순단에는 대응하지 못해 유실 가능성이 상대적으로 높다.
- **안 B — 5회, 지수 백오프(1s→2s→4s→8s→16s, 총 ~31초) (채택)**: 대부분의 일시적 장애(순간적 네트워크 끊김, S3 일시 오류)를 커버하면서도 120초 타임아웃 안에 여유 있게 들어온다.
- **안 C — 시간 기반, 최대 총 소요시간을 120초 타임아웃 직전까지 캡(지수 백오프 + jitter)**: 성공률은 가장 높지만 구현/추론이 복잡해지고, Blob을 메모리에 더 오래 들고 있어야 해서 그동안 탭을 닫거나 브라우저가 메모리를 회수하면 오히려 유실 위험이 커진다.

이 앱이 POC 단계이고 실패 원인 대부분이 순간적인 네트워크 문제일 가능성이 높다고 보고, 복잡도 대비 커버리지가 가장 균형 잡힌 **안 B**를 채택했다.

## 3. 재시도 범위: 처음엔 3단계 전체 → PUT 한 단계로 축소

### 3.1 최초 구현: 3단계 전체를 재시도 단위로 묶음

처음에는 presigned URL 발급 → PUT → 채점 요청 3단계 전체를 한 번의 시도로 묶어서 재시도했다. presigned URL이 재시도 도중 만료될 수 있다고 가정해, 실패할 때마다 URL을 처음부터 다시 발급받는 방식이었다.

### 3.2 축소한 이유

이 presigned URL의 실제 유효시간이 **60초**라는 점을 확인했다. 안 B의 재시도 총 소요시간(~31초)이 이보다 짧으므로, 최초 발급받은 URL 하나로 모든 재시도를 커버할 수 있어 URL을 매번 재발급받을 필요가 없었다. 그래서 재시도 범위를 다음과 같이 좁혔다.

- presigned URL 발급(`getAnswerUploadUrl`)은 **최초 1회만** 호출하고 재사용한다.
- S3 PUT 업로드(`putAnswerAudioToS3`)만 지수 백오프로 재시도한다(`putAnswerAudioToS3WithRetry`).
- 채점 요청(`submitAnswerForGrading`)은 PUT이 성공한 뒤 그대로 1회만 호출한다 — 애초 문제였던 "S3 저장 실패" 범위 밖이라 재시도 대상에 포함하지 않았다.

이렇게 하면 불필요한 URL 재발급 API 호출을 줄이면서 코드도 더 단순해진다.

## 4. 재시도 타이머가 React 라이프사이클과 무관하게 동작하는 이유

호출부가 `uploadExamAnswer(...).catch(console.error)`처럼 Promise를 기다리지 않고 던져두는 fire-and-forget 방식이고, `apiFetch`(`src/lib/api/client.ts`)의 `AbortController`도 호출마다 새로 만들어져 고정 타임아웃(10초)에만 묶일 뿐 컴포넌트 unmount와는 무관하다. `putAnswerAudioToS3`는 순수 `fetch`만 쓰고 그마저도 없다. 따라서 재시도 루프(`setTimeout` 기반 `wait()`)를 `exam-answer-upload.ts` 안에 순수 함수로 구현하기만 하면, 문항이 넘어가 컴포넌트가 리렌더/unmount 되어도 이미 시작된 재시도는 끊기지 않고 끝까지 진행된다. 별도의 언마운트 방지 처리가 필요 없었던 이유다.

유일한 예외는 탭을 완전히 닫거나 새로고침하는 경우인데, 이는 브라우저가 JS 실행 컨텍스트 자체를 종료하는 것이라 재시도 전략과 무관하게 항상 발생하는 한계다.

## 5. 최종 구조

```js
// src/features/exam/api/exam-answer-upload.ts
const UPLOAD_RETRY_DELAYS_MS = [1000, 2000, 4000, 8000, 16000];

async function putAnswerAudioToS3WithRetry(uploadUrl, audioBlob) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await putAnswerAudioToS3(uploadUrl, audioBlob);
    } catch (err) {
      if (attempt >= UPLOAD_RETRY_DELAYS_MS.length) throw err;
      await wait(UPLOAD_RETRY_DELAYS_MS[attempt]);
    }
  }
}

export async function uploadExamAnswer(examId, questionId, audioBlob) {
  const { uploadUrl, fileKey } = await getAnswerUploadUrl(examId, questionId);
  await putAnswerAudioToS3WithRetry(uploadUrl, audioBlob);
  return submitAnswerForGrading(examId, questionId, fileKey);
}
```

## 6. 남은 과제

- 5회 재시도를 모두 소진해 최종 실패하는 경우에도 여전히 사용자에게는 아무 피드백이 없다(콘솔 로그만 남음). 재시도로도 복구 못한 실패를 어떻게 사용자/운영에 노출할지(토스트, 서버 로그 집계 등)는 별도 논의가 필요하다.
- presigned URL의 60초 유효시간은 백엔드 설정값을 전달받아 반영한 것으로, 이 값이 향후 바뀌면 안 B의 재시도 총 소요시간(~31초)과의 여유가 줄어들 수 있으니 함께 재검토해야 한다.
- 채점 요청(`submitAnswerForGrading`) 단계는 이번 재시도 대상에서 제외했는데, 이 단계도 실패 사례가 관찰되면 별도로 재시도 도입을 검토할 수 있다.
