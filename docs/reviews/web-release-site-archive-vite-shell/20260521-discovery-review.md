# Discovery Review — web-release-site-archive-vite-shell

| 字段 | 值 |
|---|---|
| Feature | `web-release-site-archive-vite-shell` |
| 日期 | 2026-05-21 |
| 执行者 | Codex (`feature-plan` inline) |
| 外部调研 | No external research required |

## Problem Framing

`apps/web` today is not the PRD host shape:

- `apps/web/package.json` is a Next.js app named `web`, not the PRD target `@repo/web`.
- the current tree mixes landing/auth/demo pages, static `/console` mock content, Supabase migrations/tests/functions, and security notes in one app boundary.
- `turbo.json` still assumes `.next/**` as the build output for the current Web app.
- the Web PRD and dev-plan expect `apps/web` to become a Vite SPA host with `src/main.tsx`, `routes/`, `providers/`, `pages/`, and `service-worker/`.
- `ADR-0006` allows a Web-specific host shell, so leaving the current RC shell in place would keep the wrong product truth source alive.

## Source Evidence

- `apps/web/package.json`
  - current package name is `web`
  - scripts are `next dev`, `next build`, `next start`, `next typegen`
- `apps/web/`
  - current structure is App Router based (`app/`, `middleware.ts`, `next.config.js`)
  - includes `docs/security.md`, `docs/capabilities.md`, and `supabase/` proof assets
- `docs/planning/sub-prds/web/PRD.md`
  - `§7.1` and `§7.2` define `apps/web` as the Vite SPA host
  - `§7.2` expects `package.json` name `@repo/web`, `index.html`, and `src/main.tsx`
- `docs/planning/sub-prds/web/dev-plan.md`
  - Week 1 expects `apps/web` scaffold + Turbo task wiring + `/app/*` guarded routes
- `docs/PLUGIN_MAP.md`
  - states this roadmap row owns the archive/new-host split
- `docs/adr/0006-web-face-hybrid-reuse-boundary.md`
  - authorizes a Web-specific host shell/view layer while keeping shared contract boundaries

## Options

### Option A — Move current Next app to `apps/release-site/`, then rebuild `apps/web` as `@repo/web`

Pros:
- Matches the PRD and acceptance signal directly: `apps/web` becomes the canonical Vite host.
- Gives the old shell a clear archived identity instead of leaving it as an ambiguous half-product.
- Preserves current marketing/security/Supabase assets as inspectable reference material.
- Keeps future `/app/*` route guards and thin-host wiring in the expected location.

Cons:
- Highest path churn across the old app.
- Requires careful Turbo/task updates so Vite `dist/**` and archived Next `.next/**` outputs do not conflict.
- Build owners must decide whether the archived app still keeps runnable scripts or becomes reference-only.

### Option B — Leave the current Next app at `apps/web` and create the Vite host elsewhere

Pros:
- Smaller immediate rename surface.
- The old RC shell keeps working without relocation.

Cons:
- Violates the PRD file tree and the roadmap acceptance signal.
- Keeps `apps/web` as the wrong product truth source.
- Forces later rows to special-case host paths and scripts.

### Option C — Rewrite `apps/web` in place to Vite and manually copy only selected reference assets elsewhere

Pros:
- Fewer workspace packages than Option A.
- `apps/web` reaches the target path without a second app staying in the workspace.

Cons:
- Highest risk of losing useful historical marketing/security/Supabase assets.
- Makes it easier for the static `/console` mock or other RC artifacts to disappear without an auditable archive boundary.
- Harder for reviewers to verify what was intentionally preserved versus dropped.

## Recommendation

Choose **Option A**.

Freeze the target shape as:

1. `apps/web` becomes the canonical Vite SPA host package with `name: "@repo/web"`.
2. The current Next.js app moves to `apps/release-site/` and remains in the workspace only as a **reference-only archive package**.
3. `apps/release-site/` keeps only reference value:
   - landing/marketing copy and reusable visual assets
   - current security/capabilities notes
   - current Supabase tests/migrations/functions as historical reference until later rows relocate or replace them
4. The static `/console` mock is explicitly demoted from product truth to archive/reference-only material.

## Frozen Archive Package Contract

The archive behavior is no longer open:

- `apps/release-site/` stays inside the pnpm workspace because `pnpm-workspace.yaml` includes `apps/*`, but it is **not** a primary runnable product target.
- archive package name: `@repo/release-site-archive`
- archive package scripts:
  - no standard `dev`
  - no standard `build`
  - no standard `start`
  - optional manual-only scripts may exist as `archive:dev` and `archive:build` for historical inspection
- canonical host package name: `@repo/web`
- canonical host scripts:
  - `dev` => Vite dev server, matching the PRD expectation of `pnpm --filter @repo/web dev`
  - `build` => Vite build output to `dist/**`
  - `check-types` => browser-host typecheck for the new Vite shell

