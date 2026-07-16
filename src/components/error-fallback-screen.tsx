import Image from "next/image";
import Link from "next/link";

/**
 * 서버 응답을 받지 못했을 때(채점 결과/피드백 조회 실패, 채점 에러 등) 쓰는 공용 폴백 화면.
 * 404 페이지(src/app/not-found.tsx)와 같은 디자인 언어를 공유한다.
 */
export function ErrorFallbackScreen({
  title = "잠깐 문제가 생겼어요",
  description,
  onRetry,
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-1 flex-col items-center justify-center bg-orange-50/40 px-6 py-16 text-center"
    >
      <p
        aria-hidden
        className="font-jua text-7xl leading-none text-orange-500 sm:text-8xl md:text-9xl lg:text-[9rem]"
      >
        OOPS!
      </p>

      <div className="relative z-10 -mt-2 w-[130px] sm:-mt-4 sm:w-[160px] md:w-[180px] lg:w-[200px]">
        <Image
          src="/mascots/error.png"
          alt="눈이 핑핑 도는 토끼 캐릭터"
          width={800}
          height={1372}
          priority
          className="h-auto w-full"
        />
      </div>

      <h2 className="font-jua mt-8 text-2xl text-blue-950 sm:text-3xl md:text-4xl lg:text-[2.5rem]">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-500 sm:text-base md:text-lg lg:text-xl">
        {description}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex h-11 items-center rounded-full bg-orange-500 px-6 text-base font-semibold text-white transition-colors hover:bg-orange-600 lg:h-12 lg:px-7 lg:text-lg"
          >
            다시 시도하기
          </button>
        )}
        <Link
          href="/"
          className="flex h-11 items-center rounded-full border border-orange-200 bg-white px-6 text-base font-semibold text-orange-600 transition-colors hover:bg-orange-50 lg:h-12 lg:px-7 lg:text-lg"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
