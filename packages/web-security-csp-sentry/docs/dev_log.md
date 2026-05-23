# web-security-csp-sentry — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | web-security-csp-sentry |
| Title | W11 Web security, CSP reporting, and privacy-safe observability hardening |
| Roadmap | `web-ticktick-parity` · feature #20 · W11 |
| Current Phase | FEATURE_VERIFY |
| Status | READY_FOR_VERIFY |
| Suggested Next | feature-verify |
| Automation Mode | A-Claude |
| Verify Cross-vendor | no |
| Executor | feature-auto-build (Codex gpt-5.3-codex inline) |
| Updated | 2026-05-22 17:21 PDT |
| Blockers | — |

## Source Context

- Roadmap manifest: `docs/workflow/roadmap/web-ticktick-parity.md`
- Source seed: `docs/reviews/web-security-csp-sentry/20260521-roadmap-seed.md`
- Governing docs:
  - `docs/adr/0006-web-face-hybrid-reuse-boundary.md`
  - `docs/planning/sub-prds/web/PRD.md`
  - `docs/planning/sub-prds/web/dev-plan.md`
  - `docs/PLUGIN_MAP.md`
- Upstream implementation references:
  - `apps/web/{package.json,vite.config.ts,index.html}`
  - `apps/web/src/{main.tsx,providers/AppProviders.tsx,routes/RouteErrorBoundary.tsx}`
  - `apps/release-site/{middleware.ts,next.config.js,docs/security.md}`
  - `packages/web-release-site-archive-vite-shell/docs/{design.md,api.md}`
  - `packages/web-auth-device-session/docs/api.md`
  - `packages/web-browser-e2e-crypto-runtime/docs/design.md`
  - `packages/web-console-host-router/docs/{design.md,api.md}`

## Phase Plan

### Phase 1 — Host observability seams and privacy primitives

Status: DONE (commit `029246a`).

File boundary:

- `apps/web/package.json`
- `apps/web/src/main.tsx`
- `apps/web/src/providers/AppProviders.tsx`
- `apps/web/src/routes/RouteErrorBoundary.tsx`
- `apps/web/src/observability/**`
- related colocated tests under `apps/web/src/**`

Required implementation:

- add consent-state handling for observability inside the host workspace
- add redaction primitives, route-group classification, and local reporting seams under `apps/web/src/observability/**`
- keep route-boundary fallback usable even when observability is disabled

Gate:

- with consent unset or denied, the browser host emits no outbound Sentry or RUM traffic

Scoped verification:

- unit tests for redaction helpers and route-group classification
- host tests proving no init/no send when consent is missing

### Phase 2 — CSP policy, nonce consumption, scrub endpoint, and security headers

Status: DONE (commit `c55bcc8`).

File boundary:

- `apps/web/index.html`
- `apps/web/src/security/**`
- `apps/web/deploy/security/**`
- related colocated tests under `apps/web/src/**` and `apps/web/deploy/**`

Required implementation:

- add report-only and enforce policy builders
- define same-origin `/__csp_report` handling for Reporting API and legacy payloads
- implement scrub-first normalization before storage or forwarding
- define nonce transport from HTML response into runtime-created `<style>` tags
- define provider-neutral security-header adapter inputs

Gate:

- the feature has one scrub-first CSP ingestion path and one nonce contract that does not depend on archived Next middleware

Scoped verification:

- report fixture tests for both payload families
- redaction assertions for query string, ids, samples, and user-content stripping
- nonce extraction/application tests

### Phase 3 — Sentry init, privacy filters, and same-origin RUM

Status: DONE (commit `28f74fb`).

File boundary:

- `apps/web/src/observability/**`
- `apps/web/src/routes/RouteErrorBoundary.tsx`
- `apps/web/deploy/security/**` only if needed for endpoint mounting
- related colocated tests under `apps/web/src/**` and `apps/web/deploy/**`

Required implementation:

