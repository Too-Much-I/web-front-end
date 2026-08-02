# SEO 블로그(`/blog`) 프론트엔드 설계

작성일: 2026-07-29

> 요구사항의 정본은 `docs/blog.md`(토선생 블로그 MVP 요구사항 v1.0)다. 이 문서는
> 그 요구사항을 프론트엔드에서 어떻게 구현했는지를 정리한다. 라우트 분리와
> 렌더링 전략의 근거는 `docs/blog-search-route-separation.md`에 따로 있다.

## 1. 배경과 목적

검색 유입을 늘리기 위해 별도 도메인이 아니라 `to-teacher.com/blog` 서브디렉터리에
블로그를 둔다. 기존 도메인이 쌓은 신뢰도를 그대로 쓰기 위해서다.

블로그는 랜딩과 같은 사이트로 보여야 한다. 새 색상 체계나 레이아웃 언어를 만들지
않고 랜딩(`src/app/page.tsx`)과 가이드(`GuidePageLayout`)의 시각 언어를 확장했다.
오렌지 500/600 액센트, blue-950 헤딩, `bg-orange-50/40` 바탕, `rounded-3xl` 화이트
카드 + `shadow-sm`.

승인된 UI 시안: `docs/superpowers/specs/assets/2026-07-29-blog-ui.html`

## 2. 구현 범위

**포함** — 글 목록, 크롤러용 페이지네이션, 검색, 글 상세(마크다운 본문·읽기
진행률·읽는 시간·링크 복사), 익명 댓글, 관련 글, 뉴스레터 구독 폼,
메타데이터·구조화 데이터·sitemap·RSS.

**제외** — 카테고리와 태그(사용자 결정), 목차 사이드바, 댓글 수정·삭제·대댓글,
관리자 화면과 `/internal` API, 뉴스레터 발송 스케줄러(백엔드 영역).

`docs/blog.md` 3.1은 공유를 "링크 복사 형태의 간단한 공유"로 한정했지만, 이후
SNS 공유를 함께 넣기로 결정해 X·네이버·페이스북과 네이티브 공유를 추가했다.

## 3. 데이터 소스

글과 댓글 모두 기존 백엔드(`NEXT_PUBLIC_API_BASE_URL`)를 쓴다. 레포 내 MDX나 외부
CMS는 쓰지 않는다. 프론트 규약은 이 레포의 기존 패턴을 따른다.

- `apiFetch`(`src/lib/api/client.ts`)로 호출하고 `ApiEnvelope<T>`를 벗긴다.
- 와이어 타입은 `Raw*` 접두사로 `src/types/blog.ts`에 두고,
  `map-blog-post.ts` / `map-blog-comment.ts`에서 도메인 타입으로 변환한다.
- 컴포넌트는 `Raw*` 타입을 직접 소비하지 않는다.

### 3.1 사용하는 엔드포인트

| 용도          | 경로                                           |
| ------------- | ---------------------------------------------- |
| 글 목록       | `GET /api/posts?page=&size=`                   |
| 글 상세       | `GET /api/posts/{slug}`                        |
| 제목 검색     | `GET /api/posts/search?q=&page=&size=`         |
| 댓글 조회     | `GET /api/posts/{slug}/comments?cursor=&size=` |
| 댓글 작성     | `POST /api/posts/{slug}/comments`              |
| 닉네임 재발급 | `POST /api/comments/nickname/regenerate`       |
| 닉네임 조회   | `GET /api/comments/nickname`                   |
| 뉴스레터 구독 | `POST /api/newsletter/subscribe`               |

**닉네임 조회는 `docs/blog.md` 15.2의 API 목록에 없다.** 닉네임과 아바타를 서버가
결정하는 구조(8.5)에서 작성 폼이 내 표시 정보를 보여주려면 조회 수단이 필요하므로,
백엔드에 추가를 요청해야 한다.

응답은 다른 연동과 마찬가지로 `ApiEnvelope<T>`로 감싸져 온다고 가정했다.
`docs/blog.md`의 응답 예시에는 봉투가 없는데, 실제 형태가 다르면 매퍼에서 흡수한다.

댓글 관련 요청은 `credentials: "include"`로 보낸다. 익명 식별용 `anon_session`
쿠키가 HttpOnly이고 백엔드가 다른 오리진이기 때문이며, 백엔드 CORS도 credentials를
허용해야 동작한다.

## 4. 라우트와 렌더링

| 경로                       | 렌더링                          | 색인              |
| -------------------------- | ------------------------------- | ----------------- |
| `/blog`                    | 정적 + ISR 5분                  | `index, follow`   |
| `/blog/page/[page]`        | SSG + `dynamicParams`           | `index, follow`   |
| `/blog/[slug]`             | SSG + `dynamicParams` + ISR 5분 | `index, follow`   |
| `/blog/search`             | 동적                            | `noindex, follow` |
| `/rss.xml`, `/sitemap.xml` | 정적 + ISR 5분                  | —                 |

