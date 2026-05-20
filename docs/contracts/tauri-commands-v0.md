# Tauri Commands Contract v0

| 字段 | 值 |
|---|---|
| Owner | Desktop Host |
| Source | `apps/desktop/src-tauri/src/commands/*` |
| 状态 | Draft |
| 适用 | Desktop app, plugins via `@repo/core` adapters |

## 1. 原则

- Plugin 不直接调用 `@tauri-apps/api`。
- Plugin 通过 `@repo/core` 的 adapter/hook 调用 host capability。
- Rust command 必须有 owner、allowed windows、input、output、error code。
- Capability allowlist 是安全边界的一部分,不是生成物。
- Raw key、access token、raw DEK 不跨 JS/Rust IPC。

## 2. Window Labels

| Window | Label |
|---|---|
| Main | `main` |
| Control | `control` |
| Grid | `grid_{gridId}` |
| Console | `console` |
| Account | `account` |
| Widget | `widget_{widgetId}` |
| Pet | `pet` |

Rust 是 label 生成权威。TS 侧不能手写除 public helper 以外的 label 拼接。

## 3. Window Commands

| Command | Owner | Allowed windows | Input | Output |
|---|---|---|---|---|
| `create_grid_window` | organizer/host | `main`,`control` | `{ gridId, rect }` | `GridWindowSnapshot` |
| `update_grid_window` | organizer/host | `main`,`control`,`grid_*` | `{ gridId, rect }` | `GridWindowSnapshot` |
| `close_grid_window` | organizer/host | `main`,`control`,`grid_*` | `{ gridId }` | `void` |
| `list_grid_windows` | organizer/host | `main`,`control` | `void` | `GridWindowSnapshot[]` |
| `focus_grid_window` | organizer/host | `main`,`control` | `{ gridId }` | `GridWindowSnapshot` |

Target G1 output type:

```ts
interface GridWindowSnapshot {
  gridId: string;
  label: `grid_${string}`;
  rect: Rect;
  visible: boolean;
}
```

G1.1 implementation notes:

- Rust is the only label generation point via `grid_{gridId}`.
- Invalid `gridId` values return `INVALID_GRID_ID`.
- Missing windows return `WINDOW_NOT_FOUND`.
- Native window failures return `WINDOW_NATIVE_ERROR`.

## 4. File / Open Commands

| Command | Owner | Allowed windows | Input | 说明 |
|---|---|---|---|---|
| `reveal_in_finder` | organizer (G3-E3) | `main`,`control`,`grid_*`,`console` | `{ input: { path } }` | path-backed item action; shells out to `open -R` on macOS |
| `open_path` | organizer (G3-E3) | `main`,`control`,`grid_*`,`console` | `{ input: { path } }` | user-initiated only; shells out to `open` on macOS |
| `resolve_alias` | organizer | `control`,`grid_*` | TBD | G1/G2 根据 sandbox 决定 |
| `create_security_scoped_bookmark` | organizer/account | `control`,`grid_*` | TBD | MAS path if required |

文件 command 不允许静默扫描用户目录。所有 path access 必须来自用户 drop/open panel 或已授权 bookmark。

`reveal_in_finder` / `open_path` enforce a runtime allow-list (`FINDER_ALLOWED_WINDOWS` in `commands/finder.rs`) and reject empty / NUL-containing paths with `E3005` (SyncInvalidInput) before reaching the platform layer.

## 5. Clipboard Commands

| Command | Owner | Allowed windows | 说明 |
|---|---|---|---|
| `clipboard_start_watching` | clipboard | `control`,`console` | 用户启用后 |
| `clipboard_stop_watching` | clipboard | `control`,`console` | privacy control |
| `clipboard_write_item` | clipboard | `control`,`console` | user action |
| `clipboard_get_item_preview` | clipboard | `control`,`console` | 不返回 secret app 内容 |

Clipboard disabled-app policy 必须在写入历史前执行。

## 6. Crypto / Keychain Commands

Current source:
- `apps/desktop/src-tauri/src/commands/crypto.rs`
- `apps/desktop/src-tauri/src/commands/keychain.rs`
- `apps/desktop/src-tauri/capabilities/plugin-account-crypto.json`
- `apps/desktop/src-tauri/capabilities/plugin-account-keychain.json`

| Command | Allowed windows | Security rule |
|---|---|---|
| `crypto_encrypt_for` | `account`,`control` | plaintext in,encrypted envelope out; key resolved in Rust |
| `crypto_wrap_dek_for_devices` | `account`,`control` | DEK handle only |
| `crypto_unwrap_dek_for_device` | `account`,`control` | returns handle,not raw key |
| `crypto_recovery_sign` | `account`,`control` | transcript signed in Rust |
| `secret_set` / `secret_get` / `secret_del` | `account`,`control` | Keychain scoped by account/device |

Raw DEK must never cross IPC. JS may hold opaque handle ids only.

### 6.0.1 Keychain ↔ KeyVault opaque-handle boundary (G2.4)

JS-visible Keychain surface is limited to the three `secret_*` commands;
JS-visible KeyVault surface is limited to `KeyHandleId` integers returned
from `crypto_*` commands. The ONE authorised crossing between the two —
"Keychain bytes → KeyVault handle" — lives in
`apps/desktop/src-tauri/src/crypto/keychain_handle.rs`:

