# Docker + GitHub Actions 배포 파이프라인 구축

팀원이 공유한 배포 워크플로우 초안이 이 프로젝트 구조와 맞지 않는 부분이 있어, 실제로 동작하는 형태로 고치면서 결정한 내용과 그 과정에서 손댄 기존 코드를 정리한다.

## 1. 배경

팀원의 초안은 `docker/build-push-action`이 `./Dockerfile`을 참조하는데, 이 저장소엔 Dockerfile도 `.github/workflows/`도 없었다. 또한 Docker 이미지를 굽기 전에 `npm ci && npm run build`로 "dist 폴더"를 만든다는 전제였는데, 이건 Vite/CRA류 정적 SPA 배포 패턴이다. 이 프로젝트는

- 패키지 매니저가 pnpm이고 (`npm ci`와 lockfile이 다름)
- Next.js 빌드 산출물은 `dist/`가 아니라 `.next/`이며
- `src/app/api/consent/route.ts`, `src/app/api/survey/route.ts`라는 서버사이드 API 라우트가 있어 static export가 원천적으로 불가능하다(Next.js는 API 라우트와 `output: "export"`를 동시에 허용하지 않는다).

그래서 저장소 안에서 만들 수 있는 범위(Dockerfile, `next.config.ts`, GitHub Actions 워크플로우)를 이 프로젝트 구조에 맞춰 새로 짰다. EC2 위의 `docker-compose.yml`/nginx 설정은 이 저장소 범위 밖이라 이미 있다고 가정하고 손대지 않았다.

## 2. 환경변수를 빌드타임/런타임으로 나눈 이유

이 프로젝트의 env는 성격이 완전히 다른 두 그룹으로 나뉜다([CLAUDE.md](../CLAUDE.md) 참고).

| | `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_CLARITY_PROJECT_ID` | `GOOGLE_SERVICE_ACCOUNT_*`, `GOOGLE_CONSENT_SHEET_*`, `GOOGLE_SURVEY_SHEET_*` |
|---|---|---|
| 필요 시점 | **빌드타임** — Next.js가 `next build` 때 클라이언트 번들에 값을 그대로 인라인한다 | **런타임** — API 라우트가 요청 시점에 `process.env`로 읽는다 |
| 이 파이프라인에서 넣는 곳 | `docker/build-push-action`의 `build-args`로 GitHub Actions 시크릿에서 전달 → Dockerfile `ARG`/`ENV` → `pnpm build` | **Dockerfile/이 파이프라인 어디에도 넣지 않음.** EC2의 docker-compose `environment:`/`.env`에서 컨테이너 실행 시점에만 주입 |

서버 전용 시크릿을 빌드 단계에서 다루지 않는 이유는, `docker build --build-arg`나 `RUN` 레이어에 올라간 값은 `docker history`/이미지 레이어로 그대로 복원 가능해서다. 이미지 자체는 Docker Hub의 `msde76/tosunsaeng-frontend:latest`로 공개(또는 팀 공유)되므로, 그 안에 서비스 계정 private key 같은 값이 박혀 있으면 이미지를 받는 모든 사람이 시크릿을 갖게 된다.

## 3. Dockerfile 구조

[Dockerfile](../Dockerfile)은 pnpm 기반 3-stage 빌드다.

- **deps**: `package.json`/`pnpm-lock.yaml`/`pnpm-workspace.yaml`만 먼저 복사해 `pnpm install --frozen-lockfile`. 소스 코드보다 의존성 파일 변경이 훨씬 드물기 때문에, 이 순서로 레이어를 나눠야 소스만 바뀐 재빌드에서 `pnpm install` 레이어가 캐시로 재사용된다.
- **builder**: deps의 `node_modules`와 전체 소스를 복사하고, `ARG`로 받은 `NEXT_PUBLIC_*` 두 값만 `ENV`로 노출한 뒤 `pnpm build`. `GOOGLE_*`는 이 stage에도 등장하지 않는다.
- **runner**: non-root 유저(`nextjs`)를 만들고, builder에서 `public/`, `.next/standalone`, `.next/static`만 복사해 `node server.js`로 띄운다.

