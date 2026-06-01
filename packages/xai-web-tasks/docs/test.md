# Test — `@repo/plugin-web-tasks`

> Test strategy and acceptance criteria.
> Aligned with [design.md](./design.md) §7 and [api.md](./api.md) §5-§9.

---

## 1. Toolchain

- **Runner**: `vitest@^3.2.1` (matches all other `plugin-web-*` packages).
- **Environment**: `jsdom@^26` for React component / DnD tests; `node` for pure helpers.
- **Setup**: `vitest.setup.ts` extending `@testing-library/jest-dom`.
- **Component testing**: `@testing-library/react@^16` + `@testing-library/jest-dom@^6`.
- **Coverage** (target): ≥ 80 % statements on internal modules; 100 % on `dateForCol` + `tasksReducer.moveCard` (they are the load-bearing pure helpers).

Run:
```
pnpm --filter @repo/plugin-web-tasks test
pnpm --filter @repo/plugin-web-tasks test:coverage
```

---

## 2. Test inventory (matrix)

| ID | Layer | File | Asserts | Phase |
|---|---|---|---|---|
| **T-DC-1** | pure | `__tests__/dateForCol.test.ts` | `dateForCol("overdue")` returns `{date, dateZh}` for today−3d with mocked clock 2026-05-23 | P2 |
| **T-DC-2** | pure | `__tests__/dateForCol.test.ts` | `dateForCol("next7")` returns `{date, dateZh}` for today+2d | P2 |
| **T-DC-3** | pure | `__tests__/dateForCol.test.ts` | `dateForCol("later")` returns `{date, dateZh}` for today+30d, EN format `Jun 22` style | P2 |
| **T-DC-4** | pure | `__tests__/dateForCol.test.ts` | `dateForCol("nodate")` returns `null` | P2 |
| **T-DC-5** | pure | `__tests__/dateForCol.test.ts` | `dateForCol("overdue", customDate)` honours the passed `now` parameter | P2 |
| **T-RD-1** | pure | `__tests__/tasksReducer.test.ts` | `moveCard` no-ops when `fromColId === toColId` | P2 |
| **T-RD-2** | pure | `__tests__/tasksReducer.test.ts` | `moveCard` no-ops when `taskId` not found | P2 |
| **T-RD-3** | pure | `__tests__/tasksReducer.test.ts` | `moveCard("t1", "overdue", "next7")` removes from source, prepends to dest | P2 |
| **T-RD-4** | pure | `__tests__/tasksReducer.test.ts` | `moveCard` updates `count` correctly on both columns; untouched columns are referentially equal to prev | P2 |
| **T-RD-5** | pure | `__tests__/tasksReducer.test.ts` | `moveCard` to `nodate` strips `date`, `dateZh`, `dateLabel`, `sub`, keeps `tag` + `inbox` | P2 |
| **T-RD-6** | pure | `__tests__/tasksReducer.test.ts` | `moveCard` to non-nodate bucket writes `date` + `dateZh`, strips `dateLabel` + `sub`, keeps `tag` + `inbox` | P2 |
| **T-RD-7** | pure | `__tests__/tasksReducer.test.ts` | `toggleComplete` toggles set membership (add then remove) | P2 |
| **T-VAL-1** | pure | `__tests__/validate.test.ts` | `isTaskColsArray(null)`, `isTaskColsArray({})`, `isTaskColsArray([])`, `isTaskColsArray(SEED_TASK_COLS)` — false / false / false / true | P2 |
| **T-VAL-2** | pure | `__tests__/validate.test.ts` | `isTaskColsArray` rejects arrays of length ≠ 4 | P2 |
| **T-VAL-3** | pure | `__tests__/validate.test.ts` | `isTaskColsArray` rejects array whose column ids drift from the closed `BucketId` set | P2 |
| **T-VAL-4** | pure | `__tests__/validate.test.ts` | `isTaskCard(seedTask)` is true; `isTaskCard({id:1,title:{}})` is false | P2 |
| **T-SEED-1** | data | `__tests__/seed.test.ts` | `SEED_TASK_COLS.length === 4`; ids match `["overdue","next7","later","nodate"]` in that order | P1 |
| **T-SEED-2** | data | `__tests__/seed.test.ts` | Total active tasks count matches prototype (10 + 2 + 13 + 1 = 26) | P1 |
| **T-SEED-3** | data | `__tests__/seed.test.ts` | `SEED_TASK_COLS[3].completed!.length === 6` (the nodate completed group) | P1 |
| **T-SEED-4** | data | `__tests__/seed.test.ts` | Every task title bundle has non-empty `en` and `zh` strings (bilingual parity smoke) | P1 |
| **T-BAR-1** | barrel | `__tests__/index-barrel.test.ts` | `import * as api from "../index"` exposes `TasksModule`, `tasksWebModuleRegistration`, type re-exports compile via tsd | P3 |
| **T-REG-1** | barrel | `__tests__/registration.test.tsx` | `tasksWebModuleRegistration.moduleId === "tasks"`, `railOrder === 2`, `icon === "check"`, `showInRail === true`, `i18nKey === "nav.tasks"`, `children` has `path:""` + `path:"*"` rows | P2 |
| **T-REG-2** | RTL | `__tests__/registration.test.tsx` | Mounting `TasksModuleRoute` inside a `<WebShellProvider lang="en" …>` renders the EN sidebar (assert "Tasks" header text via `getByRole("heading")`) | P3 |
| **T-MOD-1** | RTL | `__tests__/TasksModule.test.tsx` | Renders 4 column headers in correct order with EN labels for `lang="en"` | P1 |
| **T-MOD-2** | RTL | `__tests__/TasksModule.test.tsx` | Renders 4 column headers in correct order with ZH labels for `lang="zh"` | P1 |
| **T-MOD-3** | RTL | `__tests__/TasksModule.test.tsx` | Clicking the checkbox on a card toggles its `.is-completed` class (no persistence) | P2 |
| **T-MOD-4** | RTL | `__tests__/TasksModule.test.tsx` | DnD happy path: simulate `dragStart` on a card in `overdue` then `drop` on `nodate` — card disappears from `overdue`, appears at top of `nodate`, has no `.task-date` element (date stripped) | P2 |
| **T-MOD-5** | RTL | `__tests__/TasksModule.test.tsx` | DnD highlight: while `overColId === "later"`, the column section has class `drop-target` | P2 |
| **T-MOD-6** | RTL | `__tests__/TasksModule.test.tsx` | While dragging, the topbar drag-hint text is visible (asserts the bilingual fallback when key absent) | P2 |
| **T-PER-1** | RTL | `__tests__/persistence.test.tsx` | Initial render (empty localStorage) shows seed data | P2 |
| **T-PER-2** | RTL | `__tests__/persistence.test.tsx` | After a DnD move, `localStorage.getItem("xai_task_cols")` round-trips a JSON array whose first column ids match the new arrangement | P2 |
| **T-PER-3** | RTL | `__tests__/persistence.test.tsx` | Pre-seeded `localStorage.setItem("xai_task_cols", "{bogus}")` falls back to seed (DEV warn fired once via `vi.spyOn(console, "warn")`) | P2 |

