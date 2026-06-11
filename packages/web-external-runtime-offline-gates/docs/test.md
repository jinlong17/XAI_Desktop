# web-external-runtime-offline-gates — Test Plan

## Validation Goals

- Confirm desktop Phase 1 launch does not require external AI, maps, OAuth, Stripe, or live Supabase account-delete runtime services.
- Confirm browser/Web live behavior remains unchanged when `VITE_WEB_RUNTIME_PROFILE` is absent.
- Confirm direct callback routes are gated, not just visible buttons.
- Confirm the existing mock-auth desktop path still keeps device transport inactive.
- Confirm the runtime-profile contract stays infra-generic and does not move product policy into `@repo/core`.

## Contract Checks

- `apps/desktop/src-tauri/tauri.conf.json`
  - injects `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline` alongside `VITE_WEB_AUTH_MODE=mock-authenticated`
- `turbo.json`
  - treats `VITE_WEB_RUNTIME_PROFILE` as a cache input
- `@repo/core`
  - resolves the runtime profile and exports only generic predicates
  - does not export AI/OAuth/Stripe/account-delete policy booleans
- owning modules
  - AI, map, integrations, premium, and account-delete surfaces all interpret the profile locally

## Automated Checks

- `pnpm --filter @repo/core test`
- `pnpm --filter @repo/core check-types`
- `pnpm --filter @repo/web test`
- `pnpm --filter @repo/web check-types`
- `pnpm --filter @repo/plugin-web-ai-chat test`
- `pnpm --filter @repo/plugin-web-board-views test`
- `pnpm --filter @repo/plugin-web-settings-rest test`
- `pnpm --filter @repo/web-auth-device-session test`
- `pnpm --filter desktop tauri build --debug --bundles app`

## Phase-by-Phase Test Boundaries

### Phase 1 — Runtime Profile Contract

Files:

- `apps/desktop/src-tauri/tauri.conf.json`
- `turbo.json`
- `packages/core/src/utils/index.ts`
- `packages/core/src/index.ts`

Tests:

- new `packages/core/tests/` runtime-profile resolver test
- `apps/web/src/providers/AppProviders.test.tsx`

Assertions:

- profile defaults to `web-live` when env is absent
- profile resolves `desktop-phase1-offline` when env is present
- generic predicate returns true only for desktop/offline profile
- existing `VITE_WEB_AUTH_MODE` transport gating remains unchanged

### Phase 2 — AI and Map Offline Gates

Files:

- `packages/plugin-web-ai-chat/src/internal/claudeStreamAdapter.ts`
- `packages/plugin-web-ai-chat/src/internal/secretStore.ts`
- `packages/plugin-web-settings-rest/src/panes/aiPane.tsx`
- `packages/plugin-web-board-views/src/MapView.tsx`

Tests:

- `packages/plugin-web-ai-chat/src/__tests__/claudeStreamAdapter.test.ts`
- `packages/plugin-web-ai-chat/src/__tests__/secretStore.test.ts`
- `packages/plugin-web-settings-rest/src/__tests__/aiPane.test.tsx`
- `packages/plugin-web-board-views/src/__tests__/MapView.test.tsx`

Assertions:

- desktop/offline profile short-circuits live AI/provider calls
- AI pane test-connection is disabled or deterministic offline-unavailable
- map view renders explicit fallback copy
- no OSM tile layer is mounted under desktop/offline profile

### Phase 3 — OAuth and Stripe Callback Security Gates

Files:

- `packages/plugin-web-settings-rest/src/internal/integrationConnectButton.tsx`
- `packages/plugin-web-settings-rest/src/panes/integrationsPane.tsx`
- `packages/plugin-web-settings-rest/src/CallbackPage.tsx`
- `packages/plugin-web-settings-rest/src/internal/premiumUpgradeButton.tsx`
- `packages/plugin-web-settings-rest/src/panes/premiumPane.tsx`
- `packages/plugin-web-settings-rest/src/CheckoutSuccessPage.tsx`
- `packages/plugin-web-settings-rest/src/CheckoutCancelPage.tsx`
- `apps/web/src/routes/router.integration.test.tsx`

Tests:

- `packages/plugin-web-settings-rest/src/__tests__/integrationConnectButton.test.tsx`
- `packages/plugin-web-settings-rest/src/__tests__/integrationsPane.test.tsx`
- `packages/plugin-web-settings-rest/src/__tests__/CallbackPage.test.tsx`
- `packages/plugin-web-settings-rest/src/__tests__/premiumUpgradeButton.test.tsx`
- `packages/plugin-web-settings-rest/src/__tests__/premiumPane.test.tsx`
- `packages/plugin-web-settings-rest/src/__tests__/CheckoutSuccessPage.test.tsx`
- `packages/plugin-web-settings-rest/src/__tests__/CheckoutCancelPage.test.tsx`
- `apps/web/src/routes/router.integration.test.tsx`

Assertions:

- desktop/offline profile disables connect/upgrade buttons with offline-specific copy
- OAuth callback route does not flip connected prefs under desktop/offline profile
- Stripe success/cancel routes do not flip premium state under desktop/offline profile
- route resolution still works, but state mutation is absent

### Phase 4 — Device RPC Regression and Account-delete Semantics

Files:

- `apps/web/src/providers/AppProviders.tsx`
- `packages/plugin-web-settings-rest/src/internal/useAccountDeleteOrchestrator.ts`
- `packages/plugin-web-settings-rest/src/internal/DeleteAccountConfirmModal.tsx`

Tests:

- `apps/web/src/providers/AppProviders.test.tsx`
- `packages/plugin-web-settings-rest/src/__tests__/useAccountDeleteOrchestrator.test.tsx`
- `packages/plugin-web-settings-rest/src/__tests__/DeleteAccountConfirmModal.test.tsx`

Assertions:

- desktop/offline launch still keeps `DeviceSessionBridge` inactive
- no live delete RPC is attempted in desktop/offline mode
- local-only or disabled delete behavior is explicit in the modal copy/state

## Manual Desktop Checks

- Launch the built desktop app with network disabled.
- Enter `/app` and verify shell/module render succeeds.
- AI module:
  - send a prompt
  - verify clean offline/demo behavior
- Board map:
  - open map view
  - verify explicit unavailable state, not endless loading
- Settings → Integrations:
  - verify Connect actions are disabled
- Settings → Premium:
  - verify Upgrade CTA is disabled with offline-specific copy
- Direct callback route smoke:
  - open OAuth callback route and Stripe success/cancel routes manually in the desktop app
  - verify no local connected/premium flags are mutated
- Settings → Account:
  - verify local-only or disabled delete behavior is explicit and does not claim cloud deletion

## Mock Strategy

- Stub `VITE_WEB_RUNTIME_PROFILE` per test with `vi.stubEnv`.
- Keep `VITE_WEB_AUTH_MODE` stubs only for auth/session behavior, not as the runtime-capability signal for AI/OAuth/Stripe/account-delete gating.
- For callback-route tests, assert state mutation is absent under desktop/offline profile even when query params are present.

## Residual Risk

- Real macOS offline verification is still required because Tauri bundle launch and network-disabled behavior are environment-sensitive.
- Callback-route regressions are the most security-sensitive part of this feature because they can mutate local state on direct visits even when surface buttons are disabled.
