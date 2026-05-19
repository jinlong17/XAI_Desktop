#![allow(dead_code)]

use bip39::{Language, Mnemonic};

pub const DEK_BYTES: usize = 32;
pub const MNEMONIC_WORDS: usize = 24;

#[derive(Debug, thiserror::Error, PartialEq, Eq)]
pub enum MnemonicError {
    #[error("invalid DEK length: {0}")]
    InvalidDekLength(usize),

    #[error("invalid mnemonic word count: {0}")]
    InvalidWordCount(usize),

    #[error("mnemonic error: {0}")]
    Bip39(String),
}

impl From<bip39::Error> for MnemonicError {
    fn from(value: bip39::Error) -> Self {
        Self::Bip39(value.to_string())
    }
}

pub type MnemonicResult<T> = Result<T, MnemonicError>;

pub fn encode_dek_mnemonic(dek: &[u8; DEK_BYTES]) -> MnemonicResult<String> {
    Ok(Mnemonic::from_entropy_in(Language::English, dek)?.to_string())
}

pub fn decode_dek_mnemonic(phrase: &str) -> MnemonicResult<[u8; DEK_BYTES]> {
    let word_count = phrase.split_whitespace().count();
    if word_count != MNEMONIC_WORDS {
        return Err(MnemonicError::InvalidWordCount(word_count));
    }

    let mnemonic = Mnemonic::parse_in(Language::English, phrase)?;
    let entropy = mnemonic.to_entropy();
    if entropy.len() != DEK_BYTES {
        return Err(MnemonicError::InvalidDekLength(entropy.len()));
    }

    let mut dek = [0u8; DEK_BYTES];
    dek.copy_from_slice(&entropy);
    Ok(dek)
}

#[cfg(test)]
mod tests {
    use super::*;

    const TEST_DEK: [u8; DEK_BYTES] = [
        0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
        0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f,
        0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17,
        0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f,
    ];

    const EXPECTED_PHRASE: &str = "abandon amount liar amount expire adjust cage candy arch gather drum bullet \
        absurd math era live bid rhythm alien crouch range attend journey unaware";

    #[test]
    fn encodes_256_bit_dek_to_24_english_words() {
        let phrase = encode_dek_mnemonic(&TEST_DEK).unwrap();
        assert_eq!(phrase, EXPECTED_PHRASE);
        assert_eq!(phrase.split_whitespace().count(), MNEMONIC_WORDS);
    }

    #[test]
    fn decodes_24_words_to_original_dek() {
        assert_eq!(decode_dek_mnemonic(EXPECTED_PHRASE).unwrap(), TEST_DEK);
    }

    #[test]
    fn rejects_non_24_word_mnemonic_for_dek_backup() {
        let phrase = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
        assert_eq!(
            decode_dek_mnemonic(phrase),
            Err(MnemonicError::InvalidWordCount(12))
        );
    }
}
