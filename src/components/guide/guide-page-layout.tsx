import Image from "next/image";
import Link from "next/link";

import { ExamStartButton } from "@/components/exam/exam-start-button";

const CONTENT_WIDTH = "mx-auto w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl";

export function GuidePageLayout({ children }: { children: React.ReactNode }) {
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
          <span className="text-lg font-bold text-orange-500 lg:text-xl">
            토선생
          </span>
        </Link>
        <ExamStartButton className="h-11 rounded-full bg-orange-500 px-6 text-base text-white hover:bg-orange-600 lg:h-12 lg:px-7 lg:text-lg">
          시작하기
        </ExamStartButton>
      </header>

      <main
        className={`${CONTENT_WIDTH} flex flex-1 flex-col gap-10 px-6 pt-6 pb-20 sm:gap-12 sm:px-10 lg:gap-14`}
      >
        {children}
      </main>

      <footer className="border-t border-orange-200/60 px-6 py-8 sm:px-10">
        <div
          className={`${CONTENT_WIDTH} flex flex-col items-center justify-between gap-4 text-sm text-zinc-500 sm:flex-row md:text-base`}
        >
          <span>© {new Date().getFullYear()} 토선생. All rights reserved.</span>
          <nav className="flex flex-wrap items-center justify-center gap-5">
            <Link
              href="/guide/toeic-speaking-parts"
              className="hover:text-orange-500"
            >
              토익 스피킹 가이드
            </Link>
            <Link href="/terms" className="hover:text-orange-500">
              이용약관
            </Link>
            <Link href="/privacy" className="hover:text-orange-500">
              개인정보처리방침
            </Link>
            <Link href="/contact" className="hover:text-orange-500">
              문의하기
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
