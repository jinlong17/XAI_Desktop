# Discovery Review — desktop-last-data-cache-polish

## Problem Framing

Phase 1 already solved offline desktop `/app` entry. The remaining Phase 2 gap is not "can the app launch?" but "does the launch truthfully present last-known data?"

Current repo reality:

- the desktop app already launches `apps/web` offline under `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline`
- `@repo/plugin-web-storage` `usePref` gives synchronous localStorage-backed reads, so many modules already reopen to prior state without extra infrastructure
- several active modules already validate persisted state and safely fall back to empty/default values
- but some active modules still treat missing or malformed storage as a signal to seed demo/default content

That seeded/demo behavior is acceptable on the browser/demo path, but it is misleading on a desktop offline relaunch. Users can read seeded tasks/boards/habits as "last-known data" even when there is no real cache.

The planning problem is therefore narrow:

1. surface a shared desktop-offline cached-data status in the current shell
2. stop seeded/demo fallbacks from masquerading as last-known user data on desktop offline launch
3. keep browser/live Web behavior and existing storage contracts unchanged

## Naming Rationale

Keep the roadmap slug `desktop-last-data-cache-polish`.

Why it fits:

- `desktop` keeps the scope on the Tauri/macOS app on `dev`
- `last-data-cache` describes reuse of existing Web-side persisted data
- `polish` matches the real task: display/resilience cleanup, not storage architecture

## External Research

No external research required. This is an internal runtime/profile/storage-seam decision.

## Current Seam Inventory

### Already-safe persisted readers

- `@repo/plugin-web-pomodoro`
  - reads `xai_pomodoro_sessions`
  - narrows invalid entries and otherwise falls back to `[]`
- `@repo/plugin-web-countdown`
  - reads `xai_countdowns`
  - filters invalid entries and otherwise falls back to `[]`
- `@repo/plugin-web-ai-chat`
  - reads `xai_ai_convos`
  - missing/corrupt storage does not block mount
- `@repo/plugin-web-statistics`
  - reads pomodoro/habits/week-start state via `usePref`
  - already narrows invalid shapes to safe empties

### Seed/demo fallbacks that are unsafe for desktop offline truthfulness

- `@repo/plugin-web-tasks`
  - invalid or absent `xai_task_cols` falls back to `SEED_TASK_COLS`
- `@repo/plugin-web-board-workspaces`
  - absent/invalid/empty `xai_boards_v2` falls back to `makeDefaultBoards()`
- `@repo/plugin-web-habits`
  - default/empty state hydrates `buildSeedState()` on first mount

### Surfaces that should remain unchanged

- `@repo/plugin-web-calendar`
  - intentionally sample-data driven and already labeled as sample data
- `desktop-web-auth-offline-mode`
  - owns offline `/app` entry, not data cache presentation
- `web-external-runtime-offline-gates`
  - owns online-only external-runtime degradation, not persisted user-data labeling

## Candidate Options

### Option A — Shared desktop-offline cache indicator plus targeted desktop-only safe fallbacks

Use the existing runtime profile and storage seams to add:

- a shared shell-level desktop-offline cache indicator
- targeted desktop-only empty/corrupt fallback behavior in the modules that still seed demo/default content

Recommended split:

- feature-owned browser-safe shell helper in `packages/desktop-last-data-cache-polish/`
  - mounted from the active Web app path
  - uses `resolveWebRuntimeProfile(...)`
  - inspects only existing root storage keys plus lightweight validators for the three seeded targets
  - renders explicit desktop-offline status such as:
    - cached local data available
    - no cached data yet
    - one or more cached payloads unreadable
- owning modules keep their own validation/fallback logic
  - tasks, board-workspaces, and habits add desktop-offline-specific absent/corrupt branches
  - browser/live path keeps current demo/seed behavior unchanged

Pros:

- smallest phase-clean change
- no new storage architecture
- respects package ownership
- makes desktop offline state truthful at launch
- closes the false-positive cached-data banner gap for malformed payloads
- directly matches the required acceptance signals

Cons:

- requires touching more than one module because the current unsafe behavior is distributed
- the shell helper needs a narrow validation-status contract for the three targeted seeded modules

### Option B — Per-module ad hoc fixes only

Patch tasks, board-workspaces, and habits individually without any shared desktop-offline shell status.

Pros:

- smallest file count
- no new shared package boundary

Cons:

- users still get no shared "cached vs empty" launch signal
- repeated copy/behavior drift across modules
- weaker product explanation of why some modules are empty while others reopen cached state

### Option C — Start Phase 3 local-first metadata now

Add a canonical local desktop store, migration metadata, or explicit last-sync timestamps so every module can report structured freshness.

Pros:

- strongest long-term model

Cons:

- directly violates the Phase 2 boundary
- introduces repository/migration/sync architecture that belongs to Phase 3 rows
- much larger verification and data-safety surface

## Recommendation

Choose Option A.

The correct Phase 2 move is:

> add one shared desktop-offline cache presentation seam, then make the current seeded modules fail safe on desktop offline launch instead of inventing new storage.

This keeps last-known display polish inside existing Web persistence seams and explicitly defers real freshness, migration, and sync semantics to Phase 3.

## Recommended Architecture

### 1. Shared shell-level desktop-offline cache indicator

Recommended owning slice:

- `packages/desktop-last-data-cache-polish/`

Recommended responsibility:

- browser-safe `/web` entrypoint or helper
- runtime-profile-aware shell badge/banner
- tracked-key summary plus lightweight unreadable-cache classification for the three targeted seeded modules

Recommended tracked keys:

- `xai_task_cols`
- `xai_boards_v2`
- `xai_habits_state`
- `xai_pomodoro_sessions`
- `xai_countdowns`
- `xai_ai_convos`

