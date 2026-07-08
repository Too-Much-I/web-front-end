import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ExamPrepareFlow } from "@/components/exam/exam-prepare-flow";

export const metadata: Metadata = {
  title: "시험 준비 - 토선생",
  description: "토익 스피킹 모의고사를 시작하기 전 준비 화면",
};

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

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10">
        <ExamPrepareFlow />
      </main>

      <footer className="border-t border-orange-200/60 px-6 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 text-sm text-zinc-500 sm:flex-row">
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
