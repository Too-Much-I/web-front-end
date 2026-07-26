# 토익 스피킹 파트별 유형 가이드 페이지 설계

작성일: 2026-07-27

## 배경

현재 색인 가능한 공개 페이지는 `/`, `/contact`, `/terms`, `/privacy` 네 개뿐이다. 이 중 검색 유입을 만들 수 있는 건 랜딩 하나이고, 나머지는 유입 기대값이 0에 가깝다.

파트별 시험 형식 정보는 이미 `src/features/exam/part-directions.ts`에 있지만, 시험 흐름 안의 다이얼로그로만 노출된다. 다이얼로그는 고유 URL이 없어 색인 단위가 되지 못하고, `/exam/*`는 `src/app/robots.ts`에서 `Disallow` 처리돼 크롤러가 접근하지도 않는다.

따라서 같은 데이터를 재사용하되, 검색 유입용 공개 라우트를 별도로 만든다.

## 목표

- "토익 스피킹 파트", "토익스피킹 유형" 등 한국어 검색어로 유입될 수 있는 색인 가능한 페이지 1개 신설
- 검색으로 들어온 사람이 읽고 이해한 뒤 기존 `시작하기` 버튼으로 서비스에 진입할 수 있게 함
- 고아 페이지가 되지 않도록 헤더·푸터에서 내부 링크 연결

## 범위 밖 (Non-goals)

- 등급/점수 기준표 등 다른 가이드 페이지 — 이 페이지 성과를 보고 별도로 판단
- 파트별 상세 하위 페이지 분기
- 랜딩 본문 구조 변경, 새 CTA 배너·하단 CTA 섹션 추가
- 공통 `SiteHeader`/`SiteFooter` 추출 리팩터링 — 랜딩 헤더는 sticky + nav + 버튼 구성이라 형태가 달라, 이번 작업에 끼워 넣으면 랜딩까지 건드리게 된다. 별도 작업으로 미룬다.

## 라우트

`/guide/toeic-speaking-parts`

영문 슬러그를 쓴다. 구글에 주제 신호가 되고, 이후 `/guide/toeic-speaking-levels` 등으로 확장하기 좋다.

## 파일 구성

```
src/app/guide/toeic-speaking-parts/page.tsx   신규 — 서버 컴포넌트, metadata 포함
src/components/guide/guide-page-layout.tsx    신규 — 헤더/푸터 셸
src/features/guide/part-guide-content.ts      신규 — 한국어 해설 데이터
src/app/page.tsx                              수정 — 헤더 nav + 푸터에 링크 추가
src/app/sitemap.ts                            수정 — routes 배열에 경로 추가
```

### 데이터 분리 원칙

`part-guide-content.ts`는 파트별 **한국어 제목, 문항 번호, 준비/답변 시간, 요약 설명, 공략 한 줄**을 갖는다. 영어 지시문 원문은 새로 쓰지 않고 `EXAM_PART_DIRECTIONS`에서 `import`해 참조한다.

이유: 시험 로직용 데이터(`part-directions.ts`)에 SEO 문구를 섞으면 시험 화면과 가이드 페이지의 관심사가 뒤엉킨다. 원문은 단일 출처로 유지하고, 마케팅 성격의 한국어 카피만 새 파일이 갖는다.

`part-directions.ts`는 수정하지 않는다.

### `GuidePageLayout`

`src/components/legal/legal-page-layout.tsx`와 같은 "페이지 셸" 패턴을 따른다. `LegalPageLayout`을 재사용하지 않는 이유는 이름이 맞지 않고, `max-w-3xl` 고정이며, 헤더에 `ExamStartButton`이 없기 때문이다.

구조:

- 헤더: 로고(홈 링크) + `ExamStartButton`(`h-11`, 랜딩 헤더와 동일 스타일)
- `<main>`: `children`
- 푸터: 랜딩 푸터와 동일한 링크 구성 (이용약관 / 개인정보처리방침 / 문의하기 / 토익 스피킹 가이드)

가이드 페이지 헤더에는 nav 텍스트 링크를 넣지 않는다. 랜딩의 "서비스 소개"·"자주 묻는 질문"은 `ScrollToSectionLink` 기반 랜딩 내부 앵커라 다른 페이지에서 동작하지 않기 때문이다. `/contact`, `/terms`와 동일하게 로고 + 시작하기 버튼만 둔다.

## 페이지 구성

위에서 아래로:

| 블록           | 내용                                                                                               |
| -------------- | -------------------------------------------------------------------------------------------------- |
| 인트로         | eyebrow "토익 스피킹 가이드" / `h1` "토익 스피킹 파트별 유형 총정리" / 총 11문항·약 20분 요약 문단 |
| 한눈에 보기 표 | 파트 · 문항 번호 · 유형 · 준비 시간 · 답변 시간                                                    |
| 파트 카드 ×5   | 오렌지 번호 배지 + 한국어 유형명 + 시간 pill + 영어 지시문 인용 + 한국어 해설                      |

