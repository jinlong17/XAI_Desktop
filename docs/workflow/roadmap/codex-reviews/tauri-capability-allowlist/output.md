## Codex Cross-vendor Review

**Feature**: tauri-capability-allowlist
**Commit(s)**: ad5f1d3
**Reviewer**: codex feature-review (cross-vendor) · gpt-5.4 high
**Verdict**: BLOCKED

### Strengths (max 4 bullets)
- `db_*` now has a real defense-in-depth runtime gate in [`commands/database.rs`], and the admit/reject unit tests pass (`cargo test --features crypto database::`).
- `plugin-data-database.json` is placed in the canonical `src-tauri/capabilities/` location and mirrors the intended window scope cleanly.
- The commit message and new dev log are mostly Workflow V2-compliant: clear Why/What/Scope/Risk and a roadmap row promotion to `READY_TO_SHIP`.
- The database allowlist pattern scales to future seams such as Finder and additional plugin-owned command families.

### Gaps & risks (max 6 bullets, severity-tagged)
- [P0] `secret_set` / `secret_get` / `secret_del` still have no `WebviewWindow` parameter or `ensure_*_allowed` guard in `apps/desktop/src-tauri/src/commands/keychain.rs`, yet the audit and contract now state that `secret_*` is runtime-enforced. This breaks the claimed security boundary for custom commands and invalidates the core G2.5 invariant.
- [P1] `apps/desktop/src-tauri/capabilities/AUDIT.md` is not a full audit of `lib.rs` `invoke_handler!`: it omits `sync_set_menubar_status`, `reveal_in_finder`, and `open_path`, and it incorrectly says `commands::keychain` has a window-origin check.
- [P1] `docs/contracts/tauri-commands-v0.md` overclaims that “Every JS-callable command has a runtime `ensure_*_allowed(label)` check.” `window.rs`, `menubar.rs`, and `keychain.rs` do not satisfy that today.
- [P1] Contract/code drift remains in the database section: the command table allows `main/control/grid_*/account`, while runtime and `plugin-data-database.json` also allow `console`.
- [P2] The database file header comment still says `db_*` is gated via `capabilities/default.json`; after this commit that is stale and will mislead future reviewers.
- [P2] `packages/tauri-capability-allowlist/docs/dev_log.md` still records the work-log commit as “pending commit” even though `ad5f1d3` exists.

### Concrete next-phase targets (max 6 bullets)
- Add `WebviewWindow` + `ensure_keychain_window_allowed` to all `secret_*` commands, and add admit/reject tests matching `account/control`.
- Decide whether host/window/menubar commands are true exceptions; either add runtime guards there or narrow the universal invariant wording in the contract.
- Fix `AUDIT.md` so every `invoke_handler!` command is listed exactly once with its real capability file and runtime enforcement status.
- Align `docs/contracts/tauri-commands-v0.md` with actual `db_*` scope (`console` included) and remove false claims about already-complete coverage.
- Update the stale `database.rs` module comment to reference `plugin-data-database.json` instead of `default.json`.
- Patch the dev log Work Log row to record `ad5f1d3`.

### Out of scope confirmed
- MAS signed-runtime / sandbox validation remains a deferred G0.6 / G2.7 gate.
- Live Supabase single-table sync evidence remains a separate G2.6 concern.
- Real macOS Finder smoke and future Finder/window capability shaping remain outside this G2.5 review.