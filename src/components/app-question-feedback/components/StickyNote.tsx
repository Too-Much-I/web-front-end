import type { ReactNode } from "react";

import { feedbackColors } from "@/components/app-exam-screen/theme";

/**
 * 답안을 얹는 포스트잇 프레임. 표현만 담당하고 내용은 children으로 받는다.
 *
 * 주변 카드들이 rounded-3xl인 것과 달리 모서리를 거의 각지게 둔다 —
 * 라운드가 커지면 종이가 아니라 그냥 카드로 읽혀 포스트잇 느낌이 사라진다.
 * 색은 새로 만들지 않고 기존 cardTint를 바탕으로 위쪽만 밝게 해 종이 두께감만 준다.
 */
export function StickyNote({ children }: { children: ReactNode }) {
  return (
    <div className="relative rotate-[-0.6deg] motion-reduce:rotate-0">
      {/* 종이 아랫단이 바닥에서 살짝 들린 것처럼 보이게 하는 말림 그림자. */}
      <span
        aria-hidden
        className="absolute inset-x-[6%] bottom-0.5 h-3 rounded-[50%]"
        style={{ boxShadow: "0 6px 12px rgb(167 107 61 / 26%)" }}
      />
      <div
        className="relative rounded-sm px-5 py-4"
        style={{
          backgroundImage: `linear-gradient(180deg, #FFFDF7 0%, ${feedbackColors.cardTint} 24%)`,
          boxShadow:
            "0 1px 2px rgb(0 0 0 / 10%), 0 10px 18px rgb(167 107 61 / 14%)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
