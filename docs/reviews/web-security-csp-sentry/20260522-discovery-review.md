# Discovery Review — web-security-csp-sentry

| 字段 | 值 |
|---|---|
| Feature | `web-security-csp-sentry` |
| 日期 | 2026-05-22 |
| 执行者 | Codex (`feature-plan` inline, revise) |
| 外部调研 | Yes — official docs and primary sources only |

## Problem Framing

The canonical browser host is already `apps/web`, but the security and observability baseline is still unfrozen:

- `apps/web` is a thin Vite SPA with no active CSP/header contract, no CSP scrub endpoint contract, and no source-map hygiene flow.
- `apps/web/src/providers/AppProviders.tsx` already carries auth/session/device runtime state, so observability must assume sensitive values are live in memory and must never leak them.
- `apps/web/src/routes/RouteErrorBoundary.tsx` is the natural browser error seam, but it currently has no privacy-safe reporting contract.
- `apps/release-site/` still contains useful archive references for nonce/header shape, but it is not the runtime truth for this row.

The planning problem is therefore:

1. freeze ownership on a real executable path before build
2. keep CSP report ingestion scrub-first and same-origin
3. keep Sentry privacy-safe enough for the hard no-id/no-user-content requirement
4. ship source maps to Sentry without leaving public `.map` artifacts behind

## Current Repo Evidence

### Current Web host state

- `apps/web/package.json`
  - real workspace package name is `@repo/web`
  - current executable commands already exist here
  - there is no `@repo/web-security-csp-sentry` workspace package today
- `apps/web/vite.config.ts`
  - minimal React/Vite config
  - no `build.sourcemap` policy yet
- `apps/web/src/main.tsx`
  - boots router and service worker only
  - no observability bootstrap
- `apps/web/src/providers/AppProviders.tsx`
  - session/device/auth state is assembled here
  - mock runtime data includes ids and tokens that must never reach telemetry
- `apps/web/src/routes/RouteErrorBoundary.tsx`
  - current route error handling is local-only

### Archive/reference evidence

- `apps/release-site/middleware.ts`
  - prior nonce/header injection reference only
- `apps/release-site/next.config.js`
  - prior security-header categories reference only
- `apps/release-site/docs/security.md`
  - confirms older security logic belongs to the archived host

### Upstream contract evidence

- `packages/web-release-site-archive-vite-shell/docs/design.md`
  - `apps/web` is the canonical browser host after the archive split
- `packages/web-auth-device-session/docs/api.md`
  - auth/session/device flows are same-origin and privacy-sensitive
- `packages/web-browser-e2e-crypto-runtime/docs/design.md`
  - browser runtime may hold sensitive crypto/session material
- `packages/web-console-host-router/docs/api.md`
  - route families already exist for safe route-group classification
- `docs/planning/sub-prds/web/PRD.md` / `docs/planning/sub-prds/web/dev-plan.md`
  - require CSP rollout, self-owned scrub-first reporting, Sentry privacy controls, and hidden source maps

## External Research

Checked on 2026-05-22.

### Search queries

- `site:developer.mozilla.org Content-Security-Policy-Report-Only nonce style-src report-uri report-to Reporting-Endpoints`
- `site:vite.dev build.sourcemap hidden vite documentation`
- `site:docs.sentry.io beforeSend beforeBreadcrumb sendDefaultPii allowUrls denyUrls tracePropagationTargets javascript`
- `site:docs.sentry.io source maps inject upload validate debug ids javascript`
- `site:docs.sentry.io security policy reporting report-uri report-to sentry`
- `site:github.com/googlechrome/web-vitals attribution npm`

### Source evidence

#### MDN CSP reporting

- `https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy-Report-Only`
  - `Content-Security-Policy-Report-Only` is the correct rollout header for non-blocking monitoring
  - `report-to` requires a matching `Reporting-Endpoints` header
  - `report-uri` remains useful for compatibility
- `https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy`
  - nonce source expressions apply to both `<script>` and `<style>`
- `https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/report-uri`
  - legacy `csp-report` payloads still matter for compatibility

#### Vite build behavior

- `https://vite.dev/config/build-options.html`
  - `build.sourcemap: 'hidden'` emits `.map` files without public source map comments
  - this matches upload-first, delete-before-deploy requirements

#### Sentry filtering and source maps

- `https://docs.sentry.io/platforms/javascript/configuration/environments/`
  - `beforeSend`, `beforeBreadcrumb`, `sendDefaultPii`, `allowUrls`, `denyUrls`, and `tracePropagationTargets` are the relevant privacy controls
- `https://docs.sentry.io/platforms/javascript/guides/capacitor/tracing/trace-propagation/`
  - browser tracing adds `sentry-trace` and `baggage` unless constrained
  - this confirms tracing should stay disabled in v1 unless a later increment reopens it
