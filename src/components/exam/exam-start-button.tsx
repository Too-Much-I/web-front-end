"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const EXAM_MODE_OPTIONS = [
  {
    mode: "full",
    title: "전체 모의고사",
    description: "실전과 동일하게 5개 파트, 11문항을 모두 풀어봐요.",
    meta: "약 20분",
    recommended: true,
  },
  {
    mode: "trial",
    title: "맛보기",
    description: "Part 1의 1번 문제만 짧게 풀어보고 피드백을 확인해요.",
    meta: "약 1분",
    recommended: false,
  },
] as const;

export function ExamStartButton({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="lg" className={className} onClick={() => setOpen(true)}>
        {children}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-none border-none bg-transparent p-0 ring-0 sm:max-w-md">
          <section className="flex w-full flex-col gap-5 rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
            <div className="flex flex-col items-center gap-1 text-center">
              <h2 className="text-base font-bold text-blue-950 lg:text-lg">
                어떤 방식으로 응시할까요?
              </h2>
              <p className="text-sm text-zinc-500">
                시간이 부족하다면 맛보기로 짧게 체험해볼 수 있어요.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {EXAM_MODE_OPTIONS.map((option) => (
                <button
                  key={option.mode}
                  type="button"
                  onClick={() => router.push(`/exam/prepare?mode=${option.mode}`)}
                  className="flex flex-col gap-1 rounded-xl border border-zinc-100 p-4 text-left transition-colors hover:border-orange-300 hover:bg-orange-50/60"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-900">
                      {option.title}
                    </span>
                    <span className="text-xs font-semibold text-orange-600">
                      {option.meta}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500">{option.description}</p>
                </button>
              ))}
            </div>
          </section>
        </DialogContent>
      </Dialog>
    </>
  );
}
