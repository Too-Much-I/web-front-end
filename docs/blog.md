# 토선생 블로그 MVP 요구사항 정리

**서비스:** 토선생

**블로그 주소:** `https://to-teacher.com/blog`

**문서 버전:** v1.0

**작성일:** 2026년 7월 29일

**목적:** 팀 내부 공유 및 MVP 개발 기준 확정

---

## 1. 프로젝트 목적

`to-teacher.com/blog`에 토익스피킹 전문 콘텐츠를 지속적으로 발행해 다음 목표를 달성한다.

1. 토익스피킹 관련 Google·네이버 검색 유입 확보
2. SEO·AEO 관점에서 `to-teacher.com`의 주제 전문성과 신뢰도 강화
3. 블로그 방문자를 토선생 모의고사·AI 채점 서비스로 전환
4. 익명 댓글을 통해 사용자의 질문과 콘텐츠 수요 수집
5. 뉴스레터를 통해 새 글 발행 시 재방문 유도

블로그는 단순 게시판이 아니라 **검색 유입 → 콘텐츠 소비 → 모의고사 이용 → 재방문**을 연결하는 채널로 운영한다.

---

# 2. 최종 합의 사항

| 구분             | 최종 결정                                               |
| ---------------- | ------------------------------------------------------- |
| 블로그 경로      | `to-teacher.com/blog`                                   |
| 게시글 작성      | 관리자 글쓰기 화면 없음                                 |
| 게시글 등록      | DB 직접 등록 또는 내부 등록 스크립트                    |
| 게시글 목록      | 공개 글 최신순 조회                                     |
| 게시글 상세      | 숫자 ID가 아닌 slug 기반 URL                            |
| 검색             | 제목에 대한 단순 부분 문자열 검색                       |
| 댓글             | 로그인 없이 누구나 익명 작성                            |
| 댓글 닉네임      | 랜덤 닉네임 및 랜덤 아바타                              |
| 댓글 수정        | 제공하지 않음                                           |
| 댓글 삭제        | 제공하지 않음                                           |
| 댓글 운영        | 운영자 숨김 및 복원만 제공                              |
| 뉴스레터         | 이메일 구독                                             |
| 새 글 알림       | MVP에서 자동 발송까지 포함                              |
| 발송 시점        | 게시글 공개 후 기본 15분 유예 뒤 자동 발송              |
| SEO              | 메타데이터, canonical, sitemap, RSS, 구조화 데이터 포함 |
| 검색 결과 페이지 | 검색엔진 색인 제외                                      |

---

# 3. MVP 기능 범위

## 3.1 사용자 기능

- 공개 게시글 전체 목록 조회
- 게시글 단건 상세 조회
- 게시글 제목 검색
- 로그인 없는 익명 댓글 작성
- 랜덤 닉네임 및 아바타 변경
- 뉴스레터 이메일 구독
- 뉴스레터 이메일 인증
- 뉴스레터 구독 해지
- 관련 글 조회
- 블로그 글에서 토선생 서비스로 이동
- 링크 복사 형태의 간단한 공유

## 3.2 운영 기능

- DB 또는 등록 스크립트를 통한 게시글 등록
- 게시글 공개 상태 및 발행 일시 관리
- 뉴스레터 발송 대상 여부 지정
- 뉴스레터 자동 예약 발송
- 테스트 이메일 발송
- 예약 발송 취소
- 발송 실패 재시도
- 댓글 검토, 숨김 및 복원
- 전체 뉴스레터 발송 긴급 중지
- 게시글 및 전환 이벤트 분석

---

# 4. 페이지 및 URL 구조

```
https://to-teacher.com/
├── blog
│   ├── /blog
│   ├── /blog/{slug}
│   └── /blog/search?q={검색어}
│
├── guide
│   └── /guide/toeic-speaking-parts
│
├── sitemap.xml
├── rss.xml
└── robots.txt
```

## 4.1 블로그 목록

```
GET /blog
```

표시 항목:

- 추천 또는 고정 글
- 게시글 썸네일
- 제목
- 요약
- 작성자
- 발행일
- 페이지네이션
- 제목 검색창
- 뉴스레터 구독 영역

## 4.2 게시글 상세

```
GET /blog/{slug}
```

예시:

```
/blog/toeic-speaking-ih-vs-al
/blog/toeic-speaking-score-levels
/blog/part-2-picture-description
```

상세 페이지 구성:

```
제목
요약
작성자
발행일
수정일
대표 이미지
본문
토선생 서비스 CTA
관련 글
익명 댓글
뉴스레터 구독
```

## 4.3 검색 결과

```
GET /blog/search?q=토익스피킹
```

검색 결과 페이지는 사용자에게 제공하되 검색엔진에는 색인시키지 않는다.

```
<metaname="robots"content="noindex, follow"/>
```

---

# 5. 게시글 기능

## 5.1 전체 글 조회

공개된 게시글만 최신순으로 조회한다.

```
GET /api/posts?page=1&size=10
```

조회 조건:

```
status = PUBLISHED
published_at <= 현재 시각
```

정렬:

```
published_at DESC
```

응답 예시:

```
{
  "posts": [
    {
      "slug":"toeic-speaking-score-levels",
      "title":"토익스피킹 점수와 등급 총정리",
      "summary":"토익스피킹 점수별 등급과 IH, AL 기준을 정리했습니다.",
      "thumbnailUrl":"/images/blog/toeic-speaking-score.webp",
      "authorName":"토선생",
      "publishedAt":"2026-08-01T09:00:00+09:00"
    }
  ],
  "page":1,
  "size":10,
  "totalPages":3,
  "totalElements":25
}
```

