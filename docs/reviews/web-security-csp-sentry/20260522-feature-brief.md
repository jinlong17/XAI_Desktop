# Feature Brief — web-security-csp-sentry

| 字段 | 值 |
|---|---|
| Feature Slug | `web-security-csp-sentry` |
| 创建日期 | 2026-05-22 |
| 作者 | Codex (`feature-plan` inline) |
| Step 0 QA Gate | PASS |
| 输出状态 | `READY_FOR_DISCOVERY` |
| Source | `docs/reviews/web-security-csp-sentry/20260521-roadmap-seed.md` |
| 关联文档 | `docs/workflow/roadmap/web-ticktick-parity.md`、`docs/adr/0006-web-face-hybrid-reuse-boundary.md`、`docs/PLUGIN_MAP.md`、`docs/planning/sub-prds/web/PRD.md`、`docs/planning/sub-prds/web/dev-plan.md`、`apps/web/{package.json,vite.config.ts,index.html,src/main.tsx,src/providers/AppProviders.tsx,src/routes/RouteErrorBoundary.tsx}`、`apps/release-site/{middleware.ts,docs/security.md,next.config.js}`、`packages/web-release-site-archive-vite-shell/docs/{design.md,api.md}`、`packages/web-auth-device-session/docs/api.md`、`packages/web-browser-e2e-crypto-runtime/docs/design.md`、`packages/web-console-host-router/docs/{design.md,api.md}` |

---

## Structured Brief

### Feature Title

W11 Web security headers, CSP reporting, and privacy-safe observability hardening

### Canonical Name And Rationale

- Canonical slug: `web-security-csp-sentry`
- Package docs anchor: `packages/web-security-csp-sentry/docs/`
- Why this name fits:
  - the roadmap row already uses it
  - the row is cross-cutting Web hardening work rather than a product module
  - it owns CSP, headers, source-map hygiene, Sentry privacy controls, and Web Vitals/RUM contracts needed before PWA and deploy rows

### Problem / Motivation

The canonical browser host exists at `apps/web`, but the security and observability posture is still below the roadmap requirement:

1. `apps/web` is now a Vite SPA with no active CSP, reporting endpoint, or security-header contract.
2. The archived Next.js site still contains nonce middleware and header examples, but that code is no longer the runtime source of truth.
3. `apps/web/src/main.tsx` and `RouteErrorBoundary.tsx` do not yet define any privacy-safe error/reporting bootstrap.
4. Source-map handling, report-only rollout, Sentry opt-in, and Web Vitals collection are not frozen, so later build work would have to make security decisions that belong in planning.

This row must harden the browser face without violating the explicit constraints:

- CSP reports must land on a self-owned scrub endpoint before any optional Sentry forwarding.
- Sentry payloads must exclude ids, secrets, request bodies, encrypted blobs, tokens, full entity ids, query strings with secrets, and user content.
- Production source maps must be uploaded and then removed from served artifacts.

### Desired Outcome

Produce an implementation-ready plan that freezes:

- CSP `Report-Only` rollout on staging before production enforce
- same-origin CSP scrub endpoint ownership and scrub semantics
- nonce handling for runtime-created `<style>` tags in a static Vite host
- edge/origin-owned security headers for the Web SPA
- privacy-safe Sentry opt-in, error capture, and trace-propagation constraints
- Web Vitals/RUM collection and route-group bucketing
- hidden source-map generation, upload, validation, and removal flow
- SRI and supply-chain guardrails that match the repo’s current Vite same-origin build

### Scope

- Freeze the runtime ownership split across `apps/web`, same-origin edge/origin adapters, and shared pure helpers.
- Define the CSP policy lifecycle:
  - staging `Content-Security-Policy-Report-Only`
  - production `Content-Security-Policy`
  - `Reporting-Endpoints` plus legacy `report-uri` compatibility
- Define the self-owned CSP report scrub endpoint contract and optional post-scrub Sentry forwarding.
- Define nonce transport from HTML response into browser-created `<style>` tags.
- Define security headers:
  - HSTS
  - `X-Frame-Options`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - `X-Content-Type-Options`
- Define Sentry opt-in gating, privacy redaction, allowed/denied URL filters, and trace-propagation limits.
- Define Web Vitals/RUM capture, batching, and route-group tagging.
- Define hidden-source-map build settings and upload/delete sequence.
- Initialize `design.md`, `api.md`, `test.md`, and `dev_log.md`.

### Non-goals

- No production code in this planning run.
- No new auth/session/device lifecycle behavior beyond consuming existing route/provider seams.
- No business-module implementation work for Todo/Project/Productivity rows.
- No deploy-provider provisioning, real DSN setup, or secret creation in this planning run.
- No reopening of `apps/web` host ownership or router decisions already frozen by earlier Web rows.
- No service-worker/PWA implementation; that stays in `web-pwa-sw-release`.

### Constraints

- `apps/web` is a static Vite host, so per-request CSP nonce and header enforcement cannot depend on archived Next.js middleware.
- CSP reports must first hit a same-origin scrub endpoint owned by this product.
- `sendDefaultPii` must remain `false`, and privacy redaction is mandatory for both events and breadcrumbs.
- Browser tracing must not send headers broadly by default; any propagation must be explicitly constrained.
- Production `.map` files must never remain in deployed public artifacts.
- Same-origin runtime remains preferred; if any future external CDN asset is introduced, it must carry SRI and pass review.
- Dependencies declared as shipped for this row are:
  - `web-release-site-archive-vite-shell`
  - `web-auth-device-session`
  - `web-browser-e2e-crypto-runtime`
  - `web-console-host-router`

### Acceptance Criteria

1. `docs/reviews/web-security-csp-sentry/20260522-discovery-review.md` records repo evidence, official-source research, options, tradeoffs, recommendation, risks, and build phases.
2. `packages/web-security-csp-sentry/docs/{design,api,test,dev_log}.md` agree on one ownership model for headers, nonce handling, CSP report ingestion, Sentry opt-in, RUM, and source maps.
3. The plan freezes a self-owned scrub-first path for CSP reports and rejects direct browser-to-Sentry CSP reporting as the primary flow.
4. `api.md` freezes redaction semantics strongly enough that build does not have to invent privacy rules.
5. `test.md` defines redaction, report-scrub, consent-gate, source-map-removal, and header-policy verification.
6. `dev_log.md` ends with `Status = NEEDS_REVIEW` and `Suggested Next = feature-review`.

### Open Questions

1. Whether the same-origin scrub/report endpoint should be implemented as one shared telemetry surface for both CSP and RUM or as distinct `/__csp_report` and `/__rum` endpoints with shared scrub helpers.
2. Whether low-rate Sentry browser tracing should be enabled at all in Phase 3, or whether v1 should keep Sentry error-only and use `web-vitals/attribution` for route-group RUM.
3. Which repo path should own provider-specific edge/origin adapters during build:
   - `apps/web/deploy/security/**`
   - or a small Web runtime package plus provider wrappers

### Planner Handoff

- Recommended direction: edge/origin enforces headers and injects nonce into HTML, `apps/web` consumes the nonce and opt-in state, CSP goes through a same-origin scrub endpoint first, Sentry stays privacy-filtered and consent-gated, and Web Vitals are collected with explicit route-group tagging.
- Key review focus: whether the scrub contract is strong enough, whether trace propagation is sufficiently constrained, and whether source-map and CDN/SRI guardrails are strict enough for a token-bearing SPA.
- Expected next output: discovery review plus the docs four-pack in `NEEDS_REVIEW`, ready for `feature-review`.
