import { webCryptoError } from "../errors";
import type { EnvelopeHeader } from "../types";
import { concatBytes, copyBytes } from "./buffers";

const ENVELOPE_VERSION = 1;
const TAG_BYTES = 16;
const HEADER_BYTES = 1 + 1 + 4 + 8 + 4;

export interface EnvelopePayload {
  header: EnvelopeHeader;
  ciphertext: Uint8Array;
  tag: Uint8Array;
}

export interface EncodedEnvelope extends EnvelopePayload {
  envelope: Uint8Array;
}

export function encodeEnvelope(input: {
  kdfVersion: number;
  keyId: number;
  encryptionDeviceId: string;
  counter: number;
  ciphertext: Uint8Array;
  tag: Uint8Array;
}): EncodedEnvelope {
  assertHeaderInts(input.kdfVersion, input.keyId, input.counter);
  if (!(input.tag instanceof Uint8Array) || input.tag.byteLength !== TAG_BYTES) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "Envelope tag must be 16 bytes");
  }
  if (!(input.ciphertext instanceof Uint8Array) || input.ciphertext.byteLength < 1) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "Envelope ciphertext must be non-empty");
  }

  const encryptionDeviceId = parseDeviceId(input.encryptionDeviceId);
  const nonce = deriveNonce(encryptionDeviceId, input.counter);

  const headerBytes = new Uint8Array(HEADER_BYTES);
  const view = new DataView(headerBytes.buffer);
  view.setUint8(0, ENVELOPE_VERSION);
  view.setUint8(1, input.kdfVersion);
  view.setUint32(2, input.keyId, true);
  view.setBigUint64(6, encryptionDeviceId, true);
  view.setUint32(14, input.counter, true);

  const header: EnvelopeHeader = {
    version: 1,
    kdfVersion: input.kdfVersion,
    keyId: input.keyId,
    encryptionDeviceId: input.encryptionDeviceId,
    counter: input.counter,
    nonce,
  };

  return {
    header,
    ciphertext: copyBytes(input.ciphertext),
    tag: copyBytes(input.tag),
    envelope: concatBytes(headerBytes, input.ciphertext, input.tag),
  };
}

export function decodeEnvelope(envelope: Uint8Array): EnvelopePayload {
  if (!(envelope instanceof Uint8Array) || envelope.byteLength <= HEADER_BYTES + TAG_BYTES) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "Envelope payload is too short");
  }

  const headerBytes = envelope.slice(0, HEADER_BYTES);
  const view = new DataView(headerBytes.buffer, headerBytes.byteOffset, headerBytes.byteLength);
  const version = view.getUint8(0);
  if (version !== ENVELOPE_VERSION) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "Envelope version is unsupported");
  }

  const kdfVersion = view.getUint8(1);
  const keyId = view.getUint32(2, true);
  const encryptionDeviceId = view.getBigUint64(6, true);
  const counter = view.getUint32(14, true);
  const nonce = deriveNonce(encryptionDeviceId, counter);

  const tagStart = envelope.byteLength - TAG_BYTES;
  const ciphertext = envelope.slice(HEADER_BYTES, tagStart);
  const tag = envelope.slice(tagStart);

  const header: EnvelopeHeader = {
    version: 1,
    kdfVersion,
    keyId,
    encryptionDeviceId: encryptionDeviceId.toString(),
    counter,
    nonce,
  };

  return {
    header,
    ciphertext,
    tag,
  };
}

export function packCiphertextAndTag(ciphertext: Uint8Array, tag: Uint8Array): Uint8Array {
  if (!(ciphertext instanceof Uint8Array) || ciphertext.byteLength < 1) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "Ciphertext must be non-empty");
  }
  if (!(tag instanceof Uint8Array) || tag.byteLength !== TAG_BYTES) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "Tag must be 16 bytes");
  }
  return concatBytes(ciphertext, tag);
}

function deriveNonce(encryptionDeviceId: bigint, counter: number): Uint8Array {
  assertCounter(counter);
  const nonce = new Uint8Array(12);
  const view = new DataView(nonce.buffer);
  view.setBigUint64(0, encryptionDeviceId, true);
  view.setUint32(8, counter, true);
  return nonce;
}

function parseDeviceId(input: string): bigint {
  if (!input) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "encryptionDeviceId must be non-empty");
  }

  let value: bigint;
  try {
    value = BigInt(input);
  } catch (cause) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "encryptionDeviceId must be an unsigned integer string", {
      cause,
    });
  }

  if (value < 0n || value > 0xffffffffffffffffn) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "encryptionDeviceId must fit uint64");
  }

  return value;
}

function assertCounter(counter: number): void {
  if (!Number.isSafeInteger(counter) || counter < 0 || counter > 0xffffffff) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "counter must be uint32");
  }
}

function assertHeaderInts(kdfVersion: number, keyId: number, counter: number): void {
  if (!Number.isSafeInteger(kdfVersion) || kdfVersion < 0 || kdfVersion > 0xff) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "kdfVersion must fit uint8");
  }
  if (!Number.isSafeInteger(keyId) || keyId < 0 || keyId > 0xffffffff) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "keyId must fit uint32");
  }
  assertCounter(counter);
}
