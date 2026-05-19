/// Crypto capability seam (T6 / FR-SY-75 — malicious plugin mitigation).
///
/// This module is a SCAFFOLD PLACEHOLDER.
/// No crypto implementation is present in wave-W0. The structural seams below
/// are named and documented so downstream crypto rows have a fixed target.
///
/// ## KeyHandle opaque-handle pattern
///
/// JS must never hold raw key material. The `KeyHandle` newtype is an opaque
/// integer identity that JS can pass back to Rust commands. Rust resolves it
/// to actual key material inside the secure KeyVault (a later row).
///
/// ## Capability allowlist marker (future enforcement target)
///
/// # crypto_* capability allowlist — PLACEHOLDER
/// When the crypto row is implemented, Tauri capability checks must enforce
/// that only plugin-account / core-data can invoke `crypto_*` commands.
/// Tag: CRYPTO_CAPABILITY_ALLOWLIST
///
/// This comment is the named surface; `feature-verify` will grep for it.

/// Opaque key handle. JS receives and passes back this integer; raw key
/// material never crosses the IPC boundary.
#[allow(dead_code)]
pub struct KeyHandle(pub u32);

#[cfg(feature = "crypto")]
pub mod aes_gcm;

#[cfg(feature = "crypto")]
pub mod aad;

#[cfg(feature = "crypto")]
pub mod argon2;

#[cfg(feature = "crypto")]
pub mod envelope;

#[cfg(feature = "crypto")]
pub mod device_key;

#[cfg(feature = "crypto")]
pub mod hpke_wrap;

#[cfg(feature = "crypto")]
pub mod kdf;

#[cfg(feature = "crypto")]
pub mod key_vault;

#[cfg(feature = "crypto")]
pub mod mnemonic;

#[cfg(feature = "crypto")]
pub mod recovery_signing;