`next.config.ts`에 `output: "standalone"`을 추가한 이유가 runner stage와 직결된다. 이 옵션 없이는 `.next/`에 실행에 필요한 전체 `node_modules`가 그대로 필요해 런타임 이미지가 커지는데, standalone 산출물은 실제로 쓰는 의존성만 추려 `.next/standalone`에 넣어준다. 다만 standalone 산출물은 `public/`과 `.next/static`(정적 자산)을 자동으로 포함하지 않으므로, runner stage에서 이 둘을 별도로 복사해야 한다 — 빠뜨리면 이미지는 빌드되지만 컨테이너가 이미지·CSS 등을 못 찾는다.

## 4. Node 20 → 22로 올린 이유

처음엔 팀원 초안과 동일하게 `node:20-alpine`으로 시작했는데, `pnpm install --frozen-lockfile` 단계에서 다음과 같이 실패했다.

```text
Error [ERR_UNKNOWN_BUILTIN_MODULE]: No such built-in module: node:sqlite
```

`package.json`에 `packageManager`가 고정돼 있지 않아 corepack이 매번 최신 pnpm(11.11.0)을 받아오는데, pnpm 11.x 계열이 내부적으로 `node:sqlite`(Node 22.13+에서 도입된 빌트인 모듈)를 사용한다. 재현성을 위해 `package.json`에 `"packageManager": "pnpm@11.9.0"`(로컬 개발 환경과 동일 버전)을 고정해봤지만, 11.9.0도 같은 이유로 Node 20에서는 동작하지 않았다 — 즉 pnpm 버전을 낮추는 게 아니라 pnpm 11.x가 요구하는 Node 버전에 맞추는 게 맞는 방향이었다. Dockerfile의 3개 stage와 `.github/workflows/deploy.yml`의 `setup-node`를 모두 `22`로 맞춰서 해결했다.

## 5. GitHub Actions 워크플로우 변경 사항

[.github/workflows/deploy.yml](../.github/workflows/deploy.yml) 기준으로, 팀원 초안 대비 바뀐 부분만 정리한다.

- **삭제**: `npm ci && npm run build`(dist 폴더 가정) 단계. 실제 빌드는 Dockerfile의 builder stage 안에서 일어나므로 이 단계는 그대로 두면 중복 실행이고, 애초에 이 프로젝트 산출물 구조와도 맞지 않았다.
- **추가**: pnpm 설치 + `pnpm lint` + `npx tsc --noEmit`을 이미지 빌드 **전에** 실행. Docker 빌드 자체는 몇 분씩 걸리므로, 코드 문제(lint/타입 오류)는 그보다 훨씬 빠른 이 단계에서 먼저 걸러내는 게 낫다고 판단했다.
- **추가**: `docker/build-push-action`의 `build-args`로 `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_CLARITY_PROJECT_ID`를 GitHub Actions 시크릿에서 전달(2절 참고).
- **유지**: Buildx 세팅, Docker Hub 로그인, SSH로 EC2에 접속해 `docker compose pull/up frontend`하는 배포 단계는 원본 구조 그대로 뒀다.

이 워크플로우가 실제로 통과하려면 저장소 Settings → Secrets에 `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_CLARITY_PROJECT_ID`를 추가해야 한다(기존 `DOCKERHUB_USERNAME`/`DOCKERHUB_TOKEN`/`EC2_SSH_KEY`는 팀원 초안이 이미 참조하고 있어 있다고 가정했다).

## 6. 이미지 버전 태깅 (git 태그 push 트리거)

원본 워크플로우는 항상 `msde76/tosunsaeng-frontend:latest` 하나만 덮어써서, 롤백하려 해도 "몇 주 전 latest"와 "지금 latest"를 구분할 방법이 없었다. 그렇다고 커밋 메시지를 분석해 버전을 자동으로 결정하는 `semantic-release`류 완전 자동화는 이 프로젝트 단계에서 과하다고 판단했다 — 커밋 컨벤션이 흔들리면 버전이 조용히 잘못 매겨질 수 있어, 리스크 대비 얻는 이득이 크지 않다.

