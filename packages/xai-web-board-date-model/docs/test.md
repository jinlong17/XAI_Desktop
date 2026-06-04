# Test Strategy — xai-web-board-date-model

## 1. Test framework

- Reuse package-local Vitest + jsdom setups in `plugin-web-board-core`, `plugin-web-board-views`, and `plugin-web-board-workspaces`.
- Keep tests near the owning runtime package; do not add a new runner under this workflow anchor package.

## 2. Unit coverage

### `plugin-web-board-core`

- ISO guard accepts valid `startDate` / `dueDate`
- ISO guard rejects malformed typed dates
- legacy `Today` / `今天` / `M/D` values normalize into recoverable typed form when allowed
- recoverable legacy `M/D` values follow the frozen current-year-plus-Dec/Jan-rollover rule for an injected `now`
- ambiguous legacy values remain readable without fabricated ISO output
- derived meta returns stable today/overdue/week booleans for an injected `now`
- compatibility labels for Board-card chip rendering derive from typed dates, not stored `dueLate`

### `plugin-web-board-views`

- date helper consumers use typed meta consistently in:
  - `TableView`
  - `BoardCalendarView`
  - `TimelineView`
  - `BoardDashboardView`
  - `internal/filter.ts`
- quick shortcuts and drag/drop writers commit ISO dates rather than `Today` or `M/D` strings
- `dueDate`-only, `startDate`-only, and `startDate > dueDate` cards follow one frozen placement/classification rule across Calendar/Timeline/Dashboard

### `plugin-web-board-workspaces`

- detail modal date edits still write `startDate` / `dueDate`
- planner-slot derivation treats a typed due-today card as due today
- detail modal preserves independent edits without auto-swap or auto-clamp
- legacy-board reload path does not break active-card lookup or board switching

## 3. Contract coverage

### Core compatibility cases

- typed card with `dueDate` only -> Board/Table/Calendar/Timeline/Dashboard all classify it consistently
- recoverable legacy card with `due: "Today"` -> loads safely and is treated as due today
- recoverable legacy card with `due: "5/26"` -> loads safely under the frozen year-inference rule
- recoverable legacy card with `now=2026-01-02` and `due: "12/31"` -> normalizes to `2025-12-31`
- recoverable legacy card with `now=2026-12-31` and `due: "1/1"` -> normalizes to `2027-01-01`
- ambiguous legacy card with `due: "Overdue"` or `dueEn: "Overdue"` -> loads safely but does not receive a fabricated canonical ISO date

### Persistence cases

- detail-modal edit of due date persists `dueDate`
- Table quick shortcut persists `dueDate`
- Calendar day drop persists `dueDate`
- Timeline move/resize persists `startDate` / `dueDate`
- no-edit reload does not rewrite storage just because a card was read
- explicit date edits may dual-write compatibility fields, but read-only load/render never triggers whole-blob rewrite or new storage keys

### Cross-view consistency cases

- one card edited in detail immediately updates:
  - Board due chip
  - Table due cell
  - Calendar placement
  - Timeline bar span
  - Dashboard due-today / overdue KPIs
- `dueDate`-only card -> Board/Table/Dashboard classify due state from `dueDate`; Calendar places on `dueDate`; Timeline renders a single-day marker on `dueDate`
- `startDate`-only card -> Board/Table/Dashboard do not mark due state; Calendar has no placement; Timeline has no placement
- `startDate > dueDate` card -> Board/Table/Dashboard still derive due state from `dueDate`; Calendar still places by `dueDate`; Timeline fails soft with no placement; detail modal continues to show the stored fields

## 4. Integration / regression scenarios

1. Seed a board with canonical ISO dates only -> all primary views render the card in the same day state.
2. Seed a board with legacy `Today` / `今天` only -> current module still renders without crashing and classifies the card consistently.
3. Seed a board with legacy `M/D` only -> current module still renders without crashing and classifies the card consistently under the documented inference rule.
4. Seed a board with ambiguous `Overdue` only -> Board card remains readable; Calendar/Timeline fail soft instead of inventing placement.
5. Seed `dueDate`-only, `startDate`-only, and `startDate > dueDate` cards and confirm each view follows the frozen placement/classification rule.
6. Change a due date in the detail modal, reload, and confirm Board/Table/Calendar/Timeline/Dashboard stay aligned.
7. Drag a card in Calendar and then inspect Timeline and Dashboard without reload.
8. Resize a Timeline bar and then inspect Board/Table and the detail modal without reload.

## 5. Mock strategy

- keep `usePref` localStorage-backed in tests
- inject `now: Date` into pure helpers wherever possible
- use fake timers only when needed to stabilize "today" boundaries
- do not mock backend sync, encrypted blobs, or schema-version layers; they are out of scope for this row
- do not import `plugin-project` or later storage-contract helpers
- do not simulate schema-version upgrade paths, route changes, or whole-blob rewrite-on-read; those belong to row #7 or later

## 6. Acceptance criteria

| ID | Acceptance |
|---|---|
| AC1 | `startDate` / `dueDate` are the authoritative persisted fields for new date edits. |
| AC2 | Board card due chips are derived from typed-date helpers, not raw display strings. |
| AC3 | Table due editing writes ISO fields and still renders localized labels correctly. |
| AC4 | Calendar placement and day-drop writes are driven by typed dates. |
| AC5 | Timeline placement and drag writes are driven by typed dates. |
| AC6 | Dashboard due-today and overdue KPIs are derived from typed dates. |
| AC7 | Legacy `xai_boards_v2` payloads with recoverable display dates still load safely. |
| AC8 | Ambiguous legacy date values fail soft and do not trigger fabricated migrations. |
| AC9 | Row #2 card-detail modal date editing remains functional. |
| AC10 | No schemaVersion, whole-blob rewrite-on-read, new storage key, backend sync contract, or route change is introduced. |

## 7. Manual verification checklist

- Open `/app/board` and inspect one board in Board, Table, Calendar, Timeline, and Dashboard views.
- Edit a card due date from the detail modal and confirm all primary views update.
- Use Table quick shortcuts and confirm Calendar/Timeline placement updates.
- Drag a card in Calendar and Timeline and confirm Dashboard counts update.
- Reload the page with an older `xai_boards_v2` payload and confirm the module still opens.
- Confirm no host route or storage-registry behavior changed while testing this row.
