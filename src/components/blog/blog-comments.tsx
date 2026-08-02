"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { BlogAvatar } from "@/components/blog/blog-avatar";
import { BlogCommentComposer } from "@/components/blog/blog-comment-composer";
import {
  createBlogComment,
  getBlogComments,
  regenerateAnonymousIdentity,
} from "@/features/blog/api/blog-comments";
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
  const [page, setPage] = useState(1);
  const [loadedPages, setLoadedPages] = useState<BlogComment[]>([]);

  /**
   * 백엔드에는 아이덴티티 조회 엔드포인트가 없고 재발급만 있다. 그래서 첫 표시
   * 정보도 재발급으로 받아 온다. staleTime을 무한으로 두어 마운트마다 새로
   * 뽑히지 않게 한다.
   */
  const identityQuery = useQuery({
    queryKey: ["blog", "identity"],
    queryFn: regenerateAnonymousIdentity,
    staleTime: Infinity,
    retry: false,
  });

  const commentsQuery = useQuery({
    queryKey: ["blog", "comments", slug, page],
    queryFn: () => getBlogComments({ slug, page }),
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
      // 첫 페이지로 되돌려 방금 쓴 댓글이 포함된 목록을 다시 읽는다.
      setLoadedPages([]);
      setPage(1);
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
  const totalCount = currentPage?.totalElements ?? comments.length;

  function handleLoadMore() {
    if (!currentPage?.hasNext) return;
    setLoadedPages(comments);
    setPage(currentPage.page + 1);
  }

  return (
    <section className="mt-14 flex flex-col gap-5">
      <h2 className="text-lg font-bold text-blue-950 sm:text-xl">
        댓글 <span className="text-orange-600 tabular-nums">{totalCount}</span>
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

      {/*
        조회에 실패하면 data가 비어 "댓글 더 보기"가 사라지므로, 여기서 다시 시도할
        수단을 준다. 이전 페이지 데이터를 유지하는 방식(keepPreviousData)은 쓰지
        않는다. 위에서 loadedPages에 이미 본 댓글을 누적하고 있어, 실패한 페이지
        자리에 직전 페이지가 남으면 같은 댓글이 두 번 그려진다.
      */}
      {commentsQuery.isError ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <p className="text-sm text-zinc-500">댓글을 불러오지 못했어요.</p>
          <button
            type="button"
            onClick={() => void commentsQuery.refetch()}
            disabled={commentsQuery.isFetching}
            className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {commentsQuery.isFetching ? "불러오는 중…" : "다시 시도"}
          </button>
        </div>
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
            <BlogAvatar
              nickname={comment.nickname}
              avatarSeed={comment.avatarSeed}
              avatarImageUrl={comment.avatarImageUrl}
            />
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
