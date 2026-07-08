const STORAGE_KEY = "toseonsaeng-anonymous-id";

/**
 * 개인정보(이름/이메일 등)를 전혀 포함하지 않는 익명 식별자.
 * 최초 방문 시 브라우저에서 생성해 localStorage에 영구 저장하고, 이후에는 같은 값을 재사용한다.
 * 로그인 시스템이 없는 현재 구조에서 동의 기록과 사용자를 연결할 수 있는 유일한 축이다.
 */
export function getOrCreateAnonymousId(): string {
  if (typeof window === "undefined") return "";

  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;

  const id = crypto.randomUUID();
  window.localStorage.setItem(STORAGE_KEY, id);
  return id;
}
