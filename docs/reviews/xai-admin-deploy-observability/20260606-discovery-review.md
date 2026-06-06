# Discovery Review — xai-admin-deploy-observability (roadmap row #6, FINAL)

> Surface: `apps/admin/` (SHIPPED isolated Web-line app). Final hardening slice of the
> 6-row `xai-admin-dashboard-system-integration` manifest. "Before promoting beyond prototype."
> Mode: Fresh. Date: 2026-06-06. Planner: claude-opus-4-8 (feature-plan).
> D3 classification: **W0 (web-only)** — admin is its own line; no shared `@repo/*` change; no `dev` promotion.

## 1. Problem framing

Rows #1–#5 are SHIPPED. The admin surface (`apps/admin/`) is an isolated Vite app with:
its own Cloudflare Pages project + own tight `_headers` CSP (#1), typed read models + RBAC
predicates (#2), users/orgs/billing read seams (#3), feature/AI/provider control with
provider-key-material guards (#4), and an immutable audit hash-chain + ops queue (#5). The
browser bundle is provably free of service-role / provider / Stripe secrets (multiple
self-building bundle guards).

Row #6 is the **final hardening + promotion-gate** slice. Per the manifest note and
INTEGRATION_PLAN §4.6, it must add, *before* anyone promotes the admin surface beyond the
prototype/dev-branch stage:

1. **Deployment isolation checks** — verify + lock (via tests) that the admin deploy target is
   genuinely independent from `apps/web` (separate Pages project, separate `_headers`, no shared
   deploy credentials/target).
2. **CSP / env checks** — extend the slice-#1 `csp.test.ts` to assert the CSP stays tight, and
   add env-handling checks that no `VITE_`-exposed env var carries a secret (env never leaks to
   the browser). Align with ADR-0008.
3. **Observability scaffold** — a *pluggable* telemetry/error sink (error boundary + typed
   telemetry interface) that is **no-op / mock by default**, with **no real Sentry DSN or any
   secret** baked into the browser bundle. Contract/scaffold only; real backend wiring deferred
   to an operator.
4. **Manual browser smoke checklist** — a documented, human-runnable smoke checklist
   (tables/filters/drawers/dialogs/type-to-confirm/focus traps/mobile layout) covering the 10
   prototype pages; automate what is cheaply automatable, document the rest.
5. **Release / operator runbook** — a doc describing *how to promote* the admin surface beyond
   prototype (deploy steps, the deferred PR/merge + branch-topology decision, server-side
   env/secret setup, rollback). It is the **promotion gate** doc; it does **not** itself promote.
6. **(Fold in RR-1)** — add `apps/admin/eslint.config.js` (ESLint 9 flat config) so
   `pnpm --filter @repo/admin lint` works, clearing the pre-existing scaffold gap (task_1a68bff9).
   This is the "tooling/quality gate before promoting beyond prototype" lever.

### What is explicitly NOT in scope (deferred / operator)

- **No real deploy** — no `wrangler pages deploy`, no Pages project creation, no GitHub Action
  for the admin surface this slice (the runbook *documents* how; the operator *does* it).
- **No real telemetry backend** — no Sentry DSN, no ingest host added to CSP `connect-src`, no
  network sink. The scaffold is a no-op interface + error boundary only.
- **No promotion** — no PR opened/merged into `web` / `desktop-next` / `dev`; the branch-topology
  + PR decision is documented as an operator-gated step (ADR-0013 §D2/§D5; manifest "Keep this
  roadmap out of `dev` promotion until an operator explicitly activates the admin-dashboard line"
  — the line is operator-*activated*, but promotion-beyond-prototype remains a separate operator
  call).
- **No secret in browser** — no service-role creds, provider keys, or telemetry secrets in any
  bundle. No `syncScope` entity (ADR-0013 §D4 deferred — admin has no cloud-sync entity).
- **No shared seam change** — no `@repo/web-auth-device-session` or other `@repo/*` edit; no
  `apps/web` deploy-config change (admin has its own `wrangler.toml` / `_headers`); no
  `@repo/core/src/events`; no Tauri.

## 2. Current-state evidence (read from source this pass)

| Concern | Current state (SHIPPED) | What row #6 adds |
|---|---|---|
| Deploy target | `apps/admin/wrangler.toml`: project `xai-admin-dashboard`, `pages_build_output_dir = "./dist"`; web uses `xai-web-console` (ADR-0008) | A test that asserts the project name ≠ web's, and that admin config is self-contained (no shared creds/target) |
| CSP | `apps/admin/public/_headers`: `connect-src 'self'` only, `frame-ancestors 'none'`, `object-src 'none'`, HSTS/nosniff/DENY/Referrer/Permissions. Copied verbatim to `dist/_headers` by Vite | Extend `csp.test.ts`: assert `default-src 'self'`, `script-src 'self'` (no `unsafe-*`/`*`), `base-uri 'self'`, `form-action 'self'`, `upgrade-insecure-requests`, and that `dist/_headers` matches `public/_headers` byte-for-byte after build |
| Env | `apps/admin/.env.example`: only `VITE_ADMIN_MOCK_CLAIM`, `VITE_ADMIN_AUTH_MODE=mock-authenticated` (no secret) | An env guard: `.env.example` and any committed `.env*` contain no secret-shaped value; no `VITE_`-prefixed var name implies a credential (no `*_SECRET`, `*_KEY`, `*_TOKEN`, `*_DSN` under `VITE_`) |
| Secret-in-bundle | `no-secret.test.ts` (src), `no-secret-bundle.test.ts` (dist, self-building, 8 patterns), `no-provider-key.test.ts` (fixtures+read-model+bundle); `vite.config.ts` `sourcemap: false` | Observability scaffold MUST NOT regress these; add a Sentry-DSN-shaped pattern (`https://<hash>@<org>.ingest.sentry.io/<proj>`) to the bundle/src guard to prove no DSN baked in |
| Observability | none | Typed `AdminTelemetrySink` interface + `noopTelemetrySink` default + `AdminErrorBoundary` (React error boundary) that routes caught errors to the injected sink; default sink does nothing (no network, no console-secret) |
| Lint | `package.json` declares `lint` + `@repo/eslint-config` dep but NO `eslint.config.js` → `pnpm --filter @repo/admin lint` errors (RR-1 / task_1a68bff9) | Add `apps/admin/eslint.config.js` extending `@repo/eslint-config/react-internal` (mirror `apps/web/eslint.config.js`); keep lint green at `--max-warnings 0` |
| Smoke | `test.md §5` names the manual smoke gate but there is no standalone checklist doc | A `manual-smoke-checklist.md` under `apps/admin/docs/deploy-observability/` enumerating per-page scenarios with PASS/FAIL columns + browser-version rows |
| Runbook | `docs/runbooks/cloudflare.md` is the web precedent (setup/rotate/rollback/manual-deploy/quota/DR) | An admin `release-operator-runbook.md` that mirrors it + adds the **promotion gate** (deferred PR/merge + branch-topology decision, server-side secret setup, isolation re-check) |

## 3. Candidate options (decisions to freeze)

This slice is contract/scaffold + doc + tooling — there is no library-selection decision and no
external dependency. **No external research required** (no new runtime dependency; the only new
files are tests, a tiny no-op telemetry scaffold, two docs, and an eslint flat-config that reuses
the existing `@repo/eslint-config`). The decisions below are local design choices.

### D1 — Observability scaffold shape

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **A. Typed no-op sink interface + React error boundary, default no-op (selected)** | Pluggable seam (real Sentry/console sink swappable later behind the interface); zero secret/network surface; testable that default does nothing; matches the "Typed Contract Mock" pattern used across rows #2–#5 | Slightly more code than a bare `try/catch` | **Selected** — mirrors the established seam pattern; default no-op is provably secret-free |
| B. Wire `@sentry/react` now, gated by env DSN | "Real" observability | Adds a runtime dep + a DSN env var; risk of DSN/secret reaching the bundle; CSP would need a Sentry ingest host (forbidden this slice); the manifest says "before promoting" not "promote" | Rejected — violates "no real telemetry backend / no secret in browser" |
| C. No scaffold, document only | Minimal | Manifest explicitly lists "observability" as a deliverable; a doc-only answer leaves no pluggable seam for the operator | Rejected — fails the deliverable |

**Decision: D1 = A.** `AdminTelemetrySink` (typed interface: `captureError(err, ctx)`,
`captureEvent(name, ctx)`), `noopTelemetrySink` (default; does nothing — no network, no storage,
no console secret), and `AdminErrorBoundary` (class error boundary that forwards
`componentDidCatch` to an injected sink and renders a CSP-clean fallback). The real sink is a
documented future swap behind the interface (runbook records it). A `no-telemetry-secret` guard
asserts no Sentry-DSN-shaped literal in src or bundle.

### D2 — Deploy-isolation enforcement mechanism

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **A. Source-text + config assertion tests (selected)** | Hermetic, runs in the existing Vitest suite; asserts (i) admin project name ≠ web's, (ii) admin `wrangler.toml` is self-contained (no `[vars]`/`[secrets]`/shared account), (iii) `dist/_headers` == `public/_headers` after build, (iv) admin not referenced in `apps/web/src` | Cannot prove a *runtime* Cloudflare account separation (that's an operator/dashboard fact) | **Selected** — the runtime separation is documented in the runbook; the tests lock everything checkable in-repo |
| B. Live `wrangler` introspection | Would prove real project separation | Requires Cloudflare creds + network; out of scope (no real deploy this slice) | Rejected — out of scope |

**Decision: D2 = A.** Add `deploy-isolation.test.ts` (config + cross-app source-text assertions)
and fold the `dist/_headers == public/_headers` byte-identity check into the CSP guard (or its own
test). Runtime account separation is an operator fact recorded in the runbook's promotion gate.

### D3 — Doc landing for the smoke checklist + runbook

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **A. Both under `apps/admin/docs/deploy-observability/` (selected)** | Co-located with the row's four-piece; discoverable next to design/api/test; consistent with rows #2–#5 sub-folder convention | — | **Selected** |
| B. Runbook under `docs/runbooks/` (next to `cloudflare.md`) | Mirrors the web runbook location | Splits row-#6 artifacts across two trees; the admin runbook is a promotion-gate doc tightly coupled to this row | Rejected for the primary copy; a one-line pointer from `docs/runbooks/` is optional follow-up |

**Decision: D3 = A.** Exact filenames (stated for the build agent):
- `apps/admin/docs/deploy-observability/manual-smoke-checklist.md`
- `apps/admin/docs/deploy-observability/release-operator-runbook.md`
(plus the four-piece `design.md` / `api.md` / `test.md` / `dev_log.md` in the same folder).

### D4 — ESLint flat-config shape (RR-1 fold-in)

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **A. `apps/admin/eslint.config.js` extending `@repo/eslint-config/react-internal` (selected)** | Exact mirror of `apps/web/eslint.config.js`; reuses the already-declared dep; `base.js` already ignores `dist/**` so the bundle is not scanned; ESLint 9 flat config | Must ensure existing admin source passes at `--max-warnings 0` (may require a couple of targeted rule tweaks or inline disables, NOT broad rule-off) | **Selected** |
| B. Bespoke admin eslint config | Full control | Forks the repo lint baseline; against the "reuse `@repo/eslint-config`" boundary | Rejected |

**Decision: D4 = A.** Mirror `apps/web/eslint.config.js`. If any existing admin file trips a rule,
prefer a *scoped* `files`-targeted override or a justified inline `// eslint-disable-next-line`
with a comment, never a global rule disable. Keep `pnpm --filter @repo/admin lint` green.

## 4. Phasing recommendation (feature-build does ONE phase per run)

Ordered so each phase is independently verifiable and the security/isolation invariants land before the docs that describe them:

| Phase | Goal | Key deliverables | Acceptance gate |
|---|---|---|---|
| **P1 — Deploy isolation + CSP/env checks** | Lock the isolation + tight-CSP + no-secret-env invariants with tests | `src/__tests__/deploy-isolation.test.ts` (project-name ≠ web, self-contained `wrangler.toml`, `dist/_headers`==`public/_headers`, admin not imported by `apps/web/src`); extend `csp.test.ts` (default-src/script-src/base-uri/form-action/upgrade-insecure + no `unsafe-*`/`*`); `src/__tests__/env-no-secret.test.ts` (`.env*` + `VITE_` var names carry no secret) | New + extended tests green; full admin suite stays green; `apps/web` build unaffected |
| **P2 — Observability scaffold (no-op, secret-free)** | Pluggable telemetry seam + error boundary, default no-op | `src/observability/telemetry.ts` (`AdminTelemetrySink` + `noopTelemetrySink`), `src/observability/AdminErrorBoundary.tsx`, wire boundary at the app root in `App.tsx`; `src/observability/telemetry.test.ts` (default sink does nothing — no network/storage), `AdminErrorBoundary.test.tsx` (catches + forwards to injected sink + renders fallback), `src/__tests__/no-telemetry-secret.test.ts` (no Sentry-DSN-shaped literal in src + dist) | Scaffold tests green; no-secret/bundle guards still green; build green; `dist` still DSN-free |
| **P3 — Manual-smoke checklist + release/operator runbook docs** | Human-runnable smoke doc + promotion-gate runbook | `apps/admin/docs/deploy-observability/manual-smoke-checklist.md` (per-page scenarios, PASS/FAIL + browser-version rows), `apps/admin/docs/deploy-observability/release-operator-runbook.md` (setup/deploy/rotate/rollback + the deferred PR/merge + branch-topology decision + server-side secret setup + isolation re-check). Update the four-piece docs | Docs present + internally consistent; runbook explicitly marks promotion as operator-gated (does not itself promote) |
| **P4 — ESLint flat config + final full-suite/lint green** | Clear RR-1; full quality gate | `apps/admin/eslint.config.js` (extends `@repo/eslint-config/react-internal`); any scoped overrides; final run: `pnpm --filter @repo/admin lint` green, `tsc --noEmit` clean, `pnpm --filter @repo/admin test` green, `pnpm --filter @repo/admin build` green, `pnpm --filter @repo/web build` green | All four commands green at `--max-warnings 0`; set `READY_FOR_VERIFY` |

Rationale: P1 locks the isolation/CSP/env facts the runbook will reference; P2 adds the only new
runtime code (kept tiny + secret-free) and proves the no-DSN invariant; P3 writes the docs that
describe P1+P2; P4 closes the tooling gap and runs the whole quality gate over the finished surface.

## 5. Risks & open questions

### Risks (carry into review)

- **R1 (MED) — eslint flat config surfaces pre-existing lint errors in shipped admin source.**
  The admin source has never been linted (RR-1). Turning lint on at `--max-warnings 0` may surface
  real findings. Mitigation: P4 is its own phase; fix with scoped overrides / justified inline
  disables, never a global rule-off; if a finding implies a real bug, record it (do not silently
  suppress). The `onlyWarn` plugin in `base.js` downgrades errors to warnings, but
  `--max-warnings 0` still fails on warnings — so this is a genuine gate.
- **R2 (MED) — observability scaffold accidentally introduces a secret/network surface.**
  Mitigation: default sink is provably no-op (test asserts no `fetch`/storage); `no-telemetry-secret`
  guard scans src + dist for a Sentry-DSN shape; CSP stays `connect-src 'self'` (no ingest host
  added). Real wiring is documented, not done.
- **R3 (LOW) — `dist/_headers` byte-identity test is brittle if Vite changes copy behavior.**
  Mitigation: the test reads both files and compares trimmed content; if Vite ever transforms
  `public/`, the test will catch it (which is the point). Self-building like the existing bundle guards.
- **R4 (LOW) — runbook drift vs `docs/runbooks/cloudflare.md`.** Mitigation: the admin runbook
  cross-references ADR-0008 + the web runbook for shared mechanics and only adds admin-specific
  isolation + promotion-gate content; it does not duplicate the full Cloudflare mechanics verbatim.
- **R5 (LOW) — "promotion" ambiguity.** The admin *line* is operator-activated (2026-06-06), but
  promoting the *surface* beyond prototype (open/merge a PR, pick branch topology, configure real
  Pages + secrets) is a distinct operator decision. Mitigation: the runbook states this explicitly
  and the slice does not itself promote.

### Open questions for feature-review

- **OQ1** — Confirm the deploy-isolation test asserting `wrangler.toml` project name `xai-admin-dashboard`
  ≠ `xai-web-console` (web) is the right isolation signal, and whether to also assert the admin
  `wrangler.toml` has **no** `[vars]`/`[[secrets]]`/`account_id` block (recommend yes — it currently has none).
- **OQ2** — Confirm the observability scaffold should live at `apps/admin/src/observability/`
  (recommend yes; business/app-local, mirrors rows #2–#5 sub-folders) and that wiring
  `AdminErrorBoundary` at the app root in `App.tsx` is acceptable (it wraps below the guard so a
  render error in any page is caught without exposing admin content on a non-admin session).
- **OQ3** — Confirm the Sentry-DSN guard pattern. Recommend adding
  `https://<key>@<org>.ingest.sentry.io/<projectId>` shape (and a bare `ingest.sentry.io` host
  literal) to both the src guard and the bundle guard.
- **OQ4** — Confirm doc landing (D3): both `manual-smoke-checklist.md` and
  `release-operator-runbook.md` under `apps/admin/docs/deploy-observability/`, with an optional
  one-line pointer added to `docs/runbooks/` (recommend the pointer as non-blocking follow-up, not
  a hard deliverable).
- **OQ5** — Confirm whether a short **ADR-0008 §S7 cross-reference note** (admin deploy boundary is
  a clean extension; promotion is operator-gated) should be added this slice, or left as a runbook
  cross-reference only. Recommend runbook cross-reference only (slice #1 already recorded the
  ADR-lite #1 deploy-isolation decision; row #6 does not change ADR-0008's `apps/web` content).

## 6. Recommendation

Proceed with the 4-phase plan above. This is a **contract/scaffold + doc + tooling** slice: green =
isolation/CSP/env checks + a no-op secret-free observability scaffold + a manual-smoke checklist doc
+ a release/operator (promotion-gate) runbook doc + an ESLint flat config + all prior suites still
green + `apps/web` build unaffected. No real deploy, no real telemetry backend, no secret in the
browser, no promotion. D3 = W0. Promotion-beyond-prototype stays an explicit operator decision that
the runbook documents but the slice does not perform.
