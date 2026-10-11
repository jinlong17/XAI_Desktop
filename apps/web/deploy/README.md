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

---

## Account-Delete Edge Function (gap-closure row #9)

The account-delete flow requires a Supabase Edge Function named **`account-delete`**.
The function is NOT shipped in this repository. It must be deployed separately to the
project's Supabase instance before the live-auth code path (`VITE_WEB_AUTH_MODE !== "mock-authenticated"`)
will work end-to-end. The client invokes it via `client.functions.invoke("account-delete", { method: "POST" })`.

### Function name

```
account-delete
```

### Request shape

```http
POST /functions/v1/account-delete
Authorization: Bearer <user-jwt>
```

No request body is required. The authenticated JWT determines which user to delete.

### Response shape

| Status | Meaning |
|--------|---------|
| `200 OK` | User deleted successfully. |
| `401 Unauthorized` | Missing or invalid JWT. Client should surface `AccountDeleteError("unauthorized")`. |
| `403 Forbidden` | JWT is valid but the user is not allowed to delete this account (e.g. service account guard). Client surfaces `AccountDeleteError("forbidden")`. |
| `404 Not Found` | Failure, including a missing function/router. Client preserves local data and surfaces `AccountDeleteError("server")`. No verified business-code receipt currently authorizes a 404 success path. |
| `5xx` | Server error. Client surfaces `AccountDeleteError("server")`. Retry is user-initiated via the Retry button in the modal. |

### RLS / service_role requirements

- The function must run with **`service_role`** credentials (not the anon/JWT key) to call `auth.admin.deleteUser(userId)` against the Supabase Auth API.
- The user id is extracted from the verified JWT via `supabase.auth.getUser(token)` inside the function.
- No RLS policy change is required on data tables — `auth.admin.deleteUser` cascades to Auth table rows only; application-table row deletion is deferred (out-of-scope for v1 per FA-1).
- The function should call `supabase.auth.admin.deleteUser(userId)` after extracting and validating the caller's identity.

### Deploy gate

1. Deploy the Edge Function to your Supabase project:
   ```bash
   supabase functions deploy account-delete --project-ref <project-ref>
   ```
2. Set the `service_role` key as a secret in the function's environment (via Supabase dashboard or CLI):
   ```bash
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service_role_key> --project-ref <project-ref>
   ```
3. Verify the function is reachable:
   ```bash
   curl -X POST https://<project-ref>.supabase.co/functions/v1/account-delete \
     -H "Authorization: Bearer <valid-user-jwt>"
   ```
   Expected: `200 OK`. A `404` is a failure and does not authorize local cleanup, even with an uncontracted `already_deleted` body. Any future idempotent business receipt needs a verified handler contract and independent tests before the client may accept it.

**Before deploying to production, ensure the function is tested in a staging environment.**
The mock-auth fallback (`VITE_WEB_AUTH_MODE=mock-authenticated`) is available for local development
without any Edge Function deployed.

---

## Account-Delete Rollback (gap-closure row #9)

If the account-delete flow must be rolled back after deployment, four paths are available
(from discovery review §12):

### Path 1 — Disable the Edge Function (fastest, recommended)

Pause or delete the `account-delete` Edge Function in the Supabase dashboard.
The client will receive a network error, which surfaces as `AccountDeleteError("network")`.
The modal will show the error banner and offer a Retry button — but the function
will remain unreachable until re-enabled.

**Effect**: Account deletion is silently blocked server-side. Local state is NOT cleared
(DEL-ORCH-3: no local mutation before backend success). Users see the error banner.

### Path 2 — Return 403 from the Edge Function

Modify the Edge Function to return `403 Forbidden` for all requests.
Client maps this to `AccountDeleteError("forbidden")` and surfaces the error banner.

**Effect**: Same as Path 1 but returns a meaningful HTTP status rather than a network error.
Cleaner monitoring signal.

### Path 3 — Feature-flag via `VITE_WEB_AUTH_MODE`

Set `VITE_WEB_AUTH_MODE=mock-authenticated` in the build environment and redeploy the SPA.
In mock-auth mode, the backend is never called. The flow skips to local-wipe + redirect directly.

**Effect**: Account deletion still completes locally (localStorage + IDB wipe + redirect),
but no real account is deleted server-side. Use only as a temporary measure in mock/staging
environments — not appropriate for production unless the intent is to let users clear
local data without deleting their Supabase account.

### Path 4 — Revert to row #24 single-step modal (breaking change)

Revert `packages/plugin-web-settings-rest/src/internal/DeleteAccountConfirmModal.tsx`
and `packages/plugin-web-settings-rest/src/panes/accountPane.tsx` to the row #24
single-step shape. This also requires reverting the orchestrator imports and removing
`packages/plugin-web-settings-rest/src/internal/useAccountDeleteOrchestrator.ts`.

**Effect**: Full behavioral rollback. The deprecated `web:settings:rest:account-delete-confirmed`
event continues to be emitted (it was already emitted in row #24). Requires a code deploy.

**Recommended**: Use Path 1 or Path 2 for a fast operational rollback. Path 4 should only
be used if a code defect is discovered that cannot be patched forward.
