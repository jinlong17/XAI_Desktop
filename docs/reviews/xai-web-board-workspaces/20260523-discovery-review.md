# Discovery Review — xai-web-board-workspaces

> Row #9 · Wave W2e · Module (split from board) · feature-plan (Fresh mode)
> Author: Claude Opus 4.7 1M · Date: 2026-05-23
> Seed brief: `docs/reviews/xai-web-board-workspaces/20260523-roadmap-seed.md`
> Source PRD: `web design/DESIGN.md` §4.3
> Source code: `web design/module-board.jsx` (BoardSwitcher 1280–1366, BoardCreator 1370–1417, StatusOverviewBanner 1421–1492, InboxPanel 1172–1217, PlannerPanel 1221–1277, BoardModule wrapper 26–309)
> ADR anchor: `docs/adr/0007-xai-web-console-build-form.md` §S4 (port map "module-board.jsx" → `packages/plugin-web-board-workspaces/`)
> Authority: SUPERSEDES prior PRDs where they conflict (user override 2026-05-23)

## 1. Problem framing

Row #7 (`xai-web-board-core`, SHIPPED-equivalent / READY_TO_SHIP) ports the **Board (Kanban) view** of the module — schema, `BoardView` / `BoardList` / `BoardCard` components, DnD, list-color palette, persistence helpers, and the shell slot that currently registers a *minimal* `BoardModule` consisting only of an active-board header + a single Kanban canvas.

The original `web design/module-board.jsx` is, however, a **two-layer module**:

1. **Layer 1 (board view layer)** — owned by row #7. `BoardView` + `BoardList` + `BoardCard` + DnD + add-card / add-list composers + list-color popover.
2. **Layer 2 (workspace + multi-board layer)** — owned by THIS row #9. Workspace chips, board switcher modal (search + scope tabs + grid of board cards + "+ New board"), board creator (3 templates: Basic Kanban / PM for Teams / Blank), Project-Management-for-Teams template visual treatment (`StatusOverviewBanner` ring chart toggle), bottom 4-button multi-panel switcher (Inbox 260px / Planner 320px / Board flex / "Switch boards" trigger), `InboxPanel`, `PlannerPanel`.