---

## 3. Mock strategy

- **Clock**: `vi.useFakeTimers()` + `vi.setSystemTime(new Date("2026-05-23T12:00:00Z"))` in `dateForCol.test.ts` and the `moveCard` tests that read `now`. The pure helper accepts an explicit `now` parameter so most tests can skip fake timers and pass a `Date` instead.
- **Storage**: jsdom's built-in `localStorage` is used directly; `usePref` is **not** mocked. We test against the real hook to catch the boundary cast.
- **i18n**: real `useI18n` from `@repo/plugin-web-tokens` — no mock. Bilingual assertions exercise the real bundle.
- **Shell context**: real `WebShellProvider` from `@repo/xai-web-shell` (with a minimal modules array containing only `tasksWebModuleRegistration`) for the registration RTL tests.
- **DnD**: jsdom supports `dataTransfer.setData/getData`. We invoke them via `fireEvent.dragStart(card, { dataTransfer })`, `fireEvent.dragOver(col, { dataTransfer })`, `fireEvent.drop(col, { dataTransfer })`. For browsers' richer DnD model (effect cursors, drag image), we rely on the manual real-browser pass in §5.

---

## 4. Acceptance criteria (acceptance signal from seed brief)

The row's `READY_FOR_VERIFY` gate requires **all** of the following to pass:

