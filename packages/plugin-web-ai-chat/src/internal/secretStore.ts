import {
  accountScope,
  AccountScopeError,
  readGeneration,
  type AccountScope,
  type SecretMigrationContext,
  type SecretMigrationParticipant,
  getPref,
} from "@repo/plugin-web-storage";
import {
  createIndexedDbStore,
  createDeviceIdentityStore,
} from "@repo/web-auth-device-session";
import { resolveProvider } from "./llmProvider.js";
import { classifyError, type LlmError } from "./llmErrors.js";
import { getAiProviderPreset, type AiProviderId } from "./providerPresets.js";
export type AiProvider = AiProviderId;
export interface AiKeyStorage {
  loadKey(provider: AiProvider): Promise<string | null>;
  saveKey(provider: AiProvider, plaintext: string): Promise<void>;
  clearKey(provider: AiProvider): Promise<void>;
  testConnection(
    provider: AiProvider,
  ): Promise<{ ok: true } | { ok: false; error: LlmError }>;
}
const ENC = new TextEncoder(),
  DEC = new TextDecoder(),
  KDF_ITERATIONS = 600_000;
const providers: AiProvider[] = [
  "anthropic",
  "openai-compatible",
  "gemini",
  "deepseek",
];
function getSecretStore() {
  return createIndexedDbStore({
    dbName: "xai-web-ai-secrets",
    storeName: "secrets",
  });
}
async function deriveKey(
  passphrase: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  if (!globalThis.crypto?.subtle) {
    throw new Error(
      "[secretStore] crypto.subtle is unavailable in this environment.",
    );
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

type Owner = {
  kind: "account" | "demo";
  accountId: string;
  generation: string;
  provider: AiProvider;
};
interface Envelope {
  version: 1 | 2;
  ciphertext: string;
  iv: string;
  salt: string;
  kdfIterations: number;
  algo: string;
  owner?: Owner;
}
function bytes(value: Uint8Array): ArrayBuffer {
  return value.buffer.slice(
    value.byteOffset,
    value.byteOffset + value.byteLength,
  ) as ArrayBuffer;
}
function b64(value: Uint8Array): string {
  return btoa(Array.from(value, (b) => String.fromCharCode(b)).join(""));
}
function unb64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}
function ownerData(owner: Owner): ArrayBuffer {
  return bytes(
    ENC.encode(
      JSON.stringify([
        2,
        owner.kind,
        owner.accountId,
        owner.generation,
        owner.provider,
      ]),
    ),
  );
}
function rowKey(owner: Owner): string {
  return `scoped:v2:${encodeURIComponent(JSON.stringify([owner.kind, owner.accountId, owner.generation, owner.provider]))}`;
}
function ownerFor(scope: AccountScope, provider: AiProvider): Owner {
  if (scope.kind === "locked" || !scope.accountId || !scope.generation)
    throw new AccountScopeError();
  return {
    kind: scope.kind,
    accountId: scope.accountId,
    generation: scope.generation,
    provider,
  };
}
function assertReady(scope: AccountScope): void {
  accountScope.assertCurrent(scope);
  if (!accountScope.isReady(scope) || !scope.accountId)
    throw new AccountScopeError();
  if (
    readGeneration(localStorage, scope.accountId, scope.kind === "demo")
      ?.generation !== scope.generation
  )
    throw new AccountScopeError();
}
async function encrypt(
  plaintext: string,
  owner: Owner,
  guard: () => void,
): Promise<string> {
  guard();
  const uuid = await getDeviceUuid();
  guard();
  const salt = crypto.getRandomValues(new Uint8Array(32)),
    iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(uuid, salt);
  guard();
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: bytes(iv), additionalData: ownerData(owner) },
    key,
    bytes(ENC.encode(plaintext)),
  );
  guard();
  return JSON.stringify({
    version: 2,
    owner,
    ciphertext: b64(new Uint8Array(encrypted)),
    iv: b64(iv),
    salt: b64(salt),
    kdfIterations: KDF_ITERATIONS,
    algo: "AES-GCM",
  } satisfies Envelope);
}
async function decrypt(
  raw: string,
  owner: Owner | null,
  guard: () => void,
): Promise<string> {
  guard();
  const blob = JSON.parse(raw) as Envelope;
  if (
    blob.kdfIterations !== KDF_ITERATIONS ||
    blob.algo !== "AES-GCM" ||
    (owner
      ? blob.version !== 2 ||
        JSON.stringify(blob.owner) !== JSON.stringify(owner)
      : blob.version !== 1)
  )
    throw new Error("Secret ownership/envelope mismatch");
  const uuid = await getDeviceUuid();
  guard();
  const key = await deriveKey(uuid, unb64(blob.salt));
  guard();
  const plain = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: bytes(unb64(blob.iv)),
      ...(owner ? { additionalData: ownerData(owner) } : {}),
    },
    key,
    bytes(unb64(blob.ciphertext)),
  );
  guard();
  return DEC.decode(plain);
}
export const aiKeyStorage: AiKeyStorage = {
  async loadKey(provider) {
    const scope = accountScope.capture();
    if (!accountScope.isReady(scope)) return null;
    assertReady(scope);
    const guard = () => assertReady(scope),
      owner = ownerFor(scope, provider);
    const raw = await getSecretStore().getItem(rowKey(owner));
    guard();
    if (!raw) return null;
    try {
      return await decrypt(raw, owner, guard);
    } catch (_error) {
      guard();
      return null;
    } // preserve damaged ciphertext for explicit recovery
  },
  async saveKey(provider, plaintext) {
    const scope = accountScope.capture();
    const guard = () => assertReady(scope);
    guard();
    const owner = ownerFor(scope, provider),
      raw = await encrypt(plaintext, owner, guard);
    guard();
    await getSecretStore().setItem(rowKey(owner), raw);
    guard();
  },
  async clearKey(provider) {
    const scope = accountScope.capture();
    assertReady(scope);
    await getSecretStore().removeItem(rowKey(ownerFor(scope, provider)));
    assertReady(scope);
  },
  async testConnection(provider) {
    const scope = accountScope.capture(),
      guard = () => assertReady(scope);
    guard();
    const ctrl = new AbortController(),
      unsubscribe = accountScope.subscribe(() => ctrl.abort());
    try {
      const plaintext = await aiKeyStorage.loadKey(provider);
      guard();
      if (!plaintext)
        return {
          ok: false,
          error: { kind: "BadKey", status: 401, detail: "not-set" },
        };
      const config = resolveProvider(plaintext),
        preset = getAiProviderPreset(provider);
      const modelId =
        provider === "anthropic"
          ? config.resolveModelId("haiku")
          : String(getPref("xai_ai_model_default") || preset.defaultModel);
      const res = await fetch(config.url, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify(
          config.buildBody({
            modelId,
            messages: [{ role: "user", content: "hi" }],
            stream: false,
            maxTokens: 1,
          }),
        ),
        signal: ctrl.signal,
      });
      guard();
      if (!res.ok) {
        const error = await classifyError(res);
        guard();
        return { ok: false, error };
      }
      return { ok: true };
    } catch (error) {
      guard();
      const classified = await classifyError(
        error instanceof Error ? error : new Error(String(error)),
      );
      guard();
      return { ok: false, error: classified };
    } finally {
      unsubscribe();
    }
  },
};
function migrationOwner(
  input: SecretMigrationContext,
  provider: AiProvider,
  generation = input.generation,
): Owner {
  return {
    kind: input.demo ? "demo" : "account",
    accountId: input.accountId,
    generation,
    provider,
  };
}
function migrationKey(input: SecretMigrationContext): string {
  return `migration:v2:${encodeURIComponent(JSON.stringify([input.demo, input.accountId, input.generation, input.migrationId]))}`;
}
/** Host passes this to migrateAccount. Candidate rows stay invisible until the storage generation marker commits. */
export const aiSecretMigrationParticipant: SecretMigrationParticipant = {
  async stage(input) {
    const scope = accountScope.capture();
    const guard = () => {
      accountScope.assertCurrent(scope);
      if (
        scope.kind !== "locked" ||
        scope.accountId !== input.accountId ||
        (input.demo && input.adoptLegacy)
      )
        throw new AccountScopeError();
    };
    guard();
    const staged: Record<string, string> = {};
    for (const provider of providers) {
      const owner = migrationOwner(input, provider),
        previous = input.previousGeneration
          ? migrationOwner(input, provider, input.previousGeneration)
          : null;
      const previousRaw = previous
        ? await getSecretStore().getItem(rowKey(previous))
        : null;
      guard();
      const legacyRaw = input.adoptLegacy
        ? await getSecretStore().getItem(provider)
        : null;
      guard();
      if (previousRaw && legacyRaw)
        throw new Error(`Secret import conflict: ${provider}`);
      if (!previousRaw && !legacyRaw) continue;
      const plaintext = await decrypt(
        (previousRaw ?? legacyRaw)!,
        previousRaw ? previous : null,
        guard,
      );
      const candidate = await encrypt(plaintext, owner, guard);
      guard();
      await getSecretStore().setItem(rowKey(owner), candidate);
      guard();
      staged[rowKey(owner)] = candidate;
    }
    await getSecretStore().setItem(migrationKey(input), JSON.stringify(staged));
    guard();
  },
  async verify(input) {
    const scope = accountScope.capture();
    const guard = () => {
      accountScope.assertCurrent(scope);
      if (scope.kind !== "locked" || scope.accountId !== input.accountId)
        throw new AccountScopeError();
    };
    guard();
    const raw = await getSecretStore().getItem(migrationKey(input));
    guard();
    if (raw === null) throw new Error("Secret staging receipt missing");
    const staged = JSON.parse(raw) as Record<string, string>;
    for (const provider of providers) {
      const owner = migrationOwner(input, provider),
        key = rowKey(owner);
      if (staged[key] === undefined) continue;
      const candidate = await getSecretStore().getItem(key);
      guard();
      if (candidate !== staged[key])
        throw new Error("Secret staging verification failed");
      await decrypt(candidate!, owner, guard);
    }
  },
};
/** Metadata-only quarantine discovery; never decrypts or assigns an owner. */
export async function inspectLegacyAiSecrets(): Promise<AiProvider[]> {
  const scope = accountScope.capture(),
    found: AiProvider[] = [];
  for (const provider of providers) {
    const raw = await getSecretStore().getItem(provider);
    accountScope.assertCurrent(scope);
    if (raw !== null) found.push(provider);
  }
  return found;
}

