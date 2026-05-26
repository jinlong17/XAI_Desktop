# ADR-0008: Cloudflare Deploy Target and CSP Treatment for XAI Web Console

| 字段 | 值 |
|------|---|
| 状态 | Accepted |
| 日期 | 2026-05-24 |
| 决策者 | Jinlong (project owner) + Claude (`feature-plan` → `feature-review`) |
| Supersedes | none |
| Superseded by | none |
| Amendments | 2026-05-25 §S3 D3 + §S6 `_headers` — `connect-src` widened to include `https://api.anthropic.com` (row `xai-web-ai-chat-real-llm-adapter`, gap-closure #2); 2026-05-25 §S3 D3 + §S6 `_headers` — `connect-src` + `img-src` widened to include `https://tile.openstreetmap.org` (row `xai-web-board-filter-share-map`, gap-closure #6, MapView OSM tiles); 2026-05-25 §S3 D3 + §S6 `_headers` — `connect-src` extended with `https://api.notion.com`, `https://oauth2.googleapis.com`, `https://api.linear.app` (row `xai-web-settings-integrations-3rd-party`, gap-closure #7, OAuth token endpoints for Notion/GCal/Linear); `frame-src` NOT widened — all 3 providers set `X-Frame-Options: DENY` on authorize pages; 2026-05-26 §S3 D3 + §S6 `_headers` — `connect-src` extended with `https://js.stripe.com`, `https://checkout.stripe.com`, `https://buy.stripe.com` (row `xai-web-settings-premium-stripe`, gap-closure #8, Stripe Payment Link same-tab redirect); `script-src` + `frame-src` NOT widened — no Stripe.js bundle, no Embedded Checkout iframe in v1 stub |

---

## S1 — 概述 / Header

This ADR records four sub-decisions needed to produce the **first publicly
reachable production URL** for the SHIPPED XAI Web Console (`@repo/web`). All
24 roadmap rows for the web console are SHIPPED on `origin/main`; a deploy
surface did not previously exist.

| Sub-decision | Selected option |
|---|---|
| D1 — Deploy target | **Cloudflare Pages** |
| D2 — Auth posture for the public URL | **`VITE_WEB_AUTH_MODE=mock-authenticated`** |
| D3 — CSP nonce treatment under static hosting | **Strip nonce + `_headers`-delivered CSP (Candidate A.1)** |
| D4 — CI build command | **Vanilla `pnpm --filter @repo/web build`** |

Source brief: `docs/reviews/xai-web-deploy-cloudflare/20260524-feature-brief.md`
Discovery report: `docs/reviews/xai-web-deploy-cloudflare/20260524-discovery-review.md`
Predecessor: ADR-0007 (`apps/web/dist` is the Vite build output — confirmed compatible)
Architecture boundary: ADR-0003 + ADR-0006 (Web face only; zero overlay / desktop / core / plugin code touched)

---

## S2 — 背景

### Problem

`apps/web/` (`@repo/web`) is a production-grade Vite 7 + React 19 SPA.
As of 2026-05-24, all 24 modules in
`docs/workflow/roadmap/xai-web-console.md` are SHIPPED on `origin/main`.
The build is accessible today only via `pnpm --filter @repo/web dev` on a
developer machine. There is no publicly reachable production URL.

### User requirement

The project owner (Jinlong) needs:
1. A shareable public URL for demos, recruiter sharing, and feedback loops.
2. Automatic CI deploy on every push to `main` and preview deploy on every PR.
3. CSP not regressed vs the SHIPPED `web-security-csp-sentry` row.
4. Secrets never committed to the repo.
5. A runbook covering secret rotation, rollback, and quota monitoring.

### Codebase context

- `apps/web/index.html` (lines 2 + 6) carries `__XAI_CSP_NONCE__` placeholders
  injected at runtime by the SHIPPED `web-security-csp-sentry` layer. Cloudflare
  Pages pure-static hosting cannot inject per-request nonces — this necessitates
  Decision 3.
- `apps/web/deploy/security/` is an **existing SHIPPED library namespace**
  (from `web-security-csp-sentry`) exporting pure functions (`buildSecurityHeaders`,
  `ingestCspReport`, `ingestRumPayload`). It is NOT a competing deploy-config
  home. The new `wrangler.toml` sits at `apps/web/wrangler.toml` (next to
  `vite.config.ts`), not inside `apps/web/deploy/`, to preserve this distinction.
  Future Worker layer will reuse the library functions from `apps/web/deploy/security/`.
- Root `.nvmrc` is absent; P2 adds one pinned to `22` (Node 22 LTS).
- `cloudflare/wrangler-action@v3` is the current canonical GitHub Action for
  Pages deploys; the legacy `cloudflare/pages-action` is deprecated.

### Related ADRs

- ADR-0003: Three-faces architecture (Web face only — nondum laesa).
- ADR-0006: Web-face hybrid reuse boundary (deploy config is host-shell-adjacent;
  no new data contracts introduced).
- ADR-0007: XAI Web Console build-form — `apps/web/dist` is the Vite output
  dir (`pages_build_output_dir = "./dist"` matches ADR-0007 §1).

---

## S3 — 方案 (Options Analyzed)

### D1 — Deploy target: Pages vs Workers Static Assets

| Option | Pros | Cons |
|--------|------|------|
| **A. Cloudflare Pages** (selected) | Cleanly static; built-in PR previews; `pages_build_output_dir = "./dist"` one-liner; free-tier 500 builds/month; `wrangler-action@v3` first-class support. | Future `/api/chat` Worker = separate project or migration when AI Chat backend row lands. |
| B. Workers Static Assets | `[assets] directory` + `not_found_handling = "single-page-application"` natively co-locates future Workers. No migration cost when AI Chat backend lands. | Slightly more config; builds billed per Workers requests (different quota model); premature for a fully-static payload today. |

Pages selected because `apps/web/` is fully static today; migration cost when
AI Chat backend lands is documented as a one-line config swap (Decision 1 →
flip to Workers Static Assets; ADR-0008 is superseded by that future ADR).

### D2 — Auth posture

| Option | Pros | Cons |
|--------|------|------|
| **A. `VITE_WEB_AUTH_MODE=mock-authenticated`** (selected) | Zero secret-management cost; all 24 modules render with seed data; matches "public demo URL" intent; `dev:mock-auth` script already validates this path. | No real user sign-in. Anonymous visitors see demo data only. |
| B. Real Supabase auth | Real user sessions. | Requires copying Supabase secrets into GitHub Secrets + Cloudflare env vars; `web-auth-device-session` (SHIPPED) is device-session-only, not full auth UI. Deferred to `xai-web-real-auth-production` follow-up row. |

### D3 — CSP nonce treatment under static hosting

The `__XAI_CSP_NONCE__` placeholder in `apps/web/index.html` (lines 2 + 6) is
swapped per-request by the SHIPPED `web-security-csp-sentry` runtime. Cloudflare
Pages cannot do per-request injection.

| Option | Pros | Cons |
|--------|------|------|
| **A.1 Strip nonce + `_headers`-delivered CSP** (selected) | Cleanly static; no Worker; CSP delivered via `apps/web/public/_headers`; fallback to domain-allowlist covers Google Fonts dependency; strictness delta is explicit and acknowledged. | Drops `'nonce-<value>'` from `script-src`/`style-src` and drops `report-uri`/`report-to`. Documented security debt. Follow-up trigger exists. |
| B. Workers Static Assets + nonce-injecting Worker | Preserves per-request nonce strictly. | Adds a Worker surface this row was designed to avoid; couples deploy to a Worker runtime cost + complexity. |
| C. Pragmatic no-nonce static (undocumented) | Simple. | Same strictness drop as A.1 but without explicit delta recording — unacceptable under the SHIPPED `web-security-csp-sentry` posture contract. |

**CSP strictness delta vs SHIPPED `web-security-csp-sentry` posture:**
- DROPS `'nonce-<value>'` from `script-src` and `style-src`.
- DROPS `report-uri` / `report-to` (no Worker endpoint to receive reports this row).
- RETAINS all other directives: `default-src 'self'`, `img-src 'self' data: blob:`,
  `connect-src 'self'`, `font-src 'self' data: https://fonts.gstatic.com`,
  `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`,
  `form-action 'self'`, `upgrade-insecure-requests`.

**Amendment 2026-05-25 — `connect-src` allowlist extension (binding precedent for future waves):**

`connect-src` was widened from `'self'` to `'self' https://api.anthropic.com` to
support the `xai-web-ai-chat-real-llm-adapter` row (gap-closure #2), which calls
the Anthropic Messages API directly from the browser when the user supplies their
own API key.

Decision pattern (binding precedent for wave 2 and wave 3 CSP rows):

| Directive | Before | After |
|---|---|---|
| `connect-src` | `'self'` | `'self' https://api.anthropic.com` |

**Extension rule**: future rows that need to reach additional external APIs MUST
follow this same amendment pattern — add a row to the Amendments frontmatter
field above, extend the `connect-src` allowlist in `apps/web/public/_headers`,
update the `_headers` content snippet in §S6, and write a source-text guard test
under `apps/web/src/__tests__/csp.test.ts`. This avoids re-litigating the
Candidate A.1 decision each time a new external origin is added.

**Security posture**: `https://api.anthropic.com` is the vendor's canonical API
hostname; no wildcard is introduced. The key is user-supplied and stored in
IndexedDB + WebCrypto AES-GCM-256 (see `packages/plugin-web-ai-chat/src/internal/secretStore.ts`).
No API key is compiled into the static bundle; the CSP origin allowlist does not
constitute a secret.
- Google Fonts dependency (`https://fonts.googleapis.com`, `https://fonts.gstatic.com`)
  is covered by explicit allowlisting in `style-src` and `font-src`.
- No `'unsafe-inline'`, no `'unsafe-eval'`, no `*` wildcard introduced.
- This delta is **security debt**. Follow-up trigger: when the AI Chat backend
  row introduces a Worker layer, revisit and restore per-request nonces via
  that Worker. At that point this ADR is superseded.

**Amendment 2026-05-25 — `connect-src` + `img-src` OSM tile server extension (gap-closure row #6 MapView):**

The MapView in `packages/plugin-web-board-views` fetches map tiles from OpenStreetMap's
tile CDN. Leaflet loads tiles as `<img>` elements (img-src) and may also issue
fetch/XHR requests (connect-src). Both directives must be widened.

| Directive | Before | After |
|---|---|---|
| `connect-src` | `'self' https://api.anthropic.com` | `'self' https://api.anthropic.com https://tile.openstreetmap.org` |
| `img-src` | `'self' data: blob:` | `'self' data: blob: https://tile.openstreetmap.org` |

**Security posture (OSM):** `https://tile.openstreetmap.org` is the canonical
OSM tile CDN hostname. No subdomain wildcard is introduced. Tiles are static
PNG images served under the OSM open-data licence. No user credentials or secrets
are transmitted in tile requests. This allowlist entry is the minimum necessary
for Leaflet OSM tiles to load — neither `*` nor a subdomain wildcard is accepted.

Same **Extension rule** applies: future rows reaching additional external tile
servers MUST follow this pattern — amend ADR frontmatter, extend `_headers`,
update §S6 snippet, write a csp.test.ts guard.

**Amendment 2026-05-25 — `connect-src` OAuth token endpoint extension (gap-closure row #7 Integrations 3rd-party):**

The Integrations pane v1 OAuth stub for Notion / Google Calendar / Linear establishes
the PKCE authorization-code flow pattern. The `code` is received at the callback route
and discarded; no real token exchange occurs in v1. However, the 3 token endpoint
hostnames are added to `connect-src` now to establish the allowlist pattern for future
real implementations and to document the intended network boundary.

| Directive | Before | After |
|---|---|---|
| `connect-src` | `'self' https://api.anthropic.com https://tile.openstreetmap.org` | `'self' https://api.anthropic.com https://tile.openstreetmap.org https://api.notion.com https://oauth2.googleapis.com https://api.linear.app` |
| `frame-src` | _(not explicitly declared; defaults to default-src)_ | **NOT widened** — all 3 providers set `X-Frame-Options: DENY` on their authorize pages (verified in discovery §3.3); the authorize URL is opened via `window.location.assign` (same-tab navigation), not in an iframe. |

**Security posture:**
- `https://api.notion.com` — Notion's canonical API hostname (token endpoint + API);
  no subdomain wildcard.
- `https://oauth2.googleapis.com` — Google's canonical OAuth 2.0 token endpoint;
  no subdomain wildcard.
- `https://api.linear.app` — Linear's canonical API hostname (token endpoint);
  no subdomain wildcard.
- Authorize URLs (`https://api.notion.com/v1/oauth/authorize`,
  `https://accounts.google.com/o/oauth2/v2/auth`,
  `https://linear.app/oauth/authorize`) are browser-navigation targets, NOT
  `connect-src` entries; the browser navigates to them via `window.location.assign`.
- `frame-src` NOT widened: all 3 providers' authorize pages set `X-Frame-Options: DENY`,
  confirming they cannot be framed. CSP `frame-src` widening is therefore unnecessary
  and would only expand attack surface without enabling any functionality.
- No `*` wildcard. No `'unsafe-inline'`. No `'unsafe-eval'`.
- Source-text guard test: `apps/web/src/__tests__/csp.test.ts` CSP3 case asserts all 3
  token hostnames are present in `_headers`.

**Amendment 2026-05-26 — `connect-src` Stripe Payment Link extension (gap-closure row #8 Premium Stripe stub):**

The Premium pane v1 Stripe Checkout stub redirects the user to a Stripe-hosted
Payment Link via `window.location.assign(paymentLinkUrl)`. No Stripe.js is bundled
(enforced by `no-stripe-js-bundle.test.ts` TT-NO-STRIPE-JS source-text guard) and
no Embedded Checkout iframe is used (no `frame-src` widening). Three Stripe hostnames
are added to `connect-src` as a defensive allowlist for the Payment Link redirect
flow and any check-tier network calls that Payment Links may issue.

| Directive | Before | After |
|---|---|---|
| `connect-src` | `'self' https://api.anthropic.com https://tile.openstreetmap.org https://api.notion.com https://oauth2.googleapis.com https://api.linear.app` | `'self' https://api.anthropic.com https://tile.openstreetmap.org https://api.notion.com https://oauth2.googleapis.com https://api.linear.app https://js.stripe.com https://checkout.stripe.com https://buy.stripe.com` |
| `script-src` | `'self'` | **NOT widened** — no Stripe.js bundle (`TT-NO-STRIPE-JS` source-text guard enforces this) |
| `frame-src` | _(not explicitly declared)_ | **NOT widened** — no Embedded Checkout iframe in v1 stub (same-tab redirect only); `CSP4-FRAME-SRC-CLEAN` asserts `frame-src` absent |

**Security posture (Stripe):**
- `https://js.stripe.com` — Stripe's canonical script CDN + API hostname; no subdomain wildcard.
- `https://checkout.stripe.com` — Stripe Checkout redirect endpoint; no subdomain wildcard.
- `https://buy.stripe.com` — Stripe Payment Link buy-page hostname; no subdomain wildcard.
- `script-src` NOT widened: Stripe.js (loaded from `https://js.stripe.com/v3/`) MUST NOT be bundled
  in v1 (enforced by `no-stripe-js-bundle.test.ts`). The Payment Link redirect requires no JS bundle.
- `frame-src` NOT widened: Embedded Checkout (iframe-based) is explicitly NOT used in v1.
  `CSP4-FRAME-SRC-CLEAN` source-text guard asserts `frame-src` absent from `_headers`.
- No `*` wildcard. No `'unsafe-inline'`. No `'unsafe-eval'`.
- HC3 CRITICAL: No Stripe Secret Key (`sk_test_*` / `sk_live_*`) anywhere in client source.
  Enforced by `no-stripe-secret-key.test.ts` TT-NO-SK source-text guard.
- Source-text guard test: `apps/web/src/__tests__/csp.test.ts` CSP4 case asserts all 3 Stripe
  hostnames are present; CSP4-SCRIPT-SRC-CLEAN + CSP4-FRAME-SRC-CLEAN assert cleanliness.

Same **Extension rule** applies: future rows reaching additional Stripe endpoints MUST follow
this pattern — amend ADR frontmatter, extend `_headers`, update §S6 snippet, write a csp.test.ts guard.

Operator runbook for `VITE_STRIPE_PAYMENT_LINK_URL` env var rotation: `apps/web/deploy/README.md`.

**Runtime nonce caller audit (P2):** `requireRuntimeNonce` and
`createNonceStyleElement` are defined in `apps/web/src/security/nonce.ts` and
called only in test files (`nonce.test.ts`). No production caller in
`packages/plugin-web-*/src/` or `apps/web/src/` (excluding test files) fires
these functions. `readRuntimeNonce` returns `null` on absence — graceful
degradation confirmed. AC-C3-3 satisfied.

### D4 — CI build command

| Option | Pros | Cons |
|--------|------|------|
| **A. Vanilla `pnpm --filter @repo/web build`** (selected) | First-deploy friendly; zero new secrets; no Sentry dependency in CI. `sourcemap: "hidden"` in `vite.config.ts` strips the `//# sourceMappingURL=` comment from the JS bundle (browsers and DevTools will not auto-fetch `.map` files), but the `.map` files themselves DO ship to `apps/web/dist/` and ARE publicly reachable at predictable URLs on `*.pages.dev` (any operator who knows the asset filename can probe `<file>.map`). Runbook §5.2 documents this trade and names the post-build `*.map` exclusion lever for operators who want stricter exposure. This row accepts the default (publish maps) on the strength of the runbook's honest disclosure. | No Sentry sourcemap correlation until follow-up row. |
| B. `pnpm --filter @repo/web build:secure` | Full 8-step Sentry sourcemap chain in CI. | Requires `SENTRY_AUTH_TOKEN` in GitHub Secrets; couples this row to Sentry availability; deferred to `xai-web-deploy-sentry-sourcemaps` follow-up row. |

---

## S4 — 决策 (Selected Option Set + Frozen Assumptions)

### Selected options

| D | Selected | Rejected |
|---|----------|----------|
| D1 | Cloudflare Pages | Workers Static Assets (future trigger recorded) |
| D2 | `VITE_WEB_AUTH_MODE=mock-authenticated` | Real Supabase auth (deferred) |
| D3 | Strip nonce + `_headers` CSP (Candidate A.1; strictness delta recorded §S3 D3) | Workers nonce-injecting layer (B); silent no-nonce (C) |
| D4 | Vanilla `pnpm --filter @repo/web build` | `build:secure` (deferred) |

### 15 Frozen Assumptions

These lock at plan acceptance. Changing any requires either re-opening this row
via Revise mode or opening a follow-up row with a new ADR.

1. **Target = Cloudflare Pages.** `wrangler.toml` declares
   `pages_build_output_dir = "./dist"`. CI invokes
   `pages deploy ./apps/web/dist --project-name=xai-web-console`.
   Workers Static Assets is the documented future-trigger when AI Chat
   backend lands.

2. **Build payload = `apps/web/dist/` produced by `pnpm --filter @repo/web build`.**
   No `build:secure` (no Sentry sourcemap upload) in this row. Vite continues
   to emit `sourcemap: "hidden"` per `apps/web/vite.config.ts`.

3. **Auth mode = `VITE_WEB_AUTH_MODE=mock-authenticated`** at build time. CI
   sets this in the `env:` block on the build step. No Supabase secrets enter
   the repo or CI.

4. **Secrets = `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` only.** Stored
   in GitHub repo Secrets. No Sentry token, no Supabase keys this row.

5. **CSP delivery = `apps/web/public/_headers` shipped statically by Pages.**
   The build pipeline strips `__XAI_CSP_NONCE__` placeholders from
   `dist/index.html` via a Vite `transformIndexHtml` plugin. The placeholder
   MUST NOT reach the browser as a literal. CSP itself drops the per-request
   nonce; falls back to a hash / domain-allowlisted policy covering `'self'` +
   `https://fonts.googleapis.com` + `https://fonts.gstatic.com`.

6. **CSP strictness delta vs SHIPPED `web-security-csp-sentry` posture is
   recorded explicitly in this ADR §S3 D3.** Recognized as security debt.
   Follow-up trigger: when the AI Chat backend row introduces a Worker layer,
   revisit and consider restoring per-request nonces via that Worker.

7. **Non-CSP security headers in `_headers` match `apps/web/deploy/security/headers.ts`
   `buildSecurityHeaders` defaults verbatim** (HSTS / nosniff / DENY /
   strict-origin / Permissions-Policy with the same disabled-feature list).
   That library remains compiled but unreachable at static runtime — accepted
   dead-code-at-runtime, kept for the future Worker layer to reuse.

8. **GitHub Action = `cloudflare/wrangler-action@v3`** (NOT the deprecated
   `cloudflare/pages-action`). Action pinned `@v3`; bundled `wranglerVersion`
   pinned to `3.114.0`.

9. **Workflow triggers:** `push` on `main` → production deploy; `pull_request`
   → preview deploy. No `paths-ignore` filter in v1 (runbook lever for
   quota-exhaustion).

10. **Custom domain = none (v1).** Ships at `*.pages.dev`. DNS + TLS work is
    a future row.

11. **Node + pnpm versions are pinned by config files.** `.nvmrc` at repo root
    (new — added in P2) pins Node `22`. Root `package.json`
    `packageManager: "pnpm@9.0.0"` pins pnpm. Workflow uses
    `actions/setup-node@v4` with `node-version-file: '.nvmrc'` and
    `pnpm/action-setup@v4` reading the root `packageManager`.

12. **Branch policy:** `main` deploys to production; PR branches deploy to
    Cloudflare Pages preview environments. Pass
    `--branch=${{ github.head_ref || github.ref_name }}` to the wrangler-action.

13. **GitHub Action does NOT auto-commit anything to the repo.** Verify-gate
    evidence file is written by `feature-verify` locally, not pushed by CI.

14. **Pre-deploy gate (Phase 5):** GitHub Secrets `CLOUDFLARE_API_TOKEN` and
    `CLOUDFLARE_ACCOUNT_ID` must be configured before P5 can complete the
    deploy. If not configured at P5 time, two fallbacks are accepted: (a)
    manual `wrangler deploy` by the human operator, OR (b) BLOCKED handoff
    awaiting secret configuration.

15. **Scope is closed.** Out-of-scope items (AI Chat real backend, custom
    domain, R2/D1/KV, Sentry sourcemap CI, real auth, E2E browser matrix)
    are recorded in the brief §4. Any in-scope add requires a revise pass.

---

## S5 — 后果

### Positive

- The first publicly reachable production URL for XAI Web Console exists.
- Every PR to `main` automatically gets a Cloudflare Pages preview URL.
- Every push to `main` automatically deploys to production.
- All 24 modules render in `mock-authenticated` mode; localStorage round-trips.
- SPA deep-link fallback is handled natively by Cloudflare Pages.
- No secrets enter the repo; `.dev.vars` / `.wrangler/` are gitignored.
- Deploy configuration is auditable (wrangler.toml + CI YAML + runbook).
- Security headers (HSTS, nosniff, X-Frame-Options, Referrer-Policy,
  Permissions-Policy) are delivered consistently via `_headers`.

### Negative (Security Debt)

- CSP strictness is reduced vs the SHIPPED `web-security-csp-sentry` row:
  - Per-request `'nonce-<value>'` is gone from `script-src` and `style-src`.
  - `report-uri` / `report-to` are not delivered (no Worker endpoint).
  - This is acknowledged and documented explicitly here; it is NOT silent.
- The `apps/web/deploy/security/` library functions (`buildSecurityHeaders`
  etc.) are unreachable at static runtime (dead code until a Worker layer lands).

### Deferred

- Workers Static Assets migration: deferred until AI Chat backend row reaches
  `feature-plan`.
- Real Supabase auth productionization: deferred to `xai-web-real-auth-production`.
- Sentry sourcemap CI upload: deferred to `xai-web-deploy-sentry-sourcemaps`.
- Custom domain DNS/TLS: deferred to `xai-web-custom-domain`.
- E2E browser matrix: deferred to `web-deploy-ci-browser-matrix`.
- Restoring per-request CSP nonces: deferred to the Worker layer when AI Chat
  backend lands.

---

## S6 — 实施规则 (Implementation Rules)

### `wrangler.toml` shape

```toml
name = "xai-web-console"
compatibility_date = "2026-05-24"
pages_build_output_dir = "./dist"
```

Location: `apps/web/wrangler.toml` (NOT inside `apps/web/deploy/` — that path
is the SHIPPED security-library namespace).
No `[assets]` block. No `[vars]` block. No secret values.

### `_headers` content

Delivered at `apps/web/public/_headers` (Vite copies `public/` verbatim into
`dist/`, and Cloudflare Pages serves `_headers` from the output root):

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; img-src 'self' data: blob: https://tile.openstreetmap.org; connect-src 'self' https://api.anthropic.com https://tile.openstreetmap.org https://api.notion.com https://oauth2.googleapis.com https://api.linear.app https://js.stripe.com https://checkout.stripe.com https://buy.stripe.com; font-src 'self' data: https://fonts.gstatic.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
```

_(amended 2026-05-25: `connect-src` extended to include `https://api.anthropic.com`
per gap-closure row #2 — see §S3 D3 Amendment above)_

_(amended 2026-05-25: `connect-src` + `img-src` extended to include `https://tile.openstreetmap.org`
per gap-closure row #6 MapView OSM tiles — see §S3 D3 Amendment above)_

_(amended 2026-05-25: `connect-src` extended to include `https://api.notion.com`,
`https://oauth2.googleapis.com`, `https://api.linear.app` per gap-closure row #7
Integrations OAuth PKCE stub — see §S3 D3 Amendment above; `frame-src` NOT widened)_

_(amended 2026-05-26: `connect-src` extended to include `https://js.stripe.com`,
`https://checkout.stripe.com`, `https://buy.stripe.com` per gap-closure row #8
Premium Stripe stub — see §S3 D3 FOURTH amendment above; `script-src` + `frame-src` NOT widened)_

No `'unsafe-inline'`. No `'unsafe-eval'`. No `*` wildcard.

### Nonce strip mechanism

`apps/web/vite.config.ts` adds a `transformIndexHtml` plugin that replaces
`__XAI_CSP_NONCE__` with an empty string during the build. The plugin emits
a log line confirming the substitution. The `data-csp-nonce` attribute and
the `<meta name="xai-csp-nonce">` element are stripped from the output
`index.html`. `readRuntimeNonce` returns `null` on absence — graceful fallback.

### CI workflow shape

File: `.github/workflows/deploy-web.yml`
Action: `cloudflare/wrangler-action@v3` (NOT `cloudflare/pages-action`)
Secret references: `${{ secrets.CLOUDFLARE_API_TOKEN }}` and
`${{ secrets.CLOUDFLARE_ACCOUNT_ID }}` — no literal values.
Deploy command: `pages deploy ./dist --project-name=xai-web-console
--branch=${{ github.head_ref || github.ref_name }}`

### Secret naming

GitHub repo Secrets MUST be named exactly:
- `CLOUDFLARE_API_TOKEN` — Cloudflare API token with scope `Cloudflare Pages:Edit`
- `CLOUDFLARE_ACCOUNT_ID` — the Cloudflare account ID where the project lives

### `apps/web/deploy/security/` namespace coexistence note

`apps/web/deploy/security/` is a SHIPPED library namespace (from the
`web-security-csp-sentry` row). It exports pure functions for building CSP
headers, ingesting CSP reports, and ingesting RUM payloads. It is NOT a
deploy-config home. The new `wrangler.toml` lives at `apps/web/wrangler.toml`
(peer to `vite.config.ts`). A future Worker layer that needs to deliver the
canonical `buildSecurityHeaders` output per-request can import from
`apps/web/deploy/security/headers.ts` directly. The two paths are distinct and
should not be conflated.

### Runbook anchors

Operator runbook: `docs/runbooks/cloudflare.md`
Sections: First-time Setup / Rotate Secrets / Rollback / Manual Deploy /
Quota Monitoring / Disaster Recovery.

---

## S7 — 相关

- **ADR-0003**: `docs/adr/0003-three-faces-architecture.md` — Web face only;
  zero overlay / desktop / plugin code touched.
- **ADR-0006**: `docs/adr/0006-web-face-hybrid-reuse-boundary.md` — Deploy
  config is host-shell-adjacent; no new data contracts.
- **ADR-0007**: `docs/adr/0007-xai-web-console-build-form.md` — Predecessor
  ADR; `apps/web/dist` is the Vite output directory (confirmed compatible).
- **Feature brief**: `docs/reviews/xai-web-deploy-cloudflare/20260524-feature-brief.md`
- **Discovery review**: `docs/reviews/xai-web-deploy-cloudflare/20260524-discovery-review.md`
- **Runbook**: `docs/runbooks/cloudflare.md`
- **wrangler-action docs**: https://github.com/cloudflare/wrangler-action (v3)
- **Cloudflare Pages `_headers` spec**: https://developers.cloudflare.com/pages/configuration/headers/
- **PLUGIN_MAP.md**: `docs/PLUGIN_MAP.md` — all 24 `xai-web-*` rows SHIPPED;
  no mocks required.

---

## S8 — Carve-out: single-row exception to Cross-Vendor Manual Browser Smoke Policy

**Date**: 2026-05-24

**Operator decision**: Following the BLOCKED verdict from `feature-verify` (2026-05-24),
the operator (Jinlong) chose **Option 3 — narrow policy carve-out** to allow the
`xai-web-deploy-cloudflare` row (the row that first produces the public `*.pages.dev`
URL) to advance to `READY_TO_SHIP` without the manual cross-browser smoke matrices
already filled.

### Scope

This carve-out applies to **one and only one row**: `xai-web-deploy-cloudflare`.
The base policy at `docs/workflow/roadmap/xai-web-console.md` line 17 continues
to apply to all future deploy-touching rows without exception.

### Conditions for the carve-out to be valid

All three conditions MUST be satisfied before `xai-web-deploy-cloudflare` may
flip to `READY_TO_SHIP` under this carve-out:

1. **Follow-up row commitment**: The `xai-web-deploy-cloudflare` dev_log Ship Report
   MUST explicitly queue a follow-up row (`xai-web-cross-vendor-smoke-evidence`
   or equivalent) to be created within 24 hours of first-deploy.

2. **Evidence commitment**: That follow-up row MUST commit to filling real
   PASS/FAIL evidence (browser versions + per-scenario verdicts) into:
   - `packages/xai-web-shell/docs/test.md` §Manual Verification (M1..M18 matrix)
   - `docs/reviews/xai-web-dashboard-grid/20260524-cross-vendor-smoke.md`
   (Chrome 120 / Safari 17 / Firefox 121 / Safari iOS rows all filled; checklist
   scaffolds DO NOT count as evidence).

3. **ADR recording**: This section (§S8) constitutes the operator's recorded
   acknowledgement of the exception, per condition (iii) of the manifest
   carve-out clause.

### Policy linkage

The manifest carve-out clause is recorded at:
`docs/workflow/roadmap/xai-web-console.md` line 17
(appended to the Cross-Vendor Manual Browser Smoke Policy paragraph, 2026-05-24).

### Rationale

The primary goal of this row is to produce the **first publicly reachable
production URL** for the XAI Web Console — a shareable URL for demos and feedback.
Deferring that goal until manual cross-browser matrices are complete on real
hardware creates an indefinite blocking dependency. The carve-out accepts this
risk explicitly, records it honestly, and bounds the deferral to 24 hours via
the follow-up row commitment. The manual smoke policy was authored 2 hours before
the BLOCKED verify dispatch (same ahead-of-main batch); without a carve-out, the
row would be permanently blocked by its own batch's policy until hardware testing
is complete.
