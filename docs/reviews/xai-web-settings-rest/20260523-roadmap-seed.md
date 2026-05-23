# Roadmap Seed — xai-web-settings-rest

> xai-web-console roadmap · feature #24 · wave W4 · Settings (split)
> Source PRD: web design/DESIGN.md §4.12 — Account / Premium / Smart Lists / Notifications / Date & Time / More / Integrations / Collaborate / Sticky Note / Hotkeys / About
> Source Code: web design/module-settings.jsx (10 remaining panes)
> Authority: SUPERSEDES prior PRDs where they conflict (user override 2026-05-23)

## Requirement

Port the remaining 10 Settings panes: Account (avatar + name + email + upgrade/logout/delete), Premium (upgrade CTA), Smart Lists (group by region + Show / Show if not empty / Hide tri-state), Notifications (toggle + 4 completion sounds + DND window), Date & Time (week-start / lunar / week-numbers / holidays / timezone), More (Smart Recognition + Task Default + Task Template), Integrations (Featured / Calendar / Integrate 3 groups, 10+ apps), Collaborate, Sticky Note (13-color palette incl. random + font size + default-pin + 4 grid spacings), Hotkeys (10-row table), About (XAI logo + version + links).

## Hard constraints

- Each pane bilingual.
- Sticky Note 13-color palette MUST use tokens.css label/list colors (no hard-coded hex).
- Hotkeys table is read-only in this row (custom rebinding deferred to §13).
- Integrations apps are placeholder cards; no real OAuth wiring in this row.
- Account "delete" MUST be a confirm-modal (no instant destruct).

## Acceptance signal

All 10 panes render, each with its full DESIGN.md §4.12 widgets, prefs persist under `xai_pref_*`, Save & Reset work, and EN/中文 parity holds across every pane.

## Dependencies (advisory — manifest is authoritative)

Depends On: xai-web-settings-shell.
