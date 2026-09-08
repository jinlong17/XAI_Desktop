import { describe, expect, it, vi } from "vitest";
import "fake-indexeddb/auto";

import {
  WEB_CACHE_DB_PREFIX,
  createIndexedDbSyncBlobRepo,
  type CacheQuotaSnapshot,
  type SearchTextExtractor,
  type SortPayloadCrypto,
  type WebCacheRuntimeTransitionSource,
  type WebCacheTransitionReason,
} from "../src";
import type {
  ContractRecord,
} from "./repository-contract";
import { makeRecord } from "./repository-contract";
import type {
  EntityIndexRow,
  EncryptedBlobRow,
  EntitySortKeyRow,
  PendingMutationRow,
  SyncBlobCryptoAdapter,
} from "../src";

const DEVICE_ID = "device-test-1";
const ACCOUNT_ID = "account-secure-cache";

function makeDbName(suffix: string): string {
  return `${WEB_CACHE_DB_PREFIX}-test-${suffix}`;
}

function createMockCrypto<T extends ContractRecord>(): SyncBlobCryptoAdapter<T> {
  const encryptedPayloads = new Map<string, T>();

  return {
    async encryptRecord(input) {
      const encrypted = `enc:${recordEntityType(input.record)}:${input.record.id}:${input.proposedRevision}`;
      encryptedPayloads.set(encrypted, input.record);
      return { blobBase64: encrypted };
    },

    async decryptRecord(input) {
      const record = encryptedPayloads.get(input.blobBase64);
      if (!record) {
        throw new Error(`missing cipher text for ${input.blobBase64}`);
      }
      return record;
    },

    getCurrentKeyId() {
      return 13;
    },
  };
}

function createTrackedCrypto<T extends ContractRecord>(): {
  payloads: Map<string, T>;
  encryptRecord: ReturnType<typeof vi.fn>;
  decryptRecord: ReturnType<typeof vi.fn>;
  crypto: SyncBlobCryptoAdapter<T>;
} {
  const payloads = new Map<string, T>();

  const encryptRecord = vi.fn(
    async (input: Parameters<SyncBlobCryptoAdapter<T>["encryptRecord"]>[0]) => {
      const encrypted = `enc:${recordEntityType(input.record)}:${input.record.id}:${input.proposedRevision}`;
      payloads.set(encrypted, input.record);
      return { blobBase64: encrypted };
    },
  );

  const decryptRecord = vi.fn(
    async (input: Parameters<SyncBlobCryptoAdapter<T>["decryptRecord"]>[0]) => {
      const record = payloads.get(input.blobBase64);
      if (!record) {
        throw new Error(`missing cipher text for ${input.blobBase64}`);
      }
      return record;
    },
  );

  return {
    payloads,
    encryptRecord,
    decryptRecord,
    crypto: {
      encryptRecord,
      decryptRecord,
      getCurrentKeyId: () => 13,
    },
  };
}

function createMockSortCrypto(): SortPayloadCrypto {
  return {
    async encrypt({ plaintext }) {
      return `sort:${Buffer.from(plaintext, "utf8").toString("base64")}`;
    },
    async decrypt({ ciphertext }) {
      return Buffer.from(ciphertext.replace(/^sort:/, ""), "base64").toString("utf8");
    },
  };
}

function createDeviceBoundFetchMock(
  responder: (url: string, init?: RequestInit) => Response | Promise<Response>,
) {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const headers = new Headers(init?.headers);
    headers.set("Authorization", "Bearer test-token");
    headers.set("X-Device-Id", DEVICE_ID);

    return responder(url, {
      ...init,
      headers,
    });
  };
}

