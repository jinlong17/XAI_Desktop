# Roadmap Seed - desktop-local-first-sync-reconnect

> Roadmap: xai-desktop-remaining-p2-p3-future
> Phase tag: P1-Phase3
> Branch: dev

## Requirement

When network/account services are available, sync local edits after reconnect. Account/cloud collaboration remains explicitly network-required.

## Hard constraints

- Do not weaken the offline edit queue's conflict, retry, or rollback guarantees.
- Keep account/cloud collaboration gated on network availability and account state.
- Sync must be observable enough for verification and user-facing failure semantics.

## Acceptance signal

Queued offline edits sync after reconnect in a controlled test/smoke path, conflicts are marked rather than silently overwritten, and network-required surfaces remain clearly gated.

## Dependencies (advisory - manifest is authoritative)

Depends On: `desktop-local-first-offline-edit-queue` SHIPPED.