MVP 기본 페이지 크기는 9개 또는 10개로 한다.

---

## 5.2 단건 글 조회

```
GET /api/posts/{slug}
```

반환 항목:

- slug
- 제목
- 요약
- 본문
- 썸네일 또는 대표 이미지
- 작성자
- 최초 발행일
- 최종 수정일
- SEO 제목
- SEO 설명
- 관련 글
- 서비스 CTA 정보

다음 글은 외부 사용자에게 노출하지 않는다.

- `DRAFT` 상태인 글
- `ARCHIVED` 상태인 글
- 발행 예정 시간이 아직 지나지 않은 글
- 존재하지 않는 slug

위 경우 상세 API 및 페이지는 404로 처리한다.

---

## 5.3 게시글 URL

공개 URL은 숫자 ID가 아닌 slug를 사용한다.

```
권장
/blog/toeic-speaking-ih-vs-al

비권장
/blog/17
```

게시글 ID는 DB와 내부 API에서만 사용한다.

게시 이후 slug는 원칙적으로 변경하지 않는다. 변경할 경우 기존 URL에서 새로운 URL로 301 리다이렉트를 설정한다.

---

## 5.4 게시글 상태

```
DRAFT
PUBLISHED
ARCHIVED
```

| 상태        | 설명                             |
| ----------- | -------------------------------- |
| `DRAFT`     | 작성 중이며 외부에 노출하지 않음 |
| `PUBLISHED` | 공개 가능한 게시글               |
| `ARCHIVED`  | 공개 중단 또는 보관 상태         |

예약 발행 조건:

```
status = PUBLISHED
published_at > 현재 시각
```

예약 시간이 되기 전까지 목록, 검색, 상세 페이지에 노출하지 않는다.

---

# 6. 게시글 작성 및 발행 방식

## 6.1 관리자 글쓰기 화면

MVP에서는 게시글 작성용 관리자 에디터를 개발하지 않는다.

게시글은 다음 중 하나의 방식으로 등록한다.

1. DB에 직접 등록
2. Markdown 또는 JSON 파일을 내부 스크립트로 DB에 등록
3. 배포 과정에서 콘텐츠를 DB에 적재

장기적인 운영 안정성을 위해서는 DB에 긴 HTML을 직접 입력하기보다 **Markdown + 등록 스크립트** 방식을 권장한다.

## 6.2 권장 발행 흐름

```
Markdown으로 작성
→ 등록 스크립트 실행
→ DRAFT 저장
→ 내용 확인
→ PUBLISHED 전환
→ 뉴스레터 발송 예약
```

예시 front matter:

```
title: 토익스피킹 IH와 AL의 차이
slug: toeic-speaking-ih-vs-al
summary: IH와 AL 답변의 차이를 실제 평가 요소를 기준으로 설명합니다.
status: PUBLISHED
publishedAt: 2026-08-01T10:00:00+09:00

newsletter:
  enabled: true
  sendAt: 2026-08-01T10:15:00+09:00
```

## 6.3 등록 시 검증 항목

- slug 중복 여부
- 제목 존재 여부
- 요약 존재 여부
- 본문 존재 여부
- 상태값 유효성
- 발행일 형식
- 썸네일 URL 유효성
- SEO 제목 및 설명 길이
- 허용되지 않은 HTML 또는 스크립트
- 뉴스레터 발송 시각이 발행 시각보다 빠르지 않은지 확인

본문을 HTML로 저장하거나 렌더링할 경우 반드시 sanitizing을 적용한다.

---

# 7. 검색 기능

## 7.1 검색 범위

MVP에서는 게시글 **제목만 검색**한다.

```
GET /api/posts/search?q=토익스피킹&page=1&size=10
```

SQL 개념:

```
SELECT*FROM postsWHERE status='PUBLISHED'AND published_at<=CURRENT_TIMESTAMPAND titleLIKE CONCAT('%', :query,'%')ORDERBY published_atDESC;
```

## 7.2 검색 규칙

- 검색어 앞뒤 공백 제거
- 검색어 2자 이상
- 검색어 최대 50자
- 공개된 글만 검색
- 최신순 정렬
- 페이지네이션 적용
- SQL parameter binding 사용
- 검색 결과가 없으면 추천 글 또는 최신 글 표시

예시:

```
'토익스피킹 점수' 검색 결과 4개
```

결과가 없을 때:

```
검색 결과가 없습니다.
대신 아래 글을 확인해 보세요.
```

MVP 이후 게시글 수가 충분히 증가하면 검색 범위를 다음 순서로 확장한다.

```
제목
→ 제목 + 요약
→ 제목 + 요약 + 본문
→ 카테고리 및 태그 필터
```

---

# 8. 익명 댓글 기능

## 8.1 기본 정책

댓글은 토스 블로그처럼 로그인 없이 누구나 작성할 수 있다.

사용자가 직접 입력하는 값은 댓글 내용뿐이다.

```
회원가입 없음
로그인 없음
이름 입력 없음
이메일 입력 없음
비밀번호 입력 없음
```

서버가 자동으로 다음 정보를 생성한다.

- 랜덤 닉네임
- 랜덤 아바타
- 익명 사용자 식별 토큰

예시 닉네임:

```
차분한 돌고래
꼼꼼한 수달
명랑한 펭귄
용감한 토끼
따뜻한 부엉이
```

---

## 8.2 댓글 수정 및 삭제 정책

