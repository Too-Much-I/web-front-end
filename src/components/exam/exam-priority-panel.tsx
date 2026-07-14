import Image from "next/image";

import type { ExamCorrectionItem } from "@/types/exam";

const SEVERITY_ORDER: ExamCorrectionItem["severity"][] = ["high", "medium", "low"];

/** 심각도는 색을 늘리지 않고 주황의 진한 정도로만 구분한다. */
const SEVERITY_META: Record<
  ExamCorrectionItem["severity"],
  { label: string; dotClassName: string; chipClassName: string }
> = {
  high: {
    label: "심각",
    dotClassName: "bg-orange-600",
    chipClassName: "bg-orange-600 text-white",
  },
  medium: {
    label: "보통",
    dotClassName: "bg-orange-400",
    chipClassName: "bg-orange-100 text-orange-800",
  },
  low: {
    label: "경미",
    dotClassName: "bg-orange-200",
    chipClassName: "bg-orange-50 text-orange-600",
  },
};

/**
 * Part 1을 제외한 파트에서 칠판 아래에 배치하는 요약 패널.
 * correction_items의 severity 분포와 next_strategy를 스크립트를 읽기 전에 먼저 보여준다.
 */
export function ExamPriorityPanel({
  correctionItems,
  nextStrategy,
}: {
  correctionItems: ExamCorrectionItem[];
  nextStrategy: string | null;
}) {
  const counts = correctionItems.reduce(
    (acc, item) => {
      acc[item.severity] += 1;
      return acc;
    },
    { high: 0, medium: 0, low: 0 } as Record<ExamCorrectionItem["severity"], number>,
  );
  const hasIssues = correctionItems.length > 0;

  return (
    <div className="mt-6 flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-md ring-1 ring-zinc-100">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-bold text-blue-950">
          {hasIssues ? "수정이 필요해요" : "고칠 부분이 없어요"}
        </span>
        {hasIssues && (
          <div className="flex flex-wrap gap-1.5">
            {SEVERITY_ORDER.filter((sev) => counts[sev] > 0).map((sev) => (
              <span
                key={sev}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${SEVERITY_META[sev].chipClassName}`}
              >
                <span className={`size-1.5 rounded-full ${SEVERITY_META[sev].dotClassName}`} />
                {SEVERITY_META[sev].label} {counts[sev]}
              </span>
            ))}
          </div>
        )}
      </div>

      {nextStrategy && (
        <div className="flex items-end gap-3">
          <div className="relative h-20 w-20 shrink-0 sm:h-24 sm:w-24">
            <Image
              src="/mascots/rabbit_teacher.png"
              alt="토선생 캐릭터"
              fill
              sizes="96px"
              className="object-contain drop-shadow-md"
            />
          </div>
          <div className="relative flex-1 rounded-2xl bg-orange-50 p-4 ring-1 ring-orange-100">
            <div className="absolute bottom-3 -left-2.5 h-3 w-2.5 bg-orange-50 [clip-path:polygon(100%_0%,100%_100%,0%_100%)]" />
            <span className="text-xs font-bold text-orange-600">
              토선생의 한마디
            </span>
            <p className="mt-1 text-sm leading-relaxed text-zinc-700">
              {nextStrategy}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
