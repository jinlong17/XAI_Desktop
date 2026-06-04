# Dev Log - xai-web-board-list-crud

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-board-list-crud |
| Title | Web Project module P0 list CRUD slice - add rename, archive/delete, and deterministic reorder for board lists on `/app/board` while preserving row #2 card detail, row #3 typed dates, and the current board writer path |
| Current Phase | SHIP |
| Status | SHIPPED |
| Suggested Next | xai-web-board-card-crud or xai-web-board-checklist-editor |
| Automation Mode | D-Codex+Cursor |
| Verify Cross-vendor | yes |
| Executor | gpt-5 |
| Updated | 2026-06-03 21:08 PDT |
| Blockers | None. Shipped locally and ready/pushed for downstream roadmap rows. |
| Roadmap Manifest | `docs/workflow/roadmap/xai-web-project-module.md` row #4 |
| Source PRD / Audit | `docs/reviews/xai-web-project-module/20260603-audit-and-prd.md` |
| Write Scope | `docs/reviews/xai-web-board-list-crud/` + `packages/xai-web-board-list-crud/docs/` during planning. Runtime build scope is expected to stay inside `packages/plugin-web-board-{core,workspaces}` plus parity-only `plugin-web-board-views` if shared `BoardView` props change. |

## Artifacts Index

- Discovery review: `docs/reviews/xai-web-board-list-crud/20260603-discovery-review.md`
- Design snapshot: `packages/xai-web-board-list-crud/docs/design.md`
- API contract: `packages/xai-web-board-list-crud/docs/api.md`
- Test strategy: `packages/xai-web-board-list-crud/docs/test.md`

## Decision Headline

Recommended build shape is a **menu-driven list management slice with one raw persisted order and one filtered active render path**:

- core-owned pure list helpers
- canonical active/archive selectors
- list-id-owned board writes instead of visible-index writes
- command-based reorder (`Move left` / `Move right`) in visible active order
- archive-first destructive flow for non-empty lists
- archived-list restore/delete manager owned by workspaces
- minimal keyed Basic Kanban exception so first-run `/app/board` has list CRUD affordance

This row stays intentionally narrow. It does not take on card CRUD, checklist editing, storage-version work, backend sync, or route changes.

## Naming

- **Feature Title**: Web Project module P0 list CRUD slice
- **Canonical Name**: `xai-web-board-list-crud`
- **Why this name fits**: it matches roadmap row #4 exactly, keeps the slice anchored to Web board list lifecycle behavior, and avoids collapsing into later card CRUD or storage-contract rows.

## Dependency Snapshot

- **Satisfied prerequisite**: row #1 `xai-web-project-prd-sync` is already materially satisfied in this branch baseline.
- **Must preserve**: row #2 `xai-web-board-card-detail`, row #3 `xai-web-board-date-model`.
- **Current active owner**: `plugin-web-board-workspaces` owns the `/app/board` shell and board writer path.
- **Runtime co-owners for this row only**:
  - `plugin-web-board-core` for list schema/helpers/shared BoardView contract
  - `plugin-web-board-workspaces` for raw->active render orchestration and archived manager
  - parity-only `plugin-web-board-views` if shared BoardView props change
- **Non-owner references only**: `plugin-project`, backend sync, schema-version migration.

## Scope

### In scope

- rename for editable lists
- reorder for editable lists via left/right commands
- archive for non-empty editable lists
- delete for empty editable lists
- archived-list restore/permanent-delete manager
- list-id-owned add-card/write routing for filtered board surfaces
- keyed Basic Kanban management on first-run `/app/board`
- PM status-semantic preservation when visible labels change

### Out of scope

- card rename/archive/delete/reorder
- checklist editing
- `schemaVersion`, migration, or new storage keys
- backend sync
- route changes
- list drag-and-drop

## Revised Contract

### Raw vs visible lists

- persisted source of truth remains `activeBoard.lists`
- archived lists stay in that raw array with additive `archived?: boolean`
- active surfaces derive `activeLists = getActiveBoardLists(rawLists)`
- filtered surfaces derive `filteredActiveLists = applyFilter(activeLists, filter)`
- archived-list manager derives `archivedLists = getArchivedBoardLists(rawLists)`

### Reorder semantics