- `https://docs.sentry.io/platforms/javascript/guides/hono/sourcemaps/troubleshooting_js/`
  - `sentry-cli sourcemaps inject` and upload validation are standard parts of the release flow
- `https://docs.sentry.io/platforms/javascript/guides/ember/sourcemaps/troubleshooting_js/debug-ids/`
  - Debug IDs are Sentry’s supported matching mechanism across modern JS build tools
- `https://docs.sentry.io/platforms/dotnet/guides/uwp/security-policy-reporting/`
  - Sentry supports direct CSP ingestion
  - that path is intentionally rejected here because it violates the scrub-first hard constraint

#### Web Vitals

- `https://github.com/GoogleChrome/web-vitals`
  - `web-vitals/attribution` supports useful route-group field metrics with a custom endpoint

## Options

### Option A — Docs anchor only, executable work stays inside `apps/web`

Shape:

- keep `packages/web-security-csp-sentry/` as a workflow/docs anchor only
- place implementation under:
  - `apps/web/src/observability/**`
  - `apps/web/src/security/**`
  - `apps/web/deploy/security/**`
  - `apps/web/scripts/**`
- use `@repo/web` commands for build/test/typecheck
- keep Sentry error-only and consent-gated in v1
- keep CSP and RUM same-origin and scrub-first

Pros:

- Matches the real workspace that already exists.
- Removes any ambiguity for `feature-build`.
- Avoids inventing a new public package surface before stability exists.
- Keeps sensitive browser-host integration close to the host that owns it.

Cons:

- Shared helpers are app-local first, not package-reusable.
- Provider/deploy seams still need careful structure under `apps/web`.

### Option B — Create a real `@repo/web-security-csp-sentry` workspace package now

Shape:

- add `packages/web-security-csp-sentry/package.json`, `tsconfig.json`, and runtime source
- centralize redaction, CSP helpers, nonce helpers, and Sentry/RUM helpers there
- keep host wiring inside `apps/web`

Pros:

- Stronger future reuse boundary if multiple web surfaces emerge.
- More obviously isolated code ownership.

Cons:

- Adds package/API surface before the code has proven stable.
- Requires extra scaffolding that the current roadmap row does not strictly need.
- Increases review surface for no immediate runtime benefit.

### Option C — Static host config plus direct browser-to-Sentry reporting

Shape:

- define CSP mostly in static config
- send CSP or browser telemetry directly to Sentry
- let vendor SDKs become the primary reporting sink

Pros:

- Smallest implementation surface.

Cons:

- Violates the hard scrub-first CSP constraint.
- Makes privacy review much harder.
- Does not solve per-response nonce injection cleanly.

## Recommendation

Choose **Option A**.

### Selected architecture

1. **`packages/web-security-csp-sentry` stays docs-only in v1.**
   - no runtime `src/**`
   - no `package.json`
   - no `pnpm --filter @repo/web-security-csp-sentry ...` commands

2. **Executable ownership is frozen to the existing `@repo/web` workspace.**
   - browser/runtime seams live under `apps/web/src/observability/**` and `apps/web/src/security/**`
   - deploy/provider seams live under `apps/web/deploy/security/**`
   - source-map workflow lives under `apps/web/scripts/**`

3. **CSP reports always land on a self-owned same-origin scrub endpoint first.**
   - accept Reporting API and legacy `csp-report`
   - scrub before storage, aggregation, or optional vendor forwarding

4. **Sentry is consent-gated and error-only in v1.**
   - `sendDefaultPii: false`
   - strong `beforeSend` and `beforeBreadcrumb` filters
   - `allowUrls` / `denyUrls` restrict noise
   - `tracePropagationTargets = []`
   - browser tracing is deferred to a later increment

5. **RUM uses `web-vitals/attribution` to a same-origin endpoint, not Sentry tracing.**
   - only sanitized route-group metrics are sent

6. **Source maps are upload-only build artifacts.**
   - build with hidden source maps
   - upload and validate
   - delete `.map` files before deploy completes

## Frozen Architecture Decisions

### Runtime ownership

- `packages/web-security-csp-sentry/docs/` is the workflow anchor only.
- v1 executable files belong only to:
  - `apps/web/src/observability/**`
  - `apps/web/src/security/**`
  - `apps/web/deploy/security/**`
  - `apps/web/scripts/**`
- colocated tests belong under the same `apps/web` tree.

### Nonce and header ownership

- edge/origin adapters generate one nonce per HTML response
- the response injects that nonce into:
  - the CSP header
  - a browser-readable HTML seam
- browser-created `<style>` tags must consume that injected nonce
- the browser app must not generate its own nonce

### CSP scrub-first rules

- primary endpoint is same-origin `POST /__csp_report`
- accepted inputs:
  - Reporting API envelopes
  - legacy `{"csp-report": {...}}`
- raw payloads must never be stored or forwarded directly

