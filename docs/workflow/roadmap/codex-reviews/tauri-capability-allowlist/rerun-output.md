## Codex Post-fix Re-review

**Feature**: tauri-capability-allowlist  
**Original verdict**: BLOCKED  
**Fix commit(s)**: 143bca5  
**Reviewer**: codex feature-review · gpt-5.4 high reasoning  
**New verdict**: APPROVED

### Was the original P0 resolved?
- Original issue (paraphrased): `secret_set` / `secret_get` / `secret_del` were JS-callable but lacked `WebviewWindow` origin injection and a runtime `ensure_*_allowed` gate, so a mis-attached capability could let disallowed windows hit Keychain.
- Evidence the fix resolves it: `KEYCHAIN_ALLOWED_WINDOWS` plus `ensure_keychain_window_allowed()` now exist in `apps/desktop/src-tauri/src/commands/keychain.rs:26`, `apps/desktop/src-tauri/src/commands/keychain.rs:32`; all three commands now take `window: tauri::WebviewWindow` and reject before any platform call at `apps/desktop/src-tauri/src/commands/keychain.rs:48`, `apps/desktop/src-tauri/src/commands/keychain.rs:63`, `apps/desktop/src-tauri/src/commands/keychain.rs:74`; the commands remain exposed through the Tauri invoke handler at `apps/desktop/src-tauri/src/lib.rs:64`; audit/contract rows now point to the concrete runtime guard at `apps/desktop/src-tauri/capabilities/AUDIT.md:31` and `docs/contracts/tauri-commands-v0.md:98`; admit/reject coverage was added at `apps/desktop/src-tauri/src/commands/keychain.rs:83` and `apps/desktop/src-tauri/src/commands/keychain.rs:94`.
- Was the resolution honest (no smuggled scope-cut or stub-only fix)? Yes. This is a real runtime behavior change in the command entrypoints, not a doc-only patch or scope deferral. The claimed targeted test command also exists and passed locally: `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml keychain::` (5/5 passing).

### Remaining gaps (max 4 bullets, severity-tagged)
- [P1] `docs/contracts/tauri-commands-v0.md:168` still overclaims that every JS-callable command has a runtime `ensure_*_allowed(label)` check; `window.rs` / `menubar.rs` do not currently implement that pattern.

### Regressions introduced (max 3 bullets)
- None observed in `143bca5`. No capability file was widened, no command surface was expanded, and the keychain-targeted tests pass.

### Next action
- If APPROVED: re-mark the manifest row to READY_TO_SHIP and move on.