"use client";

import { Mic, Square } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import {
  ANSWER_LEVEL_BAR_COUNT,
  useAnswerRecorder,
} from "@/features/exam/use-answer-recorder";
import type { ReanswerSubmissionStatus } from "@/features/exam/use-reanswer-submission";

/**
 * 문제별 피드백 화면의 "다시 답변하기" 탭 — 녹음 UI만 담당한다. 제출 이후(업로드~채점 폴링)
 * 상태는 useReanswerSubmission이 ExamQuestionFeedbackScreen 레벨에서 들고 있고, 이 컴포넌트는
 * 그 상태를 props로 받아 그리기만 하는 controlled 뷰다 — 탭을 벗어나 이 컴포넌트가 언마운트돼도
 * 제출 진행 상태 자체는 사라지지 않는다.
 */
export function ExamReanswerPanel({
  status,
  errorMessage,
  onSubmit,
  onReset,
  onUnsavedChange,
}: {
  status: ReanswerSubmissionStatus;
  errorMessage: string | null;
  onSubmit: (blob: Blob) => void;
  /** "다시 녹음" 클릭 시 상위의 제출 상태(특히 이전 실패의 에러 메시지)를 초기화한다. */
  onReset: () => void;
  /** 녹음 중이거나 아직 제출하지 않은 녹음본이 있는 동안 true — 탭/회차 이동 시 경고 여부 판단용. */
  onUnsavedChange?: (hasUnsaved: boolean) => void;
}) {
  const { isRecording, startRecording, stopRecording, levelBarRefs } =
    useAnswerRecorder();
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    onUnsavedChange?.(
      isRecording ||
        (recordedBlob !== null && status !== "submitting" && status !== "grading"),
    );
  }, [isRecording, recordedBlob, status, onUnsavedChange]);

  async function handleStartRecording() {
    try {
      await startRecording();
    } catch {
      setMicErrorMessage("마이크를 사용할 수 없어요. 마이크 권한을 확인해 주세요.");
    }
  }

  async function handleStop() {
    const blob = await stopRecording();
    setRecordedBlob(blob);
  }

  function handleSubmit() {
    if (!recordedBlob) return;
    onSubmit(recordedBlob);
  }

  function handleRetake() {
    setRecordedBlob(null);
    setMicErrorMessage(null);
    onReset();
  }

  if (status === "submitting" || status === "grading") {
    return (
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-md ring-1 ring-zinc-100 lg:p-8">
        <div className="flex flex-col items-center gap-1 p-4 text-center sm:p-6">
          {/* 영상 배경이 순수 흰색이라 카드 흰 배경과 경계 없이 이어진다. poster는 영상
              첫 프레임과 동일한 스냅샷 — 영상 로딩이 끝날 때까지 빈 사각형 대신 보여준다. */}
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/video/running_rabbit_poster.jpg"
            aria-hidden
            className="w-full max-w-[180px] sm:max-w-[210px] md:max-w-[240px] lg:max-w-[270px] xl:max-w-[300px]"
          >
            <source src="/video/running_rabbit.webm" type="video/webm" />
            <source src="/video/running_rabbit.mp4" type="video/mp4" />
          </video>
          <span className="font-jua mt-1 text-base text-orange-600 lg:text-lg">
            {status === "submitting" ? "제출하는 중이에요..." : "제출했어요! 채점 중이에요..."}
          </span>
          {status === "grading" && (
            <span className="font-jua text-sm text-orange-500">
              채점이 끝나면 자동으로 결과를 보여드릴게요.
            </span>
          )}
        </div>
      </div>
    );
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

      {(micErrorMessage || (status === "error" && errorMessage)) && (
        <p className="text-center text-sm text-red-500">
          {micErrorMessage ?? errorMessage}
        </p>
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
              className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
            >
              제출하기
            </button>
          </>
        )}
      </div>
    </div>
  );
}
