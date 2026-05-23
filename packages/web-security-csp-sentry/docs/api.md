# web-security-csp-sentry — API / Contract Notes

## Runtime Surface

This row owns Web hardening and observability contracts. It does not introduce business-domain APIs, and `packages/web-security-csp-sentry/` remains a docs-only anchor in v1.

## Implementation Ownership Freeze

Executable ownership is frozen to the existing `@repo/web` workspace:

- `apps/web/src/observability/**`
- `apps/web/src/security/**`
- `apps/web/deploy/security/**`
- `apps/web/scripts/**`

Out of scope for v1:

- `packages/web-security-csp-sentry/src/**`
- `packages/web-security-csp-sentry/package.json`
- `pnpm --filter @repo/web-security-csp-sentry ...`

## Upstream Interfaces

| Surface | Assumption |
|---|---|
| `apps/web/src/main.tsx` | canonical browser bootstrap seam for router, service worker, and future observability bootstrap |
| `apps/web/src/providers/AppProviders.tsx` | session/device/auth context is already mounted here; observability code must never expose its internals |
| `apps/web/src/routes/RouteErrorBoundary.tsx` | route-family error seam exists and can be wired into privacy-safe error reporting |
| `apps/web/vite.config.ts` | current Vite host owns production source-map mode |
| `apps/release-site/middleware.ts` | reference-only nonce/header example; not an implementation dependency |
| `@repo/web-auth-device-session` | auth/session/device flows stay same-origin and privacy-sensitive |
| `@repo/web-browser-e2e-crypto-runtime` | browser crypto runtime may hold sensitive key and blob context in memory |
| `@repo/plugin-console/web` and host router seams | route groups are stable enough for route-family performance tagging without raw entity paths |

## Downstream Interfaces

| Consumer | Contract this row must preserve |
|---|---|
| `web-pwa-sw-release` | consumes final security headers and same-origin telemetry seams without reopening CSP ownership |
| `web-deploy-ci-browser-matrix` | wires provider-specific rollout using the frozen source-map and header contracts |
| `web-ga-acceptance-suite` | asserts CSP enforce, privacy-safe Sentry, and RUM availability against stable docs |

## Consent And Initialization Contract

### Consent state

The browser host consumes one opt-in state machine:

```ts
type ObservabilityConsentState = "unknown" | "granted" | "denied";
```

Rules:

- `unknown` and `denied` both mean:
  - do not initialize Sentry
  - do not emit RUM payloads
  - do not forward CSP reports to Sentry
- `granted` unlocks:
  - Sentry init when required env is present
  - same-origin RUM batching
  - optional post-scrub CSP forwarding if explicitly enabled later

The storage backend may evolve later; this row freezes host-side behavior only.

## CSP And Header Contract

### Header modes

- staging:
  - `Content-Security-Policy-Report-Only`
- production:
  - `Content-Security-Policy`

Both modes may include:

- `Reporting-Endpoints`
- legacy `report-uri`
- optional `report-to`

Required security headers:

- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` with unused capabilities denied
- CSP `frame-ancestors 'none'`

### Nonce contract

- nonce is generated per HTML response by edge/origin code
- the same nonce is injected into:
  - the CSP header
  - a browser-readable HTML seam
- browser-created `<style>` tags must attach that nonce
- the browser app must not synthesize its own nonce independently of the response

### Browser-readable nonce seam

The implementation may choose meta-tag injection or HTML token replacement, but the contract is:

```ts
type RuntimeNonceSource = {
  value: string;
  source: "meta" | "html-token";
};
```

Failure semantics:

- missing nonce in a code path that attempts runtime style injection is a hard feature error, not a silent fallback to unsafe inline style

## CSP Report Endpoint Contract

### Endpoint

- same-origin `POST /__csp_report`

Accepted payload families:

- Reporting API envelope
- legacy `{"csp-report": {...}}` body

### Scrub result shape

Raw browser reports must not be stored or forwarded directly. Build must normalize them into a scrubbed shape such as:

```ts
type ScrubbedCspViolation = {
  receivedAt: string;
  environment: "web-dev" | "web-staging" | "web-prod";
  disposition: "report" | "enforce";
  effectiveDirective: string;
  violatedDirective?: string;
  blockedUriClass: "self" | "inline" | "eval" | "data" | "blob" | "external" | "other";
  documentRouteGroup: string;
  statusCode?: number;
  sourceFileClass?: "self" | "extension" | "external" | "unknown";
};
```

Prohibited in stored or forwarded output:

- raw query strings
- raw `document-uri`
- raw `blocked-uri`
- `script-sample`
- ids or identifier-like path segments
- user content
- secrets or token-bearing values

Optional forwarding:

- if consent is granted and forwarding is enabled, forward only the scrubbed representation or aggregate summary

## Sentry Event Contract

### Initialization

Required controls:

- `sendDefaultPii: false`
- `beforeSend`
- `beforeBreadcrumb`
- `allowUrls`
- `denyUrls`
- `tracePropagationTargets = []`

### Required redaction semantics

Must remove or replace:

- access tokens, refresh tokens, secret-like headers
- request and response bodies
- encrypted blobs and mutation payloads
- ids of any kind, including account/device/entity ids
- raw query strings such as `?token=` or `?next=`
- raw entity-bearing URLs or path segments
- user-generated content
- browser-extension attributed noise where not allowlisted

Must not add:

- hashed correlators
- deterministic surrogate ids
- stable pseudonymous identifiers
- entity-derived fingerprints

Allowed correlation output is limited to non-user-content operational fields:

- route group
- environment
- release
- error category

### Tracing constraints

- v1 default safe state:
  - `tracePropagationTargets = []`
  - no browser tracing integration
- if a later increment enables tracing, that increment must reopen privacy review before any headers are sent

## Web Vitals / RUM Contract

### Endpoint

- same-origin `POST /__rum`

### Metric source

Recommended primary source:

- `web-vitals/attribution`

Tracked metrics:

- `LCP`
- `INP`
- `CLS`
- `TTFB`

### Batch shape

```ts
type RumMetricEnvelope = {
  environment: "web-dev" | "web-staging" | "web-prod";
  release: string;
  routeGroup: string;
  metrics: Array<{
    name: "LCP" | "INP" | "CLS" | "TTFB";
    value: number;
    rating: "good" | "needs-improvement" | "poor";
    delta?: number;
    attribution?: Record<string, unknown>;
  }>;
};
```

Rules:

- payloads go to same-origin endpoint first
- route grouping is mandatory
- payloads must not contain ids, raw URLs, search queries, user text, or token-bearing values

## Source Map Contract

- `build.sourcemap = 'hidden'`
- release key is derived from build/revision identity
- build/upload order is frozen:
  1. build
  2. create release
  3. set commits
  4. inject Debug IDs
  5. upload with validation
  6. finalize
  7. delete `.map`
  8. deploy
  9. mark deploy

Required invariant:

- the final public artifact must contain no accessible `.map` files

## SRI / Supply-Chain Contract

- current preferred path is no external CDN runtime assets
- if an external script or stylesheet is introduced:
  - `integrity` is mandatory
  - `crossorigin` must be set appropriately
- app-level dependency hygiene must include documented audit/lock/update gates

## Error Semantics

| Error | Meaning | Required reaction |
|---|---|---|
| `observability_consent_missing` | user has not opted in | skip vendor init and outbound telemetry |
| `observability_not_configured` | DSN, env, release, or endpoint config missing | keep app usable; surface non-fatal local warning only |
| `csp_nonce_missing` | runtime style path cannot find injected nonce | fail the unsafe path; do not silently downgrade policy |
| `csp_report_rejected` | incoming report is malformed or unsafely shaped | reject or drop after safe audit logging |
| `privacy_filter_failed` | event/report cannot be proven scrubbed | drop event/report rather than send |
| `public_sourcemap_present` | deploy artifact still exposes `.map` | fail build/deploy gate |

## Idempotency Notes

- repeated Sentry init attempts after `denied` consent must remain no-op
- repeated scrub of the same CSP or RUM payload must converge to the same sanitized output
- repeated source-map cleanup must be safe even when maps are already absent
