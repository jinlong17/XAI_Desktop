# Discovery Review — web-todo-first-slice

| 字段 | 值 |
|---|---|
| Feature | `web-todo-first-slice` |
| 日期 | 2026-05-22 |
| 执行者 | Codex (`feature-plan` inline) |
| 外部调研 | No — current repo surfaces were sufficient |

## Problem Framing

W7 is the first row where the Web face must stop being placeholder-safe and prove the real product/data path:

- `apps/web` already has route families and browser-safe host capabilities from W6.
- `@repo/web-auth-device-session`, `web-sync-blob-driver`, and `web-encrypted-indexeddb-cache` are already shipped and define the auth/device/crypto/cache seams this row must consume.
- `/app/todos` still renders placeholder content from `apps/web/src/routes/modules/registrations.tsx`.
- `plugin-productivity` still assumes mock-first Todo behavior through `LocalStorageAdapter` or Tauri repo usage.

This row therefore must freeze:

1. where the browser Todo business logic lives
2. which Todo entity shape is the persisted source of truth
3. how list/detail selection maps to URL state
4. how delete behaves over encrypted Sync blob storage
5. how the first fixture/test pack supports later realtime/offline/search rows

## Current Repo Evidence

### Host and route seam

- `apps/web/src/routes/router.tsx`
  - already freezes `/app/:moduleId/*` as the app-module seam
- `apps/web/src/routes/modules/registrations.tsx`
  - currently maps every module to `ModuleRoutePlaceholderPage`
- `apps/web/src/routes/RouteGateElements.tsx`
  - already resolves `moduleId` and `childPath`, and injects shared browser capabilities
- `apps/web/src/host/capabilities.ts`
  - already defines browser-safe navigation and capability behavior

### Data-plane seam

- `packages/core-data/src/entities.ts`
  - already defines canonical `TodoEntity` with `title`, `done`, `labelIds`, `dueAt`, `notes`, and `projectId`
- `packages/core-data/src/sync-blob.ts`
  - already provides repository-backed encrypted `/sync/pull` + `/sync/push`
- `packages/core-data/src/indexeddb-sync-blob.ts`
  - already provides encrypted local IndexedDB backing, queue durability, health state, and search-worker seams

### Existing productivity drift

- `packages/plugin-productivity/src/types.ts`
  - defines a richer mock-first Todo shape (`status`, `priority`, `quadrant`, `pomodoroCount`, `deletedAt`, `description`)
- `packages/plugin-productivity/src/hooks/useTodoStore.tsx`
  - seeds static Todos and defaults to LocalStorage when no repo adapter is provided
- `packages/plugin-productivity/src/data/RepoAdapter.ts`
  - already shows the intended soft-delete style via `deletedAt`, but that field is not part of the current `TodoEntity` definition in `@repo/core-data`
- `packages/plugin-productivity/src/console-views.tsx`
  - desktop Console module id is `tasks`, while Web host navigation currently uses `todos`

### Upstream contract evidence

- `packages/web-auth-device-session/docs/api.md`
  - freezes device-bound request ownership and `X-Device-Id` semantics upstream
- `packages/web-sync-blob-driver/docs/api.md`
  - freezes repository contract, explicit `pull()` / `pushPending()`, and no business-table CRUD
- `packages/web-encrypted-indexeddb-cache/docs/design.md`
  - freezes encrypted durable stores and memory-only search/sort rebuilds
- `docs/planning/sub-prds/web/PRD.md`
  - freezes `/app/todos`, `/app/todos/:listId`, `/app/todos/:listId/:todoId`, Sync blob data access, and refresh/deep-link restore requirements
- `docs/planning/sub-prds/console/PRD.md`
  - freezes smart-list semantics like `smart:inbox` and `smart:done`

## No External Research Required

This row is an internal ownership-and-contract decision. The repo already contains:

- the host/router seam
- the browser auth/device seam
- the encrypted Sync blob and IndexedDB seam
- the existing productivity runtime that must be adapted

The remaining work is selecting the least risky ownership split and freezing contracts build can implement.

## Key Tensions To Resolve

### Tension 1 — persisted Todo shape drift

`@repo/core-data` and `plugin-productivity` do not currently agree on one Todo model:

- persisted syncable `TodoEntity` is minimal and TickTick-like
- current productivity store is richer but mock-first and not aligned to the shipped Web data plane

