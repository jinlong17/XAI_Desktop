Feature ID: G2.2 / core-data-sqlite-driver
Branch: codex/track-a-desktop-foundation
Commit under review: f3dd30b (feat(core-data-sqlite-driver): Tauri db_* command bridge + TS createTauriRepo)

Files added or changed:
- apps/desktop/src-tauri/src/commands/database.rs (new) — db_init/db_put/db_get/db_list/db_delete commands + DatabaseState
- apps/desktop/src-tauri/src/commands/mod.rs — register module (feature-gated to `crypto`)
- apps/desktop/src-tauri/src/error.rs — adds E1300/E1301/E1302
- apps/desktop/src-tauri/src/lib.rs — registers DatabaseState + commands behind crypto feature
- packages/core-data/src/tauri-sqlite.ts (new) — createTauriRepo(invoke, { namespace }) returning Repo<T>
- packages/core-data/src/index.ts — re-export
- packages/core-data/tests/tauri-sqlite.test.ts (new) — 4 vitest with mock invoke
- docs/contracts/tauri-commands-v0.md — adds §6.1 Database Commands
- packages/core-data-sqlite-driver/docs/dev_log.md → READY_TO_SHIP
- docs/workflow/roadmap/xai-g2-data-security-foundation.md row #2 → READY_TO_SHIP

Intended scope:
- Expose CRUD that matches the TS SqliteDriver shape; one bundled-sqlcipher
  Connection owned by Tauri-managed state.
- DB file lives under app_data_dir/xai-repo-v0.db.
- Encryption (`PRAGMA key`) intentionally NOT wired (deferred to G2.4).
- Commands are feature-gated to `crypto` (the gate that activates rusqlite).

Cross-vendor checklist:
1. SqliteDriver interface in `packages/core-data/src/sqlite.ts` is the contract;
   does `createTauriRepo` satisfy it (especially `transaction(fn)` semantics)?
   The current implementation runs the callback against the same Repo<T> operations
   — is that an honest implementation or a soundness gap?
2. JSON payload is opaque to Rust — does the TS side validate payload via
   `assertRepoRecord` after parse? Confirm round-trip preserves all fields.
3. Namespace validation: `[A-Za-z0-9._:-]+` ≤128. Adequate? Any injection vector
   given the namespace flows into raw SQL via parameterized binding?
4. `DatabaseState` uses a Mutex<Option<Connection>>. Is the lock held across `await`?
   Any deadlock risk under concurrent commands?
5. Are E1300/E1301/E1302 error codes documented in api.md / contracts? Do they have
   JS-parseable prefixes?
6. Feature-gating to `crypto`: does this break default-build runtime if a plugin
   imports `createTauriRepo` and calls `db_init` without the feature enabled? What
   error surfaces?
7. Test coverage: 4 vitest + 7 cargo. Missing: concurrency, large payload, malformed
   JSON, namespace boundary cases.
8. Path resolution: `app.path().app_data_dir()` — does it propagate `E1302` on
   permission failure? On test rigs?
