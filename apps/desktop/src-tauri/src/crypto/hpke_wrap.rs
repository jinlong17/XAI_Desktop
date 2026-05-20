#![allow(dead_code)]

use hpke::{
    aead::AesGcm256,
    kdf::HkdfSha256,
    kem::{Kem as HpkeKemTrait, X25519HkdfSha256},
    rand_core::OsRng,
    single_shot_open, single_shot_seal, Deserializable, OpModeR, OpModeS, Serializable,
};
use zeroize::Zeroize;

use super::{
    device_key::{validate_device_public, DEVICE_PUBLIC_BYTES},
    key_vault::{KeyHandleId, KeyVault, KeyVaultError, KEY_BYTES},
};

type HpkeKem = X25519HkdfSha256;
type HpkeKdf = HkdfSha256;
type HpkeAead = AesGcm256;

pub const HPKE_SUITE: &str = "DHKEM(X25519,HKDF-SHA256)+HKDF-SHA256+AES-256-GCM";
pub const HPKE_ENCAPPED_KEY_BYTES: usize = 32;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DeviceDekWrap {
    pub encapped_key: [u8; HPKE_ENCAPPED_KEY_BYTES],
    pub ciphertext: Vec<u8>,
}

#[derive(Debug, thiserror::Error, PartialEq, Eq)]
pub enum HpkeWrapError {
    #[error("HPKE info and aad must be distinct")]
    InfoEqualsAad,

    #[error("invalid HPKE input length")]
    InvalidLength,

    #[error("invalid wrapped DEK length: {0}")]
    InvalidDekLength(usize),

    #[error("device public key rejected: {0}")]
    InvalidDevicePublic(String),

    #[error("key vault error: {0}")]
    KeyVault(String),

    #[error("HPKE operation failed: {0}")]
    Hpke(String),
}

impl From<KeyVaultError> for HpkeWrapError {
    fn from(value: KeyVaultError) -> Self {
        Self::KeyVault(value.to_string())
    }
}

pub type HpkeWrapResult<T> = Result<T, HpkeWrapError>;

pub fn seal_dek_for_device(
    vault: &KeyVault,
    dek_handle: KeyHandleId,
    recipient_device_pub: [u8; DEVICE_PUBLIC_BYTES],
    info: &[u8],
    aad: &[u8],
) -> HpkeWrapResult<DeviceDekWrap> {
    ensure_info_aad_distinct(info, aad)?;
    validate_device_public(recipient_device_pub)
        .map_err(|error| HpkeWrapError::InvalidDevicePublic(error.to_string()))?;

    let recipient_pub = <HpkeKem as HpkeKemTrait>::PublicKey::from_bytes(&recipient_device_pub)
        .map_err(|_| HpkeWrapError::InvalidLength)?;

    vault.with_dek(dek_handle, |dek| {
        let mut plaintext = *dek;
        let mut csprng = OsRng;
        let result = single_shot_seal::<HpkeAead, HpkeKdf, HpkeKem, _>(
            &OpModeS::Base,
            &recipient_pub,
            info,
            &plaintext,
            aad,
            &mut csprng,
        );
        plaintext.zeroize();
        result
    })?
    .map(|(encapped_key, ciphertext)| DeviceDekWrap {
        encapped_key: encapped_key_to_bytes(&encapped_key),
        ciphertext,
    })
    .map_err(|error| HpkeWrapError::Hpke(error.to_string()))
}

pub fn open_dek_wrap_into_vault(
    vault: &mut KeyVault,
    device_priv_handle: KeyHandleId,
    wrap: &DeviceDekWrap,
    info: &[u8],
    aad: &[u8],
) -> HpkeWrapResult<KeyHandleId> {
    ensure_info_aad_distinct(info, aad)?;
    let encapped_key =
        <HpkeKem as HpkeKemTrait>::EncappedKey::from_bytes(&wrap.encapped_key)
            .map_err(|_| HpkeWrapError::InvalidLength)?;

    let plaintext = vault.with_device_private(device_priv_handle, |device_priv| {
        let recipient_priv = <HpkeKem as HpkeKemTrait>::PrivateKey::from_bytes(device_priv)
            .map_err(|_| HpkeWrapError::InvalidLength)?;
        single_shot_open::<HpkeAead, HpkeKdf, HpkeKem>(
            &OpModeR::Base,
            &recipient_priv,
            &encapped_key,
            info,
            &wrap.ciphertext,
            aad,
        )
        .map_err(|error| HpkeWrapError::Hpke(error.to_string()))
    })??;

    if plaintext.len() != KEY_BYTES {
        return Err(HpkeWrapError::InvalidDekLength(plaintext.len()));
    }

    let mut dek = [0u8; KEY_BYTES];
    dek.copy_from_slice(&plaintext);
    Ok(vault.insert_dek(dek)?)
}

