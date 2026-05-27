# web-external-runtime-offline-gates — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option A revised — one explicit desktop runtime-profile env, `@repo/core` owns only profile resolution/generic predicates, surface-specific gating stays in owning packages |
| Review Doc Path | docs/reviews/web-external-runtime-offline-gates/20260527-discovery-review.md |
| Review Date/Version | 2026-05-27 rev-2 |
| Feature Type | P1 Phase 1 desktop external-runtime degradation |

## Frozen Assumptions

- ADR-0011 Phase 1 requires the bundled desktop app to launch offline and degrade deliberately for online-only surfaces.
- `desktop-tauri-web-dist-normal-window` is SHIPPED and `desktop-web-auth-offline-mode` already injects `VITE_WEB_AUTH_MODE=mock-authenticated`.
- `apps/web/src/providers/AppProviders.tsx` already keeps `DeviceSessionBridge` inactive outside live auth mode; this feature preserves that behavior as a regression contract.
- Browser/Web live behavior must stay unchanged when the new runtime-profile env is absent.
- Phase 3 local-first/account/sync work is out of scope. This feature only gates or rewords online-only behavior for desktop Phase 1.
- Web packages must not import runtime helpers from `apps/web`.
- `@repo/core` must remain infrastructure-only. It may resolve a profile and expose generic predicates, but it must not own AI/OAuth/Stripe/account-delete policy booleans.

## Dependency Overview

- Upstream authority:
  - `docs/adr/0011-p1-react-tauri-local-first-hybrid.md`
  - `docs/audit/2026-05-26-web-completeness-and-p1-redefinition.md`
  - `docs/audit/2026-05-26-patch-roadmap-source.md`
- Upstream feature dependencies:
  - `packages/desktop-tauri-web-dist-normal-window/docs/dev_log.md`
  - `packages/desktop-web-auth-offline-mode/docs/dev_log.md`
  - `packages/desktop-phase1-build-packaging-pipeline/docs/dev_log.md`
- Host/config surfaces:
  - `apps/desktop/src-tauri/tauri.conf.json`
  - `turbo.json`
- Shared infra boundary:
  - `packages/core/src/utils/index.ts`
  - `packages/core/src/index.ts`
- Owning runtime surfaces:
  - `packages/plugin-web-ai-chat`
  - `packages/plugin-web-board-views`
  - `packages/plugin-web-settings-rest`
  - `packages/web-auth-device-session`
  - `apps/web`

## Selected Runtime Shape

- Add one explicit host-injected profile env:
  - `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline`
- Keep existing auth env:
  - `VITE_WEB_AUTH_MODE=mock-authenticated`
- `@repo/core` owns only:
  - `WebRuntimeProfile`
  - runtime-profile resolution/defaulting
  - generic helpers such as `isDesktopPhase1OfflineRuntime(profile)`
- Owning packages interpret that profile locally for:
  - AI live fetch and test-connection
  - map tile loading
  - OAuth button and callback-route behavior
  - Stripe button and callback-route behavior
  - account-delete local-only or disabled behavior

This is intentionally one new runtime gate, not a matrix of product-policy booleans in shared infra.

## Surface Boundaries After This Feature

- AI:
  - live provider fetches and provider test-connection are disabled in desktop/offline mode
  - local key storage remains available
  - chat falls back to offline/demo behavior without blocking launch
- Maps:
  - Map view renders an offline fallback state instead of loading OSM tiles
- OAuth:
  - connect actions are disabled
  - callback routes do not mutate local connected prefs in desktop/offline mode
- Stripe:
  - upgrade CTA is disabled in desktop/offline mode even if a Payment Link env is configured
  - success/cancel callback routes do not mutate local premium state in desktop/offline mode
- Supabase device/account:
  - startup continues to avoid device register/heartbeat RPC
  - account-delete becomes clearly local-only or disabled in desktop/offline mode

## Rejected Shapes

- Using `VITE_WEB_AUTH_MODE` as the only runtime-capability signal
- A shared `WebExternalRuntimeCapabilities` object in `@repo/core`
- Per-module ad hoc env checks or `navigator.onLine` heuristics
- Broad Web redesign or route-guard weakening

## Implementation Phases

### Phase 1 — Runtime Profile Contract

- Files:
  - `apps/desktop/src-tauri/tauri.conf.json`
  - `turbo.json`
  - `packages/core/src/utils/index.ts`
  - `packages/core/src/index.ts`
- Test boundary:
  - new `packages/core/tests/` runtime-profile test
  - `apps/web/src/providers/AppProviders.test.tsx` regression update
- Build stop:
  - core exports only profile-resolution/generic predicate helpers

### Phase 2 — AI and Map Offline Gates

- Files:
  - `packages/plugin-web-ai-chat/src/internal/claudeStreamAdapter.ts`
  - `packages/plugin-web-ai-chat/src/internal/secretStore.ts`
  - `packages/plugin-web-settings-rest/src/panes/aiPane.tsx`
  - `packages/plugin-web-board-views/src/MapView.tsx`
- Test boundary:
  - AI adapter/secret store/settings pane tests
  - `packages/plugin-web-board-views/src/__tests__/MapView.test.tsx`
- Build stop:
  - no live AI/provider or OSM tile attempt under desktop/offline profile

### Phase 3 — OAuth and Stripe Callback Security Gates

- Files:
  - `packages/plugin-web-settings-rest/src/internal/integrationConnectButton.tsx`
  - `packages/plugin-web-settings-rest/src/panes/integrationsPane.tsx`
  - `packages/plugin-web-settings-rest/src/CallbackPage.tsx`
  - `packages/plugin-web-settings-rest/src/internal/premiumUpgradeButton.tsx`
  - `packages/plugin-web-settings-rest/src/panes/premiumPane.tsx`
  - `packages/plugin-web-settings-rest/src/CheckoutSuccessPage.tsx`
  - `packages/plugin-web-settings-rest/src/CheckoutCancelPage.tsx`
  - `apps/web/src/routes/router.integration.test.tsx`
- Test boundary:
  - integration/premium page tests plus router callback-route checks
- Build stop:
  - button and direct-route paths both fail closed without local mutation

### Phase 4 — Device RPC Regression, Account-delete Rewording, and Desktop Evidence

- Files:
  - `apps/web/src/providers/AppProviders.tsx`
  - `packages/plugin-web-settings-rest/src/internal/useAccountDeleteOrchestrator.ts`
  - `packages/plugin-web-settings-rest/src/internal/DeleteAccountConfirmModal.tsx`
- Test boundary:
  - `AppProviders.test.tsx`
  - account-delete orchestrator and modal tests
- Build stop:
  - no live delete RPC in desktop/offline mode
  - local-only behavior is explicit