**댓글은 등록 후 수정하거나 삭제할 수 없다.**

사용자에게 제공하지 않는 기능:

- 댓글 수정
- 댓글 삭제
- 댓글 작성자 본인 판별 UI
- 삭제 비밀번호
- 삭제 버튼

댓글 입력창에 다음 안내를 표시한다.

> 댓글은 등록 후 수정하거나 삭제할 수 없어요. 내용을 확인한 후 등록해 주세요.

등록 시 확인창을 표시할 수 있다.

```
댓글을 등록할까요?
등록한 댓글은 수정하거나 삭제할 수 없습니다.

[취소] [등록]
```

운영자는 부적절한 댓글을 숨기거나 다시 복원할 수 있지만, 일반적인 관리자 삭제 기능도 제공하지 않는다.

법적·보안상 완전 삭제가 필요한 예외 상황은 제품 기능이 아닌 별도 운영 절차로 처리한다.

---

## 8.3 댓글 UI

```
댓글 12

[랜덤 아바타] 꼼꼼한 수달   [랜덤 변경]

┌──────────────────────────────────┐
│ 이 글에 대한 질문이나 의견을 남겨주세요. │
└──────────────────────────────────┘

0 / 500                         [댓글 남기기]

댓글은 등록 후 수정하거나 삭제할 수 없어요.
```

한 브라우저에서는 동일한 닉네임과 아바타를 유지한다.

사용자가 `랜덤 변경`을 누르면 이후 작성하는 댓글부터 새로운 닉네임과 아바타를 사용한다. 기존 댓글의 닉네임과 아바타는 변경하지 않는다.

---

## 8.4 익명 사용자 식별

첫 방문 시 서버가 암호학적으로 안전한 랜덤 토큰을 발급한다.

```
anon_session={긴 랜덤 토큰}
```

쿠키 권장 설정:

```
HttpOnly
Secure
SameSite=Lax
Path=/
```

서버에는 원본 토큰을 저장하지 않고 해시값만 저장한다.

```
브라우저 익명 토큰
→ 서버에서 해시
→ anonymous_visitors.token_hash와 비교
```

익명 토큰 사용 목적:

- 동일 브라우저에서 닉네임 유지
- 랜덤 닉네임 변경
- 사용자별 댓글 작성 횟수 제한
- 도배 및 반복 작성 방지
- 악성 사용자 반복 요청 차단

댓글 삭제 기능이 없으므로 `isMine`과 같은 작성자 본인 표시 정보는 사용하지 않는다.

---

## 8.5 댓글 작성

```
POST /api/posts/{slug}/comments
Content-Type: application/json
```

요청 예시:

```
{
  "content":"Part 2에서는 문장을 몇 개 정도 말하는 게 좋을까요?"
}
```

닉네임, 아바타, 익명 사용자 ID는 클라이언트가 직접 지정하지 않는다. 서버가 익명 쿠키를 기준으로 결정한다.

댓글 작성 규칙:

| 규칙 번호 | 규칙                                       | 서버 처리                                    |     |
| --------- | ------------------------------------------ | -------------------------------------------- | --- |
| 1         | 최소 2자                                   | 공백 정리 후 길이가 2자 미만이면 위반        |     |
| 2         | 최대 500자                                 | 공백 정리 후 길이가 500자를 초과하면 위반    |     |
| 3         | 앞뒤 공백 제거                             | 서버에서 자동으로 `trim` 처리                |     |
| 4         | 일반 텍스트만 허용                         | 문자열이 아닌 입력이나 리치 텍스트 구조 차단 |     |
| 5         | HTML 입력 제한                             | HTML 태그 또는 실행 가능한 HTML 패턴 차단    |     |
| 6         | Markdown 입력 제한                         | Markdown 문법으로 판단되는 패턴 차단         |     |
| 7         | URL 포함 댓글 차단                         | URL 및 도메인 패턴이 포함되면 차단           |     |
| 8         | 빈 댓글 차단                               | 공백 제거 후 내용이 없으면 위반              |     |
| 9         | 반복 문자 및 도배 패턴 제한                | 과도한 반복 문자, 동일 문구 반복 등 차단     |     |
| 10        | 공개 상태가 아닌 게시글에는 댓글 작성 불가 | 공개 상태와 발행 시각을 확인                 |     |

정상 댓글은 즉시 공개한다.

```
VISIBLE
```

스팸 또는 자동화가 의심되는 댓글은 바로 공개하지 않는다.

```
PENDING
```

---

## 8.6 댓글 조회

```
GET /api/posts/{slug}/comments?cursor={cursor}&size=20
```

응답 예시:

```
{
  "comments": [
    {
      "id":125,
      "nickname":"꼼꼼한 수달",
      "avatarSeed":"otter-14",
      "content":"Part 2에서는 문장을 몇 개 정도 말하는 게 좋을까요?",
      "createdAt":"2026-07-29T14:30:00+09:00"
    }
  ],
  "nextCursor":"124",
  "hasNext":true
}
```

MVP 기본 정렬은 최신 댓글순으로 한다.

```
created_at DESC
```

댓글이 충분히 많아지면 커서 기반 페이지네이션 또는 더 보기 방식을 사용한다.

---

## 8.7 댓글 상태

```
VISIBLE
PENDING
HIDDEN
```

| 상태      | 설명                       |
| --------- | -------------------------- |
| `VISIBLE` | 일반 사용자에게 공개       |
| `PENDING` | 스팸 의심 등으로 검토 대기 |
| `HIDDEN`  | 운영자가 숨김 처리         |

