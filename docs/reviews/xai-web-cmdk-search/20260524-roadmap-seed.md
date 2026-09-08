# Seed Brief — xai-web-cmdk-search

| 字段 | 值 |
|---|---|
| Roadmap | docs/workflow/roadmap/xai-web-console-gap-closure.md row #3 (W1) |
| 父 Brief | docs/reviews/web-priority-pivot-and-repo-cleanup/20260524-gap-closure-source.md §Gap 2 |
| 父 ADR | ADR-0009 §D2-G3 |
| 候选包 | NEW packages/xai-web-cmdk + modify packages/xai-web-shell (topbar input → trigger) |

## Requirement (1-3 sentences)

Build a global Cmd+K command palette overlay that searches across all 11 rail modules' content (tasks, board cards, dashboard widgets, calendar events, matrix items, pomodoro sessions, habits, meditation scenes, countdowns, statistics, settings panes) + module-level jump. Replace the existing readOnly input in `xai-web-shell` topbar with a clickable button that opens the palette. Keyboard-first UX (arrow nav + Enter to jump + Esc to close).

## Hard Constraints

- New package: `packages/xai-web-cmdk/` registered as a `xai-web-*` module (NOT a rail entry — overlay only, no railOrder).
- Search index lives in-memory only — built on-demand by reading each module's `usePref` state on overlay open. No new localStorage keys.
- Per-module search adapters: each adapter is a pure function `(query: string, state: ModuleState) => SearchHit[]` registered via a typed `xai-web-cmdk-registry`. 11 adapters total (one per rail module) — co-located in the cmdk package as `adapters/`.
- Emit `web:search:invoked` event on open, `web:search:jump` event on Enter. Both typed in `xai-web-event-bus` (extend its EventMap).
- Keyboard contract: Cmd+K (mac) / Ctrl+K (win/linux) global; Esc closes; ↑/↓ navigates; Enter jumps; Cmd+Enter opens in new tab (not applicable for SPA, document as no-op for v1).
- DESIGN.md §6 frozen UI: palette must visually match the spec (centered modal, blur backdrop, monospace input).
- Per ADR-0009 D4: P0 work.

## Acceptance Signal

- Cmd+K opens palette from any `/app/*` route within 100ms (no async data fetch on open).
- Typing "tomato" finds all pomodoro sessions whose label contains it; pressing Enter jumps to `/app/pomodoro` and (if applicable) scrolls to the matching session.
- 11/11 module adapters present + tested (pure-function unit tests).
- `xai-web-shell` topbar button accessible by keyboard (Tab navigation).
- Verify Cross-vendor: Codex cold-read confirms no XSS in search highlight rendering (HTML-escape all user-content matches).
