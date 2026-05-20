# XAI v1 Track C Log

## 2026-05-20 Checkpoint 1

Branch:
- `codex/track-c-widgets-web-ai`

Completed:
- G6-E1 widget host scaffold in `packages/plugin-widgets`.
- G6-E4 time progress and countdown widgets.
- G6-E2 calendar mini view and day timeline in `packages/plugin-calendar`.
- G6-E5 pet basics in `packages/plugin-pet`.
- G6-E6 personalization tokens and wallpaper contrast mock.
- G8-E1 web host shell in existing Next `apps/web`.
- G8-S1 browser-safe Tauri capability stubs.
- G7-E1 AI Cube conversation scaffold in `packages/plugin-ai-cube`.
- G7-E2 privacy gate and redaction stub.
- G7-E3 pet AI persona mock hook.
- G7-E4 cost/offline guard.
- G6-E3 habit stats widgets.
- G8-E2 IndexedDB, remote blob mock, and offline-first strategy.
- G8-E3 security headers, rate limit helper, and error boundary.
- G8-E4 responsive console layouts.

Checks:
- `pnpm --filter web check-types` passed.
- Dev server started at `http://localhost:3000`.
- HTTP smoke checks passed for `/`, `/console`, and `/settings`.
- `/` returns CSP, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy` headers.
- `pnpm --filter @repo/plugin-widgets check-types` blocked because the new workspace package has no local `node_modules`; `@repo/typescript-config`, `react`, and `@repo/core-data` cannot resolve without running install/link.
- `pnpm --filter @repo/plugin-calendar check-types` blocked by the same missing workspace links.
- `pnpm --filter @repo/plugin-pet check-types` blocked by the same missing workspace links.
- `pnpm --filter @repo/plugin-ai-cube check-types` blocked by the same missing workspace links.

Incidents:
- New package workspace links are absent. Per instruction, no dependency install was run. Recovery action is to run the repository's normal pnpm install/link step later, then rerun all plugin check-types commands.
- `apps/web` is an existing Next app, not Vite. Track C kept the existing app runtime instead of replacing it.
- In-app Browser verification could not run because the required browser Node execution tool was not exposed in this session. HTTP smoke checks were used as fallback.

Contract notes:
- Proposed widget and AI events were recorded under `docs/reviews/*/proposed-contract-changes.md`.
- No Track A owned contract or core type files were modified.
