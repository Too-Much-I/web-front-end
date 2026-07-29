import Link from "next/link";

import { BlogPostThumbnail } from "@/components/blog/blog-post-thumbnail";
import { formatBlogDate, toDateAttribute } from "@/features/blog/blog-format";
import type { BlogPostSummary } from "@/types/blog";

export function BlogPostCard({
  post,
  priority = false,
}: {
  post: BlogPostSummary;
  priority?: boolean;
}) {
  return (
    <article className="h-full">
      <Link
        href={`/blog/${post.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <BlogPostThumbnail
          slug={post.slug}
          thumbnailUrl={post.thumbnailUrl}
          title={post.title}
          priority={priority}
        />

        <div className="flex flex-1 flex-col gap-2 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-xs text-zinc-400 sm:text-sm">
            <span>{post.authorName}</span>
            <span aria-hidden>·</span>
            <time dateTime={toDateAttribute(post.publishedAt)}>
              {formatBlogDate(post.publishedAt)}
            </time>
          </div>

          <h3 className="line-clamp-2 text-base leading-snug font-bold text-blue-950 sm:text-lg lg:text-xl">
            {post.title}
          </h3>

          <p className="line-clamp-2 text-sm text-zinc-500 sm:text-base">
            {post.summary}
          </p>
        </div>
      </Link>
    </article>
  );
}
