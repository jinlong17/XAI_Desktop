# web-todo-first-slice — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option A — keep `packages/web-todo-first-slice/docs/` as the workflow anchor, keep `apps/web` as thin route assembly, and implement the real `/app/todos` browser module through a browser-safe `plugin-productivity` export backed by `@repo/core-data` encrypted Sync blob repositories |
| Review Doc Path | `docs/reviews/web-todo-first-slice/20260522-discovery-review.md` |
| Review Date/Version | 2026-05-22 |
| Feature Type | W7 first real Web product slice |
| Roadmap | `web-ticktick-parity` · feature #11 · W7 |

## Frozen Assumptions

- `packages/web-todo-first-slice/docs/` is the workflow anchor only; runtime code does not live under this package.
- `apps/web` remains host-only and consumes the Todo module through a browser-safe package export and the existing `WebModuleRouteRegistration` seam.
- `plugin-productivity` remains the Todo capability owner for this slice; W7 does not create a second long-lived Web-only Todo owner.
- `@repo/core-data` remains the only repository/data-driver contract. W7 does not introduce a second browser data abstraction.
- Persisted Todo records must be compatible with the syncable `TodoEntity` contract and encrypted Sync blob pipeline.
- W7 route identity is `todos`, with list/detail state encoded in `/app/todos/:listId?/:todoId?`.
- First-slice lists are smart-list derived views only (`smart:inbox`, `smart:today`, `smart:done`); no user-defined list entity is required in W7.
- User-facing delete is soft delete by persisted marker, not immediate hard purge.
- Reads may use the encrypted IndexedDB cache while locked, but writes require device-bound auth plus DEK availability.
- Browser-rendered code must enter `plugin-productivity` through a browser-safe public export only.

## Scope Boundary

This feature owns planning for:

- the first real `/app/todos` route mounted by `apps/web`
- browser-safe module registration/export from the Todo-owning package
- repo-backed Todo list/detail CRUD state
- route-driven selection and refresh/deep-link restore
- W7 fixture and test strategy for later realtime/offline/search rows

This feature does not own:

- Habits/Pomodoro/Matrix browser runtime
- realtime subscription handling
- offline replay/dead-letter/conflict policy
- labels/projects/calendar business surfaces
- desktop Console `tasks` module cleanup beyond compatibility notes

## Dependency Overview

- Upstream source:
  - `docs/reviews/web-todo-first-slice/20260521-roadmap-seed.md`
- Governing docs:
  - `docs/adr/0006-web-face-hybrid-reuse-boundary.md`
  - `docs/PLUGIN_MAP.md`
  - `docs/planning/sub-prds/web/{PRD.md,dev-plan.md}`
  - `docs/planning/sub-prds/console/PRD.md`
- Required shipped dependencies:
  - `packages/web-auth-device-session/docs/api.md`
  - `packages/web-sync-blob-driver/docs/{design.md,api.md}`
  - `packages/web-encrypted-indexeddb-cache/docs/{design.md,api.md}`
  - `packages/web-console-host-router/docs/{design.md,api.md}`
- Current runtime evidence:
  - `apps/web/src/routes/**`
  - `packages/plugin-productivity/src/{types.ts,data/RepoAdapter.ts,hooks/useTodoStore.tsx,components/**}`
  - `packages/core-data/src/{entities.ts,sync-blob.ts,indexeddb-sync-blob.ts}`

## Proposed Runtime Shape

### Host

- `apps/web`
  - composes the browser router
  - mounts the `todos` module registration
  - passes shared browser capabilities only
  - does not own Todo CRUD, local indexes, or entity transforms

### Capability owner

- `packages/plugin-productivity`
  - exports the browser-safe Todo module registration
  - owns Todo business state, list derivation, detail editing logic, and UI
  - consumes `Repo<Todo>` and route/capability props from the shared seams

### Data plane

- `packages/core-data`
  - owns encrypted Sync blob repo behavior
  - owns encrypted local IndexedDB persistence/search-worker/cache health
  - remains the only storage and sync abstraction used by the Web slice

## Phase Mapping

### Phase 1 — Browser-safe Todo module registration

Status target: build-ready.

- replace placeholder `todos` registration with a browser-safe package export
- keep `apps/web` limited to composition
- freeze route child ownership for list/detail paths

### Phase 2 — Repo-backed provider and entity alignment

Status target: build-ready.

- align W7 Todo provider/view model to the canonical persisted entity
- eliminate W7 dependence on static account mocks or LocalStorage fallback for authenticated routes
- define the backward-compatible soft-delete marker strategy

### Phase 3 — Real `/app/todos` CRUD, selection, and restore

Status target: build-ready.

- implement create/edit title-notes, complete/uncomplete, and soft delete
- derive list and detail state from route params plus repo state
- verify refresh/deep-link restore against encrypted local data

## Reviewer Focus

- Confirm `plugin-productivity` is the correct W7 capability owner instead of a host-local or standalone Web-only implementation.
- Confirm the minimal smart-list-only scope is the right cut for the first real slice.
- Confirm soft delete through persisted marker is the right user-facing delete behavior for W7.
- Confirm the entity-alignment strategy is narrow enough to avoid reopening the whole productivity schema.

## Verify Remediation (2026-05-22)

- W7 runtime now consumes a concrete browser todo session/auth seam exposed by `apps/web` runtime bridge through `globalThis.__XAI_WEB_TODO_SESSION__` (`authState/accountId/deviceId/fetchSync`) instead of calling `createBrowserTodoRepo()` with implicit defaults.
- `TodoWebModuleRoute` now enforces explicit `loading` / `locked` / `ready` / `error` lanes, and write actions are only enabled in `ready`.
- `apps/web` runtime bridge now publishes `globalThis.__XAI_WEB_TODO_CRYPTO__` from authenticated session metadata and emits runtime update events so the Todo module can transition from locked to ready when crypto material is available.
