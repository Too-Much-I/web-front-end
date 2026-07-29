import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/blog", label: "블로그" },
  { href: "/guide/toeic-speaking-parts", label: "토익 스피킹 가이드" },
  { href: "/terms", label: "이용약관" },
  { href: "/privacy", label: "개인정보처리방침" },
  { href: "/contact", label: "문의하기" },
] as const;

/** 콘텐츠 페이지가 공유하는 푸터. 본문 폭과 무관하게 화면 전체 폭을 쓴다. */
export function SiteFooter() {
  return (
    <footer className="border-t border-orange-200/60 px-6 py-8 sm:px-10">
      <div className="flex w-full flex-col items-center justify-between gap-4 text-sm text-zinc-500 sm:flex-row md:text-base">
        <span>© {new Date().getFullYear()} 토선생. All rights reserved.</span>
        <nav className="flex flex-wrap items-center justify-center gap-5">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-orange-500"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
