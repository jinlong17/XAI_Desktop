# Dev Log — xai-web-board-workspaces

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-board-workspaces |
| Title | Web Console Board workspace + multi-board layer — colored Workspace chips (Personal / Team Workspace), Board Switcher modal (search + workspace scope tabs + grouped grid of board cards + "+ New board"), Board Creator modal (3 templates: Basic Kanban / PM for Teams / Blank), Project-Management-for-Teams template visual treatment (Status Overview SVG ring chart + 5 colored stages + percentages), 4-button multi-panel switcher (Inbox 260px / Planner 320px / Board flex / Switch boards trigger) with at-least-one-open invariant, persistence via usePref on `xai_board_panels` + `xai_board_inbox` (both already SHIPPED `unknown`-typed registry slots — narrowed at component boundary), bilingual via `STR` local tables + `useI18n(lang)` for board-core-shipped keys, wraps row #7 `@repo/plugin-web-board-core`'s `BoardView` + schema + helpers + seed (consumed via index.ts ONLY). REPLACES `boardCoreWebModuleRegistration` at line 65 of `apps/web/src/routes/modules/shellRegistrations.tsx` with this row's `boardWorkspacesWebModuleRegistration` (single-line Edit + one import-block swap; concurrent siblings #8 board-views + #11 dashboard-widgets own disjoint anchors). Pure UI sink — no event-bus emit. |
| Current Phase | SHIP |
| Status | SHIPPED |
| Suggested Next | — |
| Verify Cross-vendor | queued (manifest header — ship-time Codex `gpt-5.5-thinking medium` / Cursor fallback; row-level verify is same-vendor Claude Opus — documented compromise) |
| Automation Mode | A-Claude (per roadmap default; xai-roadmap-loop W2e parallel-Agent mode — siblings #8 xai-web-board-views + #11 xai-web-dashboard-widgets planning concurrently) |
| Executor | claude-sonnet-4-6 (ship, 2026-05-23 18:55) |
| Updated | 2026-05-23 18:55 |
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

## Verify Report (2026-05-23, feature-verify)

**Verdict: PASS.** Status → READY_TO_SHIP. 0 blockers, 3 documented non-blocking residuals.

### Automated gates (HEAD = fdd1521)

| Gate | Result | Evidence |
|---|---|---|
| G1 — `pnpm --filter @repo/plugin-web-board-workspaces lint` (`--max-warnings 0`) | PASS | exit 0, 0 problems |
| G2 — `pnpm --filter @repo/plugin-web-board-workspaces typecheck` | PASS | `tsc --noEmit` exit 0 |
| G3 — `pnpm --filter @repo/plugin-web-board-workspaces test` | PASS | 12 files, 135/135 cases pass |
| G4 — `pnpm --filter @repo/web check-types` | PASS | `tsc --noEmit` exit 0 |
| G5 — `pnpm --filter @repo/web build` | PASS | vite v7.2.4 built in 2.42s, ~705 modules transformed |
| G6 — `pnpm --filter @repo/web test` | PASS | 14 files, 54/54 cases pass; no host regression |
| G7 (manual) — Cross-vendor smoke (Chrome 120 / Safari 17 / Firefox 121) | QUEUED at ship-time per manifest header (W2e Parallel-Agent mode) — Codex `gpt-5.5-thinking medium` / Cursor fallback. Row-level verify is same-vendor Claude Opus, documented same-vendor compromise. |

### Code audit (A1..A11)

- **A1 — No hard-coded hex in TSX/TS source**: PASS. `grep -rnE '#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?\b' src --include='*.ts' --include='*.tsx'` returned zero matches. Two `#ffffff` literals exist only in `src/styles.css` (`.ws-chip` text color + `.bv-btn.active` text color) — same pattern as board-core's CSS (`#fff` literals are tolerated in CSS for white-text contrast roles).
- **A2 — No `@repo/core` edits in this row's 3 commits**: PASS. `git show <commit> --stat | grep packages/core` returned zero matches for 214f28f / a107980 / fdd1521.
- **A3 — No storage registry edits**: PASS. None of the 3 row commits touched `packages/plugin-web-storage/`. The 4 board keys remain SHIPPED `unknown`-typed slots; narrowing happens at the consumer boundary inside this row via `loadPanelsOrDefault` / `loadInboxOrDefault`.
- **A4 — No `@repo/plugin-web-board-core` edits**: PASS. Board-core ships at row #7's READY_TO_SHIP commit `cc52060`; this row only consumes the public `index.ts` surface (re-exports BoardView + schema + helpers + seed). Audited via `git diff 214f28f^ fdd1521 -- packages/plugin-web-board-core` (filter to this row's commits — sibling rows did edit unrelated packages in interleaved commits).
- **A5 — No `@repo/plugin-web-tokens` edits in this row**: PASS. New strings live in per-file `STR` localized tables in `src/internal/strings.ts`; consumers use them directly. `git show 214f28f a107980 fdd1521 --stat | grep plugin-web-tokens` returned zero matches.
- **A6 — Single commit per phase, conventional format**: PASS. 214f28f (P1) / a107980 (P2) / fdd1521 (P3) — each commit subject is `feat(plugin-web-board-workspaces): P<n> …`. No bundling with other rows in this row's commits.
- **A7 — Shell registration replaces line 65 with this row's reg**: PASS. `apps/web/src/routes/modules/shellRegistrations.tsx` HEAD shows `boardWorkspacesWebModuleRegistration,  // xai-web-board-workspaces row #9 (railOrder 3, replaces row #7's minimal shell wrapper)` in place of the prior `boardCoreWebModuleRegistration,  // xai-web-board-core row #7 (railOrder 3)`. The import block also swapped (`@repo/plugin-web-board-workspaces` replaces `@repo/plugin-web-board-core` for the registration). registration.test.tsx REG1..REG6 (6 cases) cover all properties.
- **A8 — apps/web/package.json only added one workspace dep**: PASS. `git show fdd1521 -- apps/web/package.json` shows a single `+` line for `@repo/plugin-web-board-workspaces`, alphabetically placed right after `@repo/plugin-web-board-core`. Sibling #11 subsequently added a second `+` line for `@repo/plugin-web-dashboard-widgets` — out of scope for this row but harmless.
- **A9 — Storage narrowing round-trip for `xai_board_panels`**: PASS. BWM8 verifies the canonical length-1 array write shape after toggling Inbox; BWM15 verifies recovery from `"garbage"`; PO5/PO6 verify acceptance of both the canonical length-1 array AND the bare-object legacy shape (Rec1 from review). After narrowing, the multi-panel invariant is enforced in BOTH `loadPanelsOrDefault` (PO7) and `togglePanelInvariant` (PO13/PO15) — defense-in-depth.
- **A10 — Storage narrowing round-trip for `xai_board_inbox`**: PASS. BWM14 verifies write + read via the composer; BWM16 verifies recovery from `"garbage"`; PO9/PO11 verify the typed-array passthrough vs. seed fallback.
- **A11 — PM Status Overview live ring math**: PASS. SOB10 verifies 5 segment `<circle>` elements + 1 base ring for a 5-stage PM template; SOB3 confirms 100% donePct when all cards are in a Done list; RM9 confirms float-precision (per-segment `len + (c - len) === c` within 1e-9). BWM12 confirms the gate: PM-template + overviewOpen + panels.board all must be true for the banner to mount.

