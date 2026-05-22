# Roadmap Manifest — web-ticktick-parity

- Roadmap Source: docs/planning/sub-prds/web/PRD.md (DRAFT v0.3, 2026-05-16)
- Source Dev Plan: docs/planning/sub-prds/web/dev-plan.md (DRAFT v0.3, 2026-05-16)
- Step 0 Brief: docs/reviews/web-ticktick-parity/20260521-feature-brief.md
- Audit: docs/reviews/web-ticktick-parity-audit-2026-05-21.md
- Init Path: decompose
- Generated: 2026-05-21
- Default Automation Mode: A-Claude
- Default Dependency Semantics: shipped
- Default Verify Cross-vendor: no             # USER OVERRIDE — brief says cross-vendor verify not requested; security rows may be hand-edited to yes during review.
- Wave Concurrency Cap: 3                      # bg dispatch default; raise deliberately only after quota/worktree review.
- Manifest Review: REQUIRED                    # init stops here; review boundaries + dependency graph before run.

## Features

| # | Slug | Source | Depends On | Dep Semantics | Status | Automation Mode | Verify Cross-vendor | Last Run | Note |
|---|------|--------|------------|---------------|--------|-----------------|---------------------|----------|------|
| 1 | web-architecture-adr-lite | docs/reviews/web-architecture-adr-lite/20260521-roadmap-seed.md | — | — | SHIPPED | (default) | (default) | 2026-05-21 | SHIPPED 2026-05-21 · dev_log Status=SHIPPED, Current Phase=SHIP, roadmap reconciled by ship run. |
| 2 | web-plugin-map-contract-reconcile | docs/reviews/web-plugin-map-contract-reconcile/20260521-roadmap-seed.md | web-architecture-adr-lite | shipped | SHIPPED | (default) | (default) | 2026-05-21 | SHIPPED 2026-05-21 · dev_log Status=SHIPPED, Current Phase=SHIP, isolated scope push branch `ship/web-plugin-map-contract-reconcile`. |
| 3 | web-sync-crypto-contract-preflight | docs/reviews/web-sync-crypto-contract-preflight/20260521-roadmap-seed.md | web-architecture-adr-lite | shipped | SHIPPED | (default) | (default) | 2026-05-21 | SHIPPED 2026-05-21 · dev_log Status=SHIPPED, Current Phase=SHIP, commit `bc565ae` / ship evidence on `origin/main`. |
| 4 | web-external-env-provisioning | docs/reviews/web-external-env-provisioning/20260521-roadmap-seed.md | — | — | BLOCKED_EXTERNAL | (default) | (default) | — | W1 · EXTERNAL: domains/DNS, Vercel or CF project, OAuth redirect allowlists, Sentry/Vercel/Supabase secrets; blocks deployment, not local authoring. |
| 5 | web-release-site-archive-vite-shell | docs/reviews/web-release-site-archive-vite-shell/20260521-roadmap-seed.md | web-architecture-adr-lite, web-plugin-map-contract-reconcile | shipped | SHIPPED | (default) | (default) | 2026-05-21 | SHIPPED 2026-05-21 · dev_log Status=SHIPPED, Current Phase=SHIP, pushed to `origin/main` at `d094845`. |
| 6 | web-auth-device-session | docs/reviews/web-auth-device-session/20260521-roadmap-seed.md | web-sync-crypto-contract-preflight, web-release-site-archive-vite-shell | shipped | SHIPPED | (default) | (default) | 2026-05-21 | SHIPPED 2026-05-21 · dev_log Status=SHIPPED, Current Phase=SHIP, commits `690e766`..`d219bd1` plus batch ship-state docs commit. |
| 7 | web-browser-e2e-crypto-runtime | docs/reviews/web-browser-e2e-crypto-runtime/20260521-roadmap-seed.md | web-sync-crypto-contract-preflight, web-release-site-archive-vite-shell | shipped | SHIPPED | (default) | (default) | 2026-05-21 | SHIPPED 2026-05-21 · dev_log Status=SHIPPED, Current Phase=SHIP, commits `813205c`..`a789658` plus batch ship-state docs commit. |
| 8 | web-sync-blob-driver | docs/reviews/web-sync-blob-driver/20260521-roadmap-seed.md | web-sync-crypto-contract-preflight, web-release-site-archive-vite-shell, web-browser-e2e-crypto-runtime | shipped | PENDING | (default) | (default) | — | W4 · @repo/core-data driver-sync-blob implementing Repository over /sync/pull and /sync/push. |
| 9 | web-encrypted-indexeddb-cache | docs/reviews/web-encrypted-indexeddb-cache/20260521-roadmap-seed.md | web-browser-e2e-crypto-runtime, web-sync-blob-driver | shipped | SHIPPED | (default) | (default) | 2026-05-22 | SHIPPED 2026-05-22 · dev_log Status=SHIPPED, Current Phase=SHIP, implementation commit `48ca6ac` on `origin/main`. |
| 10 | web-console-host-router | docs/reviews/web-console-host-router/20260521-roadmap-seed.md | web-release-site-archive-vite-shell, web-sync-blob-driver, web-encrypted-indexeddb-cache | shipped | SHIPPED | (default) | (default) | 2026-05-22 | SHIPPED 2026-05-22 · dev_log Status=SHIPPED, Current Phase=SHIP, commits `6bbbf14`..`c8ce390` plus ship-state docs commit. |
| 11 | web-todo-first-slice | docs/reviews/web-todo-first-slice/20260521-roadmap-seed.md | web-auth-device-session, web-sync-blob-driver, web-encrypted-indexeddb-cache, web-console-host-router | shipped | PENDING | (default) | (default) | — | W7 · First real TickTick slice: Todo list/detail/create/update/complete over encrypted blobs, no mock. |
| 12 | web-realtime-metadata-sync | docs/reviews/web-realtime-metadata-sync/20260521-roadmap-seed.md | web-sync-crypto-contract-preflight, web-auth-device-session, web-sync-blob-driver, web-todo-first-slice | shipped | PENDING | (default) | (default) | — | W8 · sync:<account_id> metadata-only channel, seq gap detection, pull queue, polling fallback, 5s visibility target. |
| 13 | web-offline-outbox-conflicts | docs/reviews/web-offline-outbox-conflicts/20260521-roadmap-seed.md | web-sync-blob-driver, web-encrypted-indexeddb-cache, web-todo-first-slice, web-realtime-metadata-sync | shipped | PENDING | (default) | (default) | — | W9 · Encrypted pending_mutations, dead-letter, replay order, 409 three-way diff UI. |
| 14 | web-productivity-habits-pomodoro | docs/reviews/web-productivity-habits-pomodoro/20260521-roadmap-seed.md | web-console-host-router, web-todo-first-slice, web-realtime-metadata-sync | shipped | PENDING | (default) | (default) | — | W9 · Habit and Pomodoro browser modules plus productivity state integration. |
| 15 | web-project-label-calendar | docs/reviews/web-project-label-calendar/20260521-roadmap-seed.md | web-console-host-router, web-todo-first-slice, web-realtime-metadata-sync | shipped | PENDING | (default) | (default) | — | W9 · Project boards, labels, and calendar browser modules over the same encrypted data plane. |
| 16 | web-search-keyboard-theme | docs/reviews/web-search-keyboard-theme/20260521-roadmap-seed.md | web-encrypted-indexeddb-cache, web-console-host-router, web-todo-first-slice, web-realtime-metadata-sync | shipped | PENDING | (default) | (default) | — | W10 · Global search, browser-safe shortcuts, theme/density/settings storage split. |
| 17 | web-statistics-views | docs/reviews/web-statistics-views/20260521-roadmap-seed.md | web-todo-first-slice, web-productivity-habits-pomodoro, web-project-label-calendar, web-search-keyboard-theme | shipped | PENDING | (default) | (default) | — | W10 · TickTick-style statistics/reporting surfaces derived locally from decrypted data. |
| 18 | web-responsive-mobile | docs/reviews/web-responsive-mobile/20260521-roadmap-seed.md | web-console-host-router, web-todo-first-slice, web-productivity-habits-pomodoro, web-project-label-calendar | shipped | PENDING | (default) | (default) | — | W10 · Desktop/tablet/mobile breakpoints, mobile read/minimal-edit mode, a11y and safe-area rules. |
| 19 | web-device-management-revoke | docs/reviews/web-device-management-revoke/20260521-roadmap-seed.md | web-auth-device-session, web-realtime-metadata-sync, web-todo-first-slice | shipped | PENDING | (default) | (default) | — | W10 · Device list, revoke others, cross-tab session sync, revoked-device 403 interception. |
| 20 | web-security-csp-sentry | docs/reviews/web-security-csp-sentry/20260521-roadmap-seed.md | web-release-site-archive-vite-shell, web-auth-device-session, web-browser-e2e-crypto-runtime, web-console-host-router | shipped | PENDING | (default) | (default) | — | W11 · CSP Report-Only/enforce, nonce edge, security headers, Sentry privacy redaction and sourcemaps. |
| 21 | web-export-delete-privacy | docs/reviews/web-export-delete-privacy/20260521-roadmap-seed.md | web-auth-device-session, web-browser-e2e-crypto-runtime, web-sync-blob-driver, web-console-host-router, web-device-management-revoke | shipped | PENDING | (default) | (default) | — | W11 · Client-side zero-knowledge export, account deletion/undelete, consent, privacy/legal pages. |
| 22 | web-pwa-sw-release | docs/reviews/web-pwa-sw-release/20260521-roadmap-seed.md | web-offline-outbox-conflicts, web-security-csp-sentry | shipped | PENDING | (default) | (default) | — | W11 · Service worker, app manifest, update prompt, emergency kill/reset, PWA install behavior. |
| 23 | web-i18n-seo-landing | docs/reviews/web-i18n-seo-landing/20260521-roadmap-seed.md | web-release-site-archive-vite-shell, web-console-host-router, web-responsive-mobile | shipped | PENDING | (default) | (default) | — | W11 · Landing/auth/legal SEO, sitemap/robots/meta, zh-CN/zh-TW/en resources. |
| 24 | web-deploy-ci-browser-matrix | docs/reviews/web-deploy-ci-browser-matrix/20260521-roadmap-seed.md | web-external-env-provisioning, web-release-site-archive-vite-shell, web-console-host-router, web-realtime-metadata-sync, web-security-csp-sentry, web-pwa-sw-release, web-i18n-seo-landing | shipped | PENDING | (default) | (default) | — | W12 · GitHub Actions, Vercel/CF staging/prod, Playwright matrix, Lighthouse/size gates, RUM. |
| 25 | web-ga-acceptance-suite | docs/reviews/web-ga-acceptance-suite/20260521-roadmap-seed.md | web-offline-outbox-conflicts, web-statistics-views, web-responsive-mobile, web-device-management-revoke, web-security-csp-sentry, web-export-delete-privacy, web-pwa-sw-release, web-i18n-seo-landing, web-deploy-ci-browser-matrix | shipped | PENDING | (default) | (default) | — | W13 · Roadmap exit gate: PRD §10.1/§10.2 and brief acceptance criteria all pass or carry-over is explicit. |

