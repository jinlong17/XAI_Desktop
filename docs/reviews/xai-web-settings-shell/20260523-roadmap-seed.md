# Roadmap Seed — xai-web-settings-shell

> xai-web-console roadmap · feature #21 · wave W4 · Settings (split)
> Source PRD: web design/DESIGN.md §4.12 (Settings) — chassis only
> Source Code: web design/module-settings.jsx (SettingsModule outer + Toggle/SettingRow/SectionBlock atoms)
> Authority: SUPERSEDES prior PRDs where they conflict (user override 2026-05-23). SUPERSEDES web-ticktick-parity `web-search-keyboard-theme` for the Settings surface.

## Requirement

Port the Settings outer chassis: 13-pane sidebar (Account / Premium / Features / Smart Lists / Notifications / Date & Time / Appearance / More / Integrations / Collaborate / Sticky Note / Hotkeys / About), pane-switch navigation, Save & apply / Reset to defaults footer buttons, and the atomic components (Toggle, SettingRow, SectionBlock) that the other settings rows depend on. Pane contents (other than chassis) are delivered by the three sibling rows (appearance, features-panel, rest).

## Hard constraints

- Save & apply MUST broadcast the new pref values via the event bus so live modules pick them up without reload.
- Reset to defaults MUST clear every `xai_pref_*` key and re-apply defaults via the bus.
- 13-pane sidebar bilingual; pane names match DESIGN.md §4.12.
- Atomic components (Toggle/SettingRow/SectionBlock) MUST be reusable from the sibling settings rows without prop-drilling.

## Acceptance signal

Settings module opens, all 13 panes are reachable (some may be placeholders pending sibling rows), Save/Reset buttons emit the expected events, and the atomic components have a stable typed API the sibling rows can consume.

## Dependencies (advisory — manifest is authoritative)

Depends On: xai-web-shell.
