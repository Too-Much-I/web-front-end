"use client";

import { copyReferralCode } from "@/features/invite/copy-referral-code";
import { trackEvent } from "@/lib/analytics";
import type { MobilePlatform } from "@/lib/mobile-platform";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/site-config";

const STORES = {
  ios: {
    url: APP_STORE_URL,
    name: "App Store",
    icon: "#invite-apple",
    event: "app_store",
  },
  android: {
    url: PLAY_STORE_URL,
    name: "Google Play",
    icon: "#invite-play",
    event: "play_store",
  },
} as const;

/**
 * 휴대폰 하단 고정 스토어 버튼. 접속한 기기의 스토어를 크게, 반대쪽은 작은 링크로 둔다.
 *
 * 스토어로 넘어가기 전에 추천 코드를 같이 복사해 둔다. 앱을 깔고 가입 화면에서
 * 붙여넣기만 하면 되도록. 복사 결과를 기다리지 않는 건 링크 이동을 막지 않기 위해서다.
 */
export function InviteStoreBar({
  platform,
  code,
}: {
  platform: MobilePlatform;
  code: string | null;
}) {
  const primary = STORES[platform];
  const other = STORES[platform === "ios" ? "android" : "ios"];

  function handlePrimaryClick() {
    trackEvent("invite_store_click", { store: primary.event });
    if (!code) return;
    void copyReferralCode(code).then((copied) => {
      if (copied)
        trackEvent("invite_code_copy", { copy_trigger: "store_button" });
    });
  }

  return (
    <div className="bar">
      <div className="bar-inner">
        <a
          className="store"
          href={primary.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${primary.name}에서 토선생 다운로드 (새 탭)`}
          onClick={handlePrimaryClick}
        >
          <svg aria-hidden="true">
            <use href={primary.icon} />
          </svg>
          <span>{code ? "코드 복사하고 앱 받기" : "앱 받기"}</span>
        </a>
        <p className="other">
          {platform === "ios" ? "Android는" : "iPhone은"}{" "}
          <a
            href={other.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent("invite_store_click", { store: other.event })
            }
          >
            {other.name}
          </a>
          에서 받을 수 있어요
        </p>
      </div>
    </div>
  );
}
