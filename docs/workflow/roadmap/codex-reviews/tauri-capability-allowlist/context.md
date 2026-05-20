Feature ID: G2.5 / tauri-capability-allowlist
Branch: codex/track-a-desktop-foundation
Commit under review: ad5f1d3 (feat(tauri-capability-allowlist): add db capability file + runtime window allow-list)

Files added or changed:
- apps/desktop/src-tauri/capabilities/plugin-data-database.json (new)
- apps/desktop/src-tauri/capabilities/AUDIT.md (new — full window×command×layer audit)
- apps/desktop/src-tauri/src/commands/database.rs — DATABASE_ALLOWED_WINDOWS + ensure_database_window_allowed + checks in all 5 db_* commands + 2 new cargo tests
- docs/contracts/tauri-commands-v0.md — §6.1 cross-ref + §7 audit pointer
- packages/tauri-capability-allowlist/docs/dev_log.md (new)
- docs/workflow/roadmap/xai-g2-data-security-foundation.md row #6 → READY_TO_SHIP

Intended scope:
- Every JS-callable command has (a) a capability file declaring allowed windows and
  (b) a runtime `ensure_*_allowed(label)` defence-in-depth check.
- New capability file `plugin-data-database.json` scopes db_* to
  main/control/grid_*/account/console.
- Widget/pet/ai-cube cannot reach db_*/crypto_*/secret_* even with a mis-attached
  capability file.

Cross-vendor checklist:
1. Capability files are markers only — actual permission policy lives in the runtime
   check. Does `plugin-data-database.json` get loaded by Tauri at all (does it
   appear in tauri.conf.json capabilities array, or auto-discovered)?
2. Does `default.json` actually grant the surface to `widget_*` / `pet` / `ai_cube`
   somewhere else (e.g. inherited from a wildcard)? If so, the runtime guard is the
   only thing standing.
3. Runtime guard test coverage: 2 new cargo tests check admit/reject. Are there
   off-by-one cases (e.g. label `gridXXX` w/o underscore, label with NUL)?
4. AUDIT.md correctness: does each row in the audit table actually match the
   reality of `lib.rs` invoke_handler registration?
5. Consistency: crypto_* uses `CRYPTO_ALLOWED_WINDOWS` constant, database uses
   `DATABASE_ALLOWED_WINDOWS`. Should there be a shared helper / enum to prevent
   drift?
6. Future-proofing: when finder commands land (G3-E3) they need their own
   FINDER_ALLOWED_WINDOWS — does the pattern scale? (Note: finder.rs already exists
   in commit 533391e — that's a separate review.)
7. Doc/code alignment: §6.1 says "Every JS-callable command has a runtime
   `ensure_*_allowed(label)` check". Window commands (`create_grid_window` etc.)
   in commands/window.rs — do they actually have such a check, or only via the
   capability file?
