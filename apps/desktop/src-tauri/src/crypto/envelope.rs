#![allow(dead_code)]

use super::aes_gcm::{Aes256GcmSealed, GCM_NONCE_BYTES, GCM_TAG_BYTES};

pub const ENVELOPE_VERSION: u8 = 1;
pub const KDF_VERSION: u8 = 1;
pub const HEADER_BYTES: usize = 1 + 1 + 4 + 8 + 4;
pub const MIN_ENVELOPE_BYTES: usize = HEADER_BYTES + GCM_TAG_BYTES;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CipherEnvelope {
    pub v: u8,
    pub kdf_v: u8,
    pub key_id: u32,
    pub encryption_device_id: u64,
    pub counter: u32,
    pub ciphertext: Vec<u8>,
    pub tag: [u8; GCM_TAG_BYTES],
}

#[derive(Debug, thiserror::Error, PartialEq, Eq)]
pub enum EnvelopeError {
    #[error("envelope too short")]
    TooShort,

    #[error("unsupported envelope version: {0}")]
    UnsupportedVersion(u8),

    #[error("unsupported KDF version: {0}")]
    UnsupportedKdfVersion(u8),

    #[error("invalid key_id: {0}")]
    InvalidKeyId(u32),
}

impl CipherEnvelope {
    pub fn new(
        key_id: u32,
        encryption_device_id: u64,
        counter: u32,
        sealed: Aes256GcmSealed,
    ) -> Result<Self, EnvelopeError> {
        if key_id == 0 {
            return Err(EnvelopeError::InvalidKeyId(key_id));
        }

        Ok(Self {
            v: ENVELOPE_VERSION,
            kdf_v: KDF_VERSION,
            key_id,
            encryption_device_id,
            counter,
            ciphertext: sealed.ciphertext,
            tag: sealed.tag,
        })
    }

    pub fn nonce(&self) -> [u8; GCM_NONCE_BYTES] {
        let mut nonce = [0u8; GCM_NONCE_BYTES];
        nonce[..8].copy_from_slice(&self.encryption_device_id.to_le_bytes());
        nonce[8..].copy_from_slice(&self.counter.to_le_bytes());
        nonce
    }

    pub fn sealed(&self) -> Aes256GcmSealed {
        Aes256GcmSealed {
            ciphertext: self.ciphertext.clone(),
            tag: self.tag,
        }
    }
}

pub fn serialize_envelope(envelope: &CipherEnvelope) -> Vec<u8> {
    let mut out = Vec::with_capacity(HEADER_BYTES + envelope.ciphertext.len() + GCM_TAG_BYTES);
    out.push(envelope.v);
    out.push(envelope.kdf_v);
    out.extend_from_slice(&envelope.key_id.to_le_bytes());
    out.extend_from_slice(&envelope.encryption_device_id.to_le_bytes());
    out.extend_from_slice(&envelope.counter.to_le_bytes());
    out.extend_from_slice(&envelope.ciphertext);
    out.extend_from_slice(&envelope.tag);
    out
}

pub fn parse_envelope(bytes: &[u8]) -> Result<CipherEnvelope, EnvelopeError> {
    if bytes.len() < MIN_ENVELOPE_BYTES {
        return Err(EnvelopeError::TooShort);
    }

    let v = bytes[0];
    if v != ENVELOPE_VERSION {
        return Err(EnvelopeError::UnsupportedVersion(v));
    }

    let kdf_v = bytes[1];
    if kdf_v != KDF_VERSION {
        return Err(EnvelopeError::UnsupportedKdfVersion(kdf_v));
    }

    let key_id = u32::from_le_bytes(bytes[2..6].try_into().expect("slice length fixed"));
    if key_id == 0 {
        return Err(EnvelopeError::InvalidKeyId(key_id));
    }

    let encryption_device_id =
        u64::from_le_bytes(bytes[6..14].try_into().expect("slice length fixed"));
    let counter = u32::from_le_bytes(bytes[14..18].try_into().expect("slice length fixed"));
    let ciphertext_end = bytes.len() - GCM_TAG_BYTES;
    let ciphertext = bytes[HEADER_BYTES..ciphertext_end].to_vec();
    let mut tag = [0u8; GCM_TAG_BYTES];
    tag.copy_from_slice(&bytes[ciphertext_end..]);

    Ok(CipherEnvelope {
        v,
        kdf_v,
        key_id,
        encryption_device_id,
        counter,
        ciphertext,
        tag,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_sealed() -> Aes256GcmSealed {
        Aes256GcmSealed {
            ciphertext: vec![0xaa, 0xbb, 0xcc],
            tag: [
                0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b,
                0x1c, 0x1d, 0x1e, 0x1f,
            ],
        }
    }

    #[test]
    fn envelope_roundtrip_is_byte_stable() {
        let envelope = CipherEnvelope::new(7, 0x0102_0304_0506_0708, 0x0a0b_0c0d, sample_sealed())
            .unwrap();
        let bytes = serialize_envelope(&envelope);
        let expected = vec![
            0x01, 0x01, 0x07, 0x00, 0x00, 0x00, 0x08, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02,
            0x01, 0x0d, 0x0c, 0x0b, 0x0a, 0xaa, 0xbb, 0xcc, 0x10, 0x11, 0x12, 0x13, 0x14,
            0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f,
        ];

        assert_eq!(bytes, expected);
        assert_eq!(parse_envelope(&bytes).unwrap(), envelope);
    }

    #[test]
    fn nonce_reconstructs_from_little_endian_fields() {
        let envelope = CipherEnvelope::new(1, 0x0102_0304_0506_0708, 0x0a0b_0c0d, sample_sealed())
            .unwrap();
        assert_eq!(
            envelope.nonce(),
            [
                0x08, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01, 0x0d, 0x0c, 0x0b, 0x0a,
            ]
        );
    }

    #[test]
    fn malformed_short_envelope_returns_error() {
        assert_eq!(parse_envelope(&[0u8; MIN_ENVELOPE_BYTES - 1]), Err(EnvelopeError::TooShort));
    }

    #[test]
    fn unsupported_versions_are_rejected() {
        let mut bytes = serialize_envelope(
            &CipherEnvelope::new(1, 1, 1, sample_sealed()).expect("valid fixture envelope"),
        );
        bytes[0] = 0;
        assert_eq!(parse_envelope(&bytes), Err(EnvelopeError::UnsupportedVersion(0)));

        bytes[0] = ENVELOPE_VERSION;
        bytes[1] = 0;
        assert_eq!(
            parse_envelope(&bytes),
            Err(EnvelopeError::UnsupportedKdfVersion(0))
        );
    }

    #[test]
    fn key_id_zero_is_rejected() {
        assert_eq!(
            CipherEnvelope::new(0, 1, 1, sample_sealed()),
            Err(EnvelopeError::InvalidKeyId(0))
        );
    }
}
