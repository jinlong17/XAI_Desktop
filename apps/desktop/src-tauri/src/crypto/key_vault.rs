#![allow(dead_code)]

use std::collections::HashMap;
use std::num::NonZeroU32;

use zeroize::{Zeroize, Zeroizing};

use super::aes_gcm::{
    decrypt_aes256_gcm, encrypt_aes256_gcm, Aes256GcmKey, Aes256GcmSealed, AES_256_KEY_BYTES,
    GCM_NONCE_BYTES,
};

pub const KEY_BYTES: usize = AES_256_KEY_BYTES;

#[derive(Copy, Clone, PartialEq, Eq, Hash)]
#[repr(transparent)]
pub struct KeyHandleId(NonZeroU32);

impl KeyHandleId {
    pub fn from_raw(raw: u32) -> KeyVaultResult<Self> {
        NonZeroU32::new(raw)
            .map(Self)
            .ok_or(KeyVaultError::InvalidHandle(raw))
    }

    pub fn get(self) -> u32 {
        self.0.get()
    }
}

impl core::fmt::Debug for KeyHandleId {
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        f.debug_tuple("KeyHandleId").field(&self.get()).finish()
    }
}

#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub enum ResidentKeyKind {
    Kek,
    Dek,
    DevicePrivate,
}

struct ResidentKey {
    kind: ResidentKeyKind,
    bytes: Zeroizing<[u8; KEY_BYTES]>,
}

impl ResidentKey {
    fn new(kind: ResidentKeyKind, bytes: [u8; KEY_BYTES]) -> Self {
        Self {
            kind,
            bytes: Zeroizing::new(bytes),
        }
    }

    fn zeroize(&mut self) {
        self.bytes.zeroize();
    }
}

impl core::fmt::Debug for ResidentKey {
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        f.debug_struct("ResidentKey")
            .field("kind", &self.kind)
            .field("bytes", &"[redacted]")
            .finish()
    }
}

#[derive(Debug, thiserror::Error, PartialEq, Eq)]
pub enum KeyVaultError {
    #[error("invalid key handle: {0}")]
    InvalidHandle(u32),

    #[error("key handle space exhausted")]
    HandleSpaceExhausted,

    #[error("wrong resident key kind: expected {expected:?}, actual {actual:?}")]
    WrongKeyKind {
        expected: ResidentKeyKind,
        actual: ResidentKeyKind,
    },

    #[error("AES-GCM operation failed: {0}")]
    AesGcm(String),
}

pub type KeyVaultResult<T> = Result<T, KeyVaultError>;

#[derive(Debug, Default)]
pub struct KeyVault {
    next_id: u32,
    entries: HashMap<KeyHandleId, ResidentKey>,
}

impl KeyVault {
    pub fn new() -> Self {
        Self {
            next_id: 1,
            entries: HashMap::new(),
        }
    }

    pub fn insert_dek(&mut self, dek: [u8; KEY_BYTES]) -> KeyVaultResult<KeyHandleId> {
        self.insert_key(ResidentKeyKind::Dek, dek)
    }

    pub fn insert_kek(&mut self, kek: [u8; KEY_BYTES]) -> KeyVaultResult<KeyHandleId> {
        self.insert_key(ResidentKeyKind::Kek, kek)
    }

    pub fn insert_device_private(
        &mut self,
        device_priv: [u8; KEY_BYTES],
    ) -> KeyVaultResult<KeyHandleId> {
        self.insert_key(ResidentKeyKind::DevicePrivate, device_priv)
    }

    pub fn contains(&self, handle: KeyHandleId) -> bool {
        self.entries.contains_key(&handle)
    }

    pub fn kind(&self, handle: KeyHandleId) -> KeyVaultResult<ResidentKeyKind> {
        Ok(self.entry(handle)?.kind)
    }

    pub fn drop_key(&mut self, handle: KeyHandleId) -> KeyVaultResult<()> {
        let mut entry = self
            .entries
            .remove(&handle)
            .ok_or(KeyVaultError::InvalidHandle(handle.get()))?;
        entry.zeroize();
        Ok(())
    }

    pub fn with_dek<R>(
        &self,
        handle: KeyHandleId,
        f: impl FnOnce(&[u8; KEY_BYTES]) -> R,
    ) -> KeyVaultResult<R> {
        self.with_key(handle, ResidentKeyKind::Dek, f)
    }

    pub fn with_kek<R>(
        &self,
        handle: KeyHandleId,
        f: impl FnOnce(&[u8; KEY_BYTES]) -> R,
    ) -> KeyVaultResult<R> {
        self.with_key(handle, ResidentKeyKind::Kek, f)
    }

    pub fn with_device_private<R>(
        &self,
        handle: KeyHandleId,
        f: impl FnOnce(&[u8; KEY_BYTES]) -> R,
    ) -> KeyVaultResult<R> {
        self.with_key(handle, ResidentKeyKind::DevicePrivate, f)
    }

    pub fn encrypt_with_dek(
        &self,
        dek_handle: KeyHandleId,
        nonce: &[u8; GCM_NONCE_BYTES],
        aad: &[u8],
        plaintext: &[u8],
    ) -> KeyVaultResult<Aes256GcmSealed> {
        let key = self.with_dek(dek_handle, |dek| Aes256GcmKey::from_bytes(*dek))?;
        encrypt_aes256_gcm(key, nonce, aad, plaintext)
            .map_err(|error| KeyVaultError::AesGcm(error.to_string()))
    }