### Sentry privacy rules

- never send:
  - ids of any kind
  - hashed, stable, deterministic, or entity-derived correlators
  - tokens
  - secrets
  - request or response bodies
  - encrypted blobs
  - raw query strings
  - user content
  - raw entity-bearing URLs or path segments
- allowed operational correlation is limited to non-user-content fields such as:
  - release
  - environment
  - route group
  - error category

### Source-map rules

- `build.sourcemap = 'hidden'`
- upload before deploy
- validate during upload
- remove `dist/**/*.map` before deployment completes
- final public artifacts must not expose `.map` files

## Build-Ready Implementation Phases

### Phase 1 — Host observability seams and privacy primitives

File boundary:

- `apps/web/package.json`
- `apps/web/src/main.tsx`
- `apps/web/src/providers/AppProviders.tsx`
- `apps/web/src/routes/RouteErrorBoundary.tsx`
- `apps/web/src/observability/**`
- related colocated tests under `apps/web/src/**`

Required implementation:

- add consent-state handling for observability
- add redaction primitives and route-group classification inside the host workspace
- add local reporting seams without enabling vendor telemetry by default
- ensure route-boundary errors stay locally renderable when observability is off

Gate:

- with consent unset or denied, the browser host emits no outbound Sentry or RUM traffic

Scoped verification:

- unit tests for redaction and route-group classification
- host tests proving no init/no send when consent is absent

### Phase 2 — CSP policy, nonce consumption, and scrub endpoint contract

File boundary:

- `apps/web/index.html`
- `apps/web/src/security/**`
- `apps/web/deploy/security/**`
- related colocated tests under `apps/web/src/**` and `apps/web/deploy/**`

Required implementation:

- define report-only and enforce policy builders
- define same-origin `/__csp_report` handling for both CSP payload families
- implement scrub-first normalization before any persistence or forwarding
- define nonce transport from HTML response into runtime-created `<style>` tags
- define provider-neutral security-header adapter inputs

Gate:

- the runtime has one scrub-first CSP ingestion path and one nonce contract that does not depend on archived Next middleware

Scoped verification:

- fixture tests for both CSP payload families
- redaction tests proving query strings, samples, ids, and user content are removed
- nonce extraction and `<style nonce>` tests

### Phase 3 — Sentry init, privacy filters, and same-origin RUM

File boundary:

- `apps/web/src/observability/**`
- `apps/web/src/routes/RouteErrorBoundary.tsx`
- `apps/web/deploy/security/**` only if the RUM endpoint contract is mounted there
- related colocated tests under `apps/web/src/**` and `apps/web/deploy/**`

Required implementation:

- add Sentry browser/react wiring only after consent and complete config
- enforce `sendDefaultPii: false`, `beforeSend`, `beforeBreadcrumb`, `allowUrls`, `denyUrls`
- keep `tracePropagationTargets = []`
- add `web-vitals/attribution` batching to a same-origin `/__rum` endpoint

Gate:

- synthetic events prove final Sentry payloads are privacy-safe before any vendor egress occurs

Scoped verification:

- unit tests for scrubbed events and breadcrumbs
- tests proving ids, hashed correlators, token-bearing URLs, and user content are absent
- tests proving tracing headers are not emitted
- tests proving `/__rum` batches contain route-group metrics only

### Phase 4 — Hidden source maps, cleanup scripts, and build proof

File boundary:

- `apps/web/vite.config.ts`
- `apps/web/package.json`
- `apps/web/scripts/**`
- `.github/workflows/supply-chain-security.yml` only if existing guard wiring must be extended
- related script/build tests under `apps/web/scripts/**`

Required implementation:

- enable hidden source maps
- add upload/validate/finalize/delete scripts
- prove `dist/**` no longer contains deployable `.map` files after cleanup
- document same-origin asset policy and SRI rules for any future external asset

Gate:

- deploy-ready artifacts expose no public `.map` files and no accidental external asset drift

Scoped verification:

- build smoke with hidden maps enabled
- script test proving `.map` files exist before upload cleanup and are removed after cleanup
- grep/build checks proving the final artifact has no `.map` references

## Risks

- Provider-specific header/endpoint adapters can sprawl if Phase 2 does not keep one shared contract.
- Privacy drift remains the main failure mode; even breadcrumbs or route helpers can leak sensitive state if not routed through one scrub policy.
- Deferring browser tracing is intentional, but future increments must reopen privacy review if tracing is added.
- Hosted rollout can still fail later if provider/runtime configuration does not match the frozen adapter contract.

## Open Questions

1. Should scrubbed CSP reports be retained only in logs/aggregates at first, or should Phase 2 also define a durable normalized storage shape now?
2. Should `/__rum` stay distinct from `/__csp_report`, or should build later unify them behind one telemetry adapter while preserving separate scrub contracts?
