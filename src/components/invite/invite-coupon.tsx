"use client";

import { useRef, useState } from "react";

import { copyReferralCode } from "@/features/invite/copy-referral-code";
import { trackEvent } from "@/lib/analytics";

type CopyState = "idle" | "copied" | "failed";

/** 추천 코드 쿠폰. 복사에 실패하면 코드를 선택해 두고 길게 눌러 복사하도록 안내한다. */
export function InviteCoupon({
  code,
  isDesktop,
  className,
}: {
  code: string;
  isDesktop: boolean;
  className?: string;
}) {
  const codeRef = useRef<HTMLElement>(null);
  const [state, setState] = useState<CopyState>("idle");

  async function handleCopy() {
    const copied = await copyReferralCode(code);
    if (copied) {
      setState("copied");
      trackEvent("invite_code_copy", { copy_trigger: "copy_button" });
      return;
    }
    const node = codeRef.current;
    if (node) window.getSelection()?.selectAllChildren(node);
    setState("failed");
  }

  const hint =
    state === "failed"
      ? "코드를 길게 눌러 복사해 주세요"
      : isDesktop
        ? "휴대폰으로 앱을 받은 뒤, 가입할 때 이 코드를 입력해 주세요"
        : "가입할 때 이 코드를 붙여넣으면 둘 다 응시권을 받아요";

  return (
    <div className={className}>
      <div className="ticket">
        <div className="ticket-main">
          <small>친구의 추천 코드</small>
          <strong ref={codeRef}>{code}</strong>
        </div>
        <div className="ticket-stub">
          <button
            type="button"
            className={state === "copied" ? "copy done" : "copy"}
            onClick={handleCopy}
          >
            {state === "copied" ? "복사됨" : "복사"}
          </button>
        </div>
      </div>
      <p className="hint" aria-live="polite">
        {hint}
      </p>
    </div>
  );
}
