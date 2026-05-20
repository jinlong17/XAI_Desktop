use ed25519_dalek::{Signature, Signer, SigningKey, VerifyingKey};
use hpke::{
    aead::AesGcm256,
    kdf::HkdfSha256,
    kem::{Kem as HpkeKemTrait, X25519HkdfSha256},
    setup_receiver, Deserializable,
};

use super::argon2::rfc9106_argon2id_v19_vector;

#[test]
fn rfc9106_argon2id_v19_vector_matches() {
    assert_eq!(
        hex(&rfc9106_argon2id_v19_vector().unwrap()),
        "0d640df58d78766c08c037a34a8b53c9d01ef0452d75b65eb52520e96b01e659"
    );
}

#[test]
fn rfc8032_ed25519_test_vector_1_signs_and_verify_strict_accepts() {
    let seed = bytes32("9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60");
    let expected_public =
        bytes32("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a");
    let expected_signature = bytes64(concat!(
        "e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e06522490155",
        "5fb8821590a33bacc61e39701cf9b46bd25bf5f0595bbe24655141438e7a100b"
    ));

    let signing_key = SigningKey::from_bytes(&seed);
    let verifying_key: VerifyingKey = signing_key.verifying_key();
    let signature: Signature = signing_key.sign(b"");

    assert_eq!(verifying_key.to_bytes(), expected_public);
    assert_eq!(signature.to_bytes(), expected_signature);
    verifying_key.verify_strict(b"", &signature).unwrap();
}

#[test]
fn rfc9180_hpke_base_x25519_hkdf_sha256_aes256gcm_vector_opens() {
    let sk_recip =
        hex_bytes("497b4502664cfea5d5af0b39934dac72242a74f8480451e1aee7d6a53320333d");
    let encapped =
        hex_bytes("6c93e09869df3402d7bf231bf540fadd35cd56be14f97178f0954db94b7fc256");
    let info = hex_bytes("4f6465206f6e2061204772656369616e2055726e");
    let aad = hex_bytes("436f756e742d30");
    let ciphertext = hex_bytes(concat!(
        "e5d84cd531cfb583096e7cfa9641bd3079cf3a91cda813c52deb5f512be99319",
        "80a41de125a925cdad859d5b7a"
    ));
    let expected_plaintext = hex_bytes("4265617574792069732074727574682c20747275746820626561757479");
    let expected_export =
        hex_bytes("ded6cffafaea6b812cbf3e241e88332adbc077aca81512914213810ee291770a");

    let sk = <X25519HkdfSha256 as HpkeKemTrait>::PrivateKey::from_bytes(&sk_recip).unwrap();
    let enc = <X25519HkdfSha256 as HpkeKemTrait>::EncappedKey::from_bytes(&encapped).unwrap();
    let mut receiver =
        setup_receiver::<AesGcm256, HkdfSha256, X25519HkdfSha256>(
            &hpke::OpModeR::Base,
            &sk,
            &enc,
            &info,
        )
        .unwrap();

    assert_eq!(receiver.open(&ciphertext, &aad).unwrap(), expected_plaintext);

    let mut exported = vec![0u8; 32];
    receiver.export(b"", &mut exported).unwrap();
    assert_eq!(exported, expected_export);
}

#[test]
fn ed25519_dalek_exact_pin_is_v2_or_newer() {
    let pinned = include_str!("../../Cargo.toml");
    assert!(pinned.contains("ed25519-dalek = { version = \"=2.2.0\""));
}

#[test]
fn strict_verify_tripwire_has_active_subject() {
    let source = include_str!("recovery_signing.rs");
    assert!(source.contains("verify_strict("));
    assert!(!source.contains(".verify("));
}

fn hex(bytes: &[u8]) -> String {
    const HEX: &[u8; 16] = b"0123456789abcdef";
    let mut out = String::with_capacity(bytes.len() * 2);
    for byte in bytes {
        out.push(HEX[(byte >> 4) as usize] as char);
        out.push(HEX[(byte & 0x0f) as usize] as char);
    }
    out
}

fn bytes32(input: &str) -> [u8; 32] {
    let bytes = hex_bytes(input);
    let mut out = [0u8; 32];
    out.copy_from_slice(&bytes);
    out
}

fn bytes64(input: &str) -> [u8; 64] {
    let bytes = hex_bytes(input);
    let mut out = [0u8; 64];
    out.copy_from_slice(&bytes);
    out
}

fn hex_bytes(input: &str) -> Vec<u8> {
    assert_eq!(input.len() % 2, 0);
    input
        .as_bytes()
        .chunks_exact(2)
        .map(|pair| (hex_nibble(pair[0]) << 4) | hex_nibble(pair[1]))
        .collect()
}

fn hex_nibble(value: u8) -> u8 {
    match value {
        b'0'..=b'9' => value - b'0',
        b'a'..=b'f' => value - b'a' + 10,
        b'A'..=b'F' => value - b'A' + 10,
        _ => panic!("invalid hex byte: {value}"),
    }
}
