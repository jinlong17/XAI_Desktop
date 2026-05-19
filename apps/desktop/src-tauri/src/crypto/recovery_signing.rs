#![allow(dead_code)]

use ed25519_dalek::{Signature, Signer, SigningKey, VerifyingKey, SIGNATURE_LENGTH};
use zeroize::{Zeroize, Zeroizing};

use super::{
    aad::{encode_recovery_message_aad, RecoveryMessageAad},
    kdf::{derive_recovery_seed, KdfError},
    key_vault::{KeyHandleId, KeyVault, KeyVaultError},
};

pub const RECOVERY_SIGNING_PUBLIC_BYTES: usize = 32;
pub const RECOVERY_SIGNATURE_BYTES: usize = SIGNATURE_LENGTH;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RecoveryProof {
    pub recovery_signing_pub: [u8; RECOVERY_SIGNING_PUBLIC_BYTES],
    pub signature: [u8; RECOVERY_SIGNATURE_BYTES],
    pub transcript_cbor: Vec<u8>,
}

#[derive(Debug, thiserror::Error, PartialEq, Eq)]
pub enum RecoverySigningError {
    #[error("E3014: recovery signature verification failed")]
    DekCheckFailed,

    #[error("invalid Ed25519 public key")]
    InvalidPublicKey,

    #[error("key vault error: {0}")]
    KeyVault(String),

    #[error("KDF error: {0}")]
    Kdf(String),
}

impl From<KeyVaultError> for RecoverySigningError {
    fn from(value: KeyVaultError) -> Self {
        Self::KeyVault(value.to_string())
    }
}

impl From<KdfError> for RecoverySigningError {
    fn from(value: KdfError) -> Self {
        Self::Kdf(value.to_string())
    }
}

pub type RecoverySigningResult<T> = Result<T, RecoverySigningError>;

pub fn derive_recovery_signing_pub(
    vault: &KeyVault,
    dek_handle: KeyHandleId,
) -> RecoverySigningResult<[u8; RECOVERY_SIGNING_PUBLIC_BYTES]> {
    let signing_key = recovery_signing_key(vault, dek_handle)?;
    Ok(signing_key.verifying_key().to_bytes())
}

pub fn sign_recovery_transcript(
    vault: &KeyVault,
    dek_handle: KeyHandleId,
    transcript: &RecoveryMessageAad,
) -> RecoverySigningResult<RecoveryProof> {
    let transcript_cbor = encode_recovery_message_aad(transcript);
    let signing_key = recovery_signing_key(vault, dek_handle)?;
    let signature: Signature = signing_key.sign(&transcript_cbor);

    Ok(RecoveryProof {
        recovery_signing_pub: signing_key.verifying_key().to_bytes(),
        signature: signature.to_bytes(),
        transcript_cbor,
    })
}

pub fn verify_recovery_signature_strict(
    recovery_signing_pub: [u8; RECOVERY_SIGNING_PUBLIC_BYTES],
    transcript_cbor: &[u8],
    signature: [u8; RECOVERY_SIGNATURE_BYTES],
) -> RecoverySigningResult<()> {
    let verifying_key = VerifyingKey::from_bytes(&recovery_signing_pub)
        .map_err(|_| RecoverySigningError::InvalidPublicKey)?;
    let signature = Signature::from_bytes(&signature);
    verifying_key
        .verify_strict(transcript_cbor, &signature)
        .map_err(|_| RecoverySigningError::DekCheckFailed)
}

fn recovery_signing_key(
    vault: &KeyVault,
    dek_handle: KeyHandleId,
) -> RecoverySigningResult<SigningKey> {
    let mut recovery_seed = Zeroizing::new(vault.with_dek(dek_handle, derive_recovery_seed)??);
    let signing_key = SigningKey::from_bytes(&recovery_seed);
    recovery_seed.zeroize();
    Ok(signing_key)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::crypto::kdf::KEY_BYTES;

    fn transcript() -> RecoveryMessageAad {
        RecoveryMessageAad {
            challenge_id: [
                0x40, 0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47,
                0x48, 0x49, 0x4a, 0x4b, 0x4c, 0x4d, 0x4e, 0x4f,
            ],
            account_id: [
                0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
                0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f,
            ],
            payload_canonical_hash: [
                0x80, 0x81, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87,
                0x88, 0x89, 0x8a, 0x8b, 0x8c, 0x8d, 0x8e, 0x8f,
                0x90, 0x91, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97,
                0x98, 0x99, 0x9a, 0x9b, 0x9c, 0x9d, 0x9e, 0x9f,
            ],
            ts_ms: 1000,
        }
    }

    #[test]
    fn signs_and_verify_strict_accepts_canonical_transcript() {
        let mut vault = KeyVault::new();
        let dek_handle = vault.insert_dek([0x55; KEY_BYTES]).unwrap();

        let proof = sign_recovery_transcript(&vault, dek_handle, &transcript()).unwrap();

        assert_eq!(proof.recovery_signing_pub.len(), RECOVERY_SIGNING_PUBLIC_BYTES);
        assert_eq!(proof.signature.len(), RECOVERY_SIGNATURE_BYTES);
        verify_recovery_signature_strict(
            proof.recovery_signing_pub,
            &proof.transcript_cbor,
            proof.signature,
        )
        .unwrap();
    }

    #[test]
    fn recovery_public_is_deterministic_from_dek_current() {
        let mut vault = KeyVault::new();
        let first = vault.insert_dek([0x42; KEY_BYTES]).unwrap();
        let second = vault.insert_dek([0x42; KEY_BYTES]).unwrap();

        assert_eq!(
            derive_recovery_signing_pub(&vault, first).unwrap(),
            derive_recovery_signing_pub(&vault, second).unwrap()
        );
    }

    #[test]
    fn wrong_dek_public_key_fails_with_e3014() {
        let mut vault = KeyVault::new();
        let good_dek = vault.insert_dek([0x55; KEY_BYTES]).unwrap();
        let wrong_dek = vault.insert_dek([0x56; KEY_BYTES]).unwrap();
        let proof = sign_recovery_transcript(&vault, good_dek, &transcript()).unwrap();
        let wrong_pub = derive_recovery_signing_pub(&vault, wrong_dek).unwrap();

        assert_eq!(
            verify_recovery_signature_strict(wrong_pub, &proof.transcript_cbor, proof.signature),
            Err(RecoverySigningError::DekCheckFailed)
        );
    }

    #[test]
    fn transcript_tamper_fails_with_e3014() {
        let mut vault = KeyVault::new();
        let dek_handle = vault.insert_dek([0x55; KEY_BYTES]).unwrap();
        let mut proof = sign_recovery_transcript(&vault, dek_handle, &transcript()).unwrap();
        let last = proof.transcript_cbor.len() - 1;
        proof.transcript_cbor[last] ^= 0x01;

        assert_eq!(
            verify_recovery_signature_strict(
                proof.recovery_signing_pub,
                &proof.transcript_cbor,
                proof.signature,
            ),
            Err(RecoverySigningError::DekCheckFailed)
        );
    }
}