    pub fn decrypt_with_dek(
        &self,
        dek_handle: KeyHandleId,
        nonce: &[u8; GCM_NONCE_BYTES],
        aad: &[u8],
        sealed: &Aes256GcmSealed,
    ) -> KeyVaultResult<Vec<u8>> {
        let key = self.with_dek(dek_handle, |dek| Aes256GcmKey::from_bytes(*dek))?;
        decrypt_aes256_gcm(key, nonce, aad, sealed)
            .map_err(|error| KeyVaultError::AesGcm(error.to_string()))
    }

    fn insert_key(
        &mut self,
        kind: ResidentKeyKind,
        bytes: [u8; KEY_BYTES],
    ) -> KeyVaultResult<KeyHandleId> {
        let handle = self.allocate_handle()?;
        self.entries.insert(handle, ResidentKey::new(kind, bytes));
        Ok(handle)
    }

    fn allocate_handle(&mut self) -> KeyVaultResult<KeyHandleId> {
        let handle = KeyHandleId::from_raw(self.next_id)?;
        self.next_id = self
            .next_id
            .checked_add(1)
            .ok_or(KeyVaultError::HandleSpaceExhausted)?;
        Ok(handle)
    }

    fn with_key<R>(
        &self,
        handle: KeyHandleId,
        expected: ResidentKeyKind,
        f: impl FnOnce(&[u8; KEY_BYTES]) -> R,
    ) -> KeyVaultResult<R> {
        let entry = self.entry(handle)?;
        if entry.kind != expected {
            return Err(KeyVaultError::WrongKeyKind {
                expected,
                actual: entry.kind,
            });
        }
        Ok(f(&entry.bytes))
    }

    fn entry(&self, handle: KeyHandleId) -> KeyVaultResult<&ResidentKey> {
        self.entries
            .get(&handle)
            .ok_or(KeyVaultError::InvalidHandle(handle.get()))
    }
}

impl Drop for KeyVault {
    fn drop(&mut self) {
        for entry in self.entries.values_mut() {
            entry.zeroize();
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_dek() -> [u8; KEY_BYTES] {
        [
            0x31, 0xbd, 0xad, 0xd9, 0x66, 0x98, 0xc2, 0x04, 0xaa, 0x9c, 0xe1, 0x44, 0x8e,
            0xa9, 0x4a, 0xe1, 0xfb, 0x4a, 0x9a, 0x0b, 0x3c, 0x9d, 0x77, 0x3b, 0x51, 0xbb,
            0x18, 0x22, 0x66, 0x6b, 0x8f, 0x22,
        ]
    }

    fn sample_nonce() -> [u8; GCM_NONCE_BYTES] {
        [
            0x0d, 0x18, 0xe0, 0x6c, 0x7c, 0x72, 0x5a, 0xc9, 0xe3, 0x62, 0xe1, 0xce,
        ]
    }

    #[test]
    fn js_visible_handle_is_non_zero_u32_only() {
        assert_eq!(KeyHandleId::from_raw(0), Err(KeyVaultError::InvalidHandle(0)));
        assert_eq!(KeyHandleId::from_raw(7).unwrap().get(), 7);
    }

    #[test]
    fn inserts_dek_and_encrypts_by_handle_without_exporting_key() {
        let mut vault = KeyVault::new();
        let handle = vault.insert_dek(sample_dek()).unwrap();

        let sealed = vault
            .encrypt_with_dek(handle, &sample_nonce(), b"aad-v1", b"secret")
            .unwrap();
        let plaintext = vault
            .decrypt_with_dek(handle, &sample_nonce(), b"aad-v1", &sealed)
            .unwrap();

        assert_eq!(handle.get(), 1);
        assert_eq!(plaintext, b"secret");
    }

    #[test]
    fn rejects_wrong_key_kind_for_dek_operation() {
        let mut vault = KeyVault::new();
        let handle = vault.insert_device_private([0x42; KEY_BYTES]).unwrap();

        assert_eq!(
            vault.encrypt_with_dek(handle, &sample_nonce(), b"aad", b"secret"),
            Err(KeyVaultError::WrongKeyKind {
                expected: ResidentKeyKind::Dek,
                actual: ResidentKeyKind::DevicePrivate,
            })
        );
    }

    #[test]
    fn drop_key_evicts_handle() {
        let mut vault = KeyVault::new();
        let handle = vault.insert_dek(sample_dek()).unwrap();

        assert!(vault.contains(handle));
        vault.drop_key(handle).unwrap();
        assert!(!vault.contains(handle));
        assert_eq!(vault.kind(handle), Err(KeyVaultError::InvalidHandle(1)));
    }

    #[test]
    fn debug_output_redacts_resident_key_bytes() {
        let mut vault = KeyVault::new();
        vault.insert_dek([0x42; KEY_BYTES]).unwrap();

        let debug = format!("{vault:?}");
        assert!(debug.contains("[redacted]"));
        assert!(!debug.contains("66, 66, 66"));
    }
}
