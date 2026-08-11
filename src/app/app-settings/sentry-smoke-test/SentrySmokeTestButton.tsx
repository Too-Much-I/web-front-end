"use client";

const SENTRY_SMOKE_TEST_ERROR = "SENTRY_SOURCEMAP_SMOKE_TEST";

export function SentrySmokeTestButton() {
  const triggerSmokeTest = () => {
    // React 이벤트 처리 밖에서 발생시켜 Sentry의 전역 브라우저 오류 수집까지 검증한다.
    setTimeout(() => {
      throw new Error(`${SENTRY_SMOKE_TEST_ERROR}_${new Date().toISOString()}`);
    }, 0);
  };

  return (
    <button
      type="button"
      onClick={triggerSmokeTest}
      className="min-h-12 rounded-xl bg-red-600 px-5 py-3 text-base text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
    >
      Sentry 테스트 오류 발생
    </button>
  );
}
