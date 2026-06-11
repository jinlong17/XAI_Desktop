# Feature Brief - desktop-local-first-offline-edit-queue

## Requirement

Implement offline edit queue and durable sync-log staging for representative local-first entities in the desktop runtime. Offline edits must persist across relaunch, carry retry/conflict/rollback state, and remain visibly unsynced until a later reconnect row performs cloud replay.

## Context

- Roadmap: `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md`
- Row: `#13`
- Seed: `docs/reviews/desktop-local-first-offline-edit-queue/20260528-roadmap-seed.md`
- Dependency baseline:
  - row `#11` `desktop-local-first-repository-bridge` is `SHIPPED`
  - row `#12` `desktop-local-first-web-data-migration` is `SHIPPED`
- Storage authority: `docs/adr/0012-phase3-local-first-storage.md`

## In Scope

- Queue/stage `account-sync` entity mutations against the row `#11` canonical repo records.
- Keep entity writes and queue rows durable in the same repository transaction.
- Add explicit mutation states for queued, retryable failure, conflict, rollback pending, rolled back, and replay deferred.
- Add safe rollback semantics that can undo a still-local queued edit without hiding conflicts.
- Expose observable local queue summaries for the desktop runtime and tests.
- Preserve browser runtime behavior.

## Out of Scope

- No row `#14` reconnect/cloud replay or remote acknowledgement.
- No row `#16` calendar degraded mode.
- No row `#17` backup/export/import or snapshot UX.
- No new browser import/migration behavior.
- No hidden note-content model.
- No overlay/control/grid/organizer restoration.

## Acceptance Signals

- Representative `account-sync` edits can be staged offline, survive relaunch, and appear in a durable queue/sync log.
- Device-local records are not queued for remote sync.
- Queue entries retain retry/conflict/rollback state and never pretend remote sync succeeded.
- Rollback is safe, auditable, and refuses to erase local state when the entity has diverged.
- Verification gates for `@repo/core-data`, `@repo/plugin-web-storage`, `@repo/web`, and the desktop bundle pass.

## Review Questions

- Should row `#13` extend the existing `sync.outbox` contract in place, or add a small sidecar queue-state record for retry/conflict/rollback metadata?
- Is local conflict marking in this row sufficient if remote conflict detection is deferred to row `#14`?
- Which surfaces should be representative for build: productivity todos/habits and project boards/cards only, or include settings/pet/pomodoro device-local non-queueable assertions?
