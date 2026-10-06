"use client";

import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { useSyncExternalStore } from "react";

import { resolveAppUpdateStores } from "@/lib/app-update-stores";
import type {} from "@/lib/native-data-bridge";

// 네이티브 capability는 문서 실행 전에 주입되며 페이지 수명 동안 고정된다.
function subscribe(): () => void {
  return () => undefined;
}

function getCapabilities() {
  return window.ReactNativeWebView ? window.__nativeCapabilities : undefined;
}

function getServerCapabilities() {
  return undefined;
}

export function AppUpdateRequiredScreen() {
  const capabilities = useSyncExternalStore(
    subscribe,
    getCapabilities,
    getServerCapabilities,
  );
  const stores = resolveAppUpdateStores(capabilities, Boolean(capabilities));

  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center bg-[#fff9f2] px-6 text-blue-950"
      style={{
        paddingTop: "max(2rem, env(safe-area-inset-top))",
        paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
      }}
    >
      <section
        aria-labelledby="app-update-title"
        className="mx-auto flex w-full max-w-sm flex-col items-center text-center sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl"
      >
        <div className="mb-7 flex size-44 items-center justify-center rounded-full bg-orange-100/70 sm:size-48 md:size-52 lg:size-56 xl:size-60">
          <Image
            src="/mascots/hmm_rabbit_tight.png"
            alt="땀을 흘리는 토끼 선생님"
            width={311}
            height={512}
            priority
            className="h-full w-auto object-contain"
          />
        </div>
        <h1
          id="app-update-title"
          className="text-2xl tracking-tight sm:text-3xl md:text-3xl lg:text-4xl xl:text-4xl"
        >
          업데이트가 필요해요
        </h1>
        <p className="mt-3 text-base leading-relaxed break-keep text-slate-600 sm:text-lg md:text-lg lg:text-xl xl:text-xl">
          계속 이용하려면 최신 버전으로 업데이트해 주세요.
        </p>
        <div className="mt-7 flex w-full items-start gap-2.5 rounded-2xl border border-orange-100 bg-white/80 px-4 py-4 text-left sm:px-5 md:px-6">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0 text-orange-600"
          />
          <p className="text-sm leading-relaxed break-keep text-slate-600 sm:text-base md:text-base lg:text-lg xl:text-lg">
            앱을 삭제하지 않고 스토어에서 업데이트하면 기존 학습 기록이
            유지돼요.
          </p>
        </div>
        <nav
          aria-label="앱 업데이트"
          className="mt-7 flex w-full flex-col gap-3"
        >
          {stores.map((store) => (
            <a
              key={store.platform}
              href={store.href}
              target="_self"
              className="flex min-h-14 items-center justify-center rounded-2xl bg-orange-600 px-4 py-4 text-base text-white transition-colors hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600 sm:text-lg md:text-lg lg:text-xl xl:text-xl"
            >
              {store.label}
            </a>
          ))}
        </nav>
      </section>
    </main>
  );
}