`DELETED` 상태와 `deleted_at` 필드는 사용하지 않는다.

운영자가 댓글을 숨길 때 다음 정보를 기록할 수 있다.

```
hidden_at
hidden_reason
```

숨김 사유 예시:

```
SPAM
ABUSE
ADVERTISEMENT
PERSONAL_INFORMATION
OTHER
```

---

## 8.8 댓글 스팸 방지

### 작성 횟수 제한

초기 기준값:

```
익명 사용자 기준
- 10초에 1개
- 10분에 5개
- 하루 20개

IP 기준
- 10분에 10개
- 하루 50개
```

실제 운영 데이터를 기준으로 조정한다.

IP 원문은 장기간 저장하지 않는다. 가능하면 Redis와 같은 저장소에서 짧은 TTL로 관리하고, DB 기록이 필요하면 서버 비밀값을 활용한 해시 형태로 저장한다.

### URL 차단

MVP에서는 댓글에 URL을 허용하지 않는다.

안내 문구:

> 광고 및 스팸 방지를 위해 댓글에는 링크를 입력할 수 없어요.

### 허니팟

사용자에게 보이지 않는 입력 필드를 추가한다.

```
<inputtype="text"name="website"tabindex="-1"autocomplete="off"/>
```

해당 필드에 값이 들어오면 자동화 요청으로 판단한다.

### 조건부 CAPTCHA

모든 사용자에게 CAPTCHA를 요구하지 않는다.

다음과 같은 경우에만 추가 검증을 적용한다.

- 짧은 시간에 반복 등록
- 동일 IP에서 다수 등록
- 익명 쿠키를 반복해서 재발급
- 동일 문구 반복
- 자동화 도구로 의심되는 요청
- 비정상적인 요청 속도

# 9. 댓글 운영 기능

운영자 전용 댓글 기능:

```
GET   /internal/comments
PATCH /internal/comments/{commentId}/hide
PATCH /internal/comments/{commentId}/restore
```

운영자는 다음 기준으로 댓글을 조회할 수 있다.

- 전체
- 공개
- 검토 대기
- 숨김
- 게시글별
- 작성일별

운영자 화면을 MVP에 반드시 포함할 필요는 없지만, 보호된 내부 API 또는 운영 스크립트는 제공해야 한다.

댓글 수가 증가하면 다음 관리 화면을 추가한다.

```
/admin/comments
```

---

# 10. 뉴스레터 기능

## 10.1 기본 정책

뉴스레터는 이메일을 수집하는 기능만 제공하는 것이 아니라, **새 글 자동 발송까지 MVP에 포함**한다.

전체 흐름:

```
이메일 입력
→ 이메일 형식 및 중복 여부 확인
→ 개인정보 수집 및 이메일 수신 동의 확인
→ ACTIVE 구독자로 저장
→ 이후 새 글 자동 발송 대상에 포함
→ 새 글 발행
→ 15분 유예
→ 자동 이메일 발송
```

---

## 10.2 뉴스레터 구독

```
POST /api/newsletter/subscribe
Content-Type: application/json
```

요청 예시:

```
{
  "email":"user@example.com",
  "consent":true
}
```

처리 항목:

- 이메일 앞뒤 공백 제거
- 이메일 소문자 정규화
- 이메일 형식 검증
- 수신 동의 여부 확인
- 기존 구독자 여부 확인
- 신규 구독자는 `ACTIVE` 상태로 등록
- 구독 해지자가 다시 신청한 경우 `ACTIVE`로 재활성화
- 구독 해지 토큰 생성
- 구독 완료 응답 반환

구독 영역 안내 문구:

> 새로운 토익스피킹 학습 글과 토선생 업데이트를 이메일로 보내드려요. 언제든지 구독을 해지할 수 있어요.

개인정보 처리방침 및 수신 동의 내용을 함께 연결한다.

성공 응답 예시:

```
{
  "success":true,
  "status":"ACTIVE",
  "message":"뉴스레터 구독이 완료되었습니다."
}
```

이미 활성화된 이메일이 다시 신청한 경우 중복 레코드를 생성하지 않는다.

```
{
  "success":true,
  "status":"ACTIVE",
  "message":"이미 뉴스레터를 구독 중인 이메일입니다."
}
```

사용자 이메일의 구독 여부를 외부에 과도하게 노출하고 싶지 않다면, 신규 구독과 기존 구독 모두 동일한 성공 문구를 사용할 수 있다.

```
{
  "success":true,
  "message":"뉴스레터 구독 요청이 처리되었습니다."
}
```

---

## 10.3 구독 해지

모든 뉴스레터 하단에 고유한 구독 해지 링크를 포함한다.

```
GET /api/newsletter/unsubscribe?token={token}
```

해지 성공 시:

```
ACTIVE → UNSUBSCRIBED
```

다음 정보를 기록한다.

```
unsubscribed_at
```

구독 해지 시 로그인이나 이메일 재입력을 요구하지 않는다.

---

# 11. 뉴스레터 자동 발송

## 11.1 자동 발송 조건

게시글이 공개되었다고 해서 무조건 이메일을 발송하지 않는다.

다음 조건을 모두 만족하는 글만 자동 발송한다.

```
status = PUBLISHED
newsletter_enabled = true
newsletter_status = SCHEDULED
newsletter_send_at <= 현재 시각
newsletter_sent_at IS NULL
```

`newsletter_enabled`는 반드시 명시적으로 지정한다.

