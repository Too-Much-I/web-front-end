"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { BlogPostCard } from "@/components/blog/blog-post-card";
import { getBlogPosts } from "@/features/blog/api/get-blog-posts";
import type { BlogPostPage, BlogPostSummary } from "@/types/blog";

/**
 * 무한 스크롤 목록.
 *
 * 사용자는 스크롤로 다음 페이지를 이어 붙이지만, 크롤러는 스크롤하지 않으므로
 * 하단의 다음 페이지 링크가 초기 HTML에 항상 남아 있어야 한다. 이 링크가
 * `/blog/page/[page]`로 이어지는 크롤 경로가 된다.
 * 자세한 배경은 docs/blog-search-route-separation.md 참고.
 */
export function BlogInfinitePostList({
  initialPage,
}: {
  initialPage: BlogPostPage;
}) {
  const [posts, setPosts] = useState<BlogPostSummary[]>(initialPage.posts);
  const [page, setPage] = useState(initialPage.page);
  const [hasNext, setHasNext] = useState(initialPage.hasNext);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  /** 관찰 콜백이 연속으로 불려도 같은 페이지를 두 번 요청하지 않게 막는다. */
  const isFetchingRef = useRef(false);

  const loadNextPage = useCallback(async () => {
    if (isFetchingRef.current || !hasNext) return;

    isFetchingRef.current = true;
    setIsLoading(true);
    setHasError(false);

    try {
      const next = await getBlogPosts({ page: page + 1 });
      setPosts((prev) => [...prev, ...next.posts]);
      setPage(next.page);
      setHasNext(next.hasNext);
    } catch {
      setHasError(true);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [hasNext, page]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    // 에러 상태에서는 자동 재시도 대신 사용자가 직접 다시 시도하게 둔다.
    if (!sentinel || !hasNext || hasError) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadNextPage();
        }
      },
      { rootMargin: "320px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNext, hasError, loadNextPage]);

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {posts.map((post, index) => (
          <BlogPostCard key={post.slug} post={post} priority={index < 3} />
        ))}
      </div>

      {hasNext ? (
        <>
          <div ref={sentinelRef} aria-hidden className="h-px" />

          <div className="flex flex-col items-center gap-3 pt-10">
            {hasError ? (
              <>
                <p className="text-sm text-zinc-500">
                  글을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
                </p>
                <button
                  type="button"
                  onClick={() => void loadNextPage()}
                  className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                >
                  다시 시도
                </button>
              </>
            ) : (
              <p
                aria-live="polite"
                className="flex items-center gap-2 text-sm text-zinc-400"
              >
                <span
                  aria-hidden
                  className="size-4 animate-spin rounded-full border-2 border-orange-200 border-t-orange-500 motion-reduce:animate-none"
                />
                {isLoading
                  ? "글을 더 불러오는 중…"
                  : "스크롤하면 더 보여드려요"}
              </p>
            )}

            {/*
              JS가 없는 크롤러가 따라갈 수 있는 실제 링크. 화면에서는 눈에 띄지 않게
              두되 숨기지는 않는다(display:none이면 크롤러가 링크 가치를 낮게 본다).
            */}
            <Link
              href={`/blog/page/${page + 1}`}
              className="text-sm text-zinc-400 underline-offset-4 hover:text-orange-600 hover:underline"
            >
              다음 페이지
            </Link>
          </div>
        </>
      ) : (
        <p className="pt-10 text-center text-sm text-zinc-400">
          마지막 글까지 모두 보셨어요.
        </p>
      )}
    </div>
  );
}