## Decomposition Rationale

### R1. Source and init path

`Init Path: decompose`. The source is a raw Web PRD plus dev-plan, not a pre-decomposed roadmap. The PRD is high-risk and cross-cutting: browser auth, zero-knowledge Sync blob access, local encrypted cache/search, Realtime, offline conflict handling, PWA/SW, CSP/Sentry, privacy/export, deployment, and TickTick-level module parity. The Step 0 brief and audit are treated as reviewed context and are referenced in the manifest header.

### R2. Highest-priority decision boundary

The first row is `web-architecture-adr-lite` because the user explicitly chose a clean Web rewrite, while ADR-0003 is Accepted and says all three faces reuse platform-neutral plugins. This is not a small implementation detail: it controls whether the rest of the roadmap targets plugin reuse, a full Web-only product layer, or a hybrid of shared data/contracts with Web-specific UI. `ADR-0006` now records the chosen hybrid rule; later rows should follow that stance rather than reopen the root debate.

### R3. Structural context read

- `docs/PLUGIN_MAP.md` is stale for this scope: it still lists todo/pomodoro/habits as planned independent plugins, while live packages include `packages/plugin-productivity/`, `plugin-console/`, `plugin-project/`, `plugin-labels/`, and `plugin-calendar/`; several have `docs/dev_log.md` status `READY_FOR_VERIFY`.
- Current `apps/web/package.json` is a Next.js 16 app named `web`, not the PRD's Vite SPA `@repo/web`. The audit says it is a marketing/RC shell plus Sync security display, and `/console` is static mock content.
- `@repo/core` exists and is Stable; `@repo/core-data` exists and is In-Dev with Repository/SQLite work, but the Sync blob driver is not present as a Web-ready implementation.
- Sync W0-W3 artifacts are largely shipped in roadmap history, but live remote provisioning remains a separate external concern. This is why `web-external-env-provisioning` is modeled as `BLOCKED_EXTERNAL` and only hard-blocks deployment/CI rows.

