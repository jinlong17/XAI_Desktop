#![allow(dead_code)]

use hkdf::{Hkdf, InvalidLength};
use sha2::Sha256;

pub const KEY_BYTES: usize = 32;
pub const AUTH_INTERMEDIATE_BYTES: usize = 16;

pub const AUTH_INFO: &[u8] = b"xai.auth.v1";
pub const DB_KEY_INFO: &[u8] = b"xai.sqlite.v1";
pub const RECOVERY_SEED_INFO: &[u8] = b"xai.recovery.sig.v1";

#[derive(Debug, thiserror::Error)]
pub enum KdfError {
    #[error("argon2 derivation failed: {0}")]
    Argon2(String),

    #[error("hkdf output length is invalid")]
    HkdfInvalidLength,
}

impl From<argon2::Error> for KdfError {
    fn from(value: argon2::Error) -> Self {
        Self::Argon2(value.to_string())
    }
}

impl From<InvalidLength> for KdfError {
    fn from(_: InvalidLength) -> Self {
        Self::HkdfInvalidLength
    }
}

pub type KdfResult<T> = Result<T, KdfError>;

pub fn auth_hkdf_salt(email: &str) -> Vec<u8> {
    let mut salt = Vec::with_capacity(email.len() + AUTH_INFO.len());
    salt.extend_from_slice(email.as_bytes());
    salt.extend_from_slice(AUTH_INFO);
    salt
}

pub fn hkdf_sha256_16(
    ikm: &[u8],
    salt: &[u8],
    info: &[u8],
) -> KdfResult<[u8; AUTH_INTERMEDIATE_BYTES]> {
    let hk = Hkdf::<Sha256>::new(Some(salt), ikm);
    let mut out = [0u8; AUTH_INTERMEDIATE_BYTES];
    hk.expand(info, &mut out)?;
    Ok(out)
}

pub fn hkdf_sha256_32(ikm: &[u8], salt: &[u8], info: &[u8]) -> KdfResult<[u8; KEY_BYTES]> {
    let hk = Hkdf::<Sha256>::new(Some(salt), ikm);
    let mut out = [0u8; KEY_BYTES];
    hk.expand(info, &mut out)?;
    Ok(out)
}

pub fn derive_db_key(kek: &[u8; KEY_BYTES]) -> KdfResult<[u8; KEY_BYTES]> {
    hkdf_sha256_32(kek, &[], DB_KEY_INFO)
}

pub fn derive_recovery_seed(dek: &[u8; KEY_BYTES]) -> KdfResult<[u8; KEY_BYTES]> {
    hkdf_sha256_32(dek, &[], RECOVERY_SEED_INFO)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn auth_salt_is_email_bytes_plus_domain_separator() {
        assert_eq!(
            auth_hkdf_salt("user@example.com"),
            b"user@example.comxai.auth.v1"
        );
    }

    #[test]
    fn hkdf_sha256_matches_rfc5869_case_1_prefix() {
        let ikm = [0x0b; 22];
        let salt = [
            0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c,
        ];
        let info = [0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9];
        let expected = [
            0x3c, 0xb2, 0x5f, 0x25, 0xfa, 0xac, 0xd5, 0x7a, 0x90, 0x43, 0x4f, 0x64, 0xd0, 0x36,
            0x2f, 0x2a, 0x2d, 0x2d, 0x0a, 0x90, 0xcf, 0x1a, 0x5a, 0x4c, 0x5d, 0xb0, 0x2d, 0x56,
            0xec, 0xc4, 0xc5, 0xbf,
        ];

        assert_eq!(hkdf_sha256_32(&ikm, &salt, &info).unwrap(), expected);
    }

    #[test]
    fn db_key_and_recovery_seed_are_domain_separated() {
        let key = [7u8; KEY_BYTES];
        assert_ne!(
            derive_db_key(&key).unwrap(),
            derive_recovery_seed(&key).unwrap()
        );
    }
}
