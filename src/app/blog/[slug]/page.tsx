import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { BlogComments } from "@/components/blog/blog-comments";
import { BlogPageLayout } from "@/components/blog/blog-page-layout";
import { BlogShareButtons } from "@/components/blog/blog-share-buttons";
import { ReadingProgressBar } from "@/components/blog/reading-progress-bar";
import { RelatedPosts } from "@/components/blog/related-posts";
import { ExamStartButton } from "@/components/exam/exam-start-button";
import { getBlogPost } from "@/features/blog/api/get-blog-post";
import { getBlogPosts } from "@/features/blog/api/get-blog-posts";
import { BLOG_REVALIDATE_SECONDS } from "@/features/blog/blog-cache";
import {
  estimateReadingMinutes,
  formatBlogDate,
  toDateAttribute,
} from "@/features/blog/blog-format";
import {
  blogBreadcrumbJsonLd,
  blogPostingJsonLd,
} from "@/features/blog/blog-json-ld";
import { renderMarkdown, stripMarkdown } from "@/features/blog/render-markdown";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/site-config";

// 세그먼트 설정은 정적으로 분석되므로 리터럴이어야 한다(BLOG_REVALIDATE_SECONDS와 동일 값).
export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const { posts } = await getBlogPosts({ size: 50 });
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    // 빌드 시점에 백엔드가 없어도 빌드는 통과시키고 요청 시 렌더링에 맡긴다.
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug, { revalidate: BLOG_REVALIDATE_SECONDS });
  if (!post) return {};

  const url = `/blog/${post.slug}`;
  const title = `${post.seoTitle} | 토선생`;
  // 썸네일이 없는 글도 공유 카드가 비지 않도록 사이트 기본 OG 이미지로 폴백한다.
  // (openGraph/twitter는 상위 세그먼트와 병합되지 않고 통째로 교체되므로 여기서 직접 채워야 한다.)
  const images = post.thumbnailUrl
    ? [{ url: post.thumbnailUrl }]
    : [DEFAULT_OG_IMAGE];

  return {
    title,
    description: post.seoDescription,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: post.seoDescription,
      url,
      siteName: "토선생",
      locale: "ko_KR",
      type: "article",
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: (post.updatedAt ?? post.publishedAt).toISOString(),
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: post.seoDescription,
      images,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug, { revalidate: BLOG_REVALIDATE_SECONDS });
  if (!post) notFound();

  const contentHtml = await renderMarkdown(post.contentMarkdown, {
    title: post.title,
  });
  const readingMinutes = estimateReadingMinutes(
    stripMarkdown(post.contentMarkdown),
  );

  return (
    <>
      <ReadingProgressBar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogPostingJsonLd(post)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogBreadcrumbJsonLd(post)),
        }}
      />

      <BlogPageLayout variant="article">
        <article>
          <header className="flex flex-col gap-4 pt-10 pb-6">
            <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
              <span>{post.authorName}</span>
              <span aria-hidden>·</span>
              <time dateTime={toDateAttribute(post.publishedAt)}>
                {formatBlogDate(post.publishedAt)}
              </time>
              <span aria-hidden>·</span>
              <span>{readingMinutes}분 분량</span>
            </div>

            <h1 className="text-2xl leading-tight font-bold tracking-tight text-balance text-blue-950 sm:text-3xl lg:text-4xl">
              {post.title}
            </h1>

            <p className="text-base leading-relaxed text-zinc-500 sm:text-lg">
              {post.summary}
            </p>

            <div className="pt-1">
              <BlogShareButtons
                url={`${SITE_URL}/blog/${post.slug}`}
                title={post.title}
              />
            </div>
          </header>

          {post.thumbnailUrl ? (
            <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-3xl bg-orange-50">
              <Image
                src={post.thumbnailUrl}
                alt={post.title}
                fill
                priority
                sizes="(min-width: 768px) 42rem, 90vw"
                className="object-cover"
              />
            </div>
          ) : null}

          <div
            className="blog-prose"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          {post.updatedAt ? (
            <p className="pt-8 text-sm text-zinc-400">
              최종 수정: {formatBlogDate(post.updatedAt)}
            </p>
          ) : null}
        </article>

        <section className="mt-12 flex flex-col items-start gap-3 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <strong className="text-base font-bold text-blue-950 sm:text-lg">
            내 등급, 지금 바로 확인해 볼까요?
          </strong>
          <p className="text-sm text-zinc-500 sm:text-base">
            가입 없이 20분. 실제 시험과 같은 11문항을 풀면 AI가 항목별 감점
            이유까지 알려드려요.
          </p>
          <ExamStartButton className="mt-1 h-12 rounded-full bg-orange-500 px-7 text-base text-white hover:bg-orange-600">
            무료 모의고사 시작하기
          </ExamStartButton>
        </section>

        <RelatedPosts posts={post.relatedPosts} />

        <BlogComments slug={post.slug} />
      </BlogPageLayout>
    </>
  );
}
