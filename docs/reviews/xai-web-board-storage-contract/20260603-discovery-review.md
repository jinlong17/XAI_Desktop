# Discovery Review - xai-web-board-storage-contract

| Field | Value |
|---|---|
| Feature | `xai-web-board-storage-contract` |
| Roadmap | `docs/workflow/roadmap/xai-web-project-module.md` row #7 |
| Source PRD | `docs/reviews/xai-web-project-module/20260603-audit-and-prd.md` PJ-WEB-04 / PJ-WEB-05 |
| Date | 2026-06-03 PDT |
| Status | NEEDS_REVIEW |

## Problem

The Web Project module now has shipped board detail, typed dates, list CRUD,
card CRUD, and checklist editing. Its durable data boundary is still weak:

- `xai_boards_v2` stores a raw nested `Board[]` without a versioned envelope.
- `@repo/plugin-web-storage` registers the key as `unknown` with
  `schemaVersion: 1`, but board-core owns the real shape.
- `loadBoardsOrDefault(...)` currently accepts only legacy arrays and seed/null
  fallbacks.
- The formal repository contract reserves `project.board` and `project.card`,
  but current Web board data also contains lists, checklist rows, typed dates,
  archive flags, locations, attachments, and activity.
- There is no helper that can project the nested Web board state into
  encrypted-blob-ready logical records.

Without this contract, later task linking, export/import, sync, and sharing
would either duplicate shape knowledge outside board-core or risk dropping card
detail fields during migration.

## Current Runtime Facts

### `plugin-web-board-core`

- Owns `Board`, `BoardList`, and `BoardCard` schemas.
- Owns `isBoardArray(...)`, `loadBoardsOrDefault(...)`, and seed data.
- Reads from `usePref("xai_boards_v2")` and writes valid `Board[]`.
- Current persistence guard rejects malformed values and falls back to seed.
- Existing tests cover null, malformed, empty-array, valid-array, and active-id
  fallback behavior.

### `plugin-web-board-views`

- Uses board-core `loadBoardsOrDefault(...)`.
- Writes edited Table/Calendar/Timeline card data back as `Board[]`.
- Does not own storage shape.

### `plugin-web-board-workspaces`

- Active `/app/board` host.
- Uses board-core `loadBoardsOrDefault(...)`.
- Writes list/card/detail mutations back as `Board[]`.
- Owns board creation and deletion UI but not the storage contract.

### `plugin-web-storage`

- Owns the localStorage registry and `usePref` hook.
- `xai_boards_v2` is registered as `codec: "json"`, `default: null`,
  `schemaVersion: 1`, owner `xai-web-board-core`.
- Its migration surface is currently a callable no-op stub.

### `core-data`

- Repository v0 requires `id`, `entityType`, `schemaVersion`, `createdAt`,
  `updatedAt`, and `syncScope`.
- Current canonical entities reserve `project.board` and `project.card`, but
  their fields are too narrow for the Web board module as-is.
- The encrypted sync/cache code can work with any `RepoRecord`-compatible
  record if a package provides a safe payload shape.

## Reference Product Alignment

Trello-style projects are not just cards in a flat list. The persisted boundary
must preserve:

- boards as project spaces
- lists as workflow stages
- cards as task records
- checklists, due dates, labels, members, attachments, activity, and archive
  state as card payload

This row maps the current nested Web shape into a versioned storage contract so
future calendar feed, task link, share/export/import, and sync rows can build on
one board-core-owned interpretation.

## Recommended Scope

Implement a narrow storage contract in board-core:

1. Add version constants for `xai_boards_v2` schema v1.
2. Accept both legacy raw `Board[]` and a new v1 envelope at read time.
3. Add a pure migration helper from legacy raw array to v1 envelope.
4. Preserve runtime compatibility: existing UI may still write `Board[]`, but
   writes should preserve envelope form when the previous raw value was already
   an envelope.
5. Add logical entity projection helpers:
   - `project.board`
   - `project.list`
   - `project.card`
6. Use `RepoRecord`-compatible base fields and `syncScope: "account-sync"`.
7. Keep complete nested payloads in each logical entity so encrypted blob sync
   does not drop Web-specific fields.

## Non-Goals

- No backend sync.
- No IndexedDB driver switch.
- No Supabase / remote encrypted blob write.
- No data export/import UI.
- No `/app/projects` route.
- No task conversion/linking.
- No list/card schema redesign beyond projection helpers.
- No destructive localStorage migration on app boot.

## Risks

| Risk | Mitigation |
|---|---|
| Envelope support breaks existing users with `Board[]`. | Keep legacy arrays valid and identity-preserving. |
| Future sync drops rich card fields. | Logical entities keep full `payload` plus index fields. |
| Runtime edits flatten envelope values back to arrays. | Add a write helper that preserves envelope form when previous raw storage was envelope. |
| Contract conflicts with core-data's narrow `CardEntity`. | Name these as board-storage logical entities; they are RepoRecord-compatible but not a direct replacement for the old narrow entity until a later core-data row. |
| Accidental storage migration deletes old data. | No boot-time destructive migration in this row; migration helper is pure and caller-controlled. |

## Recommended Phases

1. **P1 docs/contract**: discovery/design/api/test/dev_log.
2. **P2 board-core contract**: storage envelope, read/migrate/write helpers,
   logical entity projection, exports, tests.
3. **P3 runtime preservation**: core/views/workspaces write paths preserve
   envelope form if present.
4. **P4 verification/ship docs**: package tests, Web gates, smoke `/app/board`,
   roadmap and PLUGIN_MAP updates.
