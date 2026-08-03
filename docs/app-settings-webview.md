# 앱 설정 화면 웹뷰 계약

RN 앱의 설정 화면이 웹뷰로 띄우는 페이지와 그 전제를 적는다. 설계 배경은
`docs/superpowers/specs/2026-08-03-app-settings-webview-design.md`에 있다.

## 경로

세 개가 계약이며 쿼리 파라미터는 쓰지 않는다.

| 설정 항목         | 경로                    |
| ----------------- | ----------------------- |
| 개인정보 처리방침 | `/app-settings/privacy` |
| 이용약관          | `/app-settings/terms`   |
| 문의하기          | `/app-settings/contact` |

## RN이 지켜야 하는 것

**1. 화면 헤더는 RN이 그린다.** 웹 페이지에는 뒤로가기 버튼도 타이틀바도 없다.
웹은 상단 safe-area를 다루지 않고 하단 inset만 처리한다
(`src/app/app-settings/layout.tsx`).

**2. 외부 링크는 웹뷰 밖으로 넘긴다.** 문의하기의 `mailto:`와 Gmail 작성 링크가
웹뷰 안에서 열리면 앱이 메일 화면에 갇힌다.

```tsx
<WebView
  source={{ uri: `${WEB_BASE_URL}/app-settings/contact` }}
  onShouldStartLoadWithRequest={(request) => {
    const isExternal =
      !request.url.startsWith(WEB_BASE_URL) ||
      request.url.startsWith("mailto:");
    if (isExternal) {
      Linking.openURL(request.url);
      return false;
    }
    return true;
  }}
/>
```

**3. 이 페이지들은 앱 밖으로 나가는 내부 링크를 두지 않는다.** 웹 쪽 제약이며
아래로 확인할 수 있다.

```bash
grep -rn 'next/link\|href="/"' src/app/app-settings/
```

## 웹 쪽 제약

- `robots` noindex — 웹의 `/privacy`·`/terms`와 중복 색인되면 안 된다.
- 시행일(`EFFECTIVE_DATE`)은 웹 문서와 따로 관리한다. 본문이 다르기 때문이다.
- **`app-*` 라우트에는 웹 분석 도구가 붙지 않는다.**
  `src/components/analytics-gate.tsx`가 경로 접두사로 가른다.

## 앱 쪽 분석

앱의 이용 분석은 네이티브 SDK 하나로 모은다. 웹뷰에 웹 SDK를 함께 두면 같은
사용자가 네이티브 세션과 웹 세션으로 쪼개져 이용자 수가 중복 집계되고 퍼널이
끊긴다. 그래서 웹뷰 라우트에서는 웹 Clarity·GA 스크립트를 걷어냈다.

앱은 **Microsoft Clarity를 네이티브 SDK로** 붙인다. Google Analytics는 앱에
붙이지 않는다. 앱용 개인정보 처리방침(`/app-settings/privacy`)의 위탁·국외
이전·자동 수집 장치 조문이 이 전제로 쓰여 있으므로, 분석 도구를 바꾸거나
추가하면 방침도 함께 고쳐야 한다.

웹뷰 화면에서 일어난 일을 남기고 싶으면 웹 SDK를 붙이지 말고 브릿지로 넘긴다.

```js
window.ReactNativeWebView?.postMessage(
  JSON.stringify({ type: "analytics", event: "privacy_viewed" }),
);
```

RN이 `onMessage`로 받아 네이티브 SDK로 기록한다.
