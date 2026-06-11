# desktop-last-data-cache-polish — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option A — shared desktop-offline cache indicator with explicit `unreadable` mode plus targeted desktop-only absent/corrupt fallback rules for seeded modules |
| Review Doc Path | `docs/reviews/desktop-last-data-cache-polish/20260528-discovery-review.md` |
| Review Date/Version | 2026-05-28 |
| Feature Type | P1 Phase 2 desktop launch/cache display polish on top of the shipped normal-window Tauri host |

## Frozen Assumptions

- The active desktop product remains the ADR-0011 normal-window Tauri wrapper around `apps/web`; overlay/control/grid surfaces stay quarantined.
- `desktop-web-auth-offline-mode` and `web-external-runtime-offline-gates` remain the owners of offline `/app` entry and online-only runtime degradation respectively.
- This row must not introduce a new canonical storage layer, migration path, edit queue, sync log, or conflict model.
- Browser/live Web storage semantics remain unchanged when `VITE_WEB_RUNTIME_PROFILE` is absent or resolves to `web-live`.
- Shared shell status may inspect existing root keys plus lightweight `absent | readable | unreadable` validation for the three seeded targets; it must not introduce freshness, sync, or migration metadata.
- The active board route is the workspace wrapper (`@repo/plugin-web-board-workspaces`), not the legacy board-core-only route.
- Current demo/seed fallbacks are acceptable on the browser/demo path but must not masquerade as last-known user data on desktop offline launch.
- `@repo/plugin-web-calendar` sample data remains intentionally labeled sample data and is out of scope for this row.

## Dependency Overview

- Upstream authority:
  - `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md` row #7
  - `docs/reviews/desktop-last-data-cache-polish/20260528-feature-brief.md`
  - `docs/adr/0011-p1-react-tauri-local-first-hybrid.md`
- Shared runtime/storage seams:
  - `@repo/core` runtime-profile helpers
  - `@repo/plugin-web-storage`
  - `apps/web` shell composition
  - `@repo/xai-web-shell`
- Owning active module surfaces:
  - `@repo/plugin-web-tasks`
  - `@repo/plugin-web-board-workspaces`
  - `@repo/plugin-web-board-core` helper seam only as needed
  - `@repo/plugin-web-habits`

## Native / Web Shape After This Feature

- No new native command or host-only storage subsystem is required for the core plan.
- The active Web shell shows an explicit desktop-offline cache state.
- Desktop offline launch uses:
  - cached persisted user data where present
  - safe empty states where cache is absent
  - explicit unreadable-cache warning/state where targeted cached payloads are malformed
- Browser/live launches keep the current seed/demo behavior unchanged.

## Ownership Shape

Recommended owning slice:

- `packages/desktop-last-data-cache-polish/`

Recommended responsibilities:

- browser-safe `/web` helper or provider
- shared cache-state badge/banner UI
- tracked-key summary plus lightweight unreadable-cache classification for the desktop offline shell

Recommended owning-module responsibilities:

- tasks decide whether `xai_task_cols` is absent, readable, or unreadable and expose matching UI state
- board-workspaces decide whether `xai_boards_v2` is absent, readable, or unreadable and expose matching UI state
- habits decide whether `xai_habits_state` is absent, readable, or unreadable and expose matching UI state

## Planned Runtime Split

### Phase 1 — Shared Cache Status Contract

- Add a browser-safe desktop-offline cache status seam in the active shell.
- Use `resolveWebRuntimeProfile(...)`.
- Track readable presence for:
  - tasks
  - boards
  - habits
  - pomodoro
  - countdown
  - AI chat
- Prioritize `unreadable` when one or more of tasks/boards/habits has malformed cached data.
- Render nothing in live Web runtime.

### Phase 2 — Tasks and Board Safe Fallback

- Replace desktop-offline seed/demo fallback with absent/corrupt-specific behavior for:
  - `@repo/plugin-web-tasks`
  - `@repo/plugin-web-board-workspaces`
- Keep valid existing cached state rendering unchanged.
- Freeze: absent cache -> safe empty state; unreadable cache -> explicit unreadable-copy/state.
- Keep browser/live demo behavior unchanged.

### Phase 3 — Habits Safe Fallback

- Prevent default-state seed hydration on desktop offline launch when no valid habits cache exists.
- Freeze: absent/default cache -> safe empty state; unreadable cache -> explicit unreadable-copy/state.
- Keep browser/live seeded first-launch behavior unchanged.

### Phase 4 — Verification and Copy Polish

- Add regression tests for cached-present, cache-absent, and cache-corrupt launch paths.
- Verify the shell indicator text aligns with actual behavior, including unreadable-mode priority.
- Record manual macOS offline relaunch expectations.

## Explicit Deferrals

- No timestamped freshness model
- No canonical desktop repository
- No Web-to-desktop import/migration
- No offline edit semantics or sync behavior change
- No service-worker/PWA fetch cache work
