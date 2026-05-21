# web-release-site-archive-vite-shell — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option A — archive the current Next.js shell to `apps/release-site/` and establish `apps/web` as the new `@repo/web` Vite SPA host |
| Review Doc Path | `docs/reviews/web-release-site-archive-vite-shell/20260521-discovery-review.md` |
| Review Date/Version | 2026-05-21 |
| Feature Type | W2 app-shell boundary and scaffold planning |
| ADR Anchor | `docs/adr/0006-web-face-hybrid-reuse-boundary.md` |

## Frozen Assumptions

- `apps/web` is the canonical path for the future browser product host and must match the PRD Vite SPA shape.
- The current Next.js shell is valuable as archive/reference material, but it must no longer act as product truth once this row is implemented.
- `apps/release-site/` remains inside the workspace as a reference-only archive package named `@repo/release-site-archive`.
- The archive package does not expose standard `dev` / `build` / `start` scripts; manual preview, if retained, is via demoted `archive:*` scripts only.
- `ADR-0006` allows a Web-specific shell/view rewrite, so direct source reuse of the current Next host is not required.
- The new Web host remains a thin shell only: routing, providers, service worker hooks, and host injection seams.
- Useful security and Supabase proof assets may stay archived temporarily, but later rows can relocate them once canonical browser contracts harden.

## Scope Boundary

This feature owns planning for:

- `apps/web` target host-shell boundary
- archive destination and classification for the current Next.js shell
- package naming and task wiring needed for `@repo/web`
- Turbo/build/typecheck/dev implications of the archive/new-host split

This feature does not own:

- auth/device/session implementation
- Sync/blob driver implementation
- Console router/module business logic
- CSP/Sentry production hardening
- deployment/CI setup

## Dependency Overview

- Upstream source: `docs/reviews/web-release-site-archive-vite-shell/20260521-roadmap-seed.md`
- Governing docs: `docs/adr/0006-web-face-hybrid-reuse-boundary.md`, `docs/PLUGIN_MAP.md`, `docs/planning/sub-prds/web/PRD.md`, `docs/planning/sub-prds/web/dev-plan.md`
- Downstream rows unlocked:
  - `web-auth-device-session`
  - `web-browser-e2e-crypto-runtime`
  - `web-console-host-router`
  - `web-security-csp-sentry`
  - `web-i18n-seo-landing`

## Proposed Implementation Shape

- `apps/web`
  - `package.json` renamed to `@repo/web`
  - Vite entrypoint plus `src/main.tsx`
  - `src/providers/`, `src/routes/`, `src/pages/`, `src/service-worker/`, `src/styles/`
- `apps/release-site`
  - archived Next.js shell
  - retained marketing/security/reference assets
  - `package.json` renamed to `@repo/release-site-archive`
  - README banner declaring archive-only status and `/console` mock demotion
- Turbo / scripts
  - Vite `dist/**` output recognized for `apps/web`
  - archive package excluded from root `dev` / `build` flows by removing standard runtime scripts
  - root `package.json` stays unchanged; command behavior shifts through package-local scripts plus `turbo.json`

## Build Phase Freeze

### Phase 1 — Archive move/classification

- touch only the moved Next.js tree and the new archive boundary:
  - current `apps/web/{app/**,docs/**,public/**,supabase/**,README.md,middleware.ts,next.config.js,eslint.config.js,tsconfig.json,vitest.config.ts,package.json}`
  - destination `apps/release-site/**`
- deliverable:
  - complete archived Next.js app
  - package rename to `@repo/release-site-archive`
  - README/script guardrails proving archive-only status

### Phase 2 — Vite host scaffold/package rename

- touch only `apps/web/{package.json,index.html,vite.config.ts,tsconfig.json,eslint.config.js,README.md,public/**,src/**}`
- deliverable:
  - canonical `@repo/web` Vite shell
  - thin-host-only directory shape
  - no archived `/console` mock left under `apps/web`

### Phase 3 — Turbo/workspace alignment

- touch only `turbo.json`, `apps/web/package.json`, and `apps/release-site/package.json`
- deliverable:
  - `dist/**` output contract for `@repo/web`
  - root `pnpm dev` / `turbo run build` behavior frozen without reintroducing the archive into primary flows