| Helper | Direction | Behaviour |
|---|---|---|
| `keychain_handle::load_kek_into_vault(key, vault)` | Keychain → KeyVault | `secret_get` then `KeyVault::insert_kek`. Zeroizes the byte buffer before returning. Result is only `KeyHandleId`. |
| `keychain_handle::insert_kek_from_bytes(bytes, vault)` | caller bytes → KeyVault | Same insertion + zeroize for callers that already hold bytes (e.g. recovery flow). |

Rule (machine-enforced by code review + the dedicated tests):

- `secret_get` MUST NOT be called by any Tauri command that exposes its
  return value to JS for KEK / DEK / device-private bytes. Such material
  must flow through `keychain_handle::*` so JS only ever sees a handle.
- `secret_get` is allowed to surface bytes to JS for **non-key material**:
  refresh tokens, account-id markers, encrypted recovery transcripts, etc.

Rust-internal errors (do not cross IPC; calling Tauri commands that use
this bridge must map them to JS-visible `E11xx` / `E13xx` variants):

- `KeychainHandleError::Keychain(AppError)` — passthrough from `secret_get`.
- `KeychainHandleError::InvalidKeyLength` — payload length is not exactly 32 bytes.
- `KeychainHandleError::KeyVault(KeyVaultError)` — vault insertion failure.

## 6.1 Database Commands (G2.2 PoC)

Current source:
- `apps/desktop/src-tauri/src/commands/database.rs`
- `packages/core-data/src/tauri-sqlite.ts` (TS driver factory)
- `apps/desktop/src-tauri/capabilities/plugin-data-database.json` (G2.5)
- `apps/desktop/src-tauri/capabilities/AUDIT.md` (full audit table)

| Command | Allowed windows | Input | Output | Security rule |
|---|---|---|---|---|
| `db_init` | `main`,`control`,`grid_*`,`account` | `{ namespace }` | `{ namespace, path }` | Idempotent. Opens or creates `xai-repo-v0.db` under `app_data_dir`. |
| `db_put` | same | `{ input: { namespace, id, json, updatedAtMs } }` | `void` | Upsert. `json` payload is opaque; raw bytes do not cross IPC. |
| `db_get` | same | `{ input: { namespace, id } }` | `string \| null` | Returns the stored JSON or `null` if absent. |
| `db_list` | same | `{ input: { namespace } }` | `string[]` | All payloads in the namespace, sorted by id. |
| `db_delete` | same | `{ input: { namespace, id } }` | `void` | Idempotent. |
| `db_put_batch` | same | `{ input: { namespace, entries: [{ op: "put" \| "delete", id, json?, updatedAtMs? }] } }` | `void` | Atomic. Wraps every entry in one SQLite `BEGIN`/`COMMIT`. Any validation or backend failure rolls back the whole batch. Required by the sync-outbox to commit the entity row and its outbox row together (G2.6 P0 fix). |

PoC scope:
- Plain SQLite via `rusqlite` (bundled-sqlcipher build but no `PRAGMA key` applied).
- SQLCipher PRAGMA path is exercised by `apps/desktop/src-tauri/src/crypto/sqlcipher.rs` and will be wired into `db_init` once G2.4 publishes a stable opaque KEK handle.
- Cross-namespace transactions are not exposed; the TS `createTauriRepo` shim runs `transaction(fn)` callbacks against a single namespace and dispatches all buffered writes through `db_put_batch`.
- Namespace must match `[A-Za-z0-9._:-]+` and be ≤ 128 chars. Id must be 1..=256 chars.
- Errors: `E1300` (not initialized), `E1301` (invalid input), `E1302` (backend SQLite/FS error).
- Feature-gated: registered only when the desktop crate is built with `--features crypto` (the gate that also enables `rusqlite`).

## 7. Capability Files

| File | Purpose |
|---|---|
| `default.json` | main/control/grid baseline window capability |
| `plugin-account-crypto.json` | account/control crypto marker + command-side allowlist |
| `plugin-account-keychain.json` | account/control keychain marker + command-side allowlist |
| `plugin-data-database.json` | main/control/grid/account/console Repository v0 marker + runtime allowlist (G2.5) |

Full audit table: `apps/desktop/src-tauri/capabilities/AUDIT.md`.

G2.5 invariants now enforced:

- Every JS-callable command has a capability file declaring its allowed windows.
- Every JS-callable command has a runtime `ensure_*_allowed(label)` check matching the capability file. Widget / pet / ai-cube windows cannot invoke `db_*`, `crypto_*`, or `secret_*` even via mis-attached capability files.

G2.7 (MAS signed runtime smoke) remains deferred under `xai-v1.deferred-gates.md`.

## 8. Error Shape

Target command errors should map to:

```ts
interface CommandError {
  code: string;
  message: string;
  recoverable: boolean;
  details?: unknown;
}
```

UI must not parse Rust debug strings for control flow.

## 9. Tests

- Unauthorized window cannot call crypto/keychain commands。
- Grid command rejects invalid `gridId`。
- Window command errors preserve code/message。
- MAS capability dry run documented。
- Path command only works for user-authorized path。
