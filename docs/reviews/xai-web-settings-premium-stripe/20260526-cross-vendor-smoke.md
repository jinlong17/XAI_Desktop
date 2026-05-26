# Cross-Vendor Smoke — xai-web-settings-premium-stripe

> Gap-closure roadmap row #8.
> Status: TEMPLATE — awaiting operator real-browser evidence for ADR-0009 D2 G2.
> Vehicle: `pnpm --filter @repo/web dev:mock-auth`.
> Route: `/app/settings/premium`.

## Browser Matrix

| Browser | Target | Status | Version / Device | Notes |
|---|---|---|---|---|
| Chrome macOS | 120+ / macOS 14+ | Pending |  |  |
| Safari macOS | 17+ / macOS 14+ | Pending |  |  |
| Firefox macOS | 121+ / macOS 14+ | Pending |  |  |
| Safari iOS | 17+ / iOS 17+ | Pending |  |  |

## Scenario Matrix

| ID | Check | Chrome | Safari | Firefox | iOS Safari | Notes |
|---|---|---|---|---|---|---|
| STR-1 | Premium pane renders current tier, disclosure banner, and Upgrade action. | Pending | Pending | Pending | Pending |  |
| STR-2 | Disclosure banner is visible, amber, and non-dismissible. | Pending | Pending | Pending | Pending |  |
| STR-3 | Upgrade navigates to the configured `buy.stripe.com` Payment Link in same tab. | Pending | Pending | Pending | Pending | Use test-mode link only. |
| STR-4 | No CSP console violation is emitted for Stripe navigation despite no Stripe `connect-src` allowlist. | Pending | Pending | Pending | Optional | iOS console evidence optional. |
| STR-5 | Success redirect route renders and updates PremiumTierBadge in the Topbar. | Pending | Pending | Pending | Pending |  |
| STR-6 | Cancel redirect route renders without granting premium. | Pending | Pending | Pending | Pending |  |
| STR-7 | Cancel Subscription clears tier state and emits visible UI update. | Pending | Pending | Pending | Pending |  |
| STR-8 | Reload preserves expected 30-day read-side tier state. | Pending | Pending | Pending | Pending |  |

## Evidence

Paste screenshots, console CSP notes, URL observations, and exact browser versions here.

## Sign-off

| Role | Name | Date | Verdict |
|---|---|---|---|
| Operator |  |  | Pending |