- [AC-1] `pnpm --filter @repo/plugin-web-tasks lint` — zero warnings, zero errors.
- [AC-2] `pnpm --filter @repo/plugin-web-tasks typecheck` — clean.
- [AC-3] `pnpm --filter @repo/plugin-web-tasks test` — all tests in §2 pass.
- [AC-4] `pnpm --filter @repo/web typecheck` — clean (catches shell-registration mismatches).
- [AC-5] `pnpm --filter @repo/web test` — pre-existing tests pass (no regression).
- [AC-6] **Manual real-browser sweep** on macOS 14+ Safari and Chrome:
  - Navigate to `/app/tasks` from the rail.
  - Drag a card from `overdue` → `nodate`; confirm date disappears from card.
  - Drag a card from `nodate` → `later`; confirm a "Mon D" date appears.
  - Reload the page; confirm both cards stay in their new columns with new dates persisted.
  - Toggle the lang in the Topbar between EN ↔ 中文; confirm every visible string flips (column headers, sidebar labels, tag pills, drag hint).
  - Confirm the destination column shows an **accent-coloured outline** while a card is hovering it (CSS class `.task-col.drop-target`).
  - Confirm a **topbar hint** appears the moment a drag starts (text per i18n or inline bilingual fallback).
- [AC-7] **Cross-vendor verification (P3)**: at least one phase has been completed by a non-Claude vendor (Codex or Cursor) to confirm no Claude-specific tool reliance, OR — if all phases stay on Claude — record the cross-vendor readiness checklist in `dev_log.md`: (i) all edits used unique anchors, (ii) all file paths are absolute, (iii) no template-language-specific syntax leaked into source.

---

## 5. Out-of-scope tests

- Touch / pointer-events DnD (HTML5 DnD is mouse-only by design).
- Per-list filtering (no behaviour exists in v1).
- Smart-list / Filter / Tag navigation (decorative in v1).
- Cross-tab realtime sync stress test (`usePref` already covers this via its own suite).
- Event emission (no events emitted in v1).

---

## 6. Test-failure escalation

If any P2/P3 test fails after feature-build, the dev_log.md Status flips to `BLOCKED` with `Suggested Next = feature-build` (fix), per Workflow V2 SOP. Acceptance pivots on AC-1..AC-7 — partial completion is not READY_FOR_VERIFY.

---

# Extension — xai-web-tasks-card-create (2026-05-28)

> APPENDED extension. The SHIPPED v1 test plan above (§1–§6) is unchanged.
> Discovery: `docs/reviews/xai-web-tasks-card-create/20260528-discovery-review.md`.
> Phase IDs use the EP1/EP2/EP3 labels from the extension Phase Plan.

## E.1 New test inventory

