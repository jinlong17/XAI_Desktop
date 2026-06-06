# Discovery Review — xai-web-board-date-model

| Field | Value |
|---|---|
| Date | 2026-06-03 |
| Feature | `xai-web-board-date-model` |
| Feature Title | Web Project module P0 typed date contract |
| Canonical Name Rationale | Matches roadmap row #3 exactly and keeps scope on the Web board date contract rather than row #7 storage-version work or broader Project-module naming. |
| Roadmap Manifest | `docs/workflow/roadmap/xai-web-project-module.md` row #3 |
| Requirement | Replace opaque display date strings with typed ISO date fields and derived today/overdue labels across Board/Table/Calendar/Timeline/Dashboard while preserving legacy `xai_boards_v2` blobs and deferring formal schema-version migration to row #7. |
| Status | Draft for feature-review |
| External Research | No external research required — internal runtime contract slice, no new library selection |

## 1. Problem framing

Row #2 (`xai-web-board-card-detail`) already introduced additive `startDate` and `dueDate` fields plus the detail modal date editor, but the rest of the board runtime still treats `start`, `due`, `dueEn`, and `dueLate` as operational truth. `BoardCard`, `TableView`, `BoardCalendarView`, `TimelineView`, `BoardDashboardView`, filter helpers, and `PlannerPanel` still parse or compare display strings such as `5/26`, `Today`, and `今天`.

That split is now the main product risk:

- display strings are locale-specific and not trustworthy for cross-view logic
- `dueLate` is stored as a flag instead of derived from a typed date
- calendar and timeline placement depend on parsing `M/D` strings with no explicit year
- legacy values such as `Overdue` / `过期` can be displayed but do not provide a recoverable actual date

This row should make typed ISO fields the incremental authority without expanding into row #7's storage-contract migration. The goal is not to redesign persistence. The goal is to define one typed date contract that the current `/app/board` runtime can execute safely now.

## 2. Current code findings

### 2.1 What already exists

- `packages/plugin-web-board-core/src/types.ts` already carries additive `startDate?: string` and `dueDate?: string`.
- `packages/plugin-web-board-core/src/internal/boardOps.ts` already derives legacy display fields from ISO input during `normalizeBoardCardDetail(...)`.
- `packages/plugin-web-board-workspaces/src/BoardCardDetailModal.tsx` already edits `startDate` and `dueDate` through native `<input type="date">`.
- `packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx` already centralizes card writes through `updateCardInList(...)`.

### 2.2 What is still legacy-bound

- `packages/plugin-web-board-core/src/BoardCard.tsx` renders due chips from `due` / `dueEn` / `dueLate`.
- `packages/plugin-web-board-views/src/internal/dateOps.ts` parses only `M/D` and `Today` / `今天`.
- `TableView`, `BoardCalendarView`, `TimelineView`, and `BoardDashboardView` all still read raw legacy fields directly.
- `packages/plugin-web-board-views/src/internal/filter.ts` uses `due`, `dueLate`, and `parseDay(card.due, today)`.
- `packages/plugin-web-board-workspaces/src/PlannerPanel.tsx` seeds "today" slots from `due === "Today" | "今天" | M/D`.

### 2.3 Constraint from prior rows

- Row #1 (`xai-web-project-prd-sync`) is already satisfied in this branch baseline via `e79ecc5`.
- Row #2 (`xai-web-board-card-detail`) is already shipped via `de9e120`, so this row must preserve the new detail-modal date editing contract rather than reopen it.
- Current branch HEAD includes `2c0004c`, so the roadmap status context is aligned before planning starts.

## 3. Candidate options

### Option A — Incremental typed-date core contract with legacy compatibility helpers

Keep `startDate` / `dueDate` as the persisted authority, add central board-core date helpers for:

- ISO validation and parsing
- recoverable legacy-string hydration
- derived display labels (`Today`, `Overdue`, localized `M/D`)
- derived booleans (`isDueToday`, `isOverdue`, `isWithinWeek`)

Then migrate Board/Table/Calendar/Timeline/Dashboard to consume those helpers instead of reading raw display strings directly.

Pros:

- stays inside the three allowed runtime packages
- preserves current `xai_boards_v2` ownership and avoids schema-version work
- gives every view the same definition of "today" and "overdue"
- preserves row #2's detail-modal behavior without another storage surface

Cons:

