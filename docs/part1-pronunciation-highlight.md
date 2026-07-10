# Part 1 답변 스크립트의 단어별 발음 하이라이트

Part 1(낭독) 문제 피드백 화면에 발음 정확도를 단어 단위로 시각화한 배경과, 심각도를 나누는 기준을 어떻게 정했는지 정리한다.

## 1. 배경

기존 `ExamQuestionFeedbackScreen`은 Part 2~5는 `ExamMarkedTranscript`로 `correctionItems`를 스크립트 위에 마킹해서 보여줬지만, Part 1은 `detail.partNumber !== 1` 분기로 아예 제외되고 마크 없는 회색 박스에 원문만 그대로 찍어주고 있었다. Part 1은 낭독 문제라 발음이 핵심 평가 요소인데 정작 발음 피드백은 텍스트 문단(`feedback.pronunciation`)으로만 존재하고, 어느 단어가 문제였는지는 화면 어디서도 보여주지 않고 있었다.

## 2. 실제 도메인 응답 확인

로컬 `.env.local`이 가리키는 `http://localhost:8010`은 예전 세션에서 만든 임시 목업 서버(`mock-part4-server.mjs`)로, examId/questionNumber에 관계없이 항상 같은 Part 4 Q10 더미만 돌려주고 있어 Part 1 실제 응답 구조를 확인할 수 없었다. 실제 배포 도메인 `https://to-teacher.com`에 직접 `GET /api/v1/exams/1/questions/1`을 호출해 확인한 결과, Part 1 응답에는 기존 `src/types/exam.ts`의 `RawExamQuestionFeedback`에 없던 최상위 필드 `spokenWordSequence`가 함께 내려오고 있었다.

`spokenWordSequence`는 Azure Pronunciation Assessment 결과를 단어 하나하나마다 담은 배열로, 각 항목은 `word`, `accuracyScore`(0~100), `errorType`("None" | "Mispronunciation" | ...) 등을 갖는다. 중요한 점은 이 배열의 단어 순서가 **실제로 발화(인식)된 순서**라는 것이다 — 응답의 `transcript` 필드는 오히려 정제된 참고 답안에 가까워서(`correctedAnswer`/`recommendedAnswer`와 동일한 문장), STT 오독으로 끼어든 단어("assist the elderly **are** and...")가 `transcript`에는 없지만 `spokenWordSequence`에는 그대로 남아 있다. 그래서 `ExamMarkedTranscript`처럼 `correctionItems.original`을 `transcript` 안에서 `indexOf`로 찾아 마킹하는 방식은 Part 1에 그대로 쓸 수 없었고, `spokenWordSequence` 자체를 순서대로 이어붙여 렌더링하는 별도 컴포넌트(`ExamPronunciationTranscript`)가 필요했다.

(참고: 같은 응답에 `offTopicItems`/`correctedAnswer`/`recommendedAnswer` 필드도 있었는데, 이번 작업 범위에서는 다루지 않고 타입에 추가하지 않았다 — 필요해지면 별도로 매핑해야 한다.)

## 3. 단어별 심각도 판정 기준

`spokenWordSequence`에는 문장 단위 `correctionItems`처럼 백엔드가 미리 매겨둔 severity가 없고, 단어마다 `accuracyScore`/`errorType`만 있다. 그래서 `getWordSeverity()`(`src/components/exam/exam-pronunciation-transcript.tsx`)에서 자체적으로 3단계로 환산했다:

```ts
function getWordSeverity(word: SpokenWord): WordSeverity | null {
  if (word.errorType !== "None") return "high";   // 발음 오류
  if (word.accuracyScore < 75) return "medium";    // 부정확
  if (word.accuracyScore < 90) return "low";       // 약간 부정확
  return null;                                     // 마크 없음
}
```