| ID | Layer | File | Asserts | Phase |
|---|---|---|---|---|
| **T-IDS-1** | pure | `__tests__/ids.test.ts` | `createTaskId()` returns a non-empty string; two calls differ | EP1 |
| **T-IDS-2** | pure | `__tests__/ids.test.ts` | Generated id is structurally disjoint from seed ids (not equal to any `t1`..`t26`/`c1`..`c6`; matches UUID or `t-…-…` fallback shape) | EP1 |
| **T-ADD-1** | pure | `__tests__/tasksReducer.test.ts` | `addCard` prepends a new card to `targetBucket.tasks[0]`; `count` +1; card passes `isTaskCard` | EP1 |
| **T-ADD-2** | pure | `__tests__/tasksReducer.test.ts` | `addCard` fills BOTH `title.en` + `title.zh` from the single draft string (trimmed) | EP1 |
| **T-ADD-3** | pure | `__tests__/tasksReducer.test.ts` | `addCard` with `tag` set writes `tag`; with `tag` omitted writes no `tag` field | EP1 |
| **T-ADD-4** | pure | `__tests__/tasksReducer.test.ts` | `addCard` with `withDate:true` + non-`nodate` bucket sets `date`+`dateZh` via `dateForCol` (fake clock); `withDate:false` writes no date | EP1 |
| **T-ADD-5** | pure | `__tests__/tasksReducer.test.ts` | `addCard` with `withDate:true` + `nodate` target writes NO date fields | EP1 |
| **T-ADD-6** | pure | `__tests__/tasksReducer.test.ts` | `addCard` leaves untouched columns referentially equal to `prev` (identity check) | EP1 |
| **T-ADD-7** | pure | `__tests__/tasksReducer.test.ts` | `addCard` with empty/whitespace title returns `prev` unchanged (defensive guard) | EP1 |
| **T-ADD-8** | pure | `__tests__/tasksReducer.test.ts` | `addCard` result passes `isTaskColsArray` (persistence round-trip validity) | EP1 |
| **T-TC-1** | RTL | `__tests__/TaskComposer.test.tsx` | Open with `defaultBucket="later"` renders the dialog; title input is autofocused; bucket radio "later" is `aria-checked` | EP2 |
| **T-TC-2** | RTL | `__tests__/TaskComposer.test.tsx` | Save with empty title → inline `err_title_required` shown; `onSave` NOT called; dialog stays open | EP2 |
| **T-TC-3** | RTL | `__tests__/TaskComposer.test.tsx` | Type title + pick tag "work" + Save → `onSave({title, tag:"work", withDate:false}, "later")` called once | EP2 |
| **T-TC-4** | RTL | `__tests__/TaskComposer.test.tsx` | Tag "None" radio selected by default → `onSave` draft has no `tag` | EP2 |
| **T-TC-5** | RTL | `__tests__/TaskComposer.test.tsx` | Bucket radiogroup retarget to "overdue" → `onSave` second arg is "overdue" | EP2 |
| **T-TC-6** | RTL | `__tests__/TaskComposer.test.tsx` | ESC (`cancel` event) → `onClose` called; backdrop click (`e.target===dialog`) → `onClose`; Cancel button → `onClose` | EP2 |
| **T-TC-7** | RTL | `__tests__/TaskComposer.test.tsx` | Bilingual: `lang="zh"` renders ZH STR labels (title/save/cancel/error); `lang="en"` renders EN | EP2 |
| **T-COL-1** | RTL | `__tests__/TasksModule.test.tsx` | Clicking a column `+` (action==="add") invokes the composer open path (dialog appears with that bucket pre-selected) | EP2 |
| **T-CR-1** | RTL | `__tests__/persistence.test.tsx` | Create flow: open composer → type title → Save → new card appears at top of target column AND `localStorage.getItem("xai_task_cols")` round-trips an array containing it | EP2 |
| **T-CR-2** | RTL | `__tests__/persistence.test.tsx` | Create into a **previously empty** bucket → card appears (empty-column affordance); `count` reflects 1 | EP2 |
| **T-CR-3** | integration | `__tests__/persistence.test.tsx` | After create + write, re-mounting `TasksModule` (simulating reload, reading the same `localStorage`) shows the created card in its column (survives refresh) | EP3 |
| **T-A11Y-1** | RTL | `__tests__/TaskComposer.test.tsx` | Dialog has `role`/`aria-modal="true"` + `aria-labelledby`; title input `aria-required`; error wired via `aria-describedby` | EP3 |
| **T-BAR-2** | barrel | `__tests__/index-barrel.test.ts` | `NewTaskDraft` type is exported from the public surface; internal helpers (`addCard`, `createTaskId`, `TaskComposer`) are NOT exported | EP3 |