그래서 "버전을 결정하는 건 사람이 `git tag`로 직접 하고, CI는 그 태그에 맞춰 이미지만 태깅한다"는 절충안을 적용했다.

```yaml
on:
  push:
    branches:
      - main
    tags:
      - 'v*'
```

- **`main`에 push** → 기존과 동일하게 `:latest`만 갱신하고, 곧바로 EC2에 배포한다.
- **`v1.2.0`처럼 `v`로 시작하는 태그를 push** → `:latest`에 더해 `:v1.2.0` 태그도 함께 Docker Hub에 올라간다(`Determine image tags` 스텝에서 `github.ref_type`/`github.ref_name`으로 분기). 다만 이때는 **EC2 배포 스텝(`SSH Command to Deploy`)을 건너뛴다**(`if: github.ref_type == 'branch'`).

배포 스텝을 태그 push에서 제외한 이유는, 과거 커밋에 뒤늦게 태그를 붙이는 경우(예: 지난주 릴리즈에 태그만 나중에 붙이는 경우)까지 자동으로 운영 서버를 그 시점으로 되돌려버리는 걸 막기 위해서다. 즉 이 태그 트리거는 순수하게 "롤백용 스냅샷 이미지를 만들어두는" 용도이고, 실제로 그 버전으로 되돌리고 싶으면 EC2에서 `docker compose` 쪽 이미지 태그를 그 버전으로 지정해 수동으로 pull하면 된다.

사용법: 릴리즈하고 싶은 시점에 `git tag v1.2.0 && git push origin v1.2.0`을 실행하면 된다. GitHub Releases UI로 태그를 만들어도 내부적으로는 동일한 tag push 이벤트라 똑같이 동작한다.

## 7. lint 게이트를 추가하며 함께 고친 기존 코드

워크플로우에 `pnpm lint`를 CI 게이트로 추가하기 전에 로컬에서 먼저 돌려보니, 이번 작업과 무관한 기존 코드에서 `eslint-plugin-react-hooks`의 최신 규칙(`react-hooks/refs`, `react-hooks/set-state-in-effect`) 위반 6건이 이미 있었다. 게이트를 추가한 순간 배포가 항상 막히게 되므로, 함께 고쳤다.

### 7.1 렌더 중 ref 변경 (`react-hooks/refs`)

`src/features/exam/use-audio-cue.ts`, `src/features/exam/use-audio-sequence.ts`에 다음과 같은 "최신 콜백을 ref에 담아두는" 패턴이 있었다.

```tsx
const onEndedRef = useRef(onEnded);
onEndedRef.current = onEnded; // 렌더 도중 ref를 직접 변경
```

렌더 함수 본문에서 `ref.current`를 쓰는 건 React가 동시성 렌더링(재시도, 중단된 렌더 등)에서 안전을 보장하지 않는 영역이라 금지 규칙이 생겼다. 커밋 이후 시점인 effect로 옮기는 게 공식적으로 권장되는 "최신 ref" 패턴이라 그대로 적용했다.

```tsx
const onEndedRef = useRef(onEnded);
useEffect(() => {
  onEndedRef.current = onEnded;
});
```

의존성 배열 없이 매 렌더 커밋 후 실행되므로 동작은 기존과 동일하고, 렌더 중 변경만 없앤다.

### 7.2 effect 안에서의 setState — 두 가지 서로 다른 케이스

`react-hooks/set-state-in-effect`가 걸린 4곳은 겉보기엔 비슷하지만 원인이 서로 달라 고친 방식도 다르다.

**(a) 브라우저 저장소를 읽는 경우 — 규칙을 의도적으로 무시**

`src/components/exam/target-grade-select.tsx`, `src/components/exam/exam-result-screen.tsx`는 마운트 시 `getStoredTargetGradeId()`(`src/features/exam/target-grade.ts`, 내부적으로 `window.localStorage` 사용)로 초기 상태를 채운다. 이 규칙은 "effect 안에서 굳이 setState할 필요 없이 렌더 중에 계산하라"는 일반적인 조언인데, `localStorage`는 서버에 없으므로 렌더 중에 바로 읽으면:

