# 블로그 썸네일 이미지 최적화와 캐시 소실 문제

블로그 썸네일을 S3에서 받아 `next/image`로 최적화하도록 붙이면서, 최적화 결과 캐시가 배포마다 사라진다는 걸 발견했다. 원인과 요청 경로, CDN 도입을 검토했다가 보류한 이유, 대신 택한 조치를 정리한다.

## 1. 배경

블로그 글의 `thumbnailUrl`은 백엔드가 S3 버킷(`arn:aws:s3:::to-teacher-web-blog`, ap-northeast-2)에 올린 이미지 주소다. 이 이미지는 `BlogPostThumbnail`(`src/components/blog/blog-post-thumbnail.tsx`)에서 `next/image`로 렌더된다.

`next/image`는 기본 로더를 쓰면 외부 호스트를 아무거나 받아주지 않는다. 최적화 요청이 우리 서버의 `/_next/image` 엔드포인트를 거치기 때문에, 등록되지 않은 호스트를 허용하면 남이 우리 서버를 이미지 리사이즈 프록시로 쓸 수 있다(대역폭·CPU 소모, SSRF). 그래서 `next.config.ts`의 `remotePatterns`에 버킷 호스트를 등록했다.

```ts
{ protocol: "https", hostname: "to-teacher-web-blog.s3.*.amazonaws.com" },
{ protocol: "https", hostname: "to-teacher-web-blog.s3.amazonaws.com" },
```

`*`는 서브도메인 한 세그먼트를 의미하므로 리전 엔드포인트(`…s3.ap-northeast-2.amazonaws.com`)를 덮고, 리전 없는 구형 엔드포인트도 함께 등록했다.

## 2. 이미지 한 장이 그려지기까지

"옵티마이저"는 별도 서버가 아니라 Next 서버 안에 들어있는 `/_next/image` 요청 핸들러다. 브라우저가 `/_next/image?url=<S3주소>&w=640&q=75`를 요청하면 이런 순서로 처리된다.

1. **EC2가 서버 사이드에서 S3에 GET을 날려 원본을 받아온다.** 브라우저가 S3에 직접 가는 게 아니라 EC2가 대신 다녀온다.
2. 받아온 원본을 sharp로 리사이즈·WebP 변환한다. 이 CPU는 앱 서버와 같은 EC2 것이다.
3. 결과를 `.next/cache/images`에 저장하고 브라우저에 응답한다.

```
브라우저 ──► EC2(Next 옵티마이저) ──► S3
              │
              └─ sharp 변환 + .next/cache/images 저장
```

캐시 유효기간은 Next 16 기본값인 `minimumCacheTTL: 14400`(4시간)이다. 업스트림 응답에 더 긴 `Cache-Control: max-age`가 있으면 그쪽을 따른다(`node_modules/next/dist/shared/lib/image-config.js`에서 기본값 확인).

## 3. 문제: 캐시가 컨테이너와 함께 사라진다

`.next/cache/images`는 **컨테이너 파일시스템 안**이다. 배포는 EC2에서 `docker compose pull frontend && docker compose up -d frontend`로 컨테이너를 새로 띄우는 방식이라(`.github/workflows/deploy.yml`), 배포할 때마다 이 캐시가 통째로 사라진다.

그래서 배포 직후에는 모든 썸네일 변형(반응형 `sizes`별로 여러 장)을 다시 변환하게 된다. 지금은 목데이터의 `thumbnailUrl`이 전부 `null`이라 체감되지 않지만, 글이 쌓이면 배포 직후 목록 페이지 첫 진입에서 sharp가 한꺼번에 도는 구간이 생긴다.

## 4. 검토한 대안

### 4.1 CloudFront를 S3 앞에 두기

오리진이 버킷인 형태. 개선되는 건 2절 1번(EC2↔S3) 구간뿐이고, 사용자 요청은 여전히 EC2를 통과하며 sharp 변환도 그대로 일어난다. 게다가 그 구간은 캐시가 살아있는 4시간에 한 번만 발생해서 절약분이 사실상 없다. 성능 이유로는 의미가 없고, **버킷을 비공개로 유지하고 싶을 때(OAC)** 쓰는 구성이다.

### 4.2 CloudFront를 EC2 앞에 두기

도메인의 DNS를 CloudFront로 돌리고 EC2를 오리진으로 숨기는 형태. 캐시가 EC2 바깥(AWS 엣지)에 있으므로 컨테이너를 갈아끼워도 유지되고, 히트하면 EC2는 요청이 왔다는 사실조차 모른다. 이득은 크지만 **그 도메인의 모든 요청이 CloudFront를 통과**한다는 게 부담이다. HTML·`/api/*`까지 경로별 캐시 규칙을 정확히 짜야 하고, 잘못 캐시하면 API 응답이 다른 사용자에게 돌아가는 사고가 난다.

### 4.3 서브도메인으로 이미지 경로만 분리

