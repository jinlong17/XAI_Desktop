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
| Updated | 2026-05-20 00:46 PDT |
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
- Cross-command transactions — TS `transaction(fn)` currently runs the
  callback against the same `Repo<T>` operations object; full atomic
  semantics require `db_transaction_begin`/`commit` commands.
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
