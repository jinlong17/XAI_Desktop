# desktop-local-first-offline-edit-queue - Test Strategy

## Test Goals

Prove that offline edits for representative local-first records are durably staged, observable across relaunch, retryable, conflict-safe, and rollback-safe without implementing row `#14` reconnect/cloud replay.

## Unit Coverage

### Queue Contract

- same transaction writes entity plus queue row
- failed transaction rolls back both entity and queue row
- mutation ids are deterministic or explicitly supplied
- commit sequence ordering is stable
- outbox reserved id prefix cannot collide with entity ids
- device-local records return explicit non-queueable results

### Representative Entity Staging

- `productivity.todo` put/delete queues successfully
- `productivity.habit` put/delete queues successfully
- `project.board` put/delete queues successfully
- `project.card` put/delete queues successfully
- `settings.pref`, `pet.state`, `project.workspace_state`, and `productivity.pomodoro_sessions` do not enter remote sync queue

### Retry, Conflict, Rollback

- retry count persists and increments only through queue bookkeeping
- conflict marker remains visible and blocks silent success
- rollback succeeds when current entity still matches queued local mutation
- rollback refuses when current entity diverged and marks conflict
- queue history remains after rollback

## Contract Coverage

- row `#13` does not run remote replay or acknowledgement
- queue summaries survive repo re-open/relaunch simulation
- browser runtime has no queue side effects
- row `#12` import ledger records are not rewritten by queue staging
- notes remain unsupported

## E2E / Regression Scenarios

- offline todo edit in desktop runtime -> entity plus queue row persist after relaunch
- queued card delete -> queue row contains delete op and target metadata
- retryable failure -> retry count visible and remote success is not implied
- unsafe rollback -> conflict marker, no destructive overwrite
- device-local settings write -> no sync outbox entry
- browser runtime -> no desktop queue wiring

## Mock Strategy

- `@repo/core-data/testing` in-memory repo for atomic queue tests
- `createInMemorySqliteDriver` and `createSqliteRepo` for transaction rollback parity
- `createMockCommitSeqAuthority` for deterministic commit sequence
- fake desktop runtime profile for provider wiring tests
- no network mocks because row `#14` owns reconnect/replay

## Verification Gates

- `pnpm --filter @repo/core-data test`
- `pnpm --filter @repo/core-data check-types`
- `pnpm --filter @repo/plugin-web-storage test`
- `pnpm --filter @repo/plugin-web-storage check-types`
- `pnpm --filter @repo/web test`
- `pnpm --filter @repo/web check-types`
- `pnpm --filter @repo/web build`
- `pnpm --filter desktop tauri build --debug --bundles app`

## Acceptance Criteria

| ID | Criterion |
|---|---|
| AC-1 | Account-sync entity put/delete mutations are staged atomically with queue rows |
| AC-2 | Queue rows survive relaunch/re-open simulation |
| AC-3 | Device-local records never enter remote sync queue |
| AC-4 | Retry/failure/conflict states are explicit and durable |
| AC-5 | Safe rollback works and unsafe rollback marks conflict |
| AC-6 | No row `#14` reconnect/cloud replay or acknowledgement is implemented |
| AC-7 | Browser runtime remains browser-only |
| AC-8 | Required gates pass |
