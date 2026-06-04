# API Contract — xai-web-board-date-model

> Planning contract for the Web Project module typed-date row. This document defines the intended runtime seam for board-card dates; it does not imply the implementation already exists.

## 0. Runtime contract summary

This row does not introduce a new module, storage key, or backend contract. It tightens the existing board-card date model inside the current Web board package family:

- `@repo/plugin-web-board-core` owns canonical typed date fields, compatibility narrowing, and derived date helpers.
- `@repo/plugin-web-board-views` consumes those helpers in Board/Table/Calendar/Timeline/Dashboard flows.
- `@repo/plugin-web-board-workspaces` preserves the row #2 detail-modal editor and aligns dependent compatibility surfaces when necessary.

## 1. Canonical board-card date fields

Recommended persisted authority:

```ts
type BoardIsoDate = string; // constrained at runtime to YYYY-MM-DD

interface BoardCard {
  startDate?: BoardIsoDate;
  dueDate?: BoardIsoDate;
}
```

Validation rule:

- accepted format is `YYYY-MM-DD`
- invalid ISO-like values are rejected by guards and should not become authoritative typed state

## 2. Compatibility fields

Persisted compatibility fields may continue to appear in existing blobs:

```ts
interface BoardCard {
  start?: string;
  due?: string;
  dueEn?: string;
  dueLate?: boolean;
}
```

Contract change for this row:

- consumers must stop using these fields as the primary business-logic source
- board-core may keep writing them temporarily as compatibility output while current surfaces are migrated
- row #7 may later remove or formally version them under a storage-contract migration

## 3. Board-core helper seam

Recommended additive board-core helper contract:

```ts
interface BoardCardDateMeta {
  startDate?: BoardIsoDate;
  dueDate?: BoardIsoDate;
  startLabel: { en: string; zh: string } | null;
  dueLabel: { en: string; zh: string } | null;
  isDueToday: boolean;
  isOverdue: boolean;
  isWithinWeek: boolean;
  isLegacyAmbiguous: boolean;
}
```

Recommended pure helpers:

```ts
function normalizeBoardCardDates(
  card: BoardCard,
  now?: Date,
): BoardCard;

function getBoardCardDateMeta(
  card: BoardCard,
  now?: Date,
): BoardCardDateMeta;

function isoDateFromOffset(
  offset: number,
  now: Date,
): BoardIsoDate;
```

Behavioral intent:

- `normalizeBoardCardDates(...)` is the compatibility seam between legacy blobs and typed fields
- `getBoardCardDateMeta(...)` is the shared cross-view derivation seam
- `isoDateFromOffset(...)` or equivalent keeps drag/drop and quick-shortcut writers on ISO output
- `now` is an injectable local-date anchor for both hydration and derived today/overdue semantics; views must not substitute their own implicit clock rules

Exact helper names may differ in build, but the ownership split should not.

## 4. Legacy compatibility contract

### 4.1 Load states

`xai_boards_v2` card dates may load as:

1. **typed** — valid `startDate` / `dueDate`
2. **recoverable legacy** — parseable `Today` / `今天` / `M/D`
3. **ambiguous legacy** — values that cannot safely become a real date

### 4.2 Required semantics

- typed cards are authoritative as-is
- recoverable legacy cards may be normalized in memory to typed form
- ambiguous legacy cards must remain readable and non-crashing
- ambiguous legacy cards must not be assigned fabricated ISO dates on read
- opening or rendering such a card must not wipe unrelated fields
- recoverable `M/D` values use one exact rule:
  - parse against the injected local `now` year first
  - if the current-year candidate would only make sense by crossing the Dec/Jan boundary, shift by one year
  - examples: `2026-01-02 + "12/31" -> 2025-12-31`, `2026-12-31 + "1/1" -> 2027-01-01`, `2026-06-15 + "5/26" -> 2026-05-26`
  - do not use a nearest-date or rolling-future heuristic outside that Dec/Jan correction

### 4.3 Persistence rule

- no eager whole-blob rewrite just because the board is loaded
- a user-triggered date edit may rewrite the affected card into canonical typed form
- build workers may dual-write compatibility fields on save while raw-field consumers are still being removed
- row #3 may only derive or narrow legacy date fields in memory and dual-write compatibility fields on explicit date edits; it must not add `schemaVersion`, new storage keys, backend sync, route changes, or unrelated storage ownership changes