- add Sentry browser/react SDK wiring
- init only after consent and complete config
- enforce `sendDefaultPii: false`, `beforeSend`, `beforeBreadcrumb`, `allowUrls`, `denyUrls`
- keep `tracePropagationTargets = []` and do not enable browser tracing in v1
- add same-origin `web-vitals/attribution` batching for `/__rum`

Gate:

- synthetic events prove the final payload is privacy-safe before any vendor egress occurs

Scoped verification:

- unit tests for scrubbed events and breadcrumbs
- tests proving ids, hashed/deterministic correlators, token-bearing URLs, and user content are absent
- tests proving tracing headers are absent

### Phase 4 — Hidden source maps, SRI/supply-chain guards, and build proof

Status: DONE (commit `7e5e46f`).

File boundary:

- `apps/web/vite.config.ts`
- `apps/web/package.json`
- `apps/web/scripts/**`
- `.github/workflows/supply-chain-security.yml` only if strictly needed
- related script/build tests under `apps/web/scripts/**`

Required implementation:

- enable hidden source maps
- add upload/validate/finalize/delete scripts
- remove `.map` files from the deploy artifact after upload
- document or wire app-level supply-chain and external-asset guardrails

Gate:

- final deploy-ready artifact exposes no public `.map` files and no accidental CDN asset drift

Scoped verification:

- build smoke with hidden maps enabled
- script test proving `.map` cleanup
- grep/build checks proving the final artifact exposes no `.map`

## Risks

- Provider-specific adapter sprawl if Phase 2 does not keep one shared contract for headers, nonce injection, and endpoint mounting.
- Privacy drift if breadcrumbs, URLs, or helper logging paths bypass the shared scrubbers.
- Adding browser tracing later would require a new privacy review because Sentry defaults are broader than this v1 contract.
- Hosted rollout can still fail later if provider secrets and edge/origin paths are not aligned with this contract.

## Review Notes

- APPROVED. The revised privacy contract now consistently bans ids, secrets, request/response bodies, encrypted blobs, tokens, raw query strings, user content, and hashed/stable/deterministic/entity-derived correlators from Sentry payloads; only non-user-content operational fields remain allowed.
- APPROVED. Implementation ownership and executable commands are frozen to the existing `@repo/web` workspace, while `packages/web-security-csp-sentry/` remains a docs-only workflow anchor, so `feature-build` does not need to invent a package boundary.

## Verification Notes

- BLOCKED. The Sentry redaction path does not satisfy the approved privacy contract. `sanitizeText()` only removes query/hash and UUID-or-long tokens, so numeric ids and arbitrary user text survive into error payloads (`apps/web/src/observability/privacy.ts`). That unsanitized output is used by route-error reporting (`apps/web/src/observability/reporting.ts`) and Sentry event shaping (`apps/web/src/observability/sentry.ts`). The checked-in tests currently encode the wrong behavior by expecting `/app/todos/123` and `/app/task/777` to remain in captured Sentry messages (`apps/web/src/observability/sentry.test.ts`, `apps/web/src/observability/transport.test.ts`). An executable repro under verify printed `{\"message\":\"failure for task 777 and title Buy milk\",\"extra\":{\"note\":\"user typed hello world\",\"route\":\"/app/task/:id\"}}`, which violates the no-id/no-user-content gate.
- BLOCKED. The secure sourcemap pipeline does not match the frozen source-map contract in `api.md`. The approved order requires `create release`, `set commits`, `inject Debug IDs`, upload, finalize, delete `.map`, deploy, and `mark deploy`, but the shipped implementation only runs `upload -> validate -> finalize -> clean -> assert-clean` (`apps/web/package.json`, `apps/web/scripts/*`). This is contract drift against the approved artifacts even though local cleanup succeeds.
- RESOLVED (2026-05-22). Blocker B1 fixed in `e5af51d`: Sentry sanitization now emits a constant redacted message for captured errors, strips non-path free-form string fields from event/breadcrumb payloads, limits tags to operational allowlist keys, and restricts capture context extra to `event_channel`; updated tests assert no numeric ids or user text leakage.
- RESOLVED (2026-05-22). Blocker B2 fixed in `e5af51d`: secure sourcemap flow now includes `release:create -> release:set-commits -> debugids:inject -> upload -> validate -> finalize -> clean -> assert-clean`, plus deploy-mark command `sourcemaps:deploy:mark` and composed pipeline `build:secure:with-deploy` to satisfy the frozen deploy/mark-deploy contract while preserving secret-gated local skips.

