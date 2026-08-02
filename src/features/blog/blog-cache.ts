/**
 * 블로그 페이지의 ISR 재검증 주기(초).
 *
 * 예약 발행(docs/blog.md 5.4)과 발행 15분 뒤 뉴스레터 자동 발송(11.2)을 고려해
 * 5분으로 둔다. 발행 스크립트에서 on-demand 재검증을 호출하게 되면 이 값은
 * 안전망 역할만 하므로 그때 늘려도 된다.
 *
 * ISR을 택한 이유와 재검증의 동작 방식은 docs/blog-isr-rendering-strategy.md 참고.
 *
 * 주의: 라우트의 `export const revalidate`에는 이 상수를 쓸 수 없다. 세그먼트
 * 설정은 빌드 타임에 정적으로 분석되므로 리터럴이어야 한다. 각 라우트에는 300을
 * 직접 적고, 이 상수는 fetch의 `next.revalidate` 옵션에만 쓴다. 값을 바꿀 때는
 * 양쪽을 함께 고쳐야 한다.
 */
export const BLOG_REVALIDATE_SECONDS = 300;
