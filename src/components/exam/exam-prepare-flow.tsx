"use client";

import { HelpCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { ExamTutorialPanel } from "@/components/exam/exam-tutorial-panel";
import { TargetGradeSelect } from "@/components/exam/target-grade-select";
import { VoiceConsentPanel } from "@/components/exam/voice-consent-panel";
import { MicTestPanel } from "@/components/mic-test-panel";
import { SoundCheckPanel } from "@/components/sound-check-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type PrepareDialogStep = "consent" | "mic" | "sound" | "tutorial" | null;

/** 다이얼로그가 실제로 진행하는 순서. 상단 진행 표시와 "몇 걸음 남았는지" 계산에 쓴다. */
const PREPARE_FLOW_STEPS = ["consent", "mic", "sound", "tutorial"] as const;

/** 동의 → 마이크 → 사운드 → 튜토리얼로 이어지는 흐름의 현재 위치를 점으로 보여준다. */
function PrepareStepProgress({
  current,
}: {
  current: (typeof PREPARE_FLOW_STEPS)[number];
}) {
  const currentIndex = PREPARE_FLOW_STEPS.indexOf(current);
  return (
    <div className="mx-auto mb-1 flex w-fit items-center gap-1.5 rounded-full bg-white/90 px-3 py-2 shadow-sm ring-1 ring-zinc-100 backdrop-blur-sm">
      {PREPARE_FLOW_STEPS.map((step, i) => (
        <span
          key={step}
          className={cn(
            "h-1.5 w-6 rounded-full transition-colors duration-300",
            i <= currentIndex ? "bg-orange-500" : "bg-zinc-200",
          )}
        />
      ))}
    </div>
  );
}

// 튜토리얼을 한 번이라도 보거나 건너뛴 브라우저에서는 다시 자동 노출하지 않는다.
const TUTORIAL_SEEN_KEY = "exam-tutorial-seen";

const CHECKLIST_BASE = [
  "주변 소음이 차단된 조용한 환경에서 응시해 주세요.",
  "정확한 채점을 위해 이어폰 또는 헤드셋 마이크 사용을 권장합니다.",
];
const CHECKLIST_FULL_EXAM_EXTRA =
  "시험 도중 중단해도 그때까지 응시한 문제까지는 채점 결과를 받아볼 수 있어요. 다만 완주하는 게 가장 정확한 결과를 받는 방법이에요.";

export function ExamPrepareFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isTrial = searchParams.get("mode") === "trial";
  const examMode = isTrial ? "trial" : "full";
  const [dialogStep, setDialogStep] = useState<PrepareDialogStep>(null);
  // "시험 진행 방식 미리 보기"로 열린 튜토리얼은 끝나도 세션으로 이동하지 않고 닫히기만 한다.
  const [isTutorialReview, setIsTutorialReview] = useState(false);
  const checklist = isTrial
    ? CHECKLIST_BASE
    : [...CHECKLIST_BASE, CHECKLIST_FULL_EXAM_EXTRA];

  useEffect(() => {
    // router.push/replace always round-trips to the server in the App Router (no
    // "shallow routing" like the Pages Router had), so we write the URL directly
    // via the History API. This keeps Clarity able to tell "목표 설정" vs
    // "마이크 테스트" vs "사운드 체크" drop-offs apart without remounting anything.
    const params = new URLSearchParams(window.location.search);
    params.set("step", dialogStep ?? "grade");
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`,
    );
  }, [dialogStep]);

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr] lg:items-start xl:gap-8">
        <section className="flex w-full flex-col gap-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100 lg:p-8">
          <Badge className="w-fit bg-orange-50 text-orange-600 hover:bg-orange-50">
            {isTrial ? "맛보기" : "notification"}
          </Badge>

          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-zinc-900 lg:text-3xl xl:text-4xl">
              TOEIC® Speaking Mock Exam
            </h1>
            <p className="text-sm text-zinc-500 lg:text-base">
              {isTrial
                ? "Part 1 - 1번 문제만 짧게 풀어보는 맛보기예요"
                : "토익 스피킹 실전 모의고사"}
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-zinc-400 lg:text-sm">
                Total Duration
              </span>
              <p className="text-lg font-semibold text-zinc-900 lg:text-xl xl:text-2xl">
                {isTrial ? "약 1분" : "약 20분"}
              </p>
            </div>
            <div>
              <span className="text-xs text-zinc-400 lg:text-sm">
                Questions
              </span>
              <p className="text-lg font-semibold text-orange-600 lg:text-xl xl:text-2xl">
                {isTrial ? "1문항 (Part 1)" : "11문항"}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex gap-3 rounded-xl bg-sky-50 p-4">
            <HelpCircle className="mt-0.5 size-5 shrink-0 text-sky-500" />
            <div className="flex flex-col gap-2 text-sm text-zinc-600 lg:text-base">
              <p className="font-semibold text-zinc-700">
                시험 전 필수 안내 사항
              </p>
              <ul className="flex flex-col gap-1.5">
                {checklist.map((item) => (
                  <li key={item} className="flex items-start gap-1.5">
                    <span className="text-sky-500">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="flex w-full flex-col gap-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100 lg:p-8">
          <TargetGradeSelect />

          <Button
            size="lg"
            onClick={() => setDialogStep("consent")}
            className="mt-auto h-12 w-full rounded-full bg-orange-500 text-white hover:bg-orange-600 lg:h-14 lg:text-lg"
          >
            다음 (마이크 테스트)
          </Button>

          <button
            type="button"
            onClick={() => {
              setIsTutorialReview(true);
              setDialogStep("tutorial");
            }}
            className="mx-auto -mt-2 text-sm text-zinc-400 underline underline-offset-2 hover:text-orange-600"
          >
            시험 진행 방식 미리 보기
          </button>
        </section>
      </div>

      <Dialog
        open={dialogStep !== null}
        onOpenChange={(open) => setDialogStep(open ? "consent" : null)}
      >
        <DialogContent className="border-none bg-transparent p-0 ring-0 sm:max-w-xl">
          {dialogStep !== null &&
            !(dialogStep === "tutorial" && isTutorialReview) && (
              <PrepareStepProgress current={dialogStep} />
            )}
          <div
            key={dialogStep}
            className="animate-[prepare-step-slide-in_260ms_ease-out] motion-reduce:animate-none"
          >
            {dialogStep === "consent" && (
              <VoiceConsentPanel
                onAgreed={() => {
                  trackEvent("consent_complete", { exam_mode: examMode });
                  setDialogStep("mic");
                }}
              />
            )}
            {dialogStep === "mic" && (
              <MicTestPanel
                onVerified={() => {
                  trackEvent("mic_test_complete", { exam_mode: examMode });
                  setDialogStep("sound");
                }}
              />
            )}
            {dialogStep === "sound" && (
              <SoundCheckPanel
                onCompleted={() => {
                  trackEvent("sound_check_complete", { exam_mode: examMode });
                  if (localStorage.getItem(TUTORIAL_SEEN_KEY)) {
                    router.push(
                      isTrial ? "/exam/session?mode=trial" : "/exam/session",
                    );
                    return;
                  }
                  setIsTutorialReview(false);
                  setDialogStep("tutorial");
                }}
              />
            )}
            {dialogStep === "tutorial" && (
              <ExamTutorialPanel
                examMode={examMode}
                isReview={isTutorialReview}
                finishLabel={
                  isTutorialReview ? "확인했어요" : "모의고사 시작하기"
                }
                onFinish={() => {
                  localStorage.setItem(TUTORIAL_SEEN_KEY, "true");
                  if (isTutorialReview) {
                    setDialogStep(null);
                    return;
                  }
                  router.push(
                    isTrial ? "/exam/session?mode=trial" : "/exam/session",
                  );
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
