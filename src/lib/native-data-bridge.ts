/**
 * 앱 웹뷰에서 인증이 필요한 데이터를 네이티브를 통해 받아오는 통로.
 *
 * 이 페이지들은 앱 WebView 안에서만 열리고, 앱은 액세스 토큰을 웹으로 넘기지 않는다.
 * 대신 네이티브가 자신의 토큰으로 API를 호출해 서버 원본 result를 돌려준다.
 * 매핑은 웹이 계속 소유하므로 여기서는 원본을 그대로 반환한다.
 *
 * 계약은 app-front-end의 `src/features/exam/native-data-bridge.ts`가 함께 정의한다.
 */
const REQUEST_TYPE = "NATIVE_DATA_REQUEST";

/**
 * 네이티브의 API 타임아웃(10초)보다 넉넉하게 잡는다.
 * 웹이 먼저 포기하면 정상 응답이 버려진 뒤에 도착한다.
 */
const RESPONSE_TIMEOUT_MS = 15_000;

export type NativeDataResource = "EXAM_SUMMARY" | "QUESTION_FEEDBACK";

type PendingRequest = {
  resolve: (result: unknown) => void;
  reject: (error: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
};

declare global {
  interface Window {
    __nativeDataBridge?: {
      deliver(rawPayload: string): void;
      refresh(): void;
    };
  }
}

const pendingRequests = new Map<string, PendingRequest>();
const refreshListeners = new Set<() => void>();
let requestSequence = 0;

function settle(requestId: string): PendingRequest | undefined {
  const pending = pendingRequests.get(requestId);
  if (!pending) return undefined;
  clearTimeout(pending.timeoutId);
  pendingRequests.delete(requestId);
  return pending;
}

/**
 * 네이티브가 injectJavaScript로 호출하는 진입점.
 *
 * 페이로드는 객체가 아니라 JSON 문자열로 온다 — 주입 코드가 깨지지 않도록
 * 네이티브가 문자열 리터럴로 감싸서 보내기 때문이다.
 */
function installBridge(): void {
  if (typeof window === "undefined") return;
  if (window.__nativeDataBridge) return;

  window.__nativeDataBridge = {
    deliver(rawPayload: string) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(rawPayload);
      } catch {
        return;
      }
      if (typeof parsed !== "object" || parsed === null) return;

      const payload = parsed as Record<string, unknown>;
      const requestId = payload.requestId;
      if (typeof requestId !== "string") return;

      const pending = settle(requestId);
      if (!pending) return;

      if (payload.ok === true) {
        pending.resolve(payload.result);
        return;
      }

      const message =
        typeof payload.message === "string" && payload.message.length > 0
          ? payload.message
          : "데이터를 불러오지 못했어요.";
      pending.reject(new Error(message));
    },

    refresh() {
      for (const listener of refreshListeners) {
        listener();
      }
    },
  };
}

/**
 * 네이티브의 갱신 신호를 구독한다. 해지 함수를 돌려준다.
 *
 * 응답에 담긴 사용자 답변 오디오 URL은 presigned라 발급 후 만료된다. 네이티브가 만료 전에
 * 이 신호를 보내면, 화면은 그대로 둔 채 데이터만 다시 받아 새 URL로 갈아 끼운다.
 *
 * 데이터가 바뀌어서가 아니라 URL 서명이 만료돼서 다시 받는 것이므로, 캐시 정책
 * (`staleTime`)을 풀어 간접적으로 재조회를 얻어내지 않고 신호를 명시적으로 받는다.
 * 신선도와 접근 자격의 유효기간은 별개의 축이다.
 */
export function subscribeToNativeDataRefresh(listener: () => void): () => void {
  installBridge();
  refreshListeners.add(listener);
  return () => {
    refreshListeners.delete(listener);
  };
}

/** 앱 웹뷰 안에서 열렸는지 판별한다. 브라우저 단독 접근이면 false다. */
export function isNativeBridgeAvailable(): boolean {
  return typeof window !== "undefined" && Boolean(window.ReactNativeWebView);
}

/** 네이티브에 데이터를 요청하고 서버 원본 result를 받는다. */
export function requestFromNative<T>(
  resource: NativeDataResource,
  params: Record<string, string | number>,
): Promise<T> {
  installBridge();

  if (!isNativeBridgeAvailable()) {
    return Promise.reject(
      new Error("앱 웹뷰 안에서만 데이터를 받을 수 있어요."),
    );
  }

  requestSequence += 1;
  const requestId = `${Date.now()}-${requestSequence}`;

  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      pendingRequests.delete(requestId);
      reject(new Error("데이터를 받는 데 너무 오래 걸렸어요."));
    }, RESPONSE_TIMEOUT_MS);

    pendingRequests.set(requestId, {
      resolve: resolve as (result: unknown) => void,
      reject,
      timeoutId,
    });

    window.ReactNativeWebView?.postMessage(
      JSON.stringify({ type: REQUEST_TYPE, requestId, resource, params }),
    );
  });
}
