/**
 * secretStore — IndexedDB + WebCrypto AES-GCM-256 API key storage.
 *
 * Keys are encrypted with PBKDF2-HMAC-SHA256 (600k iterations) deriving an
 * AES-GCM-256 key whose passphrase is the device UUID from
 * `createDeviceIdentityStore().ensure()` (already SHIPPED in web-auth-device-session).
 *
 * IDB store name: "xai-web-ai-secrets". One row per provider.
 *
 * Shape per row:
 *   { version:1, ciphertext:Uint8Array, iv:Uint8Array, salt:Uint8Array,
 *     kdfIterations:600000, algo:"AES-GCM" }
 *
 * Design: packages/xai-web-ai-chat/docs/design.md FA-2 (2026-05-25 Extension)
 * API contract: packages/xai-web-ai-chat/docs/api.md §12.2
 */

import { createIndexedDbStore, createDeviceIdentityStore } from "@repo/web-auth-device-session";
import {
  isDesktopPhase1OfflineRuntime,
  resolveWebRuntimeProfile,
} from "@repo/core";

// ---- Types -----------------------------------------------------------------

export type AiProvider = "anthropic" | "openai-compatible";

interface StoredSecretBlob {
  version: 1;
  ciphertext: Uint8Array;
  iv: Uint8Array;
  salt: Uint8Array;
  kdfIterations: 600000;
  algo: "AES-GCM";
}

export interface AiKeyStorage {
  /** Returns the plaintext API key for the given provider, or null if not set. */
  loadKey(provider: AiProvider): Promise<string | null>;
  /** Persists the plaintext API key encrypted via AES-GCM. Overwrites any existing entry. */
  saveKey(provider: AiProvider, plaintext: string): Promise<void>;
  /** Removes the stored entry for the given provider. Idempotent. */
  clearKey(provider: AiProvider): Promise<void>;
  /** Issues a 1-token messages request to validate the stored key. Returns LlmError on failure. */
  testConnection(provider: AiProvider): Promise<{ ok: true } | { ok: false; error: import("./llmErrors.js").LlmError }>;
}

// ---- IDB store -------------------------------------------------------------

const AI_SECRETS_DB = "xai-web-ai-secrets";
const AI_SECRETS_STORE = "secrets";

// Factory: creates a fresh IDB store reference each call — necessary for test
// isolation (fake-indexeddb is reset per test; a module-level singleton would
// hold a stale reference after the test deletes the database).
function getSecretStore() {
  return createIndexedDbStore({
    dbName: AI_SECRETS_DB,
    storeName: AI_SECRETS_STORE,
  });
}

// ---- WebCrypto helpers -----------------------------------------------------

const ENC = new TextEncoder();
const DEC = new TextDecoder();

const KDF_ITERATIONS = 600_000;

