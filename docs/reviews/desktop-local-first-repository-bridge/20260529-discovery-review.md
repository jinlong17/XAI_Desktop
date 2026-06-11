# Discovery Review - desktop-local-first-repository-bridge

> Feature: `desktop-local-first-repository-bridge`
> Date: 2026-05-29
> Executor: feature-plan (Codex, gpt-5.3-codex inline)
> Research mode: internal repo evidence only
> External research: No external research required

## 1. Problem Framing

The storage choice is already frozen and the SQLite foundation row is shipped. The remaining problem is that the active desktop app still behaves like a web app with browser-owned persistence:

- `apps/desktop/src-tauri/tauri.conf.json` builds `@repo/web` with `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline`
- `apps/web/src/App.tsx`, `apps/web/src/providers/AppProviders.tsx`, and `apps/web/src/routes/modules/shellRegistrations.tsx` show that the current product surface is the `apps/web` module graph running inside Tauri
- the active module packages persist through `@repo/plugin-web-storage` or package-local browser state

That means row `#11` must bridge the current web-owned entity surfaces into the desktop local-first repository in a way that:

- keeps browser runtime behavior intact
- does not silently perform migration/import work reserved for row `#12`
- does not move business logic into the host
- does not route implementation through deferred P3 Future desktop plugins just because they already contain experimental repo adapters

## 2. Repo Evidence

### 2.1 Foundation and runtime ownership

- `docs/adr/0012-phase3-local-first-storage.md`
  - desktop live store is SQLite
  - shared repo contract owner is `@repo/core-data`
  - browser storage remains browser-owned
  - migration/import, queue/sync, reconnect, and backup flows are deferred rows
- `packages/desktop-local-first-sqlite-foundation/docs/dev_log.md`
  - foundation row is `SHIPPED`
  - warns downstream rows not to bypass the typed seam or host-owned bootstrap contracts
- `packages/core/src/utils/runtime-profile.ts`
  - current desktop runtime discriminator is `desktop-phase1-offline`
- `apps/web/src/providers/AppProviders.tsx`
  - current host bridge mount point for desktop-only behavior
- `apps/web/src/routes/modules/shellRegistrations.tsx`
  - current active modules are stable web packages, not the older desktop plugin UI

### 2.2 Active task, habits, pomodoro, board, pet, and settings surfaces

- tasks: `packages/xai-web-tasks/src/TasksModule.tsx`
  - persists `xai_task_cols` through `usePref`
  - already has explicit desktop offline cache fallback behavior
- habits: `packages/xai-web-habits/src/HabitsModule.tsx`
  - persists `xai_habits_state`
  - emits `web:habits:checkin-recorded`
  - already has explicit unreadable desktop cache fallback behavior
- pomodoro: `packages/plugin-web-pomodoro/src/PomodoroModule.tsx`
  - persists `xai_pomodoro_sessions`
  - emits `web:pomodoro:session-finished`
- board/workspaces: `packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx`
  - persists five browser keys: boards, active board, panel state, inbox, and view selection
  - already has empty/unreadable offline cache fallbacks
- pet: `packages/xai-web-pet/src/DesktopPet.tsx`
  - persists `xai_pet_id` and `xai_pet_pos`
  - listens to `web:shell:pet-toggle`
- local settings: `packages/plugin-web-storage/src/internal/registry.ts`
  - owns the `xai_*` registry entries and `xai_pref_*` family
  - `apps/web/src/App.tsx` and settings packages consume those keys directly

### 2.3 Existing typed repository evidence

- `packages/core-data/src/types.ts`
  - canonical `Repo<T>`, `RepoRecord`, `RepoMetadata`, `MigrationPlan`, `SyncScope`
- `packages/core-data/src/entities.ts`
  - currently includes `productivity.todo`, `productivity.habit`, `project.board`, `project.card`, and others
  - does not currently define canonical repo entities for pomodoro, pet, settings, or notes
- `packages/core-data/src/desktop.ts`
  - current desktop-only export seam from the shipped foundation row

### 2.4 Existing repo-adapter experiments in non-stable desktop plugins

- `packages/plugin-productivity/src/data/RepoProvider.tsx`
- `packages/plugin-project/src/data/RepoProvider.tsx`
- `packages/plugin-pet/src/data/RepoProvider.tsx`

These are useful evidence for `createTauriRepo(...)` usage and dual localStorage/repo patterns, but they are not the active product surface:

- `docs/PLUGIN_MAP.md` marks `plugin-productivity`, `plugin-project`, and `plugin-console` as `In-Dev`
- `plugin-pet` remains under the deferred P3 Future bucket
- the Phase 1 desktop product is still the web UI wrapped by Tauri

### 2.5 Known contract gaps that the bridge must resolve

1. `plugin-project` uses `entityType: "project.project"` while `@repo/core-data` currently defines `project.board`.
2. `@repo/core-data` has no canonical pomodoro repo entity yet, while the active app persists pomodoro sessions.
3. `@repo/core-data` has no canonical pet or settings repo entities yet.
4. There is no canonical shipped note-content owner package in the active app surface.
5. `@repo/core-data` is still `In-Dev` in `docs/PLUGIN_MAP.md`, so this row must keep the seam honest and minimize hidden coupling.