### R4. Feature boundaries

Rows are cut so each one is a plausible `xai-feature-full-loop` feature with one dominant ownership boundary:

- W0/W1 rows are architecture, registry, and contract preflight. They prevent later code from being built on stale ADR/PLUGIN_MAP assumptions.
- W2-W8 rows build the browser platform spine: Vite shell, auth/device session, browser crypto runtime, Sync blob driver, encrypted local cache/search, host/router, first Todo slice, and Realtime metadata sync.
- W9-W10 rows extend product parity: offline conflicts, productivity modules, project/label/calendar, search/keyboard/theme, statistics, responsive/mobile, and device-management UX.
- W11-W13 rows harden and release: CSP/Sentry, export/delete/privacy, PWA/SW, i18n/SEO/landing, deploy/CI/browser matrix, and final GA acceptance.

### R5. Dependency edges

Edges are based on contracts and shared write risk:

- All implementation rows depend on the ADR decision either directly or through `web-release-site-archive-vite-shell`.
- Sync/data rows depend on `web-sync-crypto-contract-preflight` and `web-browser-e2e-crypto-runtime` because blob encryption/AAD/index key behavior must match Sync W0-W3.
- UI module rows depend on `web-console-host-router` and the first real Todo slice, so they do not recreate static mocks.
- Realtime unlocks multi-module and device-management rows because the PRD requires desktop ↔ Web visibility and remote revoke semantics.
- Deployment depends on external environment provisioning; local authoring rows do not.

