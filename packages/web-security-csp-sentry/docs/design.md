# web-security-csp-sentry — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option A — docs-anchor-only package, `apps/web` runtime ownership, scrub-first CSP endpoints, consent-gated error-only Sentry, same-origin Web Vitals RUM, and hidden-source-map upload/delete |
| Review Doc Path | `docs/reviews/web-security-csp-sentry/20260522-discovery-review.md` |
| Review Date/Version | 2026-05-22 rev-2 |
| Feature Type | W11 Web security and observability hardening |
| Roadmap | `web-ticktick-parity` · feature #20 · W11 |

## Frozen Assumptions

- `apps/web` remains the canonical browser host and the only executable workspace for this row in v1.
- `packages/web-security-csp-sentry/` is a docs/workflow anchor only. It does not become a runtime package in this revision.
- The archived Next.js code under `apps/release-site/` is reference-only and cannot be used as runtime truth.
- Because `apps/web` is a static Vite SPA, nonce generation and security headers must be enforced by edge/origin adapters.
- CSP reports must first reach a product-owned same-origin scrub endpoint before any optional forwarding.
- Sentry is opt-in, privacy-filtered, and error-only in v1. Browser tracing is deferred.
- Production source maps are build artifacts only and must be removed from the public deploy artifact after upload succeeds.
- Same-origin bundled assets are preferred. Any future external asset requires explicit SRI review.

## Scope Boundary

This feature owns planning for:

- CSP report-only to enforce rollout
- security headers and nonce transport contract
- same-origin CSP scrub endpoint contract
- Sentry init/opt-in/redaction rules
- same-origin Web Vitals/RUM collection contract
- hidden source-map upload/delete flow
- SRI and supply-chain guardrails for the Web host

This feature does not own:

- auth/session/device business logic
- encrypted cache or sync runtime logic
- PWA/service-worker product behavior
- deployment-provider provisioning or secret setup
- creation of a new reusable workspace package for this row

## Dependency Overview

- Upstream source: `docs/reviews/web-security-csp-sentry/20260521-roadmap-seed.md`
- Governing docs:
  - `docs/adr/0006-web-face-hybrid-reuse-boundary.md`
  - `docs/planning/sub-prds/web/PRD.md`
  - `docs/planning/sub-prds/web/dev-plan.md`
  - `docs/PLUGIN_MAP.md`
- Existing runtime seams:
  - `apps/web/src/main.tsx`
  - `apps/web/src/providers/AppProviders.tsx`
  - `apps/web/src/routes/RouteErrorBoundary.tsx`
  - `apps/web/vite.config.ts`
- Shipped upstream dependencies:
  - `web-release-site-archive-vite-shell`
  - `web-auth-device-session`
  - `web-browser-e2e-crypto-runtime`
  - `web-console-host-router`
- Downstream rows unlocked:
  - `web-pwa-sw-release`
  - `web-deploy-ci-browser-matrix`
  - `web-ga-acceptance-suite`

## Proposed Implementation Shape

### Docs anchor

- `packages/web-security-csp-sentry/docs/**`
  - planning, contract, and workflow state only

### Browser host integration

- `apps/web/src/observability/**`
  - consent-state handling
  - Sentry bootstrap
  - redaction helpers
  - route-group mapping
  - Web Vitals/RUM payload shaping
- `apps/web/src/security/**`
  - CSP policy helpers
  - nonce consumption
  - browser-facing scrub/normalization seams

### Edge/origin adapters

- `apps/web/deploy/security/**`
  - report-only vs enforce header mode
  - same-origin `/__csp_report` and `/__rum` mounting
  - nonce injection into the HTML response

### Build/release scripts

- `apps/web/scripts/**`
  - source-map upload
  - source-map validation
  - source-map cleanup

## Privacy Contract Freeze

- Sentry payloads must not include ids, secrets, request bodies, encrypted blobs, tokens, full entity ids, user content, or raw query strings.
- Sentry payloads must not include hashed, stable, deterministic, or entity-derived correlators.
- Allowed Sentry-side correlation is limited to non-user-content operational fields such as:
  - release
  - environment
  - route group
  - error category
- CSP and RUM stay same-origin and scrub-first before any optional downstream forwarding.

## Build Phase Freeze

### Phase 1 — Host observability seams and privacy primitives

- touch only:
  - `apps/web/package.json`
  - `apps/web/src/main.tsx`
  - `apps/web/src/providers/AppProviders.tsx`
  - `apps/web/src/routes/RouteErrorBoundary.tsx`
  - `apps/web/src/observability/**`
  - related colocated tests under `apps/web/src/**`

### Phase 2 — CSP policy, nonce consumption, and scrub endpoint contract

- touch only:
  - `apps/web/index.html`
  - `apps/web/src/security/**`
  - `apps/web/deploy/security/**`
  - related colocated tests under `apps/web/src/**` and `apps/web/deploy/**`

### Phase 3 — Sentry init, privacy filters, and same-origin RUM

- touch only:
  - `apps/web/src/observability/**`
  - `apps/web/src/routes/RouteErrorBoundary.tsx`
  - `apps/web/deploy/security/**` only if needed for endpoint mounting
  - related colocated tests under `apps/web/src/**` and `apps/web/deploy/**`

### Phase 4 — Hidden source maps, SRI/supply-chain guards, and build proof

- touch only:
  - `apps/web/vite.config.ts`
  - `apps/web/package.json`
  - `apps/web/scripts/**`
  - `.github/workflows/supply-chain-security.yml` only if strictly needed
  - related script/build tests under `apps/web/scripts/**`
