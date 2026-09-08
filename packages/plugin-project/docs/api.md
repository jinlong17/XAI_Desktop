# Plugin Project API

## Public Surface

- `ProjectStoreProvider`
- `useProjectStore`
- `BoardView`
- `CardDetail`
- `LocalStorageAdapter`

## Entities

- `Project`
- `ProjectList`
- `Card`
- `ChecklistItem`

## Persistence

The store accepts `projectAdapter` and `cardAdapter`, both defaulting to package-local `LocalStorageAdapter`.

---

## Phase: W0.B card typed events emit (2026-05-23)

### Cross-window contract additions (additive only)

Three new `EventMap` entries appended after the existing `labels:*` block
in `packages/core/src/types/events.ts`. Existing entries unchanged.

#### `project:card-created`

Emitted by `useProjectStore.createCard` immediately after a successful
`adapter.save`.

| Field | Type | Source |
|---|---|---|
| `id` | `string` | Card id (`createId("card")`) |
| `listId` | `string` | Initial `listId` from `CardDraft` |
| `title` | `string` | Trimmed title (post-validation; non-empty) |
| `order` | `number` | `siblingCount` at insert time (== position in list) |
| `entityType` | `'project.card'` | Constant |
| `version` | `number` | Always `1` at create |
| `createdAt` | `string` | ISO timestamp matching `Card.createdAt` |

Error semantics: emit fires only on `createCard` success. Throws on
empty title (no emit). Adapter `save` rejection propagates (no emit).
`emitEvent` rejection is swallowed via `.catch(() => undefined)` so
the operation still resolves with the created `Card`.

#### `project:card-moved`

Emitted by `useProjectStore.moveCard` after `dirty` computation, only
when `dirty.length > 0` (no-op moves do not emit).

| Field | Type | Source |
|---|---|---|
| `id` | `string` | Card id from caller |
| `fromListId` | `string` | Pre-move `target.listId` (captured before re-normalization) |
| `toListId` | `string` | Argument `listId` |
| `fromOrder` | `number` | Pre-move `target.order` |
| `toOrder` | `number` | Clamped order (`Math.min(Math.max(order, 0), targetList.length)`) |
| `version` | `number` | Bumped: `target.version + 1` |
| `updatedAt` | `string` | ISO `movedAt` stamp (same value the store writes to dirty rows) |

Error semantics: emit fires only when at least one card row was dirtied
(`dirty.length > 0`). Stale `cardId` (target not found) → silent no-op,
no emit. Adapter `save` rejection propagates (no emit guarantee for
partial failures; behaves as labels sibling). `emitEvent` rejection
swallowed.

#### `project:card-updated`

Emitted by `useProjectStore.updateCard` immediately after a successful
`adapter.save`. Also fires for `updateChecklist` calls because that
wrapper routes through `updateCard`.

| Field | Type | Source |
|---|---|---|
| `id` | `string` | Card id from caller |
| `listId` | `string` | Post-merge `next.listId` |
| `patchKeys` | `string[]` | `Object.keys(patch)` filtered to the allow-list, sorted, deduplicated |
| `version` | `number` | Bumped: `current.version + 1` |
| `updatedAt` | `string` | ISO timestamp matching `Card.updatedAt` |

**`patchKeys` allow-list** (locked contract):

```
"title", "description", "labels", "dueDate", "checklist", "listId", "order"
```

Keys outside the allow-list are filtered out (`id`, `entityType`,
`schemaVersion`, `syncScope`, `createdAt`, `updatedAt`, `version`,
`deletedAt`, plus any unknown). Adding a new mutable `Card` field in
the future is an additive contract change (non-breaking) and must be
mirrored in the allow-list.

Error semantics: emit fires only on successful update. Stale id
(`current` not found) → silent no-op, no emit. Adapter `save` rejection
propagates (no emit). `emitEvent` rejection swallowed.

### Permission / idempotency notes

- All three events are local Tauri IPC. No PII, no secrets, no network.
- `version` increments per action invocation; consumers should treat
  the `(id, version)` tuple as the idempotency key for de-duplication
  across windows.
- Re-render of `ProjectStoreProvider` without any action call does not
  emit (action-coupled, not effect-coupled).

