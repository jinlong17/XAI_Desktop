# desktop-calendar-sync-degraded-mode - Test Strategy

## Test Goals

Prove that the desktop calendar surface remains locally usable offline while provider-backed sync stays explicitly online-only and reconnect-aware.

## Unit Coverage

### Shared contract / bridge

- `calendar.provider_state` typing and codec/hydration helpers
- separation of local calendar state from provider sync state
- reconnect-needed flag transitions
- last-attempt / last-success / last-failure persistence semantics

### Calendar UI

- local calendar surface still renders/navigates when provider state is offline
- degraded-mode banner/badge logic is driven by provider state, not by local calendar prefs
- no offline state claims provider success

### Settings / integrations UI

- `gcal` connect/refresh controls distinguish `connected` from `syncable`
- offline runtime disables provider sync actions with explicit messaging
- reconnect-needed state renders distinctly from fully synced/ready state

### Reconnect glue

- desktop runtime only exposes calendar reconcile behavior when desktop/local-first runtime gates are active
- successful reconcile clears reconnect-needed state
- failed reconcile preserves durable failure metadata

## Contract Coverage

- browser runtime remains unchanged
- desktop offline runtime keeps local calendar state usable
- provider sync remains online-only
- offline action does not mint fake outbox/provider success
- reconnect uses shipped row `#14` gating semantics rather than a host-only parallel state machine

## E2E / Regression Scenarios

- desktop offline launch with existing local calendar prefs and provider connected flag
- desktop offline launch with reconnect-needed provider state already persisted
- desktop reconnect after offline-disabled provider action
- desktop runtime with missing transport/account/device gates
- browser runtime with no desktop bridge available
- calendar reminders from `desktop-native-notifications-reminders` still behave as local reminder projection, not provider sync proof

## Mock Strategy

- `@repo/core-data/testing` or existing in-memory repo helpers for provider-state records
- `@repo/plugin-web-storage` tests inject desktop repo and reconnect doubles
- `@repo/plugin-web-calendar` tests use provider-state fixtures plus existing local calendar fixtures
- `@repo/plugin-web-settings-rest` tests keep OAuth/provider transport stubbed; this row is about degraded mode and status separation, not real token exchange
- `@repo/web` integration tests verify runtime gating only

## Verification Gates

- `pnpm --filter @repo/core-data test`
- `pnpm --filter @repo/core-data check-types`
- `pnpm --filter @repo/plugin-web-storage test`
- `pnpm --filter @repo/plugin-web-storage check-types`
- `pnpm --filter @repo/plugin-web-calendar test`
- `pnpm --filter @repo/plugin-web-calendar check-types`
- `pnpm --filter @repo/plugin-web-settings-rest test`
- `pnpm --filter @repo/plugin-web-settings-rest typecheck`
- `pnpm --filter @repo/web test`
- `pnpm --filter @repo/web check-types`
- `pnpm --filter @repo/web build`
- `pnpm --filter desktop tauri build --debug --bundles app`

## Acceptance Criteria

| ID | Criterion |
|---|---|
| AC-1 | Local calendar state remains usable offline in desktop runtime |
| AC-2 | Provider sync state is stored and rendered separately from local calendar state |
| AC-3 | Offline provider actions are clearly disabled or marked for reconnect follow-up without claiming offline success |
| AC-4 | Reconnect reconciliation uses shipped repository bridge/reconnect semantics and updates durable provider-state records |
| AC-5 | Browser-safe `@repo/web` gates still pass |
| AC-6 | Desktop bundle still builds with the degraded-mode wiring enabled |

## Manual Smoke Targets

- launch desktop with `desktop-phase1-offline`; open calendar and verify local month/week/day state still works while provider controls show offline-disabled messaging
- while offline, trigger a provider sync affordance and verify no success state is shown
- restore connectivity, rerun reconnect/reconcile, and verify provider state updates without breaking local calendar prefs
- confirm Settings → Integrations and the calendar surface present the same provider degraded/reconnect story

