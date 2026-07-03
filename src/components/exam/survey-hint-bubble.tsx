"use client";

import { X } from "lucide-react";
import Image from "next/image";

export function SurveyHintBubble({ onDismiss }: { onDismiss: () => void }) {
  const handleClick = () => {
    document.getElementById("exam-feedback-survey")?.scrollIntoView({ behavior: "smooth" });
    onDismiss();
  };

  return (
    <div className="animate-[hint-pop-in_0.3s_ease-out] fixed right-4 bottom-6 z-50 flex max-w-[280px] items-center gap-3 rounded-2xl bg-white p-3 pr-2 shadow-lg ring-1 ring-zinc-100 sm:right-8 sm:max-w-xs">
      <button
        type="button"
        onClick={handleClick}
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
          <p className="text-sm font-bold text-blue-950">설문 참여하고 선물 받기</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            프리미엄형 모의고사 1회를 무료로 드려요
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="닫기"
        className="shrink-0 self-start rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
