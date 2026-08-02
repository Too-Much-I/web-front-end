import type { Metadata } from "next";
import Link from "next/link";

import { BlogPageLayout } from "@/components/blog/blog-page-layout";
import { BlogPagination } from "@/components/blog/blog-pagination";
import { BlogPostGrid } from "@/components/blog/blog-post-grid";
import { BlogSearchField } from "@/components/blog/blog-search-field";
import { getBlogPosts } from "@/features/blog/api/get-blog-posts";
import {
  isSearchQueryTooShort,
  normalizeSearchQuery,
  searchBlogPosts,
  SEARCH_QUERY_MIN_LENGTH,
} from "@/features/blog/api/search-blog-posts";
import type { BlogPostSummary } from "@/types/blog";

/**
 * 검색 결과는 색인 대상이 아니다(docs/blog.md 13.7). 링크는 따라가도 되므로
 * follow는 유지한다.
 */
export const metadata: Metadata = {
  title: "블로그 검색 | 토선생",
  robots: { index: false, follow: true },
};

function parsePage(raw: string | undefined): number {
  if (!raw || !/^\d+$/.test(raw)) return 1;
  return Math.max(1, Number(raw));
}

export default async function BlogSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page: rawPage } = await searchParams;
  const query = normalizeSearchQuery(q);
  const page = parsePage(rawPage);

  const isTooShort = isSearchQueryTooShort(query);
  const result = isTooShort ? null : await searchBlogPosts({ query, page });

  // 결과가 없으면 최신 글을 대신 보여준다(docs/blog.md 7.2).
  let fallbackPosts: BlogPostSummary[] = [];
  if (result && result.posts.length === 0) {
    fallbackPosts = (await getBlogPosts({ size: 3 })).posts;
  }

  return (
    <BlogPageLayout>
      <section className="flex flex-col gap-3 pt-10 pb-7">
        <Link
          href="/blog"
          className="text-sm font-bold text-orange-600 hover:underline sm:text-base"
        >
          토선생 블로그
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-blue-950 sm:text-3xl lg:text-4xl">
          {query ? `‘${query}’ 검색 결과` : "블로그 검색"}
        </h1>
        {result ? (
          <p className="text-sm text-zinc-500 sm:text-base">
            총{" "}
            <b className="text-orange-600 tabular-nums">
              {result.totalElements}
            </b>
            건을 찾았어요.
          </p>
        ) : null}
      </section>

      <div className="pb-8">
        <BlogSearchField defaultValue={query} />
      </div>

      {isTooShort ? (
        <p className="py-10 text-sm text-zinc-500 sm:text-base">
          검색어를 {SEARCH_QUERY_MIN_LENGTH}자 이상 입력해 주세요.
        </p>
      ) : null}

      {result && result.posts.length > 0 ? (
        <>
          <BlogPostGrid posts={result.posts} />
          <BlogPagination
            currentPage={result.page}
            totalPages={result.totalPages}
            buildHref={(target) =>
              `/blog/search?q=${encodeURIComponent(query)}&page=${target}`
            }
          />
        </>
      ) : null}

      {result && result.posts.length === 0 ? (
        <div className="flex flex-col gap-5">
          <p className="text-sm text-zinc-500 sm:text-base">
            검색 결과가 없어요. 대신 아래 글을 확인해 보세요.
          </p>
          <BlogPostGrid posts={fallbackPosts} />
        </div>
      ) : null}
    </BlogPageLayout>
  );
}
