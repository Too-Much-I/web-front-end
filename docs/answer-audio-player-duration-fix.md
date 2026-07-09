# 답변 오디오 플레이어의 duration 표시 버그 수정

문제별 피드백 화면(`ExamQuestionFeedbackScreen`)에 커스텀 오디오 플레이어(`AnswerAudioPlayer`)를 새로 붙이는 과정에서 재생시간이 항상 `00:00`으로 멈춰있던 두 가지 원인과, 고친 방식·성능에 미치는 영향을 정리한다.

## 1. 배경

기존에는 네이티브 `<audio controls src={detail.audioUrl} />`로 답변 녹음을 재생했다(`src/components/exam/exam-question-feedback-screen.tsx`). 참고 디자인을 따라 재생 버튼·파형·배속 선택이 있는 커스텀 플레이어(`src/components/exam/answer-audio-player.tsx`)로 교체하면서, 재생시간을 직접 `<audio>`의 `duration`을 읽어 표시하도록 구현했다. Playwright로 실제 페이지를 띄워 검증하는 과정에서 시간 표시가 항상 `00:00 / 00:00`으로 멈춰있는 걸 발견했고, 원인은 서로 무관한 두 가지였다.

## 2. 원인 1 — `MediaRecorder` 녹음 파일의 `duration = Infinity`

이 앱의 답변 녹음은 `new MediaRecorder(stream)`으로 만들어지고(`src/features/exam/use-answer-recorder.ts:82`), 브라우저 기본 mimeType(크롬에서는 보통 `audio/webm;codecs=opus`)이 그대로 붙어 S3에 업로드된다. `MediaRecorder`는 청크를 실시간으로 이어붙이는 스트리밍 방식이라, 녹음이 끝난 시점에도 컨테이너(webm)에 "총 길이" 값이 확정적으로 기록되지 않는 경우가 흔하다. 이런 파일을 `<audio>`로 열면 크롬은 `audio.duration`으로 `Infinity`를 돌려준다(길이를 모르는 라이브 스트림처럼 취급). 이건 이 프로젝트만의 문제가 아니라 크롬에서 잘 알려진 동작이다.

### 해결: `currentTime`을 파일 끝 너머로 seek했다가 되돌리기

```ts
// src/components/exam/answer-audio-player.tsx
function resolveAudioDuration(audio, isFixingDurationRef, setDuration) {
  if (Number.isFinite(audio.duration)) {
    setDuration(audio.duration);
    return;
  }
  isFixingDurationRef.current = true;
  audio.currentTime = 1e101; // 파일 끝보다 훨씬 큰 값으로 seek 시도
  const handleTimeUpdate = () => {
    audio.removeEventListener("timeupdate", handleTimeUpdate);
    audio.currentTime = 0; // 실제 재생 위치는 그대로 두지 않고 처음으로 복귀
    isFixingDurationRef.current = false;
    if (Number.isFinite(audio.duration)) setDuration(audio.duration);
  };
  audio.addEventListener("timeupdate", handleTimeUpdate);
}
```

`currentTime`을 임의의 큰 값으로 seek하면 브라우저는 실제 파일 끝으로 위치를 clamp하는데, 그 과정에서 컨테이너의 진짜 길이를 다시 계산해 `duration`이 유한한 값으로 바뀐다. 이후 `timeupdate` 이벤트가 한 번 발생하는 시점에 값을 읽고, 재생 위치는 다시 0으로 되돌린다.

## 3. 원인 2 — SSR 하이드레이션과 `loadedmetadata` 이벤트의 경쟁(race)

원인 1을 고친 뒤에도 여전히 `00:00`이 표시돼 Playwright로 이벤트 발생 여부를 직접 추적해보니(`HTMLMediaElement.prototype.addEventListener`를 몽키패치해 확인), `loadedmetadata`/`durationchange` 리스너가 한 번도 호출되지 않고 있었다. 반면 같은 시점에 `audio.duration`을 직접 읽으면(`page.evaluate`) 이미 유한한 값이 들어있었다.

