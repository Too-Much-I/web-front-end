import Link from "next/link";

/** 앞뒤로 몇 개의 페이지 번호까지 노출할지. */
const WINDOW = 2;

function pageNumbers(current: number, total: number): number[] {
  const start = Math.max(1, current - WINDOW);
  const end = Math.min(total, current + WINDOW);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * 실제 `<a>`로 이루어진 페이지네이션.
 *
 * `buildHref`로 경로 형태를 주입받는다. 목록은 `/blog/page/2`, 검색은
 * `/blog/search?q=...&page=2`처럼 서로 다르기 때문이다.
 */
export function BlogPagination({
  currentPage,
  totalPages,
  buildHref,
}: {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages = pageNumbers(currentPage, totalPages);

  return (
    <nav aria-label="페이지 목록" className="flex justify-center pt-12">
      <ul className="flex flex-wrap items-center gap-2">
        {currentPage > 1 ? (
          <li>
            <Link
              href={buildHref(currentPage - 1)}
              rel="prev"
              className="flex h-10 items-center rounded-full px-4 text-sm font-medium text-zinc-500 hover:bg-white hover:text-orange-600"
            >
              이전
            </Link>
          </li>
        ) : null}

        {pages.map((page) => {
          const isCurrent = page === currentPage;
          return (
            <li key={page}>
              <Link
                href={buildHref(page)}
                aria-current={isCurrent ? "page" : undefined}
                className={
                  isCurrent
                    ? "flex size-10 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white"
                    : "flex size-10 items-center justify-center rounded-full text-sm font-medium text-zinc-500 hover:bg-white hover:text-orange-600"
                }
              >
                {page}
              </Link>
            </li>
          );
        })}

        {currentPage < totalPages ? (
          <li>
            <Link
              href={buildHref(currentPage + 1)}
              rel="next"
              className="flex h-10 items-center rounded-full px-4 text-sm font-medium text-zinc-500 hover:bg-white hover:text-orange-600"
            >
              다음
            </Link>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
