import { decode, encode } from "cbor-x";

import { webCryptoError } from "../errors";
import type { ActiveDeviceDekWrap } from "../types";
import { asBufferSource, requireCryptoRuntime, requireSubtleCrypto } from "./webcrypto";
import { assertBytes, bytesEqual, concatBytes, copyBytes, zeroizeBuffer } from "./buffers";

const HPKE_WRAP_HKDF_SALT = new TextEncoder().encode("xai.hpke.wrap.v1.salt");
const HPKE_WRAP_SUITE = "X25519-HKDF-SHA256-AES256GCM";

interface ParsedWrapEnvelope {
  suite: string;
  ephemeralPublicKeySpki: Uint8Array;
  iv: Uint8Array;
  ciphertext: Uint8Array;
  tag: Uint8Array;
}

export interface HpkeSealInput {
  dek: Uint8Array;
  recipientPublicKeySpki: Uint8Array;
  info: Uint8Array;
  aad: Uint8Array;
  ephemeralKeypair?: {
    privateKeyPkcs8: Uint8Array;
    publicKeySpki: Uint8Array;
  };
  iv?: Uint8Array;
}

export async function sealActiveWrapForTest(input: HpkeSealInput): Promise<Uint8Array> {
  const subtle = requireSubtleCrypto();
  const cryptoRuntime = requireCryptoRuntime();
  assertDistinctInfoAndAad(input.info, input.aad);
  assertBytes(input.dek, "dek", 32);
  assertBytes(input.recipientPublicKeySpki, "recipientPublicKeySpki");
  assertBytes(input.info, "hpkeInfo");
  assertBytes(input.aad, "hpkeAad");

  const recipientPublicKey = await importX25519PublicKey(input.recipientPublicKeySpki);
  let ephemeralPrivateKey: CryptoKey;
  let ephemeralPublicKeySpki: Uint8Array;

  if (input.ephemeralKeypair) {
    assertBytes(input.ephemeralKeypair.privateKeyPkcs8, "ephemeralKeypair.privateKeyPkcs8");
    assertBytes(input.ephemeralKeypair.publicKeySpki, "ephemeralKeypair.publicKeySpki");
    ephemeralPrivateKey = await importX25519PrivateKey(input.ephemeralKeypair.privateKeyPkcs8);
    ephemeralPublicKeySpki = copyBytes(input.ephemeralKeypair.publicKeySpki);
  } else {
    const generated = await subtle.generateKey({ name: "X25519" }, true, ["deriveBits"]);
    if (!("privateKey" in generated) || !("publicKey" in generated)) {
      throw webCryptoError("E_WEB_CRYPTO_UNSUPPORTED", "X25519 keypair generation returned an unexpected key type");
    }
    ephemeralPrivateKey = generated.privateKey;
    ephemeralPublicKeySpki = new Uint8Array(await subtle.exportKey("spki", generated.publicKey));
  }

  const sharedSecret = await subtle.deriveBits(
    { name: "X25519", public: recipientPublicKey },
    ephemeralPrivateKey,
    256,
  );
  const wrapKey = await deriveHpkeAesKey(new Uint8Array(sharedSecret), input.info, "encrypt");

  const iv = input.iv ? copyBytes(input.iv) : cryptoRuntime.getRandomValues(new Uint8Array(12));
  if (iv.byteLength !== 12) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "HPKE wrap iv must be 12 bytes");
  }

  const encrypted = await subtle.encrypt(
    { name: "AES-GCM", iv: asBufferSource(iv), additionalData: asBufferSource(input.aad), tagLength: 128 },
    wrapKey,
    asBufferSource(input.dek),
  );

  const encryptedBytes = new Uint8Array(encrypted);
  if (encryptedBytes.byteLength < 17) {
    throw webCryptoError("E_WEB_CRYPTO_HPKE_OPEN_FAILED", "HPKE seal produced an invalid ciphertext");
  }
  const tag = encryptedBytes.slice(encryptedBytes.byteLength - 16);
  const ciphertext = encryptedBytes.slice(0, encryptedBytes.byteLength - 16);

  const envelope = encode({
    suite: HPKE_WRAP_SUITE,
    ephemeralPublicKeySpki,
    iv,
    ciphertext,
    tag,
  });

  zeroizeBuffer(iv);
  zeroizeBuffer(encryptedBytes);

  return copyBytes(new Uint8Array(envelope));
}

