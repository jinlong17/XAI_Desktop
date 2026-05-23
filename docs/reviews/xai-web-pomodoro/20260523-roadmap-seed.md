# Roadmap Seed — xai-web-pomodoro

> xai-web-console roadmap · feature #14 · wave W2 · Module
> Source PRD: web design/DESIGN.md §4.7 (Pomodoro)
> Source Code: web design/module-pomodoro.jsx
> Authority: SUPERSEDES prior PRDs where they conflict (user override 2026-05-23). SUPERSEDES web-ticktick-parity `web-productivity-habits-pomodoro` for the Pomodoro surface.

## Requirement

Port the Pomodoro module: circular timer with live second hand, Start / Pause / Resume / End controls, right-rail of 4 overview cards (today / week / streak / total), and a focus-session history list. Session results contribute to Statistics + Dashboard mini-pomodoro widget.

## Hard constraints

- Timer must keep accurate time across tab-blur (use absolute timestamps, not setInterval-only).
- Completed sessions persisted (key TBD — propose `xai_pomodoro_sessions`).
- Notifications fire at session-end per Settings Notifications pane (the panel may not exist yet — gate on its presence).
- All strings bilingual.

## Acceptance signal

Pomodoro runs end-to-end (25/5 default), pause+resume preserves remaining time, finish writes a session record visible in the history list and read by Statistics + Dashboard.

## Dependencies (advisory — manifest is authoritative)

Depends On: xai-web-shell.
