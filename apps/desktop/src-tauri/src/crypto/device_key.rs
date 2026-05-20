#![allow(dead_code)]

use x25519_dalek::{PublicKey, StaticSecret};
use zeroize::{Zeroize, Zeroizing};

use crate::platform::macos::keychain;

use super::key_vault::{KeyHandleId, KeyVault, KeyVaultError, KEY_BYTES};

pub const DEVICE_PUBLIC_BYTES: usize = 32;
pub const DEVICE_KEYCHAIN_PREFIX: &str = "xai.devicekey";

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DeviceKeypair {
    pub device_priv_handle: KeyHandleId,
    pub device_pub: [u8; DEVICE_PUBLIC_BYTES],
    pub keychain_key: String,
}

pub trait DevicePrivateKeyStore {
    fn store_device_private(
        &self,
        keychain_key: &str,
        device_priv: &[u8; KEY_BYTES],
    ) -> DeviceKeyResult<()>;
}

#[derive(Debug, Default)]
pub struct MacosKeychainDevicePrivateStore;

impl DevicePrivateKeyStore for MacosKeychainDevicePrivateStore {
    fn store_device_private(
        &self,
        keychain_key: &str,
        device_priv: &[u8; KEY_BYTES],
    ) -> DeviceKeyResult<()> {
        keychain::secret_set(keychain_key, device_priv)
            .map_err(|error| DeviceKeyError::Keychain(error.to_string()))
    }
}

#[derive(Debug, thiserror::Error, PartialEq, Eq)]
pub enum DeviceKeyError {
    #[error("account_id and device_id are required for device keychain key")]
    InvalidKeychainScope,

    #[error("invalid all-zero X25519 public key")]
    AllZeroPublicKey,

    #[error("invalid low-order X25519 public key")]
    LowOrderPublicKey,

    #[error("key vault error: {0}")]
    KeyVault(String),

    #[error("keychain error: {0}")]
    Keychain(String),
}

impl From<KeyVaultError> for DeviceKeyError {
    fn from(value: KeyVaultError) -> Self {
        Self::KeyVault(value.to_string())
    }
}

pub type DeviceKeyResult<T> = Result<T, DeviceKeyError>;

pub fn device_keychain_key(account_id: &str, device_id: &str) -> DeviceKeyResult<String> {
    if account_id.trim().is_empty() || device_id.trim().is_empty() {
        return Err(DeviceKeyError::InvalidKeychainScope);
    }
    Ok(format!(
        "{DEVICE_KEYCHAIN_PREFIX}.{account_id}.{device_id}"
    ))
}

pub fn generate_and_store_device_keypair(
    vault: &mut KeyVault,
    store: &impl DevicePrivateKeyStore,
    account_id: &str,
    device_id: &str,
) -> DeviceKeyResult<DeviceKeypair> {
    let keychain_key = device_keychain_key(account_id, device_id)?;
    let secret = StaticSecret::random();
    let public = PublicKey::from(&secret);
    let mut device_priv = Zeroizing::new(secret.to_bytes());

    store.store_device_private(&keychain_key, &device_priv)?;
    let device_priv_handle = vault.insert_device_private(*device_priv)?;
    device_priv.zeroize();

    Ok(DeviceKeypair {
        device_priv_handle,
        device_pub: public.to_bytes(),
        keychain_key,
    })
}

pub fn import_device_private_into_vault(
    vault: &mut KeyVault,
    device_priv: [u8; KEY_BYTES],
) -> DeviceKeyResult<DeviceKeypair> {
    let mut device_priv = Zeroizing::new(device_priv);
    let secret = StaticSecret::from(*device_priv);
    let public = PublicKey::from(&secret);
    let device_priv_handle = vault.insert_device_private(*device_priv)?;
    device_priv.zeroize();

    Ok(DeviceKeypair {
        device_priv_handle,
        device_pub: public.to_bytes(),
        keychain_key: String::new(),
    })
}