In addition, when this row lands the shell-registered `BoardModule` MUST upgrade from "minimal header + BoardView only" to the **full module wrapper** that mounts switcher / creator / panels / status-overview-banner around the Kanban view. The replacement is opt-in (row #7's exported `BoardModule` stays in `@repo/plugin-web-board-core` so view-only consumers / tests continue to work) but the shell registration line at `apps/web/src/routes/modules/shellRegistrations.tsx:65` will swap from `boardCoreWebModuleRegistration` to a new `boardWorkspacesWebModuleRegistration`.

Out of scope for this row (deferred to row #8 `xai-web-board-views`): Table / Calendar / Dashboard / Timeline / Map views + card detail modal + view picker dropdown. Row #9's `BoardModule` ALWAYS mounts the Kanban view in the central panel (view picker UI may be present but disabled/no-op until row #8 lands).

### Hard constraints (from seed brief)

- Multi-panel rule: at least one panel must stay open; single selection → full-width fill; 2 or 3 selected → side-by-side.
- Panel state persists to `xai_board_panels`; Inbox cards to `xai_board_inbox` (both already SHIPPED `unknown` slots in the storage registry — narrow at component boundary).
- PM Status Overview ring chart must reflect live card distribution per stage with percentages (sum-normalized SVG `circle` segments + done% center label).
- All workspace + board names bilingual via `useI18n` (already shipped in `@repo/plugin-web-tokens`).
- Each phase = one commit. Lint clean.

## 2. Candidate options

### Option A — Wrapper plugin `@repo/plugin-web-board-workspaces` that composes board-core's public surface and replaces shell registration line 65 (RECOMMENDED)

**Approach.** Create a new sibling package `packages/plugin-web-board-workspaces/`. It depends on `@repo/plugin-web-board-core` and consumes ONLY its public surface (`BoardView`, `BoardModule` is NOT consumed — workspaces re-implements the wrapper with all switcher/creator/panel/banner logic added). Re-exports needed from board-core: `Board`, `BoardCard` (data alias `BoardCardData`), `BoardList` (data alias `BoardListData`), `BoardWorkspace`, `BoardTemplate`, `BilingualText`, `BoardListColorId`, `DEFAULT_WORKSPACES`, `BOARD_TEMPLATES`, `PM_LABELS`, `makeDefaultBoards`, `loadBoardsOrDefault`, `pickActiveBoard`, `addCardToList`, `addNewList`, `moveCardToList`, `setListColor`, `updateCardInList`, `isBoardArray`, `BoardView`, `LIST_COLOR_PALETTE`, `LIST_COLOR_IDS`.

Net new code:
- `BoardSwitcher.tsx` — modal with search + workspace scope tabs + grouped grid of board cards + "+ New board" + delete affordance
- `BoardCreator.tsx` — modal with template picker (3 cards) + name field + workspace select + cancel/create footer
- `StatusOverviewBanner.tsx` — left description + center SVG ring chart + right legend (only mounted when active board's `template === "pm"` AND `overviewOpen === true`)
- `InboxPanel.tsx` — 260px capture-style list + composer + remove affordance
- `PlannerPanel.tsx` — 320px today's time-slot view (8am–7pm) + seeded slots from cards with `due === "Today" / "今天" / today's M/D` (pseudo)
- `BoardWorkspacesModule.tsx` — TOP-LEVEL wrapper that replaces board-core's `BoardModule`: `usePref("xai_boards_v2")`, `usePref("xai_active_board")`, `usePref("xai_board_panels")` (narrowed via `isPanelState`), `usePref("xai_board_inbox")` (narrowed via `isInboxCardArray`), header (workspace chip + title button + view picker dropdown disabled + members + overview toggle + filter / share / dots) + status overview banner (PM-only, toggled) + multi-panel layout container + bottom 4-button switcher
- `registration.tsx` — `boardWorkspacesWebModuleRegistration` (moduleId `"board"`, icon `"kanban"`, railOrder 3, i18nKey `"nav.board"`, showInRail true) — REPLACES the line currently held by `boardCoreWebModuleRegistration`
- Internal narrowing helpers: `isPanelState(x): x is BoardPanelStateShape` + `isInboxCardArray(x): x is InboxCardShape[]`
- Internal pure helpers: `computeRingSegments`, `computeDonePct`, `getTodayDueCards` (deterministic given a `now` Date arg for testability)

Shell registration delta (`apps/web/src/routes/modules/shellRegistrations.tsx`):

```diff
- // xai-web-board-core row #7
- import { boardCoreWebModuleRegistration } from "@repo/plugin-web-board-core";
+ // xai-web-board-workspaces row #9 (extends row #7's view layer with workspaces + switcher + creator + PM template + multi-panel)
+ import { boardWorkspacesWebModuleRegistration } from "@repo/plugin-web-board-workspaces";

  ...

-   boardCoreWebModuleRegistration,  // xai-web-board-core row #7 (railOrder 3)
+   boardWorkspacesWebModuleRegistration,  // xai-web-board-workspaces row #9 (railOrder 3, replaces row #7's minimal shell wrapper)
```

`apps/web/package.json` keeps `@repo/plugin-web-board-core` AND adds `@repo/plugin-web-board-workspaces` (the new package re-exports board-core's types via its own surface, but apps/web's tree-shake-friendly setup tolerates the double-dep — and keeping board-core in apps/web's dep list preserves a clean migration if row #8 later wants a board-core-only shell embedding).

**Tradeoffs.**
- ✅ Zero edits to `@repo/plugin-web-board-core` (board-core stays exactly as SHIPPED per row #7's READY_TO_SHIP commit cc52060 / re-anchored at HEAD).
- ✅ Zero edits to `packages/plugin-web-storage/src/internal/registry.ts` (the 4 board keys are already non-`proposed` SHIPPED entries; `xai_board_panels` + `xai_board_inbox` are `unknown` — narrow at boundary same as board-core narrowed `xai_boards_v2`).
- ✅ Zero edits to `@repo/core` / no new event-bus channels (ADR-0007 §S7 — pure UI sink).
- ✅ Single-line Edit on `apps/web/src/routes/modules/shellRegistrations.tsx` (one swap line 65; one import statement reorganization). Concurrent siblings #8 (board-views row, will REPLACE the central panel renderer via context) + #11 (dashboard-widgets) own disjoint anchors.
- ✅ Bilingual via `useI18n(lang)` from `@repo/plugin-web-tokens` — already SHIPPED; no new i18n strings outside the new package's own JSX (which uses ternary `lang === "zh" ? … : …` inline per ai-chat / board-core precedent rather than adding to the global `s()` table).
- ⚠️ Slight surface bloat (two board packages co-existing). Mitigation: row #9's `index.ts` re-exports board-core's data types so consumers can pick a single dep at their leisure (board-views row #8 will only consume `@repo/plugin-web-board-core` directly — disjoint from row #9).
- ⚠️ Panel state schema lives entirely inside this row. Storage default is `[] as BoardPanelState[]` (an array of `unknown`), but the source prototype uses an OBJECT `{ inbox, planner, board }`. Mitigation: this row narrows on read — if `value` is a single-element array with the object payload OR is the raw object, accept it. Write always stores `[<object>]` (length-1 array) to match the registry default's array nature without breaking the registry contract. The `unknown` opacity gives us this freedom without a registry edit.

### Option B — Add workspace+switcher+creator+panels INSIDE `@repo/plugin-web-board-core` as a new top-level component

**Approach.** Edit board-core in-place: add `BoardSwitcher.tsx` / `BoardCreator.tsx` / `StatusOverviewBanner.tsx` / `InboxPanel.tsx` / `PlannerPanel.tsx` / `BoardWorkspacesModule.tsx` under `packages/plugin-web-board-core/src/`, update `index.ts` to re-export, and either (a) replace the existing `BoardModule` component or (b) add a parallel `BoardWorkspacesModule` and swap the registration's `render` function.

**Rejected.** Conflicts with the row #7 → row #9 split mandated by the seed brief + roadmap manifest. Board-core SHIPPED with a stable public surface; mutating it after the row #7 verify cc52060 would force a re-verify, contaminate the row #7 ship commit, and violate the "feature-build does ONE phase per run" + "ship requires READY_TO_SHIP" rule. Row #9 is supposed to be additive to row #7's surface, not a re-architecture of it.

### Option C — Inline workspaces in `apps/web/src/routes/modules/`

**Approach.** Put switcher/creator/panels directly under `apps/web/src/routes/modules/board/`.

**Rejected.** Violates CLAUDE.md §"Code Boundaries": "Business logic → `packages/plugin-*/`, never in `apps/desktop/src/`" (same rule applies to `apps/web/src/`). Switcher search + workspace grouping + creator validation + status-overview ring math + multi-panel layout rules are business logic, not host shell wiring.

### Option D — Reuse `dashboard-grid`'s widget pattern for the panels

**Approach.** Wrap Inbox + Planner + Board as widgets inside `@repo/plugin-web-dashboard-grid`.

**Rejected.** Dashboard-grid is a DIFFERENT module (rail entry #4) with its own widget contract (drag-reorder of fixed-size cards on a separate page). The board module's 4-button multi-panel switcher is a *single-page side-by-side layout* with a specific persistence key and a hard "at least one panel open" invariant — semantically incompatible with dashboard-grid's freeform widget grid. They share the word "panel" but not the architecture.

## 3. Recommendation

**Option A** — wrapper plugin `@repo/plugin-web-board-workspaces` that composes board-core via its public `index.ts` surface and replaces shell registration line 65.

Rationale anchors:
- **ADR-0007 §S4 port-map** line 272 ("`module-board.jsx` → `packages/plugin-web-board-{core,views,workspaces}/`") — explicit 3-way split.
- **Seed brief** line 21–22 ("Depends on `xai-web-board-core` (row #7, READY_TO_SHIP) — consume via `index.ts` only") + line 11 ("Workspace + multi-board layer").
- **Sibling-row precedent** — ai-chat #18 / pomodoro #14 / habits #15 are all single-package modules that own their full UI; this row is a wrapper-plugin pattern (rare but reasonable here because board-core's surface is exactly the substrate needed).
- **Concurrency** — disjoint write scope from #8 board-views (will own central-panel view-picker rendering via context provided by THIS row #9) and #11 dashboard-widgets (different rail entry).

## 4. Risks and open questions

- **R1**: `BoardPanelState = unknown` registry type is an ARRAY default (`[] as BoardPanelState[]`) but the source prototype's `panels` state is an OBJECT `{ inbox, planner, board }`. Mitigation documented in §2 Option A trade-off — narrow at boundary; accept BOTH legacy-array and object payloads on read; always write `[<object>]` to satisfy the registry's array nature. Tests cover the narrowing (V-tests in test.md).
- **R2**: `InboxCard = unknown` — same registry-opacity pattern as R1. Narrow via `isInboxCardArray` (each element has `id: string` + `text: { en: string; zh: string }`). On rejection, fall back to the 3-item seed inbox array.
- **R3**: `BoardCreator` re-uses board-core's exported `BOARD_TEMPLATES` — its `lists()` factory calls `JSON.parse(JSON.stringify(PM_LISTS_INITIAL.map(...)))` per the prototype. Re-using means row #9 inherits that factory verbatim; risk = if board-core's seed export ever changes shape (unlikely — it's SHIPPED), creator breaks. Mitigation: import `BOARD_TEMPLATES` from board-core's `index.ts` only (the SOLE allowed import path per board-core's `index.ts:8`); type guard at use site.
- **R4**: Bilingual ternaries inside JSX (`lang === "zh" ? "切换看板" : "Switch boards"`) — large surface. Mitigation: collocate all language strings as `const STR = { switchBoards: { en: ..., zh: ... }, ... }` at the top of each component file, then index via `STR.switchBoards[lang]` — clearer diff in code review than scattered ternaries. Sibling-aligned with ai-chat row #18 (`UI_COPY` table).
- **R5**: `StatusOverviewBanner` SVG ring math — `strokeDasharray` + cumulative offset must sum-normalize. Mitigation: extract `computeRingSegments(lists, total): RingSegment[]` as a pure helper in `internal/ringMath.ts`; tests RM1..RM6 cover empty / single-list / 5-list / done-only / mixed-color cases including float-precision check (expect `len + (c - len) === c` within 1e-9 epsilon per segment).
- **R6**: `PlannerPanel` seeded slots from "due today" cards — the source's `colors = ["green","blue","amber","purple"]` cycles via `i % 4`. The `pl-color-*` CSS classes for those four are NOT in the board-core CSS surface (board-core ships 10 list-color CSS vars but `amber` is not in `LIST_COLOR_IDS`). Mitigation: this row's `styles.css` declares its own scoped `--planner-color-green / -blue / -amber / -purple` OKLCH vars (same convention as board-core's `--board-list-color-*`). NO hard-coded hex anywhere.
- **R7**: `BoardSwitcher` uses `confirm()` (a `window.confirm` dialog) on delete. Native `confirm()` is jsdom-compatible (`window.confirm` is stubbable; jsdom returns `true` by default). Mitigation: tests stub `window.confirm` via `vi.spyOn(window, "confirm").mockReturnValue(true)`. Live UI relies on native confirm; future hardening could swap to a typed modal but that's out of scope for this row.
- **R8**: `BoardSwitcher` delete affordance has a guard `b.id !== activeBoardId && boards.length + (groupedByWs.flatMap(g=>g.boards).length - boards.length) > 1` — the second clause is mathematically equivalent to `groupedByWs.flatMap(g=>g.boards).length > 1` (the FILTERED total). Mitigation: replicate the guard verbatim in `BoardSwitcher.tsx`, document in api.md §"BoardSwitcher delete-affordance rule"; tests BS-D1..BS-D3 cover {2 boards in scope / 1 board in scope / active-board hidden} cases.
- **R9**: 4 sibling rows write to `apps/web/src/routes/modules/shellRegistrations.tsx` (#7 line 35+65, #10 line 33+66, #12 line 31+67, #20 line 37+73, etc.). Row #9 swaps line 35 (`import { boardCoreWebModuleRegistration }` → `import { boardWorkspacesWebModuleRegistration }`) + line 65 (registration array entry). Mitigation: Edit (not Write) the file; unique anchor strings (the import block + `boardCoreWebModuleRegistration,  // xai-web-board-core row #7 (railOrder 3)` line); `git index.lock` retry 8–20s × 5 if concurrent siblings #8 / #11 are mid-write.
- **R10**: `useI18n(lang)` keys like `s("board.add_card")` / `s("board.list_actions")` are already provisioned by board-core's component CSS + `useI18n`. Row #9 needs additional keys: `board.add_card_inbox`, `board.switch_boards`, `board.new_board`, `board.create_board`, `board.template_kanban`, `board.template_pm`, `board.template_blank`, `board.workspace`, `board.board_name`, `board.search_boards`, `board.no_matching_boards`, `board.status_overview_title`, `board.status_overview_desc`, `board.status_overview_done_label`, `board.status_overview_last_7d`, `board.status_overview_total`, `board.inbox`, `board.planner`, `board.empty_inbox`, `board.view_inbox`, `board.view_planner`, `board.view_board`, etc. Mitigation: this row uses the `STR` localized-table pattern (R4) and bypasses `useI18n` entirely for new strings — no edits to `@repo/plugin-web-tokens`'s i18n table. The board-core-shipped keys that ARE used (e.g. `s("board.add_card")` for the in-panel context menu) are read via `useI18n(lang)` from `@repo/plugin-web-tokens`.

## 5. Web research

**No external research required.** This row is a pure port of `web design/module-board.jsx` workspace+switcher+creator+PM+multi-panel sections into TSX. No new external libraries; no technology selection; no version upgrades. All dependencies (`react`, `@repo/core`, `@repo/plugin-web-tokens`, `@repo/plugin-web-storage`, `@repo/xai-web-shell`, `@repo/plugin-web-board-core`) are already pinned at the monorepo root.

## 6. Sibling-row precedent

- **Row #7 xai-web-board-core** (READY_TO_SHIP, commit `cc52060`) — supplies the view layer + schema + persistence helpers. Re-used wholesale by this row through `@repo/plugin-web-board-core/index.ts`.
- **Row #18 xai-web-ai-chat** (READY_FOR_VERIFY) — sibling 3-phase build, `STR` localized-table pattern, pure-UI-sink (no event-bus emit).
- **Row #14 xai-web-pomodoro** + **#15 xai-web-habits** + **#20 xai-web-statistics** — all 3-phase auto-build runs with per-phase commits.

## 7. Conclusion

Adopt Option A. Three-phase build, single-commit-per-phase, lint+typecheck+test green at each phase. STOP at READY_TO_SHIP; ship-time cross-vendor manual smoke (Codex `gpt-5.5-thinking medium` / Cursor fallback) queued per the W2e manifest header (Parallel-Agent mode — same-vendor compromise documented).
