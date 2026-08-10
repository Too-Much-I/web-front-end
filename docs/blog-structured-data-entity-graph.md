# 구조화 데이터 엔티티 그래프

`docs/blog.md` 13.3의 "사이트 전체: Organization" 요구사항을 구현하면서 정한 규약이다.
게시글 낱개의 `BlogPosting`만 있던 상태에서, 발행 주체와 블로그라는 묶음을 엔티티로
선언하고 서로 잇는 것이 목적이다.

## 왜 필요했나

기존에는 각 글이 "나는 BlogPosting이다"라고만 말했다. 이러면 소비자가 얻는 정보는 "글이
여러 개 있다"까지고, 다음 두 가지가 빠진다.

- **발행 주체가 엔티티로 존재하지 않는다.** `publisher`에 이름 문자열만 있어서, 여러 글에
  흩어진 언급이 하나의 조직으로 누적되지 않는다. 외부 채널(인스타·X·유튜브)과 같은
  실체라는 연결고리도 없다.
- **블로그라는 묶음이 선언되지 않는다.** 이 사이트가 블로그를 운영한다는 진술이 어디에도
  없어, 콘텐츠 허브가 아니라 개별 문서의 나열로 읽힌다.

## `@id` 규약

```
Organization  https://to-teacher.com/#organization
WebSite       https://to-teacher.com/#website
Blog          https://to-teacher.com/blog#blog
BlogPosting   https://to-teacher.com/blog/{slug}#article
```

`@id`는 "이 URI가 가리키는 것"을 뜻한다. 그래서 조직과 사이트에 같은 URI를 주면 소비자가
블록들을 하나의 그래프로 합칠 때 **두 노드가 병합되어** `name`·`logo`·`publisher`가 뒤섞이고,
사이트가 자기 자신의 발행자가 되는 식으로 뜻이 무너진다. 문서 URL과도 구분해야 하므로
(`https://to-teacher.com/`은 홈페이지라는 *문서*지 조직이 아니다) 프래그먼트로 서로 다른
URI를 만든다.

프래그먼트를 쓰는 이유는 두 가지다. 소유한 도메인 아래라서 식별자에 대한 권한이 증명되고,
프래그먼트는 서버로 전송되지 않으므로 그 경로를 만들 필요가 없다.

`@id`를 생략해도 문법상 유효하지만 이름 없는 노드가 되어 다른 페이지에서 참조할 수 없다.
페이지마다 별개의 조직이 하나씩 생기는 셈이라 언급이 쌓이지 않는다.

## 그래프 구조

```
BlogPosting ──isPartOf──> Blog ──isPartOf──> WebSite ──publisher──> Organization
     │                      │                                            ^
     └──────publisher───────┴────────────────────────────────────────────┘
```

`Organization`과 `WebSite`는 루트 레이아웃에서 **모든 페이지에** 싣는다. 소비자는 한 페이지
안의 블록들만 하나의 그래프로 합치므로, 하위 페이지의 `@id` 참조가 항상 같은 문서에서
풀려야 하기 때문이다.

## 개별 결정

- **`Blog`는 `/blog`에만 넣는다.** `/blog/page/2` 이후에 같은 `@id`를 반복하면 어느 문서가 그
  엔티티를 대표하는지 흐려진다. `blogPost`에는 첫 페이지 글만 싣는다 — 화면 렌더링에 이미
  가져온 목록이라 추가 요청이 없고, 전체 목록은 sitemap이 담당한다.
- **`BlogPosting.publisher`는 인라인 객체를 유지한 채 `@id`만 덧붙였다.** 참조만 남기는 편이
  깔끔하지만 참조를 해석하지 않는 단순 파서에서 발행자 정보가 사라진다. 기존 동작을 그대로
  두면서 링크만 얻는 쪽이 손해가 없다.
- **`author`에는 `@id`를 붙이지 않는다.** `authorName`은 글마다 다를 수 있는데 조직 식별자를
  함께 주면 "그 조직의 이름이 곧 이 작성자명"이 되어, 발행 주체의 이름이 글마다 달라지는
  모순이 생긴다.
- **`WebSite.potentialAction`(SearchAction)은 넣지 않았다.** `/blog/search?q=`가 있어 선언할 수는
  있지만, 이것이 만들던 Google 사이트링크 검색창은 2023년 11월에 지원이 종료되어 지금은
  어디에도 나타나지 않는다.

## `<JsonLd>` 컴포넌트

`src/components/json-ld.tsx`. 블록이 늘면서 호출부마다 `serializeJsonLd`를 기억해야 하는
구조는 언젠가 하나를 빠뜨린다(실제로 `faq-section.tsx`가 이스케이프 없이 `JSON.stringify`를
쓰고 있었다). 컴포넌트로 감싸 우회할 수 없게 했다.

`dangerouslySetInnerHTML`을 쓰는 것은 JSX 자식으로 넣으면 React가 `<`·`>`·`&`를 HTML
엔티티로 바꾸는데 `<script>` 내부는 raw text라 브라우저가 되돌리지 않아 JSON이 깨지기
때문이다. 이스케이프 근거는 `src/lib/json-ld.ts`의 `serializeJsonLd` 주석에 있다.

## sameAs

`src/lib/site-config.ts`의 `SITE_SOCIAL_URLS`에서만 관리한다. `sameAs`는 "여기에 콘텐츠가
있다"가 아니라 "이 계정의 주인이 우리다"라는 신원 주장이므로, 아직 영상이 없는 유튜브
채널도 포함한다. 앱 출시 후 앱스토어·플레이스토어 주소를 이 배열에 추가하면 구조화
데이터에 함께 반영된다.

## llms.txt

`src/app/llms.txt/route.ts`. [llmstxt.org](https://llmstxt.org) 규약(H1 → 인용구 → H2 링크 목록)을
따르고, sitemap·rss와 같은 `revalidate = 300`을 쓴다.

**아직 어느 주요 AI 업체도 공식 지원을 밝히지 않은 제안 단계의 규약이다.** 넣는 비용이 거의
없어 두지만, 색인·인용에 실제로 기여하는 것은 위의 구조화 데이터 쪽이라고 보는 편이 맞다.

## 검증

`pnpm build` 후 프리렌더된 HTML에서 블록을 파싱해 `@id`와 참조가 풀리는지 확인한다.

```bash
python3 -c "
import re, json
html = open('.next/server/app/blog.html', encoding='utf-8').read()
for m in re.findall(r'<script type=\"application/ld\+json\">(.*?)</script>', html, re.S):
    d = json.loads(m)
    print(d.get('@type'), d.get('@id'), d.get('isPartOf'))
"
```

배포 후에는 Google Rich Results Test와 Schema.org Validator로도 확인할 수 있다.
