import Image from "next/image";

import type { ExamQuestionInfo } from "@/types/exam";

/** 문제별 피드백 화면에서 문제 원문을 파트별 구성 요소(지문 소개/읽기 지문/사진/표/질문)에 맞춰 보여준다. */
export function ExamQuestionPrompt({
  questionInfo,
}: {
  questionInfo: ExamQuestionInfo;
}) {
  return (
    <div className="mt-6 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-md ring-1 ring-zinc-100 lg:p-8">
      <span className="text-sm font-bold text-blue-950 lg:text-base">문제</span>

      {questionInfo.partNumber === 3 && questionInfo.partIntroText && (
        <div className="rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-100 lg:p-5">
          <p className="text-xs font-bold text-sky-700 lg:text-sm">지문 소개</p>
          <p className="mt-1.5 text-sm leading-relaxed text-sky-900 lg:text-base">
            {questionInfo.partIntroText}
          </p>
        </div>
      )}

      {questionInfo.partNumber === 1 && questionInfo.referenceText && (
        <div>
          <p className="text-xs font-bold text-slate-600 lg:text-sm">
            읽었던 지문
          </p>
          <div className="relative mt-2 overflow-hidden rounded-2xl bg-[#f4f7fb] ring-1 ring-slate-200">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(71,85,105,0.12) 27px, rgba(71,85,105,0.12) 28px), repeating-linear-gradient(to right, transparent, transparent 27px, rgba(71,85,105,0.12) 27px, rgba(71,85,105,0.12) 28px)",
              }}
            />
            <p className="relative p-4 text-base leading-7 whitespace-pre-line text-slate-700 sm:text-lg lg:p-5 lg:text-xl">
              {questionInfo.referenceText}
            </p>
          </div>
        </div>
      )}

      {questionInfo.imageUrl && (
        <div className="relative aspect-[4/3] w-full max-w-md shrink-0 self-center overflow-hidden rounded-2xl ring-1 ring-zinc-200">
          <Image
            src={questionInfo.imageUrl}
            alt="문제 이미지"
            fill
            sizes="(min-width: 1024px) 448px, 100vw"
            className="object-cover"
          />
        </div>
      )}

      {questionInfo.tableContext && (
        <div className="w-full shrink-0 rounded-2xl border border-zinc-200">
          <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3">
            <p className="font-semibold text-blue-950 lg:text-lg">
              {questionInfo.tableContext.title}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500 lg:text-sm">
              {questionInfo.tableContext.location} · {questionInfo.tableContext.date}{" "}
              · Fee: {questionInfo.tableContext.fee}
            </p>
          </div>
          <table className="w-full text-xs lg:text-sm">
            <tbody>
              {questionInfo.tableContext.items.map((item) => (
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

      {questionInfo.text && (
        <p className="text-sm leading-relaxed font-medium text-blue-950 lg:text-base">
          {questionInfo.text}
        </p>
      )}
    </div>
  );
}
