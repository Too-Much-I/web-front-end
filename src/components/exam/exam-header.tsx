"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ExamLeaveConfirmPopup } from "@/components/exam/exam-leave-confirm-popup";

export function ExamHeader({
  label,
  confirmBeforeLeave = false,
  onStopClick,
}: {
  label: string;
  /** true면 로고/텍스트 클릭 시 바로 이동하지 않고, URL을 저장해두라는 확인 팝업을 먼저 띄운다. */
  confirmBeforeLeave?: boolean;
  /** 전달하면 헤더 우측에 "중단하기" 버튼을 노출한다 (풀 모의고사 응시 중에만 사용). */
  onStopClick?: () => void;
}) {
  const router = useRouter();
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const logoLinkRef = useRef<HTMLAnchorElement>(null);
  const wasLeaveConfirmOpenRef = useRef(false);

  // 팝업이 닫히는 순간(계속 보기/Escape/바깥 클릭)에 포커스를 원래 트리거였던 로고로 되돌린다.
  useEffect(() => {
    if (wasLeaveConfirmOpenRef.current && !showLeaveConfirm) {
      logoLinkRef.current?.focus();
    }
    wasLeaveConfirmOpenRef.current = showLeaveConfirm;
  }, [showLeaveConfirm]);

  return (
    <header className="relative h-16 overflow-hidden bg-orange-500 sm:h-20 lg:h-24">
      <div
        className="absolute inset-0 bg-blue-950"
        style={{ clipPath: "polygon(60% 0%, 100% 0%, 100% 100%, 84% 100%)" }}
      />
      <Link
        ref={logoLinkRef}
        href="/"
        onClick={(e) => {
          if (!confirmBeforeLeave) return;
          e.preventDefault();
          setShowLeaveConfirm(true);
        }}
        className="absolute top-1/2 left-6 flex -translate-y-1/2 items-center gap-1.5 sm:left-10"
      >
        <Image src="/logo.png" alt="" width={28} height={28} className="size-7 lg:size-8" />
        <span className="text-lg font-bold text-white sm:text-xl lg:text-2xl">
          토선생
        </span>
      </Link>
      <span className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-lg font-bold text-white sm:text-xl md:text-2xl lg:text-3xl">
        {label}
      </span>

      {onStopClick && (
        <button
          type="button"
          onClick={onStopClick}
          className="absolute top-1/2 right-6 -translate-y-1/2 rounded-full border border-white/50 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/10 sm:right-10 sm:px-4 sm:py-2 sm:text-sm"
        >
          중단하기
        </button>
      )}

      {showLeaveConfirm && (
        <ExamLeaveConfirmPopup
          onStay={() => setShowLeaveConfirm(false)}
          onLeave={() => router.push("/")}
        />
      )}
    </header>
  );
}