## E.2 Mock strategy (extension)

- **Clock**: `vi.useFakeTimers()` + `vi.setSystemTime(new Date("2026-05-28T12:00:00"))` for `addCard` date tests (T-ADD-4) so `dateForCol` output is deterministic. Pure helper accepts explicit `now`, so most addCard tests pass a `Date` directly.
- **id determinism**: `createTaskId` is non-deterministic by design; tests assert shape/uniqueness, not a fixed value. Where a stable id is needed for a snapshot, spy or stub `crypto.randomUUID` (do NOT bake a literal into source).
- **Storage**: jsdom `localStorage` direct; `usePref` NOT mocked (tests the real boundary cast — same as SHIPPED T-PER-*).
- **i18n**: real `useI18n` for existing labels; the new `STR_TASK_COMPOSER` is a plain const table asserted directly for en+zh parity.
- **Dialog in jsdom**: `<dialog>.showModal()`/`close()` + `cancel` event are jsdom-supported (same as the calendar EventComposer suite); backdrop click simulated via `fireEvent.click(dialog)` with `target===dialog`.

## E.3 Acceptance criteria (extension)

The extension's `READY_FOR_VERIFY` gate requires ALL of:

- [AC-E1] `pnpm --filter @repo/plugin-web-tasks lint` — zero warnings.
- [AC-E2] `pnpm --filter @repo/plugin-web-tasks typecheck` — clean.
- [AC-E3] `pnpm --filter @repo/plugin-web-tasks test` — all new T-IDS/T-ADD/T-TC/T-COL/T-CR/T-A11Y/T-BAR-2 tests pass AND all SHIPPED 40 tests still pass (no regression).
- [AC-E4] `pnpm --filter @repo/web check-types` — clean.
- [AC-E5] `pnpm --filter @repo/web test` + `build` — green (no regression).
- [AC-E6] **Manual real-browser sweep** (macOS Safari + Chrome) — MAY be deferred per ADR-0008 §S3, recorded in dev_log verify section:
  - Click a column `+` → composer opens with that bucket pre-selected.
  - Type a title, pick a tag, Save → card appears at top of the correct column.
  - Create into an empty column → card appears.
  - Reload → created card persists.
  - ESC / backdrop / Cancel → dialog closes, no card created.
  - Switch lang EN ↔ 中文 → composer labels flip.
- [AC-E7] **Cross-vendor (EP3)**: Codex cold-read of the new sources (composer + reducer + ids) OR formally deferred per ADR-0008 §S3 with the (i) unique-anchors / (ii) absolute-paths / (iii) no-template-syntax checklist recorded in dev_log.

## E.4 Out-of-scope tests (extension)

- Edit / Delete flows (deferred feature — no tests this iteration).
- Free-form date entry (bucket-derived only).
- Event emission (no channel added).
- Touch/pointer interactions on the dialog (mouse + keyboard only).

---

# Extension — xai-web-tasks-smartlist-filter (2026-05-28)

> APPENDED extension (Iteration 3). The SHIPPED v1 test plan (§1–§6) and the
> card-create extension (§E.1–§E.4) above are unchanged.
> Discovery: `docs/reviews/xai-web-tasks-smartlist-filter/20260528-discovery-review.md`.
> Phase IDs use the FP1/FP2 labels from the extension Phase Plan.

## F.1 New test inventory