DB 기본값은 `false`로 두고, 발행 스크립트에서 뉴스레터 발송 대상으로 지정하도록 한다.

---

## 11.2 권장 발송 흐름

```
게시글 PUBLISHED 전환
→ newsletter_enabled 확인
→ newsletter_send_at 생성
→ 15분 유예
→ 발송 대상 게시글을 SENDING으로 변경
→ ACTIVE 구독자별 발송 작업 생성
→ 이메일 발송
→ 성공 또는 실패 결과 저장
```

기본 유예 시간:

```
15분
```

예시:

```
published_at:         2026-08-01 10:00
newsletter_send_at:   2026-08-01 10:15
newsletter_status:    SCHEDULED
```

유예 시간 동안 오타나 링크 문제를 발견하면 예약을 취소할 수 있다.

---

## 11.3 뉴스레터 발송 상태

```
NOT_SCHEDULED
SCHEDULED
SENDING
SENT
FAILED
CANCELED
```

| 상태            | 설명                      |
| --------------- | ------------------------- |
| `NOT_SCHEDULED` | 뉴스레터 발송 대상이 아님 |
| `SCHEDULED`     | 발송 예약됨               |
| `SENDING`       | 현재 구독자에게 발송 중   |
| `SENT`          | 전체 발송 작업 완료       |
| `FAILED`        | 발송 작업 실패            |
| `CANCELED`      | 운영자가 예약 취소        |

---

## 11.4 발송 스케줄러

1분 또는 5분마다 예약된 게시글을 확인한다.

```
SELECT*FROM postsWHERE status='PUBLISHED'AND newsletter_enabled=trueAND newsletter_status='SCHEDULED'AND newsletter_send_at<=CURRENT_TIMESTAMP;
```

여러 서버가 동시에 실행되더라도 중복 발송되지 않도록 상태 변경을 원자적으로 처리한다.

```
UPDATE postsSET newsletter_status='SENDING'WHERE id= :postIdAND newsletter_status='SCHEDULED';
```

업데이트된 행이 1개일 때만 발송을 진행한다.

---

## 11.5 중복 발송 방지

구독자별 발송 기록에 다음 unique constraint를 설정한다.

```
UNIQUE(post_id, subscriber_id)
```

서버 재시작이나 작업 중복 실행이 발생하더라도 같은 게시글을 같은 구독자에게 두 번 보내지 않는다.

---

## 11.6 발송 실패 재시도

일시적 오류는 최대 3회 재시도한다.

권장 재시도 간격:

```
1차 실패 → 5분 후
2차 실패 → 30분 후
3차 실패 → 2시간 후
```

다음 경우에는 재시도하지 않는다.

- 존재하지 않는 이메일
- 영구 반송
- 발송 서비스가 영구 실패로 응답
- 이미 구독 해지된 사용자

영구 반송된 구독자는 다음 상태로 변경한다.

```
BOUNCED
```

---

## 11.7 테스트 발송

운영자가 실제 발송 전에 자신의 이메일로 테스트할 수 있어야 한다.

예시 내부 API:

```
POST /internal/newsletter/posts/{postId}/test
```

또는 내부 명령어:

```
npm run newsletter:test----post-id=17
```

테스트 항목:

- 이메일 제목
- 본문 요약
- 대표 이미지
- 글 링크
- CTA 링크
- 모바일 화면
- 구독 해지 링크
- 잘못된 URL 여부

---

## 11.8 발송 취소

게시글이 `SCHEDULED` 상태일 때 예약을 취소할 수 있다.

```
POST /internal/newsletter/posts/{postId}/cancel
```

상태 변경:

```
SCHEDULED → CANCELED
```

`SENDING` 상태가 된 이후에는 일부 구독자에게 이미 발송됐을 수 있으므로 일반적인 취소를 허용하지 않는다.

---

## 11.9 긴급 중지

전체 뉴스레터 발송을 즉시 중지할 수 있는 설정을 제공한다.

```
NEWSLETTER_SENDING_ENABLED=false
```

설정이 꺼져 있으면 스케줄러가 실행되더라도 실제 이메일 발송을 진행하지 않는다.

---

## 11.10 이메일 내용

MVP 이메일은 게시글 전체 내용을 담지 않고 요약과 링크를 제공한다.

예시:

```
제목:
[토선생] 토익스피킹 IH와 AL의 차이는 무엇일까요?

본문:
새로운 글이 발행되었습니다.

토익스피킹 IH와 AL의 차이

IH와 AL 답변에서 달라지는 구체성, 연결성,
발음과 유창성을 실제 답변을 기준으로 정리했습니다.

[글 읽으러 가기]

이 메일은 토선생 새 글 알림을 구독한 분께 발송되었습니다.
[구독 해지]
```

글 링크에는 분석용 UTM 파라미터를 붙인다.

```
?utm_source=newsletter
&utm_medium=email
&utm_campaign=post_notification
```

---

# 12. 관련 글 및 서비스 CTA

## 12.1 관련 글

상세 페이지 하단에 관련 글 3개를 노출한다.

```
같이 읽으면 좋은 글
```

선정 우선순위:

1. 운영자가 직접 지정한 관련 글
2. 직접 지정한 글이 없으면 최신 공개 글
3. 현재 보고 있는 글은 제외

MVP에서는 복잡한 추천 알고리즘이나 태그 기반 추천은 사용하지 않는다.

## 12.2 서비스 CTA

블로그 글 주제와 연결되는 토선생 서비스 CTA를 본문 중간 또는 하단에 배치한다.

