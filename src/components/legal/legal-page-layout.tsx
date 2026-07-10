import Image from "next/image";
import Link from "next/link";

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-bold text-blue-950 sm:text-xl">{title}</h2>
      <div className="flex flex-col gap-2 text-sm leading-relaxed text-zinc-600 sm:text-base">
        {children}
      </div>
    </section>
  );
}

export function LegalPageLayout({
  title,
  effectiveDateLabel,
  intro,
  children,
}: {
  title: string;
  effectiveDateLabel: string;
  intro: React.ReactNode;
  children: React.ReactNode;
}) {
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
        <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-orange-500">
          홈으로
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 pt-6 pb-24 sm:px-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-blue-950 sm:text-3xl">
            {title}
          </h1>
          <p className="text-sm text-zinc-500">{effectiveDateLabel}</p>
          <p className="text-sm leading-relaxed text-zinc-600">{intro}</p>
        </div>

        {children}
      </main>

      <footer className="border-t border-orange-200/60 px-6 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-between gap-4 text-sm text-zinc-500 sm:flex-row">
          <span>© {new Date().getFullYear()} 토선생. All rights reserved.</span>
          <Link href="/" className="hover:text-orange-500">
            홈으로 돌아가기
          </Link>
        </div>
      </footer>
    </div>
  );
}
