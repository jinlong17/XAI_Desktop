# dev_log.md — xai-admin-deploy-observability (roadmap row #6, FINAL)

> Workflow state machine + breakpoint continuity. Top panel = overwrite; Work Log = append-only.
> This is the row-#6 dev_log. Prior rows have their own dev_logs (do NOT overwrite them).

## Status Panel

| Field | Value |
|---|---|
| **Workflow** | FEATURE_DEV |
| **Target** | xai-admin-deploy-observability |
| **Title** | Admin Deploy Isolation + CSP/Env Hardening + Observability Scaffold + Promotion-Gate Runbook (row #6, FINAL) |
| **Current Phase** | FEATURE_BUILD |
| **Status** | APPROVED — P1 DONE, P2–P4 PENDING |
| **Executor** | claude-opus-4-8 (feature-dev-loop · inline feature-auto-build, no-spawn runtime) |
| **Updated** | 2026-06-06 07:34 |
| **Suggested Next** | feature-auto-build (continue P2) |
| **Automation Mode** | inline-host (Task/agent-spawn tool unavailable this runtime; orchestrator inline-executes worker role) |
| **Blockers** | — |
| **Module** | `admin` (#6) · operator-activated whole line 2026-06-06 · roadmap row #6 of 6 (FINAL) |
| **Branch** | `codex/admin/<feature>` (currently worktree `claude/frosty-nash-c4bf16`) |
| **Depends on** | row #5 `xai-admin-audit-ops-queue` (hard) — SHIPPED; rows #1–#4 SHIPPED |
| **D3** | W0 (web-only) — no shared `@repo/*` change; no `apps/web` deploy-config change; no `dev` promotion |

## Phase Plan (for feature-build — ONE phase per run)

> `feature-build` runs exactly one phase per invocation, then stops for human confirmation.
> Order locks the isolation/CSP/env facts first, adds the only new runtime code (kept tiny +
> secret-free) next, documents it, then closes the tooling gap + runs the full quality gate.

| Phase | Goal | Key deliverables | Acceptance gate | Est. commits |
|---|---|---|---|---|
| **P1 — Deploy isolation + CSP/env checks** | Lock isolation + tight-CSP + no-secret-env invariants with tests | `src/__tests__/deploy-isolation.test.ts` (TT-ISO-PROJECT-NAME/SELF-CONTAINED/OUTPUT-DIR/HEADERS-PARITY/NO-CROSS-IMPORT); EXTEND `src/__tests__/csp.test.ts` (TT-CSP-DEFAULT-SRC/SCRIPT-SRC-TIGHT/BASE-URI/FORM-ACTION/UPGRADE/NO-WILDCARD); `src/__tests__/env-no-secret.test.ts` (TT-ENV-NO-SECRET-VALUE/VARNAME) | New + extended tests green; full admin suite green; `apps/web` build unaffected | 1 |
| **P2 — Observability scaffold (no-op, secret-free)** | Pluggable telemetry seam + error boundary, default no-op | `src/observability/telemetry.ts` (`AdminTelemetrySink` + `noopTelemetrySink`), `src/observability/AdminErrorBoundary.tsx`, wire boundary at app root in `App.tsx` (below guard); `telemetry.test.ts` (TT-TELEMETRY-NOOP/NO-THROW/NO-SECRET-FIELD), `AdminErrorBoundary.test.tsx` (TT-ERRORBOUNDARY-CATCH/PASSTHROUGH/FALLBACK-CLEAN/DEFAULT-SINK), `src/__tests__/no-telemetry-secret.test.ts` (TT-NO-TELEMETRY-SECRET-SRC/BUNDLE) | Scaffold tests green; existing no-secret/bundle/provider-key guards still green; build green; `dist` DSN-free | 1–2 |
| **P3 — Manual-smoke checklist + release/operator runbook docs** | Human-runnable smoke doc + promotion-gate runbook | `apps/admin/docs/deploy-observability/manual-smoke-checklist.md` (10-page scenarios, PASS/FAIL + browser-version rows); `apps/admin/docs/deploy-observability/release-operator-runbook.md` (setup/deploy/rotate/rollback + Promotion Gate: deferred PR/merge + branch-topology decision + server-side secret setup + isolation re-check). Update this four-piece | Both docs present + internally consistent; runbook marks promotion operator-gated (does NOT itself promote) | 1 |
| **P4 — ESLint flat config (RR-1) + final full gate** | Clear RR-1; whole quality gate green | `apps/admin/eslint.config.js` (extends `@repo/eslint-config/react-internal`, mirror `apps/web`); scoped overrides only; final: `pnpm --filter @repo/admin lint` (exit 0, `--max-warnings 0`), `tsc --noEmit` clean, `pnpm --filter @repo/admin test` green, `pnpm --filter @repo/admin build` green, `pnpm --filter @repo/web build` green | All four commands green; set `READY_FOR_VERIFY` | 1 |

> Phase order rationale: P1 locks the in-repo isolation/CSP/env invariants the runbook will cite;
> P2 adds the only new runtime code (a no-op, secret-free seam) + proves the no-DSN invariant; P3
> writes the docs describing P1+P2 and the operator promotion gate; P4 closes the long-standing
> lint gap (RR-1) and runs the entire quality gate over the finished surface.

## Risks (carry into review)

- **R1 (MED)** eslint flat config surfaces pre-existing lint findings in never-linted admin source →
  P4 isolated; fix with scoped overrides / justified inline disables, never global rule-off; a
  finding implying a real bug gets recorded, not silently suppressed. (`onlyWarn` downgrades to
  warnings, but `--max-warnings 0` still gates on them.)
- **R2 (MED)** observability scaffold accidentally adds a secret/network surface → default sink is
  provably no-op (TT-TELEMETRY-NOOP spies fetch/storage); TT-NO-TELEMETRY-SECRET-{SRC,BUNDLE} scan
  for a Sentry-DSN shape; CSP stays `connect-src 'self'`.
- **R3 (LOW)** `dist/_headers` parity test brittle to Vite copy behavior → that is the point (catches
  any mutation); reads both files + compares trimmed; self-building like existing guards.
- **R4 (LOW)** runbook drift vs `docs/runbooks/cloudflare.md` → admin runbook cross-references
  ADR-0008 + the web runbook for shared mechanics; only adds admin isolation + promotion-gate content.
- **R5 (LOW)** "promotion" ambiguity (line is operator-activated, but promoting the surface beyond
  prototype is a separate operator call) → runbook states this explicitly; the slice does not promote.

## Open questions for feature-review

- **OQ1** — Confirm the isolation signal: project-name `xai-admin-dashboard` ≠ `xai-web-console`, plus
  assert admin `wrangler.toml` has no `[vars]`/`[[secrets]]`/`account_id` (recommend yes; none today).
- **OQ2** — Confirm observability lives at `apps/admin/src/observability/` and `AdminErrorBoundary`
  wires at the app root below the guard (recommend yes — a render error never exposes admin content
  on a non-admin session).
- **OQ3** — Confirm the Sentry-DSN guard shape: `https://<key>@<org>.ingest.sentry.io/<projectId>`
  + bare `ingest.sentry.io` host, scanned over src + dist (recommend yes).
- **OQ4** — Confirm doc landing: both docs under `apps/admin/docs/deploy-observability/`; optional
  one-line pointer in `docs/runbooks/` as non-blocking follow-up (recommend the pointer optional).
- **OQ5** — Confirm: NO ADR-0008 amendment this slice (row #6 does not change `apps/web`'s `_headers`;
  the admin deploy boundary + promotion gate are recorded in the runbook + slice-#1 ADR-lite #1).
  Recommend runbook cross-reference only.

## Review Notes (feature-review · 2026-06-06 · APPROVED)

Verdict: **APPROVED** — executable with no blocking ambiguity. Verified against the 8 review gates
with source ground-truth reads (not just the plan's self-claims):

- **G1 deploy isolation + CSP/env (AC-1/AC-2)** — `wrangler.toml` confirms project `xai-admin-dashboard`
  ≠ web `xai-web-console` (ADR-0008 §S6), `pages_build_output_dir="./dist"`, NO `[vars]`/`[[secrets]]`/
  `account_id`. The 5 isolation asserts are all in-repo + hermetic; runtime account separation correctly
  deferred to runbook (assumption #9). CSP-extension targets (`default-src`/`script-src`/`base-uri`/
  `form-action`/`upgrade-insecure-requests` + no `unsafe-*`/`*`) ALL already present in `public/_headers`
  → the extension hardens existing posture. Env guard matches `.env.example` ground truth.
- **G2 observability (AC-3)** — D1=A is correct (mirrors the rows #2–#5 typed-seam pattern). The
  `AdminTelemetrySink` interface carries NO DSN/endpoint/token field; `no-telemetry-secret.test.ts`
  adds a Sentry-DSN shape NOT covered by the existing bundle guard (verified `no-secret-bundle.test.ts`
  has no Sentry pattern today → genuine complement, not dup). **Crux check holds:** ADR-0008 §S6 added
  `https://*.ingest.sentry.io` to the WEB CSP only; the admin `_headers` correctly stays `connect-src 'self'`
  and the plan keeps it so — the no-op/no-ingest-host posture is internally consistent.
- **G3 smoke + runbook (AC-4/AC-5)** — both land under `apps/admin/docs/deploy-observability/` (D3=A);
  runbook documents promotion + explicitly does NOT promote (R5/assumption #3); `docs/runbooks/cloudflare.md`
  precedent confirmed in ADR-0008 §S6.
- **G4 RR-1 eslint (AC-6)** — preset confirmed: `@repo/eslint-config/react-internal` export exists;
  `base.js` ignores `dist/**` + has `onlyWarn`; `apps/web/eslint.config.js` is a valid mirror; `package.json`
  already declares `lint` + the dep. R1 correctly isolated to P4 with scoped-override discipline; the
  `--max-warnings 0` gate is genuine despite `onlyWarn`.
- **G5 scope** — no bleed; only new runtime code is the tiny no-op seam + error boundary. Assumptions
  #1–#10 lock no-deploy/no-backend/no-secret/no-promotion.
- **G6 W0/boundary** — admin-side only; `useWebAuthSession` already wired read-only in `App.tsx`
  (`AdminRouteGate` is the outermost wrapper → error boundary mounting below it is correct); no shared
  `@repo/*` / `apps/web` deploy-config / `@repo/core/src/events` / Tauri change.
- **G7 secrets/syncScope** — existing `no-secret`/`no-secret-bundle`/`no-provider-key` guards (verified
  to cover `sk-`/`AIza`/`service_role`/masked) stay green; telemetry guard adds the DSN shape. No
  `syncScope` entity (D4 deferred). Prior rows byte-identical.
- **G8 phasing + doc-contract** — 4 phases independently verifiable, correctly ordered (invariants →
  scaffold → docs → tooling/full-gate); AC-1..AC-6 each map to named binary tests; design/api/test/dev_log
  mutually consistent; required dev_log fields maintained.

**OQ1–OQ5 — all five planner recommendations CONFIRMED:** OQ1 assert both project-name inequality AND
absence of `[vars]`/`[[secrets]]`/`account_id` (none today — confirmed); OQ2 `src/observability/` + boundary
below `AdminRouteGate` (confirmed guard is outermost in `App.tsx`); OQ3 Sentry-DSN shape + bare
`ingest.sentry.io` host over src+dist; OQ4 both docs in row folder, `docs/runbooks/` pointer optional;
OQ5 runbook cross-reference only, NO ADR-0008 amendment (correct — row #6 does not change `apps/web`'s
`_headers` and the §S3/§S6 extension protocol is preserved verbatim).

**Non-blocking recommendations for feature-build (REC, not blockers):**

- **REC-1 (P1, HEADERS-PARITY robustness)** — the `dist/_headers == public/_headers` check must be
  self-building like the existing `no-secret-bundle.test.ts` (run `vite build` in `beforeAll` only if
  `dist/` is absent, 180s timeout) so it is hermetic on a fresh checkout / CI-before-build. Compare
  trimmed content (the existing guards trim) to avoid trailing-newline flakiness — this is the R3
  mitigation; make it explicit in the test.
- **REC-2 (P1, ISO-NO-CROSS-IMPORT scope)** — scan `apps/web/src/**` for both `apps/admin` (relative/path)
  AND `@repo/admin` (package name) import specifiers; `@repo/admin` is `private:true` so a real import
  would also be a workspace-resolution error, but assert the source-text form so the guard is self-evident.
  (Optional, non-blocking: a symmetric note that `packages/core` must not import admin either — already
  covered by api.md §7; no extra test required.)

## Phase Progress

| Phase | Status | Commit |
|---|---|---|
| P1 — Deploy isolation + CSP/env checks | DONE | `__P1_HASH__` |
| P2 — Observability scaffold (no-op, secret-free) | PENDING | — |
| P3 — Manual-smoke checklist + release/operator runbook docs | PENDING | — |
| P4 — ESLint flat config (RR-1) + final full gate | PENDING | — |

## Work Log (append-only)

### Round 1 — 2026-06-06 04:10 · feature-plan (Fresh)

- **Executor**: claude-opus-4-8 (feature-plan)
- **Action**: Planned the FINAL roadmap row (#6 `xai-admin-deploy-observability`) for the
  operator-activated admin line. Read the manifest (row #6 + Verification Gates), INTEGRATION_PLAN
  §4.6 + §3 (deploy isolation), the SHIPPED slice-#1 deploy boundary (`wrangler.toml` project
  `xai-admin-dashboard`, tight `public/_headers` CSP `connect-src 'self'`, `.env.example`,
  `csp.test.ts`, `no-secret.test.ts`), the SHIPPED `no-secret-bundle.test.ts` + `no-provider-key.test.ts`
  + `vite.config.ts` (`sourcemap: false`), ADR-0008 (Cloudflare deploy/CSP + runbook precedent
  `docs/runbooks/cloudflare.md`), ADR-0013 (W0 + branch topology §D2/§D5), the RR-1 follow-up gap
  (no `eslint.config.js`; precedent `apps/web/eslint.config.js` + `@repo/eslint-config/react-internal`,
  `base.js` already ignores `dist/**`), and the prototype README (10-page smoke surface).
- **Findings driving the plan**:
  - Deploy isolation + tight CSP + no-secret bundle already EXIST (shipped) → row #6 *verifies/hardens
    + adds tests* (isolation assertions, CSP extension, env guard, Sentry-DSN guard); it does NOT fork
    the slice-#1 deploy boundary.
  - Observability = a NEW pluggable no-op `AdminTelemetrySink` + `AdminErrorBoundary` (no Sentry dep,
    no DSN, no network/secret) — the only new runtime code, kept tiny + provably secret-free.
  - RR-1 (task_1a68bff9) folds in as P4: `apps/admin/eslint.config.js` mirroring `apps/web`.
  - Promotion-beyond-prototype is operator-gated (ADR-0013 §D2/§D5) — documented in the runbook,
    NOT performed by the slice.
- **Decisions frozen**: D1 (no-op telemetry sink + error boundary), D2 (hermetic isolation tests),
  D3 (both docs under `apps/admin/docs/deploy-observability/`), D4 (eslint extends `@repo/eslint-config/react-internal`).
- **Wrote**: discovery review (`docs/reviews/xai-admin-deploy-observability/20260606-discovery-review.md`)
  + this four-piece (design.md decision snapshot + frozen assumptions + ADR-lite cross-ref + dir shape;
  api.md telemetry/boundary/isolation/CSP/env/DSN-guard contracts + security semantics; test.md
  AC-1..AC-6 → named-test mapping + coverage + mock strategy + gates; this dev_log).
- **Scope guards recorded**: contract/scaffold + doc + tooling only — NO real deploy, NO real
  telemetry backend, NO secret in browser, NO promotion, NO syncScope entity. W0: admin-side only;
  no `@repo/*` change; no `apps/web` deploy-config change; no `@repo/core/src/events`; no Tauri.
  Reuse OKLCH tokens + `@repo/ui`; no Tailwind/Tremor; keep all prior rows' pages byte-identical +
  suites green; keep `pnpm --filter @repo/web build` green.
- **Commits**: — (planning artifacts only; no code; worktree `claude/frosty-nash-c4bf16`)
- **Tests**: — (none run; planning phase)
- **Risks**: see Risks section (R1/R2 MED).
- **Handoff / Next step**: feature-review — review the discovery report + design/api/test/dev_log;
  verify the W0 boundary, the 4-phase ordering, the isolation/CSP/env assertion set, the no-op
  secret-free observability seam + Sentry-DSN guard, the manual-smoke + promotion-gate runbook plan,
  and the RR-1 eslint fold-in; resolve OQ1–OQ5; give APPROVED or REVISE.

### Round 2 — 2026-06-06 05:05 · feature-review (APPROVED)

- **Executor**: claude-opus-4-8 (feature-review)
- **Action**: Reviewed the Fresh plan for the FINAL roadmap row (#6) against the 8 review gates.
  Read source ground-truth (not just plan self-claims): `wrangler.toml` (project name + no
  vars/secrets/account_id), `public/_headers` (CSP-extension targets already present), `.env.example`
  (non-secret vars), `vite.config.ts` (`sourcemap:false`), `package.json` (`lint` script + dep),
  `App.tsx` (`AdminRouteGate` is outermost wrapper → error-boundary mount point correct),
  the existing `csp.test.ts` / `no-secret.test.ts` / `no-secret-bundle.test.ts` / `no-provider-key.test.ts`
  (self-building `beforeAll` pattern + secret-pattern coverage), `@repo/eslint-config/react-internal`
  + `base.js` (export exists, `dist/**` ignore, `onlyWarn`), `apps/web/eslint.config.js` (mirror
  template), ADR-0008 (§S6 admin/web project-name split + `https://*.ingest.sentry.io` is WEB-only +
  extension protocol), ADR-0013 (W0 / §D2 §D5 promotion gating), the roadmap manifest (row #6 +
  Verification Gates), and INTEGRATION_PLAN §3/§4.6.
- **Findings**: 0 blockers. All 8 gates PASS; AC-1..AC-6 each map to a named binary test; the
  isolation crux (admin CSP must NOT inherit web's Sentry ingest host) holds and is internally
  consistent with the no-op observability scaffold. OQ1–OQ5 all confirmed as the planner recommended.
  2 non-blocking recommendations recorded for feature-build (REC-1 HEADERS-PARITY self-build + trimmed
  compare; REC-2 ISO-NO-CROSS-IMPORT scan both `apps/admin` + `@repo/admin` specifiers).
- **Verdict**: **APPROVED** — plan is executable with no blocking ambiguity. Status → APPROVED;
  Suggested Next → feature-build.
- **Commits**: — (review only; no code; dev_log Review Notes written)
- **Tests**: — (none run; review phase; no commands executed)
- **Handoff / Next step**: feature-build — implement P1 (deploy isolation + CSP/env checks) first,
  one phase per run; fold in REC-1/REC-2 when writing P1's tests. Or run feature-auto-build /
  feature-dev-loop to batch the 4 phases.

### Round 3 — 2026-06-06 07:34 · feature-dev-loop (inline feature-auto-build) · P1 DONE

- **Executor**: claude-opus-4-8 (feature-dev-loop orchestrator, inline-hosting feature-auto-build —
  Task/agent-spawn tool unavailable this runtime, so per the orchestrator contract the loop
  inline-executes the worker role; this is the same no-spawn pattern used for prior admin rows).
- **Phase**: **P1 — Deploy isolation + CSP/env checks**.
- **Action**: Read the four-piece (design/api/test/dev_log) + the SHIPPED slice-#1 ground truth
  (`wrangler.toml`, `public/_headers`, `.env.example`, `vite.config.ts`, `package.json`,
  `App.tsx`, the existing `csp.test.ts` / `no-secret*.test.ts` / `no-provider-key.test.ts` /
  `no-inline-mock.test.ts`) + the eslint preset chain. Established a green baseline
  (31 files / 356 tests) BEFORE writing P1. Then implemented the P1 invariant locks:
  - **NEW** `src/__tests__/deploy-isolation.test.ts` (AC-1): TT-ISO-PROJECT-NAME (name ==
    `xai-admin-dashboard`, != web `xai-web-console`); TT-ISO-SELF-CONTAINED (no
    `[vars]`/`[[secrets]]`/`[secrets]`/`account_id`/api-token literal); TT-ISO-OUTPUT-DIR
    (`pages_build_output_dir == "./dist"`); TT-ISO-HEADERS-PARITY (self-building `vite build` in
    `beforeAll` if `dist/` absent, **trimmed** compare — REC-1); TT-ISO-NO-CROSS-IMPORT (scans
    `apps/web/src/**` for BOTH `apps/admin` path AND `@repo/admin` package specifiers — REC-2).
  - **EXTENDED** `src/__tests__/csp.test.ts` (AC-2) with a second `TT-CSP-TIGHT` describe (original
    9 TT-CSP-GUARD assertions byte-identical): DEFAULT-SRC, SCRIPT-SRC-TIGHT (no
    `unsafe-inline`/`unsafe-eval`/`*`), BASE-URI, FORM-ACTION, UPGRADE, NO-WILDCARD (no bare `*`
    host token, no `'unsafe-` token, and **explicitly** no `ingest.sentry.io` — the crux: admin
    CSP must not inherit web's Sentry ingest host).
  - **NEW** `src/__tests__/env-no-secret.test.ts` (AC-2): TT-ENV-NO-SECRET-VALUE (no
    Stripe/`sk-`/`AIza`/`service_role`/Sentry-DSN literal in any `apps/admin/.env*`);
    TT-ENV-NO-SECRET-VARNAME (no `VITE_*_SECRET|_KEY|_TOKEN|_DSN|SERVICE_ROLE` name; allow-list
    `VITE_ADMIN_MOCK_CLAIM` + `VITE_ADMIN_AUTH_MODE`).
- **Self-checks**: W0 boundary held (admin-side only — no `@repo/*`, no `apps/web` deploy-config,
  no `@repo/core/src/events`, no Tauri). No slice-#1 file forked — only EXTENDED `csp.test.ts` and
  ADDED two test files. `no-inline-mock`'s "exactly 10 pages" invariant preserved (P1 adds no page).
- **Tests**: `pnpm --filter @repo/admin test` → **33 files / 375 passed** (was 31/356; +2 files,
  +19 tests, none removed). P1 trio in isolation: deploy-isolation 5/5, csp 15/15, env-no-secret 8/8.
  `tsc --noEmit` → exit 0 (fixed one strict `string | undefined` capture-group access in
  env-no-secret with `varMatch?.[1]` + falsy guard — runtime unaffected).
- **Commit**: `__P1_HASH__` — `test(admin): row #6 P1 — deploy isolation + tight-CSP + env secret guards`
  (includes the row-#6 four-piece + discovery review as the row's first commit).
- **Risks**: none surfaced. R3 (parity brittleness) is the intended behaviour and is mitigated by the
  trimmed self-building compare. R1 (eslint) deferred to P4 as planned.
- **Next step**: P2 — observability scaffold (no-op `AdminTelemetrySink` + `noopTelemetrySink` +
  `AdminErrorBoundary` wired below `AdminRouteGate`) + telemetry/boundary tests + no-telemetry-secret
  guard. (loop continues automatically; no human gate between phases.)
