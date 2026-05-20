#![allow(dead_code)]

use aes_gcm::aead::{AeadInPlace, KeyInit};
use aes_gcm::{Aes256Gcm, Nonce};
use zeroize::{Zeroize, Zeroizing};

pub const AES_256_KEY_BYTES: usize = 32;
pub const GCM_NONCE_BYTES: usize = 12;
pub const GCM_TAG_BYTES: usize = 16;

#[derive(Clone)]
pub struct Aes256GcmKey(Zeroizing<[u8; AES_256_KEY_BYTES]>);

impl Aes256GcmKey {
    pub fn from_bytes(bytes: [u8; AES_256_KEY_BYTES]) -> Self {
        Self(Zeroizing::new(bytes))
    }

    fn as_slice(&self) -> &[u8] {
        self.0.as_slice()
    }
}

impl core::fmt::Debug for Aes256GcmKey {
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        f.write_str("Aes256GcmKey([redacted])")
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Aes256GcmSealed {
    pub ciphertext: Vec<u8>,
    pub tag: [u8; GCM_TAG_BYTES],
}

#[derive(Debug, thiserror::Error, PartialEq, Eq)]
pub enum AesGcmError {
    #[error("AES-256-GCM key rejected")]
    InvalidKey,

    #[error("AES-256-GCM authentication failed")]
    AuthenticationFailed,
}

impl From<aes_gcm::Error> for AesGcmError {
    fn from(_: aes_gcm::Error) -> Self {
        Self::AuthenticationFailed
    }
}

pub type AesGcmResult<T> = Result<T, AesGcmError>;

pub fn encrypt_aes256_gcm(
    mut key: Aes256GcmKey,
    nonce: &[u8; GCM_NONCE_BYTES],
    aad: &[u8],
    plaintext: &[u8],
) -> AesGcmResult<Aes256GcmSealed> {
    let cipher = Aes256Gcm::new_from_slice(key.as_slice()).map_err(|_| AesGcmError::InvalidKey)?;
    let mut ciphertext = plaintext.to_vec();
    let tag = cipher.encrypt_in_place_detached(Nonce::from_slice(nonce), aad, &mut ciphertext)?;
    key.0.zeroize();

    let mut tag_bytes = [0u8; GCM_TAG_BYTES];
    tag_bytes.copy_from_slice(&tag);

    Ok(Aes256GcmSealed {
        ciphertext,
        tag: tag_bytes,
    })
}

pub fn decrypt_aes256_gcm(
    mut key: Aes256GcmKey,
    nonce: &[u8; GCM_NONCE_BYTES],
    aad: &[u8],
    sealed: &Aes256GcmSealed,
) -> AesGcmResult<Vec<u8>> {
    let cipher = Aes256Gcm::new_from_slice(key.as_slice()).map_err(|_| AesGcmError::InvalidKey)?;
    let mut plaintext = sealed.ciphertext.clone();
    let tag = aes_gcm::Tag::from_slice(&sealed.tag);
    let result = cipher
        .decrypt_in_place_detached(Nonce::from_slice(nonce), aad, &mut plaintext, tag)
        .map(|_| plaintext)
        .map_err(AesGcmError::from);
    key.0.zeroize();
    result
}

#[cfg(test)]
mod tests {
    use super::*;

    fn nist_key() -> [u8; AES_256_KEY_BYTES] {
        [
            0x31, 0xbd, 0xad, 0xd9, 0x66, 0x98, 0xc2, 0x04, 0xaa, 0x9c, 0xe1, 0x44, 0x8e,
            0xa9, 0x4a, 0xe1, 0xfb, 0x4a, 0x9a, 0x0b, 0x3c, 0x9d, 0x77, 0x3b, 0x51, 0xbb,
            0x18, 0x22, 0x66, 0x6b, 0x8f, 0x22,
        ]
    }

    fn nist_nonce() -> [u8; GCM_NONCE_BYTES] {
        [
            0x0d, 0x18, 0xe0, 0x6c, 0x7c, 0x72, 0x5a, 0xc9, 0xe3, 0x62, 0xe1, 0xce,
        ]
    }

    #[test]
    fn nist_cavs_aes256_gcm_vector_matches() {
        let plaintext = [
            0x2d, 0xb5, 0x16, 0x8e, 0x93, 0x25, 0x56, 0xf8, 0x08, 0x9a, 0x06, 0x22, 0x98,
            0x1d, 0x01, 0x7d,
        ];
        let expected_ciphertext = vec![
            0xfa, 0x43, 0x62, 0x18, 0x96, 0x61, 0xd1, 0x63, 0xfc, 0xd6, 0xa5, 0x6d, 0x8b,
            0xf0, 0x40, 0x5a,
        ];
        let expected_tag = [
            0xd6, 0x36, 0xac, 0x1b, 0xbe, 0xdd, 0x5c, 0xc3, 0xee, 0x72, 0x7d, 0xc2, 0xab,
            0x4a, 0x94, 0x89,
        ];

        let sealed =
            encrypt_aes256_gcm(Aes256GcmKey::from_bytes(nist_key()), &nist_nonce(), b"", &plaintext)
                .unwrap();

        assert_eq!(sealed.ciphertext, expected_ciphertext);
        assert_eq!(sealed.tag, expected_tag);
        assert_eq!(
            decrypt_aes256_gcm(Aes256GcmKey::from_bytes(nist_key()), &nist_nonce(), b"", &sealed)
                .unwrap(),
            plaintext
        );
    }

    #[test]
    fn aad_mismatch_fails_without_plaintext() {
        let sealed = encrypt_aes256_gcm(
            Aes256GcmKey::from_bytes(nist_key()),
            &nist_nonce(),
            b"aad-v1",
            b"secret",
        )
        .unwrap();

        assert_eq!(
            decrypt_aes256_gcm(
                Aes256GcmKey::from_bytes(nist_key()),
                &nist_nonce(),
                b"aad-v2",
                &sealed
            ),
            Err(AesGcmError::AuthenticationFailed)
        );
    }

    #[test]
    fn tag_tamper_fails_without_panic() {
        let mut sealed = encrypt_aes256_gcm(
            Aes256GcmKey::from_bytes(nist_key()),
            &nist_nonce(),
            b"aad",
            b"secret",
        )
        .unwrap();
        sealed.tag[0] ^= 0x80;

        assert_eq!(
            decrypt_aes256_gcm(
                Aes256GcmKey::from_bytes(nist_key()),
                &nist_nonce(),
                b"aad",
                &sealed
            ),
            Err(AesGcmError::AuthenticationFailed)
        );
    }

    #[test]
    fn key_debug_redacts_bytes() {
        let key = Aes256GcmKey::from_bytes([0x42; AES_256_KEY_BYTES]);
        assert_eq!(format!("{key:?}"), "Aes256GcmKey([redacted])");
    }
}
