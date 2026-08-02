"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { subscribeNewsletter } from "@/features/blog/api/subscribe-newsletter";

/**
 * 뉴스레터 구독 입력 폼(제목/설명 없이 입력 영역만).
 *
 * 지금은 `NewsletterPopup`만 사용하지만, 제목과 여백은 감싸는 쪽이 정하도록
 * 폼만 남겨 두어 다른 자리에도 그대로 끼울 수 있게 한다.
 */
export function NewsletterSubscribeForm({
  onSubscribed,
}: {
  onSubscribed?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { message } = await subscribeNewsletter({ email, consent });
      toast.success(message);
      setEmail("");
      setConsent(false);
      onSubscribed?.();
    } catch {
      toast.error("구독 신청에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      <input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        aria-label="이메일 주소"
        placeholder="example@email.com"
        className="w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-blue-950 placeholder:text-zinc-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-500/12 focus:outline-none"
      />

      <label className="flex items-start gap-2 text-xs text-zinc-500">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-orange-500"
        />
        <span>
          개인정보 수집 및 이메일 수신에 동의합니다.{" "}
          <Link
            href="/privacy"
            className="text-orange-600 underline underline-offset-2"
          >
            개인정보처리방침
          </Link>
        </span>
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-0.5 w-full rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
      >
        {isSubmitting ? "신청 중…" : "구독하기"}
      </button>
    </form>
  );
}