If W7 ignores this, build will either:

- fork a second Todo schema in Web code, or
- keep placeholder/mock state while pretending to use real data

### Tension 2 — module ownership versus thin host

`apps/web` already owns routing, guards, and capabilities. If W7 adds Todo state there, the host stops being a shell. The actual business module must therefore be exported from an owning package through a browser-safe public surface.

### Tension 3 — delete semantics over encrypted sync

The product requirement says delete/soft-delete, but:

- `Repo.delete(id)` in the sync driver maps to hard delete on the wire
- current productivity adapter implements user delete as a soft-delete flag

W7 must freeze whether user-facing delete in `/app/todos` is a soft-delete update or a hard-delete removal.

### Tension 4 — route identity and restore

The PRD requires:

- `/app/todos`
- `/app/todos/:listId`
- `/app/todos/:listId/:todoId`

W7 must freeze:

- which list ids exist in the first slice
- which state is encoded in URL versus local component memory
- how refresh restore works without waiting for later realtime/offline rows

## Options

### Option A — browser-safe `plugin-productivity` Web module over canonical `TodoEntity`

Shape:

- `apps/web` stays a router/host shell only
- `plugin-productivity` adds a browser-safe `/web` export for the Todo module registration and repo-backed view model/provider
- persisted record source of truth is `@repo/core-data` Todo entity over the shipped IndexedDB Sync blob repo
- W7 adapts UI/store logic to the canonical entity shape instead of inventing a second Web-only schema
- list ids are derived locally as smart lists in W7 (`smart:inbox`, `smart:today`, `smart:done`) without introducing a separate list table
- user delete is implemented as soft delete (`deletedAt`) via `repo.put(...)`; hard purge stays deferred

Pros:

- Preserves thin-host ownership.
- Reuses shipped browser data/auth/cache seams.
- Keeps Todo business logic in the owning capability package.
- Gives later rows real fixtures and a real encrypted local data path.
- Smart-list derivation satisfies W7 route requirements without opening list-entity scope.

Cons:

- Requires deliberate reconciliation between `TodoEntity` and current productivity mock types.
- Requires a browser-safe `plugin-productivity` export pattern that does not exist yet.
- Requires W7 to define a backward-compatible soft-delete field or equivalent persisted delete marker.

### Option B — implement the Todo module directly in `apps/web`

Shape:

- host route files own Todo repo creation, list derivation, CRUD state, and detail selection
- `plugin-productivity` is bypassed for the first Web slice

Pros:

- Lowest short-term implementation surface if judged by file count only.
- Avoids first-step refactor inside `plugin-productivity`.

Cons:

- Violates thin-host architecture.
- Makes later Habits/Pomodoro rows harder because Todo ownership would already be split across host and plugin.
- Encourages route-local data logic and future drift in capabilities/state contracts.

### Option C — new standalone runtime package owned by `web-todo-first-slice`

Shape:

- convert `packages/web-todo-first-slice/` from docs anchor into a real runtime package
- implement the browser Todo module there and leave `plugin-productivity` unchanged

Pros:

- Clear Web-only boundary.
- Avoids touching the existing productivity package immediately.

Cons:

- Creates a second long-lived capability owner for Todo.
- Conflicts with `docs/PLUGIN_MAP.md` and the existing `plugin-productivity` authority for the capability family.
- Makes later desktop/Web parity harder, not easier.

## Recommendation

Choose **Option A**.

This is the only option that stays coherent with the shipped W6/W4/W5 boundaries:

1. `apps/web` remains a thin host.
2. `plugin-productivity` remains the Todo capability owner.
3. `@repo/core-data` remains the only repository contract and encrypted data plane.
4. W7 produces real data and route behavior instead of another temporary mock layer.

## Frozen Decisions

### 1. Runtime ownership

- `packages/web-todo-first-slice/docs/` is the workflow anchor only.
- Runtime implementation is split across:
  - `apps/web`
    - route composition only
  - `packages/plugin-productivity`
    - Todo Web module registration, repo-backed providers/view model, business UI
  - `packages/core-data`
    - encrypted repository, IndexedDB cache, queue/search/health seams already shipped

### 2. Browser-safe package surface

