"use client";

import Image from "next/image";
import { useState } from "react";

import { avatarGradient, avatarInitial } from "@/features/blog/avatar";

/**
 * 익명 프로필 아바타.
 *
 * 백엔드가 캐릭터 이미지(avatarImageUrl)를 주면 그것을 쓰고, 없거나 불러오지
 * 못하면 avatarSeed로 만든 그라디언트 원에 닉네임 글자를 얹는다. 이미지가 S3에
 * 없을 때 익명 요청은 404가 아니라 403으로 떨어지므로, 상태 코드로 분기하지 않고
 * onError 한 곳에서 폴백한다. 댓글 목록과 작성 폼이 같은 모양을 그려야 해서
 * 한 곳에 둔다.
 */
export function BlogAvatar({
  nickname,
  avatarSeed,
  avatarImageUrl,
  className = "size-9",
}: {
  nickname: string;
  avatarSeed: string;
  avatarImageUrl: string | null;
  className?: string;
}) {
  const [hasImageFailed, setHasImageFailed] = useState(false);

  if (avatarImageUrl && !hasImageFailed) {
    return (
      <Image
        src={avatarImageUrl}
        alt=""
        aria-hidden
        width={36}
        height={36}
        unoptimized
        onError={() => setHasImageFailed(true)}
        className={`${className} shrink-0 rounded-full bg-orange-50 object-cover`}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={`${className} grid shrink-0 place-items-center rounded-full text-sm font-bold text-white`}
      style={{ backgroundImage: avatarGradient(avatarSeed) }}
    >
      {avatarInitial(nickname)}
    </span>
  );
}
