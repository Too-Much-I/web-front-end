import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없어요 - 토선생",
};

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-orange-50/40 px-6 py-16 text-center">
      <p
        aria-hidden
        className="font-jua text-8xl leading-none text-orange-500 sm:text-9xl md:text-[10rem] lg:text-[11rem]"
      >
        404
      </p>

      <div className="relative z-10 -mt-4 w-[150px] sm:-mt-6 sm:w-[180px] md:w-[210px] lg:w-[240px]">
        <Image
          src="/mascots/404.png"
          alt="지도를 보며 길을 찾는 토끼 캐릭터"
          width={800}
          height={1281}
          priority
          className="h-auto w-full"
        />
      </div>

      <h1 className="font-jua mt-8 text-2xl text-blue-950 sm:text-3xl md:text-4xl lg:text-[2.75rem]">
        앗, 길을 잃으셨군요!
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-500 sm:text-base md:text-lg lg:text-xl">
        토선생이 지도를 샅샅이 살펴봤지만
        <br className="sm:hidden" /> 찾으시는 페이지는 없는 것 같아요.
      </p>

      <Link
        href="/"
        className="mt-8 flex h-11 items-center rounded-full bg-orange-500 px-6 text-base font-semibold text-white transition-colors hover:bg-orange-600 lg:h-12 lg:px-7 lg:text-lg"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
