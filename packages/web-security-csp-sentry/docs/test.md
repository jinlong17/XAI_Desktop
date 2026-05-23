# web-security-csp-sentry — Test Strategy

## Validation Goals

- prove CSP rollout, scrub-first reporting, and source-map removal are implementation-owned and testable inside `@repo/web`
- prove Sentry cannot send sensitive browser/runtime data under the frozen rules
- prove no new runtime package is required for this row
- prove route-group RUM payloads are useful without exposing user content

## Ownership And Command Freeze

- `packages/web-security-csp-sentry/` is docs-only in v1
- runtime tests live under `apps/web/src/**`, `apps/web/deploy/**`, and `apps/web/scripts/**`
- executable commands use `@repo/web` only

## Unit Coverage

### Observability helpers

- `apps/web/src/observability/**`
  - strips query strings and raw URLs
  - drops ids, hashed/deterministic correlators, request bodies, encrypted payloads, and user content
  - removes browser-extension and off-allowlist noise
  - shapes Sentry payloads to operational fields only
  - shapes RUM payloads to route-group metrics only

### Security helpers

- `apps/web/src/security/**`
  - accepts Reporting API payloads
  - accepts legacy `csp-report` payloads
  - normalizes to scrubbed output only
  - generates report-only and enforce policies
  - extracts nonce from the HTML seam
  - applies nonce to runtime-created `<style>` elements

### Deploy and script helpers

- `apps/web/deploy/security/**`
  - preserves provider-neutral header/endpoint contract
- `apps/web/scripts/**`
  - validates source-map upload/cleanup sequence

## Contract Coverage

- consent state:
  - `unknown` / `denied` emit nothing
  - `granted` unlocks init only when config is complete
- Sentry config:
  - `sendDefaultPii: false`
  - `beforeSend` and `beforeBreadcrumb` are applied
  - `allowUrls` / `denyUrls` behave as frozen in `api.md`
  - `tracePropagationTargets = []`
  - no browser tracing integration is initialized
- CSP report endpoint:
  - same-origin endpoint accepts both report shapes
  - forwarding, if enabled later, occurs only after scrub
- source maps:
  - hidden-map build emits `.map` files pre-cleanup
  - cleanup removes public `.map` artifacts post-upload

## Integration / Regression Scenarios

- route error is thrown under `/app/*`
  - local boundary still renders fallback UI
  - opt-in `denied` sends nothing
  - opt-in `granted` sends only scrubbed error payload
- synthetic CSP violation report posted to `/__csp_report`
  - endpoint accepts
  - normalized scrubbed output contains no raw query string, raw sample, id, or user content
- runtime-created `<style>` path
  - injected nonce exists and is attached
  - missing nonce fails loudly without unsafe-inline fallback
- RUM collection
  - emits route-grouped metrics only to `/__rum`
  - no raw search, entity id, token, or user text lands in payload
- source-map flow
  - build creates hidden `.map`
  - upload script validates
  - cleanup removes `.map`
  - final deploy artifact exposes no `.map`

## Mock Strategy

- Sentry transport:
  - replace outbound transport with deterministic in-memory capture to assert final payload shape
- consent state:
  - use explicit `unknown` / `granted` / `denied` fixtures rather than UI-driven consent flow
- sensitive host state:
  - use fixtures derived from current `AppProviders` mock data so tests prove account/device ids and tokens are scrubbed
- edge/origin adapter:
  - test provider-neutral header and HTML token contracts locally with request/response fixtures
- CSP report payloads:
  - use both Reporting API and legacy browser fixture bodies
- Web Vitals:
  - inject synthetic metric objects instead of requiring real browser field timings

## Suggested Commands For Build / Verify

```bash
pnpm --filter @repo/web check-types
pnpm --filter @repo/web build
pnpm --filter @repo/web exec vitest run "src/**/*.test.ts" "src/**/*.test.tsx" "deploy/**/*.test.ts" "scripts/**/*.test.ts"
rg -n "sourceMappingURL" apps/web/dist/assets
find apps/web/dist -name '*.map'
```

Provider-facing header/endpoint smoke checks after implementation:

```bash
curl -I https://<host>/ | rg "content-security-policy|reporting-endpoints|strict-transport-security|x-frame-options|referrer-policy|permissions-policy|x-content-type-options"
curl -X POST https://<host>/__csp_report -H 'content-type: application/csp-report' --data @fixtures/csp-report.json
curl -X POST https://<host>/__rum -H 'content-type: application/json' --data @fixtures/rum.json
```

## Acceptance Criteria

1. CSP report-only and enforce policies are generated from one shared contract.
2. Same-origin `/__csp_report` scrub logic is covered for both report formats.
3. Sentry payload tests prove that ids, hashed/deterministic correlators, query strings, request bodies, encrypted blobs, tokens, and user content are absent.
4. `tracePropagationTargets = []` and no tracing headers are emitted in v1.
5. Built production artifacts do not expose `.map` files after cleanup.
6. Route-group RUM payloads exist and stay privacy-safe.

## Residual Risks To Call Out In Verify

- Real provider deployment may still differ from local header fixtures until `web-deploy-ci-browser-matrix` wires the hosted path.
- Browser CSP reporting differences across Safari/Firefox/Chromium may require compatibility fixes even when local fixture tests pass.
- Hidden source maps prevent comment discovery, but verify still needs to confirm hosted artifact storage does not separately expose `.map` files.
