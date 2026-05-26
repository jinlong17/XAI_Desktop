# Discovery Review — xai-web-settings-premium-stripe (gap-closure row #8)

| Field | Value |
|---|---|
| Slug | `xai-web-settings-premium-stripe` |
| Roadmap | `docs/workflow/roadmap/xai-web-console-gap-closure.md` row #8 (W2) |
| Seed brief | `docs/reviews/xai-web-settings-premium-stripe/20260524-roadmap-seed.md` |
| Parent ADR | ADR-0009 §D2-G3 (P0 gap-closure; ≥5/9 known gaps SHIPPED to unblock P1 Desktop launch) |
| Companion ADR | **ADR-0008 §S3 D3** — to be amended IN-PLACE (**FOURTH** amendment) per row #2 binding precedent (Anthropic) + row #6 precedent (OSM tiles) + row #7 precedent (OAuth token endpoints) |
| Target package | `packages/plugin-web-settings-rest/` (Stable, SHIPPED row #24 2026-05-23; extended 2026-05-25 row #2 + 2026-05-26 row #7) — **extend** Premium pane |
| Pattern reference | row #2 ai-chat (CSP amend precedent + "no secret in client" pattern via IndexedDB+WebCrypto — Stripe analogue: "no SK in client") + row #5 dashboard (native `<dialog>` pattern, optional v1) + row #7 settings-integrations (3rd-party redirect-callback pattern + disclosure banner pattern + `_pref_*` boolean flag pattern + sessionStorage usage) |
| Pattern setter for | Future P1 paid-tier rows (real subscription wire) + future client-only payment flows |
| Dispatched by | `xai-roadmap-loop` SERIAL Wave 2 third row (after row #7 SHIPPED `5085a03` 2026-05-26) |
| Author | Claude Opus 4.7 (1M context) — feature-plan, 2026-05-26 |

---

## 1. Problem framing

The Settings → Premium pane (`packages/plugin-web-settings-rest/src/panes/premiumPane.tsx`) was shipped 2026-05-23 (row #24) as a **static placeholder** — a Star SVG emblem, a bilingual headline ("Unlock Premium Features" / "解锁高级功能"), one paragraph of body copy, and an "Upgrade Now" button whose click handler is wired to nothing (`<button type="button">` with no `onClick`). Row #24 `api.md` §4.2 is explicit: "Upgrade CTA is a no-op button."

For the P1 Desktop launch gate (ADR-0009 §D2-G3 requires ≥5/9 gap-closure rows SHIPPED), this row closes **Gap 6b** by wiring the Upgrade CTA to a real **Stripe Checkout** flow. v1 is **stub-only** — the user reaches a real Stripe Checkout page (test-mode or live-mode per environment), completes payment, and is returned to a thank-you page that **flips a client-side boolean flag** (`xai_pref_premium_tier`); no real subscription state is persisted in any backend; no entitlement is enforced anywhere downstream; "Cancel Subscription" simply clears the flag without calling any Stripe API. A **30-day client-clock timer** reverts the flag automatically and a non-dismissible disclosure banner makes this scope unmistakable.

The goal is **pattern establishment + UX-shape validation** more than billing infrastructure:

1. Establish the **CSP `connect-src` + `script-src` + (decision-dependent) `frame-src` allowlist pattern** for `js.stripe.com` / `api.stripe.com` / `checkout.stripe.com`. Per the binding precedent from ADR-0008 §S3 D3 amendments 1-3, every new external origin extends the same `_headers` file + `csp.test.ts` source-text guard.
2. Establish the **redirect-callback pattern** for a 3rd-party payment processor — analogous to row #7's OAuth callback (`/app/settings/integrations/callback`) but for Stripe's `after_completion.redirect.url`. Two new routes: `success` (Checkout completed) and `cancel` (user backed out).
3. Establish the **"no Secret Key in client" pattern** by using a **Stripe Payment Link** (pre-created in Stripe Dashboard) — Payment Links accept full Checkout without ever needing an SK on the client (and without needing a backend `/api/checkout/session/create` route). The publishable key (PK) is optional in this flow (only needed if we use Stripe.js for embedded analytics — which we are NOT doing in v1).
4. Validate the **client-only entitlement-stub UX**: gold badge in topbar + tier-aware language at the pane level. Real entitlement enforcement (gating features) is **out of scope** in v1 by design; the badge is purely cosmetic.

The "stub-only" framing is deliberate per HC3 / HC4 / HC7 / HC8 of the seed brief — building a real subscription backend with webhooks, customer.subscription.* sync, retry-on-failure, dunning, etc. is out of scope for the Web Console (no Worker layer until ADR-0008 D3 follow-up). When the real backend lands, the only delta is the callback handler swap (validate session_id via Stripe API instead of trusting the redirect) plus the addition of webhook-driven persistent state; every other piece (Payment Link config, CSP allowlist, callback routes, tier-flag UI, disclosure banner) is forward-compatible.

---

## 2. Current state of the Premium pane

### 2.1 Source code (read 2026-05-26)

`packages/plugin-web-settings-rest/src/panes/premiumPane.tsx` (49 LOC):

- Pure presentational component, no `useState`, no `usePref`, no event emit.
- Renders a `premium-emblem` SVG star, `<h4>` with `premium.headline_en`, `<p>` with `premium.body_en`, and a `<button>` with the global token `settings.upgrade_now`.
- Button has `className="btn primary"` and inline-style `{ height: 36, padding: "0 22px" }` — no click handler.

### 2.2 Settings pane composition seam

`apps/web/src/routes/modules/settingsPaneComposition.ts` substitutes the placeholder Pane object via `paneRegistry.map(p => p.id === "premium" ? premiumPane : p)`. This row does **NOT** change the composition seam — `premiumPane` keeps the same id and barrel export. The pane's internal render tree expands (Upgrade button onClick handler + Cancel Subscription button + disclosure banner + tier-aware text).

### 2.3 SHIPPED Status Panel

`packages/plugin-web-settings-rest/docs/dev_log.md` Workflow State block shows `Status = SHIPPED` (PR-2 drift reconciled 2026-05-24). The 2026-05-25 row #2 (ai-chat) extension lineage block lives in `packages/xai-web-ai-chat/docs/`. The 2026-05-26 row #7 (integrations) extension lineage block was appended in-place 2026-05-26 (Workflow State Panel + Phase Plan + Work Log + Commits + Blockers + row #7 Lineage block all preserved). HC10 — this row appends a **third** block beneath; both prior blocks MUST be preserved verbatim.

### 2.4 Tests baseline (post-row-#7)

`packages/plugin-web-settings-rest/docs/test.md` §3 records 81 tests baseline + §5 records ~73 new tests from row #7 = **154 tests** currently in `plugin-web-settings-rest`. The 3 `PR1..PR3` tests in `premiumPane.test.tsx` cover the static placeholder baseline:

- PR1: Renders without error
- PR2: Bilingual headline
- PR3: id + icon + i18nKey correct

HC9 enforcement: these 3 tests MUST stay green. The new extension tests extend the file (do NOT replace it) and gate on Upgrade click → redirect, callback parsing, tier flip, banner visible, etc.

### 2.5 Adjacent state: `xai_pref_*` registry

`packages/plugin-web-storage/src/internal/registry.ts` currently registers 37 row-#24 keys + 3 row-#7 boolean flags (`xai_pref_integrations_connected_{notion,gcal,linear}`). No premium-tier key exists today. Row #8 adds **2 new keys** in a labeled block at the tail of the file:

- `xai_pref_premium_tier` (string codec; default `"free"`; values `"free" | "pending" | "premium_stub"`)
- `xai_pref_premium_started_at` (number codec; default `0`; ms epoch; only meaningful when tier=`premium_stub`)

Both `category: "pref"` + `owner: "xai-web-settings-rest"` per row-#24 ownership precedent. Caught by chassis `resetAllPrefs()` via `key.startsWith("xai_")` filter (parity test gains 2 exempt keys).

---

## 3. External research — Stripe Checkout shape

3 WebSearch queries performed 2026-05-26 (recorded in §7 below). Key findings drive the §5 axis decisions.

### 3.1 Stripe.js redirectToCheckout deprecation

**Source**: [Removes support for the redirectToCheckout method | Stripe](https://docs.stripe.com/changelog/clover/2025-09-30/remove-redirect-to-checkout)

> The redirectToCheckout method is no longer supported in Stripe.js for both client-only and client and server integrations, and if you use client-only integration for Checkout, you should migrate to Payment Links and Buy Buttons.

**Implication**: any client-only Checkout path MUST use **Payment Links** (Stripe Dashboard-created URLs) or **Buy Buttons** (NPM-loaded JSX). The legacy `stripe.redirectToCheckout({ items: [...] })` path is dead since 2025-09-30.

**Decision**: row #8 uses a **Payment Link URL** (configured per-environment via `VITE_STRIPE_PAYMENT_LINK_URL`). This is the only client-only path Stripe officially supports today.

### 3.2 Payment Link URL parameters

**Sources**:
- [Track a payment link | Stripe](https://docs.stripe.com/payment-links/url-parameters)
- [After a payment link payment | Stripe](https://docs.stripe.com/payment-links/post-payment)
- [Customize redirect behavior | Stripe](https://docs.stripe.com/payments/checkout/custom-success-page)

Payment Links support these query-string parameters appended by the merchant:

| Param | Purpose | v1 usage |
|---|---|---|
| `client_reference_id` | Associate payment with a customer DB row | Not used (no auth in v1) |
| `prefilled_email` | Pre-fill customer email | Not used |
| `prefilled_promo_code` | Pre-fill promo | Not used |
| `utm_source` / `utm_content` / `utm_medium` / `utm_term` / `utm_campaign` | Marketing attribution | Not used |
| `{CHECKOUT_SESSION_ID}` token in `after_completion.redirect.url` | Stripe replaces with the actual Session ID on redirect | **Used** to populate our `?session_id=` callback param |

**`after_completion.redirect.url`** is configured **inside the Stripe Dashboard** when creating the Payment Link, NOT as a query param on the URL itself. We set it once (per environment) when the Payment Link is provisioned. Pattern:

```
https://xai-web-console.pages.dev/app/settings/premium/checkout/success?session_id={CHECKOUT_SESSION_ID}
```

Stripe substitutes `{CHECKOUT_SESSION_ID}` server-side before the redirect; we receive an opaque session ID we cannot validate in v1 (validation requires an SK — out of scope) but its presence in the URL is sufficient confirmation that Stripe actually completed the flow.

**No `cancel_url` for Payment Links.** Per the docs, Payment Links don't directly support a configurable cancel URL — the user backs out via the browser back button (returns to our pane) or closes the tab. To get explicit cancel signaling, we'd need a full Checkout Session (requires backend + SK). For v1 we accept that the cancel path is **same-tab back-navigation** (user returns naturally; pane re-renders; tier is unchanged at `free`).

**Implication for routes**: only a `success` route is strictly required. We still add a `cancel` route for symmetry and future-proofing (when we eventually move to a full Checkout Session with backend), but in v1 it is reachable only by a manual URL paste or if Stripe's UI later adds a cancel-redirect feature.

### 3.3 CSP requirements

**Sources**:
- [Stripe.js GitHub issue #127 — CSP connect-src](https://github.com/stripe/stripe-js/issues/127)
- [CSP rules for Stripe — csplite.com](https://csplite.com/csp/svc155/)
- [Integration security guide | Stripe](https://docs.stripe.com/security/guide)

Authoritative CSP requirements for Stripe.js (full integration):

| Directive | Required hostnames |
|---|---|
| `script-src` | `'self' https://js.stripe.com` |
| `connect-src` | `'self' https://api.stripe.com https://errors.stripe.com https://js.stripe.com` (NB: stripe.js issues `q.stripe.com` analytics requests which need `https://*.stripe.com` or explicit allowlist) |
| `frame-src` | `'self' https://js.stripe.com https://hooks.stripe.com` |
| `worker-src` | `blob:` (Stripe.js spawns workers from blob URLs) |

**Key insight**: row #8 uses a **Payment Link redirect**, which means **the user navigates AWAY** from our app via `window.location.assign(paymentLinkUrl)` — same pattern as row #7's OAuth `window.location.assign(authorizeUrl)`. We do **NOT** load Stripe.js in our bundle. Therefore:

- `script-src` widening: **NOT required** (we never load `js.stripe.com/v3` from our pages — the Stripe-hosted Checkout page loads it on its own origin).
- `connect-src` widening: **NOT required for the redirect itself** (a `window.location.assign` is a navigation, not an XHR). However, we **DO** add `https://checkout.stripe.com` (the canonical Payment Link domain, e.g. `https://buy.stripe.com/test_xxx` and `https://checkout.stripe.com/...`) to `connect-src` defensively in case any future health-check / analytics / preflight is added.
- `frame-src` widening: **NOT required** (we are NOT embedding Checkout in an iframe in v1).
- `form-action` widening: **NOT required** (we are using `window.location.assign`, not a `<form action="...">`).

**Conclusion**: the CSP impact of v1 is **minimal** because we use a same-tab redirect, not Stripe.js. We extend `connect-src` with exactly 2 hostnames as a **defensive allowlist**:

- `https://checkout.stripe.com` — the canonical Stripe Checkout Page domain
- `https://js.stripe.com` — defensive in case a future Buy Button or Stripe Pricing Table is dropped in

Defensively we also add `https://buy.stripe.com` (the Payment Link "buy" subdomain, where the actual `https://buy.stripe.com/test_xxx` URLs live) so any embed-mode future expansion is unblocked without a 5th amendment cycle.

**FA decision recorded**: 3 endpoints added to `connect-src` for v1 — `js.stripe.com`, `checkout.stripe.com`, `buy.stripe.com`. No `script-src` widening. No `frame-src` widening. (See §5 axis B.)

### 3.4 Embedded vs redirect Checkout

**Sources**:
- [Stripe Checkout embedded full page vs. hosted full page | Stripe support](https://support.stripe.com/questions/embedded-checkout-vs-stripe-hosted-checkout)
- [Embed a checkout page in your site | Stripe](https://docs.stripe.com/checkout/embedded/quickstart)
- [Stripe Checkout migration guide | Stripe](https://docs.stripe.com/payments/checkout/migration)

Embedded Checkout requires:
1. Loading Stripe.js (`<script src="https://js.stripe.com/v3">`).
2. A `clientSecret` from a backend-created Checkout Session (requires SK on a server).
3. Mounting via `stripe.initEmbeddedCheckout({ clientSecret })`.

Items #2 and #3 require a backend. Item #1 requires `script-src https://js.stripe.com` + iframe origin in `frame-src`. None of these are HC10-compatible for a **client-only no-SK v1**.

**Decision (recorded as FA-2)**: row #8 uses **same-tab redirect via Payment Link**. Embedded Checkout is deferred to a future row when (a) a Worker layer exists for SK-bearing Session creation and (b) the user opts in to staying on our domain during checkout.

---

## 4. Forward-compatible v1 scope

### 4.1 What ships in v1

- Premium pane renders a new Upgrade button with a real `onClick`.
- onClick calls `window.location.assign(VITE_STRIPE_PAYMENT_LINK_URL)` — same-tab redirect to Stripe.
- New routes `/app/settings/premium/checkout/success` and `/app/settings/premium/checkout/cancel`.
- On `/success?session_id=...`: flip `xai_pref_premium_tier = "premium_stub"` + write `xai_pref_premium_started_at = Date.now()` + emit `web:premium:tier-changed` + green banner + auto-navigate to `/app/settings/premium` in 2s.
- On `/cancel`: yellow banner ("Checkout cancelled — tier unchanged") + auto-navigate back in 3s. Tier stays at `free`.
- Premium pane shows a "Cancel Subscription" button when tier=`premium_stub`. Clicking flips tier to `free` + clears `started_at` + emits `web:premium:tier-changed`. No Stripe API call.
- A `usePremiumTier()` hook reads both prefs and computes effective tier (factoring in 30-day timer expiry).
- A `<PremiumTierBadge />` component is exported for `xai-web-shell` Topbar to consume (read-only — feature-build P4 adds the Topbar integration; minimal cross-package edit per gate #7 in seed brief Risk register).
- A non-dismissible **disclosure banner** is rendered at the top of the Premium pane in all states, with text "v1 Premium is a UX preview. Real subscription enforcement requires desktop client (P1)." (bilingual).
- 30-day timer: `usePremiumTier()` reads `started_at`, computes `now - started_at`, and if > 30d returns `"free"` (effective tier), regardless of what's stored. This is **client-clock based and easily defeated by clock manipulation** — this is recorded as a known v1 limitation (Risk R4 + disclosure banner).

### 4.2 What does NOT ship in v1

- No real subscription state in any backend (HC3).
- No webhook handler — we cannot react to Stripe events after Checkout (HC3).
- No SK in any client code path (HC3).
- No real Checkout Session creation (no backend) — we use a Payment Link only (HC4).
- No feature-gating — Premium tier does NOT actually unlock anything in v1 (forward-compat hook only).
- No multi-plan picker — single plan, single Payment Link URL (HC5).
- No annual / monthly toggle — single tier (HC5).
- No promo code field — Payment Link supports `prefilled_promo_code` but we omit (out of scope HC5).
- No tax / address collection — Payment Link handles all of it server-side; we never see the data.
- No Stripe.js loaded in our bundle — pure redirect (decision in §5 axis A).
- No real cancellation API — "Cancel Subscription" is local-flag-only (HC8).
- No multi-tier (Free / Pro / Team) — only `free` and `premium_stub` (HC5).

---

## 5. Options analysis

6 decision axes. **Selected option set = Composite α** (A1+B1+C1+D1+E1+F1).

### Axis A — Checkout integration shape

| Option | Description | Pros | Cons | Decision |
|---|---|---|---|---|
| **A1. Same-tab redirect via Payment Link** (SELECTED) | `window.location.assign("https://buy.stripe.com/test_xxx")` | Zero Stripe.js bundle cost (~190KB); no CSP `script-src` widening; HC3-compat (no SK); HC4-compat (no backend); same-tab pattern matches row #7 OAuth precedent; works in Safari/Chrome/Firefox identically | User leaves our domain; brand inconsistency for the ~30s Stripe-hosted UI; no in-app analytics on Checkout funnel | ✅ |
| A2. New-tab redirect via `window.open` | `window.open(paymentLinkUrl, "_blank", "noopener")` | User stays on our tab in original context | Popup-blocker hostile (Safari blocks `window.open` not triggered by direct user gesture in some flows); breaks the success-callback URL (`window.open` cannot wait for the new tab to redirect back); requires `BroadcastChannel` or `localStorage` poll to sync state across tabs (HC10 violation — localStorage); deviates from row #7 precedent without justification | ❌ |
| A3. Embedded via Stripe.js + iframe | Load `js.stripe.com/v3` + `stripe.initEmbeddedCheckout({ clientSecret })` | User stays on our domain | Requires `clientSecret` from backend Session create (HC3+HC4 violation); requires Stripe.js bundle (script-src + frame-src widening); requires `worker-src blob:` (CSP expansion); ~190KB script weight; 6+ new CSP entries; can't ship in v1 without backend | ❌ |
| A4. Buy Button (Stripe-hosted JSX) | `<stripe-buy-button buy-button-id="..." publishable-key="..." />` | Officially supported client-only; minimal config | Loads Stripe.js (same CSP cost as A3); requires PK in markup (publishable so OK); creates a custom-element dependency on Stripe's CDN that bypasses our build pipeline; HC4-compat but heavyweight for the same UX outcome as A1 | ❌ |

**Pick A1.** Matches row #7 same-tab pattern. Minimal CSP delta. Lowest bundle cost. Forward-compatible — when we add a backend (Worker layer in ADR-0008 D3 follow-up), we can drop in A3 by swapping the `onClick` and adding the CSP entries.

### Axis B — CSP scope (FOURTH ADR-0008 §S3 D3 amendment)

| Option | Description | Pros | Cons | Decision |
|---|---|---|---|---|
| **B1. Add 3 hostnames to `connect-src` only** (SELECTED) | Extend `connect-src` with `https://js.stripe.com`, `https://checkout.stripe.com`, `https://buy.stripe.com`. No other directive touched. | Minimal delta; defensive coverage for any future analytics/preflight; aligns with row #2/#6/#7 amend-in-place precedent; same `csp.test.ts` pattern (+CSP4 case) | `script-src` not widened — if we accidentally bundle Stripe.js (e.g. via NPM `@stripe/stripe-js`), it would fail to load; we mitigate via a no-script-import source-text guard | ✅ |
| B2. Add hostnames to all 4 directives (script-src, connect-src, frame-src, form-action) | Extend script-src + connect-src + frame-src + form-action all in same amendment | Future-proof for embedded mode | Premature widening; expands attack surface for no v1 functional gain; complicates ADR audit | ❌ |
| B3. No CSP changes (rely on browser navigation only) | `window.location.assign` is a top-level navigation, not subject to `connect-src` | Smallest possible diff | Defensive zero — if anything ever issues an XHR to Stripe in production (a stray fetch, a future devtool, a postMessage handshake), it breaks silently; not future-proof; row #6 precedent (we add OSM to `connect-src` even though tiles are `<img>` and could fall under `img-src` alone) suggests being defensive | ❌ |

**Pick B1.** Defensive minimal allowlist. `script-src` stays clean (enforced by no-stripe-js-import source-text guard test). 4th ADR-0008 amendment in-place per binding precedent.

### Axis C — Callback URL shape

| Option | Description | Pros | Cons | Decision |
|---|---|---|---|---|
| **C1. Two routes (`/success` + `/cancel`)** (SELECTED) | New react-router children: `path: "settings/premium/checkout/success"` + `path: "settings/premium/checkout/cancel"`. Owned by `plugin-web-settings-rest` (exports `<CheckoutSuccessPage />` + `<CheckoutCancelPage />`). | Symmetric; matches Stripe-recommended naming; forward-compat for backend Session create (success_url + cancel_url); pane settings hierarchy is clear | Two new routes (vs row #7's single callback); slightly more code | ✅ |
| C2. One route (`/checkout/result?status=success|cancel`) | Single route, status discriminator via query | One route only; less router surface | Stripe Payment Link puts session_id on the success URL only; we lose the discrimination by URL path (less obvious in logs); marginal saving | ❌ |
| C3. Reuse `/app/settings/integrations/callback` | Same callback, providerId="stripe" added | DRY | Conflates OAuth-PKCE with Stripe-redirect (different validation semantics); harder to audit; route concern separation lost; row #7 sessionStorage key pattern doesn't apply | ❌ |

**Pick C1.** Two routes under `/app/settings/premium/checkout/{success,cancel}`. Sibling placement in `router.tsx` (literal paths BEFORE the param-matched `:moduleId/*`, same pattern as row #7).

### Axis D — Tier state persistence shape

| Option | Description | Pros | Cons | Decision |
|---|---|---|---|---|
| **D1. Two prefs (tier + started_at)** (SELECTED) | `xai_pref_premium_tier: string` + `xai_pref_premium_started_at: number` | Maps cleanly to row #24 codec set (string + number both supported); separate registry entries are easy to query individually; matches sticky-note pattern (multiple keys for related state) | 2 new registry entries vs 1 | ✅ |
| D2. Single composite JSON pref | `xai_pref_premium: { tier, startedAt, ... }` (json codec) | One registry entry; ergonomic | JSON shape changes require schemaVersion bump; harder to reason about partial updates; `removePref` semantics less clear | ❌ |
| D3. Use existing `xai_pref_*` slot | Reuse e.g. `xai_pref_more_default_pri` | Zero new registry entries | Semantic violation; would corrupt unrelated user pref; explicitly banned by row #24 owner contract | ❌ |

**Pick D1.** Two new prefs in a labeled block at the tail of `registry.ts`. Caught by chassis `resetAllPrefs()` via `key.startsWith("xai_")` filter (parity test gains 2 exempt keys).

### Axis E — 30-day timer mechanism

| Option | Description | Pros | Cons | Decision |
|---|---|---|---|---|
| **E1. Effective tier = stored tier filtered by `now - started_at < 30d`** (SELECTED) | `usePremiumTier()` reads both prefs; returns `"free"` if `started_at + 30d <= Date.now()` regardless of stored tier. Optional: also rewrite stored tier to `"free"` on first read past expiry (lazy cleanup). | Pure read-side logic; no background timer needed; deterministic; no race conditions; SSR-safe (returns `free` if no localStorage) | Client-clock dependent (user can rewind clock to extend); documented as known v1 limitation (R4) | ✅ |
| E2. setInterval-based countdown writing the flag back to `free` | Background `setInterval` checks every minute, flips tier when expired | Auto-cleanup; UI updates without re-mount | Wakes timer in every browser tab indefinitely; battery cost; race between tabs (last write wins); no benefit over E1 since reads always re-check | ❌ |
| E3. setTimeout(30d) on Upgrade success | `setTimeout(flipToFree, 30*24*3600*1000)` after success callback | Single timer at known moment | setTimeout for 30d is unreliable across tab close / refresh / OS sleep; only works if user keeps the original tab open continuously for 30d (~0% of cases); broken by design | ❌ |

**Pick E1.** Pure filter on read. Optional lazy cleanup is a P1-level decision (feature-build can drop it if scope creeps).

### Axis F — Topbar gold-badge integration

| Option | Description | Pros | Cons | Decision |
|---|---|---|---|---|
| **F1. Plugin exports `<PremiumTierBadge />`; xai-web-shell Topbar imports + renders conditionally** (SELECTED) | Add 1 import line + 1 `<PremiumTierBadge />` placement in `packages/xai-web-shell/src/Topbar.tsx`. Badge component reads `usePremiumTier()` internally; returns `null` if tier is not `premium_stub`. | Minimal Topbar surgery; component is plugin-owned; testable in isolation; CSS owned by plugin's styles.css | xai-web-shell is Stable — cross-package edit is a risk surface (gate via small surgical commit + test) | ✅ |
| F2. Emit `web:premium:tier-changed` event; xai-web-shell subscribes and renders its own badge | Pure event-driven coupling | Maximally decoupled | xai-web-shell would own the badge JSX + CSS + i18n entries (cross-plugin business logic in shell — anti-pattern); xai-web-shell currently has no precedent for plugin-specific UI ownership | ❌ |
| F3. New "topbar badge slot" in xai-web-shell + slot-pattern registration | xai-web-shell exposes `<TopbarBadgeSlot />` that plugins register into | Maximally extensible | Heavyweight infrastructure for one component; not justified by single-consumer v1; precedent does not exist in xai-web-shell today | ❌ |
| F4. No topbar badge in v1; tier-aware UI only inside the Premium pane | Skip Topbar edit entirely | Zero cross-package risk | Misses HC6 of seed brief ("gold badge in topbar when premium_stub"); the badge is the most visible UX-stub signal that the user upgraded; loses validation value | ❌ |

**Pick F1.** Minimal direct cross-package edit. xai-web-shell's `Topbar.tsx` gains 1 import + 1 JSX placement (placed at the left end of `topbar-controls` for visibility). The badge component lives entirely inside `plugin-web-settings-rest`. Topbar tests gain 1 case (badge renders when pref set; absent when free).

### Composite α — selected option set

| Axis | Selected | Rationale |
|---|---|---|
| A — Checkout shape | A1 same-tab redirect via Payment Link | Only HC3+HC4-compatible client-only path post 2025-09-30 redirectToCheckout removal; matches row #7 precedent |
| B — CSP scope | B1 connect-src +3 hostnames; no script-src/frame-src widening | Minimal defensive allowlist; 4th ADR-0008 amendment in-place |
| C — Callback URLs | C1 two routes (`/success` + `/cancel`) | Symmetric; forward-compat for full Session backend |
| D — Tier state | D1 two prefs (`tier` + `started_at`) | Clean codec mapping; 2 new registry entries |
| E — 30-day timer | E1 pure read-side filter | Deterministic; no background timer; documented client-clock limitation |
| F — Gold badge | F1 plugin-exported `<PremiumTierBadge />` + 1 Topbar JSX placement | Minimal cross-package risk; component encapsulated |

---

## 6. Risk register

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | `VITE_STRIPE_PAYMENT_LINK_URL` env var not set in dev / preview / prod → Upgrade button does nothing or throws on click | Med | High | feature-build P2 reads env in `usePremiumConfig()` hook; if missing, button is **disabled** with a tooltip ("Payment Link not configured — see apps/web/deploy/README.md"); document the env-var setup in a new `apps/web/deploy/README.md` (P5 doc step); add a Vitest case `PC-CONFIG-1` that asserts the disabled branch when env var is empty |
| R2 | SK accidentally checked into client code (typo or copy-paste from Stripe dashboard) | Low | **Critical** | Source-text guard `no-stripe-secret-key.test.ts` greps `src/**/*.{ts,tsx}` for the substring `"sk_"` followed by `live_` or `test_` (Stripe SK prefix). Zero occurrences allowed. Also bundle-time guard: dist scan for `sk_` after `pnpm build`. Cross-vendor verify item §8 #1. |
| R3 | Stripe.js accidentally bundled (e.g. via `import { loadStripe } from "@stripe/stripe-js"` slipped in by a "simplification" PR) | Low | Med | Source-text guard `no-stripe-js-bundle.test.ts` greps `src/**/*.{ts,tsx}` for `"@stripe/stripe-js"` and `"https://js.stripe.com"`. Zero occurrences in source. Also bundle scan. Documented as v1 architectural constraint. |
| R4 | 30-day timer relies on `Date.now()`; user can rewind system clock to extend stub indefinitely | High | Low | Documented in disclosure banner ("v1 Premium is a UX preview"); not a billing path; no real value attached to staying in `premium_stub`. Accepted as known v1 limitation. |
| R5 | User reaches `/success` or `/cancel` URL directly (refresh, browser history, manual paste) without having clicked Upgrade | High | Low | `<CheckoutSuccessPage />` requires `?session_id=` present; if missing or empty, renders the "invalid" banner + auto-navigates back (same shape as row #7 CallbackPage invalid-state path). `<CheckoutCancelPage />` is idempotent — just shows "tier unchanged" banner. Tests `CS-INVALID-1` + `CC-DIRECT-1`. |
| R6 | xai-web-shell Topbar edit breaks existing Topbar tests | Med | Med | Edit is additive (1 import + 1 JSX placement at start of controls group); existing 6 Topbar tests preserved verbatim; 1 new test added (`TB-PREMIUM-1`: badge renders when pref=premium_stub). xai-web-shell `Topbar.test.tsx` updated; no `Topbar.tsx` props signature change. |
| R7 | Disclosure banner missed by user → "real billing surprise" complaint | Low | High | Banner is **non-dismissible** (no close button), placed at top of pane, rendered in **all** premium-tier states (including `premium_stub`), styled with a distinct yellow/amber tone (OKLCH, distinct from row #7's neutral banner). Bilingual. CP-style "unmissable" test (`PB-BANNER-1`: banner present in DOM in all 3 tier states). |
| R8 | `xai_pref_premium_tier` flag interpreted by downstream code as "real connection" (e.g. xai-web-ai-chat gates GPT-4 access on it) | Low | High | Registry entry includes a comment block stating "MUST NOT be interpreted as 'real subscription' by any other code path. v1 stub-only. See packages/plugin-web-settings-rest/docs/design.md §FA-12." Documented in api.md §7.7. Test asserts this comment is present (`PR-COMMENT-1`). |
| R9 | CSP3 (row #7) accidentally narrowed when CSP4 is added | Low | Med | `csp.test.ts` CSP3 case remains in-place; CSP4 case is added (does not replace CSP3); both must pass. Source-text greps in `_headers` are independent. |
| R10 | Stripe Payment Link expires / is revoked in Stripe dashboard | Med | High | Document in `apps/web/deploy/README.md` — Payment Link must be re-issued via Stripe dashboard if expired; env var updated. No code change required (CI re-deploys with new env value). Add a Sentry breadcrumb on Upgrade click for ops visibility (deferred to a future Sentry-rehydration row). |
| R11 | Topbar badge CSS conflicts with existing `topbar-controls` flex layout | Low | Low | Badge uses scoped CSS class `premium-tier-badge` defined in `plugin-web-settings-rest/src/styles.css`; visual integration tested via Topbar.test.tsx snapshot/screenshot deferred — manual smoke at ship-time (consistent with row #6/#7 deferred manual smoke). |

Total: 11 risks documented. Mitigations are concrete (test IDs + file paths). R2 + R3 are the cross-vendor verify hard gates.

---

## 7. WebSearch evidence

3 searches performed 2026-05-26:

1. `Stripe Payment Link success_url cancel_url query parameters 2026`
   - Source: [Track a payment link | Stripe](https://docs.stripe.com/payment-links/url-parameters)
   - Source: [After a payment link payment | Stripe](https://docs.stripe.com/payment-links/post-payment)
   - Finding: Payment Links use `{CHECKOUT_SESSION_ID}` token substitution + dashboard-configured `after_completion.redirect.url`. No native cancel URL.

2. `Stripe Checkout redirect vs embedded Stripe.js client only no backend`
   - Source: [Removes support for the redirectToCheckout method | Stripe](https://docs.stripe.com/changelog/clover/2025-09-30/remove-redirect-to-checkout)
   - Source: [Stripe Checkout embedded vs hosted | Stripe support](https://support.stripe.com/questions/embedded-checkout-vs-stripe-hosted-checkout)
   - Source: [Embed a checkout page | Stripe](https://docs.stripe.com/checkout/embedded/quickstart)
   - Finding: `stripe.redirectToCheckout` removed 2025-09-30. Client-only must use Payment Links. Embedded requires backend Session create.

3. `Stripe Payment Link CSP content security policy connect-src js.stripe.com checkout.stripe.com`
   - Source: [Stripe.js GitHub issue #127](https://github.com/stripe/stripe-js/issues/127)
   - Source: [CSP rules for Stripe — csplite.com](https://csplite.com/csp/svc155/)
   - Source: [Integration security guide | Stripe](https://docs.stripe.com/security/guide)
   - Finding: Full Stripe.js integration needs `script-src` + `connect-src` + `frame-src` + `worker-src` widening. Payment Link redirect (our path) needs only defensive `connect-src` widening — top-level navigation is not subject to `connect-src`. We add 3 hostnames defensively.

All sources publicly available, no auth required.

---

## 8. Cross-vendor verify checklist (for feature-verify)

Per HC9 + roadmap default (`Verify Cross-vendor: yes`), Codex `gpt-5.5-thinking medium` cold-read scope:

1. **No SK in client bundle** — Codex greps `apps/web/dist/**/*.js` for `sk_test_` and `sk_live_` substrings. Both MUST return zero matches. Also greps source: `packages/plugin-web-settings-rest/src/**/*.{ts,tsx}` for same patterns. Source-text guard `no-stripe-secret-key.test.ts` mirrors this.
2. **No Stripe.js bundled** — Codex confirms no `import` statement referencing `@stripe/stripe-js` or `https://js.stripe.com/` in `src/**`. Source-text guard `no-stripe-js-bundle.test.ts` mirrors this. Bundle scan confirms `dist/**/*.js` does not contain Stripe.js fingerprints (`__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED`, `Stripe.create`, etc.).
3. **Disclosure banner unmissable** — Codex inspects `premiumPane.tsx` JSX tree confirming `<PremiumDisclosureBanner />` is rendered unconditionally above all other content; banner has no close button; CSS uses a high-contrast (OKLCH) background color distinct from neutral pane bg. Manual smoke confirms visibility in all 3 tier states.
4. **CSP minimality** — Codex confirms CSP4 source-text guard passes; `_headers` adds exactly 3 hostnames to `connect-src` (no wildcard, no subdomain wildcard); no `script-src` widening; no `frame-src` widening.
5. **No real network in cancel path** — Codex confirms `<CheckoutCancelPage />` does NOT call `fetch()`, does NOT call Stripe API, does NOT persist a Stripe customer ID (we don't have one); the cancel page is a pure UX confirmation.
6. **30-day timer is client-only** — Codex confirms `usePremiumTier()` is pure (`Date.now()` + `localStorage` read), no `fetch()`, no `setInterval` ticking in background.

Manual smoke (Chrome 120 / Safari 17, deferrable 24h per ADR-0008 carve-out, consistent with W1/W2 precedent):
- Click Upgrade → reaches Stripe Checkout test page → complete with `4242 4242 4242 4242` → returns to `/success` → gold badge visible in Topbar.
- Click Upgrade → cancel via back button → tier unchanged.
- After 30 days (or via manual clock rewind for test purposes), badge disappears + pane reverts.

---

## 9. Acceptance map (seed brief → plan)

| Seed brief acceptance signal | Where it's covered |
|---|---|
| Click "Upgrade" → opens Stripe Checkout | FA-2 + Phase P2 |
| Successful checkout → thank-you page → `xai_pref_premium_tier = premium_stub` → gold badge | FA-3 + FA-6 + Phase P3 + Phase P4 |
| Cancel checkout → cancel page → tier stays `free` | FA-3 + Phase P3 |
| "Cancel Subscription" → tier → `free` | FA-7 + Phase P4 |
| All 154 settings-rest tests still PASS | HC9 + FA-15 (append-only test extension) + PR1..3 preserved verbatim |
| New tests: query-param parsing + tier transitions + disclosure banner | test.md §6 (new) — CS1..CS8 + CC1..CC4 + PT1..PT6 + PB-BANNER-1..3 |
| Cross-vendor: no SK in bundle / Stripe.js CDN only / disclosure banner unmissable | §8 above + cross-vendor checklist in test.md §6.8 |

All 7 acceptance signals mapped. Phase P1..P6 covers them.

---

## 10. Phase plan summary

| Phase | Scope | Commit message stub |
|---|---|---|
| **P1** | Tier state machine + 2 `xai_pref_premium_*` registry entries + `usePremiumTier()` hook + tests | `feat(xai-web-settings-premium-stripe): P1 — tier state machine + 2 prefs + usePremiumTier hook` |
| **P2** | Premium pane Upgrade button wired to Payment Link + `usePremiumConfig()` env-var hook + disabled-state fallback + tests | `feat(xai-web-settings-premium-stripe): P2 — Upgrade button + Payment Link redirect + env-var hook` |
| **P3** | `<CheckoutSuccessPage />` + `<CheckoutCancelPage />` + 2 new router children + tier flip on success + event emit + tests | `feat(xai-web-settings-premium-stripe): P3 — Checkout success/cancel pages + router wiring + 1 EventMap declaration` |
| **P4** | "Cancel Subscription" button + `<PremiumTierBadge />` + xai-web-shell Topbar 1-line edit + disclosure banner + bilingual i18n + tests | `feat(xai-web-settings-premium-stripe): P4 — Cancel button + Topbar gold badge + disclosure banner + bilingual i18n` |
| **P5** | ADR-0008 §S3 D3 FOURTH amendment + `_headers` connect-src extension + CSP4 source-text guard + `no-stripe-secret-key` + `no-stripe-js-bundle` guards + `apps/web/deploy/README.md` env-var doc + PLUGIN_MAP extension note | `feat(xai-web-settings-premium-stripe): P5 — ADR-0008 §S3 D3 FOURTH amendment + CSP4 guard + no-SK guard + env-var doc` |
| **P6** | Cross-vendor verify checklist (Codex cold-read on §8 items 1-6) — owned by feature-verify | (no commit — verify phase) |

6 phases. P1 + P2 + P3 are gated by tests. P4 is the cross-package touch (Topbar). P5 is the deploy-config + ADR amend + guards. P6 is verification.

---

## 11. Open questions (for feature-review)

None blocking. 3 informational items:

- **Q1**: Should the Premium pane disclosure banner be color-distinct from row #7's stub banner (currently uses neutral CSS class `int-stub-banner`)? Recommend YES — use an amber/gold tone via `oklch(75% 0.15 85)` to visually associate the banner with the "Premium" theming and to ensure it doesn't look like a generic info card. **Decision deferred to feature-build P4**; default to amber.
- **Q2**: Should the `<PremiumTierBadge />` text be "Premium" or "Premium (stub)"? Recommend "Premium (stub)" for consistency with row #7's `int.badge.connected_stub` ("Connected (stub)") pattern + reinforces the disclosure messaging. **Locked**: "Premium (stub)" / "高级版（演示）".
- **Q3**: Should `<CheckoutSuccessPage />` validate that `?session_id=` follows the Stripe format (`cs_test_*` or `cs_live_*` prefix)? Recommend NO — we cannot validate against Stripe (no SK), and overly-strict client-side validation can break if Stripe changes the format. Just require presence + non-empty. Documented as v1 stub trust model.

---

## 12. Frozen assumptions (for feature-build)

1. **FA-1**. Single Payment Link URL via `VITE_STRIPE_PAYMENT_LINK_URL` env var. Different value for dev (test mode, Payment Link in Stripe test dashboard) vs prod (Payment Link in live dashboard). Documented in `apps/web/deploy/README.md`.
2. **FA-2**. Same-tab redirect via `window.location.assign(paymentLinkUrl)`. NO Stripe.js loaded. NO `window.open(...)`. NO iframe.
3. **FA-3**. Two new routes: `/app/settings/premium/checkout/success` and `/app/settings/premium/checkout/cancel`. Declared in `apps/web/src/routes/router.tsx` as **siblings** of the existing row #7 `settings/integrations/callback` child, all under `path: "app"` and all BEFORE the `:moduleId/*` param-matched route.
4. **FA-4**. Two new registry entries (`xai_pref_premium_tier` string + `xai_pref_premium_started_at` number), category `pref`, owner `xai-web-settings-rest`, schemaVersion 1, defaults `"free"` + `0`. Labeled block at tail of `registry.ts`. Parity test +2 exempt.
5. **FA-5**. `usePremiumTier()` hook returns `"free"` if (a) tier is stored as `"free"` OR (b) `started_at + 30 days <= Date.now()`. Effective tier is read-side computed; storage may briefly hold a stale `"premium_stub"` after expiry (cleaned up lazily on next setter call).
6. **FA-6**. Gold badge: `<PremiumTierBadge />` component reads `usePremiumTier()`; returns `null` if not `premium_stub`; otherwise renders span with class `premium-tier-badge` (OKLCH gold via `oklch(80% 0.16 85)`); placed via 1-line edit in `packages/xai-web-shell/src/Topbar.tsx` at the left end of `topbar-controls`.
7. **FA-7**. "Cancel Subscription" button visible only when effective tier is `premium_stub`. Click writes `xai_pref_premium_tier = "free"` + writes `xai_pref_premium_started_at = 0` + emits `web:premium:tier-changed`. No fetch.
8. **FA-8**. Disclosure banner: `<PremiumDisclosureBanner />` rendered unconditionally at top of Premium pane. Non-dismissible. Bilingual. OKLCH amber/gold background. Texts: EN "v1 Premium is a UX preview. Real subscription enforcement requires desktop client (P1)." / ZH "v1 高级版仅为 UX 演示。真实订阅功能需在桌面端（P1）实现。"
9. **FA-9**. New EventMap entry: `web:premium:tier-changed: { previous: PremiumTier; current: PremiumTier; changedAt: string }` declaration-only in `packages/core/src/types/events.ts`. Mirrors row #5/#6/#7 pattern (declaration-only typed event with no v1 consumer; forward-compat hook for future feature-gating).
10. **FA-10**. CSP FOURTH amendment: `connect-src` extended with `https://js.stripe.com`, `https://checkout.stripe.com`, `https://buy.stripe.com`. No other directive changes. CSP4 source-text guard in `apps/web/src/__tests__/csp.test.ts`.
11. **FA-11**. Source-text guards: `no-stripe-secret-key.test.ts` (zero `sk_test_` / `sk_live_` in src/**); `no-stripe-js-bundle.test.ts` (zero `@stripe/stripe-js` / `https://js.stripe.com/` import in src/**). Both added in P5.
12. **FA-12**. `xai_pref_premium_tier` MUST NOT be read by any other plugin as a "real subscription" signal in v1. Comment block in registry.ts + api.md §7.7 + test asserts comment presence.
13. **FA-13**. NO new package dependency. NO `@stripe/stripe-js`. NO `stripe-node`. Pure same-tab redirect via existing `window.location.assign`.
14. **FA-14**. The 3 existing `PR1..PR3` tests in `premiumPane.test.tsx` MUST stay green (HC9). New tests are additive (PT1..6, PB-BANNER-1..3 + CS1..8 + CC1..4 + PHK1..4).
15. **FA-15**. Append-only doc discipline. `design.md` gains ONE new section. `api.md` gains ONE new §7 section. `test.md` gains ONE new §6 section. `dev_log.md` gains ONE new "## Bugfix-Extension Lineage — gap-closure row #8 (2026-05-26)" block. SHIPPED row #24 Workflow State Panel + 2026-05-25 row #2 Lineage block (in xai-web-ai-chat docs) + 2026-05-26 row #7 Lineage block preserved verbatim.

---

## 13. Dependencies summary

| Dep | Kind | Why |
|---|---|---|
| `@repo/plugin-web-storage` | existing peer | 2 new prefs via `usePref()` |
| `@repo/plugin-web-tokens` | existing peer | `useI18n(lang)` for global keys + `Lang` type |
| `@repo/xai-web-event-bus` | existing peer | `emitWebEvent("web:premium:tier-changed", ...)` |
| `@repo/core` | indirect via tokens | type-only flow (new EventMap entry declared here) |
| `react-router` | existing dep (added in row #7) | callback pages use `useSearchParams`, `useNavigate` |
| `@repo/xai-web-shell` | NEW peer (limited surface) | Topbar imports `<PremiumTierBadge />` — 1-line JSX placement |
| (env var) `VITE_STRIPE_PAYMENT_LINK_URL` | runtime config | Payment Link URL |
| (none) `VITE_STRIPE_PUBLISHABLE_KEY` | NOT USED in v1 | Reserved for future Buy Button / Embedded path |

**No new NPM dependency.** No backend dependency. `xai-web-shell` is added as a peer of `plugin-web-settings-rest` (verify package.json `peerDependencies`).

---

## 14. Rollback / abandon path

If P2 or P3 reveals a Stripe-side blocker (e.g. account doesn't support Payment Links in target country):

1. Revert P2 Upgrade button onClick to no-op (matches v1 SHIPPED behavior).
2. Keep P1 registry entries + `usePremiumTier()` hook (forward-compat for future row).
3. Keep P5 CSP amendment with note "reserved for premium row — Payment Link not provisioned" — or revert if amendment-with-no-consumer is preferred (decide at feature-verify).
4. Disclosure banner can stay (text adjusted to "Premium coming soon").

Rollback is cheap: P1 + P5 are infrastructure; only P2/P3/P4 are the user-visible wire-up.

---

## 15. Decision summary (one-line)

**Add a same-tab redirect from the Premium pane Upgrade button to a Stripe Payment Link (configured per-environment via `VITE_STRIPE_PAYMENT_LINK_URL`); a `/success?session_id=...` callback page flips a client-side `xai_pref_premium_tier` flag and starts a 30-day client-clock timer; a `<PremiumTierBadge />` rendered in the Topbar advertises the stubbed tier; a non-dismissible disclosure banner makes the v1-stub scope explicit; ADR-0008 §S3 D3 receives its FOURTH in-place amendment for 3 Stripe hostnames in `connect-src` (no `script-src`/`frame-src` widening); source-text guards enforce "no SK in bundle" and "no Stripe.js in bundle"; 11 risks documented; 6-phase build; cross-vendor Codex cold-read on 6 items pre-ship.**

---

**Sources:**
- [Track a payment link | Stripe](https://docs.stripe.com/payment-links/url-parameters)
- [After a payment link payment | Stripe](https://docs.stripe.com/payment-links/post-payment)
- [Customize redirect behavior | Stripe](https://docs.stripe.com/payments/checkout/custom-success-page)
- [Removes support for the redirectToCheckout method | Stripe](https://docs.stripe.com/changelog/clover/2025-09-30/remove-redirect-to-checkout)
- [Stripe Checkout embedded vs hosted | Stripe support](https://support.stripe.com/questions/embedded-checkout-vs-stripe-hosted-checkout)
- [Embed a checkout page | Stripe](https://docs.stripe.com/checkout/embedded/quickstart)
- [Stripe.js CSP — GitHub issue #127](https://github.com/stripe/stripe-js/issues/127)
- [CSP rules for Stripe — csplite.com](https://csplite.com/csp/svc155/)
- [Integration security guide | Stripe](https://docs.stripe.com/security/guide)
