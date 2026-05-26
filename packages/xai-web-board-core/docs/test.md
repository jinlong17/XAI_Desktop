# Test Strategy — xai-web-board-core

> Test runner: Vitest 3 + jsdom + @testing-library/react. Lint gate: `eslint --max-warnings 0`.
> Each phase ships its own subset; phase acceptance = lint + typecheck + that phase's tests pass.

## §1 — Test runner setup

- `vitest.config.ts` — `environment: "jsdom"`; `setupFiles: ["./vitest.setup.ts"]`; `include: ["src/__tests__/**/*.{test,spec}.{ts,tsx}"]`.
- `vitest.setup.ts` — `requestAnimationFrame` polyfill; `afterEach(() => localStorage.clear())`; `import "@testing-library/jest-dom"`.
- No coverage gate at row level (project does not enforce one for W2 modules).

## §2 — Phase-by-phase test plan

### P1 — pure helpers + types + seed + palette

| File | Suite | Cases |
|---|---|---|
| `__tests__/types.test.ts` | T1 | Compile-time only — TS narrows `Board.template` to literal union; `LIST_COLOR_IDS` is `readonly` tuple. (1 dummy runtime assertion + tsd-style comments.) |
| `__tests__/listColors.test.ts` | C1 | `LIST_COLOR_IDS.length === 10` |
| | C2 | Every id in `LIST_COLOR_IDS` appears exactly once in `LIST_COLOR_PALETTE` |
| | C3 | Every `LIST_COLOR_PALETTE` entry has `cssVar` starting with `"var(--board-list-color-"` |
| | C4 | `LIST_COLOR_IDS` exact order matches prototype `module-board.jsx` lines 13–24 |
| `__tests__/boardOps.test.ts` | M1 | `moveCardToList` moves card from A to B; A loses card, B gains card; total count unchanged |
| | M2 | `moveCardToList` returns same `lists` array reference when card not in source |
| | M3 | `moveCardToList` with `from === to` returns same `lists` array reference (no-op) |
| | M4 | `addCardToList` appends a new card with `title: { en, zh }` matching input text and `labels: []` |
| | M5 | `addCardToList` ignores whitespace-only text (returns same lists) |
| | M6 | `addNewList` appends a list with `key: null`, `customName: { en, zh }`, `color: null` (or absent), `cards: []` |
| | M7 | `setListColor` sets the color on the matching list; other lists untouched |
| | M8 | `setListColor(_, _, null)` clears the color |
| | M9 | `updateCardInList` shallow-merges the patch into the matching card |
| | M10 | All helpers return fresh arrays (no mutation of inputs — verified by `Object.isFrozen` on inputs in tests) |
| `__tests__/isBoardArray.test.ts` | V1 | `isBoardArray(null)` → false |
| | V2 | `isBoardArray([])` → true (empty is valid — first run could persist an empty array) |
| | V3 | `isBoardArray([{ id: "x" }])` → false (missing required fields) |
| | V4 | `isBoardArray("not array")` → false |
| | V5 | `isBoardArray(makeDefaultBoards())` → true |
| | V6 | `isBoard({ ..valid.. })` → true |
| | V7 | `isBoardList({ id: "l1", key: "todo", cards: [] })` → true |
| | V8 | `isBoardCard({ id: "c1", title: { en: "a", zh: "b" } })` → true |
| `__tests__/boardData.test.ts` | S1 | `makeDefaultBoards()` returns at least 2 boards (b-default + b-pm) |
| | S2 | Every board passes `isBoard` |
| | S3 | Every list in every board passes `isBoardList` |
| | S4 | Every card passes `isBoardCard` |
| | S5 | `DEFAULT_WORKSPACES.length === 2` (ws-personal + ws-team) |
| | S6 | `BOARD_TEMPLATES.length === 3` (kanban + pm + blank) |
| | S7 | `BOARD_TEMPLATES[0].lists()` returns 5 lists (Backlog/Today/Week/Later/Done) |
| | S8 | `BOARD_TEMPLATES[1].lists()` returns 5 lists (PM_LISTS_INITIAL shape) |
| | S9 | `BOARD_TEMPLATES[2].lists()` returns `[]` |
| | S10 | `PM_LABELS.length === 5` |

### P2 — components + DnD + persistence wiring

