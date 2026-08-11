import type { Metadata } from "next";

import { SentrySmokeTestButton } from "@/app/app-settings/sentry-smoke-test/SentrySmokeTestButton";

export const metadata: Metadata = {
  title: "Sentry Source Map Smoke Test",
  robots: { index: false, follow: false },
};

export default function SentrySmokeTestPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-zinc-50 px-5 py-10">
      <section className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl text-zinc-950">Sentry Source Map 테스트</h1>
        <p className="mt-4 text-sm leading-6 text-zinc-600">
          아래 버튼은 브라우저에서 의도적인 오류를 한 번 발생시킵니다. 테스트 후
          Sentry의 Stack Trace가 이 TypeScript 파일과 실제 줄 번호를 가리키는지
          확인하세요.
        </p>
        <div className="mt-6">
          <SentrySmokeTestButton />
        </div>
      </section>
    </main>
  );
}
