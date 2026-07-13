"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { ExamDirectionsScreen } from "@/components/exam/exam-directions-screen";
import { ExamExitConfirmPopup } from "@/components/exam/exam-exit-confirm-popup";
import { ExamHeader } from "@/components/exam/exam-header";
import { ExamPartIntroScreen } from "@/components/exam/exam-part-intro-screen";
import { ExamQaNavBar } from "@/components/exam/exam-qa-nav-bar";
import {
  ExamAnswerUploadError,
  uploadExamAnswer,
} from "@/features/exam/api/exam-answer-upload"; // TODO: 서버 배포 후 주석 해제
import { AUDIO_CUES } from "@/features/exam/audio-cues";
import { getExamPartMeta } from "@/features/exam/part-meta";
import { useAnswerRecorder } from "@/features/exam/use-answer-recorder";
import { useAudioCue } from "@/features/exam/use-audio-cue";
import { useAudioSequence } from "@/features/exam/use-audio-sequence";
import { formatSeconds, usePhaseCountdown } from "@/features/exam/use-phase-countdown";
import { cn } from "@/lib/utils";
import type { ExamSession } from "@/types/exam";

type Phase =
  | "directions"
  | "part-intro"
  | "reading-time"
  | "question-audio"
  | "repeat-cue"
  | "question-audio-repeat"
  | "prep-cue"
  | "prep"
  | "speak-cue"
  | "speaking";

const CUE_FALLBACK_MS = 2000;
// Part 4는 Q8 오디오가 나오기 전, 표/일정 정보를 읽을 45초를 별도로 준다.
const PART4_READING_TIME_SEC = 45;

