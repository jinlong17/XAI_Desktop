import { Encoder } from "cbor-x";

import { webCryptoError } from "../errors";
import type { BlobAadInput } from "../types";
import { copyBytes } from "./buffers";

const encoder = new Encoder({ useRecords: false, mapsAsObjects: false });

export function deriveBlobAadBytes(input: BlobAadInput): Uint8Array {
  const aadVersion = input.aadVersion ?? 1;
  if (!Number.isSafeInteger(aadVersion) || aadVersion < 1) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "aadVersion must be a positive integer");
  }

  if (!input.accountId) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "aad.accountId must be non-empty");
  }
  if (!input.entityType) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "aad.entityType must be non-empty");
  }
  if (!input.entityId) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "aad.entityId must be non-empty");
  }
  if (!input.proposedRevision) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "aad.proposedRevision must be non-empty");
  }
  if (!input.encryptionDeviceId) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "aad.encryptionDeviceId must be non-empty");
  }
  if (!Number.isSafeInteger(input.keyId) || input.keyId < 0) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "aad.keyId must be a non-negative integer");
  }
  if (!Number.isSafeInteger(input.schemaVersion) || input.schemaVersion < 0) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "aad.schemaVersion must be a non-negative integer");
  }

  const deletedFlag = input.deletedFlag ? 1 : 0;
  const aadMap = new Map<number, unknown>([
    [1, aadVersion],
    [2, input.accountId],
    [3, input.entityType],
    [4, input.entityId],
    [5, input.proposedRevision],
    [6, input.keyId],
    [7, deletedFlag],
    [8, input.schemaVersion],
    [9, input.encryptionDeviceId],
  ]);

  const bytes = encoder.encode(aadMap);
  return copyBytes(new Uint8Array(bytes));
}