| ID | Layer | File | Asserts | Phase |
|---|---|---|---|---|
| **T-FILT-1** | pure | `__tests__/filterCardsByList.test.ts` | `filterCardsByList(cols, "all")` returns `cols` referentially unchanged (identity). | FP1 |
| **T-FILT-2** | pure | `__tests__/filterCardsByList.test.ts` | `"inbox"` keeps only `inbox===true` cards across ALL columns incl. `nodate.completed`; seed → 10 (overdue) + 1 active + 6 completed (nodate); next7/later → `tasks:[]`. | FP1 |
| **T-FILT-3** | pure | `__tests__/filterCardsByList.test.ts` | `"next7"` keeps `next7` bucket cards; overdue/later/nodate → `tasks:[]` + `completed:[]`. | FP1 |
| **T-FILT-4** | pure | `__tests__/filterCardsByList.test.ts` | `"today"` keeps `overdue` bucket cards; all other columns → `tasks:[]` (bucket approximation Q-T). | FP1 |
| **T-FILT-5** | pure | `__tests__/filterCardsByList.test.ts` | `"tomorrow"` keeps `next7` bucket cards; all other columns → `tasks:[]` (bucket approximation Q-T). | FP1 |
| **T-FILT-6** | pure | `__tests__/filterCardsByList.test.ts` | `"summary"` returns `cols` unchanged (identity / treat-as-all Q2). | FP1 |
| **T-FILT-7** | pure | `__tests__/filterCardsByList.test.ts` | Returns all 4 columns in order for EVERY list (never drops a column); each returned `count` equals its filtered `tasks.length`. | FP1 |
| **T-FILT-8** | pure | `__tests__/filterCardsByList.test.ts` | Defensive: unknown `list` value → returns `cols` unchanged (never throws, never empties). | FP1 |
| **T-FILT-NOMUT** | pure | `__tests__/filterCardsByList.test.ts` | **HEADLINE:** deep-clone `cols`; apply every `SmartListId` in turn; assert the original `cols` is deep-equal to its clone afterwards (selector mutates nothing). | FP1 |
| **T-FILT-COUNT** | integration | `__tests__/persistence.test.tsx` | **HEADLINE:** render `TasksModule`, click each smart-list in turn; after each, `localStorage.getItem("xai_task_cols")` is byte-identical to the pre-filter snapshot (or stays absent if it started absent). Filtering writes NOTHING. | FP2 |
| **T-LIFT-1** | RTL | `__tests__/TasksModule.test.tsx` | Clicking a smart-list row (e.g. "Inbox") filters the rendered board: only `inbox` cards remain; non-matching cards are gone from the DOM. | FP1 |
| **T-LIFT-2** | RTL | `__tests__/TasksModule.test.tsx` | `activeList` highlight (`data-active`) stays in sync after the lift: clicking "Today" sets `data-active` on the Today row, clears it on the previously-active row. | FP1 |
| **T-LIFT-3** | RTL | `__tests__/TasksModule.test.tsx` | "All" restores the full board after a filter (click Inbox → fewer cards; click All → all 26 active cards back). | FP1 |
| **T-LIFT-4** | RTL | `__tests__/TasksSidebar.test.tsx` | Custom-list + tag rows are non-selecting (Q1): clicking a custom-list row does NOT change the filtered board / does not call `onSelectList` with a `SmartListId` (inert). | FP1 |
| **T-EMPTY-1** | RTL | `__tests__/TasksModule.test.tsx` | A filter that yields zero cards board-wide renders the board-level honest empty state ("Nothing in …"); the per-column "drop here" hint is suppressed while filtering. | FP2 |
| **T-EMPTY-2** | RTL | `__tests__/TasksModule.test.tsx` | Bilingual empty state: `lang="zh"` renders the ZH empty-state STR; `lang="en"` renders EN. | FP2 |
| **T-FILT-BAR** | barrel | `__tests__/index-barrel.test.ts` | If `SmartListId` is exported (review decision), it is on the public surface; `filterCardsByList` is NOT exported (internal). If not exported, assert `filterCardsByList` + `SmartListId` both absent from the barrel. | FP2 |
| **T-REG-NOMUT** (regression) | suite | (existing suites) | All SHIPPED suites stay green with ZERO edits to their code paths: T-RD-1..7 (move), T-ADD-1..8 (create), T-MOD-3..6 (toggle/DnD), T-PER-1..3 + T-CR-1..3 (persistence). Confirms drag/create/complete unaffected. | FP1+FP2 |

