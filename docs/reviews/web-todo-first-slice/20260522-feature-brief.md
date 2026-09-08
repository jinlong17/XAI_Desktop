# Feature Brief — web-todo-first-slice

| 字段 | 值 |
|---|---|
| Feature Slug | `web-todo-first-slice` |
| 创建日期 | 2026-05-22 |
| 作者 | Codex (`feature-plan` inline) |
| Step 0 QA Gate | PASS |
| 输出状态 | `READY_FOR_DISCOVERY` |
| Source | `docs/reviews/web-todo-first-slice/20260521-roadmap-seed.md` |
| 关联文档 | `docs/workflow/roadmap/web-ticktick-parity.md`、`docs/adr/0006-web-face-hybrid-reuse-boundary.md`、`docs/PLUGIN_MAP.md`、`docs/planning/sub-prds/web/{PRD.md,dev-plan.md}`、`packages/web-auth-device-session/docs/api.md`、`packages/web-sync-blob-driver/docs/{design.md,api.md}`、`packages/web-encrypted-indexeddb-cache/docs/{design.md,api.md}`、`packages/web-console-host-router/docs/{design.md,api.md}`、`packages/plugin-productivity/src/{types.ts,data/RepoAdapter.ts,hooks/useTodoStore.tsx}`、`packages/core-data/src/{entities.ts,sync-blob.ts,indexeddb-sync-blob.ts}` |

---

## Structured Brief

### Feature Title

W7 Web Todo first real slice over encrypted Sync blobs

### Canonical Name And Rationale

- Canonical slug: `web-todo-first-slice`
- Package docs anchor: `packages/web-todo-first-slice/docs/`
- Why this name fits:
  - the roadmap row already uses it
  - this row is the first non-mock `/app/todos` product slice for the Web face
  - it owns the first repository-backed Todo list/detail CRUD path, not the full productivity suite

### Problem / Motivation

The Web host/router row is now shipped, but `/app/todos` is still placeholder content. The next row has to turn that route into the first real TickTick-style module without breaking the thin-host rule or inventing a second data plane.

Current gaps:

1. `apps/web` can route to `/app/:moduleId/*`, but `todos` still renders placeholders.
2. `plugin-productivity` Todo logic is still mock-first and shaped for LocalStorage/Tauri adapters rather than the browser Sync blob path.
3. `@repo/core-data` already has the canonical syncable `TodoEntity`, but current productivity UI types drift from that shape.
4. Delete semantics are still ambiguous: the Web row needs user-visible delete while preserving encrypted Sync blob history and later offline/conflict work.

### Desired Outcome

Plan one executable path where:

- `/app/todos`, `/app/todos/:listId`, and `/app/todos/:listId/:todoId` render real data
- create/edit title and notes, complete/uncomplete, and delete are repository-backed
- refresh and deep-link restore come from route state and local encrypted cache, not component-only memory
- all reads and writes flow through `Repository<T>` plus Sync blob mutation semantics
- `apps/web` stays host-only, while Todo business state remains in a package-owned browser-safe surface
- fixtures and tests prepare later realtime/offline/search rows instead of forcing a rewrite

### Scope

- Freeze runtime ownership across `apps/web`, `@repo/plugin-productivity`, and `@repo/core-data`.
- Freeze the canonical Todo entity shape for W7 and the minimal route/list semantics for `/app/todos`.
- Plan browser-safe module registration/export from the owning package.
- Plan DEK/device-session prerequisites for reads and writes.
- Plan soft-delete behavior, deep-link restore, refresh behavior, and fixture strategy.
- Initialize `design.md`, `api.md`, `test.md`, and `dev_log.md`.

### Non-goals

- No production code in this planning run.
- No Pomodoro/Habits/Matrix browser implementation.
- No new browser-side business table or direct `/rest/v1/todos` API.
- No realtime subscriptions, seq-gap handling, offline replay policy, or dead-letter UI.
- No labels/projects/calendar ownership work beyond reading existing ids/fields if present.
- No hard-delete purge UX beyond preserving a future seam.

### Constraints

- No static `accountMocks` or hard-coded `/console` placeholder content may satisfy this row.
- Data writes require authenticated device-bound fetch plus unlocked DEK availability.
- `apps/web` may assemble providers/routes only; Todo business logic cannot move there.
- Browser-rendered code must use browser-safe public entrypoints only, not package roots with native/Desktop branches.
- Repository writes must remain compatible with `@repo/core-data` Sync blob and encrypted IndexedDB cache behavior.
- Later rows depend on this slice for real fixtures, route semantics, and durable local data, so W7 cannot ship as a dead-end one-off implementation.

### Acceptance Criteria

1. `docs/reviews/web-todo-first-slice/20260522-discovery-review.md` explains the chosen ownership split, entity strategy, delete semantics, and phase plan.
2. `packages/web-todo-first-slice/docs/{design,api,test,dev_log}.md` agree on one runtime model.
3. The plan freezes one browser-safe module export path for `/app/todos` from the owning package rather than letting `apps/web` own Todo state.
4. The plan freezes one canonical persisted entity path based on encrypted Sync blob data and local indexes.
5. `api.md` explicitly covers route/list/detail semantics, soft-delete, DEK-gated writes, and error behavior.
6. `dev_log.md` ends with `Status = NEEDS_REVIEW` and `Suggested Next = feature-review`.

### Open Questions

1. Whether W7 should keep `TodoEntity` minimal and derive smart lists locally, or add optional metadata fields needed for richer list grouping now.
2. Whether browser `moduleId` stays `todos` while desktop Console continues using `tasks`, or whether later cross-face cleanup should normalize those ids.
3. Whether `plugin-productivity` should expose a dedicated `/web` subpath for W7 immediately, or first route through a narrow shared browser-safe export and broaden later rows.

### Planner Handoff

- Recommended direction: keep `TodoEntity` as the persisted source of truth, add only backward-compatible optional fields where W7 truly needs them, and implement the Web module as a browser-safe `plugin-productivity` export mounted by `apps/web`.
- Key review focus: entity-shape drift between `@repo/core-data` and `plugin-productivity`, user delete versus soft-delete semantics, and whether the DEK/device-session prerequisites are explicit enough for build.
- Expected next output: discovery review plus docs four-pack in `NEEDS_REVIEW`, ready for `feature-review`.
