# Discovery Review — web-external-runtime-offline-gates

## Problem Framing

ADR-0011 Phase 1 requires the bundled desktop app to launch the `apps/web` shell offline and degrade cleanly anywhere the shipped Web console still assumes external runtime services. Two upstream prerequisites are already in place:

- `desktop-tauri-web-dist-normal-window` is SHIPPED, so the active desktop shell is a bundled normal Tauri window that loads `apps/web`
- `desktop-web-auth-offline-mode` already injects `VITE_WEB_AUTH_MODE=mock-authenticated`, which keeps `DeviceSessionBridge` inactive in `apps/web/src/providers/AppProviders.tsx`

The remaining gap is not route entry. It is online-only behavior after `/app` load. Current code still assumes network-backed runtime capabilities in these places:

- AI:
  - `packages/plugin-web-ai-chat/src/internal/claudeStreamAdapter.ts`
  - `packages/plugin-web-ai-chat/src/internal/secretStore.ts` `testConnection()`
  - `packages/plugin-web-settings-rest/src/panes/aiPane.tsx`
- Maps:
  - `packages/plugin-web-board-views/src/MapView.tsx`
- OAuth:
  - `packages/plugin-web-settings-rest/src/internal/integrationConnectButton.tsx`
  - `packages/plugin-web-settings-rest/src/CallbackPage.tsx`
- Stripe:
  - `packages/plugin-web-settings-rest/src/internal/premiumUpgradeButton.tsx`
  - `packages/plugin-web-settings-rest/src/CheckoutSuccessPage.tsx`
  - `packages/plugin-web-settings-rest/src/CheckoutCancelPage.tsx`
- Supabase device/account:
  - `apps/web/src/providers/AppProviders.tsx`
  - `packages/plugin-web-settings-rest/src/internal/useAccountDeleteOrchestrator.ts`
  - `packages/plugin-web-settings-rest/src/internal/DeleteAccountConfirmModal.tsx`

The planning revision requested by review is also valid:

- `@repo/core` must not own AI/OAuth/Stripe/account-delete policy booleans
- `feature-build` needs smaller, reviewable phases with explicit file/test seams, especially around callback-route fail-closed behavior

## External Research

No external research required. This is an internal runtime-boundary and regression-planning decision.

## Candidate Options

### Option A — Add one desktop runtime profile env, keep `@repo/core` generic, keep policy in owning packages

Inject a single profile env such as `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline`, resolve it through shared infra, and let each owning package decide what that profile means for its own surface.

Shared infra owns only:

- profile parsing
- defaulting
- generic predicates such as `isDesktopPhase1OfflineRuntime(profile)`

Owning packages keep:

- AI live-fetch and test-connection disable rules
- OSM tile fallback behavior
- OAuth button and callback-route gating
- Stripe button and callback-route gating
- account-delete local-only or disabled behavior

Pros:

- Preserves the correct boundary: `@repo/core` stays infra-only
- Keeps one explicit desktop/offline contract instead of reusing auth mode as a proxy
- Preserves browser/live behavior because env absence still resolves to normal Web mode
- Lets route handlers fail closed without scattering ad hoc host imports
- Matches the requested narrow env/runtime-profile approach

Cons:

- Requires one new env to be injected and cached in Turbo
- Requires each owning package to implement its own gate logic rather than leaning on a big shared capability object
- Still spans several packages, so the build plan must be deliberately phased

### Option B — Reuse `VITE_WEB_AUTH_MODE=mock-authenticated` as the only signal

Pros:

- Lowest code churn
- No new env variable

Cons:

- Wrong abstraction: auth mode is not runtime capability
- Couples unrelated product behavior to a login/session seam
- Makes future desktop live-auth or partial-online profiles harder
- Encourages more non-auth business policy to accumulate outside owning packages

### Option C — Patch every surface independently with ad hoc checks

Pros:

- Fastest local patch for one file at a time

Cons:

- Creates drift across AI/maps/OAuth/Stripe/account surfaces
- Makes callback-route review harder
- Violates the request to prefer one narrow runtime-profile gate over broad Web refactors
- `navigator.onLine` or protocol heuristics are not a reliable product contract for bundled desktop semantics

## Recommendation

Choose Option A, but with a stricter contract than the first draft.

Recommended shape:

- Host injection:
  - `VITE_WEB_AUTH_MODE=mock-authenticated`
  - `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline`