원인은 SSR이다. Next.js가 서버에서 만든 초기 HTML에는 이미 완성된 `<audio src="...">` 태그가 포함돼 있고, 브라우저는 이 HTML을 파싱하는 즉시 React 번들 실행(하이드레이션)과 무관하게 오디오 리소스를 로드하기 시작한다. 답변 녹음은 몇 초~1분 내외로 짧아 로딩(및 `loadedmetadata` 발생)이 매우 빠른데, 반대로 하이드레이션은 (특히 `pnpm dev`처럼 번들이 압축되지 않은 환경에서) 상대적으로 오래 걸릴 수 있다. 그 결과 `loadedmetadata` 이벤트가 React가 리스너를 붙이기도 전에 이미 발생해버리고, 이벤트는 발생 시점에 리스닝 중인 코드에만 전달되므로 이후 리스너를 붙여도 다시 받을 수 없다.

### 해결: 마운트 시점에 이벤트를 기다리지 않고 `readyState`를 직접 확인

```ts
// src/components/exam/answer-audio-player.tsx
useEffect(() => {
  const audio = audioRef.current;
  if (audio && audio.readyState >= 1) {
    resolveAudioDuration(audio, isFixingDurationRef, setDuration);
  }
}, []);
```

`readyState`는 미디어 엘리먼트가 항상 들고 있는 로딩 상태 값(0=아직 없음 ~ 4=재생 가능)이라, 이벤트를 놓쳤더라도 마운트 시점에 "이미 메타데이터가 로드돼 있는지"(`>= 1`, `HAVE_METADATA`)를 직접 확인할 수 있다. 이미 로드돼 있으면 이벤트를 기다리지 않고 그 자리에서 `resolveAudioDuration`을 호출한다. `onLoadedMetadata`/`onDurationChange` 리스너는 (느린 네트워크 등으로) 마운트 이후에 로딩이 끝나는 정상 케이스를 위해 그대로 유지했다.

## 4. 성능에 미치는 영향

- **초기 렌더링은 지연되지 않는다.** 두 처리 모두 컴포넌트가 이미 페인트된 뒤 `useEffect`/이벤트 콜백 안에서 비동기로 실행된다. 재생 버튼·파형 자리·배속 버튼은 즉시 표시되고, 재생시간 숫자만 `00:00`에서 실제 값으로 나중에 갱신된다.
- **seek 트릭은 파일을 통째로 다시 받지 않는다.** S3처럼 Range 요청을 지원하는 서버라면, 끝으로 seek할 때 파일 끝부분의 작은 구간만 추가로 요청해 컨테이너의 길이 정보를 읽어온다.
- **어차피 파형 때문에 파일 전체를 한 번은 받는다.** 같은 컴포넌트의 `extractWaveformPeaks`가 실제 진폭을 뽑기 위해 `fetch()`로 파일 전체를 받아 `AudioContext.decodeAudioData`로 디코딩한다. seek 트릭으로 인한 추가 요청은 이것과 별개의, 훨씬 가벼운 요청이다.
- **정상 파일(길이가 이미 유한한 경우)은 이 트릭이 아예 실행되지 않는다.** `resolveAudioDuration`은 `Number.isFinite(audio.duration)`이면 즉시 `setDuration`만 호출하고 끝난다.
- **seek 중 재생시간 표시가 잠깐 튀는 것은 막아뒀다.** `currentTime`을 큰 값으로 옮기는 순간에도 `onTimeUpdate`가 발생하는데, 이게 그대로 화면에 반영되면 시간이 끝으로 튀었다가 0으로 돌아오는 깜빡임이 생긴다. `isFixingDurationRef` 플래그로 이 구간 동안은 `currentTime` 상태 갱신을 건너뛴다(`onTimeUpdate` 핸들러 참고).

## 5. 검증 방법

로컬 개발 서버에서 실제로 확인하기 전까지는 두 문제 다 드러나지 않았다(정적 타입체크·린트는 통과했지만 런타임 이벤트 타이밍 문제라 코드 리뷰만으로는 잡기 어려움). `docs`가 아닌 임시 라우트(`src/app/dev-audio-preview`)에 컴포넌트를 단독으로 띄우고 Playwright로 데스크톱(1280px)·모바일(375px) 두 폭에서 재생/일시정지/배속 변경까지 조작해 콘솔 에러와 렌더된 텍스트를 직접 확인한 뒤 임시 라우트는 삭제했다.