export function ExamSessionScreen({ session }: { session: ExamSession }) {
  const { questions } = session;
  const total = questions.length;
  const router = useRouter();

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("directions");
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const question = questions[index];

  const { startRecording, stopRecording, levelBarRefs } = useAnswerRecorder();

  const handlePhaseComplete = useCallback(() => {
    if (phase === "directions") {
      // Part 4의 첫 문제(Q8) 앞에는 정보를 읽는 45초가 질문 오디오보다 먼저 온다.
      if (question?.partNumber === 4 && question?.isFirstInPart) {
        setPhase("reading-time");
        return;
      }
      // Part 3의 첫 문제(Q5) 앞에는 상황을 설명하는 안내문+안내 음성이 먼저 온다.
      if (question?.isFirstInPart && (question?.partIntroText || question?.guideAudioUrl)) {
        setPhase("part-intro");
        return;
      }
      setPhase(question?.question ? "question-audio" : "prep-cue");
      return;
    }
    if (phase === "part-intro") {
      setPhase(question?.question ? "question-audio" : "prep-cue");
      return;
    }
    if (phase === "reading-time") {
      setPhase(question?.question ? "question-audio" : "prep-cue");
      return;
    }
    if (phase === "question-audio") {
      // Part 4의 마지막 문제(Q10)는 "다시 들려줄게요" 안내 후 질문을 한 번 더 들려준다.
      setPhase(question?.partNumber === 4 && question?.isLastInPart ? "repeat-cue" : "prep-cue");
      return;
    }
    if (phase === "repeat-cue") {
      setPhase("question-audio-repeat");
      return;
    }
    if (phase === "question-audio-repeat") {
      setPhase("prep-cue");
      return;
    }
    if (phase === "prep-cue") {
      setPhase("prep");
      return;
    }
    if (phase === "prep") {
      setPhase("speak-cue");
      return;
    }
    if (phase === "speak-cue") {
      setPhase("speaking");
      return;
    }
    // phase === "speaking"
    if (index + 1 < total) {
      const nextQuestion = questions[index + 1];
      const isNewPart = nextQuestion.partNumber !== questions[index].partNumber;
      setIndex((i) => i + 1);
      if (isNewPart) {
        setPhase("directions");
      } else {
        setPhase(nextQuestion.question ? "question-audio" : "prep-cue");
      }
    } else {
      router.replace(`/exam/grading?examId=${encodeURIComponent(session.examId)}`);
    }
  }, [phase, index, total, questions, question, router, session.examId]);

  // 💡 QA/멘토 검수용: 화면을 자유롭게 넘나들기 위한 이동 함수들. 실제 시험 흐름(handlePhaseComplete)과는
  // 별개로 index/phase를 직접 지정한다. 검수 후 ExamQaNavBar와 함께 제거 예정.
  const jumpToQuestion = useCallback(
    (targetIndex: number, options?: { showDirections?: boolean }) => {
      if (targetIndex < 0 || targetIndex >= total) return;
      const targetQuestion = questions[targetIndex];
      setIndex(targetIndex);
      setPhase(
        options?.showDirections
          ? "directions"
          : targetQuestion.question
            ? "question-audio"
            : "prep-cue",
      );
    },
    [questions, total],
  );

  const jumpToPart = useCallback(
    (partNumber: number) => {
      const targetIndex = questions.findIndex((q) => q.partNumber === partNumber);
      if (targetIndex === -1) return;
      jumpToQuestion(targetIndex, { showDirections: true });
    },
    [questions, jumpToQuestion],
  );

  const availableParts = Array.from(new Set(questions.map((q) => q.partNumber))).sort(
    (a, b) => a - b,
  );

  const isReadingTime = phase === "reading-time";
  const isCounting =
    (phase === "prep" || phase === "speaking" || isReadingTime) && !showExitConfirm;
  const isPrepGroup = phase === "prep-cue" || phase === "prep";
  const isSpeakGroup = phase === "speak-cue" || phase === "speaking";
  const isListeningPhase =
    phase === "question-audio" || phase === "repeat-cue" || phase === "question-audio-repeat";

  const durationSec = question
    ? isReadingTime
      ? PART4_READING_TIME_SEC
      : isPrepGroup
        ? question.prepTimeSec
        : question.speakTimeSec
    : 0;

  const remainingMs = usePhaseCountdown(
    durationSec,
    `${question?.questionNumber}-${phase}`,
    handlePhaseComplete,
    isCounting,
  );

  const questionAudioWordCount = question?.question?.split(/\s+/).length ?? 0;
  const questionAudioFallbackMs = Math.max(2000, (questionAudioWordCount / 2.5) * 1000);

  useAudioCue(
    question?.audioUrl,
    questionAudioFallbackMs,
    handlePhaseComplete,
    `${question?.questionNumber}-question-audio`,
    phase === "question-audio" && !showExitConfirm,
  );

  useAudioCue(
    AUDIO_CUES.nowListenAgain,
    CUE_FALLBACK_MS,
    handlePhaseComplete,
    `${question?.questionNumber}-repeat-cue`,
    phase === "repeat-cue" && !showExitConfirm,
  );

  useAudioCue(
    question?.audioUrl,
    questionAudioFallbackMs,
    handlePhaseComplete,
    `${question?.questionNumber}-question-audio-repeat`,
    phase === "question-audio-repeat" && !showExitConfirm,
  );

  useAudioSequence(
    [AUDIO_CUES.beep, AUDIO_CUES.beginPreparing],
    CUE_FALLBACK_MS,
    handlePhaseComplete,
    `${question?.questionNumber}-prep-cue`,
    phase === "prep-cue" && !showExitConfirm,
  );

  const speakCueClip =
    question?.partNumber === 1
      ? AUDIO_CUES.beginReadingAloud
      : question?.partNumber === 3 || question?.partNumber === 4
        ? AUDIO_CUES.beginResponding
        : AUDIO_CUES.beginSpeaking;

  useAudioSequence(
    [AUDIO_CUES.beep, speakCueClip],
    CUE_FALLBACK_MS,
    handlePhaseComplete,
    `${question?.questionNumber}-speak-cue`,
    phase === "speak-cue" && !showExitConfirm,
  );

  useEffect(() => {
    // 💡 녹음 시작 시점의 questionNumber를 변수에 고정해둡니다.
    const currentQuestion = question; 
    
    if (!currentQuestion || phase !== "speaking") return;

    startRecording().catch((err) => {
      console.error("마이크 접근에 실패했어요", err);
    });

    return () => {
      stopRecording().then((audioBlob) => {
        if (audioBlob.size === 0) return;

        uploadExamAnswer(
          session.examId,
          String(currentQuestion.questionNumber),
          audioBlob
        ).catch((err) => {
          console.error(err);
          if (err instanceof ExamAnswerUploadError && err.stage === "grading") {
            toast.error("답변은 업로드됐지만 채점 요청에 실패했어요. 잠시 후 다시 시도해주세요.");
          } else {
            toast.error("답변 업로드에 실패했어요. 네트워크 환경을 확인해주세요.");
          }
        });
      });
    };
  }, [phase, question, session.examId, startRecording, stopRecording]); // 의존성 배열 유지

  useEffect(() => {
    if (!question) return;
    // router.push/replace always round-trips to the server in the App Router (no
    // "shallow routing" like the Pages Router had), so we write the URL directly
    // via the History API. useSearchParams() still reacts to it, but no request
    // fires and no history entry/remount happens.
    const params = new URLSearchParams(window.location.search);
    params.set("part", String(question.partNumber));
    params.set("question", String(question.questionNumber));
    params.set("phase", phase);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }, [question, phase]);

  useEffect(() => {
    // 시험 도중 브라우저/제스처 "뒤로가기"를 누르면 곧장 준비 화면으로 이동해버려
    // 진행 중이던 시험이 그대로 날아간다. 더미 history 엔트리를 하나 쌓아두고
    // popstate가 발생할 때마다 다시 쌓아서, 실제로 URL이 바뀌는 대신 확인 다이얼로그를
    // 띄울 기회를 확보한다.
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      setShowExitConfirm(true);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleConfirmExit = useCallback(() => {
    router.replace("/exam/prepare");
  }, [router]);

  // 현재 index의 문제는 directions~speaking 전 구간에서 아직 "응시 완료"가 아니다.
  // (녹음/제출은 speaking이 끝나야 이루어지고, 그래야 index가 다음으로 넘어간다.)
  // 그래서 팝업에는 index 이전까지, 즉 실제로 답변을 마친 마지막 문제를 보여준다.
  const lastAnsweredQuestion = index > 0 ? questions[index - 1] : null;

  const exitConfirmDialog = showExitConfirm && (
    <ExamExitConfirmPopup
      lastAnsweredQuestion={
        lastAnsweredQuestion
          ? { questionNumber: lastAnsweredQuestion.questionNumber }
          : null
      }
      totalQuestions={total}
      onStay={() => setShowExitConfirm(false)}
      onExit={handleConfirmExit}
    />
  );

  if (!question) return null;

  const qaNavBar = (
    <ExamQaNavBar
      currentIndex={index}
      total={total}
      currentPartNumber={question.partNumber}
      availableParts={availableParts}
      onPrev={() => jumpToQuestion(index - 1)}
      onNext={() => jumpToQuestion(index + 1)}
      onJumpToPart={jumpToPart}
      onSkipPhase={handlePhaseComplete}
      onGoToGrading={() =>
        router.push(`/exam/grading?examId=${encodeURIComponent(session.examId)}`)
      }
      onGoToResult={() =>
        router.push(`/exam/result?examId=${encodeURIComponent(session.examId)}`)
      }
    />
  );

  if (phase === "directions") {
    return (
      <div className="flex flex-1 flex-col bg-white">
        <ExamHeader label={`Part ${question.partNumber}`} />
        <ExamDirectionsScreen
          partNumber={question.partNumber}
          onComplete={handlePhaseComplete}
          enabled={!showExitConfirm}
        />
        {qaNavBar}
        {exitConfirmDialog}
      </div>
    );
  }

  if (phase === "part-intro") {
    return (
      <div className="flex flex-1 flex-col bg-white">
        <ExamHeader label={`Part ${question.partNumber}`} />
        <ExamPartIntroScreen
          partNumber={question.partNumber}
          text={question.partIntroText ?? ""}
          audioUrl={question.guideAudioUrl}
          resetKey={`part-intro-${question.questionNumber}`}
          onComplete={handlePhaseComplete}
          enabled={!showExitConfirm}
        />
        {qaNavBar}
        {exitConfirmDialog}
      </div>
    );
  }

  const partMeta = getExamPartMeta(question.partNumber);
  const frozenMs = isReadingTime
    ? PART4_READING_TIME_SEC * 1000
    : isPrepGroup
      ? question.prepTimeSec * 1000
      : question.speakTimeSec * 1000;

  return (
    <div className="flex flex-1 flex-col bg-white">
      <ExamHeader label={`Question ${index + 1} of ${total}`} />

      <main className="mx-auto flex w-full min-h-0 max-w-2xl flex-1 flex-col items-center gap-4 overflow-y-auto px-6 pt-8 pb-6 text-center md:max-w-3xl md:gap-6 lg:max-w-4xl lg:gap-8 xl:max-w-5xl">
        <span className="w-fit shrink-0 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 sm:text-sm lg:text-base">
          Part {question.partNumber} · {partMeta.titleEn}
        </span>

        {question.referenceText && (
          <p className="rounded-xl bg-orange-50/60 p-5 text-left text-base leading-relaxed text-blue-950 sm:text-lg md:p-7 md:text-xl lg:p-8 lg:text-2xl">
            {question.referenceText}
          </p>
        )}

        {question.imageUrl && (
          <div className="relative aspect-[4/3] w-full max-w-md shrink-0 overflow-hidden rounded-xl ring-1 ring-zinc-200 md:max-w-lg lg:max-w-xl xl:max-w-2xl">
            <Image
              src={question.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1280px) 672px, (min-width: 1024px) 576px, (min-width: 768px) 512px, (min-width: 640px) 448px, 100vw"
              className="object-cover"
              priority
            />
          </div>
        )}

        {question.tableContext && (
          <div className="w-full shrink-0 rounded-xl border border-zinc-200 text-left">
            <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="font-semibold text-blue-950 sm:text-lg lg:text-xl">
                {question.tableContext.title}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500 sm:text-sm lg:text-base">
                {question.tableContext.location} · {question.tableContext.date} · Fee:{" "}
                {question.tableContext.fee}
              </p>
            </div>
            <table className="w-full text-xs sm:text-sm lg:text-base">
              <tbody>
                {question.tableContext.items.map((item) => (
                  <tr key={item.time} className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-2 font-medium whitespace-nowrap text-zinc-500">
                      {item.time}
                    </td>
                    <td className="px-4 py-2 text-zinc-800">
                      {item.sessionTitle}
                      {item.note && (
                        <span className="block text-zinc-400">({item.note})</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right text-zinc-500">
                      {item.speaker ?? ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {question.question && question.partNumber !== 4 && (
          <p className="text-lg leading-relaxed font-medium text-blue-950 sm:text-xl md:text-2xl lg:text-3xl">
            {question.question}
          </p>
        )}
      </main>

      <footer className="mt-auto flex flex-col items-center gap-3 pb-10">
        {isListeningPhase ? (
          <div className="flex items-center gap-2 text-blue-950">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-blue-600" />
            </span>
            <span className="text-sm font-semibold sm:text-base lg:text-lg">
              {phase === "repeat-cue"
                ? "다시 들려드릴게요"
                : phase === "question-audio-repeat"
                  ? "질문을 다시 듣고 있어요"
                  : "질문을 듣고 있어요"}
            </span>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center">
              <span className="w-56 rounded-t-lg bg-blue-950 py-2 text-center text-sm font-bold tracking-wide text-white sm:w-64 sm:text-base lg:w-72 lg:text-lg">
                {isReadingTime || isPrepGroup ? "PREPARATION TIME" : "RESPONSE TIME"}
              </span>
              <span
                className={cn(
                  "w-56 rounded-b-lg border-2 border-t-0 bg-white py-2.5 text-center font-mono text-2xl font-bold tabular-nums sm:w-64 sm:text-3xl lg:w-72 lg:text-4xl",
                  isSpeakGroup ? "border-red-400 text-red-500" : "border-blue-950 text-blue-950",
                )}
              >
                {formatSeconds(isCounting ? remainingMs : frozenMs)}
              </span>
            </div>

            {phase === "speaking" && (
              <div className="flex items-center gap-2 text-red-500">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-red-500" />
                </span>
                <span className="text-sm font-semibold sm:text-base lg:text-lg">
                  답변을 녹음하고 있어요
                </span>
              </div>
            )}

            {phase === "prep" && (
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm text-zinc-500 sm:text-base lg:text-lg">
                  곧 답변 시간이 시작돼요. 답변을 준비해 주세요.
                </span>
                <button
                  type="button"
                  onClick={handlePhaseComplete}
                  className="rounded-full border border-orange-300 px-4 py-1.5 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-50 lg:px-5 lg:py-2 lg:text-base"
                >
                  준비 완료, 바로 답변 시작하기
                </button>
              </div>
            )}

            {phase === "reading-time" && (
              <span className="text-sm text-zinc-500 sm:text-base lg:text-lg">
                화면의 정보를 확인하고 읽어보세요.
              </span>
            )}

            {phase === "prep-cue" && (
              <span className="text-sm text-zinc-500 sm:text-base lg:text-lg">
                안내 음성을 재생하고 있어요…
              </span>
            )}

            {phase === "speak-cue" && (
              <span className="text-sm text-zinc-500 sm:text-base lg:text-lg">
                곧 답변이 시작돼요…
              </span>
            )}

            {phase === "speaking" && (
              <div className="flex h-8 items-center gap-1 lg:h-10" aria-hidden>
                {Array.from({ length: 24 }, (_, i) => (
                  <span
                    key={i}
                    ref={(el) => {
                      levelBarRefs.current[i] = el;
                    }}
                    className="w-1 rounded-full bg-red-300 transition-[height] duration-75 lg:w-1.5"
                    style={{ height: "4px" }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <p className="px-6 text-center text-xs text-zinc-400 lg:text-sm">
          다음 문제로 자동으로 전환됩니다. 시험 도중 중단하거나 뒤로 갈 수 없어요.
        </p>
      </footer>

      {qaNavBar}
      {exitConfirmDialog}
    </div>
  );
}
