"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { NewsletterSubscribeForm } from "@/components/blog/newsletter-subscribe-form";

const STORAGE_KEY = "blog-newsletter-popup";
/** 글을 어느 정도 읽은 뒤에 말을 걸도록, 스크롤 가능한 높이의 절반을 넘으면 띄운다. */
const SCROLL_TRIGGER_RATIO = 0.5;
/** 닫기만 한 경우 2주 뒤 다시 노출한다. 구독까지 마쳤다면 다시 띄우지 않는다. */
const DISMISS_SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;

/** 저장된 값은 "subscribed"(영구) 또는 닫은 시각의 타임스탬프(2주간)다. */
function isSuppressed() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return false;
  if (stored === "subscribed") return true;

  const dismissedAt = Number(stored);
  return (
    Number.isFinite(dismissedAt) && Date.now() - dismissedAt < DISMISS_SNOOZE_MS
  );
}

/**
 * 블로그를 읽다가 일정 깊이까지 스크롤하면 우측 하단에 떠오르는 뉴스레터 구독 카드.
 *
 * 본문 흐름을 끊지 않도록 모달이 아닌 비모달 카드로 두고, 닫거나 구독을 마치면
 * localStorage에 기록해 다시 귀찮게 하지 않는다.
 */
export function NewsletterPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // localStorage는 서버에 없으므로, SSR/하이드레이션 불일치를 피하기 위해 마운트 후에만 읽는다.
    if (isSuppressed()) return;

    const handleScroll = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      if (ratio >= SCROLL_TRIGGER_RATIO) {
        setVisible(true);
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible]);

  function close() {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setVisible(false);
  }

  function handleSubscribed() {
    window.localStorage.setItem(STORAGE_KEY, "subscribed");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <aside
      aria-label="뉴스레터 구독"
      className="fixed inset-x-4 bottom-4 z-50 animate-[hint-pop-in_0.35s_ease-out] rounded-3xl bg-white p-5 shadow-xl ring-1 ring-orange-100 motion-reduce:animate-none sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[22rem] sm:p-6"
    >
      {/* 카드 위로 빼꼼 올라온 편지 든 토끼 */}
      <div className="pointer-events-none absolute -top-11 right-5 h-20 w-20 animate-[mascot-bob_2.8s_ease-in-out_infinite] motion-reduce:animate-none sm:-top-12 sm:h-24 sm:w-24">
        <Image
          src="/mascots/mail.png"
          alt="편지를 든 토선생 캐릭터"
          fill
          sizes="96px"
          className="object-contain drop-shadow-sm"
        />
      </div>

      <button
        type="button"
        onClick={close}
        aria-label="닫기"
        className="absolute top-3 left-3 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
      >
        <X className="size-4" />
      </button>

      <div className="flex flex-col gap-1 pt-5 pr-20 pb-3 sm:pr-24">
        <p className="text-base font-bold text-blue-950 sm:text-lg">
          새 글이 올라오면 알려드릴까요?
        </p>
        <p className="text-xs leading-relaxed text-zinc-500 sm:text-sm">
          새로운 토익 스피킹 학습 글을 이메일로 보내드려요. 언제든 해지할 수
          있어요.
        </p>
      </div>

      <NewsletterSubscribeForm onSubscribed={handleSubscribed} />
    </aside>
  );
}
