import { BlogPostCard } from "@/components/blog/blog-post-card";
import type { BlogPostSummary } from "@/types/blog";

/** 무한 스크롤 없이 한 페이지 분량만 그리는 그리드(검색 결과, 페이지네이션 경로). */
export function BlogPostGrid({ posts }: { posts: BlogPostSummary[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {posts.map((post, index) => (
        <BlogPostCard key={post.slug} post={post} priority={index < 3} />
      ))}
    </div>
  );
}
