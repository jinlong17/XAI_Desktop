# Roadmap Seed — xai-web-habits

> xai-web-console roadmap · feature #15 · wave W2 · Module
> Source PRD: web design/DESIGN.md §4.8 (Habits)
> Source Code: web design/module-habits.jsx
> Authority: SUPERSEDES prior PRDs where they conflict (user override 2026-05-23). SUPERSEDES web-ticktick-parity `web-productivity-habits-pomodoro` for the Habits surface.

## Requirement

Port the Habits module: weekly check-off list with detail panel (4 stat cards: month check count / cumulative / month rate / streak), 6/365 progress bar, month calendar with check marks, and a habit-diary text area per habit.

## Hard constraints

- Check-in toggle MUST be one-tap and persist immediately to localStorage.
- Streak calculation handles missed days correctly (zero-out on skip).
- Diary text persisted per habit + per date.
- All strings bilingual; date headers respect Settings week-start.

## Acceptance signal

User can add a habit, toggle today/past-week check marks, the 4 stat cards recalc live, streak/365 progress is correct, and diary entries round-trip.

## Dependencies (advisory — manifest is authoritative)

Depends On: xai-web-shell.
