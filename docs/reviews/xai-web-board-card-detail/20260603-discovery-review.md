# Discovery Review — xai-web-board-card-detail

| Field | Value |
|---|---|
| Date | 2026-06-03 |
| Feature | `xai-web-board-card-detail` |
| Roadmap Manifest | `docs/workflow/roadmap/xai-web-project-module.md` |
| Requirement | First P0 slice for actionable Trello-like card detail on `/app/board` |
| Status | Revised after feature-review blockers |
| External Research | No external research required — internal product slice, no new library selection |

## 1. Problem framing

The current Web board stack already has the right shell split for this feature, but the card interaction stops at display-level status editing. `BoardView` already exposes `onOpenCard`, `TableView` / `BoardCalendarView` / `TimelineView` already accept `onOpenCard`, and `PlannerPanel` already exposes `onOpenCard`, yet `BoardWorkspacesModule` never wires a real detail surface.

The deeper blocker is schema depth. `plugin-web-board-core` persists cards through `xai_boards_v2`, but `BoardCard` only stores title, labels, members, aggregate checklist counts, display-only due/start strings, and attachment count. That is not enough to support real title/description/checklist/link editing without either:

1. extending the board card schema in place, or
2. bypassing the current board data path and creating a parallel detail store.

Option 2 would violate the scope. This slice should stay on the current board persistence path and harden the existing module family rather than inventing a side channel.

## 2. Current code findings

### 2.1 What already exists

- `packages/plugin-web-board-core/src/BoardView.tsx` already accepts `onOpenCard(cardId, listId)`.
- `packages/plugin-web-board-core/src/BoardList.tsx` already calls `onOpenCard` from Kanban cards.
- `packages/plugin-web-board-views/src/TableView.tsx`, `BoardCalendarView.tsx`, and `TimelineView.tsx` already accept `onOpenCard`.
- `packages/plugin-web-board-workspaces/src/PlannerPanel.tsx` already accepts `onOpenCard`.
- `packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx` already owns the single persisted write path via `writeLists(...)` + `updateCardInList(...)`.

### 2.2 What is missing

- No card-detail state owner exists in `plugin-web-board-workspaces`.
- No detail component exists in any Web board package.
- `BoardCard` lacks `description`, real checklist items, link list, editable activity notes, and authoritative date fields.
- Members are duplicated as `MOCK_MEMBERS` inside `TableView` instead of a shared board-level option source.
- Checklist and attachment values are stored only as aggregates (`checklist.done/total`, `attach` count), so detail CRUD has no canonical array model to edit.
- Dates are still legacy display strings (`due`, `dueEn`, `start`, `dueLate`), which is not enough for a serious date editor by itself.
- The roadmap row #1 docs-alignment prerequisite is already satisfied in this worktree by commit `e79ecc5 docs(web): formalize project module plan`; there is no separate `xai-web-project-prd-sync` workflow anchor/dev log to wait on here.

## 3. Candidate options

### Option A — Modal-first detail surface with additive schema bridge

Create a reusable card-detail surface in `plugin-web-board-workspaces`, mount it as a modal for P0, and extend `plugin-web-board-core` with additive detail fields that still derive the legacy view fields needed by Board/Table/Calendar/Timeline today.

What changes:

- `plugin-web-board-core` becomes the authority for new detail-capable card fields and compatibility helpers.
- `plugin-web-board-workspaces` owns open/close state, modal shell, detail form sections, and write orchestration.
- `plugin-web-board-views` only passes card-open intents through and continues using the same underlying card entity.

Pros:

- Respects current package boundaries.
- Uses the existing `xai_boards_v2` write path.
- Solves click/open and persistence together.
- Lets row `xai-web-board-date-model` follow later without blocking this slice.
- Keeps future route/page reuse available by separating surface logic from the modal shell.

Cons:

- Requires a compatibility layer for checklist/date/attachment display fields.
- Adds temporary dual representation for some card fields until row #3 lands.

### Option B — Reuse desktop `@repo/plugin-project` CardDetail/model directly

Rejected.

Why:

