# desktop-last-data-cache-polish — Test Plan

## Validation Goals

- Confirm desktop offline `/app` launch is not blocked.
- Confirm existing localStorage-backed user data still renders where present.
- Confirm missing/corrupt cache no longer renders seeded demo data on desktop offline launch for the targeted modules.
- Confirm corrupt targeted cache is surfaced explicitly as unreadable, not silently treated as cached or empty.
- Confirm browser/live Web behavior is unchanged.

## Contract Checks

- shared shell seam
  - renders a desktop-offline cache indicator only in `desktop-phase1-offline`
  - distinguishes cached-data-present vs no-cached-data vs unreadable-cache
- targeted modules
  - tasks does not use `SEED_TASK_COLS` for desktop-offline absent/corrupt cache
  - board-workspaces does not use `makeDefaultBoards()` for desktop-offline absent/corrupt/empty cache
  - habits does not seed `buildSeedState()` for desktop-offline default/invalid cache
  - corrupt targeted cache produces explicit unreadable-copy/state in the affected module
- unchanged surfaces
  - pomodoro/countdown/AI/statistics keep their existing safe persisted-read behavior
  - browser/live demo behavior remains unchanged

## Automated Checks

- `pnpm --filter @repo/web build`
- `pnpm --filter desktop tauri build --debug --bundles app`
- affected package/unit suites:
  - `pnpm --filter @repo/plugin-web-tasks test`
  - `pnpm --filter @repo/plugin-web-board-workspaces test`
  - `pnpm --filter @repo/plugin-web-habits test`
  - any new feature-owned package tests if `packages/desktop-last-data-cache-polish/` gains a testable `/web` surface

## Web / Shell Coverage

### Shared desktop-offline cache indicator

- desktop offline runtime + one or more readable tracked surfaces present and no unreadable targeted caches -> cached-data indicator shown
- desktop offline runtime + no tracked root keys present -> no-cached-data indicator shown
- desktop offline runtime + unreadable tasks/boards/habits payload present -> unreadable-cache indicator shown
- desktop offline runtime + both valid cached data and unreadable targeted payloads -> unreadable-cache indicator still wins
- live Web runtime -> indicator hidden
- `localStorage` unavailable or empty -> indicator degrades safely without throw

Suggested coverage:

- `apps/web` shell-level integration test or focused component test
- feature-owned `/web` helper test if a dedicated package exports the snapshot/banner logic

## Module Coverage

### Tasks

- valid `xai_task_cols` renders persisted tasks in desktop offline runtime
- absent `xai_task_cols` in desktop offline runtime -> safe empty state, not `SEED_TASK_COLS`
- malformed `xai_task_cols` in desktop offline runtime -> explicit unreadable task state/copy, not `SEED_TASK_COLS`
- live Web with absent/malformed `xai_task_cols` still follows the current seed/demo path

### Board workspaces

- valid `xai_boards_v2` renders persisted boards in desktop offline runtime
- absent `xai_boards_v2` in desktop offline runtime -> safe empty board/workspace state
- malformed `xai_boards_v2` in desktop offline runtime -> explicit unreadable board/workspace state/copy
- empty `xai_boards_v2` in desktop offline runtime -> safe empty board/workspace state
- live Web keeps the current seeded/default-board behavior

### Habits

- valid `xai_habits_state` renders persisted habits in desktop offline runtime
- default/absent `xai_habits_state` in desktop offline runtime -> no seed hydration, safe empty state
- malformed `xai_habits_state` in desktop offline runtime -> explicit unreadable habits state/copy
- live Web keeps the current seeded first-launch behavior

## Route / Launch Coverage

- desktop offline root launch still redirects to `/app`
- shell indicator and targeted module empty/cached/unreadable states can coexist with the shipped offline-auth and runtime-gates behavior
- no route or router regression for unaffected modules

Suggested coverage:

- extend `apps/web/src/routes/router.integration.test.tsx` only if route-level evidence is the most efficient place
- otherwise keep most behavior in package-level tests plus one shell integration test

## Manual macOS Smoke

- launch the built desktop app offline after a session with persisted tasks/boards/habits/pomodoro data
  - `/app` loads
  - shared shell indicator says cached local data is being shown
  - prior data appears where present
- launch offline after clearing tracked keys
  - `/app` loads
  - shared shell indicator says no cached data yet
  - tasks/boards/habits show safe empty states
- launch offline after corrupting one or more tracked keys
  - `/app` loads
  - shared shell indicator says some cached data could not be read
  - affected modules show explicit unreadable-cache state instead of seeded demo state
  - no crash or route block
- verify no overlay/control/grid startup behavior returns

## Mock Strategy

- use real `localStorage` in jsdom-backed tests
- gate desktop behavior by stubbing `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline`
- do not mock `usePref` unless a package already uses that pattern; prefer real registry-backed reads
- keep corruption tests explicit by seeding malformed raw localStorage values where the owning module reads them

## Residual Risks

- board empty-state handling may need small helper surgery because current helper flow assumes a non-empty board array
- browser/live regression risk is highest in tasks and habits because both currently seed intentionally on first launch
- final confidence still requires a real macOS offline relaunch of the bundled app
