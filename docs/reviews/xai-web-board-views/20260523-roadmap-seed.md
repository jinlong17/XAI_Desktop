# Roadmap Seed — xai-web-board-views

> xai-web-console roadmap · feature #8 · wave W2 · Module (split from board)
> Source PRD: web design/DESIGN.md §4.3 — Table / Calendar / Dashboard / Timeline / Map views
> Source Code: web design/module-board.jsx (Table/Calendar/Dashboard/Timeline/Map renderers)
> Authority: SUPERSEDES prior PRDs where they conflict (user override 2026-05-23)

## Requirement

Port the 5 additional Board views on top of board-core: Table (row-per-card with inline Due picker + Labels/Members multiselect + Progress column), Calendar (month grid with DnD-to-change-due), Dashboard (4 KPIs + horizontal bar chart by column/label), Timeline (30-day Gantt with left/center/right handles for start/due/move), Map (placeholder until cards get location field).

## Hard constraints

- Table's Due picker MUST include Today / Tomorrow / Next Mon quick-shortcuts per DESIGN.md §4.3.
- Calendar view DnD MUST rewrite the card's due date (same persistence path as Tasks DnD).
- Timeline three-handle DnD MUST update {start, due} atomically; bar must visually clip at view-edge.
- View switcher state persisted per board.

## Acceptance signal

User can switch a board across all 6 views (Board/Table/Calendar/Dashboard/Timeline/Map), each view renders correctly with the same cards, DnD in Table/Calendar/Timeline correctly mutates card fields, and view choice persists across reload.

## Dependencies (advisory — manifest is authoritative)

Depends On: xai-web-board-core.
