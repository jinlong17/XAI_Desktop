# Roadmap Seed — xai-web-settings-appearance

> xai-web-console roadmap · feature #22 · wave W4 · Settings (split)
> Source PRD: web design/DESIGN.md §4.12 Appearance pane, §7 (个性化与主题)
> Source Code: web design/module-settings.jsx (Appearance pane section)
> Authority: SUPERSEDES prior PRDs where they conflict (user override 2026-05-23)

## Requirement

Port the Settings → Appearance pane: language (EN / 简体中文), theme (Light/Dark/System), density (Comfortable/Compact), background tone (6 colors: Sage/Cream/Mist/Lavender/Peach/Graphite), accent (6 presets + full hue slider 0–360), rail position (4 directions with preview cards), font scale (85–115% slider), and the Save & apply / Reset to defaults that the shell row provides.

## Hard constraints

- Every control MUST be live-bound — moving the hue slider mutates `--accent-hue` immediately, not on Save.
- Save persists to `xai_accent_hue` / `xai_rail_pos` / `xai_bg_tone` / `xai_pref_*` exactly as DESIGN.md §9.2 names them.
- Rail-position preview cards MUST visually show the 4 layouts in mini.
- Reset to defaults MUST revert every Appearance pref to the defaults declared in DESIGN.md §5/§7.

## Acceptance signal

User flips every Appearance control, sees the live UI update, reloads, sees the choice persisted, and Reset returns the UI to defaults — all bilingual.

## Dependencies (advisory — manifest is authoritative)

Depends On: xai-web-settings-shell.
