export type WebCryptoErrorCode =
  | "E_WEB_CRYPTO_LOCKED"
  | "E_WEB_CRYPTO_SECRET_KEY_MISMATCH"
  | "E_WEB_CRYPTO_BAD_PASSWORD"
  | "E_WEB_CRYPTO_WRAP_UNAVAILABLE"
  | "E_WEB_CRYPTO_WRAP_KEY_MISMATCH"
  | "E_WEB_CRYPTO_HPKE_OPEN_FAILED"
  | "E_WEB_CRYPTO_UNSUPPORTED"
  | "E_WEB_CRYPTO_INVALID_INPUT"
  | "E_WEB_CRYPTO_AAD_MISMATCH"
  | "E_WEB_CRYPTO_VECTOR_MISMATCH";

export class WebCryptoRuntimeError extends Error {
  readonly code: WebCryptoErrorCode;
  readonly cause?: unknown;

  constructor(code: WebCryptoErrorCode, message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = "WebCryptoRuntimeError";
    this.code = code;
    this.cause = options?.cause;
  }
}

export function webCryptoError(
  code: WebCryptoErrorCode,
  message: string,
  options?: { cause?: unknown },
): WebCryptoRuntimeError {
  return new WebCryptoRuntimeError(code, message, options);
}

export function isWebCryptoRuntimeError(error: unknown): error is WebCryptoRuntimeError {
  return error instanceof WebCryptoRuntimeError;
}
