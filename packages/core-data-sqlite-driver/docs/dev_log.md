# core-data-sqlite-driver — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | core-data-sqlite-driver |
| Title | G2.2 SQLite/SQLCipher driver PoC |
| Roadmap | xai-g2-data-security-foundation · feature #2 · G2.2 |
| Status | READY_TO_SHIP |
| Current Phase | VERIFY |
| Suggested Next | manual ship only; continue roadmap (G2.3 / G2.4) |
| Automation Mode | D-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-build + feature-verify (Claude Code, Track A) |
| Updated | 2026-05-20 02:13 PDT |
| Blockers | SQLCipher PRAGMA path deferred to G2.4 KEK handle publication; cross-vendor verify deferred in serial mode |

## Phase Plan

### Phase 1 — Tauri command bridge + TS driver

Status: DONE.

- Added `apps/desktop/src-tauri/src/commands/database.rs` with
  `db_init`/`db_put`/`db_get`/`db_list`/`db_delete` commands.
- Added `E13xx` family to `error.rs`: `E1300` not initialized,
  `E1301` invalid input, `E1302` backend.
- Registered commands and `DatabaseState` in `lib.rs`, gated behind
  the existing `crypto` feature so `rusqlite` stays optional.
- Added TS factory `packages/core-data/src/tauri-sqlite.ts` exposing
  `createTauriRepo(invoke, { namespace })` returning a `Repo<T>` shape
  bound to the Tauri command surface; never imports `@tauri-apps/api`.
- Updated `docs/contracts/tauri-commands-v0.md` with the new §6.1
  Database Commands surface.

### Phase 2 — Verify and reconcile

Status: DONE.

- `cargo check --features crypto`: PASS.
- `cargo test --features crypto database::`: 7/7 PASS.
- `pnpm --filter @repo/core-data test`: 49/49 PASS (including the new
  4-test `tauri-sqlite.test.ts` suite that mocks `invoke`).
- `pnpm --filter @repo/core-data check-types`: PASS.
- `pnpm --filter desktop build`: PASS (existing Vite chunk warning).

Deferred / out-of-scope for G2.2:

- SQLCipher `PRAGMA key` application — already exercised in
  `apps/desktop/src-tauri/src/crypto/sqlcipher.rs`; will be wired into
  `db_init` after G2.4 publishes the opaque KEK handle.
- Cross-command transactions — superseded 2026-05-20 by `db_put_batch`
  + the `createTauriRepo.transaction(fn)` buffered-batch shim. Writes
  inside a transaction now commit as one SQLite `BEGIN`/`COMMIT`. Reads
  inside a transaction still observe the pre-transaction state (no
  read-after-write inside the same tx) — that limitation is documented
  in the TS factory's doc comment.
- Real `app_data_dir` runtime verification on macOS — needs a
  Tauri-host integration test; deferred under unattended mode.

## Verification Notes

feature-verify (Claude Code, Track A), 2026-05-20 00:46 PDT. Verdict: READY_TO_SHIP.

The Repository v0 contract from G2.1 is now reachable end-to-end from
the TS side via a Tauri command bridge backed by a real on-disk SQLite
database. Encryption and full transactional semantics remain on the
G2.4/G2.6 roadmap.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-19 03:25 PDT | Codex serial autorun | Added SQLite driver boundary, namespace repo, mutation hook, localStorage migration, in-memory SQLite test driver, and `@repo/core-data/testing` subpath export. | — | Real SQLCipher/Tauri binding deferred |
| 2026-05-20 00:46 PDT | feature-build + feature-verify (Claude Code, Track A) | Implemented `commands/database.rs`, error variants, lib.rs registration, TS `createTauriRepo` factory, and contract doc §6.1. 7 cargo tests + 4 vitest tests passing; cargo check (default + crypto) and desktop build green. | pending commit | manual ship only; continue roadmap |
| 2026-05-20 02:13 PDT | bug-fix (Claude Code, Track A) | P0 G2.6 atomicity fix: added `db_put_batch` Tauri command (BEGIN/COMMIT around N puts+deletes in one namespace), rewired `createTauriRepo.transaction(fn)` to buffer writes and dispatch them through `db_put_batch`. Adds the `E13xx` validation contract: the whole batch rolls back on any per-entry failure. 13 cargo database tests (4 new batch cases) + 66 core-data vitest cases (incl. new `tauri-sqlite` buffer/rollback + real SQLite sabotage) all green. | `cargo check`, `cargo check --features crypto`, `cargo test --features crypto database::`, `pnpm --filter @repo/core-data test`, `pnpm --filter @repo/core-data check-types`, `pnpm --filter desktop build` — all PASS. | continue roadmap |