검색만 동적인 이유와 페이지네이션을 `?page=`가 아니라 경로로 둔 이유는
`docs/blog-search-route-separation.md`에 있다. SSR·CSR이 아니라 ISR을 택한 이유와
재검증이 런타임에 실제로 하는 일은 `docs/blog-isr-rendering-strategy.md`에 있다.

`revalidate`는 세그먼트 설정이라 정적으로 분석돼야 하므로 각 라우트에 리터럴
`300`을 직접 적는다. `BLOG_REVALIDATE_SECONDS`는 fetch의 `next.revalidate`
옵션에만 쓴다. 값을 바꿀 때 양쪽을 함께 고쳐야 한다.

### 4.1 백엔드 장애 시 동작

목록 페이지는 ISR로 프리렌더되므로 조회 실패를 그대로 던지면 빌드가 깨지고 배포
후에는 500이 된다. `getBlogPostsSafe`가 실패를 `null`로 바꾸고
`BlogListUnavailable` 안내를 대신 렌더링해, 다음 재검증에서 복구되도록 했다.
`generateStaticParams`도 실패 시 빈 배열을 반환해 빌드를 통과시킨다.

존재하지 않는 페이지 번호나 slug는 404지만, 백엔드 장애는 404로 처리하지 않는다.

## 5. 화면

### 5.1 목록 `/blog`

히어로(eyebrow + h1 + 설명) → 검색창 → 카드 그리드 → 뉴스레터 구독 폼.

카드는 `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`. 썸네일 16:9, 작성자·발행일,
제목 2줄 클램프, 요약 2줄 클램프. 썸네일이 없는 글은 slug에서 결정론적으로 고른
브랜드 계열 그라디언트를 대신 그린다.

**그라디언트 선택이 랜덤이 아니라 결정론적인 것은 의도다.** slug를 해시해
후보 중 하나를 고르므로 같은 글은 언제 어디서 렌더해도 같은 색이 나온다.
`Math.random()`을 쓰면 서버 렌더와 클라이언트 렌더의 결과가 달라 하이드레이션이
깨지고, 재방문할 때마다 색이 바뀌어 사용자가 카드를 시각적으로 기억할 수 없다.
같은 기법을 익명 댓글 아바타(`avatar.ts`)에도 쓴다. 둘 다 이미지 자산이나 CDN
없이 시각적 다양성을 만들기 위한 것이다.

무한 스크롤은 `IntersectionObserver`로 다음 페이지를 이어 붙이고, 실패하면 자동
재시도 대신 "다시 시도" 버튼을 보여준다. 하단의 다음 페이지 링크는 크롤 경로이므로
항상 DOM에 남긴다.

### 5.2 상세 `/blog/[slug]`

본문 폭 `max-w-2xl`(약 65자). 구성은 `docs/blog.md` 4.2의 상세 페이지 목록을 따른다.

상단 고정 진행률 바 → 메타(작성자·발행일·읽는 시간) → h1 → 요약 → 공유 →
커버 이미지 → 본문 → 최종 수정일 → 모의고사 CTA → 관련 글(12.1, 제목은
"같이 읽으면 좋은 글") → 댓글 → 뉴스레터 구독.

4.2의 `출처`는 API에 대응하는 필드가 없어 넣지 않았다. 백엔드에 필드를 추가하거나
본문 마크다운에서 처리해야 한다.

16장의 콘텐츠 권장 구조(`H1 → 직접 답변 → 표/요약 → 상세 설명 → 사례 비교 → FAQ`)는
글쓴이가 마크다운 본문 안에서 지키는 규약이라 레이아웃이 강제하지 않는다. 대신 그
구조가 들어왔을 때 제대로 보이도록 `.blog-prose`에 h2·h3·표·인용·목록·코드 스타일을
모두 정의해 뒀다.

공유는 링크 복사, X, 네이버, 페이스북, 그리고 지원되는 환경에서만 나타나는 네이티브
공유(Web Share API)로 구성했다. **카카오톡 공유 버튼은 없다** — Kakao JavaScript
SDK와 앱 키가 필요하기 때문이다. 모바일에서는 네이티브 공유 시트가 카카오톡을 포함해
설치된 앱을 모두 띄워주므로 실질적인 공백은 크지 않다. 전용 버튼이 필요하면 앱 키를
발급받아 SDK를 붙여야 한다.

네이티브 공유 지원 여부는 `useSyncExternalStore`로 읽는다. effect에서 setState하면
하이드레이션 직후 한 번 더 렌더링되고, 이 레포의 lint 규칙이 이를 막는다.

본문은 `content_markdown`을 `marked`로 변환한 뒤 `sanitize-html`로 거른다. 등록
단계 검증과 별개로 렌더링 시점에도 sanitize하라는 `docs/blog.md` 6.3을 따른 것이다.
서버 컴포넌트에서만 호출해 클라이언트 번들에 들어가지 않게 한다. 본문 타이포그래피는
`globals.css`의 `.blog-prose`에 태그 단위로 정의했다(주입된 마크업이라 유틸리티
클래스를 붙일 수 없다).

읽는 시간은 API에 없어 본문 길이로 어림한다(한국어 기준 분당 500자). 요약만 있는
목록 카드에서는 쓰지 않는다.