pub fn validate_device_public(
    device_pub: [u8; DEVICE_PUBLIC_BYTES],
) -> DeviceKeyResult<PublicKey> {
    if device_pub == [0u8; DEVICE_PUBLIC_BYTES] {
        return Err(DeviceKeyError::AllZeroPublicKey);
    }

    let public = PublicKey::from(device_pub);
    let validation_secret = StaticSecret::from([0x42; KEY_BYTES]);
    let shared = validation_secret.diffie_hellman(&public);
    if shared.as_bytes() == &[0u8; KEY_BYTES] {
        return Err(DeviceKeyError::LowOrderPublicKey);
    }

    Ok(public)
}

#[cfg(test)]
mod tests {
    use std::cell::RefCell;

    use super::*;
    use crate::crypto::key_vault::ResidentKeyKind;

    #[derive(Default)]
    struct MemoryDevicePrivateKeyStore {
        writes: RefCell<Vec<(String, [u8; KEY_BYTES])>>,
    }

    impl DevicePrivateKeyStore for MemoryDevicePrivateKeyStore {
        fn store_device_private(
            &self,
            keychain_key: &str,
            device_priv: &[u8; KEY_BYTES],
        ) -> DeviceKeyResult<()> {
            self.writes
                .borrow_mut()
                .push((keychain_key.to_string(), *device_priv));
            Ok(())
        }
    }

    #[test]
    fn keychain_key_is_namespaced_by_account_and_device() {
        assert_eq!(
            device_keychain_key("acct_1", "dev_1").unwrap(),
            "xai.devicekey.acct_1.dev_1"
        );
        assert_eq!(
            device_keychain_key("", "dev_1"),
            Err(DeviceKeyError::InvalidKeychainScope)
        );
        assert_eq!(
            device_keychain_key("acct_1", " "),
            Err(DeviceKeyError::InvalidKeychainScope)
        );
    }

    #[test]
    fn generates_device_key_with_csprng_and_stores_private_in_keychain_and_vault() {
        let mut vault = KeyVault::new();
        let store = MemoryDevicePrivateKeyStore::default();

        let keypair =
            generate_and_store_device_keypair(&mut vault, &store, "acct_1", "dev_1").unwrap();

        assert_eq!(keypair.keychain_key, "xai.devicekey.acct_1.dev_1");
        assert_eq!(keypair.device_pub.len(), DEVICE_PUBLIC_BYTES);
        assert!(validate_device_public(keypair.device_pub).is_ok());
        assert_eq!(
            vault.kind(keypair.device_priv_handle).unwrap(),
            ResidentKeyKind::DevicePrivate
        );

        let writes = store.writes.borrow();
        assert_eq!(writes.len(), 1);
        assert_eq!(writes[0].0, "xai.devicekey.acct_1.dev_1");
        assert_ne!(writes[0].1, [0u8; KEY_BYTES]);
    }

    #[test]
    fn import_device_private_recomputes_public_and_keeps_handle_resident() {
        let mut vault = KeyVault::new();
        let keypair = import_device_private_into_vault(&mut vault, [0x11; KEY_BYTES]).unwrap();

        assert!(validate_device_public(keypair.device_pub).is_ok());
        assert_eq!(
            vault.kind(keypair.device_priv_handle).unwrap(),
            ResidentKeyKind::DevicePrivate
        );
    }

    #[test]
    fn rejects_all_zero_and_low_order_public_keys() {
        assert_eq!(
            validate_device_public([0u8; DEVICE_PUBLIC_BYTES]),
            Err(DeviceKeyError::AllZeroPublicKey)
        );

        let mut low_order = [0u8; DEVICE_PUBLIC_BYTES];
        low_order[0] = 1;
        assert_eq!(
            validate_device_public(low_order),
            Err(DeviceKeyError::LowOrderPublicKey)
        );
    }
}