## 3. Candidate Implementation Structures

### Option A - Active-surface-first desktop bridge

Bridge the current `apps/web` entity owners directly:

- package-owned bridge helpers live with the active entity packages
- shared generic repo/type work stays in `@repo/core-data`
- `apps/web/src/providers/AppProviders.tsx` mounts desktop runtime wiring only
- desktop runtime uses repo-aware read/write behavior
- browser runtime keeps existing localStorage behavior
- missing notes surface is explicitly unsupported in this row
- board auxiliary state becomes typed device-local repo records in this row instead of staying browser-only
- settings use one repo record per browser storage key so `PREF_REGISTRY` remains the canonical contract index

Pros:

- matches the actual shipped product surface
- respects host/package boundaries
- preserves stable web package ownership and browser behavior
- lets each entity family keep its own serializer/fallback logic
- reduces risk of building row `#11` on deferred or non-primary UI seams

Cons:

- requires touching several active packages
- forces early cleanup of entity-type mismatches and missing repo record types
- settings bridge needs a disciplined key/value contract rather than ad hoc per-pane logic

### Option B - Legacy desktop-plugin-first bridge

Reuse `plugin-productivity`, `plugin-project`, `plugin-pet`, and similar repo providers as the main bridge path, then later reconcile with the active web modules.

Pros:

- existing `createTauriRepo(...)` usage already exists
- repo-vs-localStorage switching pattern is already prototyped

Cons:

- targets non-stable or deferred packages instead of the active app
- risks widening the gap between the wrapped web product and older desktop plugin code
- clashes with `docs/PLUGIN_MAP.md` dependency authority
- still leaves the stable web modules unbridged

### Option C - Host-owned opaque mirror service

Put most bridge logic in `apps/web/src/providers/AppProviders.tsx` or the Tauri host and let modules keep their current storage behavior unchanged.

Pros:

- one central place to wire runtime behavior
- can hide some cross-cutting mechanics

Cons:

- leaks business logic into the host
- is harder to test by entity family
- encourages opaque mutation side effects instead of typed entity-owned bridges
- makes notes/settings/project mismatches harder to reason about

## 4. Recommendation

Recommend Option A.

### Why Option A fits this repo

- It matches the actual shipped Phase 1 desktop product: `apps/web` under Tauri.
- It keeps business logic in package owners and limits the host to bridge mounting.
- It uses the shipped SQLite foundation and `@repo/core-data` seam without inventing a second contract package.
- It preserves browser behavior cleanly because each entity package can define its own desktop runtime gating and browser fallback.
- It gives review a clean place to reject or refine unsupported surfaces such as notes.

### Boundary split

- Workflow/docs anchor only:
  - `packages/desktop-local-first-repository-bridge/docs/*`
- Shared generic contract work:
  - `packages/core-data/`
- Active entity owners:
  - `packages/xai-web-tasks/`
  - `packages/xai-web-habits/`
  - `packages/plugin-web-pomodoro/`
  - `packages/plugin-web-board-workspaces/`
  - `packages/xai-web-pet/`
  - `packages/plugin-web-storage/`
  - settings panes as consumers only where needed
- Host mount only:
  - `apps/web/src/providers/AppProviders.tsx`

### Frozen contract choices from review

1. Notes stays explicitly unsupported in row `#11`.
2. Board auxiliary state is in scope for row `#11` and must become typed repo records, not browser-only deferral.
3. Settings repo shape is one record per storage key, not grouped domain blobs.

## 5. Entity-Surface Decision Table

| Surface | Current owner / shape | Bridge decision |
|---|---|---|
| Tasks | `xai_task_cols` in `@repo/plugin-web-tasks` | Bridge in the active tasks package. Desktop runtime may read repo first, fall back to browser state when repo is empty/unreadable, and dual-write on new desktop mutations. |
| Habits | `xai_habits_state` in `@repo/plugin-web-habits` | Same pattern as tasks. Keep unreadable-cache behavior explicit. |
| Pomodoro | `xai_pomodoro_sessions` in `@repo/plugin-web-pomodoro` | Add a canonical repo record type first, then bridge sessions/state without changing event semantics. |
| Board / workspaces | multi-key browser state in `@repo/plugin-web-board-workspaces` plus `@repo/plugin-web-board-core` | Normalize project entity naming before writing repo data. Bridge auxiliary state in this row as typed device-local repo records, one persisted browser slot per record family, instead of leaving panel/inbox/view state browser-only. |
| Pet basic state | `xai_pet_id` + `xai_pet_pos` in `@repo/plugin-web-pet` | Bridge only the persisted basic state in this row. Ephemeral on/off toggle remains host/UI state unless explicitly persisted later. |
| Local settings | `PREF_REGISTRY` + `xai_pref_*` family in `@repo/plugin-web-storage` | Bridge through typed device-local settings repo records with one record per storage key (`id === browser key`), keeping `PREF_REGISTRY` as the canonical registry/codec owner and browser storage as the user-visible web contract. |
| Notes | no canonical active note-content package; only sticky-note settings/widget references exist | Treat as unsupported in this row unless review explicitly authorizes a dedicated note entity assumption. Do not invent a hidden notes product model. |

