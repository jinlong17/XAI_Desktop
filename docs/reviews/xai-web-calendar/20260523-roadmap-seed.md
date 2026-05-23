# Roadmap Seed — xai-web-calendar

> xai-web-console roadmap · feature #12 · wave W2 · Module
> Source PRD: web design/DESIGN.md §4.5 (Calendar)
> Source Code: web design/module-calendar.jsx
> Authority: SUPERSEDES prior PRDs where they conflict (user override 2026-05-23). SUPERSEDES web-ticktick-parity `web-project-label-calendar` for the calendar surface.

## Requirement

Port the Calendar module: 2026-05 month view with 4-color event bands (mint/amber/blue/violet), top-bar view switcher (Month / Week / Day — Month is acceptance-blocking; Week/Day may be tagged for §13 Future per DESIGN.md). Must accept deep-link from Dashboard MiniCal via `goTo('calendar', { date })`.

## Hard constraints

- Event bands must use the exact 4 oklch values for mint/amber/blue/violet from tokens.css.
- Month grid must respect week-start preference (Settings DateTime), defaulting to the Settings stored value or Sunday.
- All visible strings bilingual.

## Acceptance signal

Calendar Month view renders for current month, events display in 4 colors, deep-link from MiniCal lands on the correct day, view switcher renders all 3 tabs (Week/Day OK if stubbed with a "Coming soon" placeholder), and EN/中文 parity holds.

## Dependencies (advisory — manifest is authoritative)

Depends On: xai-web-shell.
