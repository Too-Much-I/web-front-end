import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function ExamLeaveConfirmPopup({
  onStay,
  onLeave,
}: {
  onStay: () => void;
  onLeave: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const stayButtonRef = useRef<HTMLButtonElement>(null);

  // 열리자마자 팝업 내부(계속 보기 버튼)로 초기 포커스를 옮긴다.
  useEffect(() => {
    stayButtonRef.current?.focus();
  }, []);

  // Escape로 닫고, Tab/Shift+Tab이 배경 콘텐츠로 새어나가지 않도록 포커스를 모달 내부에 가둔다.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onStay();
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onStay]);

  return (
    <div
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-blue-950/40 p-4 duration-150"
      onClick={onStay}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exam-leave-confirm-title"
        aria-describedby="exam-leave-confirm-description"
        onClick={(e) => e.stopPropagation()}
        className="animate-in zoom-in-95 fade-in relative flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl bg-white p-6 text-center shadow-xl ring-1 ring-zinc-100 duration-150"
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
          <h2 id="exam-leave-confirm-title" className="text-lg font-bold text-blue-950">
            메인 페이지로 이동하시겠어요?
          </h2>
          <p id="exam-leave-confirm-description" className="text-sm text-zinc-500">
            이 페이지 주소를 저장해두지 않으면
            <br />
            나중에 이 채점 결과를 다시 볼 수 없어요.
            <br />
            주소창의 URL을 미리 저장해두는 걸 추천해요.
          </p>
        </div>

        <div className="mt-2 flex w-full flex-col gap-2">
          <button
            ref={stayButtonRef}
            type="button"
            onClick={onStay}
            className="h-12 w-full rounded-full bg-orange-500 text-sm font-bold text-white transition-colors hover:bg-orange-600"
          >
            계속 결과 보기
          </button>
          <button
            type="button"
            onClick={onLeave}
            className="h-12 w-full rounded-full border border-blue-950/20 text-sm font-semibold text-blue-950 transition-colors hover:bg-blue-50"
          >
            메인으로 이동
          </button>
        </div>
      </div>
    </div>
  );
}
