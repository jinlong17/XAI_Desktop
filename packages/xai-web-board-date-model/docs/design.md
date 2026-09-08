# Design — xai-web-board-date-model

> Decision snapshot for the Web Project module P0 typed date contract on `/app/board`.

## Selected Option

**Option A** — promote `startDate` / `dueDate` as the canonical persisted date fields in `@repo/plugin-web-board-core`, keep legacy display fields as compatibility output only, and migrate Board/Table/Calendar/Timeline/Dashboard to shared typed-date helpers instead of raw string parsing.

## Review Doc Path

`docs/reviews/xai-web-board-date-model/20260603-discovery-review.md`

## Review Date / Version

2026-06-03 / v1

## Dependency Overview

```text
packages/xai-web-board-date-model/docs/   (workflow anchor only)

Runtime ownership
  plugin-web-board-core
    ├── owns canonical startDate / dueDate contract
    ├── owns legacy-load narrowing + typed-date helper derivation
    ├── owns compatibility write rules for start / due / dueEn / dueLate
    └── remains the only owner of xai_boards_v2 board-card persistence semantics

  plugin-web-board-views
    ├── owns Board/Table/Calendar/Timeline/Dashboard adoption
    ├── consumes board-core typed-date helpers
    └── stops treating localized display strings as business-logic inputs

  plugin-web-board-workspaces
    ├── preserves row #2 card-detail modal date editing
    ├── aligns Planner and board-level compatibility surfaces when needed
    └── stays on the same board writer path through BoardWorkspacesModule

Non-owners
  apps/web shell registrations          -> unchanged for this slice
  plugin-web-storage registry          -> unchanged for this slice
  xai-web-board-storage-contract       -> owns future schemaVersion / migration work
  plugin-project runtime               -> reference only, no imports
```

## Frozen Assumptions

1. **Current route truth stays `/app/board`.** This row does not add host routing, aliases, or nested board-detail routes.
2. **`startDate` / `dueDate` are the canonical persisted date fields for row #3.** They remain `YYYY-MM-DD` date-only strings.
3. **`start` / `due` / `dueEn` / `dueLate` become compatibility outputs, not business-logic inputs.**
4. **No new storage key and no schemaVersion.** Formal storage-contract migration belongs to `xai-web-board-storage-contract`.
5. **No eager destructive migration on read.** Legacy `xai_boards_v2` blobs must load safely without a blanket rewrite.
6. **Recoverable `M/D` uses one exact year rule.** Board-core anchors legacy `M/D` to the injected local `now` year, then applies a Dec/Jan rollover correction only for obvious year-boundary cases such as `2026-01-02 + 12/31 -> 2025-12-31` and `2026-12-31 + 1/1 -> 2027-01-01`.
7. **Legacy payloads split into recoverable vs ambiguous.** `Today` / `今天` / recoverable `M/D` may be interpreted by board-core helpers; ambiguous values like `Overdue` / `过期` must not be converted into fabricated ISO dates.
8. **Board/Table/Dashboard due state is `dueDate`-only.** `startDate` never drives due-today, overdue, or within-week semantics for this row.
9. **Calendar placement is `dueDate`-only.** `dueDate`-only cards place on the due day; `startDate`-only cards do not place in Calendar.
10. **Timeline is the only range view.** `dueDate`-only cards render as a single-day marker on `dueDate`; `startDate`-only cards do not place; `startDate > dueDate` fails soft with no placement and no auto-swap/clamp.
11. **Row #2 card-detail modal behavior is preserved.** The existing date inputs continue to edit `startDate` / `dueDate` independently through the current board writer.
12. **Compatibility writes stay narrow.** Row #3 may derive legacy fields in memory and dual-write compatibility outputs on explicit date edits only; it must not add `schemaVersion`, whole-blob rewrite-on-read, new storage keys, backend sync, or route changes.
13. **Local-date semantics only.** Comparisons for today/overdue/week are based on the user's local day boundary, not UTC-midnight interpretation.
14. **Secondary compatibility surfaces may be touched if needed.** Planner and due-range filtering should not contradict the new typed model, but they are not allowed to expand the feature into storage-contract work.
15. **No backend sync, no export/import, no calendar cross-module feed.** Those remain later roadmap rows.
16. **Runtime scope stays inside `plugin-web-board-core`, `plugin-web-board-views`, and `plugin-web-board-workspaces`.**

## Exact File Ownership

### `plugin-web-board-core`

- `src/types.ts`
- `src/internal/boardOps.ts`
- `src/internal/persistence.ts`
- `src/internal/isBoardArray.ts`
- `src/index.ts`
- `src/BoardCard.tsx`
- corresponding `src/__tests__/*`

### `plugin-web-board-views`

- `src/internal/dateOps.ts`
- `src/internal/dueShortcuts.ts`
- `src/internal/filter.ts`
- `src/TableView.tsx`
- `src/BoardCalendarView.tsx`
- `src/TimelineView.tsx`
- `src/BoardDashboardView.tsx`
- corresponding `src/__tests__/*`

### `plugin-web-board-workspaces`

- `src/BoardWorkspacesModule.tsx`
- `src/PlannerPanel.tsx`
- `src/BoardCardDetailModal.tsx`
- corresponding `src/__tests__/*`

## Out of Scope

- adding `schemaVersion` or whole-blob migration orchestration
- whole-blob rewrite-on-read or implicit storage cleanup
- creating new logical storage entities for board/list/card/checklist/comment
- new storage keys or storage ownership transfers
- backend sync or encrypted-blob decomposition
- global Calendar module feed
- task-linking, saved filters, export/import, share envelope, or permissions
- route or shell redesign beyond `/app/board`