export async function openActiveWrap(input: {
  activeWrap: ActiveDeviceDekWrap;
  recipientPrivateKey: CryptoKey;
}): Promise<CryptoKey> {
  const subtle = requireSubtleCrypto();
  assertDistinctInfoAndAad(input.activeWrap.hpkeInfo, input.activeWrap.hpkeAad);

  const envelope = parseWrapEnvelope(input.activeWrap.wrap);
  const ephemeralPublicKey = await importX25519PublicKey(envelope.ephemeralPublicKeySpki);
  const sharedSecret = await subtle.deriveBits(
    { name: "X25519", public: ephemeralPublicKey },
    input.recipientPrivateKey,
    256,
  );

  const wrapKey = await deriveHpkeAesKey(new Uint8Array(sharedSecret), input.activeWrap.hpkeInfo, "decrypt");
  const ciphertextWithTag = concatBytes(envelope.ciphertext, envelope.tag);
  let dekBytes: Uint8Array | null = null;
  try {
    const decrypted = await subtle.decrypt(
      {
        name: "AES-GCM",
        iv: asBufferSource(envelope.iv),
        additionalData: asBufferSource(input.activeWrap.hpkeAad),
        tagLength: 128,
      },
      wrapKey,
      asBufferSource(ciphertextWithTag),
    );

    dekBytes = new Uint8Array(decrypted);
    if (dekBytes.byteLength !== 32) {
      throw webCryptoError("E_WEB_CRYPTO_HPKE_OPEN_FAILED", "HPKE wrap payload must decrypt to a 32-byte DEK");
    }

    return await subtle.importKey("raw", asBufferSource(dekBytes), { name: "AES-GCM" }, false, [
      "encrypt",
      "decrypt",
    ]);
  } catch (cause) {
    if (isRuntimeError(cause)) {
      throw cause;
    }
    throw webCryptoError("E_WEB_CRYPTO_HPKE_OPEN_FAILED", "Failed to open HPKE active wrap", { cause });
  } finally {
    zeroizeBuffer(ciphertextWithTag);
    if (dekBytes) {
      zeroizeBuffer(dekBytes);
    }
  }
}

export async function importX25519PrivateKey(privateKeyPkcs8: Uint8Array): Promise<CryptoKey> {
  assertBytes(privateKeyPkcs8, "wrapped device private key payload");
  const subtle = requireSubtleCrypto();
  try {
    return await subtle.importKey("pkcs8", asBufferSource(privateKeyPkcs8), { name: "X25519" }, false, [
      "deriveBits",
    ]);
  } catch (cause) {
    throw webCryptoError("E_WEB_CRYPTO_BAD_PASSWORD", "Unable to import wrapped device private key", { cause });
  }
}

async function importX25519PublicKey(publicKeySpki: Uint8Array): Promise<CryptoKey> {
  assertBytes(publicKeySpki, "ephemeralPublicKeySpki");
  const subtle = requireSubtleCrypto();
  try {
    return await subtle.importKey("spki", asBufferSource(publicKeySpki), { name: "X25519" }, false, []);
  } catch (cause) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "Invalid X25519 public key encoding", { cause });
  }
}

async function deriveHpkeAesKey(
  sharedSecret: Uint8Array,
  info: Uint8Array,
  usage: "encrypt" | "decrypt",
): Promise<CryptoKey> {
  const subtle = requireSubtleCrypto();
  const ikm = await subtle.importKey("raw", asBufferSource(sharedSecret), { name: "HKDF" }, false, [
    "deriveKey",
  ]);
  zeroizeBuffer(sharedSecret);

  return subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: asBufferSource(HPKE_WRAP_HKDF_SALT),
      info: asBufferSource(info),
    },
    ikm,
    { name: "AES-GCM", length: 256 },
    false,
    [usage],
  );
}

function parseWrapEnvelope(encodedWrap: Uint8Array): ParsedWrapEnvelope {
  assertBytes(encodedWrap, "activeWrap.wrap");
  let decoded: unknown;
  try {
    decoded = decode(encodedWrap);
  } catch (cause) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "Active wrap envelope is not valid CBOR", { cause });
  }

  if (!decoded || typeof decoded !== "object") {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "Active wrap envelope must be an object");
  }

  const envelope = decoded as Record<string, unknown>;
  if (envelope.suite !== HPKE_WRAP_SUITE) {
    throw webCryptoError("E_WEB_CRYPTO_WRAP_KEY_MISMATCH", "Unsupported active-wrap suite");
  }

  const parsed = {
    suite: HPKE_WRAP_SUITE,
    ephemeralPublicKeySpki: asBytesField(envelope.ephemeralPublicKeySpki, "ephemeralPublicKeySpki"),
    iv: asBytesField(envelope.iv, "iv"),
    ciphertext: asBytesField(envelope.ciphertext, "ciphertext"),
    tag: asBytesField(envelope.tag, "tag"),
  } satisfies ParsedWrapEnvelope;

  if (parsed.iv.byteLength !== 12) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "Active wrap iv must be 12 bytes");
  }
  if (parsed.tag.byteLength !== 16) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "Active wrap tag must be 16 bytes");
  }

  return parsed;
}

function asBytesField(value: unknown, field: string): Uint8Array {
  if (!(value instanceof Uint8Array)) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", `Active wrap field ${field} must be Uint8Array`);
  }
  return copyBytes(value);
}

function assertDistinctInfoAndAad(info: Uint8Array, aad: Uint8Array): void {
  assertBytes(info, "hpkeInfo");
  assertBytes(aad, "hpkeAad");
  if (bytesEqual(info, aad)) {
    throw webCryptoError("E_WEB_CRYPTO_WRAP_KEY_MISMATCH", "HPKE info and aad must be distinct");
  }
}

function isRuntimeError(error: unknown): error is Error {
  return Boolean(error && typeof error === "object" && "name" in error && error.name === "WebCryptoRuntimeError");
}
