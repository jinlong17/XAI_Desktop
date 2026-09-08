# Seed Brief — xai-web-settings-premium-stripe

| 字段 | 值 |
|---|---|
| Roadmap | docs/workflow/roadmap/xai-web-console-gap-closure.md row #8 (W2) |
| 父 Brief | docs/reviews/web-priority-pivot-and-repo-cleanup/20260524-gap-closure-source.md §Gap 6 (split-6b) |
| 父 ADR | ADR-0009 §D2-G3 |
| 候选包 | packages/plugin-web-settings-rest (#24 SHIPPED) — extend Premium pane |

## Requirement (1-3 sentences)

Replace the Premium pane's no-op upgrade flow with a Stripe Checkout integration (stub-mode for v1). User clicks "Upgrade to Premium" → opens Stripe Checkout in new tab → returns to a thank-you page on success / cancel page on cancel. v1 has NO webhook handling (no real subscription state in backend); user's `xai_pref_premium_tier` (new key, = `free` | `pending` | `premium_stub`) is set client-side based on Checkout completion query params. Real entitlement enforcement deferred to P1.

## Hard Constraints

- Use Stripe Checkout in **embedded** or **redirect** mode (decide in feature-plan; redirect is simpler).
- Stripe publishable key (PK) is **per-environment** (dev/prod) — store in Vite env var (`VITE_STRIPE_PK_*`), not in source. Document in `apps/web/deploy/README.md`.
- NO Stripe secret key (SK) in client. Checkout session creation in v1 uses a hard-coded Stripe Payment Link (skips need for SK / backend) — this is the v1 stub pattern; real backend session creation deferred.
- Pricing surface: 1 plan in v1 (`Premium $X/month`), hard-coded to a real Payment Link. Multiple plans / annual discount deferred.
- Premium tier UI: gold badge in topbar when `xai_pref_premium_tier === 'premium_stub'`. Reverts to `free` after 30 days simulated (timer-based, NOT real subscription check) — this is the v1 stub limit, clearly disclosed.
- CSP impact: `connect-src` + `frame-src` (if embedded) for `*.stripe.com` + `js.stripe.com` for the Stripe.js loader.
- Cancellation: "Cancel Subscription" button in Premium pane clears `xai_pref_premium_tier` to `free` (NO real cancellation API call in v1).
- Disclosure banner: "v1 Premium is a UX preview. Real subscription enforcement requires desktop client (P1)." displayed in Premium pane.
- Per ADR-0009 D4: P0 work. Depends on Gap 1 CSP pattern + Gap 6a OAuth provider pattern.

## Acceptance Signal

- Click "Upgrade" → opens Stripe Checkout (real payment processor, but using a test Payment Link or live Payment Link per Vite env).
- Successful checkout returns to thank-you page → `xai_pref_premium_tier = premium_stub` → gold badge appears in topbar.
- Cancel checkout → returns to cancel page → tier stays `free`.
- "Cancel Subscription" reverts tier to `free`.
- All 81/15 existing settings-rest tests still PASS; new tests cover query-param parsing + tier transitions + disclosure banner.
- Verify Cross-vendor: Codex cold-read confirms (a) no SK in client bundle, (b) Stripe.js loads from official CDN only, (c) disclosure banner is unmissable.
