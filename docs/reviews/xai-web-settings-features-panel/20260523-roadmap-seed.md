# Roadmap Seed — xai-web-settings-features-panel

> xai-web-console roadmap · feature #23 · wave W4 · Settings (split)
> Source PRD: web design/DESIGN.md §4.12 Features pane
> Source Code: web design/module-settings.jsx (Features pane section with 8-module on/off + original SVG thumbnails)
> Authority: SUPERSEDES prior PRDs where they conflict (user override 2026-05-23)

## Requirement

Port the Settings → Features pane: 8 module on/off switches (Tasks/Board/Dashboard/Calendar/Matrix/Pomodoro/Habits/Meditation — the per-DESIGN.md set) with original SVG thumbnail previews. Toggling off a module MUST hide its rail entry and route, but preserve persisted data.

## Hard constraints

- Toggle state persisted under `xai_pref_features_*`; rail visibility driven by shell consuming these prefs via the bus.
- SVG thumbnails MUST be inline (no external image fetch) and follow the tokens.css color palette.
- A "module-disabled" deep-link MUST resolve to a friendly empty state, not a 404.
- Bilingual; toggle labels match DESIGN.md §4.12 wording.

## Acceptance signal

User toggles 4 modules off, rail re-renders without them, deep-link to a disabled module shows the empty state, reload preserves the choice, and Reset restores all 8 on.

## Dependencies (advisory — manifest is authoritative)

Depends On: xai-web-settings-shell, xai-web-tasks (ready_to_ship), xai-web-board-core (ready_to_ship), xai-web-dashboard-grid (ready_to_ship), xai-web-calendar (ready_to_ship), xai-web-matrix (ready_to_ship), xai-web-pomodoro (ready_to_ship), xai-web-habits (ready_to_ship), xai-web-meditation (ready_to_ship).