- Violates the explicit Web runtime boundary.
- `plugin-project` data model and store are not the current `/app/board` authority.
- Would create two incompatible board card models in the same Web surface.

### Option C — Fold full typed date migration into this slice

Rejected for this row.

Why:

- That is roadmap row `xai-web-board-date-model`.
- It expands scope from “card detail usable” to “cross-view date model rewrite”.
- The current feature only needs a narrow bridge so detail edits can persist meaningful dates now.

### Option D — Route-first detail page now, modal later

Rejected for P0.

Why:

- Adds host/router churn before the detail surface is even proven.
- Current Web shell does not yet expose board-specific nested route truth.
- A modal-first surface can still be made route-compatible if its state contract is future-proofed.

## 4. Recommendation

Choose **Option A**.

### 4.1 Recommended architecture

Use a **modal-first, route-compatible** detail implementation:

- P0 ships a modal opened from the existing board UI.
- The detail body is a standalone surface component that can later be reused by a dedicated route/page shell.
- `BoardWorkspacesModule` owns `activeCardRef` state shaped as `{ boardId, listId, cardId }`.

### 4.2 Recommended schema bridge

Extend `packages/plugin-web-board-core/src/types.ts` additively. Keep current fields for compatibility, but introduce canonical detail-capable fields:

```ts
interface BoardChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

interface BoardCardAttachmentLink {
  id: string;
  url: string;
  title?: string;
}

interface BoardCardActivityEntry {
  id: string;
  kind: "note";
  body: string;
  createdAt: string;
  authorId?: string;
}

interface BoardCard {
  // existing fields stay
  description?: string;
  checklistItems?: BoardChecklistItem[];
  attachments?: BoardCardAttachmentLink[];
  activity?: BoardCardActivityEntry[];
  startDate?: string; // ISO date-only, e.g. 2026-06-03
  dueDate?: string;   // ISO date-only, e.g. 2026-06-07
}
```

Compatibility rule for this row:

- `checklist` remains a derived aggregate for card chips/table progress.
- `attach` remains a derived count/string for existing card visuals.
- `due`, `dueEn`, `dueLate`, and `start` remain compatibility fields for current views.
- `startDate` / `dueDate` are the authoritative fields for the new detail form, but this row only derives the legacy display strings; it does not rewrite all board views to consume ISO directly.

### 4.3 Recommended detail-surface scope

P0 card detail should include:

- title edit
- description edit
- start date edit
- due date edit
- labels edit using current `PM_LABELS`
- members edit using the current available member model
- link/attachment URL list add/remove
- checklist item add/toggle/edit/delete
- append-only activity note stub if phase budget permits

### 4.4 Shared member model decision

Extract the current TableView-local member options into board-core as a public type + constant pair, owned by `@repo/plugin-web-board-core` public barrel (`packages/plugin-web-board-core/src/index.ts`) and sourced from `packages/plugin-web-board-core/src/internal/seed/board-data.ts`.

Exact contract:

```ts
export interface BoardMemberOption {
  id: string;
  name: string;
  color: string;
}

export const BOARD_MEMBER_OPTIONS: readonly BoardMemberOption[];
```

The initial values should be the current shared Web board mock members (`u1/u2/u3`). `TableView` and the new card-detail surface should both consume this export instead of carrying separate local member fixtures.

### 4.5 Persistence strategy

Stay on `xai_boards_v2`.

- Existing boards without the new fields must continue to load safely.
- New detail fields are additive and optional.
- Normalization helpers in board-core should derive aggregate compatibility fields whenever detail arrays or ISO dates change.
- No `plugin-web-storage` registry edit is required in this slice.

### 4.6 Dependency prerequisite correction

Treat roadmap row #1 (`xai-web-project-prd-sync`) as a branch/docs prerequisite already satisfied by commit `e79ecc5 docs(web): formalize project module plan`, not as a separate workflow-state gate that build workers must poll in this worktree.

Execution rule for downstream agents:

- branches containing `e79ecc5` may proceed with this feature's implementation plan
- if the referenced project-module docs drift after `e79ecc5`, re-audit the prerequisite before build resumes

## 5. Exact ownership

### `plugin-web-board-core` owns