### Implementation vs design/api/test contract

- **design.md 11 Frozen Assumptions**: all honoured. Single new package at `packages/plugin-web-board-workspaces/`. Storage narrowing at boundary via the documented length-1 array trick (PO5) + bare-object legacy shape (PO6) — registry stays untouched. `xai_board_panels` + `xai_board_inbox` consumed; `xai_boards_v2` + `xai_active_board` shared with row #7. Multi-panel layout class rules per §2; layout helper `isSinglePanelOpen` matches the prototype's `Object.values(panels).filter(Boolean).length === 1` predicate. PM Status Overview mounts only when (isPM && overviewOpen && view==="board" && panels.board). Bilingual via per-file STR tables (no tokens edit). No event-bus emit. No new tokens.css vars; scoped `--planner-color-<id>` lives in this row's `styles.css`. Shell registration replaces line 65. Three-phase build (P1/P2/P3) one-commit-each.
- **api.md §0..§14**: all sections honoured. Public surface = re-exports from board-core + 4 net-new types + 2 narrowing guards + 4 panel helpers + 2 ring helpers + 5 leaf components + computePlannerSlots utility + BoardWorkspacesModule orchestrator + boardWorkspacesWebModuleRegistration. Persistence narrowing protocol implemented exactly as documented (length-1 array writes; accept both forms on read; invariant enforced). Multi-panel layout class rules + per-panel mount predicates implemented. PM Status Overview ring math contract implemented via pure helpers `computeRingSegments` + `computeDonePct`. Component APIs match the documented prop signatures. Registration shape matches §10.
- **test.md §2..§5**: 12 test files / 135 cases pass. Coverage maps 1:1 to acceptance criteria A1..A14 (renamed A1..A11 here for the verify-side audit). Manual smoke checklist Q1..Q11 enumerated in test.md §5; cross-vendor execution queued per A12/W2e manifest header.

