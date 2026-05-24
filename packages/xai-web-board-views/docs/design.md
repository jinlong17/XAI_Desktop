# Design Snapshot — xai-web-board-views

> Anchor docs for runtime package `@repo/plugin-web-board-views` at `packages/plugin-web-board-views/`.

## Decision snapshot

| Field | Value |
|---|---|
| Selected Option | **γ — board-views provides its own top-level `BoardModule` that composes board-core's barrel exports** (`packages/plugin-web-board-views/`) |
| Review Doc Path | `docs/reviews/xai-web-board-views/20260523-discovery-review.md` |
| Review Date | 2026-05-23 |
| Status (planning) | NEEDS_REVIEW |
| Roadmap Row | #8 (Wave W2e — Module — Parallel-Agent dispatch with #9 & #11) |
| ADR Anchor | `docs/adr/0007-xai-web-console-build-form.md` §S4 / §S5 / §S6 / §S7 / §S8 |
| PRD Anchor | `web design/DESIGN.md` §4.3 (5 additional Board views + per-board view picker) |
| Source Code | `web design/module-board.jsx` lines 527–1092 (TableView / BoardCalendarView / BoardDashboardView / TimelineView / MapView) + relevant `web design/layout.css` sections |
| Depends on | `@repo/plugin-web-board-core` row #7 (READY_TO_SHIP) — consumed via `index.ts` barrel ONLY |

## Frozen assumptions