Recommended shell behavior:

- render nothing in `web-live`
- in `desktop-phase1-offline`:
  - if no tracked keys exist: show "Offline - no cached data yet"
  - if one or more targeted seeded-module payloads are present but unreadable: show "Offline - some cached data could not be read"
  - otherwise, if one or more tracked surfaces have readable cached data: show "Offline - showing cached local data where available"

Unreadable mode takes priority over cached mode. That keeps the shell truthful even when one module falls back to an unreadable state while another still renders valid local data.

### 2. Targeted safe-fallback fixes in seeded modules

#### Tasks

Current issue:

- `xai_task_cols` absent/invalid -> `SEED_TASK_COLS`

Recommended desktop-offline behavior:

- absent cache -> empty task columns or explicit first-use empty state
- invalid/unreadable cache -> explicit unreadable-cache state/copy for tasks, not silent empty fallback
- never present demo seed as cached last-known tasks
- browser/live behavior remains unchanged

#### Board workspaces

Current issue:

- `xai_boards_v2` absent/invalid/empty -> `makeDefaultBoards()`

Recommended desktop-offline behavior:

- absent/empty cache -> safe empty board/workspace state
- invalid/unreadable cache -> explicit unreadable-cache state/copy for boards
- no automatic re-seeding of default demo boards on offline desktop launch
- keep active route ownership on `@repo/plugin-web-board-workspaces`; do not reopen legacy board-only routing

#### Habits

Current issue:

- default/empty state auto-seeds `buildSeedState()`

Recommended desktop-offline behavior:

- absent/default cache -> no first-launch seed hydration; render empty habits state instead
- invalid/unreadable cache -> explicit unreadable-cache state/copy for habits
- browser/live behavior remains unchanged

### 3. Corrupt-cache handling is shared at the shell summary level and explicit in each affected module

The shell summary must not guess from root-key presence alone, but it also should not import other packages' internals.

Therefore:

- lightweight cache-status helpers live behind package-owned boundaries for the three seeded modules, or are re-expressed as narrow public predicates that expose only `absent | readable | unreadable`
- explicit corrupt-cache UI/state stays in:
  - `@repo/plugin-web-tasks`
  - `@repo/plugin-web-board-workspaces` / supporting board helpers
  - `@repo/plugin-web-habits`

That boundary avoids cross-package internal imports, keeps storage semantics with the owners, and still gives the shared shell a truthful unreadable-cache mode without Phase 3 metadata.

## Recommended Implementation Phases

### Phase 1 — Shared desktop-offline cache status seam

Goal:

- add a browser-safe shell-level offline/cached-data indicator with zero storage-contract changes

Primary files:

- `packages/desktop-last-data-cache-polish/`
- `apps/web/src/App.tsx` or `apps/web/src/providers/AppProviders.tsx`
- `packages/xai-web-shell/src/{Shell,Topbar,types}.tsx`

Stop condition:

- desktop offline runtime shows a shared cached-data, empty-data, or unreadable-cache indicator
- live Web shows nothing new

### Phase 2 — Tasks and board-workspaces safe fallback

Goal:

- replace misleading seeded/demo fallback with safe empty-state behavior for the two highest-risk active data surfaces

Primary files:

- `packages/xai-web-tasks/src/TasksModule.tsx`
- `packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx`
- supporting board persistence helpers only if needed

Stop condition:

- valid persisted data still renders
- absent desktop-offline cache no longer becomes demo tasks or demo boards
- corrupt desktop-offline cache shows explicit unreadable-copy/state for the affected module

### Phase 3 — Habits seed-hydration override and copy polish

Goal:

- align habits with the same desktop-offline truthfulness rule

Primary files:

- `packages/xai-web-habits/src/internal/usePersistedHabits.ts`
- any small empty-state/callout component or strings required by the module

Stop condition:

- offline desktop launch with missing habits cache does not auto-seed demo habits
- unreadable habits cache shows explicit unreadable-copy/state

### Phase 4 — Regression and launch verification

Goal:

- prove offline launch stays unblocked and browser/live behavior is unchanged

Primary files/tests:

- affected package tests
- `apps/web` integration coverage
- desktop build gate evidence

Stop condition:

- automated gates cover cached-present, cache-absent, cache-corrupt, and live-web-regression scenarios

## Risks

- If the desktop-only fallback condition is too broad, browser/live demo behavior may regress.
- If it is too narrow, users may still see demo seed data and mistake it for last-known cache.
- Board empty-state handling is slightly trickier than tasks because current board helpers assume a non-empty board array.
- Real macOS offline relaunch behavior still requires manual verification beyond browser/unit proof.

## Open Questions

- Should the shell indicator be a topbar badge only, or badge plus inline banner? Recommendation: badge plus a lightweight inline banner in desktop offline runtime so the first launch state is explicit.
- Should the shared shell indicator attempt corruption detection? Recommendation: yes, but only for the three seeded Phase 2 targets through lightweight `absent | readable | unreadable` checks. No per-record freshness or sync metadata.
- Should calendar sample data be included in the cached-data summary? Recommendation: no. Keep calendar as intentionally sample-labeled prior art and exclude it from the tracked last-known data set.
- Should this row add timestamps such as "last synced" or "last updated"? Recommendation: no. Current storage contracts do not expose authoritative freshness metadata; defer that to Phase 3.

## Explicit Phase 3 Deferrals

Deferred to later rows:

- canonical local-first repository
- Web-to-desktop data migration/import
- local mutation queue or offline edit queue
- reconnect sync
- conflict handling
- authoritative freshness timestamps or sync metadata
- desktop-primary storage engine selection
