# Roadmap Seed — xai-web-board-core

> xai-web-console roadmap · feature #7 · wave W2 · Module
> Source PRD: web design/DESIGN.md §4.3 (Project Boards) — Board view + card model
> Source Code: web design/module-board.jsx (Board view section), web design/board-data.js
> Authority: SUPERSEDES prior PRDs where they conflict (user override 2026-05-23). SUPERSEDES web-ticktick-parity row `web-project-label-calendar` for the Board surface.

## Requirement

Port the Board (Kanban) view + canonical Board/Card data model. Includes: customizable column count, 10-color column palette (green/yellow/orange/red/purple/blue/teal/lime/pink/gray), in-row "add card" affordance, drag-and-drop card across columns with persistence, and the typed Board/Card/List schema documented in DESIGN.md §9.3.

## Hard constraints

- Board + Card persisted to `xai_boards_v2` and `xai_active_board` (DESIGN.md §9.2); schema MUST match §9.3 (id, workspaceId, name:{en,zh}, cover, template, lists:[{id, key|customName, color, cards:[]}]).
- Cross-list DnD must update card position in source+target lists atomically (no orphaned cards on refresh).
- Card schema MUST carry bilingual title {en, zh}, labels[], members[], checklist {done,total}, due, start, dueLate, attach, cover.
- All visible strings go through the i18n hook.

## Acceptance signal

Board renders, columns + cards drag freely, add-card works, schema round-trips through localStorage, and bilingual cards display correctly under EN and 中文.

## Dependencies (advisory — manifest is authoritative)

Depends On: xai-web-shell.