| 글 주제       | CTA 예시                |
| ------------- | ----------------------- |
| IH와 AL 차이  | 내 예상 등급 확인하기   |
| 채점 기준     | 내 감점 항목 확인하기   |
| Part 2 공략   | 사진 묘사 문제 풀어보기 |
| Part 5 공략   | 60초 의견 답변 채점받기 |
| 모의고사 점수 | 무료 모의고사 시작하기  |

일률적인 CTA보다 글의 검색 의도와 연결되는 문구를 사용한다.

---

# 13. SEO·AEO 요구사항

## 13.1 대표 도메인

대표 호스트를 다음 주소로 통일한다.

```
https://to-teacher.com
```

`www.to-teacher.com`으로 접근하면 non-www 주소로 301 리다이렉트한다.

다음 항목도 모두 non-www로 통일한다.

- canonical
- sitemap URL
- Open Graph URL
- 내부 링크
- RSS 링크

---

## 13.2 게시글 메타데이터

각 게시글에 고유한 값을 설정한다.

```
<title>
meta description
canonical
Open Graph title
Open Graph description
Open Graph image
```

대체 규칙:

```
seo_title이 없으면 title 사용
seo_description이 없으면 summary 사용
```

---

## 13.3 구조화 데이터

게시글 상세 페이지:

```
BlogPosting 또는 Article
BreadcrumbList
```

사이트 전체:

```
Organization
```

게시글 구조화 데이터 항목:

```
headline
description
image
author
datePublished
dateModified
mainEntityOfPage
```

댓글 내용은 운영자가 작성한 게시글 본문이나 Article 구조화 데이터에 포함하지 않는다.

---

## 13.4 렌더링

게시글 제목과 본문은 초기 HTML에 포함되어야 한다.

다음 방식 중 하나를 사용한다.

```
SSG
SSR
서버 컴포넌트 기반 렌더링
```

브라우저에서 JavaScript를 실행한 후 API를 호출해야만 본문이 나타나는 구조는 피한다.

---

## 13.5 사이트맵

```
/sitemap.xml
```

포함:

- 홈페이지
- 블로그 목록
- 공개 게시글
- 핵심 가이드
- 공개 서비스 소개 페이지

제외:

- 검색 결과
- `DRAFT` 게시글
- `ARCHIVED` 게시글
- 미래 발행 글
- 모의고사 세션
- 개인 채점 결과
- 관리자 페이지
- API

---

## 13.6 RSS

```
/rss.xml
```

RSS에 포함할 항목:

- 게시글 제목
- 게시글 URL
- 요약
- 발행일
- 작성자
- 최신 공개 글 목록

---

## 13.7 색인 정책

| 페이지         | 검색엔진 처리          |
| -------------- | ---------------------- |
| `/blog`        | `index, follow`        |
| `/blog/{slug}` | `index, follow`        |
| `/blog/search` | `noindex, follow`      |
| 모의고사 세션  | `noindex`              |
| 개인 채점 결과 | `noindex`              |
| 관리자 페이지  | 인증 적용 및 색인 제외 |
| API            | 색인 대상 아님         |

공개 블로그 콘텐츠가 robots.txt, CDN 또는 방화벽에서 의도치 않게 차단되지 않도록 한다.

# 14. 데이터베이스 모델

## 14.1 `posts`

```
id
slug
title
summary
content_markdown
thumbnail_url
author_name
status

seo_title
seo_description

published_at
created_at
updated_at

newsletter_enabled
newsletter_status
newsletter_send_at
newsletter_sent_at
```

주요 제약:

```
PRIMARY KEY (id)
UNIQUE (slug)
NOT NULL (slug, title, summary, content_markdown, status)
INDEX (status, published_at)
INDEX (newsletter_status, newsletter_send_at)
```

---

## 14.2 `anonymous_visitors`

```
id
token_hash
nickname
avatar_seed
created_at
last_seen_at
```

주요 제약:

```
PRIMARY KEY (id)
UNIQUE (token_hash)
```

---

## 14.3 `comments`

```
id
post_id
anonymous_visitor_id
nickname
avatar_seed
content
status

created_at
updated_at

hidden_at
hidden_reason
```

주요 제약:

```
PRIMARY KEY (id)
FOREIGN KEY (post_id) REFERENCES posts(id)
FOREIGN KEY (anonymous_visitor_id) REFERENCES anonymous_visitors(id)

INDEX (post_id, status, created_at)
INDEX (anonymous_visitor_id)
```

`nickname`과 `avatar_seed`를 댓글 테이블에도 복사해 둔다. 익명 사용자가 닉네임을 변경하더라도 기존 댓글의 표시 정보는 유지된다.

댓글 삭제 기능이 없으므로 다음 필드는 두지 않는다.

```
deleted_at
deleted_by
```

---

## 14.4 `newsletter_subscribers`

```
id
email
status

verification_token_hash
verification_expires_at
unsubscribe_token_hash

consent_at
verified_at
subscribed_at
unsubscribed_at

created_at
updated_at
```

구독자 상태:

```
PENDING
ACTIVE
UNSUBSCRIBED
BOUNCED
```

주요 제약:

```
PRIMARY KEY (id)
UNIQUE (email)
UNIQUE (verification_token_hash)
UNIQUE (unsubscribe_token_hash)
INDEX (status)
```

---

## 14.5 `newsletter_deliveries`

```
id
post_id
subscriber_id
status

attempt_count
next_retry_at

provider_message_id
sent_at
failed_at
last_error

created_at
updated_at
```