async function openDatabase(name: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("entity_blobs")) {
        const store = db.createObjectStore("entity_blobs", { keyPath: "key" });
        store.createIndex("entityType", "entityType", { unique: false });
        store.createIndex("entityId", "entityId", { unique: false });
        store.createIndex("commitSeq", "commitSeq", { unique: false });
      }
      if (!db.objectStoreNames.contains("entity_index")) {
        const store = db.createObjectStore("entity_index", { keyPath: "key" });
        store.createIndex("entityType", "entityType", { unique: false });
        store.createIndex("entityId", "entityId", { unique: false });
        store.createIndex("hardDeleted", "hardDeleted", { unique: false });
      }
      if (!db.objectStoreNames.contains("entity_sort_keys")) {
        const store = db.createObjectStore("entity_sort_keys", { keyPath: "key" });
        store.createIndex("entityType", "entityType", { unique: false });
        store.createIndex("entityId", "entityId", { unique: false });
      }
      if (!db.objectStoreNames.contains("pending_mutations")) {
        const store = db.createObjectStore("pending_mutations", { keyPath: "mutationId" });
        store.createIndex("entityType", "entityType", { unique: false });
        store.createIndex("entityId", "entityId", { unique: false });
        store.createIndex("queuedAt", "queuedAt", { unique: false });
      }
      if (!db.objectStoreNames.contains("dead_letter_mutations")) {
        const store = db.createObjectStore("dead_letter_mutations", { keyPath: "mutationId" });
        store.createIndex("entityType", "entityType", { unique: false });
        store.createIndex("entityId", "entityId", { unique: false });
        store.createIndex("failedAt", "failedAt", { unique: false });
      }
      if (!db.objectStoreNames.contains("sync_state")) {
        db.createObjectStore("sync_state", { keyPath: "key" });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
}

function requestAsPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

async function writeStore<T>(dbName: string, storeName: string, rows: T[]): Promise<void> {
  const db = await openDatabase(dbName);
  const tx = db.transaction([storeName], "readwrite");
  const store = tx.objectStore(storeName);
  for (const row of rows) {
    await requestAsPromise(store.put(row));
  }
  await transactionDone(tx);
  db.close();
}

async function readStore<T>(dbName: string, storeName: string): Promise<T[]> {
  const db = await openDatabase(dbName);
  const tx = db.transaction([storeName], "readonly");
  const request = tx.objectStore(storeName).getAll();
  const rows = await requestAsPromise<T[]>(request);
  await transactionDone(tx);
  db.close();
  return rows;
}

async function deleteDatabase(name: string): Promise<void> {
  await new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve(undefined);
    request.onerror = () => reject(request.error);
    request.onblocked = () => {
      reject(new Error("delete blocked"));
    };
  });
}

async function setNavigatorStorageEstimate(
  estimate: () => Promise<{ usage?: number; quota?: number; persisted?: boolean }>,
  persisted?: () => Promise<boolean>,
) {
  const previousNavigator = globalThis.navigator;
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      storage: {
        estimate,
        persisted: persisted
          ? persisted
          : async () => {
              const latest = await estimate();
              if (typeof latest.persisted === "boolean") {
                return latest.persisted;
              }
              return false;
            },
      },
    },
  });
  return () => {
    if (previousNavigator === undefined) {
      Reflect.deleteProperty(globalThis, "navigator");
      return;
    }
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: previousNavigator,
    });
  };
}

function recordEntityType<T extends ContractRecord>(record: T): string {
  return record.entityType;
}

class TransitionSource implements WebCacheRuntimeTransitionSource {
  private listeners = new Set<(transition: Parameters<WebCacheRuntimeTransitionSource["subscribe"]>[0]) => void>();

