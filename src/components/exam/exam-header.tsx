"use client";

import Image from "next/image";
import Link from "next/link";

export function ExamHeader({ label }: { label: string }) {
  return (
    <header className="relative h-16 overflow-hidden bg-orange-500 sm:h-20 lg:h-24">
      <div
        className="absolute inset-0 bg-blue-950"
        style={{ clipPath: "polygon(60% 0%, 100% 0%, 100% 100%, 84% 100%)" }}
      />
      <Link
        href="/"
        className="absolute top-1/2 left-6 flex -translate-y-1/2 items-center gap-1.5 sm:left-10"
      >
        <Image src="/logo.png" alt="" width={28} height={28} className="size-7 lg:size-8" />
        <span className="text-lg font-bold text-white sm:text-xl lg:text-2xl">
          토선생
        </span>
      </Link>
      <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-lg font-bold text-white sm:text-xl md:text-2xl lg:text-3xl">
        {label}
      </span>
    </header>
  );
}