- left/right movement is evaluated in visible active order
- implementation swaps raw positions of the target list and its nearest visible active neighbor
- archived entries keep their raw positions
- canonical example:
  - raw `[A(active), X(archived), B(active)]`
  - `Move B left` -> raw `[B(active), X(archived), A(active)]`

### Write-path identity

- board-surface list-targeted writes move to `listId` ownership
- shared `BoardView` contract should migrate from `draftListIdx` / `addCard(listIdx)` to `draftListId` / `addCard(listId)`
- workspaces remains the only writer via `writeLists(...)`

### Editability rule

- `template === "pm"` -> editable, semantics come from immutable `pm-*` ids
- `template === "blank"` -> editable custom lists
- `template === "kanban"` -> all kanban lists remain editable; keyed default lanes use `customName` override while preserving immutable `key`

## Phase Plan

### P1 - Core list contract

- add additive `archived?: boolean` list metadata
- add active/archive selectors
- add pure list helpers (`rename`, `moveListByOffset`, `archive`, `restore`, `delete`)
- add `addCardToListById(...)`
- update guards, barrel exports, and board-core unit tests

Exit gate:

- board-core tests prove immutability, active-order swap semantics with archived gaps, keyed-kanban rename preservation, and nested-card preservation

### P2 - Board surface CRUD

- extend shared list menu affordances in `BoardList` / `BoardView`
- migrate BoardView composer state from visible index to `listId`
- wire rename/reorder/archive/delete through `BoardWorkspacesModule`
- add archived-list manager with restore/permanent delete
- preserve existing add-card and list-color affordances

Exit gate:

- workspaces integration tests prove persisted rename/reorder/archive/delete/restore flows on `/app/board`, including archived-gap writes by `listId`

### P3 - Cross-view/regression alignment

- filter archived lists out of active Board/Table/Calendar/Timeline/Dashboard/Planner/filter/overview renders
- fix PM overview semantics so rename does not break status math
- apply parity-only `plugin-web-board-views` updates if shared props changed
- verify row #2 detail data and row #3 typed dates survive reorder/archive/restore/delete flows

Exit gate:

- touched package tests pass without route, storage-key, or schemaVersion drift

## Risks

| ID | Risk | Impact | Mitigation |
|---|---|---|---|
| R1 | Visible board writes still target list index | Archived gaps can redirect writes to the wrong list | Migrate add-card/composer contract to `listId` before enabling archive filtering |
| R2 | Reorder semantics drift between helper/tests/UI copy | User-visible left/right behavior becomes ambiguous | Freeze active-order neighbor-swap semantics in docs and unit tests |
| R3 | Keyed kanban rename erases semantic identity | Default-board labels or restore behavior regress | Preserve immutable `key`; use `customName` only as visible override |
| R4 | PM overview still keys off text | Rename breaks completion math | Move semantics from visible labels to immutable `pm-*` ids and exclude archived lists |
| R5 | Archived keyed-kanban permanent delete removes a seeded lane | User can intentionally remove original lane shape | Keep archive as the primary destructive path; make permanent delete explicit and manager-only |

## Review Focus

1. Confirm the raw-vs-visible list contract is now specific enough for build.
2. Confirm `listId` ownership is the right fix for filtered board writes.
3. Confirm active-order left/right semantics with archived gaps are acceptable.
4. Confirm the keyed Basic Kanban exception is the right P0 usability rule for first-run `/app/board`.
5. Confirm PM semantic preservation via immutable `pm-*` ids is the right rename-safe contract.

## Review Notes

APPROVED for build.

1. The revised planning pack now freezes one build-safe raw-vs-visible contract: persisted truth remains one raw `lists[]`, active renders derive `activeLists` before filtering, reorder semantics are defined in visible active order across archived gaps, and list-targeted writes migrate to stable `listId` ownership instead of visible indices.
2. The first-run default Basic Kanban experience is now explicitly covered: keyed kanban lists are manageable in P0, rename uses `customName` while preserving immutable `key`, and PM semantics move to immutable `pm-*` ids rather than visible labels.
3. Scope remains appropriately narrow for row #4: `/app/board` stays the route truth, `plugin-web-board-workspaces` stays the only writer, row #2 card detail and row #3 typed dates are preserved, and no storage-key/schemaVersion/backend-sync/route/card-CRUD/checklist scope is introduced.

## Verify Notes

PASS. Ready for ship.

