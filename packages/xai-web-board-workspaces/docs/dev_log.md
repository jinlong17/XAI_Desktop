# Dev Log — xai-web-board-workspaces

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-board-workspaces |
| Title | Web Console Board workspace + multi-board layer — colored Workspace chips (Personal / Team Workspace), Board Switcher modal (search + workspace scope tabs + grouped grid of board cards + "+ New board"), Board Creator modal (3 templates: Basic Kanban / PM for Teams / Blank), Project-Management-for-Teams template visual treatment (Status Overview SVG ring chart + 5 colored stages + percentages), 4-button multi-panel switcher (Inbox 260px / Planner 320px / Board flex / Switch boards trigger) with at-least-one-open invariant, persistence via usePref on `xai_board_panels` + `xai_board_inbox` (both already SHIPPED `unknown`-typed registry slots — narrowed at component boundary), bilingual via `STR` local tables + `useI18n(lang)` for board-core-shipped keys, wraps row #7 `@repo/plugin-web-board-core`'s `BoardView` + schema + helpers + seed (consumed via index.ts ONLY). REPLACES `boardCoreWebModuleRegistration` at line 65 of `apps/web/src/routes/modules/shellRegistrations.tsx` with this row's `boardWorkspacesWebModuleRegistration` (single-line Edit + one import-block swap; concurrent siblings #8 board-views + #11 dashboard-widgets own disjoint anchors). Pure UI sink — no event-bus emit. |
| Current Phase | FEATURE_PLAN |
| Status | APPROVED |
| Suggested Next | feature-auto-build (W2e Parallel-Agent loop) |
| Verify Cross-vendor | queued (manifest header — ship-time Codex `gpt-5.5-thinking medium` / Cursor fallback; row-level verify is same-vendor Claude Opus — documented compromise) |
| Automation Mode | A-Claude (per roadmap default; xai-roadmap-loop W2e parallel-Agent mode — siblings #8 xai-web-board-views + #11 xai-web-dashboard-widgets planning concurrently) |
| Executor | Claude Opus 4.7 1M (feature-review, 2026-05-23) |
| Updated | 2026-05-23 |
| Dispatched By | xai-roadmap-loop (W2e parallel dispatch, concurrent with rows #8 and #11) |
| Roadmap Row | docs/workflow/roadmap/xai-web-console.md row #9 (W2 · Module) |
| ADR Anchor | docs/adr/0007-xai-web-console-build-form.md §S4 (port map "module-board.jsx" → `packages/plugin-web-board-{core,views,workspaces}/`) + §S5 (JSX→TSX rules) + §S6 (Vite SPA build form) + §S7 (no new event channels for row #9 — pure UI sink) + §S8 (`xai_board_panels` + `xai_board_inbox` are SHIPPED `unknown`-typed slots — narrow at boundary) |
| Concurrent Siblings | #8 xai-web-board-views (PLANNING) · #11 xai-web-dashboard-widgets (PLANNING) — write-scope-disjoint per design.md §13 |
| Write Scope | **planning phase**: `packages/xai-web-board-workspaces/docs/` + `docs/reviews/xai-web-board-workspaces/` ONLY. **build phase (later)** extends to `packages/plugin-web-board-workspaces/` (new package) + a single-line Edit on line 65 of `apps/web/src/routes/modules/shellRegistrations.tsx` (the `boardCoreWebModuleRegistration` line) + one import-block swap (line 34–35) + a one-line workspace dep addition in `apps/web/package.json` + a single row add in `docs/PLUGIN_MAP.md` |

## Artifacts Index

- Seed brief: `docs/reviews/xai-web-board-workspaces/20260523-roadmap-seed.md`
- Discovery review: `docs/reviews/xai-web-board-workspaces/20260523-discovery-review.md`
- Design snapshot: `packages/xai-web-board-workspaces/docs/design.md`
- API contract: `packages/xai-web-board-workspaces/docs/api.md`
- Test strategy: `packages/xai-web-board-workspaces/docs/test.md`

## Decision Headline

Port `web design/module-board.jsx`'s **workspace + multi-board layer** (BoardSwitcher 1280–1366, BoardCreator 1370–1417, StatusOverviewBanner 1421–1492, InboxPanel 1172–1217, PlannerPanel 1221–1277, BoardModule wrapper 26–309) into a typed Vite+React 19 wrapper package `@repo/plugin-web-board-workspaces` at `packages/plugin-web-board-workspaces/`. The package depends on the already-SHIPPED row #7 `@repo/plugin-web-board-core` and consumes its public `index.ts` surface (BoardView, schema, seed, helpers) — zero edits to board-core.

Persistence narrows two opaque registry slots at the component boundary: `xai_board_panels` (registry `BoardPanelState[] = unknown[]`, narrowed to `{inbox, planner, board: boolean}` via `isBoardPanelState`) and `xai_board_inbox` (registry `InboxCard[] = unknown[]`, narrowed to `{id, text: {en, zh}}[]` via `isInboxCardArray`). Writes use length-1 array shape for panels to satisfy the registry's array default contract without a registry edit (same pattern board-core uses for `xai_boards_v2 = unknown`).

PM Status Overview ring chart is a pure SVG render driven by `computeRingSegments(lists, lang)` and `computeDonePct(lists)` — both pure / referentially transparent helpers in `internal/ringMath.ts`. No animation timing concerns; the ring re-renders on every state change.

Multi-panel layout enforces "at least one open" via `togglePanelInvariant(prev, key)` — the SOLE writer to the panel state. If the toggle would zero-out all three, force `board = true` (matches `module-board.jsx:98`).

No `@repo/core` source edits, no event-bus emit, no new `EventMap` entries, no new CSP / Sentry envelope rules, no edits to `@repo/plugin-web-storage`'s registry. Pure UI sink for v1 — matching the ai-chat row #18 / board-core row #7 precedents.

The shell slot registration REPLACES the existing `boardCoreWebModuleRegistration` line at `apps/web/src/routes/modules/shellRegistrations.tsx:65` with the new `boardWorkspacesWebModuleRegistration` (a swap, not a parallel addition — the row #9 module IS the row #7 module's user-facing upgrade). Concurrent siblings #8 (board-views, will plug in via context once both land) and #11 (dashboard-widgets, different rail entry) own disjoint anchors. Apply the auto-build retry-on-lock strategy from countdown row #17 / ai-chat row #18 if `git index.lock` contention happens.

## Phase Plan (3 phases — per seed brief default; matches board-core row #7 pattern)

> Each phase is a single `feature-build` run. After each phase, `feature-build`
> stops for human confirmation per CLAUDE.md "feature-build does ONE phase per run".
> In auto-build (xai-roadmap-loop W2e Parallel-Agent mode), all phases run in one worker
> invocation and the loop only stops on a BLOCKED status or after all phases DONE.

### Phase P1 — Package scaffolding + narrowing types + guards + pure helpers (ring math + panel ops + inbox load) + STR i18n table + unit tests

**Scope**

1. **Create runtime package** at `packages/plugin-web-board-workspaces/`:
   - `package.json` (name `@repo/plugin-web-board-workspaces`, deps per api.md §14 — includes `@repo/plugin-web-board-core` workspace dep)
   - `tsconfig.json` (extends `@repo/typescript-config/react-library.json`)
   - `manifest.json` (`status: "In-Dev"`, `type: "ui"`, `owner: "xai-web-board-workspaces row #9"`, `windows: []`)
   - `vitest.config.ts` (jsdom; `setupFiles: ["./vitest.setup.ts"]`; include `src/__tests__/**/*.{test,spec}.{ts,tsx}`)
   - `vitest.setup.ts` (`requestAnimationFrame` polyfill + `afterEach(() => localStorage.clear())` + `import "@testing-library/jest-dom/vitest"`)
   - `eslint.config.js` (extends `@repo/eslint-config/react-internal` + `@typescript-eslint/no-explicit-any: error`)
2. **Internal types** in `src/internal/types.ts`: `BoardPanelStateShape`, `InboxCardShape`, `RingSegment`.
3. **Internal pure modules** in `src/internal/`:
   - `guards.ts` — `isBoardPanelState`, `isInboxCardArray` type guards
   - `panelOps.ts` — `loadPanelsOrDefault`, `loadInboxOrDefault`, `togglePanelInvariant`, `INBOX_SEED`, `DEFAULT_PANEL_STATE`
   - `ringMath.ts` — `computeRingSegments`, `computeDonePct`
   - `strings.ts` — bilingual `STR` tables grouped by component (re-exported by each `.tsx` file)
4. **Tests (P1 subset per test.md §2)**:
   - `__tests__/types.test.ts` (T1..T3)
   - `__tests__/guards.test.ts` (G1..G12)
   - `__tests__/panelOps.test.ts` (PO1..PO16)
   - `__tests__/ringMath.test.ts` (RM1..RM10)

**Acceptance**

- `pnpm --filter @repo/plugin-web-board-workspaces lint --max-warnings 0` exits 0
- `pnpm --filter @repo/plugin-web-board-workspaces typecheck` exits 0
- `pnpm --filter @repo/plugin-web-board-workspaces test` exits 0; all P1 tests pass (≥35 cases)
- Commit: `feat(plugin-web-board-workspaces): P1 scaffolding + narrowing types + guards + ring math + panel ops + STR + tests (W2e row #9)`

### Phase P2 — 5 leaf React components (Switcher / Creator / StatusOverviewBanner / InboxPanel / PlannerPanel) + CSS + component tests

**Scope**

1. **Components** in `src/`:
   - `BoardSwitcher.tsx` (props per api.md §4)
   - `BoardCreator.tsx` (props per api.md §5)
   - `StatusOverviewBanner.tsx` (props per api.md §6)
   - `InboxPanel.tsx` (props per api.md §7)
   - `PlannerPanel.tsx` (props per api.md §8 — supports `now?: Date` injection for tests)
2. **CSS** in `src/styles.css` — port of `web design/layout.css` board-switcher / board-creator / status-overview / inbox-panel / planner-panel / board-view-switcher sections + `:root { --planner-color-green/-blue/-amber/-purple: oklch(...) }` declarations + `.board-panels-single` / `.board-panels-multi` layout rules.
3. **Tests (P2 subset per test.md §2)**:
   - `__tests__/BoardSwitcher.test.tsx` (BS1..BS15)
   - `__tests__/BoardCreator.test.tsx` (BC1..BC10)
   - `__tests__/StatusOverviewBanner.test.tsx` (SOB1..SOB10)
   - `__tests__/InboxPanel.test.tsx` (IP1..IP10)
   - `__tests__/PlannerPanel.test.tsx` (PP1..PP12)

**Acceptance**

- `pnpm --filter @repo/plugin-web-board-workspaces lint --max-warnings 0` exits 0
- `pnpm --filter @repo/plugin-web-board-workspaces typecheck` exits 0
- `pnpm --filter @repo/plugin-web-board-workspaces test` exits 0; all P1+P2 tests pass (≥92 cases)
- Commit: `feat(plugin-web-board-workspaces): P2 leaf components + CSS + tests (W2e row #9)`

### Phase P3 — `BoardWorkspacesModule` orchestrator + registration + apps/web wire-up + PLUGIN_MAP + integration tests

**Scope**

1. **`BoardWorkspacesModule.tsx`** — top-level orchestrator (props: `{ lang }`):
   - `usePref` on the 4 registry slots; narrow at boundary via §1 contract
   - Local state for switcher / creator / overview / Kanban-view glue
   - Header block (workspace chip + title button + view-picker stub + total + members empty-stub + overview toggle + filter/share/dots no-ops)
   - Canvas with conditional StatusOverviewBanner + 1..3 panels
   - Bottom 4-button switcher
   - Modals: BoardSwitcher (when `switcherOpen`), BoardCreator (when `createOpen`)
   - Defensive `if (boards.length === 0) setBoardsRaw(makeDefaultBoards())` once on mount
2. **`src/registration.tsx`** — `boardWorkspacesWebModuleRegistration` per api.md §10 (moduleId `"board"`, icon `"kanban"`, railOrder 3, i18nKey `"nav.board"`, showInRail true). Uses `useWebShell()` to read `lang`.
3. **`src/index.ts`** — public surface per api.md §0 (re-exports from board-core + new surface + side-effect CSS import).
4. **`apps/web/src/routes/modules/shellRegistrations.tsx`** — Edit (not Write):
   - Line 34–35 import swap: `boardCoreWebModuleRegistration` → `boardWorkspacesWebModuleRegistration`
   - Line 65 array entry swap with updated comment
5. **`apps/web/package.json`** — add `"@repo/plugin-web-board-workspaces": "workspace:*"` to `dependencies` (alphabetically sorted; keep `@repo/plugin-web-board-core` as transitive workspace dep).
6. **`docs/PLUGIN_MAP.md`** — add a row under "Web Modules (W2 parallel build)": `| @repo/plugin-web-board-workspaces | packages/plugin-web-board-workspaces/ | In-Dev | Web Console Board workspace + multi-board layer — Workspace chips, Board Switcher modal, Board Creator (3 templates), PM Status Overview ring chart, 4-button multi-panel switcher with at-least-one-open invariant. Wraps row #7 `@repo/plugin-web-board-core`. Persists via `xai_board_panels` + `xai_board_inbox` (both already SHIPPED `unknown`-typed registry slots — narrowed at boundary). Pure UI sink. Replaces row #7's shell registration at line 65 of `shellRegistrations.tsx`. Row #9, Wave W2e. READY_FOR_VERIFY — cross-vendor manual smoke pending feature-verify. | @repo/core, @repo/plugin-web-board-core, @repo/plugin-web-tokens, @repo/plugin-web-storage, @repo/xai-web-shell | 2026-05-23 |`.
7. **Tests (P3 subset per test.md §2)**:
   - `__tests__/BoardWorkspacesModule.test.tsx` (BWM1..BWM18)
   - `__tests__/registration.test.tsx` (REG1..REG6)
   - `__tests__/index-barrel.test.ts` (IB1..IB4)

**Acceptance**

- `pnpm --filter @repo/plugin-web-board-workspaces lint --max-warnings 0` exits 0
- `pnpm --filter @repo/plugin-web-board-workspaces typecheck` exits 0
- `pnpm --filter @repo/plugin-web-board-workspaces test` exits 0; all P1+P2+P3 tests pass (≥120 cases)
- `pnpm --filter @repo/web lint --max-warnings 0` exits 0 (no NEW warnings; pre-existing 3 warnings from earlier rows acknowledged)
- `pnpm --filter @repo/web check-types` exits 0
- `pnpm --filter @repo/web build` exits 0
- `pnpm --filter @repo/web test` exits 0 (no host regression)
- Commit: `feat(plugin-web-board-workspaces): P3 BoardWorkspacesModule + registration + host wire-up + PLUGIN_MAP (W2e row #9)`

## Risks

- **R1**: `xai_board_panels` registry type is `BoardPanelState[] = unknown[]` (array) but the natural data is an object `{inbox, planner, board}`. Mitigation: narrow at boundary, accept BOTH legacy-array and bare-object payloads on read; always write length-1 array. Tests PO1..PO8.
- **R2**: `xai_board_inbox` registry type is `InboxCard[] = unknown[]`. Mitigation: narrow via `isInboxCardArray`; on rejection use 3-item seed. Tests PO9..PO12, G6..G12.
- **R3**: `BoardCreator` re-uses board-core's `BOARD_TEMPLATES` — its `lists()` factory uses `JSON.parse(JSON.stringify(...))` clone. Mitigation: import from `index.ts` only; type guard at use site. Test BC8, BWM5.
- **R4**: Bilingual ternary surface is large. Mitigation: per-file `STR` localized tables (R4 in discovery review). Audited by IB-level lint config and reviewed during P2.
- **R5**: `StatusOverviewBanner` SVG ring math float-precision. Mitigation: pure `computeRingSegments` helper + RM1..RM10 tests including epsilon assertion.
- **R6**: `PlannerPanel` cycles colors `["green","blue","amber","purple"]` — `amber` is NOT in board-core's 10-color palette. Mitigation: declare scoped `--planner-color-<id>` OKLCH vars in this row's `styles.css`; PP10 test asserts the cycle.
- **R7**: `BoardSwitcher` uses native `window.confirm`. Mitigation: jsdom-compatible; tests stub via `vi.spyOn(window, "confirm")`. Tests BS13, BS14.
- **R8**: Delete-affordance guard `b.id !== activeBoardId && totalFiltered > 1` — verbatim from prototype. Mitigation: replicate exact logic; tests BS10..BS12.
- **R9**: 4+ sibling rows write to `shellRegistrations.tsx`. Mitigation: Edit (not Write); unique anchor strings; retry `git index.lock` 8–20s × 5. Pattern proven in W2c/W2d.
- **R10**: New i18n keys (~20+) needed if going through `useI18n` — would require an edit to `@repo/plugin-web-tokens`. Mitigation: bypass `useI18n` for new strings via per-file `STR` tables; only consume board-core-shipped keys (already in `@repo/plugin-web-tokens`) via `useI18n(lang)`. No tokens edits.
- **R11**: `apps/web/package.json` keeping BOTH `@repo/plugin-web-board-core` AND `@repo/plugin-web-board-workspaces` — tree-shake risk. Mitigation: row #9 re-exports board-core's data types; only the registration is swapped. Board-core's BoardView is consumed indirectly through workspaces.

## Review Notes (2026-05-23, feature-review)

**Verdict: APPROVED.** 0 blockers, 3 non-blocking recommendations.

Checklist results:

1. **Discovery quality** — pass. Four options (A/B/C/D) with explicit tradeoffs and one-line rejections for B/C/D. Recommendation pinned to A grounded in ADR-0007 §S4 port-map line 272 (explicit 3-way split board-core / board-views / board-workspaces), the seed brief's "depends on row #7 via index.ts only" hard constraint, and sibling-row precedents (ai-chat #18 / pomodoro #14 / habits #15 — all single-package modules; board-core #7 — the wrapped substrate). Risk register R1..R11 grounded in artifact + registry + ADR evidence; web research correctly skipped (no external dep introduced — pure port).
2. **Design snapshot alignment** — pass. 11 Frozen Assumptions cover wrapper-plugin pattern, storage narrowing (both opaque slots `xai_board_panels` + `xai_board_inbox`), multi-panel invariant, layout rules, PM Status Overview mounting predicate, bilingual via per-file STR tables, no-event-bus, no new tokens.css vars, shell-registration line-65 swap anchor, three-phase build, cross-vendor verify queued. All explicit and consistent with discovery report Recommendation §3.
3. **Contract completeness** — pass. api.md §0..§14 enumerate the public surface (re-exports from board-core + this row's net-new surface), persistence narrowing (read protocol with 4 acceptance cases + write protocol with length-1 array), multi-panel layout class rules, PM Status Overview ring math contract with pure helpers, 5 leaf component APIs + 1 top-level orchestrator API, registration shape, error semantics / idempotency, schema versioning, concurrency notes, dep manifest. The "length-1 array for object payload" persistence pattern is novel for this row but well-justified (registry default is array; opaque type permits the trick); test coverage adequate.
4. **Phase plan quality** — pass. P1/P2/P3 each have explicit file scope, test subset (per test.md §2), acceptance criteria, and a planned conventional commit message. P1 is independently committable (scaffolding + narrowing helpers + ring math + types + STR — no React yet). P2 lands 5 leaf components + CSS. P3 lands the orchestrator + registration + apps/web wire-up + PLUGIN_MAP. Sibling-pattern-aligned with board-core row #7 / statistics row #20.
5. **Architecture risk** — pass. Zero `@repo/core` edits. Zero new event-bus channels (ADR-0007 §S7 compliant — row #9 is a pure UI sink for v1). Zero new CSP / Sentry envelope rules. Zero edits to `packages/plugin-web-storage/src/internal/registry.ts` (the 4 board keys are already SHIPPED non-`proposed` entries; narrowing happens at the consumer boundary inside this row). Zero edits to `@repo/plugin-web-board-core` (board-core's SHIPPED commit cc52060 is the substrate). Shared anchor in `apps/web/src/routes/modules/shellRegistrations.tsx` line 65 (+ companion import line 34..35) is a single-line Edit compatible with concurrent W2e siblings (#8 board-views planning concurrently with disjoint write scope; #11 dashboard-widgets owns a different rail-entry line — write-scope disjoint).

**Non-blocking recommendations** (planner / auto-build worker may roll into P1/P2/P3 without re-review):

- **Rec1 (minor):** The api.md §1 read protocol for `xai_board_panels` documents accepting BOTH the length-1 array form AND the bare-object form. P1's `loadPanelsOrDefault` MUST test both forms (covered by PO5 + PO6). Auto-build worker should ensure the test fixture for PO6 is a bare object, not wrapped. The `usePref` setter will receive an array (our canonical write shape) — defensive `Array.isArray(raw)` branch first, then bare-object branch.
- **Rec2 (minor):** Rec2 of row #7's review (defensive `if (boards.length === 0) setBoardsRaw(makeDefaultBoards())` once on mount) carries over to this row's `BoardWorkspacesModule`. Test BWM18 explicitly covers this — keep it as a `useEffect` with empty dep array OR an inline ref-guard so it doesn't re-fire on subsequent renders.
- **Rec3 (minor):** `PlannerPanel`'s color cycle `["green","blue","amber","purple"]` includes `amber` which is NOT in board-core's 10-color `LIST_COLOR_IDS`. P2 must declare scoped `--planner-color-green/-blue/-amber/-purple` OKLCH vars in this row's `src/styles.css` (NOT in `@repo/plugin-web-tokens`'s `tokens.css`). Test PP10 asserts the cycle modulo 4 — keep it as a direct assertion on rendered class names.

## Phase Progress

| Phase | Status | Commit | Notes |
|---|---|---|---|
| P1 — Scaffolding + narrowing types + guards + ring math + panel ops + STR + tests | PENDING | — | — |
| P2 — 5 leaf React components + CSS + tests | PENDING | — | — |
| P3 — BoardWorkspacesModule orchestrator + registration + host wire-up + PLUGIN_MAP + integration tests | PENDING | — | — |

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-23 | Claude Opus 4.7 1M | feature-plan Fresh — produced discovery review + design + api + test + dev_log | — | feature-review |
| 2026-05-23 | Claude Opus 4.7 1M | feature-review — APPROVED with 0 blockers + 3 non-blocking recommendations | — | feature-auto-build (W2e Parallel-Agent loop) |