### 5.3 검색 `/blog/search`

검색창은 목록과 검색 결과 양쪽에 있고, 제출하면 `/blog/search?q=`로 이동한다.
2자 미만이면 클라이언트에서 막고, 결과가 없으면 최신 글 3개를 대신 보여준다.
페이지네이션은 실제 `<a>` 링크다.

## 6. 댓글

닉네임과 아바타는 사용자가 입력하지 않는다. 서버가 `anon_session` 쿠키를 기준으로
정해준 값을 받아 보여주기만 하고, "다시 뽑기"도 서버에 재발급을 요청한다. 아바타는
이미지가 아니라 `avatarSeed`를 해시해 고른 그라디언트 원 + 명사 첫 글자라, 별도
이미지 자산이 필요 없다.

정책상 작성만 가능하다. 수정·삭제·대댓글·좋아요 UI가 존재하지 않고, 작성 폼과 등록
확인 다이얼로그 양쪽에 수정·삭제 불가를 명시한다. 500자 카운터와 허니팟 필드
(`website`)를 두고, 스팸 방어의 본체(레이트 리밋, URL 차단, `PENDING` 처리)는
백엔드에 맡긴다.

댓글은 클라이언트에서 조회한다. SEO에 기여하지 않고, ISR로 캐시되는 본문과 수명이
정반대이기 때문이다. 서버 컴포넌트에서 함께 페치하면 상세 페이지 전체가 동적으로
전환되거나 캐시 시점의 댓글이 박제된다.

## 7. SEO

- 글마다 `generateMetadata`로 title / description / canonical / OpenGraph
  (`type: "article"`, `publishedTime`, `modifiedTime`)를 설정한다.
  `seo_title` / `seo_description`이 비면 `title` / `summary`로 대체한다.
- 상세 페이지에 `BlogPosting`과 `BreadcrumbList` JSON-LD를 넣는다. 댓글은 포함하지
  않는다.
- `sitemap.xml`은 공개 글 전체를 담기 위해 마지막 페이지까지 따라가 모은다
  (`fetchAllBlogPosts`). 상한 50배치를 둬 무한정 길어지지 않게 했다.
- `/rss.xml`을 제공하고 목록 페이지 metadata에서 `alternates.types`로 연결한다.
- `robots.txt`는 `/blog`를 막지 않는다. 검색 결과는 robots.txt로 차단하지 않고
  메타 `noindex`로 처리한다 — 차단하면 크롤러가 `noindex`를 볼 수 없다.

## 8. 파일 구조

```
src/app/blog/page.tsx                   목록
src/app/blog/page/[page]/page.tsx       크롤러용 페이지네이션
src/app/blog/search/page.tsx            검색 결과
src/app/blog/[slug]/page.tsx            상세
src/app/rss.xml/route.ts                RSS 피드
src/app/sitemap.ts                      (확장) 블로그 글 포함

src/components/layout/site-header.tsx   가이드와 공유하는 헤더
src/components/layout/site-footer.tsx   가이드와 공유하는 푸터
src/components/blog/                    블로그 전용 UI 12개 컴포넌트

src/features/blog/api/                  엔드포인트 5개 모듈
src/features/blog/map-blog-post.ts      Raw* → 도메인
src/features/blog/map-blog-comment.ts
src/features/blog/render-markdown.ts    마크다운 → sanitize된 HTML
src/features/blog/blog-format.ts        날짜·상대시간·읽는 시간
src/features/blog/avatar.ts             seed → 그라디언트/이니셜
src/features/blog/blog-json-ld.ts       구조화 데이터
src/features/blog/blog-cache.ts         재검증 주기 상수
src/features/blog/fetch-all-blog-posts.ts  sitemap·RSS 전용 전체 수집

src/types/blog.ts                       Raw* + 도메인 타입
```

헤더와 푸터를 `src/components/layout/`으로 뽑고 `GuidePageLayout`도 이를 쓰도록
바꿨다. 랜딩 헤더는 섹션 스크롤 링크와 sticky 동작이 달라 그대로 뒀다.

## 9. 남은 과제

- 백엔드에 블로그 API가 아직 없다. 현재 `/api/posts`는 404이며, 그 상태에서도
  빌드는 통과하고 목록에는 안내 문구가 나온다.
- 닉네임 조회(`GET /api/comments/nickname`) 엔드포인트를 백엔드와 합의해야 한다.
- 발행 스크립트에서 호출할 on-demand 재검증 엔드포인트는 백엔드 발행 흐름이
  확정된 뒤 추가한다.
- `docs/blog.md` 17장의 분석 이벤트(`blog_post_view`, `blog_cta_click` 등)는 아직
  붙이지 않았다. 기존 `src/lib/analytics.ts` 패턴에 맞춰 별도 작업으로 다룬다.
- 카카오톡 공유 전용 버튼은 Kakao JavaScript 앱 키가 확보되면 추가한다.
- 4.2의 `출처` 필드를 백엔드 응답에 추가할지 결정해야 한다.
