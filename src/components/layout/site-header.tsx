import Image from "next/image";
import Link from "next/link";

import { ExamStartButton } from "@/components/exam/exam-start-button";

const NAV_LINKS = [
  { href: "/guide/toeic-speaking-parts", label: "토익 스피킹 가이드" },
  { href: "/blog", label: "블로그" },
  { href: "/contact", label: "문의하기" },
] as const;

/**
 * 랜딩을 제외한 콘텐츠 페이지(가이드, 블로그)가 공유하는 헤더.
 *
 * 랜딩 헤더는 섹션 스크롤 링크와 sticky 동작이 달라 별도로 둔다.
 */
export function SiteHeader({ activePath }: { activePath?: string }) {
  return (
    <header className="flex items-center justify-between gap-4 px-6 py-5 sm:px-10">
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

      <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-600 md:flex lg:gap-10 lg:text-base">
        {NAV_LINKS.map((link) => {
          const isActive = activePath?.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive ? "font-bold text-orange-600" : "hover:text-orange-500"
              }
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <ExamStartButton className="h-11 shrink-0 rounded-full bg-orange-500 px-6 text-base text-white hover:bg-orange-600 lg:h-12 lg:px-7 lg:text-lg">
        시작하기
      </ExamStartButton>
    </header>
  );
}
