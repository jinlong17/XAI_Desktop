# Tauri Capability Allowlist Audit — G2.5

Source files audited:

- `default.json` — main / control / grid_* surface.
- `plugin-account-crypto.json` — account / control crypto seam.
- `plugin-account-keychain.json` — account / control Keychain seam.
- `plugin-data-database.json` — Repository v0 SQLite seam (G2.5 addition).

## Window scopes

| Window | Capability files attached | Custom invoke_handler enforcement |
|---|---|---|
| `main` | default, plugin-data-database | host commands; database commands (window-origin check) |
| `control` | default, plugin-account-crypto, plugin-account-keychain, plugin-data-database | all custom commands |
| `grid_*` | default, plugin-data-database | window commands; database commands |
| `account` | plugin-account-crypto, plugin-account-keychain, plugin-data-database | crypto_*, secret_*, db_* |
| `console` | plugin-data-database | db_* via plugin-console (Track B) |
| `widget_*` | (none) | none — widgets must route through their owning plugin |
| `pet` | (none) | none — pet plugin owns its own state via plugin |
| `ai_cube` | (none) | none — AI commands run via control |

## Surfaced commands and enforcement layers

| Command | Capability file | Runtime allowlist constant |
|---|---|---|
| `core:window:*`, `core:event:*`, `core:webview:*` | default.json | Tauri permission system |
| `opener:default` | default.json | Tauri plugin |
| `create_grid_window` / `update_grid_window` / `close_grid_window` / `list_grid_windows` / `focus_grid_window` | default.json | `commands::window::WINDOW_ALLOWED_WINDOWS` (main, control) + gridId validation |
| `sync_set_menubar_status` | default.json | `commands::menubar::MENUBAR_ALLOWED_WINDOWS` (control, main) |
| `crypto_*` | plugin-account-crypto.json | `commands::crypto::CRYPTO_ALLOWED_WINDOWS` (account, control) |
| `secret_set` / `secret_get` / `secret_del` | plugin-account-keychain.json | `commands::keychain::KEYCHAIN_ALLOWED_WINDOWS` (account, control) |
| `db_init` / `db_put` / `db_get` / `db_list` / `db_delete` / `db_put_batch` | plugin-data-database.json (G2.5) | `commands::database::DATABASE_ALLOWED_WINDOWS` (main, control, account, console) + `grid_*` prefix |
| `reveal_in_finder` / `open_path` | default.json | `commands::finder::FINDER_ALLOWED_WINDOWS` (main, control, console) + `grid_*` prefix |

## Minimization notes

- `default.json` keeps the `core:window:*` and `core:webview:*` set used by `lib.rs::run()` for the transparent main / control / grid construction; nothing was removed because every entry corresponds to a verified caller.
- `core:event:default` is required by the cross-window event bus (`@repo/core/events`).
- `opener:default` is intentionally retained for user-initiated file/URL openers but should be revisited if plugins start using `tauri-plugin-opener` programmatically; flagged in the audit but kept for now to avoid touching G1.3 path-DnD flows.
- No window outside the allowlist can invoke `db_*` even if a future capability file widens the file scope, because the runtime `ensure_database_window_allowed` check is layered on top of the capability system. The same defence-in-depth pattern is in place for `crypto_*`, `secret_*`, `reveal_in_finder` / `open_path`, the window-lifecycle commands (`create_grid_window` and siblings), and `sync_set_menubar_status`. Other host commands (`clipboard_*`, etc.) rely on capability file scope alone for now.

## Deferred / out-of-scope for G2.5

- MAS sandbox capability validation (signed runtime smoke). Documented in
  `xai-v1.deferred-gates.md` under the G0.6 / G2.7 entries.
- `tauri-plugin-opener` minimization. Tracked as a follow-up audit.
- `widget_*` / `pet` / `ai_cube` capability files. Track B/C will create
  these when their plugins land in production scope.