발송 상태:

```
PENDING
SENDING
SENT
FAILED
SKIPPED
```

주요 제약:

```
PRIMARY KEY (id)
FOREIGN KEY (post_id) REFERENCES posts(id)
FOREIGN KEY (subscriber_id) REFERENCES newsletter_subscribers(id)
UNIQUE (post_id, subscriber_id)
INDEX (status, next_retry_at)
```

---

# 15. 최종 API 목록

## 15.1 게시글

```
GET /api/posts
GET /api/posts/{slug}
GET /api/posts/search
```

## 15.2 댓글

```
GET  /api/posts/{slug}/comments
POST /api/posts/{slug}/comments
POST /api/comments/nickname/regenerate
```

제공하지 않는 API:

```
DELETE /api/comments/{commentId}
PATCH  /api/comments/{commentId}
```

## 15.3 뉴스레터

```
POST /api/newsletter/subscribe
GET  /api/newsletter/unsubscribe
```

## 15.4 운영자 전용

```
GET   /internal/comments
PATCH /internal/comments/{commentId}/hide
PATCH /internal/comments/{commentId}/restore

POST  /internal/newsletter/posts/{postId}/test
POST  /internal/newsletter/posts/{postId}/cancel
POST  /internal/newsletter/posts/{postId}/retry
```

게시글 등록은 공개 API가 아니라 내부 스크립트 또는 직접 DB 작업으로 처리한다.

---

# 16. 콘텐츠 권장 구조

각 게시글은 SEO와 AEO를 고려해 가능한 한 동일한 정보 구조를 사용한다.

```
H1: 사용자의 질문과 가까운 제목

두세 문장으로 직접 답변

핵심 내용을 정리한 표 또는 요약

상세 설명

실제 답변 또는 사례 비교

자주 묻는 질문

작성자
최초 발행일
최종 수정일
출처

관련 모의고사 CTA
관련 글
익명 댓글
뉴스레터 구독
```

예시:

```
H1: 토익스피킹 IH와 AL의 차이는 무엇인가요?

IH와 AL의 차이는 단순히 문법 오류 개수만으로 결정되지 않습니다.
답변의 완성도, 구체성, 연결성, 발음과 유창성을 함께 봐야 합니다.
```

---

# 17. 분석 이벤트

다음 사용자 행동을 분석한다.

```
blog_list_view
blog_post_view
blog_search
blog_search_result_click
blog_cta_click

comment_submit
comment_pending

newsletter_subscribe_start
newsletter_subscribe_complete
newsletter_verify
newsletter_unsubscribe
newsletter_link_click

share_link_copy
```

주요 지표:

- 공개 게시글 수
- 검색엔진에 색인된 게시글 수
- 비브랜드 검색 유입
- 게시글별 조회수
- 검색 결과 클릭률
- 블로그에서 모의고사로 이동한 비율
- 댓글 작성률
- `PENDING` 또는 `HIDDEN` 댓글 비율
- 뉴스레터 구독 전환율
- 이메일 인증 완료율
- 구독 해지율
- 이메일 링크 클릭률
- 뉴스레터에서 블로그로 유입된 사용자 수

MVP에서는 조회수를 사용자에게 표시하지 않아도 된다. 내부 분석 도구에서만 확인한다.

---

# 18. 보안 및 개인정보 처리

## 18.1 사용자 입력 검증

다음 입력값은 프론트엔드뿐 아니라 서버에서도 검증한다.

- 검색어
- 댓글
- 이메일
- 인증 및 구독 해지 토큰

필수 원칙:

```
SQL 문자열 직접 결합 금지
parameter binding 사용
HTML 및 스크립트 차단
입력 길이 제한
에러 메시지에 내부 정보 노출 금지
```

## 18.2 토큰 저장

다음 값은 원문 그대로 DB에 저장하지 않는다.

```
익명 사용자 토큰
이메일 인증 토큰
구독 해지 토큰
```

DB에는 해시값만 저장한다.

## 18.3 운영자 API

`/internal` 및 `/admin` 경로는 반드시 인증과 권한 검사를 적용한다.

URL을 외부에 노출하지 않는 것만으로는 보호되지 않는다.

## 18.4 로그

애플리케이션 로그에 다음 값이 그대로 남지 않도록 한다.

- 이메일 주소
- 토큰 원문
- 댓글 전체 내용
- IP 원문
- 이메일 발송 서비스의 민감한 응답값

---

# 19. MVP 제외 기능

다음 기능은 첫 출시에서 제외한다.

```
게시글 관리자 에디터
복잡한 카테고리 페이지
태그별 목록 페이지
본문 전체 검색
게시글 좋아요
댓글 수정
댓글 삭제
대댓글
댓글 좋아요
댓글 이미지 첨부
댓글 링크 첨부
댓글 알림
사용자 프로필
개인화 콘텐츠 추천
뉴스레터 관심사 분류
뉴스레터 발송 빈도 선택
뉴스레터 A/B 테스트
드래그앤드롭 이메일 에디터
복잡한 오픈율 분석
```

---

# 20. 개발 권장 순서

## 1단계: 게시글 및 SEO 기반

```
posts 테이블
게시글 목록
게시글 상세
slug 처리
게시글 상태 관리
metadata
canonical
구조화 데이터
sitemap.xml
rss.xml
```

## 2단계: 검색

```
제목 검색 API
검색 결과 페이지
페이지네이션
검색 결과 noindex
```

## 3단계: 익명 댓글

