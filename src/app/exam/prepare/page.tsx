import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HelpCircle } from "lucide-react";

import { MicTestPanel } from "@/components/mic-test-panel";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "시험 준비 - 토선생",
  description: "토익 스피킹 모의고사를 시작하기 전 준비 화면",
};

const CHECKLIST = [
  "주변 소음이 차단된 조용한 환경에서 응시해 주세요.",
  "정확한 채점을 위해 이어폰 또는 헤드셋 마이크 사용을 권장합니다.",
  "시험 도중 중단하거나 일시 정지할 수 없으니 충분한 시간을 확보해 주세요.",
];

export default function ExamPreparePage() {
  return (
    <div className="flex flex-1 flex-col bg-orange-50/40">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="토선생"
            width={36}
            height={36}
            className="size-9"
          />
          <span className="text-lg font-bold text-orange-500">토선생</span>
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-10 lg:flex-row lg:items-start">
        <section className="flex w-full flex-col gap-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100 lg:w-1/2">
          <Badge className="w-fit bg-orange-50 text-orange-600 hover:bg-orange-50">
            Official Mock Exam
          </Badge>

          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-zinc-900">
              TOEIC® Speaking Mock Exam
            </h1>
            <p className="text-sm text-zinc-500">토익 스피킹 실전 모의고사</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-zinc-400">Total Duration</span>
              <p className="text-lg font-semibold text-zinc-900">약 20분</p>
            </div>
            <div>
              <span className="text-xs text-zinc-400">Questions</span>
              <p className="text-lg font-semibold text-orange-600">11문항</p>
            </div>
          </div>

          <div className="flex gap-3 rounded-xl bg-sky-50 p-4">
            <HelpCircle className="mt-0.5 size-5 shrink-0 text-sky-500" />
            <div className="flex flex-col gap-2 text-sm text-zinc-600">
              <p className="font-semibold text-zinc-700">
                시험 전 필수 안내 사항
              </p>
              <ul className="flex flex-col gap-1.5">
                {CHECKLIST.map((item) => (
                  <li key={item} className="flex items-start gap-1.5">
                    <span className="text-sky-500">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <MicTestPanel />
      </main>

      <footer className="border-t border-orange-200/60 px-6 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 text-sm text-zinc-500 sm:flex-row">
          <span>
            © {new Date().getFullYear()} 토선생. All rights reserved.
          </span>
          <nav className="flex items-center gap-5">
            <a href="#" className="hover:text-orange-500">
              이용약관
            </a>
            <a href="#" className="hover:text-orange-500">
              개인정보처리방침
            </a>
            <a href="#" className="hover:text-orange-500">
              문의하기
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
