import {
  isBlogMockEnabled,
  mockSubscribeNewsletter,
} from "@/features/blog/mock/blog-mock-api";
import { apiFetch } from "@/lib/api/client";
import type { ApiEnvelope } from "@/types/api";
import type {
  NewsletterSubscribeResult,
  RawNewsletterSubscribeResult,
} from "@/types/blog";

/**
 * 뉴스레터를 구독한다(docs/blog.md 10.2).
 *
 * 신규 구독과 이미 구독 중인 이메일은 같은 성공 응답으로 처리한다. 특정 이메일의
 * 구독 여부가 응답 차이로 드러나지 않게 하기 위한 것으로, 서버가 어떤 문구를
 * 주든 프론트는 그대로 보여준다.
 */
export async function subscribeNewsletter({
  email,
  consent,
}: {
  email: string;
  consent: boolean;
}): Promise<NewsletterSubscribeResult> {
  if (isBlogMockEnabled()) {
    return { message: (await mockSubscribeNewsletter()).message };
  }

  const { result } = await apiFetch<ApiEnvelope<RawNewsletterSubscribeResult>>(
    "/api/newsletter/subscribe",
    {
      method: "POST",
      body: JSON.stringify({ email: email.trim().toLowerCase(), consent }),
    },
  );

  return { message: result.message };
}
