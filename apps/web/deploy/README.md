# apps/web/deploy — Deployment Configuration Notes

This directory contains deployment-related configuration and runbooks for
`apps/web/` (the XAI Web Console Vite SPA).

## Structure

```
apps/web/deploy/
  security/   — SHIPPED security library namespace (buildSecurityHeaders, ingestCspReport, etc.)
                Used by future Worker layer. Not active at static Cloudflare Pages runtime.
  README.md   — This file. Operator runbook for env vars and deployment configuration.
```

---

## Environment Variables

### Required for Premium Stripe Checkout (gap-closure row #8)

| Variable | Description | Required at runtime |
|---|---|---|
| `VITE_STRIPE_PAYMENT_LINK_URL` | Stripe Payment Link URL for the Upgrade CTA. Format: `https://buy.stripe.com/<link_id>` | Yes (premium Upgrade button is disabled with tooltip when absent) |

#### How to set `VITE_STRIPE_PAYMENT_LINK_URL`

**Development / local:**

Add to `apps/web/.env.local` (gitignored):

```
VITE_STRIPE_PAYMENT_LINK_URL=https://buy.stripe.com/test_<your_test_link_id>
```

**Cloudflare Pages (production):**

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com).
2. Navigate to: Workers & Pages → xai-web-console → Settings → Environment Variables.
3. Add variable `VITE_STRIPE_PAYMENT_LINK_URL` under **Production** environment.
4. Value: `https://buy.stripe.com/<live_link_id>` — get this from the Stripe Dashboard.
5. Click **Save**.
6. Trigger a new deploy (push a commit to `main` or use the Cloudflare Pages dashboard "Deploy" button).

**Cloudflare Pages (preview/staging):**

Repeat step 3–6 under the **Preview** environment with a test Payment Link URL.

#### Creating a Stripe Payment Link

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com).
2. Navigate to: Payment Links → + New payment link.
3. Create a product and price (e.g. "XAI Premium — 1 month, $X USD").
4. Under **After payment**, set redirect URL to:
   `<your_app_origin>/app/settings/premium/checkout/success?session_id={CHECKOUT_SESSION_ID}`
   Note: `{CHECKOUT_SESSION_ID}` is a Stripe template variable — Stripe substitutes the actual
   session ID at checkout completion.
5. Copy the Payment Link URL (e.g. `https://buy.stripe.com/test_xxxxxxxxxxxx`).
6. Set it as `VITE_STRIPE_PAYMENT_LINK_URL`.

**Test vs Live mode:**
- Test mode URLs: `https://buy.stripe.com/test_<id>` — no real charges.
- Live mode URLs: `https://buy.stripe.com/<id>` — real charges. Use only in production.

#### Rotation runbook

If the Payment Link URL needs to be rotated (e.g. price change, product change):

1. Create a new Payment Link in the Stripe Dashboard (follow steps above).
2. Update `VITE_STRIPE_PAYMENT_LINK_URL` in Cloudflare Pages environment variables.
3. Trigger a new deploy.
4. The old Payment Link can be disabled in the Stripe Dashboard after verifying the new one works.
5. Update `apps/web/.env.local` locally if needed for development.

Note: Rotating the Payment Link does NOT require a code change — the URL is read
at build time from the env var. No git commit needed for a rotation.

---

## v1 Stub Disclosure

The current Premium integration is a **client-side stub only** (gap-closure row #8):

- **No Stripe Secret Key** is present in the client bundle (enforced by `no-stripe-secret-key.test.ts` source-text guard — HC3 CRITICAL).
- **No Stripe.js bundle** is loaded (enforced by `no-stripe-js-bundle.test.ts` source-text guard).
- After a successful checkout, the client flips a `xai_pref_premium_tier = "premium_stub"` flag in `localStorage` based on the presence of `?session_id=` in the callback URL. It does **NOT** validate the session with Stripe's API.
- The 30-day "subscription" timer is client-clock based and can be defeated by clock manipulation — documented known limitation (R4).
- **Cancel Subscription** clears the client-side flags only — it does NOT cancel any Stripe subscription. Users who made a real payment must cancel at [billing.stripe.com](https://billing.stripe.com) or the Stripe Customer Portal.

Real subscription enforcement requires either the Desktop client (P1) or a Cloudflare Worker layer (deferred per ADR-0008 D3 follow-up). This stub establishes the callback URL pattern and the client-state hook for the future real implementation.

---

## CSP Impact (ADR-0008 §S3 D3 FOURTH amendment)

`connect-src` in `apps/web/public/_headers` includes 3 Stripe hostnames:

```
https://js.stripe.com
https://checkout.stripe.com
https://buy.stripe.com
```

`script-src` and `frame-src` are **NOT widened** — the Payment Link redirect uses
`window.location.assign()` (same-tab navigation), so no Stripe.js script loading
and no Embedded Checkout iframe is involved.

Source-text guards:
- `CSP4` in `apps/web/src/__tests__/csp.test.ts` asserts all 3 hostnames are present.
- `CSP4-SCRIPT-SRC-CLEAN` asserts `script-src` does NOT include `js.stripe.com`.
- `CSP4-FRAME-SRC-CLEAN` asserts `frame-src` is NOT present in the CSP.

Authority: `docs/adr/0008-cloudflare-deploy-target-and-csp.md` §S3 D3 FOURTH amendment.
