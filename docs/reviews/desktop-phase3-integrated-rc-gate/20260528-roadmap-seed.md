# Roadmap Seed - desktop-phase3-integrated-rc-gate

> Roadmap: xai-desktop-remaining-p2-p3-future
> Phase tag: P1-Phase3
> Branch: dev

## Requirement

Run the integrated Phase 3 RC gate: offline create/edit/relaunch for tasks, board, habits, pomodoro, notes, pet state, and settings; reconnect sync smoke; backup/restore smoke; AI/calendar degraded behavior.

## Hard constraints

- Do not start before Phase 3 implementation rows are READY_TO_SHIP or SHIPPED.
- Keep verification focused on local-first behavior, reconnect semantics, backup/restore, and degraded online-only surfaces.
- Do not run `ship`; produce READY_TO_SHIP evidence for human-triggered ship only.

## Acceptance signal

An integrated RC evidence report covers all Phase 3 surfaces and classifies any residual risks before P3+ Future rows can unlock.

## Dependencies (advisory - manifest is authoritative)

Depends On: all Phase 3 implementation rows READY_TO_SHIP or SHIPPED.