- Shared infra in `@repo/core`:
  - `type WebRuntimeProfile = "web-live" | "desktop-phase1-offline"`
  - `resolveWebRuntimeProfile(...)`
  - `isDesktopPhase1OfflineRuntime(profile)` or equivalent generic predicate
- Owning packages:
  - interpret that profile locally for AI, map, OAuth, Stripe, and account-delete behavior

Rejected from the first draft:

- no `WebExternalRuntimeCapabilities` object in `@repo/core`
- no shared booleans like `aiLiveFetch`, `oauthRedirects`, `stripePaymentLinks`, or `supabaseAccountDeleteMode`

That split preserves the repo rule that `packages/core` stays infrastructure-only while still giving all web-facing packages one shared source of runtime truth.

## Exact Boundary Matrix

### Shared infra boundary

Allowed in `@repo/core`:

- runtime-profile type
- env parsing/defaulting
- generic profile predicate helpers

Not allowed in `@repo/core`:

- AI-specific disable flags
- OAuth/Stripe/account-delete policy booleans
- copy/text decisions
- callback mutation decisions

### AI live fetch

Owning files:

- `packages/plugin-web-ai-chat/src/internal/claudeStreamAdapter.ts`
- `packages/plugin-web-ai-chat/src/internal/secretStore.ts`
- `packages/plugin-web-settings-rest/src/panes/aiPane.tsx`

Desktop/offline requirement:

- chat send must not attempt live provider fetch
- configured keys may remain stored locally
- settings "Test Connection" must fail soft with offline-specific UI, not a network attempt

### OSM map tiles

Owning file:

- `packages/plugin-web-board-views/src/MapView.tsx`

Desktop/offline requirement:

- do not mount the OSM tile layer
- render explicit unavailable/fallback UI

### OAuth redirects and callback route

Owning files:

- `packages/plugin-web-settings-rest/src/internal/integrationConnectButton.tsx`
- `packages/plugin-web-settings-rest/src/panes/integrationsPane.tsx`
- `packages/plugin-web-settings-rest/src/CallbackPage.tsx`
- `apps/web/src/routes/router.integration.test.tsx`

Desktop/offline requirement:

- connect actions disabled with explicit offline copy
- direct callback visits must not flip local connected prefs
- callback page must fail closed and navigate back or otherwise render a non-mutating unavailable state

### Stripe payment links and callback routes

Owning files:

- `packages/plugin-web-settings-rest/src/internal/premiumUpgradeButton.tsx`
- `packages/plugin-web-settings-rest/src/panes/premiumPane.tsx`
- `packages/plugin-web-settings-rest/src/CheckoutSuccessPage.tsx`
- `packages/plugin-web-settings-rest/src/CheckoutCancelPage.tsx`
- `apps/web/src/routes/router.integration.test.tsx`

Desktop/offline requirement:

- upgrade CTA disabled even if `VITE_STRIPE_PAYMENT_LINK_URL` exists
- direct success/cancel callback visits must not mutate premium state
- route behavior must stay explicit and fail closed

### Supabase device/account

Owning files:

- `apps/web/src/providers/AppProviders.tsx`
- `packages/plugin-web-settings-rest/src/internal/useAccountDeleteOrchestrator.ts`
- `packages/plugin-web-settings-rest/src/internal/DeleteAccountConfirmModal.tsx`

Desktop/offline requirement:

- startup keeps `DeviceSessionBridge` inactive on the desktop Phase 1 path
- account delete must not call live delete RPC in desktop/offline mode
- local-only reset is acceptable only if the UI copy is explicit

## Recommended Implementation Phases

### Phase 1 — Runtime Profile Contract

Goal:

- add one shared runtime-profile source of truth without pushing surface policy into `@repo/core`

Primary files:

- `apps/desktop/src-tauri/tauri.conf.json`
- `turbo.json`
- `packages/core/src/utils/index.ts`
- `packages/core/src/index.ts`

Primary tests:

- `packages/core/tests/` new runtime-profile resolver test
- `apps/web/src/providers/AppProviders.test.tsx` regression coverage that auth-mode transport gating remains unchanged

Stop condition for `feature-build`:

- env is injected
- Turbo cache input is updated
- core exports only profile-resolution/generic predicate helpers

### Phase 2 — AI and Map Offline Gates

Goal:

- gate the two pure external-runtime surfaces that do not involve redirect/callback security

