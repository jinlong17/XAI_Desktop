//! Tauri IPC commands for the macOS Keychain bridge.
//!
//! These three commands are the only public surface for Keychain access.
//! They are registered in `lib.rs` `invoke_handler!` and scoped to the
//! `plugin-account` window via the `plugin-account` capability file.
//!
//! All commands return `AppResult<T>` — on error the JS caller receives a
//! JSON-serialised `AppError` with a JS-parseable `E11xx:` prefix.

use crate::error::AppResult;
use crate::platform;

/// Store an opaque byte blob under `key` in the macOS Keychain.
///
/// Idempotent upsert: repeated calls with the same key update the stored bytes.
/// Returns `E1100` (KeychainLocked) if the device is locked, `E1103` on other
/// backend errors, `E1104` on non-macOS targets.
#[tauri::command]
pub async fn secret_set(key: String, value: Vec<u8>) -> AppResult<()> {
    platform::macos::keychain::secret_set(&key, &value)
}

/// Retrieve the byte blob stored under `key` from the macOS Keychain.
///
/// Returns `E1101` (KeychainItemNotFound) if the key is absent,
/// `E1100` (KeychainLocked) if the device is locked, `E1104` on non-macOS.
#[tauri::command]
pub async fn secret_get(key: String) -> AppResult<Vec<u8>> {
    platform::macos::keychain::secret_get(&key)
}

/// Delete the keychain item for `key`.
///
/// Idempotent: if the key does not exist, returns success.
/// Returns `E1100` (KeychainLocked) if the device is locked, `E1104` on non-macOS.
#[tauri::command]
pub async fn secret_del(key: String) -> AppResult<()> {
    platform::macos::keychain::secret_del(&key)
}