  subscribe(listener: (transition: {
    readonly from: string;
    readonly to: string;
    readonly reason: WebCacheTransitionReason;
    readonly at: number;
    readonly currentKeyId?: number | null;
    readonly errorCode?: string;
  }) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(transition: {
    readonly from: string;
    readonly to: string;
    readonly reason: WebCacheTransitionReason;
    readonly at: number;
    readonly currentKeyId?: number | null;
    readonly errorCode?: string;
  }) {
    for (const listener of [...this.listeners]) {
      listener(transition);
    }
  }
}

describe("createIndexedDbSyncBlobRepo", () => {
  it("rejects device-local records before persisting a remote mutation", async () => {
    const dbName = makeDbName("reject-device-local");
    await deleteDatabase(dbName);
    let pushAttempts = 0;

    const repo = createIndexedDbSyncBlobRepo<ContractRecord>({
      namespace: "todos",
      accountId: ACCOUNT_ID,
      deviceId: DEVICE_ID,
      syncStateDatabaseName: dbName,
      fetchSync: createDeviceBoundFetchMock((url) => {
        if (url.includes("/sync/push")) {
          pushAttempts += 1;
          return new Response(JSON.stringify({ accepted: true }), { status: 200 });
        }
        return new Response(JSON.stringify({ records: [], next_commit_seq: "0" }), {
          status: 200,
        });
      }),
      crypto: createMockCrypto(),
      initiallyLocked: false,
    });

    await expect(
      repo.put(
        makeRecord("clip-local", {
          entityType: "clipboard.item",
          syncScope: "device-local",
        }),
      ),
    ).rejects.toThrow(/only accepts account-sync/);

    expect(pushAttempts).toBe(0);
    await expect(
      readStore<PendingMutationRow>(dbName, "pending_mutations"),
    ).resolves.toEqual([]);
    await expect(
      readStore<EntityIndexRow>(dbName, "entity_index"),
    ).resolves.toEqual([]);
  });

  it("persists encrypted blobs and encrypted sort payloads while keeping plaintext out of durable rows", async () => {
    const dbName = makeDbName("cipher-text");
    await deleteDatabase(dbName);
    const textExtractor: SearchTextExtractor<ContractRecord> = (record) =>
      record.title;

    const repo = createIndexedDbSyncBlobRepo<ContractRecord>({
      namespace: "todos",
      accountId: ACCOUNT_ID,
      deviceId: DEVICE_ID,
      syncStateDatabaseName: dbName,
      fetchSync: createDeviceBoundFetchMock((url) => {
        if (url.includes("/sync/push")) {
          return new Response(JSON.stringify({ accepted: true }), { status: 200 });
        }
        return new Response(JSON.stringify({ records: [], next_commit_seq: "0" }), {
          status: 200,
        });
      }),
      crypto: createMockCrypto(),
      searchTextExtractor: textExtractor,
      sortPayloadExtractor: (record) => `secret-sort:${record.title}`,
      sortPayloadCrypto: createMockSortCrypto(),
      initiallyLocked: false,
    });

    const record = makeRecord("todo-secure", {
      title: "private secret project",
      description: "very-sensitive payload",
    });

    await repo.put(record);

    const blobs = await readStore<EncryptedBlobRow>(dbName, "entity_blobs");
    const indexes = await readStore<EntityIndexRow>(dbName, "entity_index");
    const sortKeys = await readStore<EntitySortKeyRow>(dbName, "entity_sort_keys");
    const searchableText = JSON.stringify(record);

    expect(blobs).toHaveLength(1);
    expect(blobs[0]!.blobBase64).toBe("enc:productivity.todo:todo-secure:1");
    expect(blobs[0]!.blobBase64).not.toContain("private secret project");
    expect(sortKeys).toHaveLength(1);
    expect(sortKeys[0]!.encryptedSortPayload).toContain("c2VjcmV0LXNvcnQ6");
    expect(sortKeys[0]!.encryptedSortPayload).not.toContain("private secret project");
    expect(JSON.stringify(indexes)).not.toContain(searchableText);

    await repo.delete(record.id);
  });

  it("rebuilds from a fake sentinel-missing durable state as a recoverable path", async () => {
    const dbName = makeDbName("sentinel-missing");
    await deleteDatabase(dbName);

    await writeStore(dbName, "entity_blobs", [
      {
        key: "productivity.todo::todo-sentinel",
        entityType: "productivity.todo",
        entityId: "todo-sentinel",
        revision: "7",
        keyId: 13,
        encryptionDeviceId: "enc-device",
        commitSeq: "7",
        hardDeleted: false,
        blobBase64: "enc-fallback-secret",
        blobSize: 19,
      },
    ]);

    const repo = createIndexedDbSyncBlobRepo<ContractRecord>({
      namespace: "todos",
      accountId: ACCOUNT_ID,
      deviceId: DEVICE_ID,
      syncStateDatabaseName: dbName,
      syncStateVersion: 1,
      fetchSync: createDeviceBoundFetchMock((url) => {
        if (url.includes("/sync/pull")) {
          return new Response(
            JSON.stringify({ records: [], next_commit_seq: "9", current_account_commit_seq: "9", has_more: false }),
            { status: 200 },
          );
        }
        return new Response(JSON.stringify({ accepted: true }), { status: 200 });
      }),
      crypto: createMockCrypto(),
      initiallyLocked: false,
    });

    await expect(repo.pull({})).rejects.toThrow("E_WEB_CACHE_SENTINEL_MISSING");

    const syncStateRows = await readStore<{ key: string; value: string; updatedAt: string }>(
      dbName,
      "sync_state",
    );
    expect(syncStateRows).toHaveLength(1);
    expect(syncStateRows[0]!.key).toBe("sentinel");
  });

  it.each(["manual", "idle", "unload", "error"] as const)(
    "wipes decrypted cache and FTS memory on %s lock transition",
    async (reason) => {
      const dbName = makeDbName(`lock-${reason}`);
      await deleteDatabase(dbName);

      const transitionSource = new TransitionSource();
      const fetch = createDeviceBoundFetchMock((url) => {
        if (url.includes("/sync/push")) {
          return new Response(JSON.stringify({ accepted: true }), { status: 200 });
        }
        return new Response(JSON.stringify({ records: [], next_commit_seq: "0" }), {
          status: 200,
        });
      });

      const repo = createIndexedDbSyncBlobRepo<ContractRecord>({
        namespace: "todos",
        accountId: ACCOUNT_ID,
        deviceId: DEVICE_ID,
        syncStateDatabaseName: dbName,
        fetchSync: fetch,
        crypto: createMockCrypto(),
        transitionSource,
        initiallyLocked: false,
      });

      await repo.put(makeRecord(`todo-${reason}`));

      const worker = repo.searchWorker();
      await worker.rebuildFromEncryptedCache();
      expect(await worker.status()).toBe("ready");

      transitionSource.emit({
        from: "unlocked",
        to: "locked",
        reason,
        at: Date.now(),
        currentKeyId: 13,
      });

      await Promise.resolve();
      expect(await worker.status()).toBe("empty");
      await expect(repo.get(`todo-${reason}`)).rejects.toThrow("E_WEB_CACHE_LOCKED");
      expect(await worker.search("todo")).toEqual([]);

      transitionSource.emit({
        from: "locked",
        to: "unlocked",
        reason: "unlock",
        at: Date.now() + 1,
        currentKeyId: 13,
      });

      await vi.waitFor(async () => {
        expect(await worker.status()).toBe("ready");
        expect(await repo.get(`todo-${reason}`)).toMatchObject({
          id: `todo-${reason}`,
        });
      });
    },
  );

  it("captures quota snapshots and persists them to storage callbacks", async () => {
    const dbName = makeDbName("quota");
    await deleteDatabase(dbName);

    const restoreNavigator = await setNavigatorStorageEstimate(async () => ({
      usage: 2048,
      quota: 4096,
      persisted: true,
    }));

    const onQuota = vi.fn((snapshot: CacheQuotaSnapshot) => snapshot);
    const repo = createIndexedDbSyncBlobRepo<ContractRecord>({
      namespace: "todos",
      accountId: ACCOUNT_ID,
      deviceId: DEVICE_ID,
      syncStateDatabaseName: dbName,
      fetchSync: createDeviceBoundFetchMock((url) =>
        url.includes("/sync/push")
          ? new Response(JSON.stringify({ accepted: true }), { status: 200 })
          : new Response(JSON.stringify({ records: [], next_commit_seq: "0" }), {
              status: 200,
            }),
      ),
      crypto: createMockCrypto(),
      onQuota,
      initiallyLocked: false,
    });

    const snapshot = await repo.captureQuota();
    expect(snapshot).toEqual({
      usageBytes: 2048,
      quotaBytes: 4096,
      persisted: true,
      capturedAt: expect.any(Number),
    });
    expect(onQuota).toHaveBeenCalledTimes(1);

    const syncStateRows = await readStore<{ key: string; value: string }>(
      dbName,
      "sync_state",
    );
    const quotaRow = syncStateRows.find((row) => row.key === "quota");
    expect(quotaRow).toBeDefined();
    const parsedQuota = JSON.parse(quotaRow!.value);
    expect(parsedQuota).toMatchObject({
      usageBytes: 2048,
      quotaBytes: 4096,
      persisted: true,
    });

    restoreNavigator();
  });

  it("maps quota query failures to E_WEB_CACHE_QUOTA_EXCEEDED for private-mode-like storage", async () => {
    const dbName = makeDbName("quota-private");
    await deleteDatabase(dbName);

    const restoreNavigator = await setNavigatorStorageEstimate(() => {
      const error = new Error("Private mode blocked") as Error & { name: string };
      error.name = "QuotaExceededError";
      throw error;
    });

    const repo = createIndexedDbSyncBlobRepo<ContractRecord>({
      namespace: "todos",
      accountId: ACCOUNT_ID,
      deviceId: DEVICE_ID,
      syncStateDatabaseName: dbName,
      fetchSync: createDeviceBoundFetchMock((url) =>
        url.includes("/sync/push")
          ? new Response(JSON.stringify({ accepted: true }), { status: 200 })
          : new Response(JSON.stringify({ records: [], next_commit_seq: "0" }), {
              status: 200,
            }),
      ),
      crypto: createMockCrypto(),
      initiallyLocked: false,
    });

    await expect(repo.captureQuota()).rejects.toThrow("E_WEB_CACHE_QUOTA_EXCEEDED");
    restoreNavigator();
  });

  it("does not decrypt cached blobs during locked bootstrap or pull", async () => {
    const dbName = makeDbName("locked-bootstrap");
    await deleteDatabase(dbName);

    const record = makeRecord("todo-locked-bootstrap", {
      title: "locked bootstrap title",
      description: "locked-mode fixture",
    });
    const encryptedPayload = `enc:${record.entityType}:${record.id}:1`;

    const { crypto, decryptRecord, payloads } = createTrackedCrypto<ContractRecord>();
    payloads.set(encryptedPayload, record);

    await writeStore(dbName, "sync_state", [
      {
        key: "sentinel",
        value: "sentinel:test",
        updatedAt: new Date().toISOString(),
      },
    ]);
    await writeStore(dbName, "entity_blobs", [
      {
        key: `productivity.todo::${record.id}`,
        entityType: record.entityType,
        entityId: record.id,
        revision: "1",
        keyId: 13,
        encryptionDeviceId: "device-test-1",
        commitSeq: "1",
        hardDeleted: false,
        blobBase64: encryptedPayload,
        blobSize: encryptedPayload.length,
      },
    ]);
    await writeStore(dbName, "entity_index", [
      {
        key: `productivity.todo::${record.id}`,
        entityType: record.entityType,
        entityId: record.id,
        revision: "1",
        commitSeq: "1",
        hardDeleted: false,
        updatedAt: new Date().toISOString(),
        schemaVersion: 1,
        syncScope: "account-sync",
      },
    ]);

    const repo = createIndexedDbSyncBlobRepo<ContractRecord>({
      namespace: "todos",
      accountId: ACCOUNT_ID,
      deviceId: DEVICE_ID,
      syncStateDatabaseName: dbName,
      fetchSync: createDeviceBoundFetchMock((url) =>
        url.includes("/sync/pull")
          ? new Response(
              JSON.stringify({ records: [], next_commit_seq: "1", current_account_commit_seq: "1", has_more: false }),
              { status: 200 },
            )
          : new Response(JSON.stringify({ accepted: true }), { status: 200 }),
      ),
      crypto,
      initiallyLocked: true,
    });

    await repo.pull({});

    expect(decryptRecord).not.toHaveBeenCalled();
    await expect(repo.get(record.id)).rejects.toThrow("E_WEB_CACHE_LOCKED");

    const indexRows = await readStore(dbName, "entity_index");
    expect(indexRows).toHaveLength(1);
  });

  it("does not decrypt remote pull payloads when locked", async () => {
    const dbName = makeDbName("locked-pull-remote");
    await deleteDatabase(dbName);

    const remoteRecord = makeRecord("todo-locked-pull", {
      title: "remote locked title",
      description: "remote payload",
    });
    const encryptedPayload = `enc:${remoteRecord.entityType}:${remoteRecord.id}:9`;

    const { crypto, decryptRecord, payloads } = createTrackedCrypto<ContractRecord>();
    payloads.set(encryptedPayload, remoteRecord);

    const repo = createIndexedDbSyncBlobRepo<ContractRecord>({
      namespace: "todos",
      accountId: ACCOUNT_ID,
      deviceId: DEVICE_ID,
      syncStateDatabaseName: dbName,
      fetchSync: createDeviceBoundFetchMock((url) => {
        if (url.includes("/sync/pull")) {
          return new Response(
            JSON.stringify({
              records: [
                {
                  entity_type: remoteRecord.entityType,
                  entity_id: remoteRecord.id,
                  revision: "9",
                  key_id: 13,
                  blob: encryptedPayload,
                  commit_seq: "9",
                  soft_deleted: false,
                  hard_deleted: false,
                  originator_device_id: "device-remote",
                },
              ],
              next_commit_seq: "9",
              current_account_commit_seq: "9",
              has_more: false,
            }),
            { status: 200 },
          );
        }
        return new Response(JSON.stringify({ accepted: true }), { status: 200 });
      }),
      crypto,
      initiallyLocked: true,
    });

    await repo.pull();

    expect(decryptRecord).not.toHaveBeenCalled();
    await expect(repo.get(remoteRecord.id)).rejects.toThrow("E_WEB_CACHE_LOCKED");

    const blobRows = await readStore<EncryptedBlobRow>(dbName, "entity_blobs");
    expect(blobRows).toHaveLength(1);
    expect(blobRows[0]!.blobBase64).toBe(encryptedPayload);
  });

  it("persists queued mutations as encrypted-only rows when push fails", async () => {
    const dbName = makeDbName("pending-crypto-only");
    await deleteDatabase(dbName);

    const fetchSpy = vi.fn(async (url: string) => {
      if (url.includes("/sync/push")) {
        return new Response(JSON.stringify({ error: "server failed" }), { status: 500 });
      }
      return new Response(JSON.stringify({ records: [], next_commit_seq: "0" }), {
        status: 200,
      });
    });

    const { crypto, payloads } = createTrackedCrypto<ContractRecord>();
    const repo = createIndexedDbSyncBlobRepo<ContractRecord>({
      namespace: "todos",
      accountId: ACCOUNT_ID,
      deviceId: DEVICE_ID,
      syncStateDatabaseName: dbName,
      fetchSync: createDeviceBoundFetchMock((url) => fetchSpy(url)),
      crypto,
      initiallyLocked: false,
    });

    const record = makeRecord("todo-push-failed");

    await expect(repo.put(record)).rejects.toThrow("E_SYNC_BLOB_PROTOCOL");

    const pendingRows = await readStore<PendingMutationRow>(dbName, "pending_mutations");
    expect(pendingRows).toHaveLength(1);
    expect((pendingRows[0] as { optimisticRecordBase64?: string }).optimisticRecordBase64)
      .toBe(undefined);
    expect(pendingRows[0]).toMatchObject({
      mutationId: expect.any(String),
      entityId: record.id,
      baseRevision: null,
      proposedRevision: "1",
      encryptedPayload: `enc:productivity.todo:${record.id}:1`,
      softDelete: false,
      hardDelete: false,
    });
    expect(fetchSpy).toHaveBeenCalled();

    const expectedPayload = payloads.get(`enc:productivity.todo:${record.id}:1`);
    expect(expectedPayload).toEqual(record);
  });
});
