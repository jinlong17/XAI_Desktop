# test.md — xai-admin-deploy-observability (roadmap row #6, FINAL)

> Validation strategy / mock strategy / acceptance criteria for the final hardening slice.
> Runner: Vitest (`pnpm --filter @repo/admin test`). Build gate: `pnpm --filter @repo/admin build`.
> Lint gate (RR-1): `pnpm --filter @repo/admin lint` (`--max-warnings 0`). Types: `tsc --noEmit`.
> Regression boundary: `pnpm --filter @repo/web build` stays green; all prior rows' suites stay green.
> Cross-vendor manual browser smoke: per roadmap "Browser smoke" gate — the new
> `manual-smoke-checklist.md` is the human-runnable artifact; collected at `feature-verify`.

## 1. Acceptance criteria → test mapping (binary, testable)

| AC | Criterion (from manifest row #6 + INTEGRATION_PLAN §4.6) | Test(s) / evidence |
|---|---|---|
| **AC-1** | Deployment isolation holds: admin deploys on its own Cloudflare Pages target, independent of `apps/web`, with no shared deploy creds/target | TT-ISO-PROJECT-NAME, TT-ISO-SELF-CONTAINED, TT-ISO-OUTPUT-DIR, TT-ISO-HEADERS-PARITY, TT-ISO-NO-CROSS-IMPORT (`deploy-isolation.test.ts`) |
| **AC-2** | CSP stays tight + env never exposes a secret to the browser; aligned with ADR-0008 | TT-CSP-* (existing, EXTENDED: default-src/script-src/base-uri/form-action/upgrade-insecure + no `unsafe-*`/`*`), TT-ENV-NO-SECRET-VALUE, TT-ENV-NO-SECRET-VARNAME (`env-no-secret.test.ts`) |
| **AC-3** | A pluggable observability scaffold exists, default no-op, with NO real DSN/secret in the bundle | TT-TELEMETRY-NOOP (default sink does nothing — no network/storage), TT-TELEMETRY-NO-THROW, TT-ERRORBOUNDARY-CATCH (catches + forwards to injected sink + renders fallback), TT-NO-TELEMETRY-SECRET-SRC, TT-NO-TELEMETRY-SECRET-BUNDLE |
| **AC-4** | A human-runnable manual browser smoke checklist covers the 10 pages (tables/filters/drawers/dialogs/type-to-confirm/focus traps/mobile) | `manual-smoke-checklist.md` present with per-page scenario rows + PASS/FAIL + browser-version columns; cheaply-automatable items cross-linked to TT-* where they exist |
| **AC-5** | A release/operator runbook describes how to promote beyond prototype (deploy/rotate/rollback + deferred PR/merge + branch-topology decision + server-side secret setup) AND does NOT itself promote | `release-operator-runbook.md` present; contains the Promotion Gate section marking the PR/merge + branch-topology decision as operator-gated; no deploy/PR is performed by the slice |
| **AC-6** | `apps/admin` lint works (RR-1 cleared) and the full quality gate is green | `eslint.config.js` present; `pnpm --filter @repo/admin lint` exits 0; `tsc --noEmit` clean; `pnpm --filter @repo/admin test` green; `pnpm --filter @repo/admin build` green; `pnpm --filter @repo/web build` green |

## 2. Unit / component coverage

### Observability telemetry sink (`telemetry.ts`)
- **TT-TELEMETRY-NOOP**: `noopTelemetrySink.captureError(new Error("x"))` and `.captureEvent("y")`
  perform NO `fetch`/XHR and NO storage write (spy on `globalThis.fetch`, `localStorage`,
  `sessionStorage`); return `undefined`. MANDATORY no-side-effect test.
- **TT-TELEMETRY-NO-THROW**: both methods never throw, including on a non-Error argument
  (`captureError(null)`, `captureError("string")`).
- **TT-TELEMETRY-NO-SECRET-FIELD**: the sink object exposes no DSN/endpoint/token field
  (structural — there is no place for a secret).

### Observability error boundary (`AdminErrorBoundary.tsx`)
- **TT-ERRORBOUNDARY-CATCH**: a child that throws on render → boundary renders the fallback (not
  the crashed child) AND the injected spy sink's `captureError` was called once with the error.
- **TT-ERRORBOUNDARY-PASSTHROUGH**: a non-throwing child renders normally; sink not called.
- **TT-ERRORBOUNDARY-FALLBACK-CLEAN**: the rendered fallback contains no inline `<style>`/`<script>`
  (CSP-clean), consistent with `script-src 'self'` / no `unsafe-inline`.
- **TT-ERRORBOUNDARY-DEFAULT-SINK**: with no `sink` prop, defaults to `noopTelemetrySink` (no throw,
  no side effect) — boundary still renders fallback.

## 3. Deploy-isolation guard coverage (`deploy-isolation.test.ts`, NEW)

- **TT-ISO-PROJECT-NAME**: admin `wrangler.toml` `name` === `"xai-admin-dashboard"` AND !== `"xai-web-console"`.
- **TT-ISO-SELF-CONTAINED**: admin `wrangler.toml` contains no `[vars]`, no `[[secrets]]`/`[secrets]`,
  no inline `account_id`/API token literal (no shared deploy creds checked into the repo).
- **TT-ISO-OUTPUT-DIR**: admin `pages_build_output_dir` === `"./dist"` (its own output, not `apps/web/dist`).
- **TT-ISO-HEADERS-PARITY**: after build, `apps/admin/dist/_headers` content === `apps/admin/public/_headers`
  content (trimmed). Self-building if `dist` absent (mirror existing bundle-guard pattern).
- **TT-ISO-NO-CROSS-IMPORT**: source-text scan of `apps/web/src/**` finds zero import of `apps/admin`
  / `@repo/admin` (admin is physically isolated; not in the web module rail).

## 4. CSP / env guard coverage

### CSP guard extension (`csp.test.ts`, EXTEND existing 9 assertions)
- **TT-CSP-DEFAULT-SRC**: `default-src 'self'` present.
- **TT-CSP-SCRIPT-SRC-TIGHT**: `script-src 'self'` present; no `'unsafe-inline'`, no `'unsafe-eval'`, no `*`.
- **TT-CSP-BASE-URI**: `base-uri 'self'` present.
- **TT-CSP-FORM-ACTION**: `form-action 'self'` present.
- **TT-CSP-UPGRADE**: `upgrade-insecure-requests` present.
- **TT-CSP-NO-WILDCARD**: the CSP line carries no bare `*` host token and no `'unsafe-` token anywhere.
- (existing TT-CSP-GUARD-* for connect-self / frame-ancestors / HSTS / nosniff / DENY / Referrer /
  Permissions / object-src stay green.)

### Env secret guard (`env-no-secret.test.ts`, NEW)
- **TT-ENV-NO-SECRET-VALUE**: `apps/admin/.env.example` (+ any committed `.env*`) contains no
  secret-shaped literal (`sk_test_`/`sk_live_`/`sk-[A-Za-z0-9]{8,}`/`AIza…`/`service_role`/
  Sentry-DSN shape).
- **TT-ENV-NO-SECRET-VARNAME**: no `VITE_`-prefixed var name matches `*_SECRET` / `*_KEY` /
  `*_TOKEN` / `*_DSN` / `*SERVICE_ROLE*`. `VITE_ADMIN_MOCK_CLAIM` + `VITE_ADMIN_AUTH_MODE` allowed.

## 5. Telemetry-secret bundle guard (`no-telemetry-secret.test.ts`, NEW)
- **TT-NO-TELEMETRY-SECRET-SRC**: no Sentry-DSN-shaped literal and no bare `ingest.sentry.io` host
  string in `apps/admin/src/**` (excluding this guard's own comment).
- **TT-NO-TELEMETRY-SECRET-BUNDLE**: same scan over `apps/admin/dist/**` after build; self-building.

## 6. Mock / scaffold strategy

- **The interface is the seam.** `AdminTelemetrySink` is the contract; `noopTelemetrySink` is the
  slice-#6 implementation. A future real sink (Sentry/console/server) swaps behind the same
  interface with no caller change — identical to the Typed Contract Mock pattern used in rows #2–#5.
- **No production telemetry, no network, no secret** in any test, fixture, or default sink.
- **Self-building bundle guards**: `no-telemetry-secret.test.ts` and the
  `dist/_headers`-parity check run `vite build` in a `beforeAll` if `dist/` is absent — hermetic on a
  fresh checkout / CI-before-build (mirrors the SHIPPED `no-secret-bundle.test.ts`).

## 7. Build / lint / regression gates

- **TT-BUILD**: `pnpm --filter @repo/admin build` exits 0; `dist/` produced; still no `.map` emitted
  (`sourcemap: false` unchanged); `dist/_headers` present + parity-equal to `public/_headers`.
- **TT-LINT (RR-1)**: `pnpm --filter @repo/admin lint` exits 0 at `--max-warnings 0` with the new
  `eslint.config.js`. Clears task_1a68bff9.
- **TT-TSC**: `tsc --noEmit` clean (the new observability code + tests type-check).
- **Regression boundary**: `pnpm --filter @repo/web build` green + unaffected; all prior admin
  suites (rows #1–#5: predicate/guard/adapters/audit/ops-queue/pages/no-secret/no-provider-key) stay
  green. The full admin suite count GROWS (prior tests + the new row-#6 tests), none removed.

## 8. Manual browser smoke (feature-verify gate)

The roadmap "Browser smoke" gate is satisfied by the human-runnable
`apps/admin/docs/deploy-observability/manual-smoke-checklist.md`. It enumerates, per the 10
prototype pages: dense tables scroll/sort/filter; saved-view segmented control; filter chips;
user-detail drawer ↔ full-page; org/feature drawers; type-to-confirm modal unlocks only on the exact
word; keyboard focus trap inside modals/drawers; mobile/responsive layout; and the error-boundary
fallback rendering. Cheaply-automatable items (modal-unlock, page-mounts) already have TT-* coverage
from rows #1/#4 and the new error-boundary tests; the rest are documented for human execution
(cross-vendor: yes, per the manifest "Verify Cross-vendor"). Real PASS/FAIL + browser-version rows
are filled at `feature-verify` / on real hardware — checklist scaffolds alone do not count as evidence.

## 9. Out of scope for row #6 tests (deferred / operator)

- Live `wrangler pages deploy` / real Pages project creation / admin GitHub Action → operator (runbook documents).
- Real telemetry backend integration test (Sentry ingest) → deferred; would require a DSN + CSP host (operator + ADR-0008 extension).
- PR/merge into `web`/`desktop-next`/`dev` + branch-topology creation → operator-gated (ADR-0013 §D2).
- Runtime Cloudflare account-separation proof → operator/dashboard fact (runbook records it).
