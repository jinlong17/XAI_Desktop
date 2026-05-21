# web-release-site-archive-vite-shell — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | web-release-site-archive-vite-shell |
| Title | Archive the current release-site shell and establish the Vite Web host |
| Roadmap | web-ticktick-parity · feature #5 · W2 |
| Status | READY_FOR_VERIFY |
| Current Phase | FEATURE_VERIFY |
| Suggested Next | feature-verify |
| Automation Mode | A-Claude |
| Verify Cross-vendor | no |
| Executor | feature-auto-build (Codex gpt-5.3-codex inline) |
| Updated | 2026-05-21 14:32 PDT |
| Blockers | — |

## Source Context

- Roadmap manifest: `docs/workflow/roadmap/web-ticktick-parity.md`
- Source seed: `docs/reviews/web-release-site-archive-vite-shell/20260521-roadmap-seed.md`
- Governing ADR: `docs/adr/0006-web-face-hybrid-reuse-boundary.md`
- Current package truth: `docs/PLUGIN_MAP.md`

## Phase Plan

### Phase 1 — Archive move and classification

Status: DONE (`f7c9de4`).

File boundary:

- current `apps/web/{app/**,docs/**,public/**,supabase/**,README.md,middleware.ts,next.config.js,eslint.config.js,tsconfig.json,vitest.config.ts,package.json}`
- destination `apps/release-site/**`

Required implementation:

- move the existing Next.js shell into `apps/release-site/`
- rename the moved package to `@repo/release-site-archive`
- keep the archive inside the workspace but demote it to reference-only:
  - no standard `dev`
  - no standard `build`
  - no standard `start`
  - optional manual-only `archive:dev` / `archive:build`
- add `apps/release-site/README.md` declaring:
  - archive/reference-only status
  - `/console` is a historical static mock
  - `@repo/web` is the only browser product-truth host

Gate:

- `apps/release-site/` contains a complete archived Next.js tree and the guardrail README/script contract makes it impossible to confuse `/console` with the live product host.

Scoped verification:

- `test -d apps/release-site/app/console`
- `test -f apps/release-site/README.md`
- `rg -n "@repo/release-site-archive|archive-only|historical static mock|@repo/web" apps/release-site/package.json apps/release-site/README.md`

### Phase 2 — Canonical Vite host scaffold and package rename

Status: DONE (`14f2597`).

File boundary:

- `apps/web/package.json`
- `apps/web/index.html`
- `apps/web/vite.config.ts`
- `apps/web/tsconfig.json`
- `apps/web/eslint.config.js`
- `apps/web/README.md`
- `apps/web/public/**`
- `apps/web/src/**`

Required implementation:

- replace the old Next.js host with the canonical Vite package `@repo/web`
- create only thin-host seams:
  - `src/main.tsx`
  - `src/routes/**`
  - `src/providers/**`
  - `src/pages/**`
  - `src/service-worker/**`
  - `src/styles/**`
- do not leave archived Next `/console` content under `apps/web`

Gate:

- `apps/web` matches the PRD Vite shell shape and reviewers do not need to reopen host-responsibility decisions.

Scoped verification:

- `test -f apps/web/index.html`
- `test -f apps/web/src/main.tsx`
- `rg -n '"name": "@repo/web"|vite|src/main.tsx' apps/web/package.json apps/web/vite.config.ts apps/web/src/main.tsx`
- `test ! -d apps/web/app`

### Phase 3 — Turbo/workspace command alignment

Status: DONE (`26d1bf6`).

File boundary:

- `turbo.json`
- `apps/web/package.json`
- `apps/release-site/package.json`
- root `package.json` remains unchanged

Required implementation:

- update `turbo.json` so `@repo/web` uses Vite `dist/**` output
- keep root `pnpm dev` / `turbo run dev` behavior centered on normal workspace app targets, which includes `@repo/web` and excludes the archive package
- keep `turbo run build` aligned to the canonical host and other normal packages, not the archived Next shell
- keep `pnpm --filter @repo/web dev|build|check-types` as the only canonical browser-host commands

Gate:

- root workspace commands behave predictably after the split and the archive package cannot silently re-enter primary dev/build flows.

Scoped verification:

- `rg -n 'dist/\\*\\*|\\.next/\\*\\*' turbo.json`
- `pnpm --filter @repo/web build`
- `pnpm --filter @repo/web check-types`
- `turbo run build`

## Risks

