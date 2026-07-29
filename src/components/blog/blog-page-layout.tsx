import { NewsletterPopup } from "@/components/blog/newsletter-popup";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

/** 카드 그리드를 3열까지 펼쳐야 해서 가이드보다 넓은 폭을 쓴다. */
const LIST_WIDTH = "mx-auto w-full max-w-6xl lg:max-w-7xl";
/** 본문 한 줄이 65자 안팎이 되도록 좁힌 읽기 폭. */
const READ_WIDTH = "mx-auto w-full max-w-2xl";

export function BlogPageLayout({
  children,
  variant = "list",
}: {
  children: React.ReactNode;
  variant?: "list" | "article";
}) {
  const contentWidth = variant === "article" ? READ_WIDTH : LIST_WIDTH;

  return (
    <div className="flex flex-1 flex-col bg-orange-50/40">
      <SiteHeader activePath="/blog" />

      <main
        className={`${contentWidth} flex flex-1 flex-col px-6 pt-6 pb-20 sm:px-10`}
      >
        {children}
      </main>

      <SiteFooter />

      <NewsletterPopup />
    </div>
  );
}
