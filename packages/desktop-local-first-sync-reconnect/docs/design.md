# desktop-local-first-sync-reconnect - Design

## Decision

Use the existing row `#13` `sync.outbox` queue as the reconnect source of truth and add a bounded replay coordinator with explicit preflight gates. The coordinator accepts an injected transport, processes pending queue rows in commit sequence order, and persists each remote outcome through the same durable repo seam.

## Scope Boundaries

| Area | Decision |
|---|---|
| Queue ownership | `@repo/core-data` remains the durable queue/status owner. |
| Transport | Injected interface; mock transport is required for tests. Live account/cloud transport is optional and gated. |
| Success | Only a transport acknowledgement or duplicate result can mark a mutation synced. |
| Conflict | Remote revision mismatch/conflict sets `queueStatus = "conflict"` and preserves the queued mutation. |
| Retry | Network/account/transport failures stay retryable or deferred; they never become success. |
| Pull/merge | Deferred. This row pushes queued local edits and records outcomes only. |

## Preflight Gates

Replay can start only when all gates are satisfied:

- `network`: caller says online and transport calls are allowed.
- `account`: authenticated account id is available.
- `device`: device id is available.
- `transport`: replay transport is configured.
- `queue`: at least one pending mutation exists for the boundary key.

The engine must return a structured preflight status for each failure instead of throwing or mutating queue rows.

## Queue Status Model

Build should choose one durable success representation during implementation:

- Preferred: add `synced` to `OutboxQueueStatus` with `ackedAt`, `remoteRevision`, and optional `remoteCommitSeq` fields.
- Acceptable fallback: add `sync.replay_result` audit rows and exclude acknowledged mutation ids from pending summaries.

In both variants, pending queue listing must include only unresolved statuses: `queued`, `replay_deferred`, `retryable_failure`, `conflict`, and `rollback_pending` as appropriate. `rolled_back` and acknowledged entries are audit history, not pending sync work.

## Replay Algorithm

1. Run preflight.
2. Read `listOfflineQueueMutations` for the account boundary and bounded limit.
3. Skip `rollback_pending`, `rolled_back`, and already acknowledged rows.
4. For each mutation, call `transport.replayMutation(row, context)`.
5. On `acknowledged` or `duplicate`, persist success metadata.
6. On `conflict`, call the row `#13` conflict marker and preserve local data.
7. On `retryable_failure`, increment retry count and persist failure code/message.
8. Stop on configured batch limit or fatal preflight failure.
9. Return a run summary for UI/debug smoke: attempted, acknowledged, conflicted, retryable, deferred.

## Runtime Integration

The desktop/web integration should be deliberately thin:

- read account/device state from `web-auth-device-session` / `AppProviders` runtime snapshots;
- read network readiness from an injected predicate or browser online event listener;
- create a replay transport only when account and endpoint configuration are present;
- expose a controlled smoke helper for tests/manual checks;
- keep desktop offline/unconfigured modes visibly gated.

## Phase Plan

### Phase 1 - Replay contract and status transitions

- Add replay preflight types and transport result types.
- Add success/failure/conflict status transition helpers.
- Decide and implement the durable acknowledgement representation.

Exit gates:

- `pnpm --filter @repo/core-data test`
- `pnpm --filter @repo/core-data check-types`

### Phase 2 - Bounded reconnect replay runner

- Implement deterministic batch replay over `sync.outbox`.
- Preserve commit-sequence ordering.
- Handle ack, duplicate, conflict, retryable failure, and transport unavailable outcomes.

Exit gates:

- `pnpm --filter @repo/core-data test`
- `pnpm --filter @repo/plugin-account test` if an account adapter is touched

### Phase 3 - Desktop/web bridge and gating

- Wire a thin runtime bridge only where account/network context is already available.
- Keep offline/unconfigured/account-required states clear.
- Add controlled mock transport smoke path without live Supabase credentials.

Exit gates:

- `pnpm --filter @repo/plugin-web-storage test`
- `pnpm --filter @repo/web-auth-device-session test` if session/provider gates are touched
- `pnpm --filter @repo/web test`

### Phase 4 - Cross-stack verification and scope audit

- Rerun touched package type checks and web/desktop build gates.
- Confirm row `#13` retry/conflict/rollback tests still pass.
- Confirm row `#16`, row `#17`, AI, overlay, and hidden-note scope did not leak in.

Exit gates:

- `pnpm --filter @repo/core-data test`
- `pnpm --filter @repo/core-data check-types`
- `pnpm --filter @repo/plugin-web-storage test`
- `pnpm --filter @repo/plugin-web-storage check-types`
- `pnpm --filter @repo/web test`
- `pnpm --filter @repo/web check-types`
- `pnpm --filter @repo/web build`
- `pnpm --filter desktop tauri build --debug --bundles app`

## Explicit Deferrals

- Live two-device hosted Supabase smoke.
- Remote pull/merge engine.
- Calendar sync degraded mode.
- Backup/export/import.
- AI local/offline model support.
- Overlay/control/grid or organizer restoration.