- 서버 렌더(SSR) 시점엔 값이 없어 `null`이 나오고
- 클라이언트 첫 렌더에서 곧바로 읽으면 저장된 값이 나와서, 서버가 그린 HTML과 클라이언트의 첫 렌더 결과가 달라지는 하이드레이션 불일치가 생긴다.

즉 이 경우의 effect는 "지우면 안 되는" 의도적인 코드다. 로직을 바꾸는 대신 이유를 남기고 규칙만 그 줄에서 끈다.

```tsx
useEffect(() => {
  // localStorage는 서버에 없으므로, SSR/하이드레이션 불일치를 피하기 위해 마운트 후에만 읽는다.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setSelectedId(getStoredTargetGradeId());
}, []);
```

**(b) prop이 바뀔 때 상태를 다시 맞추는 경우 — 렌더 중 조정으로 전환**

`src/components/exam/exam-feedback-survey.tsx`는 `initialSatisfaction` prop(URL 쿼리 → 서버 컴포넌트 `src/app/exam/survey/page.tsx`에서 내려줌)이 바뀔 때마다 `satisfaction` 상태를 그 값으로 맞추던 effect였다. 이건 (a)와 달리 외부 시스템(브라우저 API)이 아니라 순수하게 "prop이 바뀌면 상태도 맞춘다"는 파생 상태 동기화라, React 문서가 권장하는 "렌더링 중 상태 조정" 패턴으로 바꿀 수 있었다.

```tsx
const [prevInitialSatisfaction, setPrevInitialSatisfaction] = useState(initialSatisfaction);
if (initialSatisfaction !== prevInitialSatisfaction) {
  setPrevInitialSatisfaction(initialSatisfaction);
  if (initialSatisfaction !== null) setSatisfaction(initialSatisfaction);
}
```

렌더 함수 본문에서의 `setState` 호출은 커밋 전에 즉시 재렌더를 유발하는 React가 명시적으로 허용하는 패턴이라(effect 기반 setState처럼 추가 커밋을 만들지 않음) 규칙을 끄지 않고도 통과한다. 동작은 기존과 동일하게 유지된다: `initialSatisfaction`이 바뀔 때만, 그리고 `null`이 아닐 때만 상태를 덮어쓴다.

같은 파일에서 `useEffect`가 이 용도로만 쓰이고 있어서, 정리 후 더 이상 쓰이지 않는 `useEffect` import도 함께 제거했다.

## 8. 로컬 검증

- `pnpm lint`, `npx tsc --noEmit` 통과 확인(기존 `mic-test-panel.tsx`의 미사용 변수 경고 1건은 이번 작업 범위 밖이라 그대로 둠)
- `docker build --build-arg NEXT_PUBLIC_API_BASE_URL=... --build-arg NEXT_PUBLIC_CLARITY_PROJECT_ID=... -t tosunsaeng-frontend:test .`로 이미지 빌드 성공
- `docker run`으로 컨테이너를 띄운 뒤 `/`, `/exam/prepare`가 200을, `/api/consent`가 (시크릿 없이도 크래시 없이) 400을 반환하는 것을 확인 — `GOOGLE_*` 없이도 서버 프로세스 자체는 정상적으로 뜬다는 걸 보여준다
- 검증에 쓴 이미지/컨테이너는 확인 후 정리(`docker rm -f` / `docker rmi`)

## 9. 남은 과제

- GitHub Actions 실행 자체는 실제 push 전에는 확인 불가 — `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_CLARITY_PROJECT_ID` 시크릿 등록 여부를 실제 push 전에 재확인해야 한다.
- EC2의 `docker-compose.yml`에 `GOOGLE_*` 서버 시크릿이 이미 주입되고 있는지는 이 저장소 밖의 설정이라 별도 확인이 필요하다.
- `mic-test-panel.tsx`의 미사용 변수 경고는 이번 작업 범위가 아니라 남겨뒀다.
- 태그 기반 버전 이미지가 실제로 쌓이기 시작하면, Docker Hub에 오래된 버전 태그가 무한히 늘어나는 것을 막을 보존 정책(예: 최근 N개만 유지)이 필요할 수 있다 — 지금은 정리 로직이 없다.