1. Re-reviewed commits `f150957`, `9ad61e6`, `792572e`, `3136b87`, `a6a0ebb`, and `bd8066d` against the approved planning pack. Commit scope stayed phase-aligned: docs-only plan, board-core contract, board/workspace UI wiring with views parity, PM/status alignment, docs handoff, then one narrowly scoped verify-blocker fix for card-detail list-name resolution plus regression coverage.
2. The prior verify blockers are closed on the live `/app/board` path: `packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx` now resolves list names `customName`-first before keyed fallback for `BoardCardDetailModal`, and `BWM-LIST-1b` covers the renamed keyed first-run kanban column inside the detail modal (`.cd-list-name` => `Focus Queue`).
3. Current automated verification on HEAD passed: `git diff --check 505ef0a..HEAD`; `pnpm --filter @repo/plugin-web-board-core lint && typecheck && test -- --run` (`137/137`); `pnpm --filter @repo/plugin-web-board-views lint && typecheck && test -- --run` (`131/131`); `pnpm --filter @repo/plugin-web-board-workspaces lint && typecheck && test -- --run` (`192/192`).
4. Contract checks remain aligned with scope: raw `lists[]` persistence plus active/archive selectors, listId-owned writes after archived gaps, first-run keyed Basic Kanban rename with immutable `key`, archived-list manager flows, PM id-based status math, row #2 detail persistence, and row #3 typed dates. No route/storage-key/schemaVersion/backend-sync/card-CRUD/checklist drift was introduced in `505ef0a..HEAD`.
5. Residual non-blocking risk: package tests still emit pre-existing stderr warnings (`React act(...)`, nested `<button>` hydration warning in `BoardSwitcher`, and `SubtleCrypto` fallback logging). No manual browser smoke was rerun in this verify pass.

## Work Log

