import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogListUnavailable } from "@/components/blog/blog-list-unavailable";
import { BlogPageLayout } from "@/components/blog/blog-page-layout";
import { BlogPagination } from "@/components/blog/blog-pagination";
import { BlogPostGrid } from "@/components/blog/blog-post-grid";
import {
  BLOG_PAGE_SIZE,
  getBlogPosts,
  getBlogPostsSafe,
} from "@/features/blog/api/get-blog-posts";
import { BLOG_REVALIDATE_SECONDS } from "@/features/blog/blog-cache";
import { BLOG_NAME } from "@/features/blog/blog-json-ld";
import { DEFAULT_OG_IMAGE } from "@/lib/site-config";

// 세그먼트 설정은 정적으로 분석되므로 리터럴이어야 한다(BLOG_REVALIDATE_SECONDS와 동일 값).
export const revalidate = 300;
/**
 * 글이 늘어 페이지 수가 증가해도 새 번호가 404가 되지 않도록 켜 둔다.
 * 미생성 경로는 첫 요청에서 렌더링된 뒤 캐시되므로 정적 이점은 유지된다.
 * 자세한 배경은 docs/blog-search-route-separation.md 2.2 참고.
 */
export const dynamicParams = true;

/**
 * 크롤러가 따라가는 페이지네이션 경로.
 *
 * 사용자는 `/blog`에서 무한 스크롤로 같은 내용을 보므로 이 경로에 직접 들어올 일은
 * 거의 없다. 목록 1페이지는 `/blog`가 정본이라 여기서는 2페이지부터 다룬다.
 */
export async function generateStaticParams() {
  try {
    const { totalPages } = await getBlogPosts({ size: BLOG_PAGE_SIZE });
    return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
      page: String(i + 2),
    }));
  } catch {
    // 빌드 시점에 백엔드에 닿지 못해도 빌드는 통과시키고, 요청 시 렌더링에 맡긴다.
    return [];
  }
}

function parsePage(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const page = Number(raw);
  // 1페이지는 /blog가 정본이므로 중복 URL을 만들지 않는다.
  return page >= 2 ? page : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page: rawPage } = await params;
  const page = parsePage(rawPage);
  if (!page) return {};

  const title = `${BLOG_NAME} (${page}페이지) | 토선생`;
  const description = `토선생 블로그 글 목록 ${page}페이지입니다.`;

  return {
    title,
    description,
    alternates: { canonical: `/blog/page/${page}` },
    // 정의하지 않으면 루트 레이아웃의 랜딩 페이지 문구가 그대로 공유 카드에 나간다.
    openGraph: {
      title,
      description,
      url: `/blog/page/${page}`,
      siteName: "토선생",
      locale: "ko_KR",
      type: "website",
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function BlogPaginatedPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page: rawPage } = await params;
  const page = parsePage(rawPage);
  if (!page) notFound();

  const result = await getBlogPostsSafe({
    page,
    revalidate: BLOG_REVALIDATE_SECONDS,
  });
  // 존재하지 않는 페이지 번호만 404다. 백엔드 장애는 404가 아니라 안내로 떨어뜨린다.
  if (result && result.posts.length === 0) notFound();

  return (
    <BlogPageLayout>
      <section className="flex flex-col gap-3 pt-10 pb-8">
        <Link
          href="/blog"
          className="text-sm font-bold text-orange-600 hover:underline sm:text-base"
        >
          토선생 블로그
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-blue-950 sm:text-3xl lg:text-4xl">
          글 목록 {page}페이지
        </h1>
      </section>

      {result ? (
        <>
          <BlogPostGrid posts={result.posts} />
          <BlogPagination
            currentPage={result.page}
            totalPages={result.totalPages}
            buildHref={(target) =>
              target === 1 ? "/blog" : `/blog/page/${target}`
            }
          />
        </>
      ) : (
        <BlogListUnavailable />
      )}
    </BlogPageLayout>
  );
}
