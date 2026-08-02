"use client";

import { Check, Link2, Share2 } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

/**
 * 글 공유 버튼.
 *
 * X와 네이버는 별도 SDK나 키 없이 URL 인텐트만으로 동작한다. 카카오톡 공유는
 * Kakao JavaScript SDK와 앱 키가 있어야 해서 여기에 없다. 대신 모바일에서는
 * 네이티브 공유 시트(Web Share API)가 카카오톡을 포함해 설치된 앱 전부를
 * 띄워주므로, 지원되는 환경에서만 "공유" 버튼을 추가로 보여준다.
 */
export function BlogShareButtons({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const [isCopied, setIsCopied] = useState(false);

  /**
   * 서버에는 navigator가 없으므로 서버 스냅샷을 false로 두고, 클라이언트에서만
   * 지원 여부를 읽는다. effect에서 setState하면 하이드레이션 직후 한 번 더
   * 렌더링되므로 useSyncExternalStore로 처리한다. 지원 여부는 런타임 중
   * 바뀌지 않아 구독은 빈 함수다.
   */
  const canUseNativeShare = useSyncExternalStore(
    () => () => {},
    () => typeof navigator !== "undefined" && !!navigator.share,
    () => false,
  );

  useEffect(() => {
    if (!isCopied) return;
    const timer = setTimeout(() => setIsCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [isCopied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
    } catch {
      toast.error("링크를 복사하지 못했어요. 주소창의 URL을 복사해 주세요.");
    }
  }

  function openShareWindow(target: string) {
    window.open(target, "_blank", "noopener,noreferrer,width=600,height=600");
  }

  async function handleNativeShare() {
    try {
      await navigator.share({ title, url });
    } catch {
      // 사용자가 공유 시트를 닫은 경우도 여기로 온다. 알릴 필요가 없다.
    }
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => void handleCopy()}
        className={BUTTON}
      >
        {isCopied ? (
          <Check aria-hidden className="size-4" />
        ) : (
          <Link2 aria-hidden className="size-4" />
        )}
        {isCopied ? "복사했어요" : "링크 복사"}
      </button>

      <button
        type="button"
        onClick={() =>
          openShareWindow(
            `https://x.com/intent/post?text=${encodedTitle}&url=${encodedUrl}`,
          )
        }
        className={BUTTON}
        aria-label="X에 공유하기"
      >
        <XIcon />X
      </button>

      <button
        type="button"
        onClick={() =>
          openShareWindow(
            `https://share.naver.com/web/shareView?url=${encodedUrl}&title=${encodedTitle}`,
          )
        }
        className={BUTTON}
        aria-label="네이버에 공유하기"
      >
        <NaverIcon />
        네이버
      </button>

      <button
        type="button"
        onClick={() =>
          openShareWindow(
            `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
          )
        }
        className={BUTTON}
        aria-label="페이스북에 공유하기"
      >
        <FacebookIcon />
        페이스북
      </button>

      {canUseNativeShare ? (
        <button
          type="button"
          onClick={() => void handleNativeShare()}
          className={BUTTON}
        >
          <Share2 aria-hidden className="size-4" />
          공유
        </button>
      ) : null}
    </div>
  );
}

const BUTTON =
  "inline-flex items-center gap-1.5 rounded-full border border-zinc-100 bg-white px-4 py-2 text-sm font-semibold text-zinc-600 hover:border-orange-200 hover:text-orange-600 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:outline-none";

function XIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-3.5"
    >
      <path d="M18.9 2H22l-6.8 7.8L23 22h-6.3l-4.9-6.4L6.2 22H3l7.3-8.3L2.3 2h6.4l4.4 5.9L18.9 2Zm-1.1 18h1.7L7.3 3.8H5.5L17.8 20Z" />
    </svg>
  );
}

function NaverIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-3.5"
    >
      <path d="M3 3h5.9l5.4 8.1V3H21v18h-5.9l-5.4-8.1V21H3V3Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-3.5"
    >
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
    </svg>
  );
}