- requires a temporary compatibility bridge for legacy cards
- forces disciplined removal of direct `card.due` / `card.dueLate` logic across multiple views

### Option B — Row #3 also introduces `schemaVersion` and whole-blob migration

Rejected.

Why:

- directly conflicts with the roadmap split; row #7 owns formal storage-contract and schema-version work
- broadens scope into storage registry / export-sync territory
- creates planning drift against the explicit user constraint

### Option C — Leave raw display strings in storage as the real source and just improve parsing

Rejected.

Why:

- fails the product requirement to replace opaque display strings with typed ISO fields
- keeps localized strings as business logic input
- does not solve reliable overdue or calendar/timeline ownership

### Option D — Eagerly rewrite every legacy blob on load

Rejected.

Why:

- dangerous without row #7's explicit migration contract
- impossible to do faithfully for ambiguous values like `Overdue` / `过期` with no recoverable date
- would introduce silent destructive behavior into local storage reads

## 4. Recommendation

Choose **Option A**.

### 4.1 Canonical date contract

For row #3, the canonical persisted fields are:

```ts
interface BoardCard {
  startDate?: string; // YYYY-MM-DD
  dueDate?: string;   // YYYY-MM-DD
}
```

Compatibility fields remain tolerated in persisted blobs but are demoted:

```ts
interface BoardCard {
  start?: string;   // compatibility display only
  due?: string;     // compatibility display only
  dueEn?: string;   // compatibility display only
  dueLate?: boolean; // compatibility flag only
}
```

Rule:

- new date edits must persist `startDate` / `dueDate`
- views must derive labels and overdue/today state from typed fields
- legacy display fields may still be written as compatibility output until every current surface is switched

### 4.2 Legacy compatibility behavior

`xai_boards_v2` blobs must load in three states:

1. **Typed card**: valid `startDate` / `dueDate` present. Use them directly.
2. **Recoverable legacy card**: missing ISO fields, but `start` / `due` can be safely interpreted from:
   - `Today` / `今天`
   - `M/D`
3. **Ambiguous legacy card**: values like `Overdue` / `过期` or malformed strings with no trustworthy actual date.

Compatibility policy:

- recoverable legacy cards may be hydrated to in-memory typed values by board-core helpers
- ambiguous legacy cards must remain readable and non-crashing, but the code must not invent fake ISO dates
- ambiguous cards should surface as "legacy-ambiguous" in helper output so calendar/timeline/dashboard logic can fail soft instead of fabricating placement
- recoverable `M/D` values use one exact board-core rule: anchor to the injected local `now` year first, then apply a Dec/Jan rollover correction only when the current-year candidate would obviously cross the year boundary
  - `now = 2026-01-02`, `due = "12/31"` -> `2025-12-31`
  - `now = 2026-12-31`, `due = "1/1"` -> `2027-01-01`
  - `now = 2026-06-15`, `due = "5/26"` -> `2026-05-26`
  - `now = 2026-06-15`, `due = "12/20"` -> `2026-12-20`
- past dates stay in the current year unless that Dec/Jan rollover correction applies; row #3 does not use a "nearest date in either year" heuristic
- no eager whole-blob rewrite on read
- the next explicit date edit may rewrite the edited card into typed form through the normal update path
- row #3 may only narrow or derive legacy date fields in memory and dual-write compatibility fields on explicit date edits; it must not add `schemaVersion`, whole-blob rewrite-on-read, new storage keys, backend sync, or route changes

### 4.3 View ownership boundaries

`plugin-web-board-core` owns:

- ISO date field contract
- load-time compatibility narrowing
- legacy-to-typed hydration helpers
- localized date-badge derivation for Board-card chips
- shared parse/format helpers reusable by downstream views

`plugin-web-board-views` owns:

- Table due editor adoption to typed writes
- Calendar day grouping from typed fields
- Timeline bar placement and drag writes from typed fields
- Dashboard KPI derivation from typed fields
- filter-range semantics based on derived helper output, not raw display strings

`plugin-web-board-workspaces` owns:

- preserving row #2 detail-modal `startDate` / `dueDate` editing
- Planner "today" slot derivation compatibility
- active-board reload safety when legacy cards are present

Non-owners:

- `apps/web` host routing
- backend sync
- storage registry schema versioning
- `plugin-project`

### 4.4 Frozen cross-view date semantics

