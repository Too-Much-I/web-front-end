import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

const CONTENT_WIDTH = "mx-auto w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl";

export function GuidePageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-orange-50/40">
      <SiteHeader activePath="/guide" />

      <main
        className={`${CONTENT_WIDTH} flex flex-1 flex-col gap-10 px-6 pt-6 pb-20 sm:gap-12 sm:px-10 lg:gap-14`}
      >
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