/**
 * Derives an AES-GCM-256 CryptoKey from the device UUID passphrase + a random salt.
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  if (!globalThis.crypto?.subtle) {
    throw new Error("[secretStore] crypto.subtle is unavailable in this environment.");
  }
  const passphraseBytes = ENC.encode(passphrase);
  // Cast to Uint8Array<ArrayBuffer> — our Uint8Arrays are always backed by
  // plain ArrayBuffer (not SharedArrayBuffer), so the cast is safe.
  const saltBuf = salt.buffer.slice(
    salt.byteOffset,
    salt.byteOffset + salt.byteLength,
  ) as ArrayBuffer;
  const saltView = new Uint8Array(saltBuf);
  const passphraseBuf = passphraseBytes.buffer.slice(
    passphraseBytes.byteOffset,
    passphraseBytes.byteOffset + passphraseBytes.byteLength,
  ) as ArrayBuffer;
  const baseKey = await crypto.subtle.importKey(
    "raw",
    passphraseBuf,
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltView,
      iterations: KDF_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function getDeviceUuid(): Promise<string> {
  return createDeviceIdentityStore().ensure();
}

// ---- Serialize/deserialize IDB blob ----------------------------------------
// idb-keyval stores values as JSON strings. We convert Uint8Arrays to/from
// base64 for JSON-safe storage.

function uint8ToBase64(u8: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < u8.length; i++) {
    bin += String.fromCharCode(u8[i]!);
  }
  return btoa(bin);
}

function base64ToUint8(b64: string): Uint8Array {
  const bin = atob(b64);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    u8[i] = bin.charCodeAt(i);
  }
  return u8;
}

interface SerializedBlob {
  version: 1;
  ciphertext: string; // base64
  iv: string;         // base64
  salt: string;       // base64
  kdfIterations: 600000;
  algo: "AES-GCM";
}

function blobToJson(blob: StoredSecretBlob): string {
  const s: SerializedBlob = {
    version: 1,
    ciphertext: uint8ToBase64(blob.ciphertext),
    iv: uint8ToBase64(blob.iv),
    salt: uint8ToBase64(blob.salt),
    kdfIterations: 600_000,
    algo: "AES-GCM",
  };
  return JSON.stringify(s);
}

function blobFromJson(raw: string): StoredSecretBlob | null {
  try {
    const s = JSON.parse(raw) as Partial<SerializedBlob>;
    if (s.version !== 1) return null;
    return {
      version: 1,
      ciphertext: base64ToUint8(s.ciphertext ?? ""),
      iv: base64ToUint8(s.iv ?? ""),
      salt: base64ToUint8(s.salt ?? ""),
      kdfIterations: 600_000,
      algo: "AES-GCM",
    };
  } catch {
    return null;
  }
}

// ---- aiKeyStorage implementation -------------------------------------------

export const aiKeyStorage: AiKeyStorage = {
  async loadKey(provider) {
    const raw = await getSecretStore().getItem(provider);
    if (!raw) return null;
    const blob = blobFromJson(raw);
    if (!blob) {
      // Corrupted — auto-clear and treat as missing.
      await getSecretStore().removeItem(provider);
      return null;
    }
    const uuid = await getDeviceUuid();
    try {
      const key = await deriveKey(uuid, blob.salt);
      // Ensure plain ArrayBuffer backing for the WebCrypto API calls.
      const iv = new Uint8Array(
        (blob.iv.buffer as ArrayBuffer).slice(blob.iv.byteOffset, blob.iv.byteOffset + blob.iv.byteLength),
      );
      const ciphertext = blob.ciphertext.buffer.slice(
        blob.ciphertext.byteOffset,
        blob.ciphertext.byteOffset + blob.ciphertext.byteLength,
      ) as ArrayBuffer;
      const plainBuf = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        ciphertext,
      );
      return DEC.decode(plainBuf);
    } catch {
      // Decrypt failure (e.g. device id rotated) — auto-clear row, return null.
      await getSecretStore().removeItem(provider);
      return null;
    }
  },

  async saveKey(provider, plaintext) {
    if (!globalThis.crypto?.subtle) {
      throw new Error("[secretStore] crypto.subtle is unavailable — cannot encrypt API key.");
    }
    const uuid = await getDeviceUuid();
    const salt = crypto.getRandomValues(new Uint8Array(32));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(uuid, salt);
    const plaintextBuf = ENC.encode(plaintext);
    const plaintextAb = plaintextBuf.buffer.slice(
      plaintextBuf.byteOffset,
      plaintextBuf.byteOffset + plaintextBuf.byteLength,
    ) as ArrayBuffer;
    const ivBuf = new Uint8Array(iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength));
    const ciphertextBuf = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: ivBuf },
      key,
      plaintextAb,
    );
    const blob: StoredSecretBlob = {
      version: 1,
      ciphertext: new Uint8Array(ciphertextBuf),
      iv,
      salt,
      kdfIterations: 600_000,
      algo: "AES-GCM",
    };
    await getSecretStore().setItem(provider, blobToJson(blob));
  },

  async clearKey(provider) {
    await getSecretStore().removeItem(provider);
  },

  async testConnection(provider) {
    const { classifyError } = await import("./llmErrors.js");
    const runtimeProfile = resolveWebRuntimeProfile(
      import.meta.env as Record<string, string | undefined>,
    );
    if (isDesktopPhase1OfflineRuntime(runtimeProfile)) {
      return {
        ok: false,
        error: {
          kind: "Network",
          cause: new Error("offline-runtime"),
          detail: "offline-runtime",
        },
      };
    }
    const plaintext = await aiKeyStorage.loadKey(provider);
    if (!plaintext) {
      const err: import("./llmErrors.js").LlmError = {
        kind: "BadKey",
        status: 401,
        detail: "not-set",
      };
      return { ok: false, error: err };
    }
    try {
      // A minimal 1-token validation request — provider-specific.
      const url =
        provider === "anthropic"
          ? "https://api.anthropic.com/v1/messages"
          : null;
      if (!url) {
        const err: import("./llmErrors.js").LlmError = {
          kind: "BadKey",
          status: 401,
          detail: "no-url-configured",
        };
        return { ok: false, error: err };
      }
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "x-api-key": plaintext,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251101",
          max_tokens: 1,
          messages: [{ role: "user", content: "hi" }],
        }),
      });
      if (!res.ok) {
        const err = await classifyError(res);
        return { ok: false, error: err };
      }
      return { ok: true };
    } catch (e) {
      const err = await classifyError(e instanceof Error ? e : new Error(String(e)));
      return { ok: false, error: err };
    }
  },
};