`cdn.<도메인>`을 CloudFront에 물리고, `images.path`(기본 `/_next/image`)를 절대 URL로 바꿔 이미지 요청만 그쪽으로 보내는 형태. 메인 도메인은 지금처럼 EC2 직행이라 HTML·API는 건드리지 않는다. 4.2보다 사고 반경이 작아서, CDN을 도입한다면 이 형태를 먼저 검토한다.

다만 `assetPrefix`까지 켜서 JS/CSS 청크를 옮기면 `next/font`로 셀프호스팅 중인 폰트(Geist, Jua)도 따라가고, 폰트는 크로스오리진 요청 시 CORS 헤더가 필요해 CloudFront 응답 헤더 정책을 별도로 잡아야 한다. 이미지만 옮기면 이 문제는 없다.

### 4.4 최적화를 하지 않고 S3에서 직접 받기

썸네일은 우리가 업로드하는 이미지이므로, 업로드 시점에 적당한 크기·WebP로 만들어 올리고 `<Image unoptimized>`로 두는 선택지도 있다. 그러면 브라우저가 S3 URL을 직접 받으므로 EC2가 이미지 경로에서 완전히 빠진다. 이 경우엔 4.1(S3 앞 CloudFront)이 오히려 정답이 된다 — 옵티마이저가 중간에 없으니 브라우저가 곧장 CDN에 닿기 때문이다.

리사이즈·포맷 변환 책임이 업로드 파이프라인으로 넘어가므로, 백엔드 쪽 작업이 정리된 뒤에 다시 볼 문제로 남겼다.

### 4.5 docker 볼륨으로 캐시를 컨테이너 밖에 두기 (채택)

3절의 문제는 "캐시가 컨테이너 안에 있다"는 것이므로, 그 디렉터리만 볼륨으로 빼면 그대로 해결된다.

```yaml
services:
  frontend:
    volumes:
      - next-image-cache:/app/.next/cache/images
volumes:
  next-image-cache:
```

## 5. 4.5를 택한 이유

CDN 세 안(4.1~4.3)은 전부 **이미 변환된 결과물의 전달**을 개선하는 것이지, 변환 작업량 자체를 줄이지 않는다. 변형 하나당 sharp가 한 번 도는 건 어느 구성에서나 같다. 그런데 지금 규모는 썸네일이 아직 0장이고 트래픽도 PoC 수준이라, 전달을 개선해서 얻을 이득이 아직 존재하지 않는다. 반면 실제로 관측된 문제(배포마다 재변환)는 CDN 없이 볼륨 한 줄로 해결된다.

즉 CDN은 "지금 문제를 푸는 수단"이 아니라 "나중에 트래픽이 붙으면 필요해질 수단"이고, 그 판단은 미루는 편이 낫다고 봤다.

**적용 시 주의점** — 컨테이너는 `nextjs`(uid 1001)로 실행되므로(`Dockerfile`) 볼륨 소유권이 root면 쓰기 권한 에러가 난다. 최초 생성 후 소유권을 맞춰야 한다. `docker-compose.yml`은 EC2에 있고 이 저장소 범위 밖이라(`docs/docker-deploy-pipeline.md` 1절과 같은 사정) 여기서는 반영하지 못했다.

**검증 방법** — 배포 후 컨테이너에서 캐시가 실제로 쌓이고 재배포 후에도 남아있는지 확인한다.

```bash
docker exec <container> ls /app/.next/cache/images
```

## 6. 함께 할 것: S3 객체에 Cache-Control

백엔드가 썸네일을 업로드할 때 `Cache-Control: public, max-age=31536000, immutable`을 붙이고 키에 콘텐츠 해시를 넣으면, 옵티마이저는 `minimumCacheTTL`과 업스트림 `max-age` 중 **큰 쪽**을 자기 캐시 수명과 응답 헤더에 쓴다. 4시간이던 서버 캐시 수명이 늘어나는 동시에 브라우저 재요청도 줄어든다. 볼륨보다 오히려 효과가 큰 조치이고, 백엔드 업로드 쪽 작업이다.

## 7. CDN을 다시 검토할 시점

다음 중 하나라도 해당되면 4.3부터 다시 본다.

- 버킷을 비공개로 돌려야 할 때(현재는 OG 이미지 크롤러 때문에도 공개가 필요하다)
- 앱 인스턴스를 2대 이상으로 늘릴 때(인스턴스별로 캐시가 따로 쌓인다)
- 배포 직후 EC2 CPU 스파이크가 눈에 띌 때
- 이미지가 많은 글이 쌓이거나 해외 트래픽이 생길 때

## 8. 남은 과제

- `remotePatterns`에 `pathname`을 걸어 썸네일 프리픽스만 허용하기. 현재는 버킷 전체를 허용하고 있는데, 실제 업로드 경로 규칙이 정해지면 좁힌다.
- S3 객체가 공개 읽기인지 확인. presigned URL로 `thumbnailUrl`을 주면 만료되기 때문에, 나중에 크롤러가 OG 이미지를 긁을 때 깨진다.
- 4.4(업로드 시점 리사이즈)를 택할지 여부. 백엔드 업로드 파이프라인이 정해진 뒤 판단한다.
