"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";

import { BlogAvatar } from "@/components/blog/blog-avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  COMMENT_MAX_LENGTH,
  COMMENT_MIN_LENGTH,
} from "@/features/blog/api/blog-comments";
import type { AnonymousIdentity } from "@/types/blog";

/**
 * 댓글 작성 폼.
 *
 * 닉네임과 아바타는 사용자가 입력하지 않는다. 서버가 익명 쿠키를 기준으로
 * 정해준 값을 보여주기만 하고, "다시 뽑기"도 서버에 재발급을 요청한다
 * (docs/blog.md 8.5).
 */
export function BlogCommentComposer({
  identity,
  isIdentityLoading,
  isSubmitting,
  onRegenerate,
  onSubmit,
}: {
  identity: AnonymousIdentity | null;
  isIdentityLoading: boolean;
  isSubmitting: boolean;
  onRegenerate: () => void;
  onSubmit: (payload: { content: string; website: string }) => void;
}) {
  const [content, setContent] = useState("");
  /** 사용자에게 보이지 않는 허니팟. 값이 차 있으면 서버가 자동화로 판단한다. */
  const [website, setWebsite] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const trimmed = content.trim();
  const canSubmit =
    trimmed.length >= COMMENT_MIN_LENGTH &&
    trimmed.length <= COMMENT_MAX_LENGTH &&
    !isSubmitting;

  function handleConfirm() {
    // 다이얼로그가 닫히기 전에 두 번째 클릭이 들어올 수 있다. 댓글은 수정·삭제가
    // 안 되므로 중복 등록은 되돌릴 수 없어, 버튼 비활성화와 별개로 여기서도 막는다.
    if (!canSubmit) return;

    setIsConfirmOpen(false);
    onSubmit({ content: trimmed, website });
    setContent("");
    setWebsite("");
  }

  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2.5">
        {identity ? (
          <>
            <BlogAvatar
              nickname={identity.nickname}
              avatarSeed={identity.avatarSeed}
              avatarImageUrl={identity.avatarImageUrl}
            />
            <span className="text-sm font-bold text-blue-950">
              {identity.nickname}
            </span>
          </>
        ) : (
          <>
            <span className="size-9 shrink-0 animate-pulse rounded-full bg-zinc-100" />
            <span className="h-4 w-24 animate-pulse rounded bg-zinc-100" />
          </>
        )}

        <button
          type="button"
          onClick={onRegenerate}
          disabled={isIdentityLoading}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:text-orange-600 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none disabled:opacity-60"
        >
          <RefreshCw
            aria-hidden
            className={`size-3.5 ${isIdentityLoading ? "animate-spin motion-reduce:animate-none" : ""}`}
          />
          다시 뽑기
        </button>
      </div>

      <label htmlFor="comment-content" className="sr-only">
        댓글 내용
      </label>
      <textarea
        id="comment-content"
        value={content}
        maxLength={COMMENT_MAX_LENGTH}
        onChange={(event) => setContent(event.target.value)}
        placeholder="이 글에 대한 질문이나 의견을 남겨주세요."
        className="min-h-24 resize-y rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm text-blue-950 placeholder:text-zinc-400 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/12 focus:outline-none sm:text-base"
      />

      {/* 허니팟. 스크린리더와 키보드에서 제외한다. */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-zinc-400 tabular-nums">
          {trimmed.length} / {COMMENT_MAX_LENGTH}
        </span>
        <span className="text-xs text-zinc-400">
          등록한 댓글은 수정·삭제할 수 없어요.
        </span>
        <Button
          type="button"
          disabled={!canSubmit}
          onClick={() => setIsConfirmOpen(true)}
          className="ml-auto h-10 rounded-full bg-orange-500 px-5 text-sm text-white hover:bg-orange-600"
        >
          {isSubmitting ? "등록 중…" : "댓글 남기기"}
        </Button>
      </div>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="border-none bg-transparent p-0 ring-0 sm:max-w-sm">
          <section className="flex flex-col gap-5 rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
            <div className="flex flex-col gap-1.5">
              <DialogTitle className="text-base font-bold text-blue-950">
                댓글을 등록할까요?
              </DialogTitle>
              <DialogDescription className="text-sm text-zinc-500">
                등록한 댓글은 수정하거나 삭제할 수 없습니다. 내용을 확인한 후
                등록해 주세요.
              </DialogDescription>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setIsConfirmOpen(false)}
                className="h-10 rounded-full px-5 text-sm text-zinc-500"
              >
                취소
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!canSubmit}
                className="h-10 rounded-full bg-orange-500 px-5 text-sm text-white hover:bg-orange-600"
              >
                등록
              </Button>
            </div>
          </section>
        </DialogContent>
      </Dialog>
    </div>
  );
}
