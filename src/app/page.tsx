import Image from "next/image";
import Link from "next/link";

import { FaqSection } from "@/components/faq-section";
import { HeroVideo } from "@/components/hero-video";
import { PhoneDemo } from "@/components/phone-demo";
import { ScrollToSectionLink } from "@/components/scroll-to-section-link";
import { Button } from "@/components/ui/button";

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
        <Button
          size="lg"
          className="h-11 rounded-full bg-orange-500 px-6 text-base text-white hover:bg-orange-600 lg:h-12 lg:px-7 lg:text-lg"
          render={<Link href="/exam/prepare" />}
          nativeButton={false}
        >
          시작하기
        </Button>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6 pt-10 pb-20 lg:max-w-7xl lg:flex-row lg:items-center lg:gap-8 xl:gap-10 2xl:max-w-[100rem] 2xl:gap-12">
        <div className="flex flex-col items-center gap-6 text-center lg:w-3/5 lg:items-start lg:text-left">
          <h1 className="max-w-xl text-3xl leading-tight font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl xl:max-w-3xl 2xl:max-w-4xl 2xl:text-6xl">
            토익 스피킹 채점부터 피드백까지, <br className="hidden sm:block" />{" "}
            <span className="text-orange-500">토선생</span>과 함께
          </h1>
          <p className="max-w-lg text-base leading-relaxed text-zinc-500 sm:text-lg lg:max-w-xl lg:text-xl">
            토선생은 실제 토익 스피킹 시험과 동일한 유형의 문제로 모의고사를
            보고, AI가 발음·유창성·문법·어휘를 공식 채점 기준을 사용해 분석해주고 감점된 부분과
            피드백을 알려주는 서비스예요. 매번 학원이나 첨삭을 기다릴 필요
            없이, 원할 때마다 실전처럼 연습하고 바로 확인할 수 있어요.
          </p>
          <ul className="grid grid-cols-1 gap-2 text-left text-sm text-zinc-600 sm:grid-cols-3 sm:gap-4 lg:text-base">
            <li className="flex items-center gap-1.5">
              <span className="text-orange-500">✓</span> 감점 포인트 진단
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-orange-500">✓</span> 실전과 동일한 유형
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-orange-500">✓</span> 즉시 피드백 제공
            </li>
          </ul>
          <Button
            size="lg"
            className="h-14 rounded-full bg-orange-500 px-9 text-lg text-white hover:bg-orange-600 lg:h-16 lg:px-10 lg:text-xl"
            render={<Link href="/exam/prepare" />}
            nativeButton={false}
          >
            실제 시험 전, 무료 모의고사 체험하기
          </Button>
        </div>

        <div className="w-full overflow-hidden rounded-3xl bg-white shadow-sm lg:w-2/5">
          <HeroVideo />
        </div>
      </main>

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
