import { serializeJsonLd } from "@/lib/json-ld";

/**
 * 구조화 데이터 `<script>` 블록.
 *
 * `dangerouslySetInnerHTML`을 쓰는 이유는 JSX 자식으로 넣으면 React가 `<`, `>`, `&`를
 * HTML 엔티티로 바꾸는데, `<script>` 내부는 raw text라 브라우저가 엔티티를 되돌리지
 * 않아 JSON이 그대로 깨지기 때문이다. 대신 이스케이프 책임을 이 한 곳에 모아 호출부가
 * `serializeJsonLd`를 빠뜨릴 수 없게 한다.
 *
 * `type`이 JavaScript MIME 타입이 아니므로 브라우저는 내용을 실행하지 않고 데이터
 * 블록으로 둔다. 읽는 쪽은 크롤러·파서 같은 외부 소비자다.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
