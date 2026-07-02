# 모의고사 세션 이탈 지점 트래킹

`src/components/exam/exam-session-screen.tsx`에 URL 쿼리스트링을 반영한 이유와, 그 과정에서 검토했던 후보안들을 정리한다.

## 1. 배경

모의고사 응시 화면은 `/exam/session` 하나의 URL로 고정되어 있고, 몇 번째 파트·몇 번째 문제인지는 컴포넌트 내부 `useState`(`index`, `phase`)로만 관리된다. 이 상태로는 사용자가 응시 도중 이탈했을 때 "어느 파트, 몇 번 문제에서 나갔는지"를 URL이나 서버 로그만으로는 알 수 없다.물론 clarity등에서 사용자가 어느 화면엣거 이탈했는지를 볼 수는 있지만 집계 데이터가 많아지는 경우에 유의미한 결론으로 확인할 수가 없다. 

## 2. 검토한 후보안

### 후보 A: 라우트 자체를 세분화 (`/exam/session/[part]/[question]`)

URL만 보고도 서버 로그·애널리틱스 도구가 이탈 지점을 자동 집계할 수 있다는 장점이 있지만, 이 화면의 특성상 문제가 맞지 않았다.

- 이 화면은 타이머(`usePhaseCountdown`)와 오디오 재생(`useAudioCue`, `useAudioSequence`)이 초 단위로 자동 진행되는 구조다. 문제마다 별도 `page.tsx` 세그먼트로 라우팅하면, App Router가 URL 변경 시 해당 세그먼트의 컴포넌트를 언마운트·재마운트하면서 진행 중이던 타이머/오디오가 끊기거나 리셋될 위험이 있다.
- App Router는 Pages Router에 있던 shallow routing이 제거되어, `router.push`/`replace`는 쿼리스트링만 바뀌어도 매번 서버에 RSC payload를 요청한다. 로컬 state 전환(즉시·무비용)과 비교하면 매 문제 전환마다 불필요한 네트워크 왕복이 생긴다.
- 문제 전환마다 실제 history 엔트리가 쌓이면, 화면에 명시된 "시험 도중 뒤로 갈 수 없어요" 정책과 충돌한다. 브라우저 뒤로가기로 이전 문제에 재접근하지 못하도록 별도 가드가 필요해진다.

### 후보 B: URL 변경 없이 이벤트 트래킹만 추가

`analytics.track("question_view", { part, question })` 같은 이벤트를 직접 전송하는 방식. 라우팅 구조를 전혀 건드리지 않아도 되지만, 이 프로젝트엔 아직 어떤 애널리틱스 SDK도 붙어있지 않고(GA4, Clarity 등 미설치 확인됨), Clarity 같은 세션 리코딩 도구의 entry/exit page 필터링·세그먼트 기능은 URL 기반으로 동작하기 때문에 URL 정보 없이는 활용도가 떨어진다.

### 채택안: 같은 라우트를 유지하고 쿼리스트링만 갱신

`/exam/session` 경로는 그대로 두고, `?part=&question=&phase=` 쿼리스트링만 `window.history.replaceState()`로 직접 갱신한다.

```tsx
useEffect(() => {
  if (!question) return;
  const params = new URLSearchParams(window.location.search);
  params.set("part", String(question.partNumber));
  params.set("question", String(question.questionNumber));
  params.set("phase", phase);
  window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
}, [question, phase]);
```

`router.replace()` 대신 네이티브 History API를 쓴 이유는, 이 함수가 브라우저 주소창과 history 엔트리만 바꾸는 순수 브라우저 기능이라 Next.js 라우터의 세그먼트 재계산 파이프라인을 아예 거치지 않기 때문이다. 그 결과:

- **리마운트 없음**: React는 `window.location`이 아니라 자기 자신의 state/props/key로만 렌더링을 결정한다. History API 호출은 React 트리에 어떤 신호도 보내지 않는다.
- **네트워크 왕복 없음**: Next 라우터의 dispatch를 거치지 않으므로 RSC payload 요청이 발생하지 않는다.
- **history 스택 문제 없음**: `pushState`가 아니라 `replaceState`라 현재 엔트리를 덮어쓸 뿐 쌓이지 않는다.

`phase`(directions/prep/speaking 등)까지 포함한 이유는, 이 방식이 사실상 비용이 0에 가까워서 "이탈이 준비 단계에 몰리는지 답변 단계에 몰리는지"까지 구분할 수 있어서다. 노이즈가 크다고 판단되면 `part`/`question`만 남기고 제거해도 된다.

## 3. Microsoft Clarity와의 관계

세션 리코딩 도구로 Microsoft Clarity를 검토하면서 두 가지를 확인했다.

- GitHub 이슈(microsoft/clarity#175, #67)에는 SPA에서 `pushState`/`replaceState`가 감지될 때마다 세션이 재시작된다는 보고가 있었지만, 공식 문서([Recordings overview](https://learn.microsoft.com/en-us/clarity/session-recordings/recordings-overview))를 보면 세션 종료 기준은 URL 변경이 아니라 **30분 비활성**이고, 세션 카드에는 entry/exit page가 복수형으로 기록된다. 즉 하나의 세션 안에서 여러 URL을 거쳐가는 것이 정상 동작이며, 위 이슈는 특정 프레임워크 연동 방식이나 구버전 이슈로 보인다.
- "세션 녹화를 재생하면 마지막 화면으로 이탈 지점을 알 수 있는데 왜 URL이 필요한가"라는 질문에는, 개별 세션 하나를 눈으로 확인할 때는 URL이 없어도 충분하지만, 다수 세션에 대한 **집계·필터링·heatmap**은 Clarity에서 URL 단위로 동작하기 때문에 "어느 문제에서 이탈이 몰리는지"를 자동으로 뽑으려면 여전히 URL 세분화가 필요하다는 결론을 냈다.

## 4. 남은 과제

- 실제 Clarity를 프로젝트에 연동해 세션이 문제 전환에도 하나로 유지되는지 검증 필요.
- 새로고침 시 진행 상태 복원이 요구사항이 된다면, 지금은 URL을 쓰기만 하고 읽지 않으므로 `useSearchParams()`로 초기값을 복원하는 로직이 추가로 필요.