| File | Suite | Cases |
|---|---|---|
| `__tests__/BoardCard.test.tsx` | BC1 | Renders bilingual title (en when `lang="en"`, zh when `lang="zh"`) |
| | BC2 | Renders label chips when `card.labels` set; renders nothing when empty |
| | BC3 | Renders checklist count when `card.checklist` set |
| | BC4 | Renders due chip when `card.due` set; adds `.late` class when `dueLate: true` |
| | BC5 | `draggable=true` attribute applied; `onDragStart` fires with payload matching MIME contract (api.md §8) |
| `__tests__/BoardList.test.tsx` | BL1 | Renders list name (key → i18n catalog or `customName[lang]`) |
| | BL2 | Renders all `list.cards` as `<BoardCard>` |
| | BL3 | Click "add card" → composer textarea appears, focused |
| | BL4 | Enter in composer → `addCard` called with text |
| | BL5 | Shift+Enter in composer → newline inserted (no `addCard` call) |
| | BL6 | Escape in composer → composer closes, no `addCard` call |
| | BL7 | Empty Enter → no `addCard` call |
| | BL8 | Click dots → menu appears with 10 color swatches + "remove color" + composer entry |
| | BL9 | Click swatch → `setListColor(listId, "red")` called |
| | BL10 | Click "remove color" → `setListColor(listId, null)` called |
| | BL11 | When `color` is set, list has `.has-color` class and `--list-color` style var |
| `__tests__/BoardView.test.tsx` | BV1 | Renders one `<section.board-list>` per list |
| | BV2 | "Add list" button → composer input appears |
| | BV3 | Enter in list-name input → `addList` called with text |
| | BV4 | Escape closes composer without calling `addList` |
| | BV5 | DnD drop sequence: `dataTransfer.setData(MIME, payload)` → drop on different list → `moveCardToList(cardId, A, B)` called |
| | BV6 | Drop on same list → no `moveCardToList` call (or no-op call — matches contract) |
| | BV7 | Drop with malformed `dataTransfer.getData` returning `""` → no `moveCardToList` call |
| | BV8 | Drop with malformed JSON in payload → no `moveCardToList` call, no throw |
| | BV9 | List shows `.drop-target` class while a foreign card is dragging over |
| `__tests__/persistence.test.ts` | PE1 | `loadBoardsOrDefault(null)` returns `makeDefaultBoards()` |
| | PE2 | `loadBoardsOrDefault("garbage")` returns `makeDefaultBoards()` |
| | PE3 | `loadBoardsOrDefault(makeDefaultBoards())` returns the same boards (identity preserved when guard passes) |
| | PE4 | `pickActiveBoard(boards, "b-default")` returns the matching board |
| | PE5 | `pickActiveBoard(boards, "nonexistent")` returns `boards[0]` |
| | PE6 | `pickActiveBoard([], "anything")` throws or returns sentinel (decided in implementation; test pins behavior) |

### P3 — orchestrator + registration + integration

| File | Suite | Cases |
|---|---|---|
| `__tests__/BoardModule.test.tsx` | BM1 | First mount with empty `localStorage` renders `<h1>` with `boards[0].name.en` (because default seed `b-default` is the first board) |
| | BM2 | Mount with persisted `xai_boards_v2 = [board1, board2]` + `xai_active_board = "board2"` renders `board2.name[lang]` |
| | BM3 | Drag card across lists in the DOM, reload component (unmount + remount) → moved card is on the target list |
| | BM4 | Add-card via composer persists to `xai_boards_v2`; reload renders the new card |
| | BM5 | Switching `lang="en"` to `lang="zh"` re-renders all bilingual strings |
| | BM6 | When `usePref("xai_boards_v2")` returns malformed data, BoardModule mounts with default seed (no crash) |
| `__tests__/registration.test.tsx` | RG1 | `boardCoreWebModuleRegistration.moduleId === "board"` |
| | RG2 | `boardCoreWebModuleRegistration.railOrder === 3` |
| | RG3 | `boardCoreWebModuleRegistration.icon === "kanban"` |
| | RG4 | `boardCoreWebModuleRegistration.showInRail === true` |
| | RG5 | `boardCoreWebModuleRegistration.i18nKey === "nav.board"` |
| | RG6 | Rendering `<BoardModuleRoute>` inside `<WebShellProvider lang="zh">` renders the BoardModule with zh strings |
| `__tests__/index-barrel.test.ts` | IB1 | `index.ts` re-exports all symbols listed in api.md §0 |
| | IB2 | `index.ts` does NOT re-export any symbol from `src/internal/*` other than the explicit allowlist |
| | IB3 | Schema types re-exported from `index.ts` carry the correct shape (compile-time assertion + dummy runtime guard call) |

## §3 — Mock strategy

| Subject | Mock |
|---|---|
| `usePref` reads/writes | Use **real** `usePref` against `localStorage` (jsdom polyfills `localStorage`; `vitest.setup.ts` clears between tests). |
| `useWebShell` | Wrap render with `<WebShellProvider lang="en">` (real provider — already SHIPPED). |
| HTML5 `dataTransfer` | Use `@testing-library/react` fireEvent with custom `dataTransfer` mock object exposing `setData`/`getData`/`effectAllowed`/`dropEffect`/`types`. Helper `makeDataTransferMock()` in `__tests__/_helpers/dataTransfer.ts`. |
| `Date.now` | When testing card id generation (`"new-" + Date.now()`), freeze with `vi.useFakeTimers()` + `vi.setSystemTime(new Date(...))`. |
| `Math.random` | Same — `vi.spyOn(Math, "random").mockReturnValue(...)` where used in id generation (only for `BOARD_TEMPLATES[1].lists()` PM clone). |

