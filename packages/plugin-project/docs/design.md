# Plugin Project Design

## Scope

`@repo/plugin-project` owns a mock-first project board scaffold with pure React drag/drop card movement.

## Decisions

- Projects and Cards use separate `DataAdapter<T>` instances because they are separate entities.
- Board lists live inside `Project.lists`; cards reference lists by `listId`.
- Drag/drop is implemented with native React event handlers and local store updates. No new dependency is introduced.
- Labels are stored as string IDs to avoid direct dependency on `plugin-labels`.
- Card detail supports description and checklist editing while keeping the requested Card fields intact.

---

## Phase: W0.B card typed events emit (2026-05-23)

### Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | A — single emit per coalesced action, mirroring labels sibling |
| Review Doc | `docs/reviews/plugin-project/20260523-discovery-review.md` |
| Review Date | 2026-05-23 |
| Brief | `docs/reviews/plugin-project/20260523-feature-brief.md` |
| Sibling pattern | `plugin-productivity` (`7ee5d6f`..`99b3de9`) · `plugin-labels` (`c0a9cf8`..`3e27206`) — both shipped 2026-05-23 |
| Cross-window contract impact | Additive only — 3 new `EventMap` entries after `labels:deleted` |

### Frozen Assumptions

- `Card` entity shape is immutable in this phase (brief constraint). No
  `projectId` field is added.
- `useProjectStore` action surface is unchanged: `createCard`, `moveCard`,
  `updateCard`, plus `updateChecklist` (thin wrapper over `updateCard`).
- `@repo/core/events` is Stable; this phase only declares EventMap entries
  and adds emit call sites — no edits to emitter / listener / index.
- No `project:card-deleted` event (dev_log Pending line names only
  created / moved / updated).
- No project-level CRUD events (out of brief scope).
- No PLUGIN_MAP promotion (W0.C scope).

### Emit Outlets

| Outlet | Event | Trigger condition |
|---|---|---|
| `useProjectStore.createCard` (after `stableCardAdapter.save`) | `project:card-created` | Successful card create |
| `useProjectStore.moveCard` (after `dirty` computation) | `project:card-moved` | `dirty.length > 0` (no-op moves suppressed) |
| `useProjectStore.updateCard` (after `stableCardAdapter.save`) | `project:card-updated` | Successful card update; includes calls via `updateChecklist` wrapper |

### Payload Design Rationale

- **No `projectId` field**: `Card` has no `projectId` and the brief
  forbids entity-shape changes. Consumers must derive project context
  externally if needed.
- **`patchKeys` on `card-updated`**: gives consumers a cheap field-change
  hint without per-field event explosion. Allow-list is locked to the
  mutable subset of `Card` fields (`title`, `description`, `labels`,
  `dueDate`, `checklist`, `listId`, `order`). System fields are filtered
  out.
- **`fromListId` / `fromOrder` / `toListId` / `toOrder` on `card-moved`**:
  consumers can perform local re-sort without re-fetching the board.
  Captured pre-mutation in the action closure.
- **`.catch(() => undefined)` on every emit**: swallows non-Tauri
  rejection so unit tests / web preview stay green. Mirrors sibling.

### Dependency Overview

| Dependency | State | Direct use? |
|---|---|---|
| `@repo/core/events` (`emitEvent`) | Stable | Yes — single import in `useProjectStore.tsx` |
| `@repo/core/types` (`EventMap`) | Stable | Yes — declaration site of new entries |
| `@repo/core-data` (`RepoRecord`) | In-Dev | Used only via existing `Card` shape; no extension |
| sibling rows (productivity / labels) | In-Dev | Not depended on; same emit pattern reused |

### Out of Scope (do not edit)

- `packages/core/src/events/{emitter,listener,index}.ts`
- `plugin-project/src/{components,data,utils,register-plugin}.*`
- `plugin-project/src/types.ts`
- `plugin-console`, `plugin-account`, `plugin-productivity`, `plugin-labels`,
  `plugin-calendar`, `plugin-organizer`, `apps/desktop/**`
- Tauri command / Rust / native macOS files
- `docs/PLUGIN_MAP.md` row 76 (W0.C)

