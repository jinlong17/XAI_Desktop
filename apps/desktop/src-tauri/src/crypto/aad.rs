#![allow(dead_code)]

pub const AAD_V_BLOB: u64 = 1;
pub const AAD_V_WRAP: u64 = 2;
pub const RECOVERY_MSG_V: u64 = 1;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct BlobAad {
    pub account_id: [u8; 16],
    pub entity_type: String,
    pub entity_id: String,
    pub proposed_revision: u64,
    pub key_id: u64,
    pub deleted_flag: u64,
    pub schema_version: u64,
    pub encryption_device_id: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct WrapAad {
    pub account_id: [u8; 16],
    pub target_device_id: [u8; 16],
    pub key_id: u64,
    pub granted_by_device_id: [u8; 16],
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RecoveryMessageAad {
    pub challenge_id: [u8; 16],
    pub account_id: [u8; 16],
    pub payload_canonical_hash: [u8; 32],
    pub ts_ms: u64,
}

pub fn encode_blob_aad(input: &BlobAad) -> Vec<u8> {
    let mut out = Vec::new();
    write_map_len(&mut out, 9);
    write_uint(&mut out, 1);
    write_uint(&mut out, AAD_V_BLOB);
    write_uint(&mut out, 2);
    write_bstr(&mut out, &input.account_id);
    write_uint(&mut out, 3);
    write_text(&mut out, &input.entity_type);
    write_uint(&mut out, 4);
    write_text(&mut out, &input.entity_id);
    write_uint(&mut out, 5);
    write_uint(&mut out, input.proposed_revision);
    write_uint(&mut out, 6);
    write_uint(&mut out, input.key_id);
    write_uint(&mut out, 7);
    write_uint(&mut out, input.deleted_flag);
    write_uint(&mut out, 8);
    write_uint(&mut out, input.schema_version);
    write_uint(&mut out, 9);
    write_uint(&mut out, input.encryption_device_id);
    out
}

pub fn encode_wrap_aad(input: &WrapAad) -> Vec<u8> {
    let mut out = Vec::new();
    write_map_len(&mut out, 5);
    write_uint(&mut out, 1);
    write_uint(&mut out, AAD_V_WRAP);
    write_uint(&mut out, 2);
    write_bstr(&mut out, &input.account_id);
    write_uint(&mut out, 3);
    write_bstr(&mut out, &input.target_device_id);
    write_uint(&mut out, 4);
    write_uint(&mut out, input.key_id);
    write_uint(&mut out, 5);
    write_bstr(&mut out, &input.granted_by_device_id);
    out
}

pub fn encode_recovery_message_aad(input: &RecoveryMessageAad) -> Vec<u8> {
    let mut out = Vec::new();
    write_map_len(&mut out, 5);
    write_uint(&mut out, 1);
    write_uint(&mut out, RECOVERY_MSG_V);
    write_uint(&mut out, 2);
    write_bstr(&mut out, &input.challenge_id);
    write_uint(&mut out, 3);
    write_bstr(&mut out, &input.account_id);
    write_uint(&mut out, 4);
    write_bstr(&mut out, &input.payload_canonical_hash);
    write_uint(&mut out, 5);
    write_uint(&mut out, input.ts_ms);
    out
}

fn write_map_len(out: &mut Vec<u8>, len: u64) {
    write_type_and_len(out, 5, len);
}

fn write_uint(out: &mut Vec<u8>, value: u64) {
    write_type_and_len(out, 0, value);
}

fn write_bstr(out: &mut Vec<u8>, bytes: &[u8]) {
    write_type_and_len(out, 2, bytes.len() as u64);
    out.extend_from_slice(bytes);
}

fn write_text(out: &mut Vec<u8>, text: &str) {
    write_type_and_len(out, 3, text.len() as u64);
    out.extend_from_slice(text.as_bytes());
}

fn write_type_and_len(out: &mut Vec<u8>, major: u8, value: u64) {
    let mt = major << 5;
    match value {
        0..=23 => out.push(mt | value as u8),
        24..=0xff => {
            out.push(mt | 24);
            out.push(value as u8);
        }
        0x100..=0xffff => {
            out.push(mt | 25);
            out.extend_from_slice(&(value as u16).to_be_bytes());
        }
        0x1_0000..=0xffff_ffff => {
            out.push(mt | 26);
            out.extend_from_slice(&(value as u32).to_be_bytes());
        }
        _ => {
            out.push(mt | 27);
            out.extend_from_slice(&value.to_be_bytes());
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ciborium::value::Value;
    use serde::Deserialize;

    #[derive(Debug, Deserialize)]
    struct FixtureFile {
        vectors: Vec<VectorFixture>,
    }

    #[derive(Debug, Deserialize)]
    struct VectorFixture {
        name: String,
        expected_cbor_hex: String,
    }

    fn fixture_hex(name: &str) -> String {
        let fixture: FixtureFile = serde_json::from_str(include_str!(
            "../../tests/fixtures/cbor_aad_vectors.json"
        ))
        .unwrap();
        fixture
            .vectors
            .into_iter()
            .find(|vector| vector.name == name)
            .unwrap()
            .expected_cbor_hex
            .replace(' ', "")
    }

    fn to_hex(bytes: &[u8]) -> String {
        const HEX: &[u8; 16] = b"0123456789abcdef";
        let mut out = String::with_capacity(bytes.len() * 2);
        for byte in bytes {
            out.push(HEX[(byte >> 4) as usize] as char);
            out.push(HEX[(byte & 0x0f) as usize] as char);
        }
        out
    }

    fn assert_ciborium_parses(bytes: &[u8]) {
        let value: Value = ciborium::de::from_reader(bytes).unwrap();
        match value {
            Value::Map(_) => {}
            other => panic!("expected map, got {other:?}"),
        }
    }

    #[test]
    fn blob_aad_vector_matches_fixture() {
        let aad = BlobAad {
            account_id: [
                0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,
                0x0c, 0x0d, 0x0e, 0x0f,
            ],
            entity_type: "todos".to_string(),
            entity_id: "todo-1".to_string(),
            proposed_revision: 7,
            key_id: 1,
            deleted_flag: 0,
            schema_version: 1,
            encryption_device_id: 100_042,
        };

        let encoded = encode_blob_aad(&aad);
        assert_eq!(to_hex(&encoded), fixture_hex("blob_aad_v1"));
        assert_ciborium_parses(&encoded);
    }

    #[test]
    fn wrap_aad_vector_matches_fixture() {
        let aad = WrapAad {
            account_id: [
                0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b,
                0x1c, 0x1d, 0x1e, 0x1f,
            ],
            target_device_id: [
                0x20, 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x2b,
                0x2c, 0x2d, 0x2e, 0x2f,
            ],
            key_id: 3,
            granted_by_device_id: [
                0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x3b,
                0x3c, 0x3d, 0x3e, 0x3f,
            ],
        };

        let encoded = encode_wrap_aad(&aad);
        assert_eq!(to_hex(&encoded), fixture_hex("wrap_aad_v2"));
        assert_ciborium_parses(&encoded);
    }

    #[test]
    fn recovery_message_vector_matches_fixture() {
        let aad = RecoveryMessageAad {
            challenge_id: [
                0x40, 0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4a, 0x4b,
                0x4c, 0x4d, 0x4e, 0x4f,
            ],
            account_id: [
                0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,
                0x0c, 0x0d, 0x0e, 0x0f,
            ],
            payload_canonical_hash: [
                0x80, 0x81, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8a, 0x8b,
                0x8c, 0x8d, 0x8e, 0x8f, 0x90, 0x91, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97,
                0x98, 0x99, 0x9a, 0x9b, 0x9c, 0x9d, 0x9e, 0x9f,
            ],
            ts_ms: 1000,
        };

        let encoded = encode_recovery_message_aad(&aad);
        assert_eq!(to_hex(&encoded), fixture_hex("recovery_message_v1"));
        assert_ciborium_parses(&encoded);
    }
}
