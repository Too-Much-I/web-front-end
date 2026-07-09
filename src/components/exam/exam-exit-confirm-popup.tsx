import Image from "next/image";
import { X } from "lucide-react";

export function ExamExitConfirmPopup({
  lastAnsweredQuestion,
  totalQuestions,
  onStay,
  onExit,
}: {
  lastAnsweredQuestion: { questionNumber: number } | null;
  totalQuestions: number;
  onStay: () => void;
  onExit: () => void;
}) {
  const percentAnswered = lastAnsweredQuestion
    ? Math.round((lastAnsweredQuestion.questionNumber / totalQuestions) * 100)
    : 0;
  return (
    <div
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-blue-950/40 p-4 duration-150"
      onClick={onStay}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-in zoom-in-95 fade-in @container relative flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl bg-white p-6 text-center shadow-xl ring-1 ring-zinc-100 duration-150"
      >
        <button
          type="button"
          onClick={onStay}
          aria-label="닫기"
          className="absolute top-2 right-2 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100"
        >
          <X className="size-4" />
        </button>

        <div className="relative h-28 w-28 shrink-0">
          <Image
            src="/mascots/shocked_rabbit.png"
            alt="놀란 토끼 캐릭터"
            fill
            sizes="112px"
            className="object-contain"
            priority
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-bold text-blue-950">
            {lastAnsweredQuestion ? "시험을 그만두시겠어요?" : "아직 응시한 내용이 없어요"}
          </h2>
          <p className="text-sm text-zinc-500">
            {lastAnsweredQuestion ? (
              <>
                {lastAnsweredQuestion.questionNumber}번 문제까지 응시한 내용이 모두 초기화돼요.
                {percentAnswered > 50 && (
                  <>
                    <br className="@sm:hidden" /> 전체 문제의 {percentAnswered}%를 이미 응시했어요.
                  </>
                )}
                <br />
                준비 화면으로 돌아가면 처음부터 다시 시작해야 해요.
              </>
            ) : (
              "그래도 나가시겠어요?"
            )}
          </p>
        </div>

        <div className="mt-2 flex w-full flex-col gap-2">
          <button
            type="button"
            onClick={onStay}
            className="h-12 w-full rounded-full bg-orange-500 text-sm font-bold text-white transition-colors hover:bg-orange-600"
          >
            계속 시험보기
          </button>
          <button
            type="button"
            onClick={onExit}
            className="h-12 w-full rounded-full border border-blue-950/20 text-sm font-semibold text-blue-950 transition-colors hover:bg-blue-50"
          >
            나가기
          </button>
        </div>
      </div>
    </div>
  );
}
