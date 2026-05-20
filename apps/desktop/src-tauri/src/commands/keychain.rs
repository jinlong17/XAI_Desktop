//! Tauri IPC commands for the macOS Keychain bridge.
//!
//! These three commands are the only public surface for Keychain access.
//! They are registered in `lib.rs` `invoke_handler!` and scoped to the
//! `account` / `control` windows via the `plugin-account-keychain`
//! capability file. The runtime `KEYCHAIN_ALLOWED_WINDOWS` allow-list in
//! this module is a defence-in-depth layer that mirrors the capability
//! file: if a future capability widening grants a wider set of windows
//! the file scope, the runtime check still rejects unauthorised origins
//! (widget / pet / ai-cube / grid windows) before any platform call.
//!
//! All commands return `AppResult<T>` — on error the JS caller receives a
//! JSON-serialised `AppError` with a JS-parseable `E11xx:` / `E3004:` prefix.
//!
//! Tauri injects `window: tauri::WebviewWindow` automatically; JS callers
//! do NOT include it in the args payload (mirrors the crypto/database
//! command pattern). See `commands/crypto.rs` and `commands/database.rs`.

use crate::error::{AppError, AppResult};
use crate::platform;

/// Windows allowed to invoke `secret_*` commands. Mirrors
/// `capabilities/plugin-account-keychain.json`. Widget / pet / ai-cube
/// and `grid_*` windows are intentionally NOT in this list — they must
/// route Keychain access through the owning `plugin-account` window.
const KEYCHAIN_ALLOWED_WINDOWS: &[&str] = &["account", "control"];

fn is_keychain_window_allowed(label: &str) -> bool {
    KEYCHAIN_ALLOWED_WINDOWS.contains(&label)
}

fn ensure_keychain_window_allowed(label: &str) -> AppResult<()> {
    if is_keychain_window_allowed(label) {
        return Ok(());
    }
    Err(AppError::SyncCapabilityDenied(format!(
        "window `{label}` is not allowed to invoke secret_* commands"
    )))
}

/// Store an opaque byte blob under `key` in the macOS Keychain.
///
/// Idempotent upsert: repeated calls with the same key update the stored bytes.
/// Returns `E1100` (KeychainLocked) if the device is locked, `E1103` on other
/// backend errors, `E1104` on non-macOS targets, `E3004` if the calling window
/// is not in `KEYCHAIN_ALLOWED_WINDOWS`.
#[tauri::command]
pub async fn secret_set(
    window: tauri::WebviewWindow,
    key: String,
    value: Vec<u8>,
) -> AppResult<()> {
    ensure_keychain_window_allowed(window.label())?;
    platform::macos::keychain::secret_set(&key, &value)
}

/// Retrieve the byte blob stored under `key` from the macOS Keychain.
///
/// Returns `E1101` (KeychainItemNotFound) if the key is absent,
/// `E1100` (KeychainLocked) if the device is locked, `E1104` on non-macOS,
/// `E3004` if the calling window is not in `KEYCHAIN_ALLOWED_WINDOWS`.
#[tauri::command]
pub async fn secret_get(window: tauri::WebviewWindow, key: String) -> AppResult<Vec<u8>> {
    ensure_keychain_window_allowed(window.label())?;
    platform::macos::keychain::secret_get(&key)
}

/// Delete the keychain item for `key`.
///
/// Idempotent: if the key does not exist, returns success.
/// Returns `E1100` (KeychainLocked) if the device is locked, `E1104` on non-macOS,
/// `E3004` if the calling window is not in `KEYCHAIN_ALLOWED_WINDOWS`.
#[tauri::command]
pub async fn secret_del(window: tauri::WebviewWindow, key: String) -> AppResult<()> {
    ensure_keychain_window_allowed(window.label())?;
    platform::macos::keychain::secret_del(&key)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn keychain_allowlist_admits_account_and_control() {
        for label in KEYCHAIN_ALLOWED_WINDOWS {
            assert!(
                is_keychain_window_allowed(label),
                "expected `{label}` to be admitted"
            );
            assert!(ensure_keychain_window_allowed(label).is_ok());
        }
    }

    #[test]
    fn keychain_allowlist_rejects_widget_pet_aicube() {
        // grid_* is in the database allow-list but explicitly NOT in the
        // keychain allow-list — these windows must route Keychain access
        // through the owning `plugin-account` window.
        for label in [
            "widget_clock",
            "pet",
            "ai_cube",
            "unknown",
            "grid_xxx",
            "grid_",
            "main",
            "console",
        ] {
            assert!(
                !is_keychain_window_allowed(label),
                "expected `{label}` to be rejected"
            );
            let err = ensure_keychain_window_allowed(label).unwrap_err();
            match err {
                AppError::SyncCapabilityDenied(msg) => {
                    assert!(
                        msg.contains(label),
                        "error message `{msg}` should mention `{label}`"
                    );
                    assert!(msg.contains("secret_*"));
                }
                other => panic!("unexpected error for `{label}`: {other:?}"),
            }
        }
    }
}
