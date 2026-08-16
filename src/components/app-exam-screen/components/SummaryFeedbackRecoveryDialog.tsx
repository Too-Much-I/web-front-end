"use client";

import Image from "next/image";

import { summaryFeedbackRecoveryCopy } from "@/components/app-exam-screen/copy";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export function SummaryFeedbackRecoveryDialog({
  open,
  supportsRetry,
  onRetry,
  onDismiss,
}: {
  open: boolean;
  supportsRetry: boolean;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onDismiss();
      }}
    >
      <DialogContent className="w-[calc(100%-3rem)] max-w-xs border-none bg-transparent p-0 text-center ring-0 sm:max-w-xs">
        <section className="flex flex-col items-center gap-4 rounded-2xl bg-white p-5 shadow-xl ring-1 ring-zinc-100">
          <Image
            src="/mascots/scoring.png"
            alt="피드백을 작성하는 고양이 캐릭터"
            width={80}
            height={80}
            className="size-20 object-contain"
            priority
          />

          <div className="flex flex-col gap-1.5">
            <DialogTitle className="px-4 text-lg leading-6 font-bold text-blue-950">
              종합 피드백을 아직 만들지 못했어요
            </DialogTitle>
            <DialogDescription className="text-sm leading-5 text-zinc-500">
              {supportsRetry
                ? "문제별 피드백은 모두 준비됐어요. 종합 피드백만 다시 생성할까요?"
                : `문제별 피드백은 모두 준비됐어요. ${summaryFeedbackRecoveryCopy.retryUnsupported}`}
            </DialogDescription>
          </div>

          <div className="mt-1 flex w-full flex-col gap-2">
            {supportsRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="min-h-11 w-full rounded-full bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-600"
              >
                종합 피드백 다시 생성
              </button>
            )}
            <button
              type="button"
              onClick={onDismiss}
              className="min-h-11 w-full rounded-full border border-blue-950/20 bg-white px-4 py-2.5 text-sm font-semibold text-blue-950 transition-colors hover:bg-blue-50"
            >
              {supportsRetry ? "나중에" : "확인"}
            </button>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}
