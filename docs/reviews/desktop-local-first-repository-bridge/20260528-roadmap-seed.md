# Roadmap Seed - desktop-local-first-repository-bridge

> Roadmap: xai-desktop-remaining-p2-p3-future
> Phase tag: P1-Phase3
> Branch: dev

## Requirement

Bridge core offline entities into the local-first repository: tasks, board, habits, pomodoro, notes, pet basic state, and local settings.

## Hard constraints

- Depend on the shipped local database foundation and use its typed repository contract.
- Do not directly import across plugin internals; use stable package exports, typed events, and repository interfaces.
- Preserve browser Web storage behavior while adding desktop local-first behavior.

## Acceptance signal

The named entities read/write through the desktop local-first repository boundary with tests or fixtures for each entity family and clear fallback behavior for unsupported surfaces.

## Dependencies (advisory - manifest is authoritative)

Depends On: `desktop-local-first-sqlite-foundation` SHIPPED.
