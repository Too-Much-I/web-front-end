import { Gift } from "lucide-react";

import { cardShadow, feedbackColors } from "@/components/app-exam-screen/theme";

/**
 * 리포트 마지막 단계(파트별 피드백) 아래에 붙는 안내 카드.
 *
 * 리포트를 끝까지 본 직후가 값어치를 가장 크게 체감하는 지점이라 여기에 둔다.
 * 그 자리가 비어 있기도 하다 — 마지막 단계에서는 푸터의 "다음"이 비활성이라
 * 사용자가 더 갈 곳이 없다.
 *
 * 응시 화면으로 보내는 브릿지 메시지가 아직 없어서 CTA 버튼은 달지 않는다.
 * 버튼을 웹에만 먼저 내보내면 핸들러가 없는 구버전 앱에서 눌러도 아무 일도
 * 일어나지 않는다. 메시지가 앱에 배포된 뒤에 버튼을 얹는다.
 *
 * 아이콘은 혜택이라는 것까지만 전달한다 — 한시성은 아이콘이 표현할 수 없어서
 * 부제 문구("오픈 기념으로 지금은")가 전담한다.
 */
export function FreeAccessNotice() {
  return (
    <section
      aria-labelledby="app-feedback-free-access-heading"
      className="mt-4 flex items-start gap-3 rounded-3xl border p-4"
      style={{
        backgroundColor: feedbackColors.cardTint,
        borderColor: feedbackColors.cardLine,
        ...cardShadow,
      }}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-orange-100">
        <Gift aria-hidden size={20} style={{ color: feedbackColors.brand }} />
      </span>
      <div className="min-w-0">
        <h2
          id="app-feedback-free-access-heading"
          className="text-lg leading-snug text-blue-950"
        >
          클릭하시면 문제별로 피드백을 확인할 수 있어요
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          오픈 기념으로 지금은 응시가 무료예요
        </p>
      </div>
    </section>
  );
}
