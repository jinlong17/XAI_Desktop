# mas-sandbox-dry-run — API / Contract Notes

No runtime API, EventMap entry, Repository interface, Tauri command, entitlement, or capability is added by this work.

Compile-time feature added:

- `mas-sandbox` in `apps/desktop/src-tauri/Cargo.toml`: omits Rust-side `.transparent(true)` calls in Grid/control window builders for non-private fallback dry-runs.

Future implementation must update `docs/contracts/tauri-commands-v0.md` or ADR-0005 if it changes:
- Tauri command ownership/capability allowlist;
- `macOSPrivateApi`;
- sandbox entitlements;
- file path/security-scoped bookmark behavior.
