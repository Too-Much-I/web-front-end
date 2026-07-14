"use client";

import { Mic, Square } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import {
  ExamAnswerUploadError,
  uploadExamAnswer,
} from "@/features/exam/api/exam-answer-upload";
import {
  ANSWER_LEVEL_BAR_COUNT,
  useAnswerRecorder,
} from "@/features/exam/use-answer-recorder";

type SubmitStatus = "idle" | "submitting" | "submitted" | "error";

/** 문제별 피드백 화면의 "다시 답변하기" 탭 — 녹음 → 제출까지의 흐름. */
export function ExamReanswerPanel({
  examId,
  questionNumber,
  onUnsavedChange,
}: {
  examId: string;
  questionNumber: number;
  /** 녹음 중이거나 아직 제출하지 않은 녹음본이 있는 동안 true — 탭/회차 이동 시 경고 여부 판단용. */
  onUnsavedChange?: (hasUnsaved: boolean) => void;
}) {
  const { isRecording, startRecording, stopRecording, levelBarRefs } =
    useAnswerRecorder();
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    onUnsavedChange?.(isRecording || (recordedBlob !== null && status !== "submitted"));
  }, [isRecording, recordedBlob, status, onUnsavedChange]);

  async function handleStartRecording() {
    try {
      await startRecording();
    } catch {
      setErrorMessage("마이크를 사용할 수 없어요. 마이크 권한을 확인해 주세요.");
    }
  }

  async function handleStop() {
    const blob = await stopRecording();
    setRecordedBlob(blob);
  }

  async function handleSubmit() {
    if (!recordedBlob) return;
    setStatus("submitting");
    setErrorMessage(null);
    try {
      await uploadExamAnswer(examId, String(questionNumber), recordedBlob);
      setStatus("submitted");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof ExamAnswerUploadError
          ? err.message
          : "제출 중 문제가 생겼어요. 다시 시도해 주세요.",
      );
    }
  }

  function handleRetake() {
    setRecordedBlob(null);
    setStatus("idle");
    setErrorMessage(null);
  }

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-md ring-1 ring-zinc-100 lg:p-8">
      {!isRecording && !recordedBlob && (
        <div className="flex items-center gap-1">
          <Image
            src="/mascots/rabbit_face.png"
            alt=""
            width={36}
            height={36}
            aria-hidden
            className="shrink-0"
          />
          <div className="relative rounded-2xl bg-white px-3 py-2 shadow-md">
            <div
              aria-hidden
              className="absolute top-1/2 -left-1 size-3 -translate-y-1/2 rotate-45 bg-white"
            />
            <span className="relative text-xs font-semibold whitespace-nowrap text-blue-950">
              다시 연습해보세요!
            </span>
          </div>
        </div>
      )}

      {status === "submitted" ? (
        <div className="flex flex-col items-center gap-1 rounded-2xl bg-emerald-50 p-6 text-center ring-1 ring-emerald-100">
          <span className="text-sm font-semibold text-emerald-700 lg:text-base">
            제출했어요! 채점이 끝나면 결과를 확인할 수 있어요.
          </span>
          <span className="text-xs text-emerald-600">
            잠시 후 새로고침해서 확인해 보세요.
          </span>
        </div>
      ) : (
        <>
          {isRecording && (
            <div className="flex h-10 items-end justify-center gap-[3px]">
              {Array.from({ length: ANSWER_LEVEL_BAR_COUNT }).map((_, i) => (
                <span
                  key={i}
                  ref={(el) => {
                    levelBarRefs.current[i] = el;
                  }}
                  className="w-1 rounded-full bg-orange-500"
                  style={{ height: "4px" }}
                />
              ))}
            </div>
          )}

          {!isRecording && recordedBlob && (
            <p className="text-center text-sm text-zinc-500">
              녹음이 끝났어요. 제출하거나 다시 녹음할 수 있어요.
            </p>
          )}

          {errorMessage && (
            <p className="text-center text-sm text-red-500">{errorMessage}</p>
          )}

          <div className="flex justify-center gap-3">
            {!isRecording && !recordedBlob && (
              <button
                type="button"
                onClick={handleStartRecording}
                aria-label="녹음 시작"
                className="flex size-20 items-center justify-center rounded-full bg-orange-500 text-white shadow-md transition-colors hover:bg-orange-600"
              >
                <Mic className="size-8" aria-hidden />
              </button>
            )}

            {isRecording && (
              <button
                type="button"
                onClick={handleStop}
                className="inline-flex items-center gap-2 rounded-full bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-900"
              >
                <Square className="size-4" aria-hidden fill="currentColor" />
                녹음 종료
              </button>
            )}

            {!isRecording && recordedBlob && (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50"
                >
                  다시 녹음
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={status === "submitting"}
                  className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  {status === "submitting" ? "제출 중..." : "제출하기"}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
