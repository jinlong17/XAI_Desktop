# Feature Brief - desktop-local-first-sync-reconnect

## Summary

Implement controlled reconnect replay for row `#13` offline queue entries. When network state, account state, device identity, and a replay transport are all available, the desktop runtime can drain queued `account-sync` edits through an injected transport, record acknowledgements, and mark conflicts or retryable failures without pretending unresolved edits are synced.

## Source

- Seed: `docs/reviews/desktop-local-first-sync-reconnect/20260528-roadmap-seed.md`
- Manifest: `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md`
- Upstream shipped row: `desktop-local-first-offline-edit-queue`
- Storage authority: `docs/adr/0012-phase3-local-first-storage.md`

## Problem

Row `#13` can stage local `account-sync` edits into the durable `sync.outbox`, but it intentionally stops before remote replay. The application needs a reconnect path that is strict about network/account gates, reuses the canonical queue metadata, and makes every remote outcome visible enough for verification and user-facing status.

## In Scope

- Add a reconnect replay coordinator for queued row `#13` `sync.outbox` entries.
- Require explicit preflight gates: online network, authenticated account, device identity, and replay transport availability.
- Use an injectable replay transport so tests can exercise success, duplicate acknowledgement, conflict, and retryable failure without requiring live Supabase credentials.
- Persist remote acknowledgement metadata only after transport acknowledgement.
- Mark remote revision/conflict results as `conflict`, not silent overwrite.
- Keep retryable transport/network/auth failures visible and retryable.
- Expose a small desktop/web bridge hook or runtime function for controlled smoke verification.

## Out of Scope

- Broad cloud collaboration UX.
- Pull/merge of remote records into local entities beyond the replay acknowledgement path.
- Calendar sync degraded mode.
- Backup/export/import.
- AI offline provider policy.
- Overlay/control/grid or organizer restoration.
- Hidden note-content sync.
- Real hosted Supabase provisioning, signing, or two-device hardware validation.

## Acceptance Criteria

1. A queued `account-sync` offline mutation can be replayed after all preflight gates are ready in a controlled test path.
2. Successful or duplicate transport acknowledgement records durable remote outcome metadata and removes the mutation from the pending queue view.
3. Revision mismatch or explicit remote conflict marks the mutation `conflict` and preserves the local queue entry.
4. Network/account/transport unavailable states do not mutate the queue as successful sync.
5. Existing row `#13` retry, conflict, and rollback semantics still pass.
6. Network-required account/cloud surfaces remain clearly gated when offline, unauthenticated, or unconfigured.

## Open Questions for Review

- Should the durable success state be represented by extending `OutboxQueueStatus` with `synced`, or by a separate replay-result audit record while excluding acknowledged entries from pending queue summaries?
- Should the first production adapter live in `@repo/plugin-web-storage` as a desktop bridge seam, or in `@repo/plugin-account` as a sync-engine adapter that consumes row `#13` outbox rows?
