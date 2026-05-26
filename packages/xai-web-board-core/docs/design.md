# Design Snapshot — xai-web-board-core

> Anchor docs for runtime package `@repo/plugin-web-board-core` at `packages/plugin-web-board-core/`.

## Decision snapshot

| Field | Value |
|---|---|
| Selected Option | **A — Single-package port** at `packages/plugin-web-board-core/` |
| Review Doc Path | `docs/reviews/xai-web-board-core/20260523-discovery-review.md` |
| Review Date | 2026-05-23 |
| Status (planning) | NEEDS_REVIEW |
| Roadmap Row | #7 (Wave W2d — Module — Parallel-Agent dispatch with #10 & #20) |
| ADR Anchor | `docs/adr/0007-xai-web-console-build-form.md` §S4 / §S5 / §S6 / §S7 / §S8 |
| PRD Anchor | `web design/DESIGN.md` §4.3 (Board view + card model) + §9.3 (schema) + §9.2 (persistence keys) |
| Source Code | `web design/module-board.jsx` lines 311–476 + `web design/board-data.js` |

## Frozen assumptions

1. Runtime package `@repo/plugin-web-board-core` at `packages/plugin-web-board-core/`. Anchor docs (this file) live at `packages/xai-web-board-core/docs/`.
2. Persistence: `xai_boards_v2` (`BoardsState = unknown` at registry, narrowed to `Board[]` at component boundary) + `xai_active_board` (`string`). Both already SHIPPED in `@repo/plugin-web-storage` registry. **This row does NOT edit the registry.**
3. `xai_board_panels` / `xai_board_inbox` are reserved by row #9 (workspaces) and NOT touched here.
4. Schema matches DESIGN.md §9.3 byte-for-byte (Board / Card / List shape). Optional fields are explicitly optional.
5. 10-color palette IDs: `green | yellow | orange | red | purple | blue | teal | lime | pink | gray`. OKLCH values live in `src/styles.css` as `--board-list-color-<id>` vars (DESIGN.md §5-compliant; no hard-coded hex in TSX).
6. Bilingual via `lang: "en" | "zh"` prop. Inline literals + `bilingual({en,zh}, lang)` helper. No `useI18n` port.
7. DnD via native HTML5 `draggable` + `dataTransfer` MIME `application/x-xai-board-card`. Malformed payload ignored silently.
8. Atomic cross-list move via a single `setBoards` updater; persistence flushed via `usePref` autosave seam (debounced 200 ms).
9. **No event-bus emit.** Pure UI sink for v1. (Same pattern as ai-chat row #18.)
10. Shell slot registration replaces line 59 of `apps/web/src/routes/modules/shellRegistrations.tsx` (the existing `placeholder("board", "Boards", "kanban", 3)` line). railOrder 3 preserved. Single-line edit.
11. Three-phase build (P1 scaffold + types + helpers + tests · P2 components + DnD + persistence · P3 orchestrator + registration + host wire-up + integration test). Each phase = one conventional commit.

## Dependency overview

### Direct workspace deps (in `package.json`)

| Dep | Why |
|---|---|
| `@repo/core` (workspace:*) | TypeScript event types, shared `lang` type (typed re-exports). |
| `@repo/plugin-web-tokens` (workspace:*) | Side-effect import of `tokens.css` so OKLCH semantic vars resolve. |
| `@repo/plugin-web-storage` (workspace:*) | `usePref("xai_boards_v2")`, `usePref("xai_active_board")`, `PREF_REGISTRY`, `isPrefKey` (for tests only). |
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

- One workspace dep added to `apps/web/package.json` → `"@repo/plugin-web-board-core": "workspace:*"`.
- One-line edit in `apps/web/src/routes/modules/shellRegistrations.tsx` (replaces line 59 placeholder with named import + registration).

## Coding red-line compliance (CLAUDE.md §Code Boundaries)

| Rule | Compliance |
|---|---|
| Business logic in `packages/plugin-*/` not `apps/*/src/` | ✅ all logic in `packages/plugin-web-board-core/src/` |
| Plugin-to-plugin via `@repo/core/events`, never direct imports | ✅ this row has zero cross-plugin imports (row #7 doesn't depend on any sibling W2 plugin; #8 and #9 will depend on this one via `index.ts` only) |
| `index.ts` is the only public surface | ✅ tests import only from package-root or via path alias in `__tests__/`; all internal code in `src/internal/` |
| Generic UI → `packages/ui/`, business UI → owning plugin | ✅ BoardView / BoardList / BoardCard are business components — they live here, not in `@repo/ui` |
| Rust commands / macOS platform code | N/A — browser-only row |
| `manifest.json` aligned with runtime behavior | ✅ `manifest.json` declares `status: "In-Dev"`, `type: "ui"`, `windows: []` (browser-only — no Tauri window registration), `owner: "xai-web-board-core row #7"` |

## Build phase scope (preview — full Phase Plan in dev_log.md)

| Phase | Files written | Acceptance |
|---|---|---|
| P1 | `packages/plugin-web-board-core/{package,tsconfig,manifest,eslint.config,vitest.config,vitest.setup}.*` + `src/types.ts` + `src/internal/{listColors,boardOps,seed/board-data,isBoardArray}.ts` + tests for each | lint + typecheck + 5 unit test files pass |
| P2 | `src/{BoardCard,BoardList,BoardView,BoardModule}.tsx` + `src/styles.css` + `src/internal/persistence.ts` + component tests | lint + typecheck + 4 component test files pass; DnD round-trip works |
| P3 | `src/registration.tsx` + `src/index.ts` + edit `apps/web/src/routes/modules/shellRegistrations.tsx` + edit `apps/web/package.json` + integration test | lint + typecheck + integration test pass; `/board` route renders BoardView in `apps/web`; schema round-trips through `xai_boards_v2` |

## Non-goals

- Multi-board UI (board switcher) — row #9.
- Workspace switcher — row #9.
- View picker (Table/Calendar/Dashboard/Timeline/Map) — row #8.
- PM template Status Overview banner — row #9.
- Inbox / Planner side panels — row #9.
- Card detail modal — row #9.
- Event-bus emit — deferred (a downstream row may add).
- Touch / keyboard accessibility for DnD — deferred (would require a DnD library; ADR §S5 rule 10 blocks).

## Cross-vendor verify note

This row is dispatched in **W2d Parallel-Agent mode** (manifest header) with concurrent siblings #10 dashboard-grid and #20 statistics. The manifest header policy queues cross-vendor verify (Codex `gpt-5.5-thinking medium` or Cursor fallback) **at ship time**, not at row-level verify. The row-level feature-verify pass is run by Claude Opus same-vendor as the planner — this is the documented same-vendor compromise per manifest header policy. feature-verify report will explicitly flag this with the standard manifest-header phrasing.

---

## 2026-05-25 Extension: Card schema `location?` (gap-closure row #6) — cross-ref

> APPEND-ONLY cross-reference block. **Canonical extension design lives in
> `packages/xai-web-board-views/docs/design.md` §2026-05-25 Extension.**
>
> Single additive change in this package:
>
> - `BoardCard` gains optional `location?: { lat: number; lng: number; label?: string }`
>   in `packages/plugin-web-board-core/src/types.ts`.
> - `isBoardCard` guard in `packages/plugin-web-board-core/src/internal/isBoardArray.ts`
>   is widened **additively** to accept BOTH presence-of and absence-of the
>   `location` field. Malformed `location` (NaN / out-of-range / missing keys)
>   causes the GUARD to still pass (the field is optional); runtime view code
>   (`isValidLocation`) is the boundary that rejects malformed coords.
> - 4 new test cases in `__tests__/isBoardArray.test.ts` cover BCV1..BCV4
>   (with-location / without-location / NaN-lat / out-of-range-lng).
>
> NO breaking change. Existing 104 board-core tests pass unchanged. NO new
> persistence keys. NO new event-bus entries (that's added in `@repo/core`
> by board-workspaces). NO new external deps. The Leaflet integration lives
> entirely in `xai-web-board-views`.

Review Doc: `docs/reviews/xai-web-board-filter-share-map/20260525-discovery-review.md`
