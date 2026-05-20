## Codex Post-fix Re-review

**Feature**: single-table-sync-baseline
**Original verdict**: BLOCKED
**Fix commit(s)**: c5b0e77
**Reviewer**: codex feature-review · gpt-5.4 high reasoning
**New verdict**: APPROVED

### Was the original P0 resolved?
- Original issue (paraphrased): `enqueueOutboxEntry` claimed same-transaction rollback, but production `createTauriRepo.transaction(fn)` was only a callback wrapper, so the entity row could persist without the outbox row on the on-disk SQLite path.
- Evidence the fix resolves it: `enqueueOutboxEntry` now requires one shared repo namespace, writes entity + outbox inside one repo transaction, and rejects split repos with `E3009` (`packages/core-data/src/sync-outbox.ts:84-167`). `createTauriRepo.transaction()` now buffers writes and emits one `db_put_batch` IPC instead of per-write `db_put`/`db_delete` calls (`packages/core-data/src/tauri-sqlite.ts:148-230`). Rust `db_put_batch` validates the whole payload first, then wraps all entries in one SQLite transaction and commits once (`apps/desktop/src-tauri/src/commands/database.rs:325-402`). The contract doc now states single-namespace buffered-batch atomicity explicitly (`docs/contracts/tauri-commands-v0.md:145-150`). Tests cover the Tauri seam batching/rollback path and the shared-repo outbox invariant (`packages/core-data/tests/tauri-sqlite.test.ts:168-249`, `packages/core-data/tests/sync-outbox.test.ts:111-181`).
- Was the resolution honest (no smuggled scope-cut or stub-only fix)? Yes. The fix does not hand-wave cross-namespace atomicity; it explicitly forbids it and documents the narrowed, real contract (`packages/core-data/src/sync-outbox.ts:88-107,126-129`). I also reran the claimed commands locally: `cargo check`, `cargo check --features crypto`, `cargo test --features crypto database::`, `pnpm --filter @repo/core-data test`, `pnpm --filter @repo/core-data check-types`, and `pnpm --filter desktop build` all passed.

### Remaining gaps (max 4 bullets, severity-tagged)
- [P2] `createTauriRepo.transaction()` no longer offers read-your-writes inside the callback; that behavior change is documented, but future callers could still misuse it if they assume classic transaction visibility (`packages/core-data/src/tauri-sqlite.ts:157-161`).
- [P2] Deterministic `outbox_<mutationId>` replacement semantics still overwrite prior retry metadata for the same mutation id; that behavior remains untested/documented as an explicit product choice (`packages/core-data/src/sync-outbox.ts:65-78,142-156`).

### Regressions introduced (max 3 bullets)
- None found that re-open the original atomicity defect; the only notable behavior shift is the documented pre-commit read visibility change in Tauri transactions.

### Next action
- If APPROVED: re-mark the manifest row to READY_TO_SHIP and move on.