This freezes root workspace behavior after the split:

- `pnpm dev` / `turbo run dev`
  - continue to run normal workspace `dev` tasks
  - include `@repo/web`
  - exclude the archived site because it has no standard `dev` script
- `turbo run build`
  - builds the canonical Vite host `@repo/web`
  - does not treat `apps/release-site/` as a normal build target because the archive package has no standard `build` script
- `pnpm --filter @repo/web dev|build|check-types`
  - always target the canonical browser host only
- `pnpm --filter @repo/release-site-archive archive:dev`
  - is the only allowed manual preview path for the archived shell, if the build row keeps preview scripts at all

Required guardrail:

- `apps/release-site/README.md` must state that the package is archive/reference-only, that `/console` is a historical static mock, and that `@repo/web` is the only product-truth browser host.

## Frozen Host Boundary

The future `apps/web` host may contain only:

- `src/main.tsx` boot assembly
- router config and route guards
- global providers
- service worker hook wiring
- host injection / plugin registration seams
- browser-safe shared styles and shell chrome

It must not contain:

- business logic for Todo/Project/Labels/Calendar/Auth domains
- static mock module content pretending to be real product behavior
- Tauri-only imports
- ad hoc data logic that belongs in later Web rows or shared packages

## Build-Ready Implementation Phases

Later `feature-build` runs should execute exactly one phase per pass:

### Phase 1 — Archive move and classification

File boundary:

- source boundary from current `apps/web/`:
  - `app/**`
  - `docs/**`
  - `public/**`
  - `supabase/**`
  - `README.md`
  - `middleware.ts`
  - `next.config.js`
  - `eslint.config.js`
  - `tsconfig.json`
  - `vitest.config.ts`
  - `package.json`
- destination boundary:
  - `apps/release-site/**`

Required outcomes:

- create `apps/release-site/` from the existing Next.js shell
- rename the moved package to `@repo/release-site-archive`
- demote standard runtime scripts from the archive package
- add `apps/release-site/README.md` with archive-only and `/console` mock guardrails

Phase gate:

- reviewers can inspect `apps/release-site/` and see a complete archived Next tree plus an explicit reference-only contract

Scoped verification:

- `test -d apps/release-site/app/console`
- `rg -n \"@repo/release-site-archive|archive-only|historical static mock|@repo/web\" apps/release-site/package.json apps/release-site/README.md`

### Phase 2 — Canonical Vite host scaffold and package rename

File boundary:

- `apps/web/package.json`
- `apps/web/index.html`
- `apps/web/vite.config.ts`
- `apps/web/tsconfig.json`
- `apps/web/eslint.config.js`
- `apps/web/README.md`
- `apps/web/public/**`
- `apps/web/src/**`

Required outcomes:

- `apps/web` becomes the thin-host Vite package named `@repo/web`
- scaffold only host-level files: bootstrap, router, providers, pages, service-worker, styles
- no archived Next `/console` content remains under `apps/web`

Phase gate:

- the canonical browser host exists at the PRD path and no longer looks like the archived Next shell

Scoped verification:

- `test -f apps/web/index.html`
- `test -f apps/web/src/main.tsx`
- `rg -n '\"name\": \"@repo/web\"|vite|src/main.tsx' apps/web/package.json apps/web/vite.config.ts apps/web/src/main.tsx`
- `test ! -d apps/web/app`

### Phase 3 — Turbo output and workspace command alignment

File boundary:

- `turbo.json`
- `apps/web/package.json`
- `apps/release-site/package.json`
- root `package.json` remains unchanged unless a reviewer explicitly reopens the contract

Required outcomes:

- `turbo.json` recognizes Vite `dist/**` output for `@repo/web`
- root `pnpm dev` / `turbo run dev` include `@repo/web` but not the archive package
- `turbo run build` includes `@repo/web` but not the archive package
- `pnpm --filter @repo/web dev|build|check-types` remains the canonical host command path

Phase gate:

- root command behavior matches the frozen contract without requiring follow-up design decisions

Scoped verification:

- `rg -n 'dist/\\*\\*|\\.next/\\*\\*' turbo.json`
- `pnpm --filter @repo/web build`
- `pnpm --filter @repo/web check-types`
- `turbo run build`

## Risks

- If the archived Next app remains fully runnable, reviewers must ensure it is clearly documented as reference-only and not the Web product truth source.
- If `apps/web/supabase/` stays under the archive for too long, later rows may accidentally depend on historical proof assets instead of current contracts.
- Turbo output changes can accidentally affect `apps/docs` if build assumptions are updated too broadly.
- Some current asset moves may later be superseded by `web-security-csp-sentry` or deployment rows; the archive plan must allow later relocation without reopening the host-boundary decision.

## Open Questions

- Should `apps/web/docs/security.md` later move to top-level docs once the browser security posture becomes canonical?
- Which later row will formally re-home the archived Supabase proof assets after the browser runtime contracts are stable?
