# design.md — xai-admin-deploy-observability (roadmap row #6, FINAL)

> Decision snapshot ONLY (discovery detail lives in the review doc, not here).
> Surface: `apps/admin/` (SHIPPED isolated Web-line app). Final hardening slice of the 6-row
> `xai-admin-dashboard-system-integration` manifest — "before promoting beyond prototype".
> Does NOT overwrite prior rows' docs (shell / data-contracts-rbac / users-orgs-billing /
> feature-ai-provider-control / audit-ops-queue all stay intact).

## Decision snapshot

| Field | Value |
|---|---|
| **Selected Option (observability)** | D1=A — typed no-op `AdminTelemetrySink` interface + `noopTelemetrySink` default + `AdminErrorBoundary`; real sink is a documented future swap behind the interface. NO Sentry dep, NO DSN, NO network/secret this slice |
| **Selected Option (deploy isolation)** | D2=A — hermetic source-text + config assertion tests (admin Pages project name ≠ web's; self-contained `wrangler.toml`; `dist/_headers`==`public/_headers`; admin not imported by `apps/web/src`). Runtime account separation documented in the runbook |
| **Selected Option (doc landing)** | D3=A — `manual-smoke-checklist.md` + `release-operator-runbook.md` both under `apps/admin/docs/deploy-observability/` |
| **Selected Option (lint, RR-1)** | D4=A — `apps/admin/eslint.config.js` extends `@repo/eslint-config/react-internal` (mirror `apps/web/eslint.config.js`); scoped overrides only; lint green at `--max-warnings 0` |
| **Review Doc Path** | `docs/reviews/xai-admin-deploy-observability/20260606-discovery-review.md` |
| **Review Date / Version** | 2026-06-06 / v1 (discovery) |
| **Product module** | `admin` (#6) · operator-activated whole line 2026-06-06 · roadmap row #6 of 6 (FINAL) |
| **Depends on** | row #5 `xai-admin-audit-ops-queue` (hard) — SHIPPED; rows #1–#4 SHIPPED |
| **Branch convention** | `codex/admin/<feature>` |
| **D3 classification** | **W0 (web-only)** — no shared `@repo/*` change; no `apps/web` deploy-config change; no `dev` promotion |
| **Cross-window contract impact** | NONE — no new `@repo/core/src/events`; no Tauri command changes |

## Scope decision (final hardening, contract/scaffold + doc + tooling)

Row #6 delivers, before any promotion beyond prototype:
1. **Deployment isolation checks** — verify/harden the separate Cloudflare Pages project + independent CSP/env/deploy from slice #1; add tests that assert the isolation holds.
2. **CSP / env checks** — extend the slice-#1 `csp.test.ts`; add an env guard that no secret-shaped value or secret-named `VITE_` var exists. Align with ADR-0008.
3. **Observability scaffold** — pluggable no-op telemetry sink + error boundary; NO real DSN/secret in the browser bundle; real backend wiring deferred to operator.
4. **Manual browser smoke checklist** — human-runnable doc covering the 10 pages (tables/filters/drawers/dialogs/type-to-confirm/focus traps/mobile); automate the cheaply-automatable.
5. **Release / operator runbook** — the promotion-gate doc (deploy steps, deferred PR/merge + branch-topology decision, server-side env/secret setup, rollback). Documents promotion; does NOT perform it.
6. **(RR-1 fold-in)** — `apps/admin/eslint.config.js` so `pnpm --filter @repo/admin lint` works (clears task_1a68bff9). Keep lint green.

## Frozen assumptions (lock at plan acceptance — change requires Revise or a follow-up row)

1. **No real deploy** — no `wrangler pages deploy`, no Pages project creation, no admin GitHub Action this slice. The runbook documents how; the operator does it.
2. **No real telemetry backend** — no Sentry DSN, no ingest host added to CSP `connect-src`, no network sink. Observability = a no-op interface + error boundary only.
3. **No promotion** — no PR opened/merged into `web` / `desktop-next` / `dev`. The branch-topology + PR decision is documented as an operator-gated step (ADR-0013 §D2/§D5). The admin *line* is operator-activated; promoting the *surface beyond prototype* is a separate operator call.
4. **No secret in the browser** — no service-role creds, provider keys, or telemetry secrets in any bundle (asserted by extended guards). No `syncScope` entity (ADR-0013 §D4 deferred — admin has no cloud-sync entity).
5. **W0 boundary** — admin-side only. No `@repo/web-auth-device-session` or other `@repo/*` change; no `apps/web` deploy-config change (admin has its own `wrangler.toml` / `_headers`); no `@repo/core/src/events`; no Tauri.
6. **Reuse only** — OKLCH tokens (`@repo/plugin-web-tokens`) + `@repo/ui`; NO Tailwind/Tremor dep; NO new runtime dependency. The eslint config reuses `@repo/eslint-config`.
7. **Prior rows immutable** — all prior rows' pages/suites stay byte-identical and green. `pnpm --filter @repo/web build` stays green.
8. **Observability scaffold default is provably no-op** — `noopTelemetrySink` performs no network, no storage, no console-secret; the `AdminErrorBoundary` renders a CSP-clean fallback and forwards to the injected sink.
9. **Deploy-isolation enforcement is in-repo only** — runtime Cloudflare account separation is an operator/dashboard fact recorded in the runbook, not testable in-repo this slice.
10. **Doc landing** — the four-piece + `manual-smoke-checklist.md` + `release-operator-runbook.md` all live under `apps/admin/docs/deploy-observability/`. An optional one-line pointer in `docs/runbooks/` is non-blocking follow-up, not a hard deliverable.

## ADR-lite cross-reference (no standalone ADR; recorded here)

- **Deploy boundary** is the clean **extension** of ADR-0008's Cloudflare-Pages + `_headers` mechanism already recorded in `apps/admin/docs/design.md` §ADR-lite #1 (slice #1). Row #6 does **not** change ADR-0008's `apps/web` `_headers` content; it only *verifies* the admin isolation and documents the operator promotion gate. ADR-0008 §S3/§S6 extension protocol (amend record → extend `_headers` → update snippet → write csp guard test) continues to govern any future admin `_headers` change. No ADR-0008 amendment is required this slice (recommended in OQ5; left as a runbook cross-reference).
- **Promotion governance** follows ADR-0013 §D2 (branch topology — `desktop-next` / `desktop-plugin-next` / `release/*` are DEFINED not yet created; creating them is a separate operator-confirmed step) and §D5 (`web`/`dev` are independent focus branches). The runbook records the deferred PR/merge + branch-topology decision as operator-gated.

## Dependency overview

| Direction | Dependency | State | Mode this slice |
|---|---|---|---|
| Internal (extends) | slice #1 deploy boundary (`wrangler.toml`, `public/_headers`, `.env.example`, `csp.test.ts`, `no-secret*.test.ts`) | SHIPPED | Verified/hardened + tests extended (NOT forked) |
| Internal (reuses) | rows #2–#5 read models / RBAC / audit / ops-queue / pages | SHIPPED | Untouched; suites stay green |
| Upstream (reuses) | `@repo/eslint-config` (`/react-internal`) | Stable | `eslint.config.js` extends it (RR-1) |
| Upstream (reuses) | `@repo/plugin-web-tokens` / `@repo/ui` | Stable | Error-boundary fallback uses existing OKLCH tokens; no new dep |
| Governance | ADR-0008 (Cloudflare deploy/CSP) | Accepted | Cross-referenced; not amended this slice |
| Governance | ADR-0013 (branch/sync governance, W0) | Accepted | Promotion gate documented as operator-gated |
| Doc authority | prototype `docs/prototypes/admin-dashboard/` + INTEGRATION_PLAN §4.6 + Verification Gates | n/a | Source of the smoke-checklist surface inventory + the row #6 deliverable list |

## Directory shape (planned additions only — prior files untouched)

```
apps/admin/
  eslint.config.js                         # NEW (RR-1) — extends @repo/eslint-config/react-internal
  src/
    observability/                          # NEW
      telemetry.ts                          # AdminTelemetrySink interface + noopTelemetrySink (default)
      telemetry.test.ts                     # default sink does nothing (no network/storage)
      AdminErrorBoundary.tsx                # class error boundary → injected sink; CSP-clean fallback
      AdminErrorBoundary.test.tsx           # catches + forwards + renders fallback
    __tests__/
      deploy-isolation.test.ts              # NEW — project-name ≠ web; self-contained wrangler.toml; dist==public _headers; admin not imported by apps/web
      env-no-secret.test.ts                 # NEW — .env* + VITE_ var-name secret guard
      no-telemetry-secret.test.ts           # NEW — no Sentry-DSN-shaped literal in src + dist
      csp.test.ts                           # EXTENDED (existing) — default-src/script-src/base-uri/form-action/upgrade-insecure + no unsafe-*/*
    App.tsx                                  # MODIFIED — wrap root in AdminErrorBoundary (below guard)
  docs/
    deploy-observability/                    # NEW (this row's four-piece + the two operator docs)
      design.md                              # this file
      api.md
      test.md
      dev_log.md
      manual-smoke-checklist.md              # human-runnable smoke checklist (10 pages)
      release-operator-runbook.md            # promotion-gate runbook (deploy/rotate/rollback + deferred PR/branch decision)
```
