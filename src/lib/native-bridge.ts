declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage(message: string): void;
    };
  }
}

/** 웹뷰 → 네이티브 앱으로 타입드 메시지를 보낸다. RN이 onMessage로 받아 처리한다. */
export function postToNative(message: object) {
  window.ReactNativeWebView?.postMessage(JSON.stringify(message));
}
