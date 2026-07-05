"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SCROLL_TRIGGER_RATIO = 0.6;

export function ScrollSatisfactionPopup({ examId }: { examId: string }) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 1;
      if (ratio >= SCROLL_TRIGGER_RATIO) {
        setVisible(true);
        window.removeEventListener("scroll", handleScroll);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible || dismissed) return null;

  const handleGoToSurvey = () => {
    router.push(`/exam/survey?examId=${examId}`);
  };

  const dismissButton = (
    <button
      type="button"
      onClick={() => setDismissed(true)}
      aria-label="닫기"
      className="-mt-1 -mr-1 shrink-0 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100"
    >
      <X className="size-4" />
    </button>
  );

  return (
    <div className="animate-[hint-pop-in_0.3s_ease-out] fixed right-4 bottom-6 z-50 max-w-[280px] rounded-2xl bg-white p-4 shadow-lg ring-1 ring-zinc-100 sm:right-8 sm:max-w-xs">
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={handleGoToSurvey}
          className="flex flex-1 items-center gap-3 text-left"
        >
          <div className="relative h-12 w-12 shrink-0 animate-[gift-wiggle_2.4s_ease-in-out_infinite]">
            <Image
              src="/mascots/gift.png"
              alt="선물 상자"
              fill
              sizes="48px"
              className="object-contain"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-blue-950">설문 남기고 선물 받기</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              프리미엄형 모의고사 1회를 무료로 드려요
            </p>
          </div>
        </button>
        {dismissButton}
      </div>
    </div>
  );
}
