import {
  SITE_ALTERNATE_NAME,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_SOCIAL_URLS,
  SITE_URL,
} from "@/lib/site-config";

/**
 * 구조화 데이터를 `<script>` 안에 넣을 수 있는 문자열로 만든다.
 *
 * JSON.stringify 결과를 그대로 넣으면, 값에 `</script>`가 섞였을 때 스크립트
 * 블록이 그 자리에서 닫히고 뒤쪽이 HTML로 해석된다. 게시글 제목·설명·작성자명은
 * 백엔드에서 오고 본문과 달리 sanitize를 거치지 않으므로, `<`를 유니코드
 * 이스케이프로 바꿔 태그가 만들어질 여지를 없앤다. JSON 파서는 `<`를 `<`로
 * 되돌려 읽으므로 구조화 데이터의 의미는 바뀌지 않는다.
 *
 * `</script`뿐 아니라 `<!--`, `<script`도 HTML 토크나이저의 상태를 바꿔 블록을
 * 일찍 끝낼 수 있는데, `<`를 전부 없애면 이 셋이 한꺼번에 사라진다. JSON.stringify
 * 출력에서 `<`는 문자열 리터럴 안에만 나올 수 있으므로(구조 문자는 `{}[]:,"`와
 * 공백뿐) 전체에 치환을 걸어도 JSON 문법은 깨지지 않는다.
 *
 * 직접 부르는 대신 `<JsonLd>`(src/components/json-ld.tsx)를 쓴다. 호출부마다
 * 이스케이프를 기억해야 하는 구조는 블록이 늘면 언젠가 빠뜨린다.
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

/**
 * 엔티티 식별자.
 *
 * `@id`는 "이 URI가 가리키는 것"을 뜻한다. 조직과 사이트에 같은 URI를 주면 소비자가
 * 여러 블록을 하나의 그래프로 합칠 때 두 노드가 병합되어, 사이트가 자기 자신의
 * 발행자가 되는 식으로 뜻이 무너진다. 문서 URL과도 구분해야 하므로 프래그먼트로
 * 서로 다른 URI를 만든다. 프래그먼트는 서버로 전송되지 않으니 라우트는 필요 없다.
 *
 * `@id`를 생략하면 문법상 유효하지만 이름 없는 노드가 되어 다른 페이지에서 참조할 수
 * 없다. 페이지마다 별개의 조직이 하나씩 생기는 셈이라 언급이 한 엔티티로 쌓이지 않는다.
 */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** 발행 주체. 루트 레이아웃에서 모든 페이지에 실어 다른 블록의 `@id` 참조가 항상 풀리게 한다. */
export const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: SITE_NAME,
  alternateName: SITE_ALTERNATE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/logo.png`,
  },
  sameAs: [...SITE_SOCIAL_URLS],
};

/**
 * 사이트 자체.
 *
 * `potentialAction: SearchAction`은 넣지 않는다. `/blog/search?q=`가 있어 선언할 수는
 * 있지만, 이것이 만들던 Google 사이트링크 검색창은 2023년 11월에 지원이 종료되어
 * 지금은 어디에도 나타나지 않는다.
 */
export const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "ko-KR",
  publisher: { "@id": ORGANIZATION_ID },
};