## §4 — Acceptance criteria (becomes feature-verify input)

| # | Criterion | Verified by |
|---|---|---|
| A1 | `pnpm --filter @repo/plugin-web-board-core lint --max-warnings 0` exits 0 | feature-verify shell run |
| A2 | `pnpm --filter @repo/plugin-web-board-core typecheck` exits 0 | feature-verify shell run |
| A3 | `pnpm --filter @repo/plugin-web-board-core test` exits 0 | feature-verify shell run |
| A4 | `pnpm --filter @repo/web typecheck` exits 0 | feature-verify shell run |
| A5 | `pnpm --filter @repo/web lint --max-warnings 0` exits 0 | feature-verify shell run |
| A6 | `pnpm --filter @repo/web test` exits 0 (no regression of existing host tests) | feature-verify shell run |
| A7 | Schema field set matches DESIGN.md §9.3 (audited by S1..S10 + manual grep) | Code audit |
| A8 | No hard-coded hex in `src/**/*.tsx` (grep `#[0-9a-fA-F]{3,6}` returns 0 matches) | Code audit |
| A9 | DnD cross-list move + reload preserves moved-card state in `xai_boards_v2` | BM3 + manual smoke |
| A10 | Bilingual round-trip (`lang="en"` ↔ `lang="zh"`) updates all visible strings | BM5 + manual smoke |
| A11 | `boardCoreWebModuleRegistration` is exported and replaces line 59 in `shellRegistrations.tsx` | RG1..RG5 + diff audit |
| A12 | Each phase has exactly one commit; conventional commit format `feat(plugin-web-board-core): P<n> ...` | git log audit |
| A13 | No new dependency added to `apps/web/package.json` other than `@repo/plugin-web-board-core` | git diff audit |
| A14 | `xai_board_panels` and `xai_board_inbox` registry entries are NOT touched | git diff audit on `@repo/plugin-web-storage` (should be 0 changes) |

## §5 — Manual smoke (cross-vendor verify queued at ship time per manifest header)

| ID | Step | Expect |
|---|---|---|
| Q1 | `pnpm --filter @repo/web dev` → open `http://localhost:3000/board` | Renders `<h1>My Project Board` (en) with 5 kanban columns (Backlog/Today/Week/Later/Done) |
| Q2 | Drag a card from Backlog to Done | Card visually moves; column counts update |
| Q3 | Reload tab (cmd+R) | Drag persists (card stays in Done) |
| Q4 | Switch language via Topbar EN/中 toggle | All visible strings flip (board name, column names, microcopy) |
| Q5 | Click "Add card" on a column → type "Hello" → Enter | Card appears at bottom of column |
| Q6 | Click dots on a column → pick "red" swatch | Column header tints red |
| Q7 | Click dots → "Remove color" | Column reverts to neutral |
| Q8 | Add a new list ("Add list" → "My Custom" → Enter) | New empty list appears at right of board |
| Q9 | Open Chrome DevTools → Application → localStorage → `xai_boards_v2` | JSON reflects current board state |
| Q10 | Set `xai_boards_v2` to `"garbage"` → reload | Module renders default seed without crash |

**Note**: Q1–Q10 are documented for ship-time cross-vendor verify (Codex `gpt-5.5-thinking medium` or Cursor fallback per manifest header). The row-level feature-verify runs in same-vendor Claude Opus and explicitly documents this as the same-vendor compromise.

---

## §6 — 2026-05-25 Extension Tests (gap-closure row #6 — Card schema `location?`)

> APPEND-ONLY. **Canonical test catalogue lives in
> `packages/xai-web-board-views/docs/test.md §6`.**

### §6.1 — Baseline preservation (gate)

Existing 104 tests in `packages/plugin-web-board-core/src/__tests__/**` MUST continue to pass with ZERO edits to test files except `isBoardArray.test.ts` which gains 4 new cases.

### §6.2 — `__tests__/isBoardArray.test.ts` (MODIFY · +4 cases BCV1..BCV4)

| ID | Case | Assertion |
|---|---|---|
| BCV1 | `isBoardCard({ id, title, location: { lat: 40.7, lng: -74 } })` → true | guard accepts present-and-valid |
| BCV2 | `isBoardCard({ id, title })` (no location field) → true | back-compat preserved |
| BCV3 | `isBoardCard({ id, title, location: { lat: NaN, lng: 0 } })` → true | structural validity OK (range enforced elsewhere) |
| BCV4 | `isBoardCard({ id, title, location: "garbage" })` → false | non-object location rejected |

### §6.3 — Acceptance gate

| Gate | Description |
|---|---|
| G1 | `pnpm --filter @repo/plugin-web-board-core test` → 104 baseline + 4 = 108 PASS |
| G1a | All NEW tests (BCV1..BCV4) PASS individually |
| G1b | Existing 100 isBoardArray cases PASS unchanged |
