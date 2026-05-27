# Tauri Capability Allowlist Audit — G2.5

Source files audited:

- `default.json` — Phase 1 `main` window surface.
- `plugin-account-crypto.json` — Phase 1 parked capability (main-only binding).
- `plugin-account-keychain.json` — Phase 1 parked capability (main-only binding).
- `plugin-data-database.json` — Phase 1 main-window SQLite seam.

## Window scopes

| Window | Capability files attached | Custom invoke_handler enforcement |
|---|---|---|
| `main` | default, plugin-account-crypto, plugin-account-keychain, plugin-data-database | host commands; database commands (window-origin check); account crypto/keychain commands remain runtime-denied on `main` by handler allowlists |
| `control` | (none in Phase 1 capability scope) | runtime allowlists still exist in command handlers but no active capability binding |
| `grid_*` | (none in Phase 1 capability scope) | legacy window lifecycle commands are unregistered from active `invoke_handler` |
| `account` | (none in Phase 1 capability scope) | runtime allowlists still exist in command handlers but no active capability binding |
| `console` | (none in Phase 1 capability scope) | legacy console window lifecycle commands are unregistered from active `invoke_handler` |
| `widget_*` | (none) | none — widgets must route through their owning plugin |
| `pet` | (none) | none — pet plugin owns its own state via plugin |
| `ai_cube` | (none) | none — AI commands run via control |

## Surfaced commands and enforcement layers

| Command | Capability file | Runtime allowlist constant |
|---|---|---|
| `core:event:default` | default.json | Tauri permission system |
| `opener:default` | default.json | Tauri plugin |
| `sync_set_menubar_status` | default.json | `commands::menubar::MENUBAR_ALLOWED_WINDOWS` (control, main) |
| `crypto_*` | plugin-account-crypto.json | `commands::crypto::CRYPTO_ALLOWED_WINDOWS` (account, control) |
| `secret_set` / `secret_get` / `secret_del` | plugin-account-keychain.json | `commands::keychain::KEYCHAIN_ALLOWED_WINDOWS` (account, control) |
| `db_init` / `db_put` / `db_get` / `db_list` / `db_delete` / `db_put_batch` | plugin-data-database.json (G2.5) | `commands::database::DATABASE_ALLOWED_WINDOWS` (main, control, account, console) + `grid_*` prefix |
| `reveal_in_finder` / `open_path` | default.json | `commands::finder::FINDER_ALLOWED_WINDOWS` (main, control, console) + `grid_*` prefix; plus `BookmarkRegistry` lookup (G3-E3 P0 — honest provenance) |
| `register_path_bookmark` / `clear_path_bookmark` | default.json | `commands::bookmarks::BOOKMARK_ALLOWED_WINDOWS` (main, control, console) + `grid_*` prefix; mirrors `FINDER_ALLOWED_WINDOWS` so only surfaces that can call `reveal_in_finder` / `open_path` can authorize the underlying paths |
| `generate_file_thumbnail` | default.json | `commands::thumbnail::THUMBNAIL_ALLOWED_WINDOWS` (main, control, console) + `grid_*` prefix; plus `BookmarkRegistry` lookup and `validate_user_path` shape gate before `qlmanage` generation |

## Minimization notes

- Phase 3 narrows capabilities to the Phase 1 main-window-only scope. Legacy `control` / `grid_*` / `console` / `account` window bindings were removed from active capability files.
- Legacy grid/console window lifecycle commands remain compiled in `commands/window.rs` but are no longer registered in `lib.rs::run()` `invoke_handler`, so they are not part of the active native surface.
- `core:event:default` is retained on `default.json` for the typed cross-window event layer (`@repo/core/events`) and existing host event hooks.
- `opener:default` is intentionally retained for user-initiated file/URL openers but should be revisited if plugins start using `tauri-plugin-opener` programmatically; flagged in the audit but kept for now to avoid touching G1.3 path-DnD flows.
- No window outside the allowlist can invoke `db_*` even if a future capability file widens the file scope, because the runtime `ensure_database_window_allowed` check is layered on top of the capability system. The same defence-in-depth pattern is in place for `crypto_*`, `secret_*`, `reveal_in_finder` / `open_path`, `generate_file_thumbnail`, and `sync_set_menubar_status`. Other host commands (`clipboard_*`, etc.) rely on capability file scope alone for now.

## Deferred / out-of-scope for G2.5

- MAS sandbox capability validation (signed runtime smoke). Documented in
  `xai-v1.deferred-gates.md` under the G0.6 / G2.7 entries.
- `tauri-plugin-opener` minimization. Tracked as a follow-up audit.
- `widget_*` / `pet` / `ai_cube` capability files. Track B/C will create
  these when their plugins land in production scope.
