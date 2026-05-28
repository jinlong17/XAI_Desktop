# Feature Brief — desktop-last-data-cache-polish

| Field | Value |
|---|---|
| Feature | desktop-last-data-cache-polish |
| Title | Phase 2 Desktop Last-known Data Cache Polish |
| Date | 2026-05-28 |
| Source | Roadmap row #7 seed brief `docs/reviews/desktop-last-data-cache-polish/20260528-roadmap-seed.md` on `dev` |
| Executor | feature-plan (Codex, gpt-5.4 inline) |

## Requirement

Ensure the desktop app opens offline with last-known user data where current Web storage already has it, while failing safely when cached data is absent or corrupt.

This row is polish only:

- no new local-first repository
- no migration system
- no edit queue or sync log
- no conflict model
- no SQLite or Phase 3 storage architecture

The active product remains the shipped ADR-0011 normal-window Tauri app around `apps/web`; this feature must not revive transparent overlay, control, or grid startup paths.

## Naming Rationale

The provided slug already matches the job:

- `desktop` — scope is the native macOS/Tauri app on `dev`
- `last-data-cache` — the job is last-known display from existing local cache seams, not new storage infrastructure
- `polish` — the work is presentation/resilience cleanup around current Phase 2 behavior, not a Phase 3 local-first rewrite

## Scope

- A shared desktop-offline cached-data indicator in the active Web shell
- Desktop-only safe fallback behavior for active data modules that currently seed demo/default content when storage is empty or invalid
- Clear distinction between:
  - cached local user data present
  - no cached data yet
  - one or more targeted cached payloads unreadable, so the shell shows an unreadable-cache warning and the affected modules show explicit corrupt-cache state instead of demo/default seed
- Reuse of existing Phase 1/2 seams:
  - `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline`
  - `@repo/plugin-web-storage` `usePref` / localStorage contract
  - current owning module validation logic

## Non-goals

- No new repository, migration, sync, queue, rollback, or conflict behavior
- No browser Web storage-contract change
- No service-worker/PWA fetch cache work
- No new desktop auth/session mode
- No native status-bar dependency on `desktop-statusbar-quick-actions`
- No overlay/control/grid revival
- No Phase 3 import of browser data into a new canonical desktop store

## Acceptance

- Planning artifacts exist for this feature: brief, discovery review, design, api, test, and dev_log
- The selected plan defines:
  - where the desktop-offline cached-data indicator lives
  - which current module fallbacks are unsafe for desktop offline launch
  - how absent cache becomes a safe empty state instead of demo/default seed
  - how corrupt cache becomes an explicit unreadable-cache warning/state instead of a silent empty fallback
  - how browser/live behavior remains unchanged
  - what is explicitly deferred to Phase 3
- Verification requirements cover:
  - desktop offline `/app` launch is not blocked
  - valid existing localStorage-backed data still renders where present
  - absent/corrupt cache paths stay safe
  - browser/live Web behavior is not regressed

## Current Baseline

- `desktop-web-auth-offline-mode` is SHIPPED and desktop dev/build injects `VITE_WEB_AUTH_MODE=mock-authenticated`
- `web-external-runtime-offline-gates` is SHIPPED and desktop dev/build injects `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline`
- `@repo/plugin-web-storage` `usePref` already gives synchronous localStorage reads plus same-tab/cross-tab updates
- Several active user-data modules already reopen from existing local storage safely:
  - pomodoro via `xai_pomodoro_sessions`
  - countdown via `xai_countdowns`
  - AI chat via `xai_ai_convos`
  - statistics via persisted pomodoro/habits state
- The current desktop-offline truthfulness gap is concentrated in modules that still seed demo/default data when storage is absent or invalid:
  - `@repo/plugin-web-tasks` falls back to `SEED_TASK_COLS`
  - `@repo/plugin-web-board-workspaces` and `@repo/plugin-web-board-core` fall back to `makeDefaultBoards()`
  - `@repo/plugin-web-habits` hydrates `buildSeedState()` on first launch/default state
- `@repo/plugin-web-calendar` intentionally shows sample data with an explicit sample banner already; that is prior art, not a last-known user-data cache surface

## Deferred Validation

- `pnpm --filter @repo/web build`
- `pnpm --filter desktop tauri build --debug --bundles app`
- Manual macOS verification for:
  - offline relaunch with prior cached data
  - offline relaunch after storage clear
  - offline relaunch after deliberate storage corruption of selected keys
  - no overlay/control/grid behavior returns during launch
