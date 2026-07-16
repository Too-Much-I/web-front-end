"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const AUTO_DISMISS_MS = 3000;
const CLOSE_ANIMATION_MS = 200;
const SHOWN_STORAGE_KEY_PREFIX = "beta-notice-shown:";

export function BetaNoticePopup({
  examId,
  onClose,
}: {
  examId: string;
  /** 팝업이 닫히기 시작할 때 호출. 이미 본 적이 있어 팝업을 건너뛰는 경우엔 마운트 직후 호출된다. */
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<"hidden" | "open" | "closing">("hidden");

  // 부모가 인라인 함수를 넘겨도 effect가 매 렌더마다 재실행되지 않도록 ref로 최신 콜백만 유지.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // sessionStorage 읽기+쓰기가 비멱등이라, Strict Mode의 effect 이중 실행 시 두 번째
  // 실행이 "이미 봤음"으로 오판해 팝업이 뜬 채로 onClose를 즉시 불러버린다 — ref로 한 번만 판정.
  // (docs/exam-session-duplicate-request-fix.md와 같은 패턴)
  const hasDecidedRef = useRef(false);

  useEffect(() => {
    if (hasDecidedRef.current) return;
    hasDecidedRef.current = true;

    // sessionStorage는 서버에 없으므로 마운트 후에만 읽는다. 문제별 피드백을 다녀와서
    // 리포트가 다시 마운트돼도 재노출되지 않도록 examId별 첫 진입에만 띄운다.
    const shownKey = `${SHOWN_STORAGE_KEY_PREFIX}${examId}`;
    if (sessionStorage.getItem(shownKey)) {
      onCloseRef.current();
      return;
    }
    sessionStorage.setItem(shownKey, "true");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhase("open");
  }, [examId]);

  // 자동 닫힘 타이머는 멱등이라 ref 가드 밖에 둔다 — 위 effect에 함께 두면 Strict Mode에서
  // 첫 실행의 cleanup이 타이머를 지운 뒤 두 번째 실행이 가드에 막혀 타이머 없이 남는다.
  useEffect(() => {
    if (phase !== "open") return;
    const closeTimer = setTimeout(() => setPhase("closing"), AUTO_DISMISS_MS);
    return () => clearTimeout(closeTimer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "closing") return;
    // 페이드아웃이 끝나길 기다리지 않고 닫히기 시작하자마자 알려서, 뒤에 가려져 있던
    // 칠판 애니메이션이 팝업이 사라지는 동안 자연스럽게 이어 시작되게 한다.
    onCloseRef.current();
    const unmountTimer = setTimeout(
      () => setPhase("hidden"),
      CLOSE_ANIMATION_MS,
    );
    return () => clearTimeout(unmountTimer);
  }, [phase]);

  if (phase === "hidden") return null;

  const dismiss = () => setPhase("closing");
  const closing = phase === "closing";

  return (
    <div
      role="dialog"
      aria-label="베타 버전 안내"
      onClick={dismiss}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-blue-950/40 p-4 duration-150 ${
        closing
          ? "animate-out fade-out fill-mode-forwards duration-200"
          : "animate-in fade-in"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl bg-white p-6 text-center shadow-xl ring-1 ring-zinc-100 duration-150 ${
          closing
            ? "animate-out zoom-out-95 fade-out fill-mode-forwards duration-200"
            : "animate-in zoom-in-95 fade-in"
        }`}
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="닫기"
          className="absolute top-2 right-2 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100"
        >
          <X className="size-4" />
        </button>

        <Image
          src="/mascots/beta.png"
          alt="BETA"
          width={112}
          height={112}
          className="drop-shadow-sm"
          priority
        />

        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-bold text-blue-950">
            지금은 베타 버전이에요
          </h2>
          <p className="text-sm leading-relaxed text-zinc-500">
            정식 출시 전까지 채점 엔진을 계속 고도화할 예정이에요.
            <br />
            채점 결과에 일부 불완전할 수 있어요.
          </p>
        </div>
      </div>
    </div>
  );
}
