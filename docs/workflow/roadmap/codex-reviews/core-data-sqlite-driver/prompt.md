# Codex Feature Post-merge Review

You are acting as the `feature-review` subagent (Codex inline, cross-vendor verify pass).
Your job is to audit a Track A feature that has already been built and committed to
`codex/track-a-desktop-foundation`. The original executor was Claude Code; you provide an
independent cross-vendor verdict.

## Hard output contract

Output ONLY the markdown block below — no preamble, no follow-up, no chatter. Keep total
length under 600 words.

```md
## Codex Cross-vendor Review

**Feature**: core-data-sqlite-driver
**Commit(s)**: f3dd30b
**Reviewer**: codex feature-review (cross-vendor) · gpt-5.4 high
**Verdict**: APPROVED | REVISE | BLOCKED

### Strengths (max 4 bullets)
- …

### Gaps & risks (max 6 bullets, severity-tagged)
- [P0|P1|P2] …

### Concrete next-phase targets (max 6 bullets)
- …

### Out of scope confirmed
- …
```

## How to evaluate

1. Read the listed dev_log and contract docs to understand the *intended* scope.
2. Run `git show --stat f3dd30b` mentally — review the diff for the listed files.
3. Score against:
   - **Contract integrity** (red lines #4 / #8 / #9 in `docs/SYSTEM_ARCHITECTURE.md` §4)
   - **Test coverage adequacy** (boundary, error, concurrency, capability)
   - **Doc-code alignment** (`docs/contracts/*` matches actual surface)
   - **Security boundary** (raw key bytes, capability allow-list, IPC payload)
   - **Workflow V2 hygiene** (dev_log Status Panel, Work Log row, commit message Why/What/Scope/Risk)
   - **Future-proofing** (does the design accommodate the next 1-2 G2/G3 rows?)
4. Verdict guidance:
   - **APPROVED**: ship-ready; gaps are P2-only and recorded.
   - **REVISE**: at least one P1 issue worth fixing before next phase.
   - **BLOCKED**: at least one P0 issue (broken contract, missing test on critical path, security regression).
5. Concrete next-phase targets must be small, mergeable items (each ≤ half a day).
6. Out-of-scope: confirm which deferred gates remain valid (live Supabase, MAS sandbox, real
   macOS Finder smoke, etc.) — call them out so the next agent does not re-investigate.

## Feature-specific context

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
