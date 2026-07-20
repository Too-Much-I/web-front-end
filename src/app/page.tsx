import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ExamStartButton } from "@/components/exam/exam-start-button";
import { FaqSection } from "@/components/faq-section";
import { HeroVideo } from "@/components/hero-video";
import { PhoneDemo } from "@/components/phone-demo";
import { ScrollToSectionLink } from "@/components/scroll-to-section-link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-orange-50/40">
      <header className="sticky top-0 z-50 flex items-center justify-between bg-orange-50 px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2">
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
        </div>
        <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-600 sm:flex lg:gap-10 lg:text-base">
          <ScrollToSectionLink
            targetId="service-intro"
            className="hover:text-orange-500"
          >
            서비스 소개
          </ScrollToSectionLink>
          <ScrollToSectionLink targetId="faq" className="hover:text-orange-500">
            자주 묻는 질문
          </ScrollToSectionLink>
          <Link href="/contact" className="hover:text-orange-500">
            문의하기
          </Link>
        </nav>
        <ExamStartButton className="h-11 rounded-full bg-orange-500 px-6 text-base text-white hover:bg-orange-600 lg:h-12 lg:px-7 lg:text-lg">
          시작하기
        </ExamStartButton>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6 pt-10 pb-12 lg:max-w-7xl lg:flex-row lg:items-center lg:gap-8 xl:gap-10 2xl:max-w-[100rem] 2xl:gap-12">
        <div className="flex flex-col items-center gap-6 text-center lg:w-1/2 lg:items-start lg:text-left">
          <div className="flex flex-col items-center gap-2 lg:items-start">
            <p className="text-sm font-semibold tracking-wide text-orange-600 sm:text-base lg:text-lg">
              토익 스피킹 AI 모의고사
            </p>
            <h1 className="max-w-xl text-3xl leading-tight font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl xl:max-w-3xl 2xl:max-w-4xl 2xl:text-6xl">
              응시료 84,000원 내기 전에 <br className="hidden sm:block" />{" "}
              <span className="text-orange-500">내 등급</span>부터 확인하세요
            </h1>
          </div>
          <p className="max-w-lg text-base leading-relaxed text-zinc-500 sm:text-lg lg:max-w-xl lg:text-xl">
            지금 내 실력은 IH일까, AL까지는 몇 점 남았을까요? 실제 시험처럼
            모의고사를 보고 나면, 토선생 AI가 공식 채점 기준으로 점수와 감점
            이유를 바로 알려드려요.
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-zinc-600 lg:justify-start lg:text-base">
            <li className="flex items-center gap-1.5">
              <span className="text-amber-400">★</span> 감점 포인트 진단
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-amber-400">★</span> 실전과 동일한 유형
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-amber-400">★</span> 즉시 피드백 제공
            </li>
          </ul>
          <div className="group relative mt-6">
            <div
              className="pointer-events-none absolute -top-12 right-0 z-10 flex items-center gap-1.5 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100"
              style={{ animation: "cta-poke 1.1s ease-in-out infinite" }}
            >
              <span className="rounded-full bg-blue-950 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-lg lg:text-sm">
                가입 없이 1분 만에 바로 시작!
              </span>
              <span aria-hidden className="rotate-[35deg] text-2xl lg:text-3xl">
                👇
              </span>
            </div>
            <ExamStartButton className="h-14 rounded-full bg-orange-500 px-9 text-lg text-white hover:bg-orange-600 lg:h-16 lg:px-10 lg:text-xl">
              무료 모의고사 바로 보기
            </ExamStartButton>
          </div>
        </div>

        <div className="w-full overflow-hidden rounded-3xl bg-white shadow-sm lg:w-1/2">
          <HeroVideo />
        </div>
      </main>

      <ScrollToSectionLink
        targetId="service-intro"
        className="mx-auto flex flex-col items-center gap-1 pb-4 text-sm font-medium text-zinc-400 transition-colors hover:text-orange-500 lg:text-base"
      >
        실제 채점 리포트 미리 보기
        <ChevronDown
          className="size-5 animate-bounce motion-reduce:animate-none"
          aria-hidden
        />
      </ScrollToSectionLink>

      <PhoneDemo />

      <FaqSection />

      <footer className="border-t border-orange-200/60 px-6 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 text-sm text-zinc-500 sm:flex-row md:text-base lg:max-w-7xl 2xl:max-w-[100rem]">
          <span>© {new Date().getFullYear()} 토선생. All rights reserved.</span>
          <nav className="flex items-center gap-5">
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
