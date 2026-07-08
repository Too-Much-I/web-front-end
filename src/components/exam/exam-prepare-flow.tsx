"use client";

import { HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { TargetGradeSelect } from "@/components/exam/target-grade-select";
import { MicTestPanel } from "@/components/mic-test-panel";
import { SoundCheckPanel } from "@/components/sound-check-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

type PrepareDialogStep = "mic" | "sound" | null;

const CHECKLIST = [
  "주변 소음이 차단된 조용한 환경에서 응시해 주세요.",
  "정확한 채점을 위해 이어폰 또는 헤드셋 마이크 사용을 권장합니다.",
  "시험 도중 중단하거나 일시 정지할 수 없으니 충분한 시간을 확보해 주세요.",
];

export function ExamPrepareFlow() {
  const router = useRouter();
  const [dialogStep, setDialogStep] = useState<PrepareDialogStep>(null);

  useEffect(() => {
    // router.push/replace always round-trips to the server in the App Router (no
    // "shallow routing" like the Pages Router had), so we write the URL directly
    // via the History API. This keeps Clarity able to tell "목표 설정" vs
    // "마이크 테스트" vs "사운드 체크" drop-offs apart without remounting anything.
    const params = new URLSearchParams(window.location.search);
    params.set("step", dialogStep ?? "grade");
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }, [dialogStep]);

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr] lg:items-start">
        <section className="flex w-full flex-col gap-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
          <Badge className="w-fit bg-orange-50 text-orange-600 hover:bg-orange-50">
            notification 
          </Badge>

          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-zinc-900">
              TOEIC® Speaking Mock Exam
            </h1>
            <p className="text-sm text-zinc-500">토익 스피킹 실전 모의고사</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-zinc-400">Total Duration</span>
              <p className="text-lg font-semibold text-zinc-900">약 20분</p>
            </div>
            <div>
              <span className="text-xs text-zinc-400">Questions</span>
              <p className="text-lg font-semibold text-orange-600">11문항</p>
            </div>
          </div>

          <Separator />

          <div className="flex gap-3 rounded-xl bg-sky-50 p-4">
            <HelpCircle className="mt-0.5 size-5 shrink-0 text-sky-500" />
            <div className="flex flex-col gap-2 text-sm text-zinc-600">
              <p className="font-semibold text-zinc-700">
                시험 전 필수 안내 사항
              </p>
              <ul className="flex flex-col gap-1.5">
                {CHECKLIST.map((item) => (
                  <li key={item} className="flex items-start gap-1.5">
                    <span className="text-sky-500">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="flex w-full flex-col gap-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
          <TargetGradeSelect />

          <Button
            size="lg"
            onClick={() => setDialogStep("mic")}
            className="mt-auto h-12 w-full rounded-full bg-orange-500 text-white hover:bg-orange-600"
          >
            다음 (마이크 테스트)
          </Button>
        </section>
      </div>

      <Dialog
        open={dialogStep !== null}
        onOpenChange={(open) => setDialogStep(open ? "mic" : null)}
      >
        <DialogContent className="max-w-none border-none bg-transparent p-0 ring-0 sm:max-w-xl">
          {dialogStep === "mic" && (
            <MicTestPanel onVerified={() => setDialogStep("sound")} />
          )}
          {dialogStep === "sound" && (
            <SoundCheckPanel onCompleted={() => router.push("/exam/session")} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
