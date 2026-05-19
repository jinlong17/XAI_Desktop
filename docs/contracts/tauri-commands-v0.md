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
| `create_grid_window` | organizer/host | `main`,`control` | `{ gridId, rect }` | `void` |
| `update_grid_window` | organizer/host | `main`,`control`,`grid_*` | `{ gridId, rect }` | `void` |
| `close_grid_window` | organizer/host | `main`,`control`,`grid_*` | `{ gridId }` | `void` |
| `list_grid_windows` | organizer/host | `main`,`control` | `void` | `GridWindowSnapshot[]` |
| `focus_grid_window` | organizer/host | `main`,`control` | `{ gridId }` | `void` |

Target G1 output type:

```ts
interface GridWindowSnapshot {
  gridId: string;
  label: `grid_${string}`;
  rect: Rect;
  visible: boolean;
}
```

## 4. File / Open Commands

| Command | Owner | Allowed windows | 说明 |
|---|---|---|---|
| `reveal_in_finder` | organizer | `control`,`grid_*`,`console` | path-backed item action |
| `open_path` | organizer | `control`,`grid_*`,`console` | user-initiated only |
| `resolve_alias` | organizer | `control`,`grid_*` | G1/G2 根据 sandbox 决定 |
| `create_security_scoped_bookmark` | organizer/account | `control`,`grid_*` | MAS path if required |

文件 command 不允许静默扫描用户目录。所有 path access 必须来自用户 drop/open panel 或已授权 bookmark。

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

## 7. Capability Files

| File | Purpose |
|---|---|
| `default.json` | main/control/grid baseline window capability |
| `plugin-account-crypto.json` | account/control crypto marker + command-side allowlist |
| `plugin-account-keychain.json` | account/control keychain marker + command-side allowlist |

G2 target:
- Split broad window permissions if possible。
- Document every custom command owner。
- MAS build dry run validates capability set。

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
