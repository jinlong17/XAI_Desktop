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
