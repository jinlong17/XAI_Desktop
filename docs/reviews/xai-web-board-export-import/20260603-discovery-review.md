# Discovery Review - xai-web-board-export-import

| Field | Value |
|---|---|
| Feature | `xai-web-board-export-import` |
| Source PRD | `docs/reviews/xai-web-project-module/20260603-audit-and-prd.md` |
| Roadmap Row | `docs/workflow/roadmap/xai-web-project-module.md` row #13 |
| Review Date | 2026-06-03 |
| Reviewer | gpt-5 parent inline |

## Current Code Truth

- Current Web Console runtime has no first-class `/app` export/import page.
- Legacy release-site pages exist under `apps/release-site/app/{export,import}`,
  but they are mock encrypted bundle pages and are not the active Web Console.
- `@repo/plugin-web-storage` owns the registered localStorage key set and already
  includes the Board keys `xai_boards_v2`, `xai_active_board`,
  `xai_board_panels`, `xai_board_inbox`, `xai_board_view_by_id`, and
  `xai_board_filter_by_id`.
- Account delete in `@repo/plugin-web-settings-rest` already iterates
  `Object.keys(PREF_REGISTRY)` and calls `removePref` for each key, so Board
  storage is deleted by construction.
- `@repo/plugin-web-board-core` already exports the v1 Board storage envelope
  and `projectBoardStorageEntities()`, which projects board/list/card logical
  entities.

## Problem

The Project PRD requires Board data to be ready for export/import/delete flows.
Delete is effectively covered through the storage registry, but export/import has
no Board-specific payload contract that a future UI or encrypted bundle adapter
can call. Without that contract, future export/import UI would have to inspect
`xai_boards_v2` ad hoc and could omit board/list/card logical entities.

## Options Considered

### Option A - Add active Web export/import UI now

Rejected for this row. It would require UI placement, file upload/download UX,
encrypted bundle policy, destructive restore confirmation, and backend key
material decisions. The active console does not yet have the surface.

### Option B - Put export/import helpers in `@repo/plugin-web-storage`

Rejected. `plugin-web-storage` is a foundation package consumed by board-core.
Importing board-core from storage would invert the dependency and risk a circular
package boundary.

### Option C - Add Board-specific export/import payload helpers in board-core

Selected. Board-core already owns the Board schema, storage envelope, guards,
and logical entity projection. This row adds a typed Board export payload helper,
payload reader/validator, and import-to-storage helper, then strengthens account
delete tests to prove Board keys are included in the registry wipe.

## Selected Direction

Use Option C.

This row does not add a UI. It adds an executable data contract that future
export/import UI can call without reaching into board-core internals.

## Acceptance

- Board-core can build a v1 export payload from valid raw `xai_boards_v2` data.
- Payload includes the raw storage value, normalized Board list, and board/list/
  card logical entities.
- Malformed or empty Board storage returns an invalid result instead of throwing.
- Import helper validates a payload and returns the storage value to write back
  to `xai_boards_v2`.
- Account-delete tests assert all Board-owned keys are present in the registry
  wipe set.
- No dependency from `@repo/plugin-web-storage` to board-core is introduced.

## Out of Scope

- active export/import page in `/app`
- real encrypted bundle generation
- backend sync record export
- destructive merge UI
- per-board selective export
- route alias `/app/projects`