- **`errorType !== "None"`이면 점수와 무관하게 무조건 "high"(발음 오류)** — Azure가 이미 명시적으로 오류라고 판정한 신호이므로 가장 신뢰도 높은 기준으로 우선 적용했다.
- **`errorType`이 "None"인데 `accuracyScore < 75`면 "medium"(부정확)**, **`< 90`이면 "low"(약간 부정확)** — 명시적 오류는 아니지만 점수가 낮게 나온 경우를 연속적으로 구분하기 위한 보조 기준.
- 75/90 두 경계값은 백엔드가 공식적으로 내려주는 임계값이 아니라, 실측 응답 하나(`examId=1, questionNumber=1`)를 보고 정한 값이다. 이 응답에서 `elderly`(39점, Mispronunciation)와 `are`(50점, Mispronunciation)는 실제로 `correctionItems`에도 severity `"high"`로 잡혀 있어 `errorType` 우선 규칙이 이 두 단어에 대해서는 백엔드 판단과 일치한다는 걸 확인했다. 반면 `assist`(85점)·`social`(70점)은 `correctionItems`에서 둘 다 `"medium"`으로 분류돼 있었지만, 본 로직으로는 각각 "low"(85점 → <90)·"medium"(70점 → <75)으로 갈려 백엔드의 판단과 완전히 일치하지는 않는다 — 애초에 문장 단위 4개 정도의 `correctionItems`만으로는 나머지 50여 개 단어의 등급을 역산할 근거가 부족해서, "정도에 따라 연속적으로" 보여주는 게 목적인 이 기능에서는 독립적인 점수 구간을 쓰는 쪽을 택했다.

## 4. 표시 방식: 세모 마크 대신 형광펜 스타일

Part 2~5의 `ExamMarkedTranscript`는 오류 종류(`type`)별로 박스/밑줄/세모 마크를 구분해서 쓰는데, 처음엔 발음 오류에 쓰던 세모 마크(단어 아래 작은 삼각형)를 그대로 재사용했다. 이후 "형광펜으로 칠한 것처럼 단어 위에 반투명하게 배경을 칠해달라"는 피드백을 받아, `SEVERITY_COLOR`(주황 3단계, `exam-marked-transcript.tsx`에서 export)에 알파 35%(`59` hex)를 섞어 단어 자체의 배경색으로 바로 칠하는 방식으로 바꿨다(`toHighlightColor()`). 범례(`SEVERITY_LEGEND`)도 원형 점 대신 같은 하이라이트 색의 작은 사각형 스와치로 바꿔서 실제 마크와 모양을 맞췄다.

## 5. 데모용 로컬 목업

실제 백엔드가 항상 접근 가능한 게 아니라(로컬은 죽은 목업, 배포 도메인은 502로 다운돼 있던 시점도 있었다), 개발 중 확인용으로 `spokenWordSequence`가 포함된 실측 Part 1 응답을 그대로 박아넣은 임시 Node 목업 서버를 만들어 `localhost:8010`에 띄워뒀다(스크래치패드에만 존재, 저장소에는 포함되지 않음). `questionNumber`가 1·2면 이 Part 1 실측 데이터를, 그 외에는 기존 Part 4 Q10 목업을 반환한다. `.env.local`의 `NEXT_PUBLIC_API_BASE_URL=http://localhost:8010`을 그대로 쓰므로 별도 설정 없이 `/exam/result/question?examId=demo&questionNumber=1`로 바로 확인할 수 있다.

## 6. 남은 과제

- 75/90 경계값은 실측 응답 1건으로 보정한 초기값이라, 더 많은 실제 Part 1 응답을 받아보면 재조정이 필요할 수 있다.
- `spokenWordSequence`가 다른 파트(2~5)에도 내려오는지는 아직 확인하지 못했다 — 만약 내려온다면 `ExamMarkedTranscript`와의 관계(둘 다 보여줄지, 하나로 합칠지)를 다시 설계해야 한다.
- `offTopicItems`/`correctedAnswer`/`recommendedAnswer`는 실제 응답에 있지만 아직 타입/매핑에 반영하지 않았다.