/** Explicitly authorized account erasure: a captured owner stays the target after sign-out. */
export async function clearAccountAiSecrets(
  scope: AccountScope,
): Promise<void> {
  if (scope.kind === "locked" || !scope.accountId)
    throw new AccountScopeError();
  const owner = Object.freeze({ kind: scope.kind, accountId: scope.accountId });
  await getSecretStore().getItem("__schema_probe__");
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.open("xai-web-ai-secrets");
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Secret database is blocked"));
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("secrets")) {
        db.close();
        resolve();
        return;
      }
      const transaction = db.transaction("secrets", "readwrite");
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onabort = () => {
        db.close();
        reject(transaction.error ?? new Error("Secret erase aborted"));
      };
      const cursor = transaction.objectStore("secrets").openCursor();
      cursor.onsuccess = () => {
        const row = cursor.result;
        if (!row) return;
        try {
          const key = String(row.key);
          let owned = false;
          if (key.startsWith("scoped:v2:")) {
            const tuple = JSON.parse(
              decodeURIComponent(key.slice("scoped:v2:".length)),
            ) as unknown[];
            owned = tuple[0] === owner.kind && tuple[1] === owner.accountId;
          } else if (key.startsWith("migration:v2:")) {
            const tuple = JSON.parse(
              decodeURIComponent(key.slice("migration:v2:".length)),
            ) as unknown[];
            owned =
              tuple[0] === (owner.kind === "demo") &&
              tuple[1] === owner.accountId;
          }
          if (owned) row.delete();
        } catch {
          /* malformed keys remain quarantined */
        }
        row.continue();
      };
    };
  });
}
