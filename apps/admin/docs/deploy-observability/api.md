# api.md — xai-admin-deploy-observability (roadmap row #6, FINAL)

> Interface contracts / error semantics for the row-#6 hardening slice.
> All new runtime code is a **typed seam** with a no-op default; later wiring swaps the
> implementation behind these interfaces without touching callers. No new `@repo/*` surface;
> no `@repo/core/src/events`; no Tauri. Browser receives NO telemetry secret.

## 1. Observability — telemetry sink contract (NEW, app-local, no-op default)

```ts
// apps/admin/src/observability/telemetry.ts
export interface TelemetryContext {
  /** page/route or component identifier — NON-secret label only */
  scope?: string;
  /** arbitrary non-secret tags; values MUST NOT carry credentials */
  tags?: Record<string, string | number | boolean>;
}

export interface AdminTelemetrySink {
  /** Report a caught error. MUST NOT throw. Default impl is a no-op. */
  captureError(error: unknown, ctx?: TelemetryContext): void;
  /** Report a named non-error event. MUST NOT throw. Default impl is a no-op. */
  captureEvent(name: string, ctx?: TelemetryContext): void;
}

/**
 * Slice-row-#6 default sink — DOES NOTHING.
 * No network, no storage, no console output of secrets. Provably secret-free.
 * Real sinks (Sentry/console/server) are a documented future swap behind this interface
 * (see release-operator-runbook.md). Wiring a real sink is an OPERATOR step.
 */
export const noopTelemetrySink: AdminTelemetrySink;
```

**Error / edge semantics (binary, testable):**
- `noopTelemetrySink.captureError(...)` / `captureEvent(...)` → returns `void`, performs **no**
  `fetch`/`XHR`, **no** `localStorage`/`sessionStorage`/`IndexedDB` write, **no** secret to console.
- Neither method ever throws (a telemetry sink must never break the app).
- The interface carries NO DSN/endpoint/token field — there is no place for a secret to live.
- A real sink, if later added, is injected at the boundary (§2); CSP `connect-src` would need an
  operator-approved ingest host via the ADR-0008 extension protocol (NOT this slice).

## 2. Observability — error boundary contract (NEW, app-local)

```ts
// apps/admin/src/observability/AdminErrorBoundary.tsx
export interface AdminErrorBoundaryProps {
  children: React.ReactNode;
  /** injected sink; defaults to noopTelemetrySink */
  sink?: AdminTelemetrySink;
  /** CSP-clean fallback UI; defaults to a minimal token-styled panel */
  fallback?: React.ReactNode;
}

export class AdminErrorBoundary extends React.Component<AdminErrorBoundaryProps, { hasError: boolean }> {
  // componentDidCatch(error, info) → this.props.sink.captureError(error, { scope: "admin-root" })
  // render() → hasError ? fallback : children
}
```

**Semantics:**
- On a render error in any descendant, `componentDidCatch` forwards the error to the injected sink
  (default no-op) and `render()` returns the fallback instead of crashing the tree.
- The fallback is **CSP-clean** (no inline `<style>`/`<script>`; styled via the existing admin
  stylesheet / OKLCH token classes) — consistent with the `connect-src 'self'` / no-`unsafe-inline`
  posture.
- Mounted at the app root in `App.tsx`, **below** `AdminRouteGate` so a render error never exposes
  admin content on a non-admin/unauthenticated session (the guard still fails closed first).
- The sink is injectable for testing (pass a spy sink) and for the future real wiring.

## 3. Deploy-isolation assertions (NEW, test-only contract — no runtime API)

These are not a runtime API; they are the **invariants** `deploy-isolation.test.ts` locks:

| Invariant | Assertion | Source of truth |
|---|---|---|
| Separate Pages project | admin `wrangler.toml` `name` === `"xai-admin-dashboard"` AND !== `"xai-web-console"` (web) | `apps/admin/wrangler.toml` vs ADR-0008 §S6 |
| Self-contained deploy config | admin `wrangler.toml` has NO `[vars]`, NO `[[secrets]]`/`[secrets]`, NO inline `account_id`/token (no shared creds in-repo) | `apps/admin/wrangler.toml` |
| Output isolation | admin `pages_build_output_dir` === `"./dist"` (its own dist, not `apps/web/dist`) | `apps/admin/wrangler.toml` |
| Header parity after build | `apps/admin/dist/_headers` content === `apps/admin/public/_headers` content (Vite copies verbatim; no mutation) | both files after `vite build` |
| No cross-import | no file under `apps/web/src/**` imports from `apps/admin` (admin is physically isolated) | source-text scan of `apps/web/src` |

