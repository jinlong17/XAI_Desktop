# web-external-runtime-offline-gates — API / Contract Notes

## Contract Summary

This feature adds one runtime-profile contract for desktop Phase 1 and then applies that profile inside each owning package. It does not change the desktop window shell, route families, or plugin ownership boundaries.

## Runtime Profile Contract

### Host-injected envs

Desktop Phase 1 build/dev/bundle should inject:

- `VITE_WEB_AUTH_MODE=mock-authenticated`
- `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline`

Browser/Web default when the new env is absent:

- runtime profile resolves to `web-live`

### Shared infra contract

Recommended `@repo/core` shape:

```ts
export type WebRuntimeProfile = "web-live" | "desktop-phase1-offline";

export function resolveWebRuntimeProfile(
  env?: Record<string, string | undefined>
): WebRuntimeProfile;

export function isDesktopPhase1OfflineRuntime(
  profile: WebRuntimeProfile
): boolean;
```

Shared-infra rules:

- one explicit profile env is the source of truth
- core may expose generic predicates derived from the profile
- core must not expose surface-specific policy booleans

Explicitly rejected from `@repo/core`:

```ts
interface WebExternalRuntimeCapabilities {
  aiLiveFetch: boolean;
  oauthRedirects: boolean;
  stripePaymentLinks: boolean;
  supabaseAccountDeleteMode: "live" | "local-only";
}
```

Those decisions belong to the owning packages.

### Shared location constraint

- plugins must not import helpers from `apps/web`
- preferred owner: `@repo/core`
- if `@repo/core` gains runtime exports, its package exports must stay generic and infra-only

## Upstream Interfaces

### `AppProviders` transport contract

`apps/web/src/providers/AppProviders.tsx` already mounts `DeviceSessionBridge` only when:

- Supabase config exists
- `VITE_WEB_AUTH_MODE === "live"`

This feature preserves that behavior. The new runtime profile must not reactivate device register/heartbeat RPC during desktop/offline launch.

### Existing auth-mode contract

`desktop-web-auth-offline-mode` already owns `/app` entry policy through `VITE_WEB_AUTH_MODE=mock-authenticated`.

This feature must not:

- weaken route guards
- change browser/live auth defaults
- replace auth mode with the runtime profile

The new profile is additive and scoped to external-runtime degradation.

## Downstream Surface Contracts

### AI

Owning files:

- `packages/plugin-web-ai-chat/src/internal/claudeStreamAdapter.ts`
- `packages/plugin-web-ai-chat/src/internal/secretStore.ts`
- `packages/plugin-web-settings-rest/src/panes/aiPane.tsx`

Desktop/offline contract:

- live fetch path must be short-circuited before provider fetch is attempted
- settings "Test Connection" must render deterministic offline-unavailable UI or be disabled
- local key save/delete remain permitted

### OSM map

Owning file:

- `packages/plugin-web-board-views/src/MapView.tsx`

Desktop/offline contract:

- do not mount the OSM tile layer
- render fallback copy instead of a permanent loading state or tile-error path

### OAuth integrations

Owning files:

- `packages/plugin-web-settings-rest/src/internal/integrationConnectButton.tsx`
- `packages/plugin-web-settings-rest/src/panes/integrationsPane.tsx`
- `packages/plugin-web-settings-rest/src/CallbackPage.tsx`

Desktop/offline contract:

- connect action is disabled with explicit offline copy
- callback route must not flip local connected prefs while profile is `desktop-phase1-offline`
- route handler must fail closed even on direct visits with crafted query params

### Stripe premium

Owning files:

- `packages/plugin-web-settings-rest/src/internal/premiumUpgradeButton.tsx`
- `packages/plugin-web-settings-rest/src/panes/premiumPane.tsx`
- `packages/plugin-web-settings-rest/src/CheckoutSuccessPage.tsx`
- `packages/plugin-web-settings-rest/src/CheckoutCancelPage.tsx`

Desktop/offline contract:

- upgrade CTA is disabled even when `VITE_STRIPE_PAYMENT_LINK_URL` is configured
- success/cancel callback routes must not flip premium stub state in desktop/offline mode
- route behavior must stay explicit and non-mutating under direct visits

### Account delete

Owning files:

- `packages/plugin-web-settings-rest/src/internal/useAccountDeleteOrchestrator.ts`
- `packages/plugin-web-settings-rest/src/internal/DeleteAccountConfirmModal.tsx`

Desktop/offline contract:

- no live `deleteAccount(...)` call is allowed in desktop/offline mode
- local-only wipe/reset is acceptable only if the UI copy says so explicitly
- mock-auth wording must not be the only expression of this Phase 1 desktop behavior

## Error Semantics

- Missing `VITE_WEB_RUNTIME_PROFILE` in desktop dev/build is a regression if online-only actions behave like normal live Web flows.
- AI offline gating must fail soft:
  - return offline/demo behavior or deterministic disabled UI
  - never block initial render on provider fetch
- Callback routes in desktop/offline mode must fail closed:
  - no local pref mutation
  - explicit unavailable/return banner or equivalent non-mutating UX
- Account delete in desktop/offline mode must fail closed with respect to cloud deletion:
  - no live backend RPC
  - any retained local-only behavior must be deliberate and explicit

## Permission Notes

- No new Tauri permissions or native commands belong here.
- No new external provider SDKs belong here.
- No Phase 2 notification/statusbar/global-hotkey/autoupdate work belongs here.
- No Phase 3 sync/account/local-first expansion belongs here.

## Idempotency Notes

- Re-running desktop dev/build should resolve the same runtime profile every time.
- Disabled callback routes must be safe to revisit directly without mutating local provider or premium state.
- Local-only account reset, if retained, must remain idempotent across repeated attempts.
