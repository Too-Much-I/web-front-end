"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ExamDirectionsScreen } from "@/components/exam/exam-directions-screen";
import { ExamHeader } from "@/components/exam/exam-header";
import { uploadExamAnswer } from "@/features/exam/api/exam-answer-upload"; // TODO: 서버 배포 후 주석 해제
import { AUDIO_CUES } from "@/features/exam/audio-cues";
import { getExamPartMeta } from "@/features/exam/part-meta";
import { useAnswerRecorder } from "@/features/exam/use-answer-recorder";
import { useAudioCue } from "@/features/exam/use-audio-cue";
import { useAudioSequence } from "@/features/exam/use-audio-sequence";
import { formatSeconds, usePhaseCountdown } from "@/features/exam/use-phase-countdown";
import { cn } from "@/lib/utils";
import type { ExamSession } from "@/types/exam";

type Phase = "directions" | "question-audio" | "prep-cue" | "prep" | "speak-cue" | "speaking";

const CUE_FALLBACK_MS = 2000;

export function ExamSessionScreen({ session }: { session: ExamSession }) {
  const { questions } = session;
  const total = questions.length;
  const router = useRouter();

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("directions");

  const question = questions[index];

  const { startRecording, stopRecording, levelBarRefs } = useAnswerRecorder();

  const handlePhaseComplete = useCallback(() => {
    if (phase === "directions") {
      setPhase(question?.question ? "question-audio" : "prep-cue");
      return;
    }
    if (phase === "question-audio") {
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

  const isCounting = phase === "prep" || phase === "speaking";
  const isPrepGroup = phase === "prep-cue" || phase === "prep";
  const isSpeakGroup = phase === "speak-cue" || phase === "speaking";

  const durationSec = question ? (isPrepGroup ? question.prepTimeSec : question.speakTimeSec) : 0;

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
    phase === "question-audio",
  );

  useAudioSequence(
    [AUDIO_CUES.beep, AUDIO_CUES.beginPreparing],
    CUE_FALLBACK_MS,
    handlePhaseComplete,
    `${question?.questionNumber}-prep-cue`,
    phase === "prep-cue",
  );

  useAudioSequence(
    [
      AUDIO_CUES.beep,
      question?.partNumber === 1 ? AUDIO_CUES.beginReadingAloud : AUDIO_CUES.beginSpeaking,
    ],
    CUE_FALLBACK_MS,
    handlePhaseComplete,
    `${question?.questionNumber}-speak-cue`,
    phase === "speak-cue",
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
        ).catch(console.error);
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

  if (!question) return null;

  if (phase === "directions") {
    return (
      <div className="flex flex-1 flex-col bg-white">
        <ExamHeader label={`Part ${question.partNumber}`} />
        <ExamDirectionsScreen partNumber={question.partNumber} onComplete={handlePhaseComplete} />
      </div>
    );
  }

  const partMeta = getExamPartMeta(question.partNumber);
  const frozenMs = isPrepGroup ? question.prepTimeSec * 1000 : question.speakTimeSec * 1000;

  return (
    <div className="flex flex-1 flex-col bg-white">
      <ExamHeader label={`Question ${index + 1} of ${total}`} />

      <main className="mx-auto flex w-full min-h-0 max-w-2xl flex-1 flex-col items-center gap-4 overflow-y-auto px-6 pt-8 pb-6 text-center md:max-w-3xl md:gap-6">
        <span className="w-fit shrink-0 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 sm:text-sm">
          Part {question.partNumber} · {partMeta.titleEn}
        </span>

        {question.referenceText && (
          <p className="rounded-xl bg-orange-50/60 p-5 text-left text-base leading-relaxed text-blue-950 sm:text-lg md:p-7 md:text-xl">
            {question.referenceText}
          </p>
        )}

        {question.imageUrl && (
          <div className="relative aspect-[4/3] w-full max-w-md shrink-0 overflow-hidden rounded-xl ring-1 ring-zinc-200 md:max-w-lg">
            <Image
              src={question.imageUrl}
              alt=""
              fill
              sizes="(min-width: 768px) 512px, (min-width: 640px) 448px, 100vw"
              className="object-cover"
              priority
            />
          </div>
        )}

        {question.tableContext && (
          <div className="w-full shrink-0 rounded-xl border border-zinc-200 text-left">
            <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="font-semibold text-blue-950 sm:text-lg">
                {question.tableContext.title}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500 sm:text-sm">
                {question.tableContext.location} · {question.tableContext.date} · Fee:{" "}
                {question.tableContext.fee}
              </p>
            </div>
            <table className="w-full text-xs sm:text-sm">
              <tbody>
                {question.tableContext.items.map((item) => (
                  <tr key={item.time} className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-2 font-medium whitespace-nowrap text-zinc-500">
                      {item.time}
                    </td>
                    <td className="px-4 py-2 text-zinc-800">
                      {item.session_title}
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
          <p className="text-lg leading-relaxed font-medium text-blue-950 sm:text-xl md:text-2xl">
            {question.question}
          </p>
        )}
      </main>

      <footer className="mt-auto flex flex-col items-center gap-3 pb-10">
        {phase === "question-audio" ? (
          <div className="flex items-center gap-2 text-blue-950">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-blue-600" />
            </span>
            <span className="text-sm font-semibold sm:text-base">질문을 듣고 있어요</span>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center">
              <span className="w-56 rounded-t-lg bg-blue-950 py-2 text-center text-sm font-bold tracking-wide text-white sm:w-64 sm:text-base">
                {isPrepGroup ? "PREPARATION TIME" : "RESPONSE TIME"}
              </span>
              <span
                className={cn(
                  "w-56 rounded-b-lg border-2 border-t-0 bg-white py-2.5 text-center font-mono text-2xl font-bold tabular-nums sm:w-64 sm:text-3xl",
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
                <span className="text-sm font-semibold sm:text-base">
                  답변을 녹음하고 있어요
                </span>
              </div>
            )}

            {phase === "prep" && (
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm text-zinc-500 sm:text-base">
                  곧 답변 시간이 시작돼요. 답변을 준비해 주세요.
                </span>
                <button
                  type="button"
                  onClick={handlePhaseComplete}
                  className="rounded-full border border-orange-300 px-4 py-1.5 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-50"
                >
                  준비 완료, 바로 답변 시작하기
                </button>
              </div>
            )}

            {phase === "prep-cue" && (
              <span className="text-sm text-zinc-500 sm:text-base">
                안내 음성을 재생하고 있어요…
              </span>
            )}

            {phase === "speak-cue" && (
              <span className="text-sm text-zinc-500 sm:text-base">곧 답변이 시작돼요…</span>
            )}

            {phase === "speaking" && (
              <div className="flex h-8 items-center gap-1" aria-hidden>
                {Array.from({ length: 24 }, (_, i) => (
                  <span
                    key={i}
                    ref={(el) => {
                      levelBarRefs.current[i] = el;
                    }}
                    className="w-1 rounded-full bg-red-300 transition-[height] duration-75"
                    style={{ height: "4px" }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <p className="px-6 text-center text-xs text-zinc-400">
          다음 문제로 자동으로 전환됩니다. 시험 도중 중단하거나 뒤로 갈 수 없어요.
        </p>
      </footer>
    </div>
  );
}
