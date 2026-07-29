import Link from "next/link";

import { formatBlogDate, toDateAttribute } from "@/features/blog/blog-format";
import type { BlogPostSummary } from "@/types/blog";

/**
 * 본문 하단 관련 글(docs/blog.md 12.1).
 *
 * 본문 폭이 좁아 카드 그리드 대신 세로로 쌓는 목록 형태를 쓴다.
 */
export function RelatedPosts({ posts }: { posts: BlogPostSummary[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-14 flex flex-col gap-4">
      <h2 className="text-lg font-bold text-blue-950 sm:text-xl">
        같이 읽으면 좋은 글
      </h2>
      <ul className="flex flex-col gap-2">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="flex flex-col gap-1 rounded-2xl bg-white px-5 py-4 transition-colors hover:bg-orange-50/70 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
            >
              <span className="line-clamp-2 font-bold text-blue-950">
                {post.title}
              </span>
              <span className="line-clamp-1 text-sm text-zinc-500">
                {post.summary}
              </span>
              <time
                dateTime={toDateAttribute(post.publishedAt)}
                className="text-xs text-zinc-400"
              >
                {formatBlogDate(post.publishedAt)}
              </time>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
