# Roadmap Seed - desktop-local-first-offline-edit-queue

> Roadmap: xai-desktop-remaining-p2-p3-future
> Phase tag: P1-Phase3
> Branch: dev

## Requirement

Support offline edits and sync-log staging for local-first entities. Define retry behavior, conflict markers, and safe rollback semantics.

## Hard constraints

- Do not introduce reconnect/cloud sync behavior before queue semantics are tested.
- Follow the storage ADR's conflict model and sync-log format.
- Offline editing must be safe across relaunch and must not hide conflicts as successful sync.

## Acceptance signal

Representative edits for local-first entities can be created offline, persisted through relaunch, staged in a sync log, retried safely, and surfaced with conflict/rollback states.

## Dependencies (advisory - manifest is authoritative)

Depends On: `desktop-local-first-repository-bridge` SHIPPED.