1. Runtime package `@repo/plugin-web-board-views` at `packages/plugin-web-board-views/`. Anchor docs (this file) live at `packages/xai-web-board-views/docs/`.
2. board-core (row #7) is consumed via `@repo/plugin-web-board-core` (barrel only). NO `…/src/internal/*` imports. Enforced by `eslint.config.js` `no-restricted-imports` rule.
3. **Persistence**:
   - Reads board-core's `xai_boards_v2` + `xai_active_board` (already SHIPPED).
   - **Adds one new key** `xai_board_view_by_id` (codec `json`, default `{}`, shape `Record<string, BoardViewId>`).
   - Registry edit in `packages/plugin-web-storage/src/internal/registry.ts` — single-line addition. NO other registry changes.
4. **View id literal union**: `type BoardViewId = "board" | "table" | "calendar" | "dashboard" | "timeline" | "map";` declared in this row's `src/types.ts`.
5. **Schema preservation**: `BoardCard.start?: string` already exists in board-core schema (api.md §3). Timeline reads it. No `BoardCard.location` field is introduced — Map view stays a placeholder.
6. **Due picker quick-shortcuts** (hard constraint per DESIGN.md §4.3): `Today` / `Tomorrow` / `Next Mon`. Output format = `"M/D"` (matches Calendar's regex `/^(\d+)\/(\d+)/` and Timeline's `parseDay` on `module-board.jsx` lines 717 + 919). `Today` shortcut emits `"Today"` (en) / `"今天"` (zh) — matches `module-board.jsx` lines 723 + 919.
7. **Calendar DnD rewrites `card.due` via board-core's `updateCardInList`** — no new persistence path. Patch shape verbatim from prototype line 758: `{ due: newDue, dueEn: undefined, dueLate: false }`.
8. **Timeline three-handle DnD updates `{start, due}` atomically** — one `updateCardInList` call with `{ due: dayToStr(final.end), start: final.start === final.end ? null : dayToStr(final.start), dueEn: undefined, dueLate: false }` (verbatim from prototype lines 974–983). Mouseup-outside-grid produces NO write (tests assert this).
9. **Timeline bar clips at view-edge** (hard constraint) — implemented via clamping in `parseDay` (`Math.max(0, Math.min(days-1, …))` per prototype line 942) AND CSS `clip-path` on bars that extend past the gantt edge.
10. **Dashboard rendering**: 4 KPIs + 2 horizontal bar charts (per-list + per-label). Pure CSS divs with width percentages. NO chart library.
11. **Map view**: SVG placeholder copied verbatim from prototype lines 1056–1083. Decorative-only.
12. **View picker** persists active view per board id (hard constraint per DESIGN.md §4.3). Map keyed by board id; switching boards (future row #9) recalls each board's last view. Orphan entries for deleted boards are tolerated (documented in api.md §11; cleanup deferred to row #9).
13. **Bilingual via `lang` prop** + inline `lang === "zh" ? … : …` literals + a local 3-line `bilingual({en,zh}, lang)` helper in `src/internal/i18n.ts`. NO `useI18n` port. (Brief mentions `useI18n`; sibling rows have stopped using it — we follow board-core's `lang`-prop pattern.)
14. **Module registration replaces line 61 (board-core's array entry) of `apps/web/src/routes/modules/shellRegistrations.tsx`**: array entry changes from `boardCoreWebModuleRegistration` to `boardViewsWebModuleRegistration`. board-core's `import` line is kept (board-views consumes its exports). Single-line array edit + new import statement near the existing board-core import. railOrder 3 preserved.
15. **Three-phase build**:
    - **P1** scaffold + types + ViewPicker + TableView (incl. Due picker / Labels / Members / Progress) + Dashboard + Map + tests
    - **P2** Calendar view (DnD-to-change-due) + Timeline view (3-handle DnD) + persistence helpers + tests
    - **P3** BoardModule orchestrator + registration + apps/web wire-up + new persistence registry entry + PLUGIN_MAP + integration tests
    - Each phase = one conventional commit.

## Dependency overview

### Direct workspace deps (in `package.json`)

| Dep | Why |
|---|---|
| `@repo/core` (workspace:*) | shared `lang` type (typed re-export). |
| `@repo/plugin-web-tokens` (workspace:*) | Side-effect import of `tokens.css` (OKLCH semantic vars used in view CSS). |
| `@repo/plugin-web-storage` (workspace:*) | `usePref("xai_board_view_by_id")` + `usePref("xai_boards_v2")` + `usePref("xai_active_board")` + `PREF_REGISTRY` + `isPrefKey` (tests). |
| `@repo/plugin-web-board-core` (workspace:*) | **board-core barrel** — types (`Board`, `BoardListData`, `BoardCardData`, `BilingualText`), helpers (`updateCardInList`, `loadBoardsOrDefault`, `pickActiveBoard`, `makeDefaultBoards`), seed (`PM_LABELS`), components (`BoardView`). |
| `@repo/xai-web-shell` (workspace:*) | `WebModuleSlotRegistration` type + `useWebShell` for the route wrapper. |

### Peer deps

- `react ^19.0.0`
- `react-dom ^19.0.0`

### Dev deps (test + lint)

- `@repo/eslint-config` (workspace:*) — `react-internal` preset
- `@repo/typescript-config` (workspace:*) — `react-library.json` preset
- `@testing-library/react ^16.0.0`
- `@testing-library/jest-dom ^6.0.0`
- `jsdom ^26.0.0`
- `vitest ^3.2.1`
- `@types/react ^19.0.0`
- `@types/react-dom ^19.0.0`

### Apps/web changes (build phase scope)

- One workspace dep added to `apps/web/package.json` → `"@repo/plugin-web-board-views": "workspace:*"`.
- One-line array edit in `apps/web/src/routes/modules/shellRegistrations.tsx` (replaces `boardCoreWebModuleRegistration` array entry with `boardViewsWebModuleRegistration`; board-core's `import` line stays).
- One-line `import { boardViewsWebModuleRegistration } from "@repo/plugin-web-board-views";` near the existing board-core import.

### `@repo/plugin-web-storage` changes (build phase scope)

- One new entry in `PREF_REGISTRY`: `xai_board_view_by_id` (codec `json`, default `{}`, owner `xai-web-board-views row #8`). Single Edit in `packages/plugin-web-storage/src/internal/registry.ts`. NO migration step (new key, default value = `{}`).

## Coding red-line compliance (CLAUDE.md §Code Boundaries)

| Rule | Compliance |
|---|---|
| Business logic in `packages/plugin-*/` not `apps/*/src/` | ✅ all logic in `packages/plugin-web-board-views/src/` |
| Plugin-to-plugin via `@repo/core/events`, never direct imports | ✅ this row depends on `@repo/plugin-web-board-core` via its `index.ts` barrel ONLY — NO `…/src/internal/*` imports (eslint-enforced). Zero `@repo/core/events` channels added. |
| `index.ts` is the only public surface | ✅ tests import from package-root only; all internal modules in `src/internal/` |
| Generic UI → `packages/ui/`, business UI → owning plugin | ✅ TableView/CalendarView/DashboardView/TimelineView/MapView/ViewPicker are business components — they live here |
| Rust commands / macOS platform code | N/A — browser-only row |
| `manifest.json` aligned with runtime behavior | ✅ `manifest.json` declares `status: "In-Dev"`, `type: "ui"`, `windows: []`, `owner: "xai-web-board-views row #8"` |

## Build phase scope (preview — full Phase Plan in dev_log.md)

| Phase | Files written | Acceptance |
|---|---|---|
| P1 | `packages/plugin-web-board-views/{package,tsconfig,manifest,eslint.config,vitest.config,vitest.setup}.*` + `src/types.ts` + `src/internal/{i18n,dueShortcuts}.ts` + `src/{ViewPicker,TableView,BoardDashboardView,MapView}.tsx` + `src/styles.css` (partial — table/dash/map) + tests | lint + typecheck + tests pass |
| P2 | `src/{BoardCalendarView,TimelineView}.tsx` + `src/internal/{dateOps,persistence}.ts` + `src/styles.css` (extend — cal/timeline) + tests | lint + typecheck + tests pass; Calendar DnD round-trip works; Timeline 3-handle DnD updates {start,due} atomically |
| P3 | `src/BoardModule.tsx` + `src/registration.tsx` + `src/index.ts` + edit `apps/web/src/routes/modules/shellRegistrations.tsx` + edit `apps/web/package.json` + edit `packages/plugin-web-storage/src/internal/registry.ts` + edit `docs/PLUGIN_MAP.md` + integration tests | lint + typecheck + integration test pass; `/board` route renders board-views BoardModule; view picker switches across all 6 views; selection persists per board across reload |

## Non-goals

- Multi-board UI (board switcher) — row #9.
- Workspace switcher — row #9.
- Card detail modal — row #9.
- PM template Status Overview banner — row #9.
- Inbox / Planner side panels — row #9.
- `BoardCard.location` field + real map (would change row #7 schema + introduce a map lib) — out of scope.
- Keyboard / touch accessibility for DnD — deferred (would require a DnD library; ADR §S5 rule 10 blocks).
- Event-bus emit on view change — deferred (pure UI sink for v1, matching board-core row #7 precedent).
- Workspace-scoped labels in Dashboard — row #9 (this row uses board-core's `PM_LABELS` only).

## Cross-vendor verify note

This row is dispatched in **W2e Parallel-Agent mode** (manifest header) with concurrent siblings #9 board-workspaces and #11 dashboard-widgets. The manifest header policy queues cross-vendor verify (Codex `gpt-5.5-thinking medium` or Cursor fallback) **at ship time**, not at row-level verify. The row-level feature-verify pass is run by Claude Opus same-vendor as the planner — this is the documented same-vendor compromise per manifest header policy. feature-verify report will explicitly flag this with the standard manifest-header phrasing.
