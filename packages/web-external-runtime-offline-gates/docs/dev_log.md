# web-external-runtime-offline-gates — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | web-external-runtime-offline-gates |
| Title | Phase 1 Desktop Offline Gates for Online-only Web Runtime Surfaces |
| Current Phase | FEATURE_REVIEW |
| Status | APPROVED |
| Suggested Next | feature-build |
| Automation Mode | B-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-review (Codex, gpt-5.4 inline) |
| Updated | 2026-05-27 16:25 PDT |
| Risks | Callback routes remain the highest-risk gap because they can mutate local state on direct visits; putting AI/OAuth/Stripe/account-delete policy booleans into `@repo/core` would violate the infra-only boundary and make later desktop live-auth harder; real network-disabled macOS verification remains required before ship closes the Phase 1 residual risk. |

## Phase Plan

### Phase 1 — Runtime Profile Contract

Status: PLANNED

- Inject `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline` from the Tauri host next to `VITE_WEB_AUTH_MODE=mock-authenticated`.
- Add the env to Turbo cache inputs.
- Export only runtime-profile resolution and generic predicate helpers from `@repo/core`.
- File boundary:
  - `apps/desktop/src-tauri/tauri.conf.json`
  - `turbo.json`
  - `packages/core/src/utils/index.ts`
  - `packages/core/src/index.ts`
- Test boundary:
  - new `packages/core/tests/` runtime-profile test
  - `apps/web/src/providers/AppProviders.test.tsx`

### Phase 2 — AI and Map Offline Gates

Status: PLANNED

- Apply the runtime profile to AI live fetch and AI settings test-connection.
- Add explicit offline fallback handling to MapView.
- File boundary:
  - `packages/plugin-web-ai-chat/src/internal/claudeStreamAdapter.ts`
  - `packages/plugin-web-ai-chat/src/internal/secretStore.ts`
  - `packages/plugin-web-settings-rest/src/panes/aiPane.tsx`
  - `packages/plugin-web-board-views/src/MapView.tsx`
- Test boundary:
  - `packages/plugin-web-ai-chat/src/__tests__/claudeStreamAdapter.test.ts`
  - `packages/plugin-web-ai-chat/src/__tests__/secretStore.test.ts`
  - `packages/plugin-web-settings-rest/src/__tests__/aiPane.test.tsx`
  - `packages/plugin-web-board-views/src/__tests__/MapView.test.tsx`

### Phase 3 — OAuth and Stripe Callback Security Gates

Status: PLANNED

- Disable/gate OAuth connect actions and callback-route mutation.
- Disable/gate Stripe upgrade and success/cancel callback-route mutation.
- File boundary:
  - `packages/plugin-web-settings-rest/src/internal/integrationConnectButton.tsx`
  - `packages/plugin-web-settings-rest/src/panes/integrationsPane.tsx`
  - `packages/plugin-web-settings-rest/src/CallbackPage.tsx`
  - `packages/plugin-web-settings-rest/src/internal/premiumUpgradeButton.tsx`
  - `packages/plugin-web-settings-rest/src/panes/premiumPane.tsx`
  - `packages/plugin-web-settings-rest/src/CheckoutSuccessPage.tsx`
  - `packages/plugin-web-settings-rest/src/CheckoutCancelPage.tsx`
  - `apps/web/src/routes/router.integration.test.tsx`
- Test boundary:
  - `packages/plugin-web-settings-rest/src/__tests__/integrationConnectButton.test.tsx`
  - `packages/plugin-web-settings-rest/src/__tests__/integrationsPane.test.tsx`
  - `packages/plugin-web-settings-rest/src/__tests__/CallbackPage.test.tsx`
  - `packages/plugin-web-settings-rest/src/__tests__/premiumUpgradeButton.test.tsx`
  - `packages/plugin-web-settings-rest/src/__tests__/premiumPane.test.tsx`
  - `packages/plugin-web-settings-rest/src/__tests__/CheckoutSuccessPage.test.tsx`
  - `packages/plugin-web-settings-rest/src/__tests__/CheckoutCancelPage.test.tsx`
  - `apps/web/src/routes/router.integration.test.tsx`

### Phase 4 — Device RPC Regression, Account-delete Rewording, and Desktop Evidence