### 5.1 Board auxiliary-state contract

The active board surface persists five browser keys today. This row should bridge all five because they are part of the real desktop-facing workspace state, but it should not collapse them into opaque grouped blobs:

- `xai_boards_v2` bridges to canonical project board/card repo records after `project.board` naming is normalized.
- `xai_active_board`, `xai_board_panels`, `xai_board_inbox`, and `xai_board_view_by_id` become typed device-local repo records in the project workspace namespace.
- The auxiliary records stay separate from board/card domain records so later queue/sync rows can keep collaboration-worthy records distinct from local UI/workspace state.
- Read/write semantics still mirror the browser slots one-by-one, which keeps row `#12` migration/import deterministic and keeps browser fallback honest.

### 5.2 Settings contract

Settings must not be stored as grouped per-pane or per-domain blobs in row `#11`. The canonical shape is:

- one repo record per `PREF_REGISTRY` key already in scope for the active desktop runtime
- one repo record per concrete `xai_pref_*` key already materialized in the registry
- repo record id equals the exact browser storage key
- the registry remains the source of truth for codec/default/category/owner metadata

This matches the current `@repo/plugin-web-storage` API shape, keeps seeding/idempotency simple, and avoids introducing a second normalization layer that settings consumers do not use today.

## 6. Fallback and Failure Rules

These rules should be frozen in build, not improvised per package:

1. Browser runtime stays browser-only.
2. Desktop runtime may activate the bridge only when both conditions hold:
   - runtime profile is `desktop-phase1-offline`
   - the shipped desktop repo seam is available
3. Desktop read precedence should be:
   - repo data if present and decodable
   - browser fallback if repo is empty or unavailable
   - safe empty state if both are missing/unreadable
4. Desktop write behavior should be:
   - dual-write for supported bridged surfaces in this row
   - explicit unsupported/no-op result for notes
5. Repo bridge failures must never be silently treated as successful migration or sync.
6. No background browser-to-repo import pass belongs in this row.

## 7. Phased Build Guidance

### Phase 1 - Shared bridge contract normalization

- resolve canonical repo entity names needed by this row
- fix the `project.board` vs `project.project` mismatch before bridge writes land
- add missing typed repo entities for pomodoro, pet, settings, and board auxiliary state as required
- define bridge status/error semantics and unsupported-surface handling
- keep shared code generic and browser-safe

### Phase 2 - Productivity bridge group

- tasks bridge in `@repo/plugin-web-tasks`
- habits bridge in `@repo/plugin-web-habits`
- pomodoro bridge in `@repo/plugin-web-pomodoro`
- preserve current typed event emissions and browser storage behavior

### Phase 3 - Board and pet bridge group

- board/workspaces bridge in the stable board packages
- promote `xai_active_board`, `xai_board_panels`, `xai_board_inbox`, and `xai_board_view_by_id` to typed device-local repo records in the same row
- pet basic-state bridge in `@repo/plugin-web-pet`
- keep board cache empty/unreadable copy truthful
- keep pet scope limited to persisted basic state

### Phase 4 - Local settings bridge and desktop mount

- bridge `PREF_REGISTRY` and `xai_pref_*` writes through one-record-per-key typed settings repo records
- mount desktop runtime bridge wiring from `AppProviders` only
- keep settings panes as consumers, not bridge owners
- keep notes explicitly unsupported unless review changes the assumption

### Phase 5 - Verification and scope audit

- run `@repo/core-data` tests and type checks
- run affected stable web package tests and package type checks where available
- run explicit browser-safety integration gates for the wrapped web runtime, not just dist build
- run browser-safe `@repo/web` test, type-check, and build gates
- run `desktop tauri build --debug --bundles app`
- verify no row `#12` / `#13` / `#14` / `#17` work leaked in

## 8. Risks

1. Notes has no canonical shipped owner package. If review wants real note persistence now, the row scope must explicitly bless a note model rather than hiding it.
2. The `project.board` vs `project.project` mismatch can corrupt cross-row assumptions if it is not normalized before build starts.
3. Settings bridging is broad because `plugin-web-storage` spans many keys; build must avoid one-off per-pane storage logic.
4. If build treats browser fallback as migration, row `#12` loses its clean responsibility boundary.
5. If repo writes happen without explicit error surfacing, later queue/reconnect rows will inherit false-success semantics.

## 9. Review Checkpoints

1. Confirm the row `#11` freeze that notes remains unsupported and does not reopen hidden note-model scope.
2. Confirm board auxiliary state stays in row `#11` as typed device-local repo records rather than browser-only deferral.
3. Confirm settings repo shape stays one-record-per-key with `PREF_REGISTRY` as canonical metadata owner.
4. Confirm the added browser-safety gates are sufficient for `board-core`, `board-workspaces`, `plugin-web-storage`, `settings-shell`, `settings-rest`, `@repo/web`, and the desktop bundle path.