pub fn ensure_info_aad_distinct(info: &[u8], aad: &[u8]) -> HpkeWrapResult<()> {
    if info == aad {
        return Err(HpkeWrapError::InfoEqualsAad);
    }
    Ok(())
}

fn encapped_key_to_bytes(
    encapped_key: &<HpkeKem as HpkeKemTrait>::EncappedKey,
) -> [u8; HPKE_ENCAPPED_KEY_BYTES] {
    let bytes = encapped_key.to_bytes();
    let mut out = [0u8; HPKE_ENCAPPED_KEY_BYTES];
    out.copy_from_slice(bytes.as_slice());
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::crypto::{
        aad::{encode_wrap_aad, WrapAad},
        device_key::import_device_private_into_vault,
    };

    fn wrap_info() -> Vec<u8> {
        encode_wrap_aad(&WrapAad {
            account_id: [
                0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17,
                0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f,
            ],
            target_device_id: [
                0x20, 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27,
                0x28, 0x29, 0x2a, 0x2b, 0x2c, 0x2d, 0x2e, 0x2f,
            ],
            key_id: 3,
            granted_by_device_id: [
                0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37,
                0x38, 0x39, 0x3a, 0x3b, 0x3c, 0x3d, 0x3e, 0x3f,
            ],
        })
    }

    fn wrap_aad() -> &'static [u8] {
        b"xai.device_dek_wraps.v1"
    }

    #[test]
    fn hpke_wrap_round_trips_dek_for_device_keypair() {
        let mut vault = KeyVault::new();
        let device = import_device_private_into_vault(&mut vault, [0x11; KEY_BYTES]).unwrap();
        let dek = [0x55; KEY_BYTES];
        let dek_handle = vault.insert_dek(dek).unwrap();
        let info = wrap_info();

        let wrap = seal_dek_for_device(&vault, dek_handle, device.device_pub, &info, wrap_aad())
            .unwrap();
        let recovered_handle = open_dek_wrap_into_vault(
            &mut vault,
            device.device_priv_handle,
            &wrap,
            &info,
            wrap_aad(),
        )
        .unwrap();

        assert_eq!(wrap.encapped_key.len(), HPKE_ENCAPPED_KEY_BYTES);
        assert_ne!(wrap.ciphertext, dek);
        assert_eq!(wrap.ciphertext.len(), KEY_BYTES + 16);
        assert_eq!(vault.with_dek(recovered_handle, |recovered| *recovered).unwrap(), dek);
    }

    #[test]
    fn rejects_info_equal_to_aad() {
        let vault = KeyVault::new();
        let same = b"same";
        assert_eq!(
            seal_dek_for_device(&vault, KeyHandleId::from_raw(1).unwrap(), [9u8; 32], same, same),
            Err(HpkeWrapError::InfoEqualsAad)
        );
    }

    #[test]
    fn aad_mismatch_fails_to_open() {
        let mut vault = KeyVault::new();
        let device = import_device_private_into_vault(&mut vault, [0x22; KEY_BYTES]).unwrap();
        let dek_handle = vault.insert_dek([0x66; KEY_BYTES]).unwrap();
        let info = wrap_info();
        let wrap =
            seal_dek_for_device(&vault, dek_handle, device.device_pub, &info, b"aad-v1").unwrap();

        assert!(matches!(
            open_dek_wrap_into_vault(
                &mut vault,
                device.device_priv_handle,
                &wrap,
                &info,
                b"aad-v2"
            ),
            Err(HpkeWrapError::Hpke(_))
        ));
    }

    #[test]
    fn low_order_recipient_public_key_is_rejected() {
        let mut vault = KeyVault::new();
        let dek_handle = vault.insert_dek([0x77; KEY_BYTES]).unwrap();
        let mut low_order = [0u8; DEVICE_PUBLIC_BYTES];
        low_order[0] = 1;

        assert!(matches!(
            seal_dek_for_device(&vault, dek_handle, low_order, &wrap_info(), wrap_aad()),
            Err(HpkeWrapError::InvalidDevicePublic(_))
        ));
    }
}

