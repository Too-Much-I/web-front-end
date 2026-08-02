import { apiFetch } from "@/lib/api/client";
import type { ApiEnvelope } from "@/types/api";
import type { NewsletterStatusResult, RawNewsletterStatus } from "@/types/blog";

/**
 * 뉴스레터를 구독한다(POST /api/newsletter/subscribe).
 *
 * 신규 구독과 이미 구독 중인 이메일은 같은 성공 응답으로 처리한다. 특정 이메일의
 * 구독 여부가 응답 차이로 드러나지 않게 하기 위한 것으로, 서버가 어떤 문구를
 * 주든 프론트는 그대로 보여준다. 상태(`result.status`)와 달리 사용자에게 보여줄
 * 안내 문구는 봉투의 `message`에 담겨 온다.
 */
export async function subscribeNewsletter({
  email,
  consent,
}: {
  email: string;
  consent: boolean;
}): Promise<NewsletterStatusResult> {
  const { result, message } = await apiFetch<ApiEnvelope<RawNewsletterStatus>>(
    "/api/newsletter/subscribe",
    {
      method: "POST",
      body: JSON.stringify({ email: email.trim().toLowerCase(), consent }),
    },
  );

  return { status: result?.status ?? "", message };
}

/**
 * 뉴스레터 구독을 해지한다(POST /api/newsletter/unsubscribe).
 *
 * 이메일이 아니라 발송 메일의 해지 링크에 담긴 토큰으로 식별한다. 이메일을 받으면
 * 남의 주소를 임의로 해지할 수 있기 때문이다.
 */
export async function unsubscribeNewsletter({
  token,
}: {
  token: string;
}): Promise<NewsletterStatusResult> {
  const { result, message } = await apiFetch<ApiEnvelope<RawNewsletterStatus>>(
    "/api/newsletter/unsubscribe",
    {
      method: "POST",
      body: JSON.stringify({ token }),
    },
  );

  return { status: result?.status ?? "", message };
}
