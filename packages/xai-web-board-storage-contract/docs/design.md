# Design - xai-web-board-storage-contract

> Decision snapshot for the Web Project module P0 storage contract slice.

## Selected Option

**Option A** - keep `xai_boards_v2` as the single board data key, add a
board-core-owned v1 storage contract, and preserve legacy `Board[]` runtime
compatibility.

This avoids a risky live storage cut-over while still giving later sync,
share/export/import, and task-link rows a typed source of truth.

## Review Doc Path

`docs/reviews/xai-web-board-storage-contract/20260603-discovery-review.md`

## Review Date / Version

2026-06-03 / v1

## Dependency Overview

```text
packages/xai-web-board-storage-contract/docs/   (workflow anchor only)

Runtime ownership
  plugin-web-board-core
    ├── owns BoardStorageEnvelopeV1
    ├── owns legacy-array + envelope read contract
    ├── owns pure migration helper
    ├── owns envelope-preserving write helper
    └── owns board/list/card logical entity projection

  plugin-web-board-views
    └── updates writer to preserve envelope form when already present

  plugin-web-board-workspaces
    └── updates board/list/card/detail writers to preserve envelope form

Non-owners
  plugin-web-storage       -> registry key remains schemaVersion 1
  core-data                -> provides RepoRecord shape; no entity union change
  apps/web                 -> route and shell unchanged
```

## Storage Shape

Existing valid value remains:

```ts
type LegacyBoardStorage = Board[];
```

New accepted value:

```ts
interface BoardStorageEnvelopeV1 {
  kind: "xai.web.board.storage";
  schemaVersion: 1;
  boards: Board[];
  migratedFrom: "legacy-array" | "v1-envelope";
  migratedAt?: string;
}
```

Read behavior:

- `null` -> seed fallback
- malformed -> seed fallback
- empty array -> seed fallback, preserving current behavior
- valid legacy `Board[]` -> use as-is
- valid v1 envelope -> use `envelope.boards`
- unsupported future envelope -> seed fallback

Write behavior:

- if previous raw value was v1 envelope, write a new v1 envelope containing the
  new boards
- otherwise write legacy `Board[]`

## Logical Entities

Projection is pure and deterministic:

```ts
project.board  -> one record per Board
project.list   -> one record per BoardList
project.card   -> one record per BoardCard
```

Each entity is RepoRecord-compatible:

- `id`
- `entityType`
- `schemaVersion: 1`
- `createdAt`
- `updatedAt`
- `syncScope: "account-sync"`

Each entity stores:

- index fields needed for list/query/sort
- a full `payload` copy of the Web board/list/card object

This is intentionally more lossless than the current narrow core-data
`ProjectEntity` / `CardEntity` pair.

## Frozen Assumptions

1. `xai_boards_v2` remains the only board data key.
2. `xai_active_board`, `xai_board_panels`, `xai_board_inbox`, and
   `xai_board_view_by_id` are not migrated in this row.
3. Schema version starts at `1`.
4. Legacy arrays remain valid because all shipped board UI writes arrays today.
5. Empty arrays continue to render seed data.
6. No boot-time migration writes to localStorage automatically.
7. Logical entities are a sync/export preparation surface, not a runtime data
   source in this row.
8. Entity projection order follows nested board/list/card order.
9. `position` values are zero-based indices within the containing collection.
10. Archived flags are stored as booleans, not synthesized timestamps.
11. Complete payloads are preserved for encrypted blob sync.
12. `core-data` entity union is not widened in this row.

## Out of Scope

- direct sync driver integration
- IndexedDB cache writes
- Supabase / Cloudflare backend calls
- data export/import UI
- route aliases
- task linking
- real migration execution on app startup
- schema v2 migrations
