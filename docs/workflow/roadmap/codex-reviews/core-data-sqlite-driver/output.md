## Codex Cross-vendor Review

**Feature**: core-data-sqlite-driver
**Commit(s)**: f3dd30b
**Reviewer**: codex feature-review (cross-vendor) · gpt-5.4 high
**Verdict**: REVISE

### Strengths (max 4 bullets)
- `packages/core-data/src/tauri-sqlite.ts` respects red line #4: the Tauri seam is injected, and `@tauri-apps/api` is not imported directly.
- The Rust side keeps payload JSON opaque, while the TS read path does `JSON.parse` plus `assertRepoRecord`, so full `RepoRecord` invariants are re-checked on round-trip.
- Namespace validation is tight enough for this phase, and SQL uses bound parameters, so the namespace/id path is not an obvious injection vector.
- Workflow hygiene is good: commit message has Why/What/Scope/Risk, and the roadmap/dev_log were advanced together.

### Gaps & risks (max 6 bullets, severity-tagged)
- [P1] `createTauriRepo` claims to return `Repo<T>`, but `transaction()` is not atomic and `migrate()` always throws. That violates the frozen Repository v0 contract and would fail the canonical rollback/migration cases in `packages/core-data/tests/repository-contract.ts`.
- [P1] `docs/contracts/tauri-commands-v0.md` documents an allowed-window boundary for `db_*`, but `f3dd30b` registers the commands globally in `lib.rs` and `database.rs` has no `WebviewWindow`/runtime allow-list enforcement. The documented IPC boundary is not actually enforced in this commit.
- [P2] `packages/core-data-sqlite-driver/docs/api.md` is stale. It still documents the older `createSqliteRepo`/migration surface, not `createTauriRepo`, `dbInit`, or the new `E1300`/`E1301`/`E1302` path.
- [P2] Coverage is too shallow for the new seam: no rollback-on-throw test for the Tauri repo, no malformed JSON readback test, no crypto-disabled/default-build failure test, and no `app_data_dir`/FS error mapping test for `E1302`.
- [P2] `DatabaseState` does not hold the mutex across `await`, so deadlock risk is low, but all DB work is serialized behind one `Mutex<Option<Connection>>` and concurrency behavior is untested.

### Concrete next-phase targets (max 6 bullets)
- Add `WebviewWindow` + runtime `ensure_database_window_allowed()` checks to all `db_*` commands, and land the matching capability/audit file in the same change.
- Make `createTauriRepo` honest: either implement rollback-capable transaction/migration support or narrow the exported type/surface so it no longer claims full `Repo<T>` semantics.
- Run the canonical `packages/core-data/tests/repository-contract.ts` suite against the Tauri-backed repo seam.
- Update `packages/core-data-sqlite-driver/docs/api.md` and the contract doc so the documented JS/Rust surface matches the shipped surface exactly.
- Add negative tests for malformed JSON, namespace/id boundaries, default-build missing-command behavior, and `app_data_dir`/backend `E1302` mapping.

### Out of scope confirmed
- SQLCipher `PRAGMA key` wiring, opaque KEK-handle plumbing, and wrong-key unreadable proof remain valid deferred work for G2.4/G2.6.
- Real macOS `app_data_dir` runtime smoke and MAS/signed capability validation remain deferred gates.
- Live Supabase/outbox integration and broader sync-transaction behavior remain later roadmap rows.