# Discovery Review — xai-web-board-views

> Roadmap row #8 · Wave W2e · Module (Parallel-Agent dispatch)
> Concurrent siblings: #9 xai-web-board-workspaces · #11 xai-web-dashboard-widgets
> Source PRD: `web design/DESIGN.md` §4.3 (Project Boards) — the 5 additional view renderers (Table / Calendar / Dashboard / Timeline / Map)
> Source Code: `web design/module-board.jsx` lines 527–1092 (5 view functions) + `web design/layout.css` (board-table / board-cal / board-dash / board-timeline / board-map sections)
> ADR anchor: `docs/adr/0007-xai-web-console-build-form.md` §S4 (port map "module-board.jsx" → `packages/plugin-web-board-views/`) + §S5 (JSX→TSX rules) + §S6 (Vite SPA build form) + §S7 (no new event channels — pure UI sink)
> Foundation: depends on `@repo/plugin-web-board-core` row #7 (SHIPPED/READY_TO_SHIP) — public API via `index.ts` barrel ONLY (no internals).

---

## 1. Problem framing

### What ships in this row

This row is the **secondary view layer** of the Board pipeline (#7 board-core → **#8 board-views (this row)** → #9 board-workspaces). It owns:

1. **Table view** — row-per-card with inline editors:
   - **Due picker** with Today / Tomorrow / Next Mon quick-shortcuts (hard constraint per DESIGN.md §4.3)
   - **Labels** multiselect popover (toggle on/off)
   - **Members** multiselect popover (toggle on/off)
   - **Progress** column rendered from `card.checklist.{done,total}` as a mini progress bar with `done/total` label
2. **Calendar view** — month grid with HTML5 DnD: dropping a card onto a cell rewrites `card.due` (hard constraint: same persistence path as core's card mutate).
3. **Dashboard view** — 4 KPIs (Total / Due today / Overdue / Lists) + horizontal bar chart by column (cards-per-list) + horizontal bar chart by label.
4. **Timeline view** — 30-day Gantt; each card with a `due` (and optional `start`) renders as a bar with **three handles** (left = start-resize, center = move, right = due-resize). DnD updates `{start, due}` atomically (hard constraint). Bar visually clips at the 0/30-day view edges (hard constraint).
5. **Map view** — placeholder SVG until cards get a `location` field (deferred to a future row); copy explains how to populate the map.
6. **View picker / switcher** — top-of-board control with 6 entries (Board / Table / Calendar / Dashboard / Timeline / Map). The active view id is persisted **per board** (hard constraint).
7. **Module composition** — this row replaces board-core's shell registration with a wrapped `BoardModule` that renders board-core's existing Kanban path PLUS the 5 new view paths PLUS the view picker. board-core's `index.ts` barrel exports remain the only entry point used.

### What this row explicitly does NOT ship

- **Workspaces switcher / board switcher / board creator / PM template / Status Overview banner / inbox / planner / card detail modal** — ship in row #9.
- **Cards with a `location` field** — schema extension is deferred (Map view remains a static placeholder per DESIGN.md §4.3 and source `module-board.jsx` line 1054).
- **Event-bus emit on view change** — no `web:board:view-changed` channel is added; view state lives in `usePref("xai_board_view_by_id")` and React state only (matches board-core row #7 — pure UI sink).
- **New columns in Table beyond Card / List / Labels / Members / Due / Checklist** — matches DESIGN.md §4.3 source.
- **Keyboard / touch accessibility for DnD** — same constraint as row #7 (ADR §S5 rule 10 forbids new DnD libraries). Manual mouse only.
- **Date library** — `date-fns` / `dayjs` are NOT added. The prototype uses native `Date` arithmetic; we port verbatim. Same constraint as Calendar/Timeline source.
- **Schema edits** — `BoardCard.start?: string` already exists in row #7's schema (api.md §3). Timeline uses it as-is. No new optional fields are introduced.

### Why this scope, why this size

The seed brief + ADR-0007 §S4 port-map slice this row as exactly the 5 view renderers + picker. Adding workspaces / card-detail / inbox here would entangle this row with row #9 and conflict with concurrent sibling #9 board-workspaces dispatch. The current cut keeps #8 fully shippable and is the minimum slice that delivers DESIGN.md §4.3's 6-view promise.

Source LOC budget (port from `web design/module-board.jsx`):

| View | Source lines | ~LOC |
|---|---|---|
| TableView | 527–705 | 179 |
| BoardCalendarView | 706–817 | 112 |
| BoardDashboardView + BDKpi | 818–899 | 82 |
| TimelineView | 900–1053 | 154 |
| MapView | 1054–1092 | 39 |
| ViewPicker (synthesized) | new | ~40 |
| BoardModule wrapper | new | ~80 |
| **Total source-derived TSX** | | **~686** |
| CSS port (layout.css board-table/cal/dash/timeline/map sections) | | ~400 |
| Tests | | ~600 |

This is one of the larger rows in W2e. Mitigated by three-phase build (P1 Table+Dashboard+Map → P2 Calendar+Timeline → P3 picker+orchestrator+wire-up), each phase independently committable and within the auto-build retry budget.

## 2. Candidate options

### Option α — Separate shell module (own moduleId, own rail entry, own route)

Add a new `boardViewsWebModuleRegistration` with its own `moduleId: "board-views"` and rail entry. The shell would show both "Boards" (board-core) and "Board Views" in the rail.

- **Pro**: Cleanest separation; no edit to board-core consumers.
- **Con**: Violates DESIGN.md §4.3 — the 6 views live INSIDE one "Boards" module with a top-of-board view picker. Two rail entries would break user mental model. The board data is the same boards — splitting into two rail entries fragments the navigation.

**Rejected** — breaks DESIGN.md §4.3 acceptance: "User can switch a board across all 6 views". The view switcher MUST be inside one `/board` route.

### Option β — board-views injects view renderers into board-core via a typed view-registry extension point

Add to board-core's `index.ts` a `ViewRegistry` type and a `registerBoardView(viewId, renderer)` runtime API. board-views populates the registry at module load. board-core's `BoardModule` reads the registry and renders the active view.

- **Pro**: Maximally extensible; future rows could add more views.
- **Con**:
  - Requires editing board-core's `index.ts` to add a new public surface (`ViewRegistry`, `registerBoardView`). board-core is **READY_TO_SHIP** / about-to-be SHIPPED; adding new public API requires reopening row #7 plan. Out of scope for W2e wave.
  - The current API in board-core `index.ts` (read in this discovery: 91 lines, no view-registry export) does NOT include such a hook. Adding one mid-wave breaks the "consume via index.ts barrel ONLY" hard constraint of THIS row by forcing a row #7 edit.
  - Side-effect registration (module load side-effect) is an anti-pattern for tree-shaking and ESM determinism (ADR-0003 plugin discipline).

**Rejected** — requires reopening row #7. The brief's "consume @repo/plugin-web-board-core via index.ts barrel ONLY (no internals)" hard constraint forbids modifying board-core.

### Option γ — board-views provides its own top-level `BoardModule` that composes board-core's exports (selected)

This row ships `@repo/plugin-web-board-views` at `packages/plugin-web-board-views/`. It exports its own `boardViewsWebModuleRegistration` and its own top-level `BoardModule` orchestrator that:

- Imports board-core's public components (`BoardView`) and helpers (`makeDefaultBoards`, `loadBoardsOrDefault`, `pickActiveBoard`, `updateCardInList`, etc.) from `@repo/plugin-web-board-core` via the barrel ONLY.
- Adds 5 new view components (`TableView`, `BoardCalendarView`, `BoardDashboardView`, `TimelineView`, `MapView`) + a `ViewPicker` widget.
- Reads/writes `xai_board_view_by_id` (NEW persistence key — per-board view selection) via `usePref` from `@repo/plugin-web-storage`.
- The host shell registration (`apps/web/src/routes/modules/shellRegistrations.tsx`) is rewritten so the `board` moduleId entry now points to `boardViewsWebModuleRegistration` (this row) **instead of** `boardCoreWebModuleRegistration` (row #7). board-core's registration export is preserved but no longer wired in `apps/web` (board-views supersedes it). This is the same "layered plugin replaces foundation registration" pattern used by row #9 (workspaces will further wrap board-views).

**Why selected**:
- Matches ADR §S4 port-map (one new package).
- Honours the brief's hard constraint: board-core consumed via `index.ts` barrel ONLY (no internals).
- Honours the brief's hard constraint: "Module registers via @repo/xai-web-shell slot pattern (separate slot from board-core, OR injected into board-core via a view-registry — pick one in plan)" — this picks the slot-pattern fork, with board-views' slot **replacing** board-core's slot in the shell registrations array (single moduleId `"board"`, single rail entry, one route).
- Single-vendor, predictable: board-core stays frozen (no row #7 reopen).
- Forward-compatible: row #9 (workspaces) can wrap board-views the same way (board-workspaces > board-views > board-core).

### Option δ — Inline the 5 views inside board-core (extend row #7)

Add the 5 view components + picker directly to `@repo/plugin-web-board-core` package. No new package.

- **Pro**: 1 fewer package; consumers don't compose.
- **Con**: Reopens row #7 (READY_TO_SHIP) for a major scope expansion. ADR-0007 §S4 explicitly slices board-core / board-views / board-workspaces as three rows. Violates ADR.

**Rejected by ADR-0007 §S4**.

## 3. Selected solution snapshot

**Selected option**: γ.

**Frozen Assumptions** (these become hard inputs to feature-build):

1. **Runtime package**: `packages/plugin-web-board-views/` with npm name `@repo/plugin-web-board-views`. Anchor (workflow docs only) is `packages/xai-web-board-views/docs/`.
2. **Dependency on board-core**: `"@repo/plugin-web-board-core": "workspace:*"`. Consumed via `import { … } from "@repo/plugin-web-board-core";` — barrel only. No `…/src/internal/*` imports. Verified by an ESLint `no-restricted-imports` rule in the package's `eslint.config.js`.
3. **Persistence**: This row reads board-core's `xai_boards_v2` + `xai_active_board` (already SHIPPED) AND **adds one new key** `xai_board_view_by_id` (codec `json`, default `{}`; shape `Record<string, BoardViewId>`). Per ADR §S8, new persistence keys must be added to `@repo/plugin-web-storage` `PREF_REGISTRY` (single-line edit). Sibling rows #9 + #11 add their own keys; write-scope discipline via `Edit` (not `Write`) + unique entry per row.
4. **View id literal union**: `type BoardViewId = "board" | "table" | "calendar" | "dashboard" | "timeline" | "map";` declared in this row's `src/types.ts` (board-core's row #7 doesn't know about this — it just renders Kanban).
5. **Schema preservation**: `BoardCard.start` (optional `string`) already exists in board-core schema (api.md §3). Timeline reads it as-is. No new `BoardCard.location` field is introduced — Map view stays a placeholder.
6. **Due picker quick-shortcuts**: `Today` / `Tomorrow` / `Next Mon` (per DESIGN.md §4.3 hard constraint). The output `due` string format is `"M/D"` matching the prototype's seed format (`module-board.jsx` line 717's regex `/^(\d+)\/(\d+)/`). `"Today"` / `"今天"` is also a valid value (matches Calendar view's day-of-month detection on line 723) — quick-shortcut emits the literal `"Today"` (en) / `"今天"` (zh) when lang is zh.
7. **Calendar DnD rewrites `card.due`**: matches `module-board.jsx` line 758 — `updateCard(listId, cardId, { due: newDue, dueEn: undefined, dueLate: false })`. Implementation calls `updateCardInList` from `@repo/plugin-web-board-core` + persists via existing core persistence path. NO new persistence path for card mutations.
8. **Timeline three-handle DnD updates `{start, due}` atomically**: matches `module-board.jsx` lines 974–983 — one `updateCard` call with `{ due: dayToStr(final.end), start: final.start === final.end ? null : dayToStr(final.start), dueEn: undefined, dueLate: false }`. Tests assert that a partial-DnD failure (mouseup outside grid) does NOT write a half-state.
9. **Timeline bar clips at view edge**: matches `module-board.jsx` lines 938–942 — `s = Math.max(0, Math.min(days-1, s))`. Bars that start before today or extend past day 30 render with `clip-path` or `min(width, …)` so the bar visually terminates at the gantt edge.
10. **Dashboard rendering**: 4 KPIs in a grid + 2 horizontal bar charts (per-list, per-label). No `<canvas>` / `<svg>` chart library — pure CSS divs with width percentages, matching `module-board.jsx` lines 842–880.
11. **Map view**: literal SVG copy of `module-board.jsx` lines 1056–1083 (decorative placeholder + overlay text card). NO geolocation API access. NO `react-leaflet` / `mapbox-gl` dependency.
12. **View picker** persists active view per board id (Record-keyed by `boardId`). Switching boards (when row #9 ships board switcher) recalls each board's last view. For this row's acceptance, switching the single SHIPPED board across all 6 views is sufficient.
13. **Bilingual via inline `lang === "zh" ? … : …` literals + `bilingual({en,zh}, lang)` helper imported from board-core** (board-core's index.ts may not export `bilingual` — if absent, declare it locally as a 3-line pure helper). The brief mentions `useI18n` — sibling rows have stopped using `useI18n`; we follow board-core's pattern (`lang` prop only).
14. **Module registration replaces line 61 (board-core's entry) of `apps/web/src/routes/modules/shellRegistrations.tsx`**: line `boardCoreWebModuleRegistration,  // xai-web-board-core row #7 (railOrder 3)` → `boardViewsWebModuleRegistration,  // xai-web-board-views row #8 (railOrder 3)`. board-core's import statement remains (board-views uses its exports), but the array entry switches. railOrder 3 preserved. Single-line array edit + new import statement near the existing board-core import.
15. **Three-phase build**:
    - **P1** scaffold + types + ViewPicker + TableView (incl. Due picker / Labels / Members / Progress) + Dashboard + Map + tests
    - **P2** Calendar view (DnD-to-change-due) + Timeline view (3-handle DnD) + persistence helpers + tests
    - **P3** BoardModule orchestrator + registration + apps/web wire-up + new persistence registry entry + PLUGIN_MAP + integration tests
    - Each phase = one conventional commit.

## 4. Risks and open questions

| # | Risk | Mitigation |
|---|---|---|
| R1 | Timeline DnD pointer-event lifecycle (mousedown/mousemove/mouseup with cleanup on unmount) — prototype uses `window.addEventListener` directly | Port verbatim with `useEffect` cleanup; jsdom test mocks `getBoundingClientRect` and dispatches synthetic pointer events (B5 precedent from sibling pomodoro/habits tests) |
| R2 | Calendar HTML5 DnD across cells — `dragover` must `preventDefault` per spec; prototype already does this on line 753 | Verbatim port; test uses synthetic `DragEvent` + `dataTransfer` mock (board-core's `__tests__/_helpers/dataTransfer.ts` pattern) |
| R3 | Dashboard "per-label" chart depends on a `findLabel(id)` / `ALL_LABELS()` lookup in the prototype that resolves through PM_LABELS + workspace-scoped labels (row #9). board-core exports `PM_LABELS` from `@repo/plugin-web-board-core` via `index.ts`. | Use `PM_LABELS` from board-core barrel for v1; defer workspace-scoped labels to row #9. Empty-label cards filtered out. |
| R4 | `BoardCard.start?: string` is documented in board-core api.md §3 but seed data (board-data.js) doesn't populate it. Timeline shows only cards with `due` set. | Acceptance: Timeline renders all cards with `due`. Cards with `start === undefined` get `start = due` (single-day bar — matches `module-board.jsx` line 933). Tests assert this single-day-bar behavior. |
| R5 | Sibling rows #9 + #11 contend for `apps/web/package.json` (each adds its own workspace dep) + `shellRegistrations.tsx` (row #9 will further wrap on top of #8) + `packages/plugin-web-storage/src/internal/registry.ts` (each adds a different new key) | Use `Edit` (not `Write`) on shared files; unique anchors (this row touches the `boardCoreWebModuleRegistration` line; #11 touches the dashboard line; #9 will touch this row's line LATER, after #8 ships); retry `git index.lock` 8–20s × 5 (same protocol as W2d). |
| R6 | Cross-vendor verify queued at ship time (not row-level), per manifest header W2e Parallel-Agent mode (Codex `gpt-5.5-thinking medium` / Cursor fallback). Row-level feature-verify runs in same-vendor Claude Opus — documented same-vendor compromise. | Documented in design.md §"Cross-vendor verify note"; feature-verify report explicitly flags the manifest-header compromise. |
| R7 | View picker state persisted per-board (`Record<boardId, viewId>`). When only one board exists (board-core row #7 ships one default kanban board), the map has one key. When row #9 ships board switcher, stale entries for deleted boards may accumulate. | Acceptance: a deleted board's entry becomes orphan but doesn't crash. Defer cleanup pass to row #9. Document as "orphan entries are tolerated" in api.md §11. |
| R8 | `@repo/plugin-web-storage` registry edit (adding `xai_board_view_by_id`) is a shared-file Edit conflicting with #11 dashboard-widgets and #9 board-workspaces if they also add keys. | Same write-scope-disjoint protocol as R5: each row adds its own unique key block; auto-build retries on git lock; verifier confirms registry shape after merge. |
| R9 | Due picker quick-shortcuts ("Today" / "Tomorrow" / "Next Mon") must produce strings that downstream rendering (Table due column + Calendar `byDay` lookup + Timeline `parseDay`) all accept. | Today → literal `"Today"` (en) / `"今天"` (zh) matches `parseDay` on `module-board.jsx` line 919. Tomorrow → `"M/D"` of tomorrow. Next Mon → `"M/D"` of the next Monday. Tests cover round-trip from picker → Calendar lookup. |
| R10 | Map view is a SVG placeholder with no real functionality — risk that a verifier scores it as "non-functional". | Document in design.md + test.md that Map view is a deliberate placeholder per DESIGN.md §4.3 + brief Hard Constraint: "Map view: placeholder until cards get location field". Verifier acceptance is "renders without crash; explanatory text visible". |

### Open questions resolved during this discovery

- **Q1**: Does board-core export `bilingual()` and `PM_LABELS`?
  - **Answer**: `index.ts` exports `PM_LABELS` and `BOARD_TEMPLATES` + `BoardLabel` type. `bilingual()` is NOT exported. Plan declares a local 3-line pure helper in `src/internal/i18n.ts`.
- **Q2**: Is `xai_board_view_by_id` a NEW persistence key requiring a registry edit?
  - **Answer**: YES. P3 phase scope includes a single-line registry add to `packages/plugin-web-storage/src/internal/registry.ts`. Codec `json`, default `{}`, status `proposed → non-proposed` (sibling pattern from board-core row #7).
- **Q3**: Should this row register a separate rail entry or replace board-core's?
  - **Answer**: REPLACE board-core's entry (Option γ §1 above). One moduleId `"board"`, one rail entry, board-core's slot registration export `boardCoreWebModuleRegistration` becomes unused-by-host (still exported from the package; deletion is a follow-up cleanup item).

## 5. No external research required

This row is a pure port of existing JSX → TSX (no new library). No WebSearch / WebFetch performed. All design decisions trace to `web design/module-board.jsx` + DESIGN.md §4.3 + ADR-0007 + board-core's already-shipped public API.

## 6. Sibling-row context (W2e wave)

| Row | Slug | Status | Write-scope intersection with this row |
|---|---|---|---|
| #9 | xai-web-board-workspaces | feature-plan IN_PROGRESS (concurrent) | apps/web/src/routes/modules/shellRegistrations.tsx (will wrap board-views' registration LATER); apps/web/package.json (adds @repo/plugin-web-board-workspaces). NO overlap with this row's package scope. |
| #11 | xai-web-dashboard-widgets | feature-plan IN_PROGRESS (concurrent) | apps/web/src/routes/modules/shellRegistrations.tsx (different module — `dashboard`, line 64). apps/web/package.json (different dep). NO overlap with this row's package scope. |

All three rows touch `apps/web/src/routes/modules/shellRegistrations.tsx` + `apps/web/package.json` + potentially `packages/plugin-web-storage/src/internal/registry.ts`. Each row touches DIFFERENT lines / DIFFERENT keys. Auto-build workers use `Edit` (not `Write`) with retry-on-lock per W2d precedent (countdown #17 / ai-chat #18 sibling pattern). No write-conflict expected; verified by sibling row-level verify reports.
