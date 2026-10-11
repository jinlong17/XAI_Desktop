import { beforeEach, expect, it, vi } from "vitest";
import {
  accountScope,
  generationMarkerKey,
  type SecretMigrationContext,
} from "@repo/plugin-web-storage";
import {
  clearAccountAiSecrets,
  aiKeyStorage,
  aiSecretMigrationParticipant,
} from "../internal/secretStore.js";
import { createStore, get, set } from "idb-keyval";
import { createDeviceIdentityStore } from "@repo/web-auth-device-session";
const store = () => createStore("xai-web-ai-secrets", "secrets");
const key = (id: string, generation = "g1", demo = false) =>
  `scoped:v2:${encodeURIComponent(JSON.stringify([demo ? "demo" : "account", id, generation, "anthropic"]))}`;
function activate(id: string, generation = "g1", demo = false) {
  const transition = accountScope.lock(id);
  localStorage.setItem(
    generationMarkerKey(id, demo),
    JSON.stringify({ generation, migrationId: generation, previous: null }),
  );
  return accountScope.activate(transition, generation, demo);
}
beforeEach(() => activate(`A-${crypto.randomUUID()}`));
it("isolates account and demo rows and restores A", async () => {
  const id = accountScope.capture().accountId!;
  await aiKeyStorage.saveKey("anthropic", "A-private");
  activate("B");
  expect(await aiKeyStorage.loadKey("anthropic")).toBeNull();
  activate(id, "g1", true);
  expect(await aiKeyStorage.loadKey("anthropic")).toBeNull();
  activate(id);
  expect(await aiKeyStorage.loadKey("anthropic")).toBe("A-private");
});
it("rejects uncommitted generations and preserves corrupt owned rows", async () => {
  const id = accountScope.capture().accountId!;
  await aiKeyStorage.saveKey("anthropic", "private");
  const raw = await get(key(id), store());
  const blob = JSON.parse(raw);
  blob.owner.accountId = "B";
  await set(key(id), JSON.stringify(blob), store());
  expect(await aiKeyStorage.loadKey("anthropic")).toBeNull();
  expect(await get(key(id), store())).toBe(JSON.stringify(blob));
  localStorage.removeItem(generationMarkerKey(id));
  await expect(aiKeyStorage.loadKey("anthropic")).rejects.toThrow();
});
it("cancels a KDF save after switching owner without writing into B", async () => {
  const id = accountScope.capture().accountId!;
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  const original = crypto.subtle.deriveKey.bind(crypto.subtle);
  const spy = vi
    .spyOn(crypto.subtle, "deriveKey")
    .mockImplementationOnce(async (...args) => {
      await gate;
      return original(...args);
    });
  const save = aiKeyStorage.saveKey("anthropic", "stale");
  await vi.waitFor(() => expect(spy).toHaveBeenCalled());
  activate("race-B");
  release();
  await expect(save).rejects.toThrow();
  expect(await aiKeyStorage.loadKey("anthropic")).toBeNull();
  expect(await get(key(id), store())).toBeUndefined();
});
it("copies the previous generation, verifies, and preserves rollback", async () => {
  const id = accountScope.capture().accountId!;
  await aiKeyStorage.saveKey("anthropic", "previous");
  const oldRaw = await get(key(id), store());
  accountScope.lock(id);
  const context: SecretMigrationContext = {
    accountId: id,
    generation: "g2",
    previousGeneration: "g1",
    migrationId: "m2",
    demo: false,
    adoptLegacy: false,
  };
  await aiSecretMigrationParticipant.stage(context);
  await aiSecretMigrationParticipant.verify(context);
  expect(await aiKeyStorage.loadKey("anthropic")).toBeNull();
  activate(id, "g2");
  expect(await aiKeyStorage.loadKey("anthropic")).toBe("previous");
  expect(await get(key(id), store())).toBe(oldRaw);
  activate(id, "g1");
  expect(await aiKeyStorage.loadKey("anthropic")).toBe("previous");
});
it("retains original bytes when staged verification fails", async () => {
  const id = accountScope.capture().accountId!;
  await aiKeyStorage.saveKey("anthropic", "previous");
  const oldRaw = await get(key(id), store());
  accountScope.lock(id);
  const context: SecretMigrationContext = {
    accountId: id,
    generation: "g2",
    previousGeneration: "g1",
    migrationId: "failed",
    demo: false,
    adoptLegacy: false,
  };
  await aiSecretMigrationParticipant.stage(context);
  await set(key(id, "g2"), "broken", store());
  await expect(aiSecretMigrationParticipant.verify(context)).rejects.toThrow();
  expect(await get(key(id), store())).toBe(oldRaw);
  activate(id);
  expect(await aiKeyStorage.loadKey("anthropic")).toBe("previous");
});
it("quarantines provider-only legacy ciphertext unless separately adopted", async () => {
  const uuid = await createDeviceIdentityStore().ensure(),
    salt = crypto.getRandomValues(new Uint8Array(32)),
    iv = crypto.getRandomValues(new Uint8Array(12));
  const base = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(uuid),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  const cryptoKey = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 600000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  );
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    new TextEncoder().encode("legacy-private"),
  );
  const b64 = (v: Uint8Array) =>
    btoa(Array.from(v, (n) => String.fromCharCode(n)).join(""));
  const raw = JSON.stringify({
    version: 1,
    ciphertext: b64(new Uint8Array(ciphertext)),
    iv: b64(iv),
    salt: b64(salt),
    kdfIterations: 600000,
    algo: "AES-GCM",
  });
  await set("anthropic", raw, store());
  const id = accountScope.capture().accountId!;
  expect(await aiKeyStorage.loadKey("anthropic")).toBeNull();
  accountScope.lock(id);
  const context: SecretMigrationContext = {
    accountId: id,
    generation: "adopt",
    previousGeneration: null,
    migrationId: "adopt",
    demo: false,
    adoptLegacy: true,
  };
  await aiSecretMigrationParticipant.stage(context);
  await aiSecretMigrationParticipant.verify(context);
  activate(id, "adopt");
  expect(await aiKeyStorage.loadKey("anthropic")).toBe("legacy-private");
  expect(await get("anthropic", store())).toBe(raw);
});
it("rejects a decrypted key that completes after owner invalidation", async () => {
  const id = accountScope.capture().accountId!;
  await aiKeyStorage.saveKey("anthropic", "private-A");
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r)),
    original = crypto.subtle.deriveKey.bind(crypto.subtle);
  const spy = vi
    .spyOn(crypto.subtle, "deriveKey")
    .mockImplementationOnce(async (...args) => {
      await gate;
      return original(...args);
    });
  const pending = aiKeyStorage.loadKey("anthropic");
  await vi.waitFor(() => expect(spy).toHaveBeenCalled());
  activate("load-B");
  release();
  await expect(pending).rejects.toThrow();
  expect(await get(key(id), store())).toBeDefined();
  expect(await aiKeyStorage.loadKey("anthropic")).toBeNull();
});
it("aborts connection tests and discards their result on account change", async () => {
  await aiKeyStorage.saveKey("anthropic", "private-A");
  let release!: (res: Response) => void;
  let requestSignal: AbortSignal | undefined;
  const fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockImplementation(async (_url, options) => {
      requestSignal = options?.signal as AbortSignal;
      return new Promise<Response>((r) => (release = r));
    });
  const pending = aiKeyStorage.testConnection("anthropic");
  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
  activate("connection-B");
  expect(requestSignal?.aborted).toBe(true);
  release(new Response("{}", { status: 200 }));
  await expect(pending).rejects.toThrow();
});
it("blocks demo adoption and reports a legacy/owned conflict without deleting either", async () => {
  const id = accountScope.capture().accountId!;
  await aiKeyStorage.saveKey("anthropic", "owned");
  await set("anthropic", "quarantined-bytes", store());
  accountScope.lock(id);
  const context: SecretMigrationContext = {
    accountId: id,
    generation: "conflict",
    previousGeneration: "g1",
    migrationId: "conflict",
    demo: false,
    adoptLegacy: true,
  };
  await expect(aiSecretMigrationParticipant.stage(context)).rejects.toThrow(
    /conflict/i,
  );
  await expect(
    aiSecretMigrationParticipant.stage({ ...context, demo: true }),
  ).rejects.toThrow();
  expect(await get("anthropic", store())).toBe("quarantined-bytes");
  expect(await get(key(id), store())).toBeDefined();
});

it("deletes captured account generations while preserving B and unowned ciphertext", async () => {
  const a = accountScope.capture().accountId!;
  await aiKeyStorage.saveKey("anthropic", "A");
  activate("delete-B");
  await aiKeyStorage.saveKey("anthropic", "B");
  activate(a);
  const captured = accountScope.capture();
  await set("anthropic", "unowned", store());
  activate("delete-B"); // server deletion has already signed A out
  await clearAccountAiSecrets(captured);
  expect(await aiKeyStorage.loadKey("anthropic")).toBe("B");
  activate(a);
  expect(await aiKeyStorage.loadKey("anthropic")).toBeNull();
  activate("delete-B");
  expect(await aiKeyStorage.loadKey("anthropic")).toBe("B");
  await clearAccountAiSecrets(captured);
  expect(await aiKeyStorage.loadKey("anthropic")).toBe("B");
  expect(await get("anthropic", store())).toBe("unowned");
});