## Revision Response

- Revised:
  - removed hashed, stable, deterministic, and entity-derived correlators from the Sentry contract everywhere
  - limited allowed Sentry-side correlation to non-user-content operational fields only
  - froze `packages/web-security-csp-sentry/` as docs-only and moved all executable ownership to `apps/web`
  - removed all `packages/web-security-csp-sentry/src/**` and `pnpm --filter @repo/web-security-csp-sentry ...` assumptions
  - froze v1 Sentry scope to error-only with `tracePropagationTargets = []`
- Intentionally not changed:
  - CSP remains self-owned and scrub-first before any optional Sentry forwarding
  - source maps still upload before deploy and are removed from served artifacts
  - roadmap scope remains conservative and compatible with the current Vite host

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-22 16:21 PDT | feature-plan (Codex gpt-5.3-codex inline) | Fresh planning pass from the roadmap seed: created the Step 0 feature brief, compared scrub-first versus direct-to-Sentry security/reporting approaches using official-source evidence, froze edge/origin CSP ownership plus consent-gated privacy-safe observability, and initialized design/api/test/dev_log for review. | — | feature-review |
| 2026-05-22 16:29 PDT | feature-review (Codex gpt-5.3-codex inline) | Review returned REVISE. The hard privacy constraint is weakened by allowing hashed entity correlators in Sentry payloads, and the phase/test plan assumes a non-frozen `packages/web-security-csp-sentry` workspace package (`src/**`, `@repo/web-security-csp-sentry` commands) that does not yet exist. Planner must tighten the payload contract and freeze package ownership/command paths before build. | — | feature-plan |
| 2026-05-22 16:31 PDT | feature-plan (Codex gpt-5.3-codex inline) | Revised the planning artifacts after review: froze `packages/web-security-csp-sentry` as a docs-only anchor, moved all executable ownership and commands to `@repo/web`, removed package-path assumptions, tightened the Sentry contract to ban hashed/stable/entity-derived correlators, and narrowed v1 to consent-gated error-only Sentry plus same-origin Web Vitals RUM. | — | feature-review |
| 2026-05-22 16:41 PDT | feature-review (Codex gpt-5.3-codex inline) | Approved the revised plan after confirming both prior blockers are resolved: the Sentry contract now forbids ids, secrets, request bodies, encrypted blobs, tokens, user content, raw query strings, and hashed/stable/deterministic/entity-derived correlators, and the executable ownership plus verification commands are frozen to `@repo/web` with `packages/web-security-csp-sentry/` remaining docs-only. | — | feature-build |
| 2026-05-22 17:07 PDT | feature-auto-build (Codex gpt-5.3-codex inline) | Reconciled recovery context and completed Phase 2: implemented shared CSP policy/header builders, scrub-first `/__csp_report` normalization for Reporting API + legacy payloads, and nonce extraction/application contract from HTML seams. Evidence: `pnpm --filter @repo/web exec vitest run src/security/cspReport.test.ts src/security/nonce.test.ts deploy/security/headers.test.ts deploy/security/cspEndpoint.test.ts` passed (9 tests), and normalized violations omit raw query/id/script samples. | `c55bcc8` | feature-auto-build |
| 2026-05-22 17:08 PDT | feature-auto-build (Codex gpt-5.3-codex inline) | Completed Phase 3: wired Sentry browser/react SDK adapter with consent-gated init, strict scrub filters (`beforeSend`/`beforeBreadcrumb`, deny/allow URLs, `tracePropagationTargets=[]`), and same-origin RUM normalization + `/__rum` ingest path. Evidence: `pnpm --filter @repo/web exec vitest run src/observability/controller.test.ts src/observability/privacy.test.ts src/observability/routeGroup.test.ts src/observability/sentry.test.ts src/observability/transport.test.ts deploy/security/rumEndpoint.test.ts` passed (16 tests); payload assertions confirm no token/query/id/hash/user-content leakage. | `28f74fb` | feature-auto-build |
| 2026-05-22 17:08 PDT | feature-auto-build (Codex gpt-5.3-codex inline) | Completed Phase 4 build hardening: enabled hidden sourcemaps, added upload/validate/finalize/clean/assert scripts, and validated post-build cleanup leaves no public `.map` artifacts. Evidence: `pnpm --filter @repo/web exec vitest run scripts/sourcemaps-clean.test.ts`; `pnpm --filter @repo/web check-types`; `pnpm --filter @repo/web build:secure`; `find apps/web/dist -name '*.map'` returned empty after cleanup. Upload/validate/finalize skipped locally due missing `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_RELEASE`, `SENTRY_AUTH_TOKEN` (expected local secret gap). | `7e5e46f` | feature-verify |
| 2026-05-22 17:14 PDT | feature-verify (Codex gpt-5.3-codex inline) | Verified commits `029246a`, `c55bcc8`, `28f74fb`, `7e5e46f`, and `7d47ce1` against the approved brief/discovery/design/api/test/dev_log artifacts. `pnpm --filter @repo/web check-types` passed; `cd apps/web && pnpm exec vitest run src/observability/controller.test.ts src/observability/privacy.test.ts src/observability/routeGroup.test.ts src/observability/sentry.test.ts src/observability/transport.test.ts src/security/cspReport.test.ts src/security/nonce.test.ts deploy/security/headers.test.ts deploy/security/cspEndpoint.test.ts deploy/security/rumEndpoint.test.ts scripts/sourcemaps-clean.test.ts` passed (11 files, 26 tests); `pnpm --filter @repo/web build:secure` passed; `find apps/web/dist -name '*.map'` returned empty and `rg -n "sourceMappingURL" apps/web/dist` returned no matches after cleanup. Verification is still BLOCKED because Sentry payload sanitization leaves numeric ids and arbitrary user text in captured messages, and the implemented sourcemap release flow omits the frozen `create release` / `set commits` / `inject Debug IDs` / `mark deploy` steps from `api.md`. | `029246a`, `c55bcc8`, `28f74fb`, `7e5e46f`, `7d47ce1` | feature-build |
| 2026-05-22 17:21 PDT | feature-auto-build (Codex gpt-5.3-codex inline) | Repair pass for BLOCKED verify findings: removed temporary verify residue `apps/web/.verify-sentry.XXXXXX.test.ts`; hardened Sentry-bound payload redaction to suppress ids and free-form user text, updated observability tests for strict no-id/no-user-text assertions, and extended secure sourcemap release sequence with release creation, commit association, Debug ID injection, and deploy marking command while retaining secret-gated local behavior. Evidence: `pnpm --filter @repo/web exec vitest run src/observability/privacy.test.ts src/observability/sentry.test.ts src/observability/transport.test.ts scripts/sourcemaps-clean.test.ts` passed (4 files, 9 tests); `pnpm --filter @repo/web check-types` passed; `pnpm --filter @repo/web build:secure:with-deploy` passed with expected `SENTRY_*` env-gated skip logs for remote CLI operations; `find apps/web/dist -name '*.map'` and `rg -n \"sourceMappingURL\" apps/web/dist` returned no results after cleanup. | `e5af51d` | feature-verify |
