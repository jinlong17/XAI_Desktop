import { entropyToMnemonic, mnemonicToEntropy, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';

const DEK_BYTES = 32;
const MNEMONIC_WORDS = 24;

export function encodeDekMnemonic(dek: Uint8Array): string {
  if (dek.byteLength !== DEK_BYTES) {
    throw new Error(`E3010: invalid DEK length: ${dek.byteLength}`);
  }
  return entropyToMnemonic(dek, wordlist);
}

export function decodeDekMnemonic(phrase: string): Uint8Array {
  const wordCount = phrase.trim().split(/\s+/u).filter(Boolean).length;
  if (wordCount !== MNEMONIC_WORDS) {
    throw new Error(`E3011: invalid mnemonic word count: ${wordCount}`);
  }
  if (!validateMnemonic(phrase, wordlist)) {
    throw new Error('E3012: invalid mnemonic checksum');
  }
  return mnemonicToEntropy(phrase, wordlist);
}
