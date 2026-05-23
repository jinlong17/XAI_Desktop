# Dev Log — xai-web-board-core

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-board-core |
| Title | Web Console Board (Kanban) module — canonical Board/Card/List schema (DESIGN.md §9.3 byte-for-byte), Board (Kanban) view with 10-color list-color palette (green/yellow/orange/red/purple/blue/teal/lime/pink/gray sourced from `tokens.css` semantic vars — no hard-coded hex), in-row "add card" composer + add-list composer, native HTML5 cross-list drag-and-drop with atomic-move semantics (no orphan cards on reload), bilingual `{en, zh}` rendering via `lang` prop, persistence via `usePref` on the already-SHIPPED `xai_boards_v2` (`BoardsState`) and `xai_active_board` (string) registry keys, and shell slot registration that replaces the existing `placeholder("board", "Boards", "kanban", 3)` line on line 59 of `apps/web/src/routes/modules/shellRegistrations.tsx`. THIS IS THE FOUNDATION layer for downstream rows #8 `xai-web-board-views` (Table/Calendar/Dashboard/Timeline/Map) and #9 `xai-web-board-workspaces` (Switcher/Creator/PM template/multi-panel/inbox/planner/card-detail-modal) — public API + schema MUST be stable before those rows can compile. |
| Current Phase | FEATURE_REVIEW |
| Status | APPROVED |
| Suggested Next | feature-build (or feature-auto-build / feature-dev-loop) |
| Verify Cross-vendor | queued (manifest header — ship-time Codex `gpt-5.5-thinking medium` / Cursor fallback; row-level verify is same-vendor Claude Opus — documented compromise) |
| Automation Mode | A-Claude (per roadmap default; xai-roadmap-loop W2d parallel-Agent mode — siblings #10 dashboard-grid + #20 statistics planning concurrently) |
| Executor | Claude Opus 4.7 1M (feature-review, 2026-05-23) |
| Updated | 2026-05-23 |
| Dispatched By | xai-roadmap-loop (W2d parallel dispatch, concurrent with rows #10 and #20) |
| Roadmap Row | docs/workflow/roadmap/xai-web-console.md row #7 (W2 · Module) |
| ADR Anchor | docs/adr/0007-xai-web-console-build-form.md §S4 (port map "module-board.jsx" → `packages/plugin-web-board-core/`) + §S5 (JSX→TSX rules) + §S6 (Vite SPA build form) + §S7 (no new event channels for row #7) + §S8 (SHIPPED `xai_boards_v2` / `xai_active_board` keys — already non-`proposed` in storage registry; `xai_board_panels` / `xai_board_inbox` are reserved by row #9) |
| Concurrent Siblings | #10 xai-web-dashboard-grid (IN_PROGRESS) · #20 xai-web-statistics (IN_PROGRESS) — write-scope-disjoint per design.md §12 |
| Write Scope | **planning phase**: `packages/xai-web-board-core/docs/` + `docs/reviews/xai-web-board-core/` ONLY. **build phase (later)** extends to `packages/plugin-web-board-core/` (new package) + a single-line Edit on line 59 of `apps/web/src/routes/modules/shellRegistrations.tsx` (the `placeholder("board", "Boards", "kanban", 3)` line) + a one-line workspace dep addition in `apps/web/package.json` + a single row add in `docs/PLUGIN_MAP.md` |

## Artifacts Index

- Seed brief: `docs/reviews/xai-web-board-core/20260523-roadmap-seed.md`
- Discovery review: `docs/reviews/xai-web-board-core/20260523-discovery-review.md`
- Design snapshot: `packages/xai-web-board-core/docs/design.md`
- API contract: `packages/xai-web-board-core/docs/api.md`
- Test strategy: `packages/xai-web-board-core/docs/test.md`

## Decision Headline

Port `web design/module-board.jsx` (Board view section, lines 311–476 + helpers from lines 1–170) + `web design/board-data.js` (workspaces / boards / PM template / labels seed) + the relevant Board CSS from `web design/layout.css` (lines 1888–2050 + 2483–2517) into a typed Vite+React 19 package `@repo/plugin-web-board-core` at `packages/plugin-web-board-core/`.

The defining call — **the Board/Card/List schema** that downstream rows #8 (board-views) and #9 (board-workspaces) will consume — is fixed as a verbatim TS port of DESIGN.md §9.3 with the field set:

- `Board { id, workspaceId, name: BilingualText, cover: string, template: "kanban"|"pm"|"blank", lists: BoardList[] }`
- `BoardList { id, key: string|null, customName?: BilingualText, color?: BoardListColorId|null, cards: BoardCard[] }`
- `BoardCard { id, title: BilingualText, labels?: string[], members?: string[], checklist?: {done,total}, due?, dueEn?, start?, dueLate?, attach?, cover? }`

The 10-color list palette (`green/yellow/orange/red/purple/blue/teal/lime/pink/gray`) is declared in `src/internal/listColors.ts` as a `readonly` tuple, with OKLCH values living in `src/styles.css` as `--board-list-color-<id>` custom properties. No hard-coded hex in TSX — satisfying the seed brief's "10 column colors via tokens.css (no hard-coded hex)" hard constraint.

Persistence uses ONLY the two foundation keys already SHIPPED in `@repo/plugin-web-storage`: `xai_boards_v2` (registry type `BoardsState = unknown`, narrowed at component boundary via `isBoardArray` guard) and `xai_active_board` (`string`). The two reserved keys `xai_board_panels` and `xai_board_inbox` (also owned by `xai-web-board-core` in the registry) are NOT touched by this row — they belong to row #9 (workspaces).

DnD uses native HTML5 `draggable` + `dataTransfer` with a namespaced MIME `application/x-xai-board-card` so foreign drags (Finder, text) don't accidentally trigger a list drop. Atomic-move semantics: a single `setBoards` updater call mutates source-list (card removed) and target-list (card appended) in one React tick — no intermediate orphan state can be persisted. The drop handler validates JSON shape; malformed payload is a silent no-op.

No `@repo/core` source edits, no event-bus emit, no new `EventMap` entries, no new CSP / Sentry envelope rules, no edits to the `@repo/plugin-web-storage` registry. Pure UI sink for v1 — matching the ai-chat row #18 precedent.

The shell slot registration replaces the existing `placeholder("board", "Boards", "kanban", 3)` on line 59 of `apps/web/src/routes/modules/shellRegistrations.tsx` (single-line edit). Concurrent siblings #10 (dashboard-grid, line 60) and #20 (statistics, line 67) own their own placeholder lines — write-scope disjoint, no merge conflict. Apply the auto-build retry-on-lock strategy from countdown row #17 / ai-chat row #18 if `git index.lock` contention happens.

## Phase Plan (3 phases — per seed brief default)

> Each phase is a single `feature-build` run. After each phase, `feature-build`
> stops for human confirmation per CLAUDE.md "feature-build does ONE phase per run".
> In auto-build (xai-roadmap-loop W2d Parallel-Agent mode), all phases run in one worker
> invocation and the loop only stops on a BLOCKED status or after all phases DONE.

### Phase P1 — Package scaffolding + schema types + seed + 10-color palette + pure helpers + guard predicates + tests

**Scope**

1. **Create runtime package** at `packages/plugin-web-board-core/`:
   - `package.json` (name `@repo/plugin-web-board-core`, deps per api.md §13)
   - `tsconfig.json` (extends `@repo/typescript-config/react-library.json`)
   - `manifest.json` (`status: "In-Dev"`, `type: "ui"`, `owner: "xai-web-board-core row #7"`, `windows: []`)
   - `vitest.config.ts` (jsdom; `setupFiles: ["./vitest.setup.ts"]`; include `src/__tests__/**/*.{test,spec}.{ts,tsx}`)
   - `vitest.setup.ts` (`requestAnimationFrame` polyfill + `afterEach(() => localStorage.clear())` + `import "@testing-library/jest-dom"`)
   - `eslint.config.js` (extends `@repo/eslint-config/react-internal` + `@typescript-eslint/no-explicit-any: error`)
2. **Public types** in `src/types.ts`: `BilingualText`, `BoardListColorId` (10-id union), `BoardTemplate` ("kanban"|"pm"|"blank"), `CardChecklist`, `BoardCard`, `BoardList`, `BoardWorkspace`, `Board` per api.md §3.
3. **Internal pure modules** in `src/internal/`:
   - `listColors.ts` — `LIST_COLOR_IDS` readonly tuple + `LIST_COLOR_PALETTE` with `cssVar` entries
   - `isBoardArray.ts` — `isBoardArray`, `isBoard`, `isBoardList`, `isBoardCard` type guards
   - `boardOps.ts` — pure helpers `moveCardToList`, `addCardToList`, `addNewList`, `setListColor`, `updateCardInList`
   - `seed/board-data.ts` — typed port of `web design/board-data.js` (DEFAULT_WORKSPACES, PM_LABELS, PM_LISTS_INITIAL, BOARD_TEMPLATES, makeDefaultBoards) + a typed port of `MOCK.boardLists` (the kanban template's seeded list of cards)
4. **Tests (P1 subset per test.md §2)**:
   - `__tests__/types.test.ts` (T1 — compile-time-style assertions on literal unions)
   - `__tests__/listColors.test.ts` (C1..C4)
   - `__tests__/boardOps.test.ts` (M1..M10)
   - `__tests__/isBoardArray.test.ts` (V1..V8)
   - `__tests__/boardData.test.ts` (S1..S10)

**Acceptance**

- `pnpm --filter @repo/plugin-web-board-core lint --max-warnings 0` exits 0
- `pnpm --filter @repo/plugin-web-board-core typecheck` exits 0
- `pnpm --filter @repo/plugin-web-board-core test` exits 0; all P1 tests pass
- Commit: `feat(plugin-web-board-core): P1 scaffolding + schema + listColors + seed + boardOps + tests (W2d row #7)`

### Phase P2 — React components (`BoardCard`/`BoardList`/`BoardView`) + DnD + persistence helpers + CSS + tests

**Scope**

1. **Components** in `src/`:
   - `BoardCard.tsx` (props: `card`, `lang`, `onClick?`, `draggable`, `dragging`, `onDragStart`, `onDragEnd`)
   - `BoardList.tsx` (props: list + composer + menu + drag handlers per api.md §2)
   - `BoardView.tsx` (props: lists, lang, draftListIdx, composerText, addCard, addList, setListColor, moveCardToList, etc. per api.md §2)
2. **Persistence helpers** in `src/internal/persistence.ts`:
   - `loadBoardsOrDefault(raw: unknown): Board[]`
   - `pickActiveBoard(boards: readonly Board[], activeId: string): Board`
3. **CSS** in `src/styles.css` — port of `web design/layout.css` lines 1888–2050 + 2483–2517 (board-lists, board-list, bl-head, board-card, bc-title, bc-meta, bc-due, bc-checklist, bc-attach, bc-member, bc-cover, bc-labels, bc-label, add-card-btn, add-list-btn, has-color stripe, list-actions-popover, color-grid, color-sw) + `:root { --board-list-color-green: oklch(62% 0.13 155); … }` declarations for the 10 palette entries.
4. **Tests (P2 subset per test.md §2)**:
   - `__tests__/BoardCard.test.tsx` (BC1..BC5)
   - `__tests__/BoardList.test.tsx` (BL1..BL11)
   - `__tests__/BoardView.test.tsx` (BV1..BV9)
   - `__tests__/persistence.test.ts` (PE1..PE6)
   - `__tests__/_helpers/dataTransfer.ts` (test utility: `makeDataTransferMock()` per test.md §3)

**Acceptance**

- `pnpm --filter @repo/plugin-web-board-core lint --max-warnings 0` exits 0
- `pnpm --filter @repo/plugin-web-board-core typecheck` exits 0
- `pnpm --filter @repo/plugin-web-board-core test` exits 0; all P1+P2 tests pass
- DnD round-trip (BV5 + drop on different list) verified
- Commit: `feat(plugin-web-board-core): P2 components + DnD + persistence helpers + CSS + tests (W2d row #7)`

### Phase P3 — `BoardModule` orchestrator + registration + apps/web wire-up + PLUGIN_MAP + integration tests

**Scope**

1. **`BoardModule.tsx`** — the top-level orchestrator (props: `{ lang }`):
   - `usePref("xai_boards_v2")` with `loadBoardsOrDefault` narrowing
   - `usePref("xai_active_board")` with `pickActiveBoard` resolution
   - Local state: `draftListIdx`, `composerText`, `showListComposer`, `newListName`, `listMenu`
   - Header: `<h1>{activeBoard.name[lang]}</h1>` (minimal — row #9 will add chip + switcher)
   - Body: `<BoardView … />`
2. **`src/registration.tsx`** — `boardCoreWebModuleRegistration` per api.md §7 (moduleId `"board"`, icon `"kanban"`, railOrder 3, i18nKey `"nav.board"`, showInRail true). Uses `useWebShell()` to read `lang`.
3. **`src/index.ts`** — public surface per api.md §0 (types + constants + guards + seed + helpers + components + registration + side-effect CSS import).
4. **`apps/web/src/routes/modules/shellRegistrations.tsx`** — replace line 59's `placeholder("board", "Boards", "kanban", 3)` with the import + direct array entry `boardCoreWebModuleRegistration`. Insertion-sorted import statement.
5. **`apps/web/package.json`** — add `"@repo/plugin-web-board-core": "workspace:*"` to `dependencies` (alphabetically sorted to keep the diff localized).
6. **`docs/PLUGIN_MAP.md`** — add a row in "Web Modules (W2 parallel build)" section: `| @repo/plugin-web-board-core | packages/plugin-web-board-core/ | In-Dev | Web Console Board (Kanban) module — schema + 10-color palette + DnD + persistence per row #7. Foundation layer for #8 (views) + #9 (workspaces). READY_FOR_VERIFY — cross-vendor manual smoke pending feature-verify. | @repo/core, @repo/plugin-web-tokens, @repo/plugin-web-storage, @repo/xai-web-shell | 2026-05-23 |`.
7. **Tests (P3 subset per test.md §2)**:
   - `__tests__/BoardModule.test.tsx` (BM1..BM6)
   - `__tests__/registration.test.tsx` (RG1..RG6)
   - `__tests__/index-barrel.test.ts` (IB1..IB3)

**Acceptance**

- `pnpm --filter @repo/plugin-web-board-core lint --max-warnings 0` exits 0
- `pnpm --filter @repo/plugin-web-board-core typecheck` exits 0
- `pnpm --filter @repo/plugin-web-board-core test` exits 0; all P1+P2+P3 tests pass
- `pnpm --filter @repo/web lint --max-warnings 0` exits 0
- `pnpm --filter @repo/web check-types` exits 0
- `pnpm --filter @repo/web build` exits 0
- `pnpm --filter @repo/web test` exits 0 (no host regression)
- Commit: `feat(plugin-web-board-core): P3 BoardModule + registration + host wire-up + PLUGIN_MAP (W2d row #7)`

## Risks

- **R1**: `BoardsState = unknown` registry type forces a guard at the boundary. Mitigation: `isBoardArray` predicate + fallback to `makeDefaultBoards()` on rejection (matches `module-board.jsx` line 36). Tests V1..V8.
- **R2**: DnD-then-persist race. Mitigation: single `setBoards` updater closure; `usePref` autosave reads latest state. Test BM3.
- **R3**: Sibling rows #10 / #20 contend for `apps/web/package.json` + `shellRegistrations.tsx` at P3. Mitigation: `Edit` (not `Write`) on shared files; unique anchor (line 59 vs 60 vs 67); retry `git index.lock` 8–20s × 5.
- **R4**: 10-color palette IDs must match `module-board.jsx` lines 13–24 exactly (seed cards reference `color: "blue"` etc.). Mitigation: `LIST_COLOR_IDS as const satisfies readonly BoardListColorId[]` + tests C1..C4.
- **R5**: Cross-vendor verify queued at ship time (not row-level). Mitigation: documented in design.md §"Cross-vendor verify note" and feature-verify report will explicitly flag this as the manifest-header same-vendor compromise.
- **R6**: Card.due is a free-form display string in the prototype (`"5/26"`, `"Today"`). Schema must preserve as opaque `string`. Mitigation: `Card.due?: string` documented in api.md §3 + types tests T1.
- **R7**: Seed data port from `board-data.js` references `window.MOCK.boardLists` (global, not in `board-data.js` itself). Mitigation: port `MOCK.boardLists` inline as a typed `KANBAN_DEFAULT_LISTS` constant in `internal/seed/board-data.ts`. Test S7 verifies count.
- **R8**: `typescript-eslint/no-explicit-any: error` strict — type guards must be exact. Mitigation: budget two extra commits if a type fix is needed (well within auto-build retry budget).

## Review Notes (2026-05-23, feature-review)

**Verdict: APPROVED.** 0 blockers, 2 non-blocking recommendations.

Checklist results:

1. **Discovery quality** — pass. Four options (A/B/C/D) with explicit tradeoffs and one-line rejections for B/C/D. Recommendation pinned to A grounded in ADR-0007 §S4 port-map line 272, sibling-row precedent (ai-chat #18, habits #15, pomodoro #14 — all single-package). Risk register R1..R8 grounded in artifact + registry + ADR evidence; web research correctly skipped (no external dep introduced — pure port).
2. **Design snapshot alignment** — pass. 11 Frozen Assumptions cover runtime package, persistence narrowing, schema, 10-color palette (tokens-only), bilingual, DnD MIME, atomic-move, no-event-bus, shell-registration anchor, and three-phase build. All explicit and consistent with discovery report Recommendation §3.
3. **Contract completeness** — pass. api.md §0..§13 enumerate public surface, two component APIs, schema types, palette constant, pure helpers, persistence helpers, registration, DnD MIME contract, error semantics, idempotency, versioning, concurrency, and dep list. `BoardsState = unknown` narrowing via `isBoardArray` guard at component boundary is properly documented; the registry stays as-is (no edit).
4. **Phase plan quality** — pass. P1/P2/P3 each have explicit file scope, test subset (per test.md §2), acceptance criteria, and a planned conventional commit message. P1 is independently committable (scaffolding + pure helpers + types + seed + guards — no UI yet). P2 lands components + DnD + CSS. P3 lands the orchestrator + registration + apps/web wire-up + PLUGIN_MAP. Sibling-pattern-aligned.
5. **Architecture risk** — pass. Zero `@repo/core` edits. Zero new event-bus channels (ADR-0007 §S7 compliant — row #7 is a pure UI sink for v1). Zero new CSP / Sentry envelope rules. Zero edits to `packages/plugin-web-storage/src/internal/registry.ts` (the 4 board keys are already SHIPPED non-`proposed` entries). Shared anchors in `apps/web/src/routes/modules/shellRegistrations.tsx` line 59 + `apps/web/package.json` are single-line Edits compatible with concurrent W2d siblings (#10 line 60 + #20 line 67 — write-scope disjoint).

**Non-blocking recommendations** (planner may roll into P1/P2 without re-review):

- **Rec1 (minor):** the seed port creates `KANBAN_DEFAULT_LISTS` from the prototype's `window.MOCK.boardLists` reference. `MOCK.boardLists` is NOT defined in `web design/board-data.js` itself (only referenced via `window.MOCK.boardLists` on line 30). Before authoring P1, the planner / auto-build worker should cross-grep `web design/app.jsx` or `web design/i18n.js` for the actual `MOCK.boardLists` array shape and seed contents, and copy verbatim into `src/internal/seed/board-data.ts`. If the upstream definition is missing or trivially empty, document this in P1 implementation notes and write a 5-card stub representative of the prototype.
- **Rec2 (minor):** api.md §6 leaves `pickActiveBoard([], "anything")` behavior "TBD by implementation". Verify-pass should accept whatever P2 chooses, but the `BoardModule` orchestrator (P3) should also defend against the empty-boards case at the React level — e.g. if `boards.length === 0`, render `makeDefaultBoards()` once and persist. This double-defense matches the prototype's line 79 fallback.

## Phase Progress

| Phase | Status | Commit | Notes |
|---|---|---|---|
| P1 — Scaffolding + schema + listColors + seed + boardOps + guards + tests | PENDING | — | — |
| P2 — Components + DnD + persistence helpers + CSS + tests | PENDING | — | — |
| P3 — BoardModule orchestrator + registration + host wire-up + PLUGIN_MAP + integration tests | PENDING | — | — |

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-23 | Claude Opus 4.7 1M | feature-plan Fresh — produced discovery review + design + api + test + dev_log | — | feature-review |
| 2026-05-23 | Claude Opus 4.7 1M | feature-review — APPROVED with 0 blockers + 2 non-blocking recommendations | — | feature-auto-build (W2d Parallel-Agent loop) |
