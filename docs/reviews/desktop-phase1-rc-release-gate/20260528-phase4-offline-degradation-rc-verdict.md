# Phase 4 — Offline Degradation Matrix and RC Verdict (2026-05-28)

## Scope

- Feature: `desktop-phase1-rc-release-gate`
- Gate item: online-only surfaces degrade correctly under desktop Phase 1 offline runtime profile

## Command Evidence (automated)

### Build / packaging integrity

- `pnpm --filter @repo/web build` — PASS
- `pnpm --filter desktop build` — PASS
- `pnpm --filter desktop build:dmg` — PASS

### Offline-surface test matrix

- `pnpm --filter @repo/plugin-web-ai-chat test -- src/__tests__/claudeStreamAdapter.test.ts src/__tests__/secretStore.test.ts` — PASS (20/20)
- `pnpm --filter @repo/plugin-web-board-views test -- src/__tests__/MapView.test.tsx` — PASS (16/16)
- `pnpm --filter @repo/plugin-web-settings-rest test -- src/__tests__/integrationConnectButton.test.tsx src/__tests__/integrationsPane.test.tsx src/__tests__/CallbackPage.test.tsx src/__tests__/premiumUpgradeButton.test.tsx src/__tests__/premiumPane.test.tsx src/__tests__/CheckoutSuccessPage.test.tsx src/__tests__/CheckoutCancelPage.test.tsx src/__tests__/useAccountDeleteOrchestrator.test.tsx src/__tests__/DeleteAccountConfirmModal.test.tsx` — PASS (97/97)
- `pnpm --filter @repo/web test -- src/routes/router.integration.test.tsx src/providers/AppProviders.test.tsx` — PASS (9/9)
- `pnpm --filter @repo/web-auth-device-session test -- src/guards.test.ts src/device-transport.test.ts src/auth-actions.test.ts` — PASS (20/20)

## Surface Matrix

| Surface | Evidence | Classification |
|---|---|---|
| AI live request / test connection | `claudeStreamAdapter.test.ts`, `secretStore.test.ts`, `AppProviders.test.tsx` | PASS |
| Map tile panel | `MapView.test.tsx` (offline fallback path) | PASS |
| Integrations connect + OAuth callback | `integrationConnectButton.test.tsx`, `integrationsPane.test.tsx`, `CallbackPage.test.tsx`, `router.integration.test.tsx` (RR1) | PASS |
| Premium upgrade + Stripe callbacks | `premiumUpgradeButton.test.tsx`, `premiumPane.test.tsx`, `CheckoutSuccessPage.test.tsx`, `CheckoutCancelPage.test.tsx`, `router.integration.test.tsx` (RR-PREMIUM-1/2) | PASS |
| Account delete offline behavior | `useAccountDeleteOrchestrator.test.tsx`, `DeleteAccountConfirmModal.test.tsx`, plus auth/session guard tests | PASS |

## Risk Register

- R-Manual-1 (`DEFERRED_OUT_OF_SCOPE`): network-disabled GUI launch of bundled app to visually confirm `/app` route and no `/auth/login` redirect.
- R-Manual-2 (`DEFERRED_OUT_OF_SCOPE`): DMG drag-install launch from `/Applications` copy (interactive step).
- R-Manual-3 (`DEFERRED_OUT_OF_SCOPE`): interactive menu actions (`Reveal Config Folder`, `Reset Main Window State`) and relaunch behavior across monitor topologies.

## RC Verdict for Build Phase

- Automated repo-side gates: `PASS`
- Repo-fixable blockers found in this run: none
- Environment/tooling blockers found in this run: none
- Deferred items: manual macOS GUI checks reserved for `feature-verify`

Build-phase handoff conclusion: implementation evidence is ready for independent `feature-verify` gate.
