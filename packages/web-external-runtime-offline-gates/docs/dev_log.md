# web-external-runtime-offline-gates — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | web-external-runtime-offline-gates |
| Title | Phase 1 Desktop Offline Gates for Online-only Web Runtime Surfaces |
| Current Phase | SHIP |
| Status | SHIPPED |
| Suggested Next | workflow complete |
| Automation Mode | B-Codex |
| Verify Cross-vendor | yes |
| Executor | ship (Codex, gpt-5.3-codex) |
| Updated | 2026-05-27 23:38 PDT |
| Risks | Real network-disabled macOS manual verification is still required before release confidence; unrelated suite `pnpm --filter @repo/plugin-web-board-views test` still reproduces the pre-existing `filter-view-integration.test.tsx` FVI-Timeline failure in untouched TimelineView coverage, while the feature-touched `MapView` path passes. |

## Phase Plan

### Phase 1 — Runtime Profile Contract

Status: DONE (commit: `7aeab076`)

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

Status: DONE (commit: `398eaf19`)

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

Status: DONE (commit: `e1d3d4e6`)

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

Status: DONE (commit: `78873f7c`)

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
| 2026-05-27 16:30 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 1 — Runtime Profile Contract: injected `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline` into Tauri dev/build web commands, added Turbo cache env input, implemented generic runtime profile resolver/predicate helpers in `@repo/core`, and added core runtime-profile tests while preserving default `web-live` behavior when env is absent. Tests: `pnpm --filter @repo/core test`; `pnpm --filter @repo/core check-types`; `pnpm --filter @repo/web test -- src/providers/AppProviders.test.tsx`. | `7aeab076` | Phase 2 |
| 2026-05-27 16:32 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 2 — AI and Map Offline Gates: short-circuited AI live stream/test-connection under desktop/offline runtime profile, disabled AI test connection with deterministic offline copy, and added map offline fallback that avoids OSM/Leaflet loading in desktop offline mode. Tests: `pnpm --filter @repo/plugin-web-ai-chat test -- src/__tests__/claudeStreamAdapter.test.ts src/__tests__/secretStore.test.ts`; `pnpm --filter @repo/plugin-web-settings-rest test -- src/__tests__/aiPane.test.tsx`; `pnpm --filter @repo/plugin-web-board-views test -- src/__tests__/MapView.test.tsx`. | `398eaf19` | Phase 3 |
| 2026-05-27 16:35 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 3 — OAuth and Stripe Callback Security Gates: disabled connect/upgrade actions in desktop/offline profile, added callback fail-closed branches for OAuth/Stripe callback pages, and added explicit offline non-mutation assertions (including crafted callback URLs) in route/component tests. Evidence: OAuth callback under offline profile did not set `xai_pref_integrations_connected_notion`; Stripe success callback under offline profile did not set `xai_pref_premium_tier=premium_stub`. Tests: `pnpm --filter @repo/plugin-web-settings-rest test -- src/__tests__/integrationConnectButton.test.tsx src/__tests__/integrationsPane.test.tsx src/__tests__/CallbackPage.test.tsx src/__tests__/premiumUpgradeButton.test.tsx src/__tests__/premiumPane.test.tsx src/__tests__/CheckoutSuccessPage.test.tsx src/__tests__/CheckoutCancelPage.test.tsx`; `pnpm --filter @repo/web test -- src/routes/router.integration.test.tsx`. | `e1d3d4e6` | Phase 4 |
| 2026-05-27 16:38 PDT | feature-auto-build (Codex, gpt-5.3-codex inline) | Phase 4 — Device RPC Regression, Account-delete Rewording, and Desktop Evidence: added runtime-profile-aware transport guard in `AppProviders`, made account-delete orchestrator treat desktop/offline profile as local-only mode (no live delete RPC), reworded delete modal disclosure for desktop/offline semantics, and added regression tests for no-RPC behavior. Full required matrix run: `pnpm --filter @repo/web check-types` PASS; `pnpm --filter @repo/web test` PASS; `pnpm --filter @repo/plugin-web-ai-chat test` PASS; `pnpm --filter @repo/plugin-web-settings-rest test` PASS; `pnpm --filter @repo/web-auth-device-session test` PASS; `pnpm --filter desktop tauri build --debug --bundles app` PASS; `pnpm --filter @repo/plugin-web-board-views test` FAIL (pre-existing unrelated FVI-Timeline assertion). | `78873f7c` | feature-verify |
| 2026-05-27 16:49 PDT | feature-auto-build (Codex, gpt-5.3-codex inline repair) | Repaired the local-only runtime-gates commit segment so planning artifacts are committed before phase implementation and each approved phase remains single-intent. Updated Status Panel back to READY_FOR_VERIFY for independent verification. | `d7ec065f`, `7aeab076`, `398eaf19`, `e1d3d4e6`, `78873f7c` | feature-verify |
| 2026-05-27 16:51 PDT | feature-verify (Codex, gpt-5.4 inline) | PASS — reviewed commit boundaries/messages for `d7ec065f`, `7aeab076`, `398eaf19`, `e1d3d4e6`, `78873f7c`, and `dbbd7f33`; confirmed `@repo/core` remains limited to runtime-profile resolution/defaulting plus generic predicate helpers; reran the requested matrix (`@repo/core` test/check-types, `@repo/web` test/check-types, `@repo/plugin-web-ai-chat` test, `@repo/plugin-web-settings-rest` test, `@repo/web-auth-device-session` test, `desktop tauri build --debug --bundles app`). Reproduced `@repo/plugin-web-board-views` suite failure in untouched `filter-view-integration.test.tsx` / TimelineView coverage and treated it as unrelated to this feature because the only board-views files changed here are `MapView.tsx` and `MapView.test.tsx`, both passing. | `d7ec065f`, `7aeab076`, `398eaf19`, `e1d3d4e6`, `78873f7c`, `dbbd7f33` | ship |
| 2026-05-27 23:38 PDT | ship (Codex, gpt-5.3-codex) | Ship gate passed for `web-external-runtime-offline-gates`: validated `READY_TO_SHIP` status and commit traceability, verified clean worktree with no sensitive-file deltas, and marked this feature SHIPPED on `dev` while preserving other features' states. | `d7ec065f`, `7aeab076`, `398eaf19`, `e1d3d4e6`, `78873f7c`, `dbbd7f33` | workflow complete |
