//! Keychain ↔ KeyVault opaque-handle bridge (G2.4).
//!
//! The macOS Keychain is a byte-level store; the KeyVault is a Rust-resident,
//! handle-only key store that never lets raw key material cross the JS/Rust
//! IPC boundary. G2.4 documents the **one** path that connects them:
//!
//! `Keychain bytes ──load_kek_into_vault──▶ KeyVault::insert_kek ──▶ KeyHandleId`
//!
//! The `KeyHandleId` is the only artifact a Tauri command may return to JS for
//! key material. The raw 32 bytes are zeroized after insertion.
//!
//! This module is the **only** authorised crossing between
//! `platform::macos::keychain::secret_get` and `KeyVault::insert_*` for KEK /
//! DEK / device-private material. Any other caller that fetches Keychain bytes
//! and exposes them to JS must instead route through this helper so the
//! boundary contract holds.

#![cfg(feature = "crypto")]

use zeroize::{Zeroize, Zeroizing};

use super::key_vault::{KeyHandleId, KeyVault, KeyVaultError};
use crate::error::AppError;
use crate::platform::macos::keychain;

const KEY_BYTES: usize = 32;

/// Errors emitted by the Keychain → KeyVault opaque-handle bridge.
///
/// These are Rust-internal — callers MUST map them to a JS-visible
/// `AppError::Keychain*` / `AppError::Sync*` variant before returning from
/// a Tauri command. They never carry their own `E1200` prefix on the IPC
/// boundary.
#[derive(Debug, thiserror::Error)]
pub enum KeychainHandleError {
    #[error("keychain bridge error: {0}")]
    Keychain(AppError),

    #[error("keychain payload is wrong length (expected {expected}, got {actual})")]
    InvalidKeyLength { expected: usize, actual: usize },

    #[error("key vault insert failed: {0}")]
    KeyVault(KeyVaultError),
}

impl From<AppError> for KeychainHandleError {
    fn from(value: AppError) -> Self {
        Self::Keychain(value)
    }
}

impl From<KeyVaultError> for KeychainHandleError {
    fn from(value: KeyVaultError) -> Self {
        Self::KeyVault(value)
    }
}

pub type KeychainHandleResult<T> = Result<T, KeychainHandleError>;

/// Read a 32-byte KEK from the Keychain and insert it into the vault. The raw
/// bytes are zeroized after the vault takes ownership. Returns only the
/// opaque handle id — raw key bytes must never cross IPC boundaries.
///
/// Errors (Rust-internal — see `KeychainHandleError`):
///
/// - `Keychain(AppError)` Keychain bridge failure (existing `E110x` codes).
/// - `InvalidKeyLength` payload length is not exactly 32 bytes.
/// - `KeyVault(KeyVaultError)` vault insertion failure.
pub fn load_kek_into_vault(
    key: &str,
    vault: &mut KeyVault,
) -> KeychainHandleResult<KeyHandleId> {
    let mut bytes = keychain::secret_get(key)?;
    let handle = insert_kek_from_bytes(&mut bytes, vault);
    bytes.zeroize();
    handle
}

/// Insert a 32-byte KEK that the caller has already fetched. The caller must
/// hand over a `Vec<u8>` so this function can zeroize the buffer (the
/// `zeroize` happens at the call site as well — defence in depth).
pub fn insert_kek_from_bytes(
    bytes: &mut [u8],
    vault: &mut KeyVault,
) -> KeychainHandleResult<KeyHandleId> {
    if bytes.len() != KEY_BYTES {
        let actual = bytes.len();
        // Scrub the caller buffer on the early-return path too — defence in
        // depth: a wrong-length payload may still be sensitive material.
        bytes.zeroize();
        return Err(KeychainHandleError::InvalidKeyLength {
            expected: KEY_BYTES,
            actual,
        });
    }

    // Wrap the stack-local copy in `Zeroizing` so the local buffer is scrubbed
    // when it goes out of scope — even though the vault receives an owned
    // copy of the bytes, the local must not linger on the stack.
    let mut owned: Zeroizing<[u8; KEY_BYTES]> = Zeroizing::new([0u8; KEY_BYTES]);
    owned.copy_from_slice(bytes);
    bytes.zeroize();

    let handle = vault.insert_kek(*owned)?;
    Ok(handle)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_wrong_length_payload() {
        let mut bytes = vec![0u8; 16];
        let mut vault = KeyVault::new();
        let err = insert_kek_from_bytes(&mut bytes, &mut vault).unwrap_err();
        match err {
            KeychainHandleError::InvalidKeyLength { expected, actual } => {
                assert_eq!(expected, KEY_BYTES);
                assert_eq!(actual, 16);
            }
            other => panic!("unexpected error: {other:?}"),
        }
    }

    #[test]
    fn inserts_32_bytes_and_returns_handle() {
        let mut bytes = vec![0x42u8; KEY_BYTES];
        let mut vault = KeyVault::new();
        let handle = insert_kek_from_bytes(&mut bytes, &mut vault).unwrap();
        assert!(vault.contains(handle));

        // Bytes are zeroized after handing them to the vault.
        assert!(bytes.iter().all(|b| *b == 0));
    }

    #[test]
    fn returned_handle_resolves_to_inserted_kek() {
        let mut bytes = vec![0x77u8; KEY_BYTES];
        let mut vault = KeyVault::new();
        let handle = insert_kek_from_bytes(&mut bytes, &mut vault).unwrap();

        let observed = vault.with_kek(handle, |kek| *kek).unwrap();
        assert_eq!(observed, [0x77u8; KEY_BYTES]);
    }

    #[test]
    fn wrong_length_zeroizes_caller_buffer() {
        // A 16-byte payload pre-filled with non-zero key-shaped material must
        // be scrubbed even though the function bails early on length error.
        let mut bytes = vec![0xABu8; 16];
        let mut vault = KeyVault::new();
        let err = insert_kek_from_bytes(&mut bytes, &mut vault).unwrap_err();
        match err {
            KeychainHandleError::InvalidKeyLength { expected, actual } => {
                assert_eq!(expected, KEY_BYTES);
                assert_eq!(actual, 16);
            }
            other => panic!("unexpected error: {other:?}"),
        }
        assert_eq!(bytes, vec![0u8; 16]);
    }
}