| Timestamp | Executor | Action | Commits | Next Step |
|---|---|---|---|---|
| 2026-06-03 20:14 PDT | gpt-5.3-codex | feature-plan Fresh - reviewed roadmap row #4, source PRD/audit, shipped row #2/#3 docs, and current `plugin-web-board-{core,views,workspaces}` code/tests; produced discovery/design/api/test/dev_log docs for a narrow list CRUD slice with command-based reorder, archive-first destructive policy, and parity-only board-views scope. | - | feature-review |
| 2026-06-03 20:21 PDT | gpt-5.3-codex | feature-review - REVISE. Reviewed roadmap row #4 planning artifacts against current `plugin-web-board-{core,workspaces,views}` runtime. Sent plan back for revision because archived-list filtering is not yet reconciled with persisted-order/write semantics, and the `key === null` editable boundary is not yet explicitly aligned with the default keyed kanban board experience. | - | feature-plan |
| 2026-06-03 20:26 PDT | gpt-5.3-codex | feature-plan Revise - read the review blockers against the current runtime seams (`BoardView addCard(listIdx)`, `BoardWorkspacesModule` filtered lists, default `b-default` kanban seed, PM `ringMath` text-based semantics) and revised discovery/design/api/test/dev_log to freeze one build-safe contract: raw `lists[]` persistence, active-list render filtering, listId-owned writes, active-order left/right swap across archived gaps, and a keyed Basic Kanban exception for first-run `/app/board`. | - | feature-review |
| 2026-06-03 20:39 PDT | gpt-5.4 | Inline build P1 - added board-core list lifecycle contract: `archived?: boolean`, mutation context, listId add-card, active/archive selectors, rename/reorder/archive/restore/delete helpers, guard acceptance, barrel exports, and focused unit coverage for archived gaps/keyed-kanban semantics. Verification: `pnpm --filter @repo/plugin-web-board-core lint` PASS; `pnpm --filter @repo/plugin-web-board-core typecheck` PASS; `pnpm --filter @repo/plugin-web-board-core test -- --run` PASS (132/132, pre-existing React `act(...)` stderr warnings). | pending | P2 board surface CRUD |
| 2026-06-03 20:49 PDT | gpt-5.4 | Inline build P2 - extended shared `BoardList` / `BoardView` with menu-driven rename, left/right reorder, archive/delete actions, migrated composers to `listId`, wired the active `/app/board` writer through list lifecycle helpers, added archived-list manager restore/permanent-delete UI, and preserved parity in the standalone board-views host. Verification: `pnpm --filter @repo/plugin-web-board-core lint && ... typecheck && ... test -- --run` PASS (137/137); `pnpm --filter @repo/plugin-web-board-views lint && ... typecheck && ... test -- --run` PASS (131/131); `pnpm --filter @repo/plugin-web-board-workspaces lint && ... typecheck && ... test -- --run` PASS (186/186). Existing stderr warnings remain: React `act(...)`, BoardSwitcher nested button hydration, SubtleCrypto fallback. | pending | P3 cross-view/status regression alignment |
| 2026-06-03 20:52 PDT | gpt-5.4 | Inline build P3 - made PM/keyed-kanban status math semantic-id based (`pm-done*` / `key:"done"`) instead of visible-name based, excluded archived lists from ring/done calculations, and added route-level regression that archived lists are hidden from alternate Table view. Verification: `pnpm --filter @repo/plugin-web-board-workspaces lint` PASS; `pnpm --filter @repo/plugin-web-board-workspaces typecheck` PASS; `pnpm --filter @repo/plugin-web-board-workspaces test -- --run` PASS (191/191, existing BoardSwitcher nested button and SubtleCrypto stderr warnings). | pending | feature-verify |
| 2026-06-03 21:02 PDT | gpt-5.4 | Verify blocker fix - changed workspace card-detail list-name resolution to customName-first for renamed keyed kanban lists and added a route-level regression that opens `BoardCardDetailModal` after renaming first-run `b-backlog`. Verification: `pnpm --filter @repo/plugin-web-board-workspaces lint` PASS; `pnpm --filter @repo/plugin-web-board-workspaces typecheck` PASS; `pnpm --filter @repo/plugin-web-board-workspaces test -- --run src/__tests__/BoardWorkspacesModule.test.tsx` PASS (38/38, existing BoardSwitcher nested button stderr warning). | pending | feature-verify |
| 2026-06-03 20:33 PDT | gpt-5.3-codex | feature-review - APPROVED. Re-reviewed the revised planning pack against the current `plugin-web-board-{core,workspaces,views}` runtime seams and confirmed both prior blockers are resolved in build-safe docs: raw-vs-visible ordering/write semantics now route through active-list selectors plus `listId` ownership, and first-run keyed Basic Kanban list management is explicitly supported while preserving immutable `key` / `pm-*` semantics. | - | feature-build |
| 2026-06-03 20:58 PDT | gpt-5.3-codex | feature-verify - BLOCKED. Reviewed planning/runtime commits `f150957`, `9ad61e6`, `792572e`, `3136b87`, and `a6a0ebb`; reran package lint/typecheck/test for `plugin-web-board-{core,views,workspaces}` plus `git diff --check 505ef0a..HEAD`. Result: automated checks passed, but `/app/board` still violates the approved `customName`-first keyed-list name-resolution contract on the row #2 card-detail modal path, and the current workspace tests do not cover that regression. | f150957, 9ad61e6, 792572e, 3136b87, a6a0ebb | feature-build |
| 2026-06-03 21:06 PDT | gpt-5 | feature-verify - PASS (REVERIFY). Reviewed commits `f150957`, `9ad61e6`, `792572e`, `3136b87`, `a6a0ebb`, and `bd8066d`; verified the card-detail customName-first fix plus `BWM-LIST-1b`; reran `git diff --check 505ef0a..HEAD` and package lint/typecheck/test for `plugin-web-board-{core,views,workspaces}`. Result: blocker fix is complete, commit scope remains clean, and row #4 is ready to ship with only pre-existing test stderr warnings/no manual browser rerun as residual risk. | f150957, 9ad61e6, 792572e, 3136b87, a6a0ebb, bd8066d | ship |
| 2026-06-03 21:08 PDT | gpt-5 | ship - PASS. Completed parent Web-level verification after feature-verify: `pnpm --filter @repo/web check-types`, `pnpm --filter @repo/web test -- --run` (`116/116`), `pnpm --filter @repo/web build`, post-build `build-manifest.test.ts` (`2/2`), `curl -I http://localhost:3001/app/board` (`HTTP 200`), and Playwright Chromium screenshot smoke at `/tmp/xai-board-list-crud-smoke.png`. Roadmap, PLUGIN_MAP, and this dev log updated to SHIPPED. | bd8066d | xai-web-board-card-crud |
