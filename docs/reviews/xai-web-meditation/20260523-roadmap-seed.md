# Roadmap Seed — xai-web-meditation

> xai-web-console roadmap · feature #16 · wave W2 · Module
> Source PRD: web design/DESIGN.md §4.9 (Meditation)
> Source Code: web design/module-meditation.jsx
> Authority: SUPERSEDES prior PRDs where they conflict (user override 2026-05-23)

## Requirement

Port the Meditation module: large preview card + 4 selectors (scene / clock style / ambient sound / duration), 5 scene gradients (Forest / Ocean / Night / Rain / Void), 4 clock styles (Digital / Split / Analog / Minimal — all live), and the full-screen player (rising particle animation + breathing ring 8s scale loop + progress bar + countdown + top-right exit).

## Hard constraints

- Player must be full-screen (no rail/topbar) while running; exit returns to the previous module.
- Scene gradients use the oklch values from tokens.css; no hard-coded hex.
- Ambient-sound choice persisted but actual audio source is deferred to DESIGN.md §13 (Future); land the picker UI now.
- Breathing ring + particles must run at 60fps on modern Chrome/Safari (use transforms, not layout-thrashing CSS).

## Acceptance signal

User picks scene + clock style + duration, presses Start, player goes full-screen and runs to completion or until Exit, every state choice persists, and EN/中文 parity holds.

## Dependencies (advisory — manifest is authoritative)

Depends On: xai-web-shell.
