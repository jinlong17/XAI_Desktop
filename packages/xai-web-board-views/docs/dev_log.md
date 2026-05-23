# Dev Log — xai-web-board-views

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Executor | claude-sonnet-4-6 (feature-auto-build, 2026-05-23) |
| Updated | 2026-05-23 15:00 |
| Target | xai-web-board-views |
| Title | Web Console Board — 5 additional views (Table / Calendar / Dashboard / Timeline / Map) layered on `@repo/plugin-web-board-core` (row #7 READY_TO_SHIP). Adds a Table view (row-per-card with inline Due picker with Today/Tomorrow/Next Mon quick-shortcuts + Labels/Members multiselect + Progress column), Calendar view (month grid with HTML5 DnD-to-change-due that rewrites `card.due` via board-core's `updateCardInList` — hard constraint: same persistence path as core), Dashboard view (4 KPIs + horizontal bar chart by column + horizontal bar chart by label, no chart library), Timeline view (30-day Gantt with left/center/right pointer-DnD handles that atomically update `{start, due}` — hard constraint — with visual clip at gantt edge — hard constraint), Map view (SVG placeholder until cards get a location field), plus a ViewPicker widget and a `BoardModule` orchestrator that composes board-core's barrel exports (`BoardView`, `updateCardInList`, `loadBoardsOrDefault`, `pickActiveBoard`, `makeDefaultBoards`, `PM_LABELS`) — board-core consumed via `index.ts` barrel ONLY (no `…/src/internal/*` imports; eslint-enforced). Persists per-board active view selection in a new `xai_board_view_by_id` (`Record<string, BoardViewId>`) registry key — hard constraint. Module registration replaces line 61 of `apps/web/src/routes/modules/shellRegistrations.tsx` (the `boardCoreWebModuleRegistration` array entry) with `boardViewsWebModuleRegistration` (railOrder 3 preserved). Bilingual via `lang` prop + inline literals + a local 3-line `bilingual` helper. Three-phase build (P1 scaffold + types + ViewPicker + Table + Dashboard + Map + tests · P2 Calendar + Timeline + persistence + tests · P3 BoardModule orchestrator + registration + apps/web wire-up + new persistence registry entry + PLUGIN_MAP + integration tests). |
| Current Phase | FEATURE_VERIFY |
| Status | READY_FOR_VERIFY |
| Suggested Next | feature-verify |
| Verify Cross-vendor | queued (manifest header — ship-time Codex `gpt-5.5-thinking medium` / Cursor fallback; row-level verify is same-vendor Claude Opus — documented compromise) |
| Automation Mode | A-Claude (per roadmap default; xai-roadmap-loop W2e parallel-Agent mode — siblings #9 board-workspaces + #11 dashboard-widgets planning concurrently) |
| Executor | Claude Opus 4.7 1M (feature-review, 2026-05-23) |
| Updated | 2026-05-23 |
| Dispatched By | xai-roadmap-loop (W2e parallel dispatch, concurrent with rows #9 and #11) |
| Roadmap Row | docs/workflow/roadmap/xai-web-console.md row #8 (W2 · Module) |
| ADR Anchor | docs/adr/0007-xai-web-console-build-form.md §S4 (port map "module-board.jsx" → `packages/plugin-web-board-views/`) + §S5 (JSX→TSX rules) + §S6 (Vite SPA build form) + §S7 (no new event channels for row #8) + §S8 (registry — single new key `xai_board_view_by_id` added in P3) |
| Concurrent Siblings | #9 xai-web-board-workspaces (IN_PROGRESS plan) · #11 xai-web-dashboard-widgets (IN_PROGRESS plan) — write-scope-disjoint per api.md §13 |
| Write Scope | **planning phase**: `packages/xai-web-board-views/docs/` + `docs/reviews/xai-web-board-views/` ONLY. **build phase (later)** extends to `packages/plugin-web-board-views/` (new package) + a single-line Edit on the `boardCoreWebModuleRegistration` array entry of `apps/web/src/routes/modules/shellRegistrations.tsx` (replaced with `boardViewsWebModuleRegistration`) + a single new import line + a one-line workspace dep addition in `apps/web/package.json` + a single new registry entry in `packages/plugin-web-storage/src/internal/registry.ts` (`xai_board_view_by_id`) + a single row add in `docs/PLUGIN_MAP.md` |

## Artifacts Index

- Seed brief: `docs/reviews/xai-web-board-views/20260523-roadmap-seed.md`
- Discovery review: `docs/reviews/xai-web-board-views/20260523-discovery-review.md`
- Design snapshot: `packages/xai-web-board-views/docs/design.md`
- API contract: `packages/xai-web-board-views/docs/api.md`
- Test strategy: `packages/xai-web-board-views/docs/test.md`

## Decision Headline

Port `web design/module-board.jsx` lines 527–1092 (5 view functions: `TableView` / `BoardCalendarView` / `BoardDashboardView` (+ `BDKpi` helper) / `TimelineView` / `MapView`) into a new typed React 19 package `@repo/plugin-web-board-views` at `packages/plugin-web-board-views/`. Compose `@repo/plugin-web-board-core` (row #7, READY_TO_SHIP) via its `index.ts` barrel ONLY — pulling its `BoardView` Kanban renderer, `updateCardInList` pure helper, `loadBoardsOrDefault` / `pickActiveBoard` persistence helpers, `makeDefaultBoards` seed, `PM_LABELS` constant, and Board/BoardListData/BoardCardData schema types. Add a `ViewPicker` widget (6 entries) + a `BoardModule` orchestrator that selects one of the 6 view renderers based on a per-board active view id persisted in a NEW `xai_board_view_by_id` registry key (codec `json`, default `{}`, shape `Record<string, BoardViewId>`). The shell slot registration in `apps/web/src/routes/modules/shellRegistrations.tsx` swaps `boardCoreWebModuleRegistration` for `boardViewsWebModuleRegistration` (same moduleId `"board"`, same railOrder 3 — view-picker lives INSIDE the `/board` route). board-core's `BoardView` is now reached via the picker's `"board"` entry — Kanban remains the default and the picker is visually integrated into the header.

Card mutations (Calendar drop, Timeline 3-handle DnD, Table inline edits) call a SINGLE `updateCard(listId, cardId, patch)` closure that delegates to board-core's `updateCardInList` pure helper, then writes back via `setBoards` (same atomic pattern as row #7). NO new persistence path for card mutations — hard constraint honoured.

The Timeline 3-handle DnD captures `mousedown` on a handle, updates a preview map via `window.mousemove`, and commits ONE `updateCardInList` call via `window.mouseup` (atomic — hard constraint). Mouseup-without-mousemove produces NO write. Bars clamp via `Math.max(0, Math.min(days-1, …))` and visually clip via CSS `clip-path` — hard constraint honoured.

Bilingual via `lang` prop + inline `lang === "zh" ? … : …` literals + a local `bilingual({en,zh}, lang)` helper (3-line pure). `useI18n` is NOT ported — sibling rows have stopped using it; we follow board-core's `lang`-prop pattern. The brief mentions `useI18n` as a possible path; design.md §13 documents the decision to use the prop pattern instead.

No `@repo/core` source edits. NO event-bus emit. NO new `EventMap` entries. NO new CSP / Sentry envelope rules. ONE registry add (`xai_board_view_by_id`). All other persistence keys reused (`xai_boards_v2` + `xai_active_board` from row #7).

The W2e parallel dispatch is write-scope-disjoint: this row touches its own package + `boardCoreWebModuleRegistration` array entry in `shellRegistrations.tsx` + `apps/web/package.json` (one new dep) + `packages/plugin-web-storage/src/internal/registry.ts` (one new entry block). Concurrent sibling #9 (board-workspaces) does NOT touch this row's array entry yet — its wrapping-over-board-views will happen AFTER row #8 ships (per Depends chain). Concurrent sibling #11 (dashboard-widgets) touches a DIFFERENT registration array entry (the dashboard slot). Apply the auto-build retry-on-lock strategy from W2d (countdown row #17 / ai-chat row #18 sibling precedent) if `git index.lock` contention happens.

## Phase Plan (3 phases — per design.md §"Build phase scope (preview)")

> Each phase is a single `feature-build` run. After each phase, `feature-build`
> stops for human confirmation per CLAUDE.md "feature-build does ONE phase per run".
> In auto-build (xai-roadmap-loop W2e Parallel-Agent mode), all phases run in one worker
> invocation and the loop only stops on a BLOCKED status or after all phases DONE.

### Phase P1 — Package scaffolding + types + ViewPicker + TableView + BoardDashboardView + MapView + tests

**Scope**

1. **Create runtime package** at `packages/plugin-web-board-views/`:
   - `package.json` (name `@repo/plugin-web-board-views`, deps per api.md §15)
   - `tsconfig.json` (extends `@repo/typescript-config/react-library.json`)
   - `manifest.json` (`status: "In-Dev"`, `type: "ui"`, `owner: "xai-web-board-views row #8"`, `windows: []`)
   - `vitest.config.ts` (jsdom; `setupFiles: ["./vitest.setup.ts"]`; include `src/__tests__/**/*.{test,spec}.{ts,tsx}`)
   - `vitest.setup.ts` (`requestAnimationFrame` polyfill + `afterEach(() => localStorage.clear())` + `import "@testing-library/jest-dom"`)
   - `eslint.config.js` (extends `@repo/eslint-config/react-internal` + `@typescript-eslint/no-explicit-any: error` + `no-restricted-imports` rule blocking `@repo/plugin-web-board-core/*/internal*`)
2. **Public types** in `src/types.ts`:
   - `type BoardViewId = "board" | "table" | "calendar" | "dashboard" | "timeline" | "map";`
   - `interface ViewPickerEntry { id: BoardViewId; labelEn: string; labelZh: string; icon: …; }`
   - `type DueShortcutId = "today" | "tomorrow" | "next-mon";`
3. **Internal pure modules** in `src/internal/`:
   - `i18n.ts` — 3-line `bilingual({en, zh}, lang)` helper
   - `dueShortcuts.ts` — `todayShortcut(lang)` / `tomorrowShortcut(today)` / `nextMondayShortcut(today)` — pure helpers
4. **Components** in `src/`:
   - `ViewPicker.tsx` (props per api.md §2)
   - `TableView.tsx` (props per api.md §3 — includes inline Due picker / Labels popover / Members popover / Progress column)
   - `BoardDashboardView.tsx` (props per api.md §5 — 4 KPIs + 2 bar charts)
   - `MapView.tsx` (props per api.md §7 — SVG placeholder verbatim)
   - `styles.css` partial — `.board-table-wrap`, `.board-table`, `.td-pill`, `.td-labels`, `.td-popover`, `.popover-scrim`, `.bcw`, `.board-dash`, `.bd-kpis`, `.bd-bars`, `.bd-bar-row`, `.bd-bar-track`, `.bd-bar-fill`, `.board-map`, `.bm-svg`, `.bm-overlay`, `.bm-card` (table / dash / map sections from `web design/layout.css`)
5. **Tests (P1 subset per test.md §2)**:
   - `__tests__/dueShortcuts.test.ts` (DS1..DS7)
   - `__tests__/ViewPicker.test.tsx` (VP1..VP5)
   - `__tests__/TableView.test.tsx` (TV1..TV13)
   - `__tests__/BoardDashboardView.test.tsx` (BD1..BD10)
   - `__tests__/MapView.test.tsx` (MV1..MV3)

**Acceptance**

- `pnpm --filter @repo/plugin-web-board-views lint --max-warnings 0` exits 0
- `pnpm --filter @repo/plugin-web-board-views typecheck` exits 0
- `pnpm --filter @repo/plugin-web-board-views test` exits 0; all P1 tests pass
- Commit: `feat(plugin-web-board-views): P1 scaffolding + types + ViewPicker + Table + Dashboard + Map + tests (W2e row #8)`

### Phase P2 — BoardCalendarView + TimelineView + dateOps + persistence + tests

**Scope**

1. **Internal pure modules** in `src/internal/`:
   - `dateOps.ts` — `parseDay(due, today)` / `dayToStr(offset, today)` / `clampDay(n, days)` — pure helpers
   - `persistence.ts` — `loadViewByBoardIdOrEmpty(raw)` narrowing guard (returns `{}` on null / wrong shape)
2. **Components** in `src/`:
   - `BoardCalendarView.tsx` (props per api.md §4 — month grid + HTML5 DnD-to-change-due)
   - `TimelineView.tsx` (props per api.md §6 — 30-day Gantt + 3-handle pointer DnD + atomic `{start, due}` update + clamp + clip)
   - `styles.css` extension — `.board-cal`, `.board-cal-head`, `.board-cal-week`, `.board-cal-grid`, `.board-cal-cell`, `.bcc-num`, `.bcc-cards`, `.bcc-card`, `.bcc-more`, `.today-pill`, `.bcal-empty`, `.drag-over` (calendar section from `web design/layout.css`); `.board-tl`, `.tl-head`, `.tl-days`, `.tl-track`, `.tl-row`, `.tl-bar`, `.tl-bar-body`, `.tl-handle-l`, `.tl-handle-r`, `.tl-clip-left`, `.tl-clip-right` (timeline section)
3. **Test helpers** in `src/__tests__/_helpers/`:
   - `dataTransfer.ts` — `makeDataTransferMock()` (Calendar tests)
   - `timelineDrag.ts` — `simulateTimelineDrag(handleEl, deltaPx, mode)` (Timeline tests; stubs `getBoundingClientRect` + dispatches `mousedown`/`window.mousemove`/`window.mouseup`)
4. **Tests (P2 subset per test.md §2)**:
   - `__tests__/dateOps.test.ts` (DO1..DO7)
   - `__tests__/BoardCalendarView.test.tsx` (BC1..BC12)
   - `__tests__/TimelineView.test.tsx` (TL1..TL17)

**Acceptance**

- `pnpm --filter @repo/plugin-web-board-views lint --max-warnings 0` exits 0
- `pnpm --filter @repo/plugin-web-board-views typecheck` exits 0
- `pnpm --filter @repo/plugin-web-board-views test` exits 0; all P1+P2 tests pass
- DnD round-trip in both Calendar + Timeline verified
- Timeline atomic `{start, due}` write verified (test TL10 + TL11)
- Timeline mouseup-without-move no-write verified (test TL12 + TL16)
- Commit: `feat(plugin-web-board-views): P2 Calendar + Timeline + dateOps + persistence + tests (W2e row #8)`

### Phase P3 — BoardModule orchestrator + registration + apps/web wire-up + new registry entry + PLUGIN_MAP + integration tests

**Scope**

1. **`BoardModule.tsx`** — the top-level orchestrator (props: `{ lang }`):
   - `usePref("xai_boards_v2")` with `loadBoardsOrDefault` narrowing (from board-core barrel)
   - `usePref("xai_active_board")` with `pickActiveBoard` resolution (from board-core barrel)
   - `usePref("xai_board_view_by_id")` with `loadViewByBoardIdOrEmpty` narrowing (NEW key — P2 helper)
   - Computes `activeView: BoardViewId = viewByBoardId[activeBoard.id] ?? "board"`
   - Local state for board-core's `BoardView` (draftListIdx, composerText, etc.) — reproduces the local-state plumbing of board-core's `BoardModule` because we're replacing the registration. (Alternative: import board-core's `BoardModule` and wrap it, but the picker needs to live in our header. We go with the local-state-reproduction path; ~50 LOC.)
   - `updateCard(listId, cardId, patch)` closure delegating to `updateCardInList` from board-core barrel
   - Renders `<header>` with `<h1>{activeBoard.name[lang]}</h1>` + `<ViewPicker activeView={activeView} onChange={setView} lang={lang} />`
   - Renders one of 6 views based on `activeView` switch
2. **`src/registration.tsx`** — `boardViewsWebModuleRegistration` per api.md §9 (moduleId `"board"`, icon `"kanban"`, railOrder 3, i18nKey `"nav.board"`, showInRail true). Uses `useWebShell()` to read `lang`.
3. **`src/index.ts`** — public surface per api.md §0 (types + 7 components + registration + side-effect CSS import).
4. **`apps/web/src/routes/modules/shellRegistrations.tsx`** — replace the `boardCoreWebModuleRegistration,  // xai-web-board-core row #7 (railOrder 3)` array entry (currently line 61 — sibling rows may shift) with `boardViewsWebModuleRegistration,  // xai-web-board-views row #8 (railOrder 3 — supersedes board-core direct registration)`. Add new `import { boardViewsWebModuleRegistration } from "@repo/plugin-web-board-views";` near the existing board-core import. Remove the now-unused `import { boardCoreWebModuleRegistration } from "@repo/plugin-web-board-core";` line ONLY IF ESLint flags it (board-views uses other board-core exports — the `import` package is still in scope).
5. **`apps/web/package.json`** — add `"@repo/plugin-web-board-views": "workspace:*"` to `dependencies` (alphabetically sorted).
6. **`packages/plugin-web-storage/src/internal/registry.ts`** — append ONE new entry:
   ```ts
   xai_board_view_by_id: {
     codec: "json",
     default: {},
     status: "non-proposed",
     owner: "xai-web-board-views row #8",
   },
   ```
   (exact format aligned to sibling adds from rows #7 / #10 / #20).
7. **`docs/PLUGIN_MAP.md`** — add a row in "Web Modules (W2 parallel build)" section: `| @repo/plugin-web-board-views | packages/plugin-web-board-views/ | In-Dev | Web Console Board — 5 additional views (Table/Calendar/Dashboard/Timeline/Map) + ViewPicker layered on `@repo/plugin-web-board-core` row #7. Persists per-board active view in `xai_board_view_by_id`. READY_FOR_VERIFY — cross-vendor manual smoke pending feature-verify. | @repo/core, @repo/plugin-web-board-core, @repo/plugin-web-tokens, @repo/plugin-web-storage, @repo/xai-web-shell | 2026-05-23 |`.
8. **Tests (P3 subset per test.md §2)**:
   - `__tests__/BoardModule.test.tsx` (BM1..BM8)
   - `__tests__/registration.test.tsx` (RG1..RG4)
   - `__tests__/index-barrel.test.ts` (IB1..IB4)

**Acceptance**

- `pnpm --filter @repo/plugin-web-board-views lint --max-warnings 0` exits 0
- `pnpm --filter @repo/plugin-web-board-views typecheck` exits 0
- `pnpm --filter @repo/plugin-web-board-views test` exits 0; all P1+P2+P3 tests pass
- `pnpm --filter @repo/plugin-web-storage test` exits 0 (registry entry test)
- `pnpm --filter @repo/web lint --max-warnings 0` exits 0
- `pnpm --filter @repo/web check-types` exits 0
- `pnpm --filter @repo/web build` exits 0
- `pnpm --filter @repo/web test` exits 0 (no host regression)
- Commit: `feat(plugin-web-board-views): P3 BoardModule + registration + host wire-up + new registry entry + PLUGIN_MAP (W2e row #8)`

## Risks

- **R1**: Timeline pointer DnD lifecycle (window-level mousemove/mouseup with cleanup on unmount). Mitigation: `useEffect` cleanup; jsdom test mocks `getBoundingClientRect` + dispatches synthetic mouse events (sibling pomodoro/habits precedent). Tests TL9..TL17.
- **R2**: Calendar HTML5 DnD `dragover` must `preventDefault` per spec. Mitigation: verbatim port; test BC7 asserts `event.defaultPrevented`. Malformed payload silent no-op (test BC9).
- **R3**: Dashboard per-label chart depends on `PM_LABELS` from board-core barrel. Mitigation: use `PM_LABELS` directly; defer workspace-scoped labels to row #9. Empty-label cards filtered out (test BD7).
- **R4**: `BoardCard.start?: string` already exists in board-core schema but seed doesn't populate it. Timeline cards without `start` get single-day bar (`start === due`). Mitigation: test TL5 asserts single-day-bar behaviour.
- **R5**: Sibling rows #9 + #11 contend for `apps/web/package.json` + `shellRegistrations.tsx` + `packages/plugin-web-storage/src/internal/registry.ts`. Mitigation: `Edit` (not `Write`) on shared files; unique anchors (this row swaps the `boardCoreWebModuleRegistration` array entry; #11 touches `dashboardGridSlotRegistration` array entry; #9 will wrap THIS row LATER, after #8 ships); each row appends a DIFFERENT registry block; retry `git index.lock` 8–20s × 5.
- **R6**: Cross-vendor verify queued at ship time (not row-level), per manifest header W2e Parallel-Agent mode. Mitigation: documented in design.md §"Cross-vendor verify note" + feature-verify report.
- **R7**: View picker state with orphan entries (deleted boards). Mitigation: documented in api.md §11 as "tolerated"; test BM8 asserts no-crash.
- **R8**: New persistence registry entry add requires the existing registry tests to still pass. Mitigation: add an entry-level test in `packages/plugin-web-storage/__tests__/registry.test.ts` mirroring sibling row #7's pattern. Plan budgets one extra commit for the registry test (well within auto-build retry budget).
- **R9**: Due picker quick-shortcuts must produce strings that all 3 downstream consumers (Calendar `byDay` lookup + Timeline `parseDay` + Table re-render) accept. Mitigation: tests DS1..DS7 + integration test BM4 verify round-trip.
- **R10**: Map view scored as "non-functional" by verifier. Mitigation: documented in design.md + test.md as a DESIGN.md §4.3 + brief deliberate placeholder. Acceptance: "renders without crash; explanatory text visible" (tests MV1..MV3).
- **R11**: `BoardModule` reproduces board-core's local-state plumbing (draftListIdx, composerText, etc.) — risk of drift when board-core changes. Mitigation: keep the duplication minimal (~50 LOC); document the duplication as "intentional v1 trade-off" in design.md §1 (row #9 will further wrap; future cleanup may re-export from board-core).
- **R12**: ESLint `no-restricted-imports` rule must catch `@repo/plugin-web-board-core/src/internal/*` attempts. Mitigation: include a test that statically scans the package's compiled output for forbidden imports (sibling row #18 ai-chat precedent for static-scan tests).

## Review Notes

**Verdict: APPROVED** — 0 blockers, 2 advisory recommendations.

**Reviewer**: Claude Opus 4.7 1M (feature-review, 2026-05-23). Same-vendor as planner (W2e Parallel-Agent manifest-header compromise — documented).

### Gate-by-gate findings

| # | Gate | Result | Evidence |
|---|---|---|---|
| 1 | Seed-brief fidelity (5 views: Table/Calendar/Dashboard/Timeline/Map) | PASS | api.md §3–§7 cover all 5 + ViewPicker §2; test.md §2.4–§2.8 cover each. |
| 2 | Consumes `@repo/plugin-web-board-core` via index.ts ONLY (no `…/src/internal/*`) | PASS | design.md §dep#2 + frozen-assumption #2 + eslint `no-restricted-imports` rule. Verified against `packages/plugin-web-board-core/src/index.ts` (91 lines): all symbols consumed by board-views (`BoardView`, `updateCardInList`, `loadBoardsOrDefault`, `pickActiveBoard`, `makeDefaultBoards`, `PM_LABELS`, `BoardListData`, `BoardCardData`, `BilingualText`) are present in the barrel. `bilingual` correctly NOT in barrel; plan declares local 3-line helper. |
| 3 | Table Due picker Today/Tomorrow/Next-Mon shortcuts + Labels/Members multiselect + Progress | PASS | api.md §3 + test.md TV5/TV6/TV7/TV8/TV9/TV10/TV11/TV12 + frozen-assumption #6 with explicit emit strings (`"Today"`/`"今天"`/`"M/D"`). |
| 4 | Calendar DnD rewrites `card.due` via SAME persistence path as core | PASS | api.md §4 + frozen-assumption #7 + test.md BC8 (hard-constraint). Patch shape verbatim from prototype line 758. |
| 5 | Timeline 3-handle DnD updates `{start, due}` atomically (one write) | PASS | api.md §6 + frozen-assumption #8 + test.md TL9/TL10/TL11 (atomic) + TL12/TL16 (mouseup-without-move = no-write). Patch shape verbatim from prototype lines 974–983. |
| 6 | View switcher state persisted per board | PASS | api.md §8 + new key `xai_board_view_by_id` (`Record<boardId, BoardViewId>`) + test.md BM3 + frozen-assumption #12. Orphan-tolerance documented (api.md §11). |
| 7 | Bilingual via useI18n | PASS-WITH-DEVIATION | Plan deviates to `lang` prop + local `bilingual()` helper. Justified by sibling-row precedent and board-core's `lang`-prop pattern. design.md §13 + frozen-assumption #13 explicitly document the deviation. Brief-language "useI18n" treated as soft-guideline. |
| 8 | Module registers via @repo/xai-web-shell slot (or board-core view-registry — plan clarifies) | PASS | Plan picks the slot-replacement path (Option γ). board-core's array entry in `shellRegistrations.tsx` is replaced with `boardViewsWebModuleRegistration` (same moduleId `"board"`, same `railOrder 3`). Option β (view-registry injected into board-core) explicitly rejected with reasoning (would reopen row #7 READY_TO_SHIP). api.md §9 + frozen-assumption #14. |
| 9 | 3 phases right-sized | PASS | P1 = scaffold + Table + Dashboard + Map + 5 test files (~6 src + 5 test). P2 = Calendar + Timeline + dateOps + persistence + 3 test files. P3 = orchestrator + registration + index + 4 shared-file Edits + 3 test files. Each phase independently committable; acceptance gates per phase. |
| 10 | Cross-vendor verify | PASS | Queued at ship-time per W2e Parallel-Agent manifest-header policy. Documented in design.md §"Cross-vendor verify note" + test.md G8 + dev_log Status Panel. Row-level same-vendor compromise explicit. |

### Architecture risk

- **packages/core/ changes**: NONE — confirmed by design.md (only consumes `@repo/core` for shared `lang` type). PASS.
- **manifest.json routing changes**: NONE on this package's manifest; on `apps/web/src/routes/modules/shellRegistrations.tsx` the change is a single-array-entry swap (`boardCoreWebModuleRegistration` → `boardViewsWebModuleRegistration`), same moduleId `"board"` and `railOrder 3`. PASS.
- **Cross-feature contract drift**: NONE for row #7 (consumed via barrel only; no edits to row #7's surface). Concurrent-write contention with #9/#11 on `apps/web/package.json` + `shellRegistrations.tsx` + `packages/plugin-web-storage/src/internal/registry.ts` is documented (api.md §13 + R5/R8) with the W2d Edit-not-Write + retry-on-lock protocol. PASS.

### Advisory recommendations (non-blocking — surface in feature-verify report)

1. **REC-1 — BoardModule local-state reproduction (~50 LOC)**: P3 reproduces board-core's `BoardModule` local-state plumbing (`draftListIdx`, `composerText`, etc.) instead of wrapping `<BoardView>` only. Plan flags this as R11 with an "intentional v1 trade-off" stance and an exit-strategy (row #9 wrap OR board-core re-export). Acceptable for v1; recommend feature-verify confirm the duplication is minimal and matches board-core's current shape so future re-export refactor is a clean swap.
2. **REC-2 — useI18n deviation visibility**: The brief's literal wording is "Bilingual via useI18n" but the plan uses `lang` prop. This is well-justified (sibling-row precedent + board-core consistency) and documented in design.md §13, but feature-verify should explicitly call out the deviation in its report so the workflow trail is complete.

### Files reviewed

- `docs/reviews/xai-web-board-views/20260523-discovery-review.md` (171 lines)
- `docs/reviews/xai-web-board-views/20260523-roadmap-seed.md` (26 lines)
- `packages/xai-web-board-views/docs/design.md` (116 lines)
- `packages/xai-web-board-views/docs/api.md` (369 lines)
- `packages/xai-web-board-views/docs/test.md` (249 lines)
- `packages/xai-web-board-views/docs/dev_log.md` (199 lines)
- `packages/plugin-web-board-core/src/index.ts` (91 lines — dep barrel verification)
- `docs/adr/0007-xai-web-console-build-form.md` §S4 (port-map + 3-row split confirmed)

### Hard-constraint roll-up

All FOUR hard constraints from seed brief explicitly tested:
- Today/Tomorrow/Next-Mon shortcuts → tests DS1–DS7 + TV7/TV8/TV9
- Calendar DnD rewrites due (same path as core) → test BC8 (asserts `updateCardInList` call shape)
- Timeline atomic `{start, due}` update → tests TL9/TL10/TL11 (single call) + TL12/TL16 (no-write on no-move)
- View switcher persisted per board → tests BM3 + BM8 (orphan-tolerance)

## Verify Report

_(populated by feature-verify)_

## Phase Progress

| Phase | Status | Commit | Notes |
|---|---|---|---|
| P1 — Scaffolding + types + ViewPicker + Table + Dashboard + Map + tests | DONE | 0649c0b | 38 tests pass; lint + typecheck clean |
| P2 — Calendar + Timeline + dateOps + persistence + tests | DONE | 1114cba | 74 total tests pass; PointerEvent polyfill added; 3-sequential-act() pattern for Timeline DnD |
| P3 — BoardModule + registration + host wire-up + new registry entry + PLUGIN_MAP + integration tests | DONE | 0f6ca12 | 90 total tests pass; lint + typecheck + web build clean; storage tests updated |

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-23 | Claude Opus 4.7 1M | feature-plan Fresh — produced discovery review + design + api + test + dev_log | — | feature-review |
| 2026-05-23 | Claude Opus 4.7 1M | feature-review — gate pass (10/10), 0 blockers + 2 advisory recommendations (REC-1 BoardModule local-state reproduction, REC-2 useI18n→lang-prop deviation visibility). dev_log flipped APPROVED. | — | feature-auto-build |
| 2026-05-23 15:00 | claude-sonnet-4-6 | feature-auto-build P1 — scaffold + types + ViewPicker + TableView + BoardDashboardView + MapView + tests (38 tests). Lint + typecheck clean. | 0649c0b | P2 |
| 2026-05-23 15:00 | claude-sonnet-4-6 | feature-auto-build P2 — BoardCalendarView + TimelineView + dateOps + persistence + tests (74 total). PointerEvent polyfill + 3-act() sequential DnD pattern. Fixed React key warning in TimelineView (Fragment key). | 1114cba | P3 |
| 2026-05-23 15:00 | claude-sonnet-4-6 | feature-auto-build P3 — BoardModule orchestrator (REC-1/REC-2 applied) + registration.tsx + index.ts barrel + xai_board_view_by_id registry entry + PLUGIN_MAP row + integration tests BM1..BM8 + RG1..RG4 + IB1..IB4. 90 total tests pass. web build + check-types pass. storage tests updated (OWNER_ROW_ADDITIONS + OWNER_ROW_EXEMPT_KEYS). Status → READY_FOR_VERIFY. | 0f6ca12 | feature-verify |