Primary files:

- `packages/plugin-web-ai-chat/src/internal/claudeStreamAdapter.ts`
- `packages/plugin-web-ai-chat/src/internal/secretStore.ts`
- `packages/plugin-web-settings-rest/src/panes/aiPane.tsx`
- `packages/plugin-web-board-views/src/MapView.tsx`

Primary tests:

- `packages/plugin-web-ai-chat/src/__tests__/claudeStreamAdapter.test.ts`
- `packages/plugin-web-ai-chat/src/__tests__/secretStore.test.ts`
- `packages/plugin-web-settings-rest/src/__tests__/aiPane.test.tsx`
- `packages/plugin-web-board-views/src/__tests__/MapView.test.tsx`

Stop condition for `feature-build`:

- no live AI/provider or OSM tile attempt under desktop/offline profile
- browser/live behavior remains intact when the profile is absent

### Phase 3 — OAuth and Stripe Callback Security Gates

Goal:

- gate both the visible entry buttons and the direct callback routes that can mutate local state

Primary files:

- `packages/plugin-web-settings-rest/src/internal/integrationConnectButton.tsx`
- `packages/plugin-web-settings-rest/src/panes/integrationsPane.tsx`
- `packages/plugin-web-settings-rest/src/CallbackPage.tsx`
- `packages/plugin-web-settings-rest/src/internal/premiumUpgradeButton.tsx`
- `packages/plugin-web-settings-rest/src/panes/premiumPane.tsx`
- `packages/plugin-web-settings-rest/src/CheckoutSuccessPage.tsx`
- `packages/plugin-web-settings-rest/src/CheckoutCancelPage.tsx`
- `apps/web/src/routes/router.integration.test.tsx`

Primary tests:

- `packages/plugin-web-settings-rest/src/__tests__/integrationConnectButton.test.tsx`
- `packages/plugin-web-settings-rest/src/__tests__/integrationsPane.test.tsx`
- `packages/plugin-web-settings-rest/src/__tests__/CallbackPage.test.tsx`
- `packages/plugin-web-settings-rest/src/__tests__/premiumUpgradeButton.test.tsx`
- `packages/plugin-web-settings-rest/src/__tests__/premiumPane.test.tsx`
- `packages/plugin-web-settings-rest/src/__tests__/CheckoutSuccessPage.test.tsx`
- `packages/plugin-web-settings-rest/src/__tests__/CheckoutCancelPage.test.tsx`
- `apps/web/src/routes/router.integration.test.tsx`

Stop condition for `feature-build`:

- buttons are disabled with desktop/offline copy
- direct callback routes are non-mutating and fail closed

### Phase 4 — Device RPC Regression, Account-delete Rewording, and Desktop Evidence

Goal:

- preserve the existing no-device-RPC launch rule and make account-delete semantics explicit for the desktop/offline profile

Primary files:

- `apps/web/src/providers/AppProviders.tsx`
- `packages/plugin-web-settings-rest/src/internal/useAccountDeleteOrchestrator.ts`
- `packages/plugin-web-settings-rest/src/internal/DeleteAccountConfirmModal.tsx`

Primary tests:

- `apps/web/src/providers/AppProviders.test.tsx`
- `packages/plugin-web-settings-rest/src/__tests__/useAccountDeleteOrchestrator.test.tsx`
- `packages/plugin-web-settings-rest/src/__tests__/DeleteAccountConfirmModal.test.tsx`

Stop condition for `feature-build`:

- no live delete RPC in desktop/offline mode
- local-only behavior is explicit
- verification notes capture real macOS offline checks still required before ship

## Risks

- Callback routes remain the highest-risk gap because they can mutate local state even when visible buttons are disabled.
- A broad helper in `@repo/core` would look convenient now but would hard-code product policy into shared infra.
- AI and map fallback copy must stay narrow and local to avoid accidental Phase 1 scope creep into broader Web redesign.
- Real offline verification still requires a macOS app launch with networking disabled; browser-only proof is insufficient.

## Open Questions

- Exact helper surface in `@repo/core`:
  - recommendation: resolver + generic predicate only
  - reject: shared product-policy booleans
- Account-delete UX copy in desktop/offline mode:
  - recommendation: explicit local-only wording, not mock-auth wording
- Callback unavailable UX:
  - recommendation: explicit unavailable banner plus safe return path, never silent no-op mutation
