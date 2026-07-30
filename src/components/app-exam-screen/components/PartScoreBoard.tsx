import { RotateCcw, RotateCw } from "lucide-react";
import Image from "next/image";

import { feedbackMascots } from "@/components/app-exam-screen/assets";
import { PartRadarChart } from "@/components/app-exam-screen/components/PartRadarChart";
import type { RadarAxis } from "@/components/app-exam-screen/feedback-view-model";
import { cardShadow, feedbackColors } from "@/components/app-exam-screen/theme";

type PartScoreBoardProps = {
  axes: readonly RadarAxis[];
  isRevealed: boolean;
  onToggle: () => void;
};

export function PartScoreBoard({
  axes,
  isRevealed,
  onToggle,
}: PartScoreBoardProps) {
  return (
    <section className="mt-10">
      <h2 className="text-2xl text-zinc-900">파트별 점수</h2>
      <p className="mt-2 text-sm text-zinc-500">
        칠판을 돌려 다섯 파트의 점수 균형을 확인해보세요.
      </p>

      <div
        className="mt-5 rounded-3xl p-2"
        style={{ ...cardShadow, backgroundColor: feedbackColors.wood }}
      >
        <button
          type="button"
          aria-label={
            isRevealed
              ? "칠판 점수 그래프 닫고 앞면 보기"
              : "칠판을 눌러 파트별 점수 보기"
          }
          aria-expanded={isRevealed}
          className="w-full rounded-2xl border-2 p-5 text-left"
          style={{
            borderColor: feedbackColors.woodLight,
            backgroundColor: feedbackColors.chalkboard,
          }}
          onClick={onToggle}
        >
          {isRevealed ? (
            <div>
              <div className="mb-2 flex flex-row items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p
                    className="text-xl"
                    style={{ color: feedbackColors.chalk }}
                  >
                    나의 파트 밸런스
                  </p>
                  <p
                    className="mt-1 text-xs"
                    style={{ color: feedbackColors.chalkMuted }}
                  >
                    점수가 고르게 펼쳐질수록 균형 잡힌 답변이에요.
                  </p>
                </div>
                <RotateCcw
                  aria-hidden
                  size={25}
                  color={feedbackColors.radarFill}
                />
              </div>
              <PartRadarChart axes={axes} />
              <p
                className="mt-4 text-center text-sm"
                style={{ color: feedbackColors.chalkMuted }}
              >
                칠판을 다시 누르면 앞면으로 돌아가요
              </p>
            </div>
          ) : (
            <div className="flex min-h-80 flex-col items-center justify-center px-3 py-8">
              <Image
                alt=""
                src={feedbackMascots.board}
                width={256}
                height={256}
                className="h-36 w-32 object-contain"
              />
              <p
                className="mt-4 text-center text-2xl"
                style={{ color: feedbackColors.chalk }}
              >
                칠판을 눌러
                <br />
                파트별 점수 보기
              </p>
              <span
                className="mt-5 flex flex-row items-center gap-2 rounded-full border px-4 py-3"
                style={{ borderColor: feedbackColors.chalkMuted }}
              >
                <RotateCw
                  aria-hidden
                  size={18}
                  color={feedbackColors.radarFill}
                />
                <span
                  className="text-sm"
                  style={{ color: feedbackColors.radarFill }}
                >
                  톡 눌러서 칠판 돌리기
                </span>
              </span>
            </div>
          )}
        </button>
      </div>
    </section>
  );
}