- `apps/web` must consume W7 through a browser-safe public entrypoint such as `@repo/plugin-productivity/web`.
- `apps/web` must not import `plugin-productivity` root exports if those exports can pull desktop/Tauri branches transitively.
- The W7 route is mounted through the existing `WebModuleRouteRegistration` seam from W6.

### 3. Module and route identity

- Web module id stays `todos`.
- W7 owns these route shapes:
  - `/app/todos`
  - `/app/todos/:listId`
  - `/app/todos/:listId/:todoId`
- First-slice list ids are smart-list ids only:
  - `smart:inbox`
  - `smart:today`
  - `smart:done`
- Route state owns selected list and selected todo id.
- Refresh/deep-link restore must derive visible state from route params plus locally rehydrated encrypted repo state, not component-only memory.

### 4. Canonical entity strategy

- Persisted source of truth is the syncable Todo record stored through `Repository<T>`.
- W7 should align persisted shape with `@repo/core-data` Todo semantics:
  - `title`
  - `notes`
  - `dueAt`
  - `done`
  - `labelIds`
  - optional `projectId`
- W7 may add only backward-compatible optional fields that are truly required for the first real slice. No second Web-only business schema is allowed.
- Current mock-first fields like quadrant, pomodoro count, and priority are not required for W7 and should not block the first real route.

### 5. Delete semantics

- User-facing delete in W7 is **soft delete**, not immediate hard purge.
- Recommended persisted marker: optional `deletedAt?: string`.
- Default list queries exclude soft-deleted records.
- Hard delete via `Repo.delete(id)` remains an internal/deferred seam for later privacy/offline work and is not the default W7 UI action.

### 6. Read/write prerequisites

- Read path requires:
  - authenticated app route
  - device-bound fetch ready
  - encrypted repo initialized from IndexedDB Sync blob cache
- Write path additionally requires:
  - DEK unlocked/current crypto runtime ready
- W7 must surface explicit locked/not-ready states rather than silently falling back to mock storage.

### 7. Fixture strategy

- W7 should ship deterministic Todo fixtures for:
  - empty state
  - small CRUD/edit/detail state
  - 50-row restore/perf/search-prep state
- Fixtures must flow through the repository layer, not bypass it with hard-coded rendered lists.

## Proposed Implementation Shape

### Phase 1 — route and package-export seam

Files likely touched:

- `apps/web/src/routes/modules/registrations.tsx`
- `packages/plugin-productivity/src/**`
- `packages/plugin-productivity/package.json` if a `/web` export is needed

Goal:

- replace the `todos` placeholder registration with a browser-safe package-owned module registration
- keep host composition only

### Phase 2 — repo-backed Todo provider and canonical entity alignment

Files likely touched:

- `packages/plugin-productivity/src/data/**`
- `packages/plugin-productivity/src/hooks/**`
- `packages/plugin-productivity/src/types.ts`
- `packages/core-data/src/entities.ts` only if optional backward-compatible Todo fields are required

Goal:

- create one repo-backed Todo provider/view-model for browser use
- align current UI/store logic with the persisted Todo contract
- remove any W7 dependence on static seed mocks for authenticated Web flows

### Phase 3 — `/app/todos` list/detail CRUD and restore

Files likely touched:

- `packages/plugin-productivity/src/components/**`
- W7 browser route components under a browser-safe export
- targeted host integration tests in `apps/web`

Goal:

- implement create, edit title/notes, complete/uncomplete, soft delete, selection, and refresh/deep-link restore
- prove route params drive list/detail state

## Risks

- Entity-shape reconciliation may expand beyond W7 if the team tries to keep all desktop mock-first fields in the first browser slice.
- Soft-delete planning can drift if build mixes `repo.put` delete markers and `repo.delete` hard-delete semantics.
- Browser-safe export mistakes can reintroduce native/Desktop leakage into `apps/web`.
- If W7 hides locked/not-ready states behind fallback LocalStorage, later realtime/offline rows will inherit false assumptions.

## Open Questions For Review

1. Should `deletedAt` be added to the canonical `TodoEntity` now, or should W7 carry it in a narrower extended type inside `plugin-productivity` while keeping the encrypted record backward-compatible?
2. Is keeping Web `moduleId = "todos"` while desktop Console uses `tasks` acceptable for this row, or should build also include a small compatibility mapper?
3. Should W7 implement only smart lists in the first route, with user-defined lists deferred until project/label/calendar rows?
