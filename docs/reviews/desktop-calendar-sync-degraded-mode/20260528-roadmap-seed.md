# Roadmap Seed - desktop-calendar-sync-degraded-mode

> Roadmap: xai-desktop-remaining-p2-p3-future
> Phase tag: P1-Phase3
> Branch: dev

## Requirement

Keep third-party calendar sync online-only, but make it degrade cleanly offline and reconcile with local calendar state after reconnect.

## Hard constraints

- Do not pretend third-party calendar providers are local-first.
- Preserve local calendar state and clearly separate it from provider sync state.
- Reconnect reconciliation must follow the storage ADR and repository bridge semantics.

## Acceptance signal

Calendar surfaces remain usable offline for local state, provider sync actions are disabled or queued with clear messaging, and reconnect reconciliation has test or smoke evidence.

## Dependencies (advisory - manifest is authoritative)

Depends On: `desktop-local-first-repository-bridge` SHIPPED.
