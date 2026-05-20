# Roadmap Seed — menubar-sync-status-icon

> sync-v1 roadmap · feature #22 · wave W1 · Phase 0.3
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-16
> Status hint: PENDING

## Requirement
Implement the 4-state menu bar icon — idle (grey) / syncing (spinning blue) / success (flash green, back to idle after 2s) / error (red, clickable) — driven by the `account:sync-started` / `account:sync-completed` / `account:sync-failed` typed events broadcast to other plugins/UI.

## Hard constraints
- FR-SY-42: exactly the 4 states above; FR-SY-45: status broadcast via `account:sync-*` typed events (already defined in PLUGIN_SDK §4.1, added to EventMap by #1).
- `account:*` events follow the strict lifecycle and one-owner rule; only plugin-account may emit them (codebase-orientation §3).
- Business logic in `plugin-account`; menu-bar shell wiring in Host is config only (red line #1, SYSTEM_ARCHITECTURE §9).
- Code boundary: `packages/plugin-account/src/` (state + emit) + menu-bar integration per codebase-orientation §6.

## Threat model binding
- T1.1 (malicious server): the error state surfaces sync/decrypt failures (e.g. tag-fail "suspicious activity" from FR-SY-09) so a tampering attempt is user-visible (PRD §2 T1.1, FR-SY-09/42).
- STRIDE Repudiation/observability across TB-7 — makes sync anomalies visible.

## Acceptance signal
Icon transitions through all 4 states on real push/pull (PRD §10.1 FR-SY-42); `account:sync-*` events received by a listener; error state clickable.

## Dependencies (advisory — manifest is authoritative)
Depends On: roadmap-kickoff (shipped)
