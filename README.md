# 토선생 (Toseonsaeng) — Web Front-end

TOEIC Speaking 모의고사 웹 서비스 **토선생**의 Next.js 프론트엔드입니다. 사용자가 실제 시험과 같은 흐름으로 문항별 답변을 녹음하면, 별도 백엔드의 AI가 채점하고 점수·피드백 리포트를 보여줍니다.

- 서비스: https://to-teacher.com
- 이 저장소는 프론트엔드만 포함하며, 실제 채점은 `NEXT_PUBLIC_API_BASE_URL`로 연결되는 별도 백엔드에서 수행됩니다.

## 주요 기능

- **모의고사 응시 흐름**: 랜딩(`/`) → 시험 준비(`/exam/prepare`: 목표 등급 선택, 음성 수집 동의 → 마이크 테스트 → 사운드 체크 → 튜토리얼) → 시험 진행(`/exam/session`) → 채점 대기(`/exam/grading`) → 결과 리포트(`/exam/result`, 문항별 상세 `/exam/result/question`) → 만족도 설문(`/exam/survey`)
- **실제 시험과 동일한 문항 진행**: 파트별 디렉션 → 문제 음성 → 준비 시간 → 답변 녹음의 단계(phase) 상태 머신으로 진행되며, 녹음된 답변은 presigned S3 URL 업로드 후 채점 요청됩니다.
- **마이크 음성 검증**: 볼륨 임계값 + 스펙트럼 평탄도 기반으로 실제 발화 여부를 확인한 뒤 시험을 시작합니다.
- **채점 대기 화면**: 3초 간격 상태 폴링과 클라이언트 측 진행률 연출로 채점 완료까지 안내합니다.
- **동의/설문 기록**: 서버 API 라우트(`/api/consent`, `/api/survey`)가 Google Sheets에 음성 수집 동의와 설문 응답을 적재합니다.
- **분석 도구**: GA4 시험 퍼널 커스텀 이벤트, Microsoft Clarity 연동.

## 기술 스택

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **UI**: Tailwind CSS v4, shadcn/ui (base-nova), lucide-react, recharts, sonner
- **Server state**: TanStack Query
- **Validation**: Zod
- **기타**: googleapis (동의/설문 시트 적재), Docker 배포

## 시작하기

패키지 매니저는 **pnpm**입니다.

```bash
pnpm install
cp .env.local.example .env.local   # 환경 변수 채우기
pnpm dev                           # http://localhost:3000
```

### 환경 변수

`.env.local.example`을 복사해 사용합니다. 두 그룹으로 나뉩니다.

| 변수 | 용도 |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | 채점 백엔드 API 주소 (클라이언트에서 사용) |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | Microsoft Clarity 프로젝트 ID |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 측정 ID (비우면 GA 태그 미렌더링 — 로컬은 비워두기 권장) |
| `NEXT_PUBLIC_SITE_URL` | 사이트 기본 URL (sitemap/robots용) |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` / `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | 서버 전용. Google Sheets 적재용 서비스 계정 |
| `GOOGLE_CONSENT_SHEET_ID` / `GOOGLE_CONSENT_SHEET_RANGE` | 음성 수집 동의 기록 시트 |
| `GOOGLE_SURVEY_SHEET_ID` / `GOOGLE_SURVEY_SHEET_RANGE` | 만족도 설문 기록 시트 |

`GOOGLE_*` 변수는 서버 전용(`NEXT_PUBLIC_` 금지)이며, 해당 시트에 서비스 계정 이메일을 **편집자**로 공유해야 합니다.

### 스크립트

```bash
pnpm dev            # 개발 서버
pnpm build          # 프로덕션 빌드
pnpm start          # 프로덕션 실행
pnpm lint           # ESLint
pnpm format         # Prettier 적용
pnpm format:check   # Prettier 검사
npx tsc --noEmit    # 타입 체크 (전용 스크립트 없음)
```

테스트 프레임워크는 별도로 구성되어 있지 않습니다.

## 프로젝트 구조

```
src/
├── app/                # App Router 페이지 (랜딩, exam 플로우, 약관/개인정보, API 라우트)
│   ├── exam/           # prepare → session → grading → result → survey
│   └── api/            # consent, survey (Google Sheets 적재)
├── components/         # 화면 컴포넌트 (exam/, ui/ = shadcn 생성물 등)
├── features/           # 도메인 로직 (exam API 연동·훅, consent, survey)
├── lib/                # apiFetch 등 공용 유틸
└── types/              # API envelope, 시험 도메인 타입 (Raw 와이어 타입 → 매퍼 → 도메인 타입)
docs/                   # 주요 이슈/의사결정 기록
```

백엔드 연동은 `Raw*` 와이어 타입 → `map-exam-*` 매퍼 → 도메인 타입 패턴을 따릅니다. 자세한 아키텍처와 주의사항은 [CLAUDE.md](CLAUDE.md)를 참고하세요.

## 문서

구현 과정의 의사결정과 트러블슈팅은 [docs/](docs/)에 정리되어 있습니다.

- [Docker + GitHub Actions 배포 파이프라인](docs/docker-deploy-pipeline.md)
- [마이크 음성 검증 임계값 튜닝](docs/mic-test-voice-verification.md)
- [시험 세션 중복 생성 요청 수정](docs/exam-session-duplicate-request-fix.md)
- [채점 대기 화면 API 연동](docs/grading-wait-screen-api-integration.md)
- [답변 업로드 재시도 처리](docs/exam-answer-upload-retry.md)
- 그 외 히어로 영상 최적화, 이탈 추적, 재답변 재제출 수정 등

## 배포

pnpm 기반 3-stage [Dockerfile](Dockerfile)로 빌드해 Docker 이미지로 배포합니다. `NEXT_PUBLIC_*` 변수는 빌드 타임에 build-arg로 주입되고, `GOOGLE_*` 서버 시크릿은 이미지에 포함하지 않고 컨테이너 실행 시점에만 주입합니다. 자세한 내용은 [docs/docker-deploy-pipeline.md](docs/docker-deploy-pipeline.md) 참고.
