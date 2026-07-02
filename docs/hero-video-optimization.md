# Hero 영상 최적화

`src/components/hero-video.tsx`에서 재생하는 배경 영상(`speaking.*`)에 적용된 최적화와 그 이유를 정리한다.

## 1. 워터마크 제거

기존 `public/hero/speaking.mp4`는 AI 영상 생성 도구에서 내려받은 원본이라 우측 하단에 "Dola AI" 워터마크가 박혀 있었다. `ffmpeg`의 `delogo` 필터로 해당 영역(고정된 위치, 우측 하단 코너)을 주변 프레임 정보로 보간해 제거했다.

```
delogo=x=1090:y=634:w=188:h=84:show=0
```

워터마크가 영상 내내 같은 위치에 고정되어 있어 프레임마다 좌표를 바꿀 필요 없이 단일 박스로 처리 가능했다.

## 2. mp4 코덱 변경 (HEVC → H.264)

원본 mp4는 HEVC(H.265)로 인코딩되어 있었다. HEVC는 Chrome/Firefox 등 주요 브라우저에서 기본적으로 재생이 보장되지 않는다. 워터마크 제거 과정에서 어차피 재인코딩이 필요했으므로, 이 기회에 범용 호환성이 높은 H.264로 코덱을 바꿨다.

## 3. 최적화된 webm(VP9) 소스 추가

`<video>`에 `<source>`를 여러 개 넣으면 브라우저가 위에서부터 순서대로 지원 여부를 확인해 첫 번째로 재생 가능한 포맷을 사용한다. 이 특성을 이용해:

- **`speaking.webm` (VP9)**: 대부분의 최신 브라우저가 지원하며, 같은 화질 기준으로 H.264보다 용량이 작다. (mp4 1.7MB → webm 1.1MB, 약 35% 절감)
- **`speaking.mp4` (H.264)**: webm을 지원하지 않는 환경을 위한 fallback.

```tsx
<source src="/hero/speaking.webm" type="video/webm" />
<source src="/hero/speaking.mp4" type="video/mp4" />
```

## 4. 오디오 트랙 제거

영상은 항상 `muted`로 자동 재생되고 컨트롤 UI도 없어 오디오가 재생될 일이 없다. 사용하지 않는 오디오 트랙을 인코딩 단계에서 제거해 두 포맷 모두 용량을 추가로 줄였다.

## 5. `IntersectionObserver`로 뷰포트 밖에서는 재생 중지

`autoPlay + loop`만 사용하면 사용자가 스크롤로 화면 밖으로 내려가도 브라우저가 영상을 계속 디코딩한다. 브라우저는 오프스크린 `<video>`를 자동으로 일시정지해주지 않기 때문에, 화면 밖에 있는 동안에도 CPU/GPU와 배터리를 불필요하게 소모한다.

이를 해결하기 위해 `autoPlay` 속성을 제거하고, `IntersectionObserver`로 영상 요소가 뷰포트에 들어올 때만 `play()`, 벗어나면 `pause()`를 호출하도록 변경했다.

```tsx
const observer = new IntersectionObserver(
  ([entry]) => {
    if (entry.isIntersecting) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  },
  { threshold: 0.1 },
);
observer.observe(video);
```

`IntersectionObserver`는 메인 스레드를 막지 않는 비동기 네이티브 API라 관찰 비용 자체는 매우 낮다. 반면 화면 밖에서도 루프 영상을 계속 디코딩하는 비용은 상대적으로 크기 때문에, 이 변경은 오버헤드를 추가하는 것이 아니라 불필요한 리소스 사용을 줄이는 최적화다.