CTA 블록(중간 배너, 하단 CTA 섹션)은 만들지 않는다. 전환 경로는 헤더의 기존 `ExamStartButton` 하나로 충분하며, 정보성 페이지의 읽는 흐름을 끊지 않는 쪽을 택한다.

### 영어 지시문 노출 방식

파트 카드에 실제 시험의 영어 지시문 원문을 노출하되, **한국어 해설이 주가 되고 영어 원문은 보조**가 되도록 한다. 원문은 인용 블록(`border-l` + `text-zinc-500` + 작은 글씨)으로 감싸고, 그 위에 한국어 유형 설명을 먼저 배치한다.

이유: 영어 원문만 있으면 한국어 검색어에 걸리지 않아 페이지 목적을 달성하지 못한다. 반대로 원문을 빼면 "실전과 동일한 유형"이라는 서비스 메시지의 근거가 약해진다.

### 파트별 데이터 (원문에서 도출)

| 파트 | 문항 | 유형                                            | 준비                      | 답변                   |
| ---- | ---- | ----------------------------------------------- | ------------------------- | ---------------------- |
| 1    | 1–2  | Read a text aloud                               | 45초                      | 45초                   |
| 2    | 3–4  | Describe a picture                              | 45초                      | 30초                   |
| 3    | 5–7  | Respond to questions                            | 3초                       | 5·6번 15초 / 7번 30초  |
| 4    | 8–10 | Respond to questions using information provided | 정보 읽기 45초 + 준비 3초 | 8·9번 15초 / 10번 30초 |
| 5    | 11   | Express an opinion                              | 45초                      | 60초                   |

모든 값은 `EXAM_PART_DIRECTIONS`의 지시문 텍스트에서 확인된 값이다. 새로 지어내지 않는다.

## 브랜드 톤 · 스타일

기존 화면과 동일한 토큰만 사용하고 새 액센트 색을 도입하지 않는다.

- 배경 `bg-orange-50/40`, 카드 `rounded-3xl bg-white`
- 제목 `text-blue-950`, 강조 `text-orange-500` / `text-orange-600`
- 마스코트는 인트로에 `public/mascots/rabbit_teacher.png` 1개만 사용
- 반응형은 CLAUDE.md 규칙대로 `sm → md → lg → xl`을 함께 정의. 본문 래퍼는 `max-w-3xl lg:max-w-4xl xl:max-w-5xl` — 랜딩(`max-w-6xl`/`lg:max-w-7xl`)보다 좁게 잡아 읽기 폭을 확보한다
- 표는 `overflow-x-auto` 컨테이너로 감싸 페이지 자체가 가로 스크롤되지 않게 한다

## 색인 연결

- `src/app/sitemap.ts`의 `routes` 배열에 `/guide/toeic-speaking-parts` 추가 → 사이트맵에 자동 반영. Search Console 재제출은 불필요하나, 배포 후 URL 검사 → 색인 생성 요청을 한 번 눌러 발견을 앞당긴다
- `src/app/robots.ts`는 수정하지 않는다. `/guide/`는 이미 허용 범위다
- 페이지 `metadata`에 `title`, `description`, `openGraph`, `alternates.canonical` 지정
- 내부 링크: 랜딩 헤더 nav("문의하기" 앞)와 랜딩·가이드 푸터에 "토익 스피킹 가이드" 추가

랜딩 헤더 nav는 `hidden sm:flex`라 모바일에서는 보이지 않는다. 여기에 항목을 하나 더 넣으면 `sm`(640–767px) 구간에서 로고 + nav 4개 + 시작하기 버튼이 가로 폭을 넘기므로, 새 링크만 `hidden md:inline`으로 두어 `md` 이상에서만 노출한다. 기존 nav 항목의 표시 범위는 바뀌지 않는다.

`md` 미만에서의 진입 동선은 푸터 링크가 담당한다. 푸터 nav는 링크가 4개가 되면서 모바일 폭을 넘기므로 `flex-wrap justify-center`를 추가한다. 크롤러는 DOM에 존재하면 읽으므로 어느 쪽이든 SEO에는 영향이 없다.

## 검증

이 저장소에는 테스트 프레임워크가 없다. 다음으로 확인한다.

- `npx tsc --noEmit`, `pnpm lint`, `pnpm format:check` 통과
- 개발 서버에서 `/guide/toeic-speaking-parts` 렌더 확인 (모바일 · 데스크톱 폭)
- 헤더 `시작하기` 버튼이 랜딩과 동일하게 모드 선택 다이얼로그를 여는지 확인
- 랜딩 헤더 nav · 푸터에서 가이드 페이지로 이동되는지 확인
- 빌드 후 `/sitemap.xml`에 새 URL이 포함되는지 확인
