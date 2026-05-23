# Design — xai-web-board-workspaces

> Decision snapshot for row #9 (Wave W2e · Module) — workspace + multi-board layer that wraps the row #7 board-core view.

## Selected Option

**Option A** — Wrapper plugin `@repo/plugin-web-board-workspaces` at `packages/plugin-web-board-workspaces/` that composes `@repo/plugin-web-board-core`'s public surface (`BoardView` + schema + helpers + seed) and replaces the shell registration line that currently mounts `boardCoreWebModuleRegistration`.

## Review Doc Path

`docs/reviews/xai-web-board-workspaces/20260523-discovery-review.md`

## Review Date / Version

2026-05-23 / v1 (Fresh — first plan for this row)

## Dependency Overview

```
@repo/plugin-web-board-workspaces (NEW — this row)
   ├── depends on @repo/plugin-web-board-core (row #7, READY_TO_SHIP — public index.ts only)
   ├── depends on @repo/plugin-web-tokens (useI18n; OKLCH var tokens)
   ├── depends on @repo/plugin-web-storage (usePref on xai_board_panels + xai_board_inbox; re-reads xai_boards_v2 + xai_active_board)
   ├── depends on @repo/xai-web-shell (WebModuleSlotRegistration, useWebShell for lang)
   └── depends on @repo/core (React typed-event glue — not used directly in v1; pinned for shape parity)

Replaces in apps/web/src/routes/modules/shellRegistrations.tsx:
   - line 34..35 import block:
       OLD: import { boardCoreWebModuleRegistration } from "@repo/plugin-web-board-core";
       NEW: import { boardWorkspacesWebModuleRegistration } from "@repo/plugin-web-board-workspaces";
   - line 65 array entry:
       OLD: boardCoreWebModuleRegistration,  // xai-web-board-core row #7 (railOrder 3)
       NEW: boardWorkspacesWebModuleRegistration,  // xai-web-board-workspaces row #9 (railOrder 3, replaces row #7's minimal shell wrapper)

apps/web/package.json adds:
   "@repo/plugin-web-board-workspaces": "workspace:*"
(kept alphabetically; keeps @repo/plugin-web-board-core as a transitive workspace dep through this row)
```

## Frozen Assumptions

1. **Wrapper-plugin pattern.** Single new package `packages/plugin-web-board-workspaces/`. Board-core stays untouched (0 edits to `packages/plugin-web-board-core/`).
2. **Storage narrowing at boundary.** `xai_board_panels` (`BoardPanelState[]` of `unknown`) is narrowed via `isPanelState` to the typed shape `{ inbox: boolean; planner: boolean; board: boolean }` on read; written as `[<panel-state-object>]` (length-1 array) to satisfy the registry's array default contract. `xai_board_inbox` (`InboxCard[]` of `unknown`) is narrowed via `isInboxCardArray` to typed `{ id: string; text: { en: string; zh: string } }[]`. On rejection, fall back to seed defaults. NO registry edits.
3. **Multi-panel invariant.** At least one of `inbox / planner / board` must be `true` at all times. `togglePanel(key)` flips the requested key; if the result has all three `false`, force `board = true` (matches `module-board.jsx` line 98).
4. **Layout rule.** When exactly one panel is open, the container has class `board-panels-single` and the panel takes 100% width. When 2 or 3 are open, container has class `board-panels-multi` and panels render side-by-side with `inbox: 260px`, `planner: 320px`, `board: flex 1`.
5. **PM Status Overview.** Mounted only when `activeBoard.template === "pm"` AND `view === "board"` AND `panels.board === true` AND user toggled `overviewOpen` via the header button. SVG ring chart sums lists' card counts; each list with `cards.length > 0` contributes one `<circle>` segment. Center label shows `donePct = round(100 * done / total)` where `done = cards.length of the list whose customName matches /done|完成/`. Right legend lists each non-empty list with name + count + colored dot + total row.
6. **Bilingual via `STR` table per file.** New strings live in a `const STR = { key: { en, zh } } as const` per component file. `useI18n(lang)`'s `s(…)` is consumed ONLY for board-core-shipped keys (e.g. `s("board.add_card")` from row #7's i18n surface) — no new global i18n table entries.
7. **No event-bus emit.** Pure UI sink (ADR-0007 §S7). No new `EventMap` entries. No `@repo/core` source edits.
8. **No new CSS-var palette in `tokens.css`.** Planner-event colors (`green / blue / amber / purple`) declared as scoped `--planner-color-<id>` custom properties in this row's `src/styles.css`. List colors continue to consume board-core's `--board-list-color-<id>` vars via `LIST_COLOR_PALETTE` re-export.
9. **Shell registration anchor.** Single-line Edit on `apps/web/src/routes/modules/shellRegistrations.tsx` (one import-block swap + one array-entry swap, both keyed off unique strings). Concurrent siblings #8 (board-views) + #11 (dashboard-widgets) own disjoint anchors.
10. **Three-phase build.** P1 (scaffolding + types + narrowing + ring math + STR + pure helpers + unit tests) → P2 (5 leaf components: Switcher + Creator + StatusOverviewBanner + InboxPanel + PlannerPanel + CSS + component tests) → P3 (top-level `BoardWorkspacesModule` orchestrator + registration + apps/web shell-reg swap + apps/web/package.json dep add + PLUGIN_MAP row add + integration tests). Each phase = one commit.
11. **Cross-vendor verify queued.** Row-level `feature-verify` runs same-vendor Claude Opus per W2e Parallel-Agent mode (documented compromise). Ship-time cross-vendor manual smoke (Codex `gpt-5.5-thinking medium` / Cursor fallback) per the manifest header.

## Out of scope

- **Table / Calendar / Dashboard / Timeline / Map views** — owned by row #8 (`xai-web-board-views`). This row mounts the Kanban view ONLY in the central panel; the header's view-picker dropdown renders but is a no-op (or is hidden by feature flag `RENDER_VIEW_PICKER = false`).
- **CardDetail modal** — owned by row #8.
- **Header members chip / filter / share / dots-menu buttons** — render with the prototype's styling but with no-op handlers (UI-only; deferred).
- **Native confirm() replacement** — keep `window.confirm` for the delete affordance; future hardening to a typed modal is out of scope (R7 in discovery review).

## Cross-vendor verify note

W2e Parallel-Agent mode runs row-level `feature-verify` in same-vendor Claude Opus. Ship-time cross-vendor manual smoke is queued per manifest header — explicitly documented as a same-vendor compromise.

## Concurrent siblings

- **#8 `xai-web-board-views`** (planning concurrently, separate dev_log) — will REPLACE this row's central-panel view-picker no-op with a real view-picker that swaps Kanban/Table/Calendar/Dashboard/Timeline/Map. Write-scope disjoint (this row owns the workspace+switcher+creator+panel layout; #8 owns the central-panel renderer + view-picker dropdown).
- **#11 `xai-web-dashboard-widgets`** (planning concurrently, separate dev_log) — different rail entry; no overlap.
