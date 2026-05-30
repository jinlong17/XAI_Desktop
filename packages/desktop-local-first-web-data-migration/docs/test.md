# desktop-local-first-web-data-migration - Test Strategy

## Test Goals

Prove that representative browser data can be imported into the desktop local-first store safely, repeatably, and observably, without corrupting pure Web browser behavior or leaking into later Phase 3 rows.

## Unit Coverage

### Shared import contract

- import ledger record shapes and boundary-key rules
- stable fingerprint generation per surface
- unchanged-source no-op detection
- stale imported-id reconciliation logic
- skipped IndexedDB inventory reporting

### Representative surface importers

- tasks projection and reconcile
- habits projection and reconcile
- pomodoro projection and replace
- board/card projection and reconcile
- board auxiliary per-slot replace
- pet per-slot replace
- settings present-key import rules
- notes unsupported path

## Contract Coverage

- first-run scan is read-only
- explicit import writes only in desktop runtime
- browser source is never removed or mutated
- unchanged-source reruns do not rewrite repo timestamps
- corrupt-source paths do not delete previously imported good desktop records
- boundary mismatch suppresses silent auto execution
- browser-owned IndexedDB stores are surfaced as skipped, not imported

## E2E / Regression Scenarios

- empty desktop repo + existing browser representative data -> scan reports eligible surfaces
- explicit import after that scan -> canonical repo surfaces populated
- rerun against unchanged source -> all affected surfaces report `unchanged`
- rerun after changing one surface in browser storage -> only that surface reconciles
- one corrupt localStorage surface + other healthy surfaces -> corrupt one skipped, healthy ones still import
- existing imported boundary key differs from current boundary -> first-run auto execution suppressed
- browser runtime (`web-live`) -> no import wiring, no repo mutation
- browser-owned IndexedDB stores remain intact and are only reported as skipped
- desktop app bundle still builds with import wiring present

## Mock Strategy

- `@repo/core-data/testing` or in-memory repo doubles for import reconcile tests
- fake browser `localStorage` fixtures for source inventory and corruption cases
- fake session/auth context for boundary-key cases
- fake IndexedDB store-name inventory for skipped-store assertions
- `AppProviders` tests verify mount/trigger only, not per-surface serialization logic

## Verification Gates

- `pnpm --filter @repo/core-data test`
- `pnpm --filter @repo/core-data check-types`
- `pnpm --filter @repo/plugin-web-storage test`
- `pnpm --filter @repo/plugin-web-storage check-types`
- `pnpm --filter @repo/plugin-web-tasks test`
- `pnpm --filter @repo/plugin-web-habits test`
- `pnpm --filter @repo/plugin-web-pomodoro test`
- `pnpm --filter @repo/plugin-web-board-core test`
- `pnpm --filter @repo/plugin-web-board-workspaces test`
- `pnpm --filter @repo/plugin-web-pet test`
- `pnpm --filter @repo/plugin-web-settings-shell test`
- `pnpm --filter @repo/plugin-web-settings-rest test`
- `pnpm --filter @repo/web test`
- `pnpm --filter @repo/web check-types`
- `pnpm --filter @repo/web build`
- `pnpm --filter desktop tauri build --debug --bundles app`

## Acceptance Criteria

| ID | Criterion |
|---|---|
| AC-1 | First-run scan inventories representative browser data without mutating browser or repo state |
| AC-2 | Explicit import writes representative data into the row `#11` canonical repo targets |
| AC-3 | Unchanged-source reruns are no-ops and keep repo timestamps stable |
| AC-4 | Changed-source reruns reconcile imported rows safely per surface |
| AC-5 | Corrupt or skipped surfaces are observable and do not destroy good desktop data |
| AC-6 | Browser-owned IndexedDB auth/cache/secret stores are reported and skipped |
| AC-7 | Notes remains explicitly unsupported unless review re-scopes it |
| AC-8 | Browser-safe web and desktop build gates still pass |
