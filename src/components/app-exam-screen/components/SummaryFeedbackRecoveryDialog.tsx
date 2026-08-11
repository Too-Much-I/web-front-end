"use client";

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
      <DialogContent className="max-w-sm rounded-3xl border-orange-100 bg-white p-6">
        <DialogTitle className="pr-6 text-xl text-blue-950">
          종합 피드백을 아직 만들지 못했어요
        </DialogTitle>
        <DialogDescription className="mt-2 text-sm leading-6 text-zinc-500">
          {supportsRetry
            ? "문제별 피드백은 모두 준비됐어요. 종합 피드백만 다시 생성할까요?"
            : "문제별 피드백은 모두 준비됐어요. 앱을 업데이트하면 종합 피드백을 다시 생성할 수 있어요."}
        </DialogDescription>
        <div className="mt-5 flex flex-col gap-2">
          {supportsRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="min-h-12 rounded-2xl bg-orange-500 px-4 py-3 text-base text-white"
            >
              종합 피드백 다시 생성
            </button>
          )}
          <button
            type="button"
            onClick={onDismiss}
            className="min-h-12 rounded-2xl border border-orange-200 bg-white px-4 py-3 text-base text-orange-700"
          >
            {supportsRetry ? "나중에" : "확인"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