- Archive path churn may accidentally blur whether `apps/release-site` is reference-only unless the README/script demotion lands in the same phase as the move.
- Supabase/security proof assets currently under `apps/web` may linger in the archive longer than ideal if later rows do not relocate them.
- Turbo output changes can cause cross-app regressions if implementation broadens beyond the scoped plan.
- Later rows must resist reintroducing business logic into the new host shell.

## Review Notes

- APPROVED. The revised plan is implementation-ready: the phase plan is now split into concrete build phases with file boundaries, gates, and scoped verification, and the archive/new-host ownership is consistent across discovery, design, API, and test docs.
- The archive contract is sufficiently frozen for execution: `apps/release-site` is reference-only as `@repo/release-site-archive`, standard `dev` / `build` / `start` are demoted away, the README guardrail explicitly demotes archived `/console`, and `apps/web` is the canonical thin-shell `@repo/web` Vite host.
- Non-blocking recommendation: when Phase 3 is built, include root `turbo run check-types` alongside the documented build checks so the new Vite output contract is exercised against existing Next-based apps such as `apps/docs`.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-21 14:13 PDT | feature-plan (Codex gpt-5.3-codex inline) | Fresh planning pass from the roadmap seed: created the Step 0 brief, compared archive/new-host options, recommended `apps/web` -> Vite `@repo/web` plus `apps/release-site/` archive, and initialized design/api/test/dev_log for review. | — | feature-review |
| 2026-05-21 14:17 PDT | feature-review (Codex gpt-5.3-codex inline) | Review pass returned REVISE. Direction is correct, but the plan is not yet executable for `feature-build`: implementation phases are not split by concrete file boundaries, and the archived package's runtime/script contract is still open enough to risk workspace-command regressions and archived `/console` drift. | — | feature-plan |
| 2026-05-21 14:19 PDT | feature-plan (Codex gpt-5.3-codex inline) | Revise pass completed. Converted the milestone plan into build-ready phases, froze `apps/release-site` as reference-only workspace package `@repo/release-site-archive`, documented root command behavior and archive guardrails, and synchronized discovery/design/api/test/dev_log for re-review. | — | feature-review |
| 2026-05-21 14:25 PDT | feature-review (Codex gpt-5.3-codex inline) | Re-review APPROVED. Confirmed the revised plan is executable without reopening design decisions: build phases now have concrete file boundaries/gates, the archive package contract is frozen, and Turbo/root command behavior is specified tightly enough for implementation. | — | feature-auto-build |
| 2026-05-21 14:27 PDT | feature-auto-build (Codex gpt-5.3-codex inline) | Phase 1 — moved the Next.js shell from `apps/web` to `apps/release-site`, renamed the archive package to `@repo/release-site-archive`, demoted runtime scripts to `archive:*`, and added archive guardrails declaring `/console` as historical static mock and `@repo/web` as canonical host. Tests run: `test -d apps/release-site/app/console`; `test -f apps/release-site/README.md`; `rg -n "@repo/release-site-archive|archive-only|historical static mock|@repo/web" apps/release-site/package.json apps/release-site/README.md`; `jq '.scripts' apps/release-site/package.json`. | `f7c9de4` | feature-auto-build |
| 2026-05-21 14:29 PDT | feature-auto-build (Codex gpt-5.3-codex inline) | Phase 2 — rebuilt `apps/web` as canonical Vite package `@repo/web` with thin-host seams only (`src/main.tsx`, `src/routes/**`, `src/providers/**`, `src/pages/**`, `src/service-worker/**`, `src/styles/**`) and no archived Next `/console` content. Tests run: `test -f apps/web/index.html`; `test -f apps/web/src/main.tsx`; `rg -n '"name": "@repo/web"|vite|src/main.tsx' apps/web/package.json apps/web/vite.config.ts apps/web/src/main.tsx`; `test ! -d apps/web/app`. | `14f2597` | feature-auto-build |
| 2026-05-21 14:32 PDT | feature-auto-build (Codex gpt-5.3-codex inline) | Phase 3 — aligned Turbo outputs for mixed Vite/Next workspace (`dist/**` + `.next/**`), kept archive package out of default typecheck flow by renaming `check-types` to `archive:check-types`, and refreshed lockfile for new `@repo/web` graph. Tests run: `rg -n 'dist/\\*\\*|\\.next/\\*\\*' turbo.json`; `pnpm --filter @repo/web check-types` (pass); `pnpm --filter @repo/web build` (pass); `pnpm turbo run build` (pass); `pnpm turbo run check-types` (fails on pre-existing `@repo/plugin-widgets`/`@repo/plugin-clipboard` typecheck issues unrelated to this feature). | `26d1bf6` | feature-verify |