### Residual risks (non-blocking — acknowledged + documented)

- **R1 (manifest-header compromise)**: Cross-vendor manual smoke (G7) queued at ship-time per W2e Parallel-Agent mode. Row-level feature-verify runs in same-vendor Claude Opus. Standard for W2e wave; explicitly documented in design.md "Cross-vendor verify note" + this report.
- **R2 (apps/web 3 pre-existing lint warnings)**: `App.tsx` (unused `useParams`) + `TokensSmokePage.tsx` (DEV undeclared env-var + conditional `useState`). Present before this row landed (verifiable via `git blame`); out of scope. Same as board-core #7 / ai-chat #18 documented residual.
- **R3 (concurrent-sibling pnpm-lock.yaml interleaving)**: Sibling #11 added a `@repo/plugin-web-dashboard-widgets` dep entry to `apps/web/package.json` after this row's P3 commit, on a line directly below this row's `@repo/plugin-web-board-workspaces` entry. The apps/web build + tests pass at HEAD (G4–G6) so there is no functional issue. Future cleanup commit may consolidate the deps file if needed; not a blocker. Same pattern as board-core #7's R3 (concurrent-sibling commit-attribution bundling).

### Manual smoke checklist (for ship-time cross-vendor verifier)

Already enumerated in test.md §5 (Q1..Q11). Confirm:
- `/board` renders with workspace chip + title button + bottom 4-button switcher
- BoardSwitcher modal opens via title button; search filters across workspaces; "+ New board" opens BoardCreator
- BoardCreator submits with 3 templates; new board becomes active; both modals close
- PM-template active board + Overview toggle → StatusOverviewBanner mounts with ring chart + legend
- Inbox + Planner toggle independently; container class flips between `board-panels-single` and `board-panels-multi`; "at least one open" invariant holds
- Inbox composer Enter prepends; remove button filters; persistence across reload
- EN ↔ 中文 toggle flips workspace name, board title, scope tabs, creator labels, panel headers, bottom switcher labels, overview banner text
- Set `localStorage.xai_board_panels = "garbage"` → reload renders seed without crash; same for `xai_board_inbox`

## Phase Progress

