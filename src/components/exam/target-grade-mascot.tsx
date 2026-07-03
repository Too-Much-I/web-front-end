import Image from "next/image";

import type { TargetGradeOption } from "@/features/exam/target-grade";

export function TargetGradeMascot({
  targetGrade,
  scoreGap,
}: {
  targetGrade: TargetGradeOption;
  scoreGap: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative rounded-2xl rounded-br-none bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 sm:px-4 sm:py-2 sm:text-sm">
        {scoreGap > 0
          ? `목표 등급 ${targetGrade.levelLabel}까지 ${scoreGap}점 남았어요`
          : `목표 등급 ${targetGrade.levelLabel}을 달성했어요!`}
      </div>
      <div className="relative h-10 w-10 shrink-0 sm:h-12 sm:w-12">
        <Image
          src="/mascots/rabbit_face.png"
          alt="토끼 얼굴 캐릭터"
          fill
          sizes="48px"
          className="object-contain"
        />
      </div>
    </div>
  );
}