Runtime Cloudflare account separation (one account/project owns admin, distinct from web's
production project) is an **operator/dashboard fact** documented in `release-operator-runbook.md` §
Promotion Gate — it is not assertable in-repo this slice.

## 4. CSP / env check assertions (EXTEND existing + NEW)

### 4.1 — CSP guard extension (`csp.test.ts`, EXTEND)

Existing `csp.test.ts` already asserts: CSP present, `connect-src 'self'` (no provider/OAuth/
Stripe/OSM origins), `frame-ancestors 'none'`, HSTS, nosniff, DENY, Referrer, Permissions,
`object-src 'none'`. Row #6 ADDS:

| New assertion | Expectation |
|---|---|
| `default-src 'self'` | present |
| `script-src 'self'` | present AND contains no `'unsafe-inline'`, no `'unsafe-eval'`, no `*` |
| `base-uri 'self'` | present |
| `form-action 'self'` | present |
| `upgrade-insecure-requests` | present |
| no wildcard | the whole CSP line contains no bare `*` host token and no `'unsafe-` token |

### 4.2 — Env secret guard (`env-no-secret.test.ts`, NEW)

| Assertion | Expectation |
|---|---|
| No secret value in `.env*` | `apps/admin/.env.example` (and any committed `.env*`) contains no secret-shaped literal (`sk_test_`/`sk_live_`/`sk-`/`AIza…`/`service_role`/Sentry-DSN shape) |
| No secret-named exposed var | no `VITE_`-prefixed variable name matches `*_SECRET` / `*_KEY` / `*_TOKEN` / `*_DSN` / `*SERVICE_ROLE*` (a `VITE_` var is shipped to the browser; such a name would imply a leaked credential). `VITE_ADMIN_MOCK_CLAIM` + `VITE_ADMIN_AUTH_MODE` are allowed (non-secret flags) |

## 5. Telemetry-secret guard assertion (`no-telemetry-secret.test.ts`, NEW)

| Assertion | Expectation |
|---|---|
| No Sentry DSN in source | no `https://<key>@<org>.ingest.sentry.io/<projectId>`-shaped literal and no bare `ingest.sentry.io` host string anywhere in `apps/admin/src/**` (excluding this guard's own doc comment) |
| No Sentry DSN in bundle | same scan over `apps/admin/dist/**` (`.js`/`.css`/`.html`) after build; self-building like the existing `no-secret-bundle.test.ts` |

This complements (does not replace) the existing `no-secret.test.ts` / `no-secret-bundle.test.ts` /
`no-provider-key.test.ts` — those stay green; row #6 only adds the telemetry-DSN shape.

## 6. ESLint flat config (RR-1 fold-in, NEW — tooling, no runtime API)

`apps/admin/eslint.config.js` exports the flat-config array, extending
`@repo/eslint-config/react-internal` (which already pulls `base.js` → `dist/**` ignore + the
`onlyWarn` plugin + typescript-eslint + react/react-hooks). Mirror of `apps/web/eslint.config.js`.
Any rule a shipped admin file trips is resolved with a **scoped** `files`-targeted override or a
justified inline disable — never a global rule-off. `pnpm --filter @repo/admin lint` must exit 0 at
`--max-warnings 0`.

## 7. Security / idempotency / boundary notes

- **Security (hard)**: the observability scaffold adds NO secret and NO network surface; the
  no-telemetry-secret guard + the existing no-secret/bundle/provider-key guards keep the bundle
  provably secret-free. CSP stays `connect-src 'self'` (no ingest host).
- **Idempotency**: the no-op sink methods are trivially idempotent (no state); the error boundary
  is pure React state (`hasError`); all new tests are read-only/source-text or hermetic self-build.
- **No new typed events** (`@repo/core/src/events` untouched); **no Tauri commands** (browser-side).
- **No public library surface**: `apps/admin` is an app — these interfaces are internal; admin
  modules MUST NOT be imported by `apps/web` or `packages/core` (asserted by `deploy-isolation.test.ts`).
- **No `syncScope` entity** introduced (ADR-0013 §D4 deferred).
