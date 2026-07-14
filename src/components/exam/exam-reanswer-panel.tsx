"use client";

import { Mic, Square } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  ExamAnswerUploadError,
  uploadExamAnswer,
} from "@/features/exam/api/exam-answer-upload";
import {
  ANSWER_LEVEL_BAR_COUNT,
  useAnswerRecorder,
} from "@/features/exam/use-answer-recorder";
import { useQuestionRetryStatus } from "@/features/exam/use-question-retry-status";

type SubmitStatus = "idle" | "submitting" | "grading" | "error";

/** 문제별 피드백 화면의 "다시 답변하기" 탭 — 녹음 → 제출 → 채점 완료 폴링까지의 흐름. */
export function ExamReanswerPanel({
  examId,
  questionNumber,
  totalRetryCount,
  onUnsavedChange,
}: {
  examId: string;
  questionNumber: number;
  /** 최초 응시를 포함한 지금까지의 전체 시도 횟수 — 다음 재시도의 retryCount(0-base)와 같다. */
  totalRetryCount: number;
  /** 녹음 중이거나 아직 제출하지 않은 녹음본이 있는 동안 true — 탭/회차 이동 시 경고 여부 판단용. */
  onUnsavedChange?: (hasUnsaved: boolean) => void;
}) {
  const router = useRouter();
  const { isRecording, startRecording, stopRecording, levelBarRefs } =
    useAnswerRecorder();
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pollingRetryCount, setPollingRetryCount] = useState<number | null>(null);

  useEffect(() => {
    onUnsavedChange?.(isRecording || (recordedBlob !== null && status !== "grading"));
  }, [isRecording, recordedBlob, status, onUnsavedChange]);

  // 채점이 끝나면 날개 버튼의 조용한 history.replaceState 방식이 아니라, 채점 대기 화면이 결과
  // 페이지로 넘어갈 때와 같은 실제 페이지 전환(router.replace)으로 다음 회차 결과를 보여준다.
  const handleGradingComplete = useCallback(() => {
    if (pollingRetryCount === null) return;
    router.replace(
      `/exam/result/question?examId=${encodeURIComponent(examId)}&questionNumber=${questionNumber}&retryCount=${pollingRetryCount}&justGraded=1`,
    );
  }, [pollingRetryCount, router, examId, questionNumber]);

  const handleGradingFailed = useCallback(() => {
    setPollingRetryCount(null);
    setStatus("error");
    setErrorMessage("채점 결과를 확인하지 못했어요. 결과 페이지를 새로고침해서 확인해 주세요.");
  }, []);

  useQuestionRetryStatus(
    examId,
    questionNumber,
    pollingRetryCount,
    handleGradingComplete,
    handleGradingFailed,
  );

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
    const nextRetryCount = totalRetryCount;
    try {
      await uploadExamAnswer(examId, String(questionNumber), recordedBlob, nextRetryCount);
      setStatus("grading");
      setPollingRetryCount(nextRetryCount);
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
    setPollingRetryCount(null);
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

      {status === "grading" ? (
        <div className="flex flex-col items-center gap-1 rounded-2xl bg-orange-50 p-6 text-center ring-1 ring-orange-100">
          <span className="size-5 animate-spin rounded-full border-2 border-orange-200 border-t-orange-500" />
          <span className="mt-1 text-sm font-semibold text-orange-600 lg:text-base">
            제출했어요! 채점 중이에요...
          </span>
          <span className="text-xs text-orange-500">
            채점이 끝나면 자동으로 결과를 보여드릴게요.
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