```
익명 쿠키
랜덤 닉네임 및 아바타
닉네임 변경
댓글 조회
댓글 작성
댓글 등록 확인 안내
rate limit
URL 차단
허니팟
PENDING 처리
운영자 숨김 및 복원
```

## 4단계: 뉴스레터

```
구독 신청
이메일 인증
구독 해지
구독자 상태 관리
자동 발송 스케줄러
15분 유예
테스트 발송
예약 취소
중복 발송 방지
실패 재시도
긴급 중지
```

## 5단계: 분석 및 운영 개선

```
이벤트 수집
검색 유입 분석
CTA 전환 분석
댓글 스팸 기준 조정
뉴스레터 클릭 분석
댓글 질문을 신규 콘텐츠 주제로 활용
```

---

# 21. 출시 승인 기준

## 게시글

- [ ] 공개 게시글만 목록에 노출된다.
- [ ] 공개 게시글이 최신순으로 정렬된다.
- [ ] slug 기반 상세 페이지가 정상 동작한다.
- [ ] `DRAFT`, `ARCHIVED`, 미래 발행 글은 외부에 노출되지 않는다.
- [ ] 관련 글이 표시된다.
- [ ] 본문이 초기 HTML에 포함된다.
- [ ] 게시글별 고유 canonical과 메타데이터가 적용된다.

## 검색

- [ ] 제목 부분 검색이 동작한다.
- [ ] 2자 미만 검색어가 제한된다.
- [ ] 공개 게시글만 검색된다.
- [ ] 검색 결과에 페이지네이션이 적용된다.
- [ ] 검색 결과 페이지가 `noindex`다.
- [ ] SQL parameter binding을 사용한다.

## 댓글

- [ ] 로그인 없이 댓글을 작성할 수 있다.
- [ ] 랜덤 닉네임과 아바타가 생성된다.
- [ ] 같은 브라우저에서 닉네임이 유지된다.
- [ ] 닉네임을 다시 생성할 수 있다.
- [ ] 댓글 등록 전 수정·삭제 불가 안내가 표시된다.
- [ ] 댓글 수정 기능이 없다.
- [ ] 댓글 삭제 기능이 없다.
- [ ] HTML, Markdown, URL이 제한된다.
- [ ] 댓글 작성 횟수 제한이 적용된다.
- [ ] 의심 댓글은 `PENDING` 처리된다.
- [ ] 운영자가 댓글을 숨기고 복원할 수 있다.
- [ ] 숨김 댓글은 일반 사용자에게 보이지 않는다.

## 뉴스레터

- [ ] 중복 이메일 신청이 올바르게 처리된다.
- [ ] 이메일 인증 전에는 발송 대상이 되지 않는다.
- [ ] 인증 완료 사용자는 `ACTIVE` 상태가 된다.
- [ ] 구독 해지 링크가 모든 이메일에 포함된다.
- [ ] 해지된 사용자는 이후 이메일을 받지 않는다.
- [ ] 뉴스레터 대상으로 지정된 글만 자동 발송된다.
- [ ] 게시글 공개 후 기본 15분 유예가 적용된다.
- [ ] 발송 전 테스트 이메일을 보낼 수 있다.
- [ ] 유예 시간 동안 예약을 취소할 수 있다.
- [ ] 동일 글이 동일 구독자에게 중복 발송되지 않는다.
- [ ] 일시적 발송 실패가 최대 3회 재시도된다.
- [ ] 긴급 중지 설정이 동작한다.
- [ ] 발송 성공과 실패가 구독자별로 기록된다.

## SEO·AEO

- [ ] `www`와 non-www 중 대표 주소가 하나로 통일된다.
- [ ] 게시글별 고유 title과 description이 있다.
- [ ] canonical이 올바르게 설정된다.
- [ ] Article 또는 BlogPosting 구조화 데이터가 적용된다.
- [ ] `sitemap.xml`이 제공된다.
- [ ] `rss.xml`이 제공된다.
- [ ] 검색 결과 페이지가 색인되지 않는다.
- [ ] 공개 콘텐츠가 robots.txt나 방화벽에 차단되지 않는다.
- [ ] 모바일에서 제목, 본문, 표, CTA를 읽기 쉽다.

---

# 22. 최종 MVP 범위 요약

```
1. 공개 게시글 목록 조회
2. slug 기반 게시글 상세 조회
3. 제목 부분 검색
4. 관리자 에디터 없이 DB 또는 내부 스크립트로 게시글 작성
5. DRAFT / PUBLISHED / ARCHIVED 상태 관리
6. 로그인 없는 익명 댓글
7. 랜덤 닉네임과 아바타
8. 댓글 수정 기능 없음
9. 댓글 삭제 기능 없음
10. 운영자 댓글 숨김 및 복원
11. 댓글 스팸 방지
12. 뉴스레터 이메일 구독
13. 이메일 인증
14. 구독 해지
15. 새 글 뉴스레터 자동 발송
16. 게시 후 15분 발송 유예
17. 테스트 발송 및 예약 취소
18. 중복 발송 방지와 실패 재시도
19. 관련 글과 토선생 서비스 CTA
20. metadata, canonical, sitemap, RSS, 구조화 데이터
21. 블로그 및 전환 이벤트 분석
```

## 한 문장 정의

> 토선생 블로그 MVP는 토익스피킹 콘텐츠를 검색엔진에 노출하고, 익명 댓글로 사용자 반응을 수집하며, 인증된 구독자에게 새 글을 자동 발송해 토선생 서비스 재방문과 모의고사 전환을 만드는 시스템이다.
