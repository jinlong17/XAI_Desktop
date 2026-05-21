import { webCryptoError } from "../errors";

export function requireSubtleCrypto(): SubtleCrypto {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw webCryptoError("E_WEB_CRYPTO_UNSUPPORTED", "WebCrypto subtle API is unavailable");
  }
  return subtle;
}

export function requireCryptoRuntime(): Crypto {
  const cryptoRuntime = globalThis.crypto;
  if (!cryptoRuntime) {
    throw webCryptoError("E_WEB_CRYPTO_UNSUPPORTED", "WebCrypto runtime is unavailable");
  }
  return cryptoRuntime;
}

export function asBufferSource(bytes: Uint8Array): ArrayBuffer {
  return Uint8Array.from(bytes).buffer;
}