### R6. User-provided mode choices

The brief says `Automation Mode: A-Claude` and `Verify Cross-vendor: no`. These are applied as manifest defaults without an extra question in this init run. Risk note: rows touching crypto, Sync, CSP, and privacy (`web-sync-crypto-contract-preflight`, `web-browser-e2e-crypto-runtime`, `web-sync-blob-driver`, `web-security-csp-sentry`, `web-export-delete-privacy`, `web-ga-acceptance-suite`) are good candidates for hand-editing `Verify Cross-vendor` to `yes` during manifest review.

### R7. Assumptions and still-uncertain items

- Resolved by `ADR-0006`: preserve the clean-rewrite direction at Web shell/view-layer scope, but keep shared contracts and Console UI truth as hard boundaries.
- Assumption: "现 apps/web 归档为 release-site" means preserve useful RC/marketing/Supabase assets, but remove it as the truth source for the Web Console. The exact folder name is left to `web-release-site-archive-vite-shell`.
- Assumption: external provisioning is not available from this Codex session and should not block local docs/code planning. The deployment row depends on it; earlier rows can use local mocks/dev env.
- Resolved by `ADR-0006`: Console PRD remains the UI truth source for shared modules; browser-specific deviations must be documented feature by feature.
- Still uncertain: whether browser crypto should share WASM with Rust primitives or be independent WebCrypto/hash-wasm plus shared vectors. `web-sync-crypto-contract-preflight` owns that decision.

### R8. Companion artifacts

Per-feature seed briefs were written under `docs/reviews/<slug>/20260521-roadmap-seed.md`. These are roadmap seeds only; each feature still needs its own Step 0 brief/discovery inside `xai-feature-full-loop`.

## Wave Summary

Computed from `Depends On` + `Status` at init time:

- wave 0: `web-architecture-adr-lite`
- wave 1: `web-plugin-map-contract-reconcile`, `web-sync-crypto-contract-preflight`
- wave 2: `web-release-site-archive-vite-shell`
- wave 3: `web-auth-device-session`, `web-browser-e2e-crypto-runtime`
- wave 4: `web-sync-blob-driver`
- wave 5: `web-encrypted-indexeddb-cache`
- wave 6: `web-console-host-router`
- wave 7: `web-todo-first-slice`, `web-security-csp-sentry`
- wave 8: `web-realtime-metadata-sync`
- wave 9: `web-offline-outbox-conflicts`, `web-productivity-habits-pomodoro`, `web-project-label-calendar`, `web-search-keyboard-theme`, `web-device-management-revoke`
- wave 10: `web-statistics-views`, `web-responsive-mobile`, `web-export-delete-privacy`, `web-pwa-sw-release`
- wave 11: `web-i18n-seo-landing`
- blocked external: `web-external-env-provisioning`
- blocked until external row is released: `web-deploy-ci-browser-matrix`, then `web-ga-acceptance-suite`

## Review Gate

- Review this manifest before running. On this decompose path, review is substantive: sign off on feature boundaries, dependencies, and the ADR-first stance.
- If a future reviewer wants to overturn the hybrid rule, do it by revising `ADR-0006` first; later rows should not change stance implicitly.
- For every later Web row, document any browser-only deviation from Console PRD in that row's docs and cite `ADR-0006`.
- Next Step:

```text
/xai-roadmap-loop
manifest: docs/workflow/roadmap/web-ticktick-parity.md
```
