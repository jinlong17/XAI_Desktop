#![allow(dead_code)]

use argon2::{Algorithm, Argon2, AssociatedData, Params, ParamsBuilder, Version};
use zeroize::Zeroize;

use super::kdf::{auth_hkdf_salt, hkdf_sha256_16, KdfResult, AUTH_INFO, KEY_BYTES};

pub const KEK_KDF_VERSION: u8 = 1;
pub const KEK_MEMORY_KIB: u32 = 64 * 1024;
pub const KEK_TIME_COST: u32 = 3;
pub const KEK_PARALLELISM: u32 = 4;

pub const AUTH_MEMORY_KIB: u32 = 16 * 1024;
pub const AUTH_TIME_COST: u32 = 1;
pub const AUTH_PARALLELISM: u32 = 1;

fn argon2id_32(
    password: &[u8],
    salt: &[u8],
    secret: &[u8],
    params: Params,
) -> KdfResult<[u8; KEY_BYTES]> {
    let context = Argon2::new_with_secret(secret, Algorithm::Argon2id, Version::V0x13, params)?;
    let mut out = [0u8; KEY_BYTES];
    context.hash_password_into(password, salt, &mut out)?;
    Ok(out)
}

pub fn derive_kek(
    master_password: &[u8],
    kek_salt: &[u8],
    secret_key: &[u8],
) -> KdfResult<[u8; KEY_BYTES]> {
    let params = Params::new(
        KEK_MEMORY_KIB,
        KEK_TIME_COST,
        KEK_PARALLELISM,
        Some(KEY_BYTES),
    )?;

    argon2id_32(master_password, kek_salt, secret_key, params)
}

pub fn derive_auth_password(
    email: &str,
    master_password: &[u8],
    secret_key: &[u8],
) -> KdfResult<[u8; KEY_BYTES]> {
    let salt = auth_hkdf_salt(email);
    let mut ikm = Vec::with_capacity(master_password.len() + secret_key.len());
    ikm.extend_from_slice(master_password);
    ikm.extend_from_slice(secret_key);

    let mut intermediate = hkdf_sha256_16(&ikm, &salt, AUTH_INFO)?;
    ikm.zeroize();

    let params = Params::new(
        AUTH_MEMORY_KIB,
        AUTH_TIME_COST,
        AUTH_PARALLELISM,
        Some(KEY_BYTES),
    )?;

    let result = argon2id_32(&intermediate, &salt, &[], params);
    intermediate.zeroize();
    result
}

pub fn rfc9106_argon2id_v19_vector() -> KdfResult<[u8; KEY_BYTES]> {
    let params = ParamsBuilder::new()
        .m_cost(32)
        .t_cost(3)
        .p_cost(4)
        .data(AssociatedData::new(&[0x04; 12])?)
        .output_len(KEY_BYTES)
        .build()?;

    argon2id_32(&[0x01; 32], &[0x02; 16], &[0x03; 8], params)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rfc9106_argon2id_v19_vector_matches() {
        let expected = [
            0x0d, 0x64, 0x0d, 0xf5, 0x8d, 0x78, 0x76, 0x6c, 0x08, 0xc0, 0x37, 0xa3, 0x4a, 0x8b,
            0x53, 0xc9, 0xd0, 0x1e, 0xf0, 0x45, 0x2d, 0x75, 0xb6, 0x5e, 0xb5, 0x25, 0x20, 0xe9,
            0x6b, 0x01, 0xe6, 0x59,
        ];

        assert_eq!(rfc9106_argon2id_v19_vector().unwrap(), expected);
    }

    #[test]
    fn derive_kek_uses_secret_key_as_argon2_secret() {
        let master = b"correct horse battery staple";
        let salt = [2u8; 16];
        let secret_a = [3u8; 16];
        let secret_b = [4u8; 16];

        let a = derive_kek(master, &salt, &secret_a).unwrap();
        let b = derive_kek(master, &salt, &secret_b).unwrap();

        assert_ne!(a, b);
    }

    #[test]
    fn derive_auth_password_is_dual_factor() {
        let email = "user@example.com";
        let master = b"correct horse battery staple";
        let secret_a = [3u8; 16];
        let secret_b = [4u8; 16];

        let a = derive_auth_password(email, master, &secret_a).unwrap();
        let b = derive_auth_password(email, master, &secret_b).unwrap();

        assert_ne!(a, b);
    }

    #[test]
    fn kdf_version_and_parameters_match_prd() {
        assert_eq!(KEK_KDF_VERSION, 1);
        assert_eq!(
            (KEK_TIME_COST, KEK_MEMORY_KIB, KEK_PARALLELISM),
            (3, 64 * 1024, 4)
        );
        assert_eq!(
            (AUTH_TIME_COST, AUTH_MEMORY_KIB, AUTH_PARALLELISM),
            (1, 16 * 1024, 1)
        );
    }
}
