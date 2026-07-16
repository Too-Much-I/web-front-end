# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

토선생 ("Toseonsaeng") — a proof-of-concept TOEIC Speaking mock exam web app. Users record spoken answers to TOEIC Speaking-style questions, an external backend AI-grades them, and the app shows a scored feedback report. This repo is the Next.js frontend only; actual grading happens on a separate backend reached via `NEXT_PUBLIC_API_BASE_URL`.

## Commands

Package manager is **pnpm** (`pnpm-lock.yaml`, `pnpm-workspace.yaml`).

```bash
pnpm dev            # start dev server (localhost:3000)
pnpm build          # production build
pnpm start          # run production build
pnpm lint           # eslint (eslint-config-next core-web-vitals + typescript)
pnpm format         # prettier --write .
pnpm format:check   # prettier --check .
npx tsc --noEmit    # type-check (no dedicated script; run directly)
```

There is no test suite/framework configured in this repo.

## Environment

Copy `.env.local.example` to `.env.local`. Two groups of env vars:

- `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_CLARITY_PROJECT_ID` — public, used client-side.
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` / `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` / `GOOGLE_CONSENT_SHEET_ID` / `GOOGLE_CONSENT_SHEET_RANGE` — server-only (never `NEXT_PUBLIC_*`), used by `src/app/api/consent/route.ts` to append voice-consent records to a Google Sheet via a service account. The sheet must share edit access with that service account email.

## Architecture

### Request/type pattern: Raw* wire types → mapped domain types

Every backend integration under `src/features/exam/api/` follows the same shape: fetch via `apiFetch` (thin wrapper in `src/lib/api/client.ts`, throws `ApiError`, has an `AbortController` timeout), unwrap the shared `ApiEnvelope<T>` (`src/types/api.ts`, `{ isSuccess, code, message, result }`), then pass the raw `result` through a `map-exam-*.ts` function that converts `Raw*`-prefixed wire types (`src/types/exam.ts`) into the app-facing types components actually consume. When adding a new endpoint, follow this same Raw type → mapper → domain type split rather than using the wire shape directly in components.

Note: `src/types/report.ts` and `src/features/report/api/use-report.ts` define a similar-looking but currently **unused/orphaned** category/grade model — not wired into any route. Don't assume it reflects the live result screen; `src/types/exam.ts` + `exam-result-screen.tsx` is the real one.

### Exam flow (page-by-page)

`/` (marketing landing, `src/app/page.tsx`) → `/exam/prepare` (`ExamPrepareFlow`: target grade select, then a dialog stepping through `consent` → `mic` → `sound` → `tutorial`; the tutorial step auto-shows only until dismissed once — `localStorage("exam-tutorial-seen")` — and is re-openable via the "시험 진행 방식 미리 보기" link in review mode, which closes instead of navigating and skips GA events) → `/exam/session` (`ExamSessionScreen`) → `/exam/grading` (`GradingWaitScreen`, polls status) → `/exam/result` (+ `/exam/result/question` for per-question detail) → `/exam/survey`.

`ExamSessionScreen` (`src/components/exam/exam-session-screen.tsx`) drives one big phase state machine per question: `directions → question-audio → (repeat-cue → question-audio-repeat, Part 4's last question only) → prep-cue → prep → speak-cue → speaking`, advancing via `handlePhaseComplete`, which is invoked either by an audio cue/sequence finishing (`useAudioCue`/`useAudioSequence`) or by `usePhaseCountdown` timing out. Recording starts on entering `"speaking"` and is uploaded from that effect's cleanup (`use-answer-recorder.ts` + `uploadExamAnswer`, a 3-step presigned-S3-URL → PUT → submit-for-grading flow in `exam-answer-upload.ts`).

`ExamQaNavBar` and the `jumpToQuestion`/`jumpToPart` helpers in `ExamSessionScreen` are intentional QA/mentor-review escape hatches to jump around phases/questions outside the real timed flow — expected to be removed after review, not accidental dead code.

`GradingWaitScreen`/`useGradingProgress` (`src/features/exam/use-grading-progress.ts`) fakes a smooth progress bar client-side (capped at 95%) while sequentially polling `GET .../status` every 3s; it only jumps to 100% on a real `COMPLETED` response, and only reports failure after ~120s of continuous poll errors (to avoid flapping on transient network issues).

### Known gotchas worth reading before touching related code

- **Non-idempotent effects need a `useRef` guard**, not `AbortController` and not disabling Strict Mode. React Strict Mode double-invokes effects in dev; a `POST` inside a bare `useEffect` (e.g. exam session creation) will fire twice server-side unless guarded with a ref flag. See `docs/exam-session-duplicate-request-fix.md` for why the other two options were rejected.
- **Mic voice verification** (`src/components/mic-test-panel.tsx`) uses a volume threshold + spectral-flatness gate (not an ML VAD library — a Silero VAD bundle was measured at ~13MB and rejected as disproportionate to this project's otherwise tiny bundle) and accumulates total voice-like time rather than requiring an unbroken streak. The thresholds (`VOICE_THRESHOLD`, `SPECTRAL_FLATNESS_THRESHOLD`, `VOICE_SUSTAIN_MS`) went through several rounds of real-usage retuning — read `docs/mic-test-voice-verification.md` before changing them again.
- **URL query params during the exam flow are written via `window.history.replaceState` directly**, not `router.push`/`router.replace` — because the App Router always round-trips to the server on those (no Pages Router-style shallow routing), which would cause visible reloads/remounts mid-exam. This is intentional; it exists so Microsoft Clarity (`src/components/clarity-analytics.tsx`) can distinguish funnel drop-off points (`step`, `phase`, `part`, `question` params) without affecting app behavior.
- The consent API route (`src/app/api/consent/route.ts`) validates `consentItem`/`consentVersion` as `z.literal()` against the canonical constants in `src/features/consent/consent-content.ts`, and rate-limits by IP in-memory (single-instance only — replace with a shared store, e.g. Redis, before scaling to multiple instances). Bump `VOICE_CONSENT_VERSION` (and update the constant) whenever consent copy changes, since version is how past consent records stay distinguishable from consent to updated terms.
- **This repo is on React 19 (`package.json`) — write code against current React idioms, not patterns that became legacy in 19.** Concretely: `ref` is a plain prop on function components now, so don't wrap a component in `forwardRef` just to accept a `ref` — destructure `ref` directly out of props instead. Still reach for `useImperativeHandle` when a parent genuinely needs a curated method surface instead of the raw DOM node (e.g. `AnswerAudioPlayer`'s `seekTo`), just without the `forwardRef` wrapper around it. When in doubt about whether an API is current, check the installed React version before defaulting to older training-data patterns.

### UI stack

shadcn/ui (`components.json`, style `base-nova`, icon lib `lucide-react`) generates into `src/components/ui`; Tailwind v4 is configured via CSS in `src/app/globals.css` (no `tailwind.config.*`). Brand accents are orange-500/600 with blue-950 for headings — match this when adding new screens rather than introducing new accent colors. Charts use `recharts` directly (see `exam-part-score-radar.tsx`, `phone-demo.tsx`) rather than the shadcn chart wrapper in most places. Toasts via `sonner` (`src/components/ui/sonner.tsx`), mounted once in `Providers`. Server state fetching (where used) goes through a single app-wide `QueryClient` in `src/components/providers.tsx`.

### Responsive design

`globals.css` has no custom `--breakpoint-*` overrides, so Tailwind v4's default breakpoints apply everywhere: `sm=640px`, `md=768px`, `lg=1024px`, `xl=1280px`, `2xl=1536px`. Any screen you build or edit should define its responsive scale across `sm → md → lg → xl` together — not just `sm:` — for both text size (headings/body) and its page-level `max-w-*` wrapper, so wide viewports (large desktop monitors included) don't end up stuck with mobile-tuned sizes. Don't invent a new size scale per page; match the step sizes already used on neighboring screens in the same flow.

## Opening pull requests

Branches are named `feat/#<issue>` / `fix/#<issue>` / `refactor/#<issue>` (or without the `#`) — the number is the linked GitHub issue. When asked to open/update a PR for the current branch:

1. Pull the issue number out of the branch name and fetch that issue (`gh issue view <n> --json title,body,labels`) for context and its labels.
2. Run `git fetch origin main` to make sure `origin/main` is current, then read the actual diff — not just `--stat` — via `git log origin/main..HEAD` and `git diff origin/main...HEAD`. Use the full diff (not just changed file names/counts) to fill `.github/PULL_REQUEST_TEMPLATE.md`'s sections (`#️⃣연관된 이슈`, `📝작업 내용`, `💬고민하고 있는 부분(선택)`) — don't just restate the issue body, describe what was actually built/changed, commit by commit if they cover distinct pieces of work. Leave `### 스크린샷 (선택)` empty unless screenshots are provided.
3. In the `연관된 이슈` section, reference the issue as `- closes #<n>` (lowercase `closes`, so merging auto-closes it).
4. Create with `gh pr create --base main --assignee "@me" --body "$(cat <<'EOF' ... EOF)"`, passing each of the issue's labels (from step 1's `.labels[].name`) as its own `--label "<name>"` argument — not one combined string — so multi-word or multiple labels aren't mangled. Labels mirror whatever labels the linked issue already has, not a guess.
