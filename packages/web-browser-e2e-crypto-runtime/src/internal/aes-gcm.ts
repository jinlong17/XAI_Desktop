import { webCryptoError } from "../errors";
import type { BlobAadInput, DecryptBlobInput, DecryptBlobResult, EncryptBlobInput, EncryptBlobResult } from "../types";
import { asBufferSource, requireSubtleCrypto } from "./webcrypto";
import { deriveBlobAadBytes } from "./aad";
import { decodeEnvelope, encodeEnvelope, packCiphertextAndTag } from "./envelope";
import { zeroizeBuffer } from "./buffers";

export async function encryptBlobWithDek(input: {
  dekKey: CryptoKey;
  kdfVersion: number;
  currentKeyId: number;
  payload: EncryptBlobInput;
}): Promise<EncryptBlobResult> {
  validateEncryptInput(input.payload);
  if (input.payload.aad.keyId !== input.currentKeyId) {
    throw webCryptoError("E_WEB_CRYPTO_WRAP_KEY_MISMATCH", "AAD keyId does not match the unlocked session key id");
  }

  const subtle = requireSubtleCrypto();
  const aadBytes = deriveBlobAadBytes(input.payload.aad);
  const nonce = deriveNonceForEncrypt(input.payload.aad, input.payload.counter);

  try {
    const encrypted = await subtle.encrypt(
      {
        name: "AES-GCM",
        iv: asBufferSource(nonce),
        additionalData: asBufferSource(aadBytes),
        tagLength: 128,
      },
      input.dekKey,
      asBufferSource(input.payload.plaintext),
    );

    const encryptedBytes = new Uint8Array(encrypted);
    const tag = encryptedBytes.slice(encryptedBytes.byteLength - 16);
    const ciphertext = encryptedBytes.slice(0, encryptedBytes.byteLength - 16);

    const encoded = encodeEnvelope({
      kdfVersion: input.kdfVersion,
      keyId: input.payload.aad.keyId,
      encryptionDeviceId: input.payload.aad.encryptionDeviceId,
      counter: input.payload.counter,
      ciphertext,
      tag,
    });

    return {
      envelope: encoded.envelope,
      header: encoded.header,
    };
  } finally {
    zeroizeBuffer(aadBytes);
    zeroizeBuffer(nonce);
  }
}

export async function decryptBlobWithDek(input: {
  dekKey: CryptoKey;
  payload: DecryptBlobInput;
}): Promise<DecryptBlobResult> {
  validateDecryptInput(input.payload);

  const subtle = requireSubtleCrypto();
  const decoded = decodeEnvelope(input.payload.envelope);
  const aadBytes = deriveBlobAadBytes(input.payload.aad);
  const expectedNonce = deriveNonceForEncrypt(input.payload.aad, decoded.header.counter);

  if (!bytesEqual(expectedNonce, decoded.header.nonce)) {
    throw webCryptoError("E_WEB_CRYPTO_AAD_MISMATCH", "Envelope nonce does not match deterministic AAD context");
  }

  const ciphertextWithTag = packCiphertextAndTag(decoded.ciphertext, decoded.tag);

  try {
    const plaintext = await subtle.decrypt(
      {
        name: "AES-GCM",
        iv: asBufferSource(decoded.header.nonce),
        additionalData: asBufferSource(aadBytes),
        tagLength: 128,
      },
      input.dekKey,
      asBufferSource(ciphertextWithTag),
    );

    return {
      plaintext: new Uint8Array(plaintext),
      header: decoded.header,
    };
  } catch (cause) {
    throw webCryptoError("E_WEB_CRYPTO_AAD_MISMATCH", "Blob decrypt failed due to tag/AAD mismatch", { cause });
  } finally {
    zeroizeBuffer(aadBytes);
    zeroizeBuffer(expectedNonce);
    zeroizeBuffer(ciphertextWithTag);
  }
}

function validateEncryptInput(input: EncryptBlobInput): void {
  if (!(input.plaintext instanceof Uint8Array) || input.plaintext.byteLength < 1) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "Encrypt plaintext must be a non-empty Uint8Array");
  }
  if (!Number.isSafeInteger(input.counter) || input.counter < 0 || input.counter > 0xffffffff) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "Encrypt counter must fit uint32");
  }
}

function validateDecryptInput(input: DecryptBlobInput): void {
  if (!(input.envelope instanceof Uint8Array) || input.envelope.byteLength < 1) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "Decrypt envelope must be a non-empty Uint8Array");
  }
}

function deriveNonceForEncrypt(aad: BlobAadInput, counter: number): Uint8Array {
  if (!Number.isSafeInteger(counter) || counter < 0 || counter > 0xffffffff) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "counter must fit uint32");
  }

  let encryptionDeviceId: bigint;
  try {
    encryptionDeviceId = BigInt(aad.encryptionDeviceId);
  } catch (cause) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "aad.encryptionDeviceId must be an unsigned integer string", {
      cause,
    });
  }

  if (encryptionDeviceId < 0n || encryptionDeviceId > 0xffffffffffffffffn) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "aad.encryptionDeviceId must fit uint64");
  }

  const nonce = new Uint8Array(12);
  const view = new DataView(nonce.buffer);
  view.setBigUint64(0, encryptionDeviceId, true);
  view.setUint32(8, counter, true);
  return nonce;
}

function bytesEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.byteLength !== right.byteLength) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < left.byteLength; i += 1) {
    diff |= left[i]! ^ right[i]!;
  }
  return diff === 0;
}