## 5. Upstream editor/write contracts

### 5.1 Row #2 detail modal

`BoardCardDetailModal` already edits:

```ts
onPatchCard({ startDate: "YYYY-MM-DD" | undefined });
onPatchCard({ dueDate: "YYYY-MM-DD" | undefined });
```

This remains valid and should not be redesigned in this row.

Range rule for the shipped row #2 surface:

- the modal continues to allow independent `startDate` and `dueDate` edits
- row #3 does not auto-swap or auto-clamp the opposite field when one field is edited
- if a card ends up with `startDate > dueDate`, that invalid range persists as entered and downstream views apply the fail-soft semantics defined below

### 5.2 Table due editor

The Table due editor should move from display-string writes to typed writes.

Expected end-state behavior:

- quick shortcuts resolve to ISO `dueDate`
- manual `<input type="date">` writes ISO `dueDate`
- displayed label comes from board-core derived meta
- Table due-state rendering is driven by `dueDate` only; `startDate` never affects due-today or overdue labeling in Table

### 5.3 Calendar and Timeline drag writes

Current drag/drop surfaces write display strings. After this row:

- Calendar day drop should commit `dueDate`
- Timeline resize/move should commit `startDate` / `dueDate`
- if compatibility fields are still dual-written, that happens inside board-core normalization, not inside the view components
- Calendar placement keys off `dueDate` only; `startDate` is ignored for placement in Calendar
- Timeline uses both fields only when `startDate <= dueDate`
- `dueDate`-only cards render as a single-day Timeline marker on `dueDate` without persisting a synthetic `startDate`
- `startDate`-only cards do not render in Timeline
- if a Timeline interaction would emit `startDate > dueDate`, the write is rejected and the previous persisted card values remain unchanged

## 6. Downstream consumer rules

### `plugin-web-board-core`

- `BoardCard.tsx` should render due chips from derived meta instead of raw `due` / `dueEn` / `dueLate`
- Board-chip due state is driven by `dueDate` only

### `plugin-web-board-views`

- `BoardCalendarView` day grouping must be based on typed dates
- `TimelineView` bar placement and drag math must be based on typed dates
- `BoardDashboardView` KPI counts must derive overdue/today state from typed meta
- filter helpers must derive today/overdue/week semantics from typed data
- Dashboard due-today and overdue KPIs are driven by `dueDate` only
- `startDate > dueDate` must fail soft with no Timeline placement and no hidden rewrite

### `plugin-web-board-workspaces`

- `PlannerPanel` should use typed or helper-derived "due today" semantics
- `BoardWorkspacesModule` should continue routing all writes through the same `updateCardInList(...)` path
- Planner "today" seeding is a `dueDate`-only compatibility surface, not a `startDate` surface

## 7. Error semantics

This row stays local-only and fail-soft.

- malformed `xai_boards_v2` blob -> existing board-core fallback rules still apply
- invalid ISO field on one card -> that card should fail validation or normalize safely; the module must not crash the whole board
- ambiguous legacy display value -> readable card, no fabricated date, no crash
- `startDate > dueDate` -> readable card, no fabricated swap/clamp, no Timeline placement, no crash
- stale or missing list/card reference after a date edit -> no crash, no-op through current board writer

## 8. Idempotency and consistency notes

- loading a typed board and immediately closing it must not rewrite storage
- reopening a card without editing dates must not rewrite storage
- the same card should produce the same today/overdue classification across Board/Table/Calendar/Timeline/Dashboard for the same injected `now`
- date-aware views must not each reinvent their own `Today` / overdue / week window semantics after this row
- `dueDate`-only cards must classify identically across Board/Table/Calendar/Timeline/Dashboard for the same injected `now`
- row #3 compatibility writes happen on explicit date edits only; reads alone are not migration triggers

## 9. Testable outcomes

- cards edited through detail, table, calendar, or timeline converge on the same persisted `startDate` / `dueDate` fields
- Board/Table/Calendar/Timeline/Dashboard agree on due-today and overdue counts
- legacy `xai_boards_v2` payloads with recoverable display dates still render in the current module
- ambiguous legacy date values fail soft instead of being dropped or converted to fake dates
- `dueDate`-only, `startDate`-only, and `startDate > dueDate` cards follow one frozen placement/classification contract across all primary views
- no storage key, route, or host-shell contract changed
