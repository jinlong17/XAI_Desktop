# Test Strategy — xai-web-board-card-detail

## 1. Test framework

- Reuse package-local Vitest + jsdom setups in `plugin-web-board-core`, `plugin-web-board-views`, and `plugin-web-board-workspaces`.
- Prefer focused unit/integration additions inside the owning runtime package instead of creating a new test runner under this workflow anchor package.

## 2. Unit coverage

### `plugin-web-board-core`

- schema guards accept legacy cards without new detail fields
- schema guards accept additive detail fields when present
- compatibility helpers derive aggregate checklist counts from `checklistItems`
- compatibility helpers derive attachment count from `attachments`
- date bridge helpers derive legacy display fields from `startDate` / `dueDate` without breaking current display behavior
- `BoardMemberOption` and `BOARD_MEMBER_OPTIONS` export consistently from the public barrel with the agreed `{ id, name, color }` shape

### `plugin-web-board-workspaces`

- detail-surface reducers/edit handlers update the intended field only
- checklist CRUD keeps item order stable and aggregate progress correct
- attachment add/remove validation rejects invalid URLs without mutating saved state
- modal open/close state resets correctly when active board/card changes

### `plugin-web-board-views`

- view components call `onOpenCard` with the expected card/list references
- no alternate view crashes when cards contain the new additive fields

## 3. Contract coverage

### Core contract cases

- legacy `xai_boards_v2` payload without detail fields still loads
- edited cards persist new fields through the existing board blob
- opening a stale/missing card id is a safe no-op

### Cross-view contract cases

- detail edit updates the same underlying card entity observed by Kanban and Table
- checklist edits update both detail view and aggregate progress displays
- attachment edits update current card chip/count displays
- label/member edits remain consistent with existing filter and table surfaces
- Table and detail editors consume the same `BOARD_MEMBER_OPTIONS` export instead of package-local member mocks

### Date bridge contract cases

- editing start/due from detail preserves current Calendar/Timeline visibility for the card
- this row does not require full ISO-native rewrites in alternate views

## 4. Integration / regression scenarios

### Core interaction scenarios

1. Click a Kanban card -> detail modal opens with the correct card content.
2. Click a Table title cell -> same detail modal opens.
3. Click a Calendar card -> same detail modal opens.
4. Click a Timeline bar body -> same detail modal opens.
5. Click a Planner real-card slot -> same detail modal opens.

### Persistence scenarios

1. Edit title + description -> reload -> values preserved.
2. Add checklist items, toggle completion, delete one -> reload -> values preserved and progress chip updated.
3. Add two attachment links, remove one -> reload -> remaining link preserved and attach count updated.
4. Edit labels and members -> Table and filter surfaces show updated ids/options without reload.
5. Edit start/due from detail -> Calendar/Timeline still place the card in the expected day span after reload.

### Safety scenarios

1. Load pre-row board data with no detail fields -> no crash, empty sections render.
2. Load malformed optional detail arrays on one card -> module falls back safely instead of crashing the entire board.

## 5. Mock strategy

- `usePref` remains real localStorage-backed storage in tests.
- Fake timers are appropriate for deterministic generated ids or activity timestamps.
- URL validation should be tested with plain string inputs; no network fetch or metadata lookup is needed.
- shared member fixtures should come from `@repo/plugin-web-board-core` `BOARD_MEMBER_OPTIONS`, not a duplicated local `MOCK_MEMBERS` array
- Do not mock `plugin-project`; this row must not depend on it.

## 6. Acceptance criteria

| ID | Acceptance |
|---|---|
| AC1 | Clicking a Kanban card opens a real detail modal. |
| AC2 | Table, Calendar, Timeline, and Planner can open the same detail surface. |
| AC3 | Title edits persist through `xai_boards_v2`. |
| AC4 | Description edits persist through `xai_boards_v2`. |
| AC5 | Checklist item CRUD persists and updates aggregate progress displays. |
| AC6 | Attachment/link CRUD persists and updates current attachment count displays. |
| AC7 | Label and member edits persist using the current board-local label/member models, with member options sourced from the shared board-core export. |
| AC8 | Start/due edits persist and keep current Board/Table/Calendar/Timeline behavior functional. |
| AC9 | Legacy boards without new detail fields still load safely. |
| AC10 | No routing/shell registration change is required for this P0 modal slice. |

## 7. Manual verification checklist

- Open `/app/board`, click cards from at least Kanban + Table + Calendar.
- Edit title, description, labels, members, checklist, links, and dates.
- Refresh the page and verify the same card data is still present.
- Confirm checklist progress and attachment counts still match card chips/table cells.
- Confirm a board seeded before this feature still opens without crash.