- **Board / Table / Dashboard / filter / Planner due state**: driven by `dueDate` only. `startDate` never changes due-today, overdue, or within-week classification.
- **Calendar placement**: driven by `dueDate` only. A `dueDate`-only card appears on its due day. A `startDate`-only card has no Calendar placement. If `startDate > dueDate`, Calendar still keys off `dueDate` because Calendar is not a range view.
- **Timeline placement**:
  - `startDate` + `dueDate` with `startDate <= dueDate` -> render an inclusive span.
  - `dueDate` only -> render a single-day bar or milestone on `dueDate` for display only; do not persist a synthetic `startDate`.
  - `startDate` only -> no Timeline placement.
  - `startDate > dueDate` -> fail-soft no placement on load; keep the card editable elsewhere and do not auto-swap or clamp persisted fields.
- **Row #2 detail modal**: continues to allow independent `startDate` and `dueDate` edits through the current writer path. Row #3 preserves that independence and does not add auto-swap or auto-clamp behavior in the modal.
- **Write rule for invalid ranges**: explicit date editors may persist the field the user changed without hidden rewrite of the other field; Timeline interactions must reject any outbound patch that would invert the range and leave the previous persisted values unchanged.

### 4.5 Recommended helper split

Recommended board-core additions:

```ts
interface BoardCardDateMeta {
  startDate?: string;
  dueDate?: string;
  startLabel: { en: string; zh: string } | null;
  dueLabel: { en: string; zh: string } | null;
  isDueToday: boolean;
  isOverdue: boolean;
  isWithinWeek: boolean;
  isLegacyAmbiguous: boolean;
}
```

Recommended behavior:

- one pure helper to normalize/hydrate raw card date fields
- one pure helper to derive UI-facing date meta from the normalized card
- one pure helper to format drag/drop or quick-pick writes back into ISO date strings

This keeps persistence and view logic separated:

- persistence helpers decide what is canonical or recoverable
- views consume `BoardCardDateMeta`

### 4.6 Scope correction for dependent surfaces

The roadmap note names Board/Table/Calendar/Timeline/Dashboard explicitly. This row should treat those as the primary acceptance scope. `FilterPopover` and `PlannerPanel` are secondary compatibility surfaces that should be updated in the same build if their raw-string logic would otherwise contradict the new typed model.

That keeps the public requirement intact without pretending those dependent surfaces do not exist.

## 5. Exact file ownership

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

## 6. Build recommendation

### Phase P1 — board-core typed contract + compatibility helpers

- freeze `startDate` / `dueDate` as canonical
- add legacy-load compatibility helpers and derived meta contract
- harden guards and `loadBoardsOrDefault(...)` behavior
- update Board-card chip rendering to derive from typed meta

### Phase P2 — view migration to typed helpers

- migrate Table / Calendar / Timeline / Dashboard
- replace raw-string parsing and `dueLate` reads with typed helper output
- make date drag/drop and quick shortcuts write ISO values

### Phase P3 — workspace compatibility + regression hardening

- preserve detail-modal edits from row #2
- align Planner and due-filter behavior with the typed model
- add reload coverage for recoverable and ambiguous legacy payloads

## 7. Risks and review focus

1. **Ambiguous legacy values**: `Overdue` / `过期` has no trustworthy original date. The recommendation remains fail-soft compatibility, not fabricated migration.
2. **Year-rule drift in implementation**: board-core, Planner, Calendar, and tests must all use the same current-year-plus-Dec/Jan-rollover rule instead of reintroducing local parsing.
3. **Timezone boundary**: date-only ISO fields should be treated as local-date semantics for this Web module; mixing UTC-midnight parsing with local comparisons would cause off-by-one regressions.
4. **Partial migration drift**: any view left on raw `card.due` logic will break the contract, so build workers need a clear search-and-replace inventory.
5. **Row bleed into #7**: row #3 may derive in memory and dual-write compatibility fields on explicit date edits only; it still must not add `schemaVersion`, new storage keys, whole-blob migration batches, sync contracts, or route changes.

## 8. Review focus

Please review specifically:

1. whether `startDate` / `dueDate` should be treated as the only canonical persisted date fields for row #3,
2. whether the frozen current-year-plus-Dec/Jan-rollover `M/D` rule is precise enough for build and verify,
3. whether the frozen partial/range semantics are precise enough across Board/Table/Calendar/Timeline/Dashboard plus the shipped row #2 detail modal,
4. whether `BoardCardDateMeta` remains the right cross-package seam after those rules are fixed.
