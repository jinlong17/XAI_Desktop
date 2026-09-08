# Discovery Review — xai-web-board-core

> Roadmap row #7 · Wave W2d · Module (Parallel-Agent dispatch)
> Concurrent siblings: #10 xai-web-dashboard-grid · #20 xai-web-statistics
> Source PRD: `web design/DESIGN.md` §4.3 (Project Boards) — Board view + card model
> Source Code: `web design/module-board.jsx` (Board view section, lines 311–476 + helpers) + `web design/board-data.js`
> ADR anchor: `docs/adr/0007-xai-web-console-build-form.md` §S4 (port map "module-board.jsx" → `packages/plugin-web-board-core/`) + §S5 (JSX→TSX rules) + §S6 (Vite SPA build form) + §S7 (no cross-import; events only) + §S8 (storage registry — 4 board keys already SHIPPED)
> Authority: SUPERSEDES prior PRDs where they conflict (user override 2026-05-23). SUPERSEDES web-ticktick-parity row `web-project-label-calendar` for the Board surface.

---

## 1. Problem framing

### What ships in this row

This row is the **foundation layer** of the Board pipeline (rows #7 → #8 board-views → #9 board-workspaces). It owns:

1. The **canonical Board / Card / List TypeScript schema** that downstream rows must consume verbatim (DESIGN.md §9.3, byte-for-byte field set).
2. The **Board (Kanban) view** — the default `view === "board"` render path from `module-board.jsx` (lines 311–476).
3. **10-color list-color palette** (green/yellow/orange/red/purple/blue/teal/lime/pink/gray), source-of-truth derived from `tokens.css` semantic mappings (NOT hard-coded `#RRGGBB`).
4. **In-row "add card" composer** + **add-list composer** (per-list inline composer + outer add-list button).
5. **Cross-list HTML5 drag-and-drop** of cards (atomic move; no orphan cards on reload).
6. **Persistence via `usePref`** for the two foundation keys: `xai_boards_v2` (Board[]) and `xai_active_board` (string).
7. **Bilingual rendering** (`{ en, zh }`) via `lang` prop / `useI18n`-equivalent (matches sibling patterns).
8. **Shell slot registration** that replaces the existing `placeholder("board", "Boards", "kanban", 3)` line on line 59 of `apps/web/src/routes/modules/shellRegistrations.tsx`.

### What this row explicitly does NOT ship

- **The other 5 views** (Table, Calendar, Dashboard, Timeline, Map) — ship in row #8 `xai-web-board-views`.
- **Workspaces switcher / board switcher / board creator / PM template / multi-panel bottom bar / Status Overview banner / inbox / planner / card detail modal** — ship in row #9 `xai-web-board-workspaces`.
- **Status Overview ring chart** — ships in row #9 (workspaces).
- **Card mutation beyond "add card by text"** — full card editor lives in row #9 (CardDetail modal).
- **Event-bus emit** — no `web:board:*` channel is added this row (downstream rows may add). Pure UI sink for v1.

### Why this scope, why this size

The seed brief + ADR-0007 §S4 port-map line 272 explicitly slices `module-board.jsx` into three rows. This row is intentionally the minimum self-contained slice that:

- Owns the schema (so #8 and #9 can compile against a stable type).
- Owns the Kanban view (so the default-view consumer of `xai-web-shell` has visible behavior the moment row #7 ships).
- Owns persistence for the schema's two foundation keys (boards array + active id), so the data round-trips end-to-end at row #7 acceptance.

Adding workspaces / PM / multi-panel here would entangle this row with another ~600 LOC of TSX and a second persistence key (`xai_board_panels`), forcing #8 to ship before #9 can. The current cut keeps #7 fully shippable while leaving #8/#9 as additive layers.

## 2. Candidate options

### Option A — Single-package port: `packages/plugin-web-board-core/` (selected)

- 1 new runtime package (per ADR §S4 line 272 + ADR Frozen Assumption §2).
- Internal modules: `BoardModule` (orchestrator), `BoardView` (Kanban canvas), `BoardList` (column + composer + menu), `BoardCard` (card render + drag handle), `internal/listColors.ts` (10-color palette → tokens), `internal/seed/board-data.ts` (default workspaces + boards + PM lists, typed seed), `internal/persistence.ts` (typed `usePref` wrappers around `xai_boards_v2` + `xai_active_board`), `internal/boardOps.ts` (pure helpers: `moveCardToList`, `addCard`, `addList`, `setListColor`).
- Schema types live in `src/types.ts` and are re-exported from `index.ts` for downstream rows.
- Tests use `vitest` + `@testing-library/react` with `jsdom` (matches sibling pattern from rows #14/#15/#16/#18).
- DnD via native HTML5 `draggable` + `dataTransfer` (matches `module-board.jsx` source — no `react-dnd` library; ADR §S5 rule 10 forbids new state libraries).

**Why selected**: Matches ADR §S4 port-map line 272 verbatim, matches sibling row pattern (ai-chat #18, habits #15, pomodoro #14 — all single-package), no new library dependency, atomic drop semantics fit naturally in a single `setLists` reducer call.

### Option B — Split into `plugin-web-board-schema` + `plugin-web-board-kanban`

- 2 packages: one types-only schema package consumed by #8/#9, one runtime Kanban view package.
- Pro: stricter dependency direction.
- Con: ADR §S4 port-map line 272 already names a single package; splitting adds a second `manifest.json` + `package.json` + 4 docs + roadmap renaming work, and the schema package would have zero runtime content (TS types are erased at build). The roadmap manifest only allocates one row #7 — splitting requires a roadmap rewrite.

**Rejected**: Adds package overhead with no runtime payoff; ADR conflict; requires reopening row #7 in the roadmap manifest.

### Option C — Bring in `react-dnd` or `dnd-kit` for richer DnD

- Pro: keyboard accessibility, touch support, drop animations.
- Con: ADR §S5 rule 10 forbids new state libraries; the prototype works with native HTML5 dnd; adding a DnD library would also be a precedent for #8 (Timeline drag) and #10 (Dashboard FLIP) that should be set in their own rows, not here.

**Rejected**: Out of scope; sets precedent that needs its own ADR.

### Option D — Hard-code 10 colors in component instead of tokens.css mapping

- Pro: simpler, faster.
- Con: violates seed brief Hard Constraint "10 column colors via tokens.css (no hard-coded hex)". DESIGN.md §5 mandates tokens-only.

**Rejected by Hard Constraint**.

## 3. Selected solution snapshot

**Selected option**: A.

**Frozen Assumptions** (these become hard inputs to feature-build):

1. **Runtime package**: `packages/plugin-web-board-core/` with npm name `@repo/plugin-web-board-core`. Anchor (workflow docs only) is `packages/xai-web-board-core/docs/`.
2. **Persistence**: Only `xai_boards_v2` (`BoardsState`) and `xai_active_board` (`string`) are read/written. Both already SHIPPED in the `@repo/plugin-web-storage` registry — this row does **not** edit the registry, but it **does** narrow the `BoardsState` type from `unknown` to `Board[]` at the component boundary via a typed guard predicate (`isBoardArray`). The registry stays `unknown` because a future row may add schema migrations and the registry is the global authority on the runtime decoded shape.
3. **`xai_board_panels` and `xai_board_inbox`** are owned by `xai-web-board-core` per registry but ship in row #9 (workspaces) — this row does **not** read or write them.
4. **Schema** matches DESIGN.md §9.3 byte-for-byte. `Board.cover` is a string (CSS background spec). `Board.template` is the literal union `"kanban" | "pm" | "blank"`. `List.color` is the 10-color id literal union or `null`. `Card.checklist` is `{ done: number; total: number }` or absent. `Card.title` and `Board.name` are `{ en: string; zh: string }`. Optional fields are explicitly optional (`labels?`, `members?`, `due?`, `start?`, `dueLate?`, `attach?`, `cover?`).
5. **10-color palette** is defined in `internal/listColors.ts` as `{ id, label, cssVar }[]` where `cssVar` resolves to a `var(--board-list-color-<id>)` that the package's own `styles.css` declares with the OKLCH values from `module-board.jsx` lines 13–24. No hard-coded hex anywhere in TSX; component reads `var(...)` strings, CSS owns the OKLCH values. This satisfies the brief constraint while remaining DESIGN.md §5-compliant.
6. **Bilingual** via the existing `lang: "en" | "zh"` prop pattern used by every sibling W2 module. `useI18n` from the prototype is NOT ported; sibling rows have stopped using it. Instead, this row uses inline string literals in TSX (e.g. `lang === "zh" ? "..." : "..."` for ~10 microcopy strings) plus a typed `bilingual(x)` helper for `{ en, zh }` records. The shell already routes `lang` through `useWebShell()` (see `aiChatWebModuleRegistration` pattern).
7. **DnD**: native HTML5 `draggable` + `dataTransfer.setData("application/x-xai-board-card", JSON.stringify({ cardId, fromListId }))`. The MIME type is namespaced so foreign drags (Finder, text) don't accidentally trigger a list drop. Drop handler validates JSON shape before mutating state; malformed payload is silently ignored.
8. **Atomic move**: `moveCardToList(cardId, fromListId, toListId)` is a pure helper that returns the new `List[]`. It is called from a single `setBoards` updater closure so React batches the state into one render; persistence flushes once per render (debounced 200 ms via the existing `usePref` autosave seam). On reload, the persisted blob reflects the post-move state because the move and the persist happen in the same React tick.
9. **No event-bus emit**. This row is a pure UI sink. Downstream rows #8/#9 may add `web:board:*` channels; row #7 does not. (Matches ai-chat row #18 — same pattern.)
10. **Shell slot registration** replaces line 59 of `apps/web/src/routes/modules/shellRegistrations.tsx`: `placeholder("board", "Boards", "kanban", 3)` → `boardCoreWebModuleRegistration`. Single-line edit (anchor preserves railOrder 3 and icon "kanban"). Concurrent siblings (#10 dashboard-grid replaces line 60; #20 statistics replaces line 67) — write-scope-disjoint, no merge conflict.
11. **Three-phase build**. P1: scaffold + schema types + seed + 10-color palette + pure helpers + tests. P2: components (BoardView + BoardList + BoardCard) + composer + DnD + persistence wiring. P3: BoardModule orchestrator + registration export + host wire-up + shell registration edit + workspace dep + integration test.

## 4. Risks and open questions

| ID | Risk | Mitigation |
|---|---|---|
| R1 | `BoardsState = unknown` in storage registry means typed guard must reject malformed legacy data without crashing the module. | `isBoardArray` predicate + fallback to `makeDefaultBoards()` on rejection (matches `module-board.jsx` line 36 behavior). Test V1..V8 cover null/empty/wrong-shape/legacy-without-required-field cases. |
| R2 | DnD across lists + persistence race: drag-end fires while autosave is still flushing prior state. | Single `setLists` updater per drop; `usePref` autosave reads from latest React state, so the persisted value reflects post-move. Test D1..D5 cover: drop-then-reload, drop-then-rapid-second-drop, drop-to-same-list (no-op), drop-with-malformed-dataTransfer (ignore), drop-with-empty-from-list (no-op). |
| R3 | Sibling #10 dashboard-grid edits `apps/web/package.json` and `apps/web/src/routes/modules/shellRegistrations.tsx` concurrently — git index.lock contention. | Use `Edit` (not `Write`) on shared files; unique anchors (`placeholder("board", ...)` line 59 vs `placeholder("dashboard", ...)` line 60); retry on `git index.lock` with 8–20s exponential jitter × 5 attempts (matches countdown row #17 strategy logged in dev_log Concurrent Siblings note). |
| R4 | The 10-color palette IDs must match `module-board.jsx` line 13–24 exactly (board-data.js seed cards reference `color: "blue"`, `color: "red"`, etc. — any drift breaks the seed). | `internal/listColors.ts` exports `LIST_COLOR_IDS = ["green", "yellow", "orange", "red", "purple", "blue", "teal", "lime", "pink", "gray"] as const`. Seed module imports this same constant. Test C1..C4 covers: every seed list color is in `LIST_COLOR_IDS`, every `LIST_COLOR_IDS` member is in the palette, no duplicates, palette length is exactly 10. |
| R5 | Cross-vendor verify (Codex / Cursor cold-read) is queued for ship-time per manifest header; this Claude session would otherwise be same-vendor. | Document this explicitly in verify report. Same-vendor verify is the compromise acceptable by the manifest header policy when sibling rows are queued concurrently. |
| R6 | The `BoardModule` orchestrator state surface is large (boards, activeBoardId, draftListIdx, composerText, showListComposer, newListName, listMenu). Without workspaces/switcher/creator (deferred to #9), some pieces (e.g. `switcherOpen`, `createOpen`, `openCard`) are intentionally absent from row #7. | Row #7 ships only the in-scope state. The orchestrator's shape evolves in #9 — that row will extend, not rewrite, the module. Public API contract notes which orchestrator state-shape additions are reserved for #9 (see api.md §6). |
| R7 | `Card.due` and `Card.dueEn` mixed string/format conventions in the prototype (`due: "5/26"`, `dueEn: "Today"`, `dueLate: true`). Schema must preserve these as **opaque strings** without forcing a `Date` parse. | `Card.due?: string`, `Card.start?: string`, `Card.dueLate?: boolean`. These are display-layer strings until row #8 (Calendar/Timeline) imposes structure. Documented in api.md §3. |
| R8 | `board-data.js` uses `window.MOCK.boardLists` (defined elsewhere) and `window.PM_LISTS_INITIAL`. The seed port must inline these arrays as typed TS data, not rely on globals. | Port `MOCK.boardLists` + `PM_LISTS_INITIAL` + `PM_LABELS` + `DEFAULT_WORKSPACES` + `BOARD_TEMPLATES` + `makeDefaultBoards` into `internal/seed/board-data.ts` as typed exports. Row #9 (workspaces) will own `BOARD_TEMPLATES` consumer code (Switcher/Creator), but the typed seed lives in #7 because the default board's lists come from `MOCK.boardLists` which the Kanban view needs at first run. |

## 5. Open questions answered before plan

| Q | Answer |
|---|---|
| Q1: Should `BoardsState` registry entry be tightened from `unknown` to `Board[]`? | **No, defer.** The registry is the global authority on persisted shape across multiple rows + migrations. Tightening it is a separate row (`xai-web-persistence-contract` follow-up). Row #7 narrows at the component boundary only. |
| Q2: Should the seed `MOCK.boardLists` be moved out of `module-board.jsx`-equivalent data? | **Yes — into `internal/seed/board-data.ts` typed module.** Per ADR-0007 §S4 line 267. |
| Q3: Should we expose `isBoardArray` from `index.ts`? | **Yes.** Rows #8 and #9 will need the guard. Also expose `LIST_COLOR_IDS` and the schema types. |
| Q4: Should the in-row "add card" use `<textarea>` or `<input>`? | **`<textarea>` with Enter-to-submit, Shift+Enter newline, Escape to cancel** — matches prototype line 458. |
| Q5: How does `lang` reach `BoardModule`? | Via `useWebShell()` inside a thin `BoardModuleRoute` wrapper (matches ai-chat `AiChatModuleRoute` pattern). |
| Q6: Does this row ship the View Picker (kanban/table/calendar/dashboard/timeline/map)? | **No.** Row #7 hard-codes `view = "board"`. Row #8 introduces the picker + the other 5 views. The local state slot for `view` exists but is not visually exposed in row #7. |
| Q7: Status Overview banner (top of board for PM template)? | **No, defer to row #9** (workspaces owns PM template + overview). |
| Q8: Does the Kanban view show the workspace chip / board name in a header? | **Minimal version only.** Row #7 shows the active board's bilingual name as a heading (`<h1>{activeBoard.name[lang]}</h1>`) — no chip, no switcher, no view picker. Row #9 fills in the rest. |

## 6. Acceptance checklist (becomes feature-verify input)

- [ ] `pnpm --filter @repo/plugin-web-board-core lint --max-warnings 0` exits 0
- [ ] `pnpm --filter @repo/plugin-web-board-core typecheck` exits 0
- [ ] `pnpm --filter @repo/plugin-web-board-core test` exits 0; all phase tests pass
- [ ] `pnpm --filter @repo/web typecheck` exits 0 (host integration)
- [ ] `pnpm --filter @repo/web lint --max-warnings 0` exits 0
- [ ] `xai_boards_v2` round-trip: render with default seed → drag card across lists → reload → seed reflects post-move state
- [ ] `xai_active_board` round-trip: set active board → reload → renders same board
- [ ] Schema field set matches DESIGN.md §9.3 byte-for-byte (audited by test S1..S10)
- [ ] 10-color palette: every prototype seed color is renderable; every palette id maps to a defined OKLCH var
- [ ] No hard-coded hex in TSX (grep audit)
- [ ] Bilingual: every visible string toggles between en and zh when `lang` flips
- [ ] DnD: drop card across two different lists → source loses card, target gains it, total card count unchanged
- [ ] DnD: drop-on-same-list is a no-op (no duplicate card)
- [ ] Add-card composer: Enter submits, Shift+Enter inserts newline, Escape cancels, empty submit is no-op
- [ ] Add-list composer: Enter submits, Escape cancels
- [ ] Shell registration: visiting `/board` renders the BoardView; the `placeholder("board", ...)` line is replaced
- [ ] Public API: `index.ts` exports `Board`, `BoardList`, `BoardCard`, `BoardListColorId`, `LIST_COLOR_IDS`, `isBoardArray`, `boardCoreWebModuleRegistration`, and component types — and NOTHING from `src/internal/*` is reachable from outside
- [ ] Commit chain: one commit per phase (P1 / P2 / P3), each with conventional commit format

## 7. External research

**No external research required.** This row consumes the existing tools:

- React 19 + TypeScript 5.9 (already in `apps/web/package.json` devDeps)
- Native HTML5 DnD (no library)
- `@repo/plugin-web-storage` (already SHIPPED, exports `usePref`)
- `@repo/xai-web-shell` (already SHIPPED, exports `WebModuleSlotRegistration` + `useWebShell`)
- `@repo/plugin-web-tokens` (already SHIPPED, transitive CSS tokens)

No new dependency is added to `apps/web/package.json` other than the workspace pointer to `@repo/plugin-web-board-core`.

## 8. Recommendation

Proceed with **Option A — single-package port at `packages/plugin-web-board-core/`** using the three-phase plan logged in `packages/xai-web-board-core/docs/dev_log.md`. Status flips to `NEEDS_REVIEW` for feature-review handoff.
