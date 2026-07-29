import type { Metadata } from "next";

import { BlogInfinitePostList } from "@/components/blog/blog-infinite-post-list";
import { BlogListUnavailable } from "@/components/blog/blog-list-unavailable";
import { BlogPageLayout } from "@/components/blog/blog-page-layout";
import { BlogSearchField } from "@/components/blog/blog-search-field";
import { getBlogPostsSafe } from "@/features/blog/api/get-blog-posts";
import { BLOG_REVALIDATE_SECONDS } from "@/features/blog/blog-cache";
import { DEFAULT_OG_IMAGE } from "@/lib/site-config";

/** 새 글과 예약 발행이 재배포 없이 반영되도록 ISR로 둔다. */
// 세그먼트 설정은 정적으로 분석되므로 리터럴이어야 한다(BLOG_REVALIDATE_SECONDS와 동일 값).
export const revalidate = 300;

const TITLE = "토익 스피킹 학습 블로그";
const DESCRIPTION =
  "토익 스피킹 등급 기준부터 파트별 답변 전략까지, 실제 채점 데이터를 보며 정리한 학습 노트를 모았습니다.";

export const metadata: Metadata = {
  title: `${TITLE} | 토선생`,
  description: DESCRIPTION,
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": "/rss.xml" },
  },
  openGraph: {
    title: `${TITLE} | 토선생`,
    description: DESCRIPTION,
    url: "/blog",
    siteName: "토선생",
    locale: "ko_KR",
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | 토선생`,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default async function BlogListPage() {
  const firstPage = await getBlogPostsSafe({
    revalidate: BLOG_REVALIDATE_SECONDS,
  });

  return (
    <BlogPageLayout>
      <section className="flex flex-col gap-3 pt-10 pb-7">
        <p className="text-sm font-bold text-orange-600 sm:text-base">
          토선생 블로그
        </p>
        <h1 className="text-2xl leading-tight font-bold tracking-tight text-blue-950 sm:text-3xl lg:text-4xl xl:text-5xl">
          토익 스피킹, 아는 만큼 점수가 오릅니다
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-500 sm:text-base lg:text-lg">
          {DESCRIPTION}
        </p>
      </section>

      <div className="pb-8">
        <BlogSearchField />
      </div>

      {firstPage ? (
        <BlogInfinitePostList initialPage={firstPage} />
      ) : (
        <BlogListUnavailable />
      )}
    </BlogPageLayout>
  );
}