- additive `BoardCard` detail schema
- new detail item types
- compatibility normalization helpers
- public `BoardMemberOption` type + `BOARD_MEMBER_OPTIONS` source
- guard updates for persisted board arrays
- seed updates for richer example cards when useful

Likely files:

- `packages/plugin-web-board-core/src/types.ts`
- `packages/plugin-web-board-core/src/internal/isBoardArray.ts`
- `packages/plugin-web-board-core/src/internal/boardOps.ts`
- `packages/plugin-web-board-core/src/internal/seed/board-data.ts`
- `packages/plugin-web-board-core/src/index.ts`
- `packages/plugin-web-board-core/src/__tests__/*`

### `plugin-web-board-workspaces` owns

- card-detail surface component(s)
- modal shell
- open/close state
- card lookup and mutation orchestration
- wiring from Board/Table/Calendar/Timeline/Planner into the detail surface

Likely files:

- `packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx`
- `packages/plugin-web-board-workspaces/src/PlannerPanel.tsx`
- `packages/plugin-web-board-workspaces/src/index.ts`
- `packages/plugin-web-board-workspaces/src/styles.css`
- `packages/plugin-web-board-workspaces/src/BoardCardDetailModal.tsx` (new)
- `packages/plugin-web-board-workspaces/src/BoardCardDetailSurface.tsx` (new)
- `packages/plugin-web-board-workspaces/src/internal/detailState.ts` (new, optional)
- `packages/plugin-web-board-workspaces/src/__tests__/*`

### `plugin-web-board-views` owns

- passthrough `onOpenCard` usage in alternate views
- any small compatibility updates needed so those views reflect the same underlying card entity after detail edits

Likely files:

- `packages/plugin-web-board-views/src/TableView.tsx`
- `packages/plugin-web-board-views/src/BoardCalendarView.tsx`
- `packages/plugin-web-board-views/src/TimelineView.tsx`
- `packages/plugin-web-board-views/src/BoardModule.tsx`
- `packages/plugin-web-board-views/src/__tests__/*`

### Explicit non-owners for this slice

- `apps/web/src/routes/modules/shellRegistrations.tsx` — no routing/module registration change required for the P0 modal slice
- `packages/plugin-web-storage/src/internal/registry.ts` — no new storage key needed
- `packages/plugin-project/**` — reference only, no runtime import

## 6. Risks and open questions

### Risks

1. **Scope bleed into row #3 date model.** Adding `startDate` / `dueDate` is justified only if the row keeps legacy display compatibility and avoids rewriting every view to ISO now.
2. **Legacy-board normalization.** Persisted boards created before this row must not crash or erase data when missing new fields.
3. **Derived-field drift.** If checklist arrays, attachment arrays, and legacy aggregate fields are not kept in sync, Board/Table chips will diverge from detail state.
4. **Mock-member duplication.** Leaving member options inside TableView would create two editors with different member truth.
5. **View-opening inconsistency.** If only Kanban opens the detail modal, the feature will still feel partial because Table/Calendar/Timeline/Planner already expose click affordances.

### Open questions

1. Should activity notes ship in this row as a minimal local append-only stub, or be deferred if phase budget tightens? Recommendation: include only if P2/P3 budget remains after checklist/links/date edits are solid.
2. Should title continue mirroring EN/ZH in place? Recommendation: yes for P0, matching current board behavior.
3. Should description/checklist/activity text be `string` or `BilingualText`? Recommendation: `string` for P0 detail-only fields, to avoid fabricating translations and overcomplicating form state.

## 7. Acceptance outline

- Clicking a card from Kanban opens a real detail modal.
- The same detail surface can also be opened from Table, Calendar, Timeline, and Planner.
- Title, description, labels, members, start date, due date, links, and checklist edits persist through `xai_boards_v2`.
- Checklist edits update aggregate progress everywhere current views display it.
- Attachment/link edits update the current attachment count display.
- Date edits keep current Board/Table/Calendar/Timeline behavior working without full row #3 migration.
- Reloading the page preserves edited card detail data.
- Pre-existing boards without the new fields still load without crash.
