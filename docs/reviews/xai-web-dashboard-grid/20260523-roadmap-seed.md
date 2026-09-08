# Roadmap Seed — xai-web-dashboard-grid

> xai-web-console roadmap · feature #10 · wave W2 · Module (split from dashboard)
> Source PRD: web design/DESIGN.md §4.4 — 12 列响应式 widget 网格 + FLIP 拖拽换位
> Source Code: web design/module-dashboard.jsx (grid + DnD wrapper section)
> Authority: SUPERSEDES prior PRDs where they conflict (user override 2026-05-23)

## Requirement

Port the Dashboard grid container: 12-column responsive widget layout, macOS-Stage-Manager-style drag-to-reorder with FLIP animation 380ms (other widgets smoothly make room), widget order persisted to `xai_dash_order`, and a widget-registration slot so each widget type (delivered by dashboard-widgets) can declare its grid footprint independently.

## Hard constraints

- DnD MUST use FLIP technique (not just HTML5 DnD position snap) so the visual quality matches DESIGN.md §4.4.
- Order persistence keyed by widget instance id, not type, so multiple instances of the same widget (e.g., two clocks for two timezones) can be reordered independently.
- Container must NOT know widget internals — widgets register via the slot.
- Responsive breakpoints (≥1400/1100-1400/760-1100/<760) per DESIGN.md §11 column-collapse rules.

## Acceptance signal

Dashboard route renders an empty grid, can host 3 dummy widget placeholders, drag-to-reorder triggers FLIP animation, order survives reload, and responsive breakpoints collapse correctly.

## Dependencies (advisory — manifest is authoritative)

Depends On: xai-web-shell.
