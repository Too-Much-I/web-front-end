/* Static crops from public/ are served unchanged, same as the main landing. */
/* eslint-disable @next/next/no-img-element */
import type { MobilePlatform } from "@/lib/mobile-platform";

import { InviteCoupon } from "./invite-coupon";
import { InviteStoreBar } from "./invite-store-bar";
import "./invite.css";

/**
 * 친구 초대 페이지. 휴대폰이면 하단 고정 스토어 버튼, 노트북이면 그 자리에 QR을 둔다.
 *
 * 화면 폭이 좁아지면 내용을 덜어낸다: 1024 미만은 1단으로 접히고, 768 미만은 앱 화면
 * 섹션과 반짝이 장식이 빠져 제목·토끼·추천 코드·버튼만 남는다(invite.css).
 *
 * 추천 코드 쿠폰은 넓은 화면에선 제목 아래 왼쪽 칸, 좁은 화면에선 패널 아래에 오도록
 * 두 자리에 렌더하고 CSS로 하나만 보인다.
 */
export function InviteLanding({
  code,
  platform,
}: {
  code: string | null;
  platform: MobilePlatform | null;
}) {
  const isDesktop = platform === null;

  const invite = (slot: "wide" | "narrow") =>
    code ? (
      <InviteCoupon
        code={code}
        isDesktop={isDesktop}
        className={`invite invite-${slot}`}
      />
    ) : (
      <p className={`invite invite-${slot} hint`}>
        친구에게 받은 추천 코드를 가입할 때 입력해 주세요
      </p>
    );

  const qr = isDesktop ? (
    <div className="qr">
      <img
        src="/qr/download-app.svg"
        width="104"
        height="104"
        alt="토선생 앱 다운로드 QR 코드"
      />
      <div>
        <strong>휴대폰 카메라로 찍어주세요</strong>
        <p>
          바로 스토어로 이동해요.
          {code && " 앱을 받은 뒤 가입할 때 위 코드를 입력해 주세요."}
        </p>
      </div>
    </div>
  ) : null;

  return (
    <div className={isDesktop ? "invite-page is-desktop" : "invite-page"}>
      <svg aria-hidden="true" className="invite-sprite">
        <defs>
          <symbol id="invite-apple" viewBox="0 0 24 24">
            <path d="M17.1 12.3c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.5-.2-2.8.9-3.5.9-.8 0-1.9-.9-3.1-.9-1.6 0-3.1 1-3.9 2.4-1.7 2.9-.4 7.3 1.2 9.7.8 1.1 1.7 2.3 2.9 2.3 1.1-.1 1.6-.8 3-.8 1.4 0 1.8.8 3 .8s2-1.1 2.8-2.2c.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.3-.9-2.3-4.2ZM14.8 5.5c.7-.9 1.2-2.1 1.1-3.3-1 .1-2.3.7-3 1.6-.6.7-1.2 2-1.1 3.1 1.2.1 2.3-.6 3-1.4Z" />
          </symbol>
          <symbol id="invite-play" viewBox="0 0 24 24">
            <path d="m3.7 2.4 10.8 9.5L3.7 21.5c-.4-.3-.7-.8-.7-1.5V4c0-.7.3-1.3.7-1.6ZM15.6 10.9 6 2.4l12.2 6.9-2.6 1.6Zm1.1 1 3.3-1.8c1.5.8 1.5 2.8 0 3.6l-3.3-1.8Zm-1.1 1.1 2.6 1.5L6 21.4l9.6-8.4Z" />
          </symbol>
          <symbol id="invite-sparkle" viewBox="0 0 24 24">
            <path d="M12 0c.6 6.3 5.7 11.4 12 12-6.3.6-11.4 5.7-12 12-.6-6.3-5.7-11.4-12-12C6.3 11.4 11.4 6.3 12 0Z" />
          </symbol>
        </defs>
      </svg>

      <section className="hero">
        <div className="hero-inner">
          <div className="topline">
            <span className="brand">
              <img src="/download-landing/logo.webp" alt="" />
              토선생
            </span>
          </div>

          <div className="copy-col">
            <span className="tag">친구 초대</span>
            <h1>
              친구랑 같이
              <br />
              <em>응시권 1장</em> 받아가세요
            </h1>
            <p className="lede">
              토익스피킹 AI 모의고사 앱, 토선생에
              <br />
              친구가 초대했어요.
            </p>
            {invite("wide")}
            {qr && <div className="qr-wide">{qr}</div>}
          </div>

          <span className="star s1" aria-hidden="true">
            <svg>
              <use href="#invite-sparkle" />
            </svg>
          </span>
          <span className="star s2" aria-hidden="true">
            <svg>
              <use href="#invite-sparkle" />
            </svg>
          </span>
          <span className="star s3" aria-hidden="true">
            <svg>
              <use href="#invite-sparkle" />
            </svg>
          </span>

          <div className="rabbit">
            <img
              src="/mascots/laptop_rabbit.webp"
              width="656"
              height="720"
              alt=""
              fetchPriority="high"
            />
          </div>
        </div>
      </section>

      <section className="below">
        {invite("narrow")}
        {qr && <div className="qr-narrow">{qr}</div>}
      </section>

      <section className="feature" aria-labelledby="invite-feature-title">
        <div className="feature-inner">
          <div className="phone">
            <img
              src="/download-landing/feedback.webp"
              width="780"
              height="1536"
              alt="토선생 파트별 피드백 화면"
              loading="lazy"
            />
          </div>
          <div>
            <span className="tag soft">응시권 1장으로</span>
            <h2 id="invite-feature-title">
              어디가 부족한지,
              <br />
              <em>파트별로 짚어줘요</em>
            </h2>
            <p>
              점수만 보고 끝나지 않아요. 파트마다 잘한 점과 고칠 점을 알려주고,
              문항을 누르면 상세 피드백으로 이어져요.
            </p>
          </div>
        </div>
      </section>

      {platform && <InviteStoreBar platform={platform} code={code} />}
    </div>
  );
}
