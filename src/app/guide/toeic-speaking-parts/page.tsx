import type { Metadata } from "next";
import Image from "next/image";

import { GuidePageLayout } from "@/components/guide/guide-page-layout";
import {
  PART_GUIDE_ENTRIES,
  TOTAL_DURATION_LABEL,
  TOTAL_QUESTION_COUNT,
} from "@/features/guide/part-guide-content";
import { DEFAULT_OG_IMAGE } from "@/lib/site-config";

const TITLE = "토익 스피킹 파트별 유형 총정리";
const DESCRIPTION =
  "토익 스피킹은 5개 파트 총 11문항, 약 20분 동안 진행돼요. 파트별 문제 유형과 준비·답변 시간, 실제 시험 안내문까지 한 번에 정리했습니다.";

export const metadata: Metadata = {
  title: `${TITLE} | 토선생`,
  description: DESCRIPTION,
  alternates: {
    canonical: "/guide/toeic-speaking-parts",
  },
  openGraph: {
    title: `${TITLE} | 토선생`,
    description: DESCRIPTION,
    url: "/guide/toeic-speaking-parts",
    siteName: "토선생",
    locale: "ko_KR",
    type: "article",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | 토선생`,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function ToeicSpeakingPartsGuidePage() {
  return (
    <GuidePageLayout>
      <section className="flex flex-col items-center gap-4 text-center">
        <Image
          src="/mascots/rabbit_teacher.png"
          alt="토선생 캐릭터"
          width={128}
          height={128}
          className="size-24 object-contain sm:size-28 lg:size-32"
        />
        <p className="text-sm font-semibold tracking-wide text-orange-600 sm:text-base lg:text-lg">
          토익 스피킹 가이드
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-blue-950 sm:text-3xl lg:text-4xl xl:text-5xl">
          {TITLE}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base lg:max-w-3xl lg:text-lg">
          토익 스피킹은 5개 파트, 총 {TOTAL_QUESTION_COUNT}문항으로 구성되고
          시험 시간은 {TOTAL_DURATION_LABEL}이에요. 파트마다 준비 시간과 답변
          시간이 다르기 때문에, 유형을 미리 알고 들어가는 것만으로도 체감
          난이도가 크게 달라집니다.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-blue-950 sm:text-2xl lg:text-3xl">
          한눈에 보기
        </h2>
        <div className="overflow-x-auto rounded-3xl bg-white shadow-sm">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm sm:text-base">
            <thead>
              <tr className="border-b border-orange-100 text-zinc-500">
                <th scope="col" className="px-4 py-3 font-semibold sm:px-6">
                  파트
                </th>
                <th scope="col" className="px-4 py-3 font-semibold sm:px-6">
                  문항
                </th>
                <th scope="col" className="px-4 py-3 font-semibold sm:px-6">
                  유형
                </th>
                <th scope="col" className="px-4 py-3 font-semibold sm:px-6">
                  준비 시간
                </th>
                <th scope="col" className="px-4 py-3 font-semibold sm:px-6">
                  답변 시간
                </th>
              </tr>
            </thead>
            <tbody>
              {PART_GUIDE_ENTRIES.map((entry) => (
                <tr
                  key={entry.partNumber}
                  className="border-b border-orange-50 last:border-b-0"
                >
                  <th
                    scope="row"
                    className="px-4 py-3 font-bold whitespace-nowrap text-orange-500 sm:px-6"
                  >
                    Part {entry.partNumber}
                  </th>
                  <td className="px-4 py-3 whitespace-nowrap text-zinc-500 sm:px-6">
                    {entry.questionRange}
                  </td>
                  <td className="px-4 py-3 font-medium text-blue-950 sm:px-6">
                    {entry.typeNameKo}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 sm:px-6">
                    {entry.prepTimeLabel}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 sm:px-6">
                    {entry.answerTimeLabel}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-4 sm:gap-6">
        <h2 className="text-xl font-bold text-blue-950 sm:text-2xl lg:text-3xl">
          파트별 자세히 보기
        </h2>

        {PART_GUIDE_ENTRIES.map((entry) => (
          <article
            key={entry.partNumber}
            className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white sm:size-10 sm:text-base">
                {entry.partNumber}
              </span>
              <div className="flex flex-col">
                <h3 className="text-lg font-bold text-blue-950 sm:text-xl lg:text-2xl">
                  {entry.typeNameKo}
                </h3>
                <p className="text-xs text-zinc-400 sm:text-sm">
                  {entry.typeNameEn}
                </p>
              </div>
            </div>

            <ul className="flex flex-wrap gap-2 text-xs sm:text-sm">
              <li className="rounded-full bg-orange-50 px-3 py-1 font-medium text-orange-600">
                {entry.questionRange}
              </li>
              <li className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-600">
                준비 {entry.prepTimeLabel}
              </li>
              <li className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-600">
                답변 {entry.answerTimeLabel}
              </li>
            </ul>

            <p className="text-sm leading-relaxed text-zinc-600 sm:text-base">
              {entry.summary}
            </p>

            <p className="rounded-2xl bg-orange-50/70 px-4 py-3 text-sm leading-relaxed text-blue-950 sm:text-base">
              <span className="font-semibold">공략 포인트 </span>
              {entry.tip}
            </p>

            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-zinc-400 sm:text-sm">
                실제 시험 안내문
              </p>
              <blockquote className="flex flex-col gap-1 border-l-2 border-orange-200 pl-4 text-xs leading-relaxed text-zinc-500 sm:text-sm">
                {entry.directionsLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </blockquote>
            </div>
          </article>
        ))}
      </section>
    </GuidePageLayout>
  );
}