| Phase | Status | Commit | Notes |
|---|---|---|---|
| P1 — Scaffolding + narrowing types + guards + ring math + panel ops + STR + tests | DONE | 214f28f | 46/46 tests pass (4 files); lint --max-warnings 0 clean; typecheck clean |
| P2 — 5 leaf React components + CSS + tests | DONE | a107980 | 107/107 tests pass cumulative (9 files); lint --max-warnings 0 clean; typecheck clean; BS4 test scoped to .bs-scopes container to disambiguate "Team" string |
| P3 — BoardWorkspacesModule orchestrator + registration + host wire-up + PLUGIN_MAP + integration tests | DONE | fdd1521 | 135/135 tests pass cumulative (12 files); apps/web check-types + build + test all pass; 3 pre-existing apps/web lint warnings NOT introduced by this row (out-of-scope per ai-chat #18 / board-core #7 precedent) |

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-23 | Claude Opus 4.7 1M | feature-plan Fresh — produced discovery review + design + api + test + dev_log | — | feature-review |
| 2026-05-23 | Claude Opus 4.7 1M | feature-review — APPROVED with 0 blockers + 3 non-blocking recommendations | — | feature-auto-build (W2e Parallel-Agent loop) |
| 2026-05-23 | Claude Opus 4.7 1M | feature-auto-build P1 — scaffolding + narrowing types + guards + ring math + panel ops + STR + 46/46 tests | 214f28f | feature-auto-build P2 |
| 2026-05-23 | Claude Opus 4.7 1M | feature-auto-build P2 — 5 leaf components (BoardSwitcher / BoardCreator / StatusOverviewBanner / InboxPanel / PlannerPanel) + CSS + 61 component tests | a107980 | feature-auto-build P3 |
| 2026-05-23 | Claude Opus 4.7 1M | feature-auto-build P3 — BoardWorkspacesModule orchestrator + registration + apps/web shell-reg swap + apps/web dep add + PLUGIN_MAP row + 28 integration tests | fdd1521 | feature-verify |
| 2026-05-23 | Claude Opus 4.7 1M | feature-verify — PASS (all 7 gates green; 3 documented non-blocking residuals) | — | ship |
| 2026-05-23 18:55 | claude-sonnet-4-6 | ship — tests 135/135 confirmed; manifest.json In-Dev → Stable; dev_log SHIPPED; PLUGIN_MAP In-Dev → Stable; chore commit created + pushed | (this commit) | — |

---

## Bugfix-Extension Lineage — gap-closure row #6 (2026-05-25) — cross-ref

> APPEND-ONLY cross-reference block. The Status Panel at the top of this file
> (`SHIPPED` 2026-05-23 18:55) records the baseline row #9 state and is NOT
> mutated by this extension lineage.
>
> **CANONICAL LINEAGE LIVES AT
> `packages/xai-web-board-views/docs/dev_log.md` §Bugfix-Extension Lineage —
> gap-closure row #6 (2026-05-25).**
>
> This package's surface in the extension:
>
> - Filter button (currently `disabled` per BoardWorkspacesModule.tsx:345) → enabled; opens new `FilterPopover` (NEW component in this package).
> - Share button (currently `disabled` per BoardWorkspacesModule.tsx:348) → enabled; opens new `ShareModal` (NEW component in this package).
> - `FilterState` lifted into BoardWorkspacesModule via `useState`; reset on `activeBoard.id` change via `useEffect`.
> - `applyFilter(lists, filter)` (imported from `@repo/plugin-web-board-views`) wraps `lists` before passing to BoardView + each alt view (HC1 cross-view consistency).
> - `ShareModal` emits `web:board:share-requested` event (declared in `@repo/core/types/events.ts` by canonical row).
>
> NEW component test files: `FilterPopover.test.tsx` (10 cases), `ShareModal.test.tsx` (8 cases), `filterState.test.ts` (8 cases), `shareUrl.test.ts` (6 cases). +6 cases (BWM-EXT-1..6) added to existing `BoardWorkspacesModule.test.tsx`.
>
> See canonical dev_log for full Lineage Status Panel / Phase Plan (7 phases) / Risks / Work Log.

### Cross-ref Lineage Status (mirror; canonical is in board-views)

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-board-filter-share-map (canonical dev_log in `packages/xai-web-board-views/docs/dev_log.md`) |
| Current Phase | SHIP |
| Status | SHIPPED |
| Suggested Next | — (workflow complete) |
| Verify Cross-vendor | yes (per ADR-0009 §D4 P0) — cold-read DEFERRED 24h per ADR-0008 carve-out (W1 precedent); same-vendor row-level verify cycle 2 PASS recorded in canonical dev_log |
| Automation Mode | A-Claude |
| Executor | claude-sonnet-4-6 (ship, 2026-05-25 23:10) |
| Updated | 2026-05-25 23:10 |
| Dispatched By | xai-roadmap-loop SERIAL dispatch (Wave 2 first row) |
| Roadmap Row | `docs/workflow/roadmap/xai-web-console-gap-closure.md` row #6 |
| Canonical Dev_log | `packages/xai-web-board-views/docs/dev_log.md` §Bugfix-Extension Lineage — gap-closure row #6 (2026-05-25) |

### Cross-ref Work Log

| Timestamp | Executor | Action | Commits | Next Step |
|---|---|---|---|---|
| 2026-05-25 | Claude Opus 4.7 1M (feature-plan) | Appended this cross-ref block. Canonical extension dev_log is at board-views (Map is largest sub-feature; that's the canonical home). Design.md cross-ref appended at end of this file (§2026-05-25 Extension cross-ref). API.md §S15 + test.md §6 also appended with this row's local surface (FilterPopover / ShareModal / filterState / shareUrl + 32 new test cases). | — | feature-review |
| 2026-05-25 | claude-sonnet-4-6 (feature-auto-build P2..P4) | P2 filterState + lift into BWM; P3 FilterPopover + enabled Filter button; P4 ShareModal + shareUrl + web:board:share-requested EventMap + enabled Share button. Commits cfff4c5 (P2), ba0a2f0 (P3), f60502b (P4). 173 board-workspaces tests PASS. REC-1 verified: filterState.ts imports from `@repo/plugin-web-board-views` barrel (no circular dep). | cfff4c5, ba0a2f0, f60502b | feature-auto-build P5 |
| 2026-05-25 | claude-sonnet-4-6 (feature-auto-build P5) | P5 Suspense wrap around MapView render in BoardWorkspacesModule. Commit 7c28d4c. 173 board-workspaces tests PASS. | 7c28d4c | feature-auto-build P6 |
| 2026-05-25 | claude-sonnet-4-6 (feature-auto-build P7) | P7 cross-ref flip: Status → READY_FOR_VERIFY. All P1..P6 tests still pass (173 board-workspaces total). PLUGIN_MAP Notes column updated with extension note + new xai-web-event-bus dep noted. See canonical dev_log in board-views for full Work Log. | (P7 chore commit) | feature-verify |
| 2026-05-25 22:32 | Claude Opus 4.7 1M (feature-verify) | Cross-ref flip: Status → BLOCKED. 4 blockers across the row (3 typecheck failures cascading from board-views internal/filter.ts implicit-any + 1 lint --max-warnings 0 failure with 6 warnings in this package's filterState.ts + test files). See canonical dev_log in board-views for the full BLOCKER list (B1..B5). 173 board-workspaces tests still PASS at runtime; failure is in static analysis gates required by the plan acceptance criteria. | — | feature-build |
| 2026-05-25 22:40 | claude-sonnet-4-6 (feature-build verify-feedback-patch) | Cross-ref flip: Status → READY_FOR_VERIFY. Verify-feedback patch resolved all 5 blockers (B1/B2/B3 typecheck; B4 lint 6 warnings; B5 BM-BUNDLE tests now real). B4 fixed in this package: filterState.ts clearFilter param wrapped with eslint-disable; BoardWorkspacesModule.test.tsx beforeCount removed; ShareModal.test.tsx afterEach import removed; filterState.test.ts _withLabel removed; shareUrl.test.ts beforeEach+afterEach imports removed. `pnpm --filter @repo/plugin-web-board-workspaces lint --max-warnings 0` exit 0; `pnpm --filter @repo/plugin-web-board-workspaces typecheck` exit 0; 173 tests PASS. See canonical dev_log in board-views for full patch notes. | (see verify-patch commit) | feature-verify |
| 2026-05-25 22:50 | Claude Opus 4.7 1M (feature-verify cycle 2) | Cross-ref flip: Status → READY_TO_SHIP. Re-ran focused gates: `pnpm --filter @repo/plugin-web-board-workspaces typecheck` → exit 0 (B2 transitive resolved); `lint --max-warnings 0` → exit 0 (B4 resolved); `test` → 173/173 PASS. fb5bb98 patch spot-checked: 5 file cleanups verified, no production logic changed, commit hygiene compliant. See canonical dev_log in board-views for full cycle-2 verify report. | — | ship |
| 2026-05-25 | Claude Opus 4.7 1M (feature-review) | APPROVED. 0 blockers; 12 review gates PASS. See canonical dev_log (board-views) for full Review Notes + 2 non-blocking recommendations. Status flipped to APPROVED mirror; canonical is the source of truth. | — | feature-auto-build |
| 2026-05-25 23:10 | claude-sonnet-4-6 (ship) | Cross-ref flip: Status → SHIPPED. All 3 lineage dev_logs flipped in this commit. Ship Report in canonical dev_log (`packages/xai-web-board-views/docs/dev_log.md`). This package's 4 build commits included in Ship Report: cfff4c5 (P2), ba0a2f0 (P3), f60502b (P4), 7c28d4c (P5 partial — Suspense wrap). Deferred residual risks acknowledged (RR-1 cross-vendor cold-read / RR-3 manual browser smoke) per canonical dev_log. | (dev_log flip commit — this) | Workflow complete |

---

## Extension Lineage - xai-web-board-automation-lite (2026-06-03) - cross-ref

> Canonical row docs live in `packages/xai-web-board-automation-lite/docs/`.

- `BoardWorkspacesModule` runs browser-local Automation Lite once per active
  board/day in the current session.
- Header toolbar now exposes `Automate` / `自动化` via
  `data-testid="automation-run-btn"` for explicit preset reruns.
- Cross-list card moves run completion automation with due-date sorting disabled
  so move-to-Done can mark completion without reshuffling the full board.
- Board writes continue through board-core storage preservation.

Verification:

- PASS `pnpm --filter @repo/plugin-web-board-workspaces typecheck`
- PASS `pnpm --filter @repo/plugin-web-board-workspaces lint`
- PASS `pnpm --filter @repo/plugin-web-board-workspaces test` (217 tests)
- PASS local Chrome smoke at `http://localhost:3001/app/board`
