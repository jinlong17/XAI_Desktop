# desktop-last-data-cache-polish — API / Contract Notes

## Contract Summary

This feature is a launch-state and UI-truthfulness contract, not an HTTP/API feature.

Primary surfaces:

- a browser-safe desktop-offline cache status seam for the active shell
- desktop-offline-only fallback rules for seeded data modules, including explicit unreadable-cache handling
- regression guarantees that browser/live behavior stays unchanged

## Upstream Interfaces

### Runtime-profile contract

Expected source of truth:

- `@repo/core` `resolveWebRuntimeProfile(...)`
- `@repo/core` `isDesktopPhase1OfflineRuntime(...)`

Required semantics:

- `desktop-phase1-offline` enables the cache-status UI and seeded-module fallback overrides
- `web-live` keeps current browser/demo behavior unchanged

### Storage contract

Expected source of truth:

- `@repo/plugin-web-storage` `usePref`
- direct root-key reads via `localStorage.getItem(...)` only inside browser-safe code
- lightweight validation for the three seeded targets based on current module-owned shapes only

Required scope discipline:

- no new canonical storage key family is required
- no change to existing browser storage ownership or codecs
- no repository, migration, sync, freshness, or SQLite/storage-engine drift is introduced
- module-specific validation authority stays in the owning modules

## Downstream Interfaces

### Shared shell cache-status seam

Recommended public entrypoint:

- `@repo/desktop-last-data-cache-polish/web`

Recommended exported shape:

```ts
type DesktopTrackedCacheSurface =
  | "tasks"
  | "boards"
  | "habits"
  | "pomodoro"
  | "countdown"
  | "ai";

type DesktopUnreadableCacheSurface = "tasks" | "boards" | "habits";

interface DesktopLastDataCacheSnapshot {
  runtime: "web-live" | "desktop-phase1-offline";
  hasAnyTrackedKey: boolean;
  hasReadableCachedData: boolean;
  readableSurfacesPresent: DesktopTrackedCacheSurface[];
  unreadableSurfaces: DesktopUnreadableCacheSurface[];
  bannerMode: "hidden" | "cached" | "empty" | "unreadable";
}
```

Required semantics:

- `hidden` when runtime is `web-live`
- `empty` when desktop offline runtime is active and none of the tracked root keys exist
- `unreadable` when desktop offline runtime is active and one or more targeted module payloads are present but fail lightweight validation
- `cached` when desktop offline runtime is active, no targeted unreadable payloads exist, and one or more tracked surfaces have readable cached data
- `unreadable` takes precedence over `cached`; valid cached data may still render in unaffected modules while the shell warns that some cached payloads could not be read

Explicit non-contracts:

- no authoritative `lastUpdatedAt`
- no sync/freshness timestamp
- no per-record freshness metadata
- no migration bookkeeping

### Tasks module fallback rule

Owning package:

- `@repo/plugin-web-tasks`

Required semantics:

- desktop offline runtime + absent `xai_task_cols` -> safe empty task state
- desktop offline runtime + invalid/unreadable `xai_task_cols` -> explicit unreadable-cache task state/copy
- desktop offline runtime must not present `SEED_TASK_COLS` as cached user data
- live Web keeps current seed/demo behavior

### Board workspace fallback rule

Owning package:

- `@repo/plugin-web-board-workspaces`

Supporting seam:

- `@repo/plugin-web-board-core` helper path only if needed

Required semantics:

- desktop offline runtime + absent/empty `xai_boards_v2` -> safe empty board/workspace state
- desktop offline runtime + invalid/unreadable `xai_boards_v2` -> explicit unreadable-cache board/workspace state/copy
- no automatic desktop-offline reseed of default demo boards
- live Web keeps current seed/demo behavior

### Habits fallback rule

Owning package:

- `@repo/plugin-web-habits`

Required semantics:

- desktop offline runtime + default/absent `xai_habits_state` -> stay empty
- desktop offline runtime + invalid/unreadable `xai_habits_state` -> explicit unreadable-cache habits state/copy
- no first-launch desktop-offline seed hydration
- live Web keeps current seeded first-launch behavior

## Error Semantics

- Missing tracked root keys are non-fatal and map to `bannerMode = "empty"` when no other readable/unreadable surfaces are present.
- Corrupt targeted-module data must never block route mount; the shell reports `bannerMode = "unreadable"` and the affected module renders explicit unreadable-cache state/copy instead of demo seed.
- Shared shell indicator must not crash if `localStorage` is unavailable; it should degrade to `empty`.
- Build/runtime failure to show the indicator must not block `/app` launch; it is polish, not entry gating.

## Permission Notes

- No new Tauri/browser permission surface is required for the planned approach.
- `apps/web` remains browser-safe:
  - no `@tauri-apps/*`
  - no `window.__TAURI__`
- No native command is required unless `feature-build` discovers a narrow host-side affordance need during implementation.

## Idempotency Notes

- Recomputing the shared cache snapshot is safe.
- Repeated desktop offline relaunches with the same storage state should produce the same banner mode and same safe fallback behavior.
- Browser/live launches remain idempotent with existing seed/demo behavior preserved.

## Explicit Deferrals

- freshness timestamps
- canonical cache metadata records
- migration/import bookkeeping
- offline edit queue semantics
- sync health or reconnect status