Status: PLANNED

- Preserve the inactive device-transport behavior already established by desktop mock-auth.
- Reframe account-delete behavior around the runtime profile instead of mock-auth terminology alone.
- Record automated regression proof plus real-macOS offline residual verification steps.
- File boundary:
  - `apps/web/src/providers/AppProviders.tsx`
  - `packages/plugin-web-settings-rest/src/internal/useAccountDeleteOrchestrator.ts`
  - `packages/plugin-web-settings-rest/src/internal/DeleteAccountConfirmModal.tsx`
- Test boundary:
  - `apps/web/src/providers/AppProviders.test.tsx`
  - `packages/plugin-web-settings-rest/src/__tests__/useAccountDeleteOrchestrator.test.tsx`
  - `packages/plugin-web-settings-rest/src/__tests__/DeleteAccountConfirmModal.test.tsx`

## Revision Response

- Revised:
  - narrowed the shared contract so `@repo/core` owns only runtime-profile resolution/defaulting and generic predicates
  - removed the earlier shared product-policy capability object from the plan docs
  - split the old broad Phase 2 into Phase 2 AI/map, Phase 3 OAuth/Stripe callback security, and Phase 4 device/account regression work with explicit file/test seams
- Intentionally unchanged:
  - feature goal remains desktop/offline degradation for AI, OSM tiles, OAuth redirects, Stripe payment links, and Supabase-backed account/runtime surfaces
  - browser/Web live behavior remains preserved
  - callback routes remain mandatory gating points, not optional follow-up work

## Review Notes

**Verdict: APPROVED** — 0 blockers, 2 recommendations.

- The revised contract is aligned with the repo boundary: `@repo/core` now owns only runtime-profile typing, resolution/defaulting, and generic predicates; AI, map, OAuth, Stripe, and account-delete policy stays in the owning packages.
- The four-phase split is now reviewable under the one-phase-per-run build rule, and the callback routes are explicitly treated as mandatory fail-closed gates rather than optional UX follow-up.

Recommendations for `feature-build`:

1. In Phase 1, keep the desktop runtime-profile injection canonical in `apps/desktop/src-tauri/tauri.conf.json` for both dev and build paths, and add a focused regression assertion that env absence still resolves to `web-live`.
2. In Phase 3, make the route tests assert non-mutation directly (prefs, premium state, and emitted events remain unchanged under crafted callback URLs), not just disabled button UI.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-27 16:10 PDT | feature-plan (Codex, gpt-5.4 inline) | Fresh plan: created the feature brief, discovery review, and docs quartet for Phase 1 desktop/offline gating of AI live fetch, OSM tiles, OAuth redirects, Stripe payment links, and Supabase-backed account/runtime surfaces. Recommended one explicit `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline` env plus a shared runtime helper, while preserving existing desktop mock-auth transport gating and normal browser/live behavior. | — | feature-review |
| 2026-05-27 16:17 PDT | feature-review (Codex, gpt-5.4 inline) | REVISE — validated the target surface inventory and the need for a distinct runtime-profile abstraction, but sent the plan back because the proposed shared helper still risks pushing surface-specific policy into `@repo/core`, and the current Phase 2 is too broad for the one-phase-per-run build contract. Review notes now require a core/plugin-boundary-safe runtime contract and a finer-grained phase split with explicit callback-route security coverage. | — | feature-plan |
| 2026-05-27 16:19 PDT | feature-plan (Codex, gpt-5.4 inline) | Revise pass: rewrote discovery/design/api/test so `@repo/core` now owns only runtime-profile resolution and generic predicates, while AI/map/OAuth/Stripe/account-delete gating stays in owning packages. Split the implementation roadmap into four reviewable phases with concrete file/test boundaries, separating AI/map from OAuth/Stripe callback security and keeping device/account regression work isolated. | — | feature-review |
| 2026-05-27 16:25 PDT | feature-review (Codex, gpt-5.4 inline) | APPROVED — confirmed the revised planning artifacts now keep `@repo/core` infra-generic, preserve browser/live default behavior when the runtime-profile env is absent, make callback routes mandatory fail-closed gates, and split implementation into four reviewable phases with concrete file/test seams. | — | feature-build |
