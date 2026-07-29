"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { BlogCommentComposer } from "@/components/blog/blog-comment-composer";
import {
  createBlogComment,
  getAnonymousIdentity,
  getBlogComments,
  regenerateAnonymousIdentity,
} from "@/features/blog/api/blog-comments";
import { avatarGradient, avatarInitial } from "@/features/blog/avatar";
import { formatRelativeTime } from "@/features/blog/blog-format";
import type { AnonymousIdentity, BlogComment } from "@/types/blog";

/**
 * 댓글 섹션.
 *
 * 본문은 ISR로 캐시되지만 댓글은 즉시 최신이어야 해서 클라이언트에서 조회한다.
 * 수정·삭제 UI는 존재하지 않는다(docs/blog.md 8.2).
 */
export function BlogComments({ slug }: { slug: string }) {
  const queryClient = useQueryClient();
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadedPages, setLoadedPages] = useState<BlogComment[]>([]);

  const identityQuery = useQuery({
    queryKey: ["blog", "identity"],
    queryFn: getAnonymousIdentity,
    staleTime: Infinity,
    retry: false,
  });

  const commentsQuery = useQuery({
    queryKey: ["blog", "comments", slug, cursor],
    queryFn: () => getBlogComments({ slug, cursor }),
  });

  const regenerate = useMutation({
    mutationFn: regenerateAnonymousIdentity,
    onSuccess: (identity: AnonymousIdentity) => {
      queryClient.setQueryData(["blog", "identity"], identity);
    },
    onError: () => {
      toast.error("닉네임을 다시 뽑지 못했어요. 잠시 후 시도해 주세요.");
    },
  });

  const submit = useMutation({
    mutationFn: (payload: { content: string; website: string }) =>
      createBlogComment({ slug, ...payload }),
    onSuccess: async () => {
      // 커서를 처음으로 되돌려 최신 댓글부터 다시 읽는다.
      setLoadedPages([]);
      setCursor(null);
      await queryClient.invalidateQueries({
        queryKey: ["blog", "comments", slug],
      });
      // 다음 댓글은 새 아이덴티티로 달리도록 서버에 재발급을 요청한다.
      regenerate.mutate();
      toast.success("댓글을 등록했어요.");
    },
    onError: () => {
      toast.error(
        "댓글을 등록하지 못했어요. 내용을 확인한 뒤 다시 시도해 주세요.",
      );
    },
  });

  const currentPage = commentsQuery.data;
  const comments = [...loadedPages, ...(currentPage?.comments ?? [])];

  function handleLoadMore() {
    if (!currentPage?.nextCursor) return;
    setLoadedPages(comments);
    setCursor(currentPage.nextCursor);
  }

  return (
    <section className="mt-14 flex flex-col gap-5">
      <h2 className="text-lg font-bold text-blue-950 sm:text-xl">
        댓글{" "}
        <span className="text-orange-600 tabular-nums">{comments.length}</span>
      </h2>

      <BlogCommentComposer
        identity={identityQuery.data ?? null}
        isIdentityLoading={identityQuery.isFetching || regenerate.isPending}
        isSubmitting={submit.isPending}
        onRegenerate={() => regenerate.mutate()}
        onSubmit={(payload) => submit.mutate(payload)}
      />

      {commentsQuery.isPending && comments.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-400">
          댓글을 불러오는 중이에요…
        </p>
      ) : null}

      {commentsQuery.isError ? (
        <p className="py-6 text-center text-sm text-zinc-500">
          댓글을 불러오지 못했어요.
        </p>
      ) : null}

      {!commentsQuery.isPending && comments.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-400">
          첫 댓글을 남겨보세요.
        </p>
      ) : null}

      <ul className="flex flex-col gap-2">
        {comments.map((comment) => (
          <li
            key={comment.id}
            className="flex gap-3 rounded-2xl bg-white px-5 py-4"
          >
            <span
              aria-hidden
              className="grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
              style={{ backgroundImage: avatarGradient(comment.avatarSeed) }}
            >
              {avatarInitial(comment.nickname)}
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-sm font-bold text-blue-950">
                  {comment.nickname}
                </span>
                <time
                  dateTime={comment.createdAt.toISOString()}
                  className="text-xs text-zinc-400"
                >
                  {formatRelativeTime(comment.createdAt)}
                </time>
              </div>
              <p className="text-sm leading-relaxed break-words whitespace-pre-wrap text-zinc-600 sm:text-base">
                {comment.content}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {currentPage?.hasNext ? (
        <button
          type="button"
          onClick={handleLoadMore}
          className="mx-auto rounded-full border border-zinc-100 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-600 hover:border-orange-200 hover:text-orange-600"
        >
          댓글 더 보기
        </button>
      ) : null}
    </section>
  );
}
