# Roadmap Seed — xai-web-tasks

> xai-web-console roadmap · feature #6 · wave W2 · Module
> Source PRD: web design/DESIGN.md §4.2 (Tasks)
> Source Code: web design/module-tasks.jsx, web design/i18n.js (tasks namespace), web design/board-data.js (label/list data)
> Authority: SUPERSEDES prior PRDs where they conflict (user override 2026-05-23). SUPERSEDES web-ticktick-parity row `web-todo-first-slice` partially (this Tasks module replaces its UI surface; data layer hand-off TBD in plan).

## Requirement

Port the Tasks module: 2nd-level sidebar (智能清单 / 自定义清单 / 筛选器 / 标签 / 订阅日历 / 已完成 / 不做了 / 回收站), 4-column time-bucket view (Overdue / Next 7 Days / Later / No Date), task cards with checkbox + label pills + date + inbox source, and cross-column drag-and-drop that rewrites the card's due date to the target bucket (Overdue=-3d / Next7=+2d / Later=+30d / NoDate=clear).

## Hard constraints

- Cross-column DnD must show the accent-color highlight on the target column + a topbar hint per DESIGN.md §4.2.
- All Tasks state must use `usePref` against `xai_task_cols` (DESIGN.md §9.2).
- EN/中文 parity is acceptance-blocking — every visible string goes through the i18n hook.
- Real-browser verification: open Tasks tab, drag a card across all 4 columns, reload, confirm date rewrite + position persisted.

## Acceptance signal

Tasks module renders inside the shell, all 4 columns + sidebar work, DnD rewrites dates per DESIGN.md, persistence round-trips, and EN ↔ 中文 toggle flips every string.

## Dependencies (advisory — manifest is authoritative)

Depends On: xai-web-shell.