## F.2 Mock strategy (extension)

- **No clock needed for v1 predicates** — they are bucket-based (discovery §3), so `filterCardsByList` tests pass plain `cols` fixtures (the SHIPPED `SEED_TASK_COLS` or hand-built `TaskCol[]`). `now` is accepted but ignored in v1; a placeholder `now` may be passed for signature coverage.
- **No-mutation proof** — T-FILT-NOMUT deep-clones the input (`structuredClone` or `JSON.parse(JSON.stringify(...))`) and asserts deep-equality after applying all lists. T-FILT-COUNT snapshots `localStorage` raw string before/after UI filter clicks.
- **Storage** — jsdom `localStorage` direct; `usePref` NOT mocked (tests the real read path + proves the filter never writes).
- **i18n** — real `useI18n` for existing labels; new empty-state STR is a plain const table asserted directly for en+zh parity (same as `STR_TASK_COMPOSER`).
- **No DnD/composer changes** — the SHIPPED DnD + composer suites are untouched; this extension neither edits nor re-mocks them.

## F.3 Acceptance criteria (extension)

The extension's `READY_FOR_VERIFY` gate requires ALL of:

- [AC-F1] `pnpm --filter @repo/plugin-web-tasks lint` — zero warnings.
- [AC-F2] `pnpm --filter @repo/plugin-web-tasks typecheck` — clean.
- [AC-F3] `pnpm --filter @repo/plugin-web-tasks test` — all new T-FILT/T-LIFT/T-EMPTY tests pass AND all SHIPPED tests (70 from v1 + card-create) still pass (no regression).
- [AC-F4] `pnpm --filter @repo/web check-types` — clean.
- [AC-F5] `pnpm --filter @repo/web test` + `build` — green (no regression).
- [AC-F6] **No-mutation proof green**: T-FILT-NOMUT (pure) + T-FILT-COUNT (storage byte-identical) both pass — the load-bearing safety gate.
- [AC-F7] **Manual real-browser sweep** (macOS Safari + Chrome) — MAY be deferred per ADR-0008 §S3, recorded in dev_log verify section. Tasks must be ENABLED in Settings (Features pane) for the module to mount (discovery §1.6):
  - Click each smart-list (All / Today / Tomorrow / Next 7 / Inbox / Summary) → board filters per the predicate table.
  - A filter with no matches → honest empty state appears.
  - Click All → full board restored.
  - Drag a card, create a card, toggle complete → all still work; hard-reload → `xai_task_cols` unchanged by filtering (state survives exactly as before this feature).
  - Switch lang EN ↔ 中文 → smart-list labels + empty-state flip.
- [AC-F8] **Cross-vendor (FP2)**: Codex cold-read of `filterCardsByList` + the lift OR formally deferred per ADR-0008 §S3 with the (i) unique-anchors / (ii) absolute-paths / (iii) no-template-syntax checklist recorded in dev_log.

## F.4 Out-of-scope tests (extension)

- Custom-list / tag membership filtering (Q1 deferred — rows are non-selecting; only the inert-ness is asserted in T-LIFT-4).
- A real Summary dashboard (Q2 treat-as-all — only identity behaviour tested).
- Persistence of the active-list selection (Q3 session-only — no persistence test for `activeList`; the relevant test is T-FILT-COUNT proving `xai_task_cols` is NOT written).
- Date-string parsing (B2/B3 rejected — no test for parsing `card.date`).
- Reducer mutation behaviour (already covered by SHIPPED T-RD/T-ADD suites; this extension only guards them against regression via T-REG-NOMUT).
