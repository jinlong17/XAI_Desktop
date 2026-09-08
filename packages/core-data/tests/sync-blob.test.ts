import { describe, expect, it } from "vitest";

import {
  createSyncBlobRepo,
  type SyncBlobCryptoAdapter,
} from "../src/sync-blob";
import type { RepoRecord } from "../src/types";
import {
  makeRecord,
  runRepositoryContractTests,
  type ContractRecord,
} from "./repository-contract";

const AUTH_HEADER = "Bearer test-token";
const DEVICE_ID = "device-test-1";

runRepositoryContractTests("createSyncBlobRepo contract", () =>
  createSyncBlobRepo<ContractRecord>({
    namespace: "contract",
    accountId: "acct-1",
    deviceId: DEVICE_ID,
    fetchSync: createDeviceBoundFetchMock(() =>
      new Response(JSON.stringify({ records: [], next_commit_seq: "0" }), {
        status: 200,
      }),
    ),
    crypto: createMockCrypto<ContractRecord>(),
    newMutationId: createMutationIdFactory(),
    nowMs: () => 123,
  }),
  { allowDeviceLocalRecords: false },
);

describe("createSyncBlobRepo", () => {
  it("adds Accept-Version on /sync/pull while preserving Authorization and X-Device-Id", async () => {
    const requests: Array<{ url: string; method: string; headers: Headers }> = [];
    const fetchSync = createDeviceBoundFetchMock((url, init) => {
      requests.push({
        url,
        method: init?.method ?? "GET",
        headers: new Headers(init?.headers),
      });
      return new Response(
        JSON.stringify({
          records: [],
          next_commit_seq: "7",
          current_account_commit_seq: "7",
          has_more: false,
        }),
        { status: 200 },
      );
    });

    const repo = createSyncBlobRepo<ContractRecord>({
      namespace: "todos",
      accountId: "acct-1",
      deviceId: DEVICE_ID,
      fetchSync,
      crypto: createMockCrypto<ContractRecord>(),
    });

    await repo.pull({ limit: 50 });

    expect(requests).toHaveLength(1);
    expect(requests[0]?.url).toContain("/sync/pull?");
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.headers.get("Accept-Version")).toBe("sync.protocol=1");
    expect(requests[0]?.headers.get("Authorization")).toBe(AUTH_HEADER);
    expect(requests[0]?.headers.get("X-Device-Id")).toBe(DEVICE_ID);
    expect(requests[0]?.headers.get("X-Sync-Version")).toBeNull();
  });

  it("pushes encrypted blob envelopes to /sync/push and never uses business-table URLs", async () => {
    const urls: string[] = [];
    const pushes: Array<Record<string, unknown>> = [];
    const pushHeaders: Headers[] = [];
    const fetchSync = createDeviceBoundFetchMock(async (url, init) => {
      urls.push(url);
      if (url.includes("/sync/push")) {
        pushHeaders.push(new Headers(init?.headers));
        pushes.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
        return new Response(JSON.stringify({ accepted: true }), { status: 200 });
      }

      return new Response(
        JSON.stringify({ records: [], next_commit_seq: "0", has_more: false }),
        { status: 200 },
      );
    });

    const repo = createSyncBlobRepo<ContractRecord>({
      namespace: "todos",
      accountId: "acct-1",
      deviceId: DEVICE_ID,
      fetchSync,
      crypto: createMockCrypto<ContractRecord>(),
      newMutationId: createMutationIdFactory(),
      nowMs: () => 999,
    });

    await repo.put(makeRecord("todo-1"));

    expect(urls.some((url) => url.includes("/rest/v1/"))).toBe(false);
    expect(urls.filter((url) => url.includes("/sync/push"))).toHaveLength(1);
    expect(pushHeaders[0]?.get("Accept-Version")).toBe("sync.protocol=1");
    expect(pushHeaders[0]?.get("Authorization")).toBe(AUTH_HEADER);
    expect(pushHeaders[0]?.get("X-Device-Id")).toBe(DEVICE_ID);

    const records = pushes[0]?.records as Array<Record<string, unknown>>;
    expect(pushes[0]?.accountId).toBe("acct-1");
    expect(Array.isArray(records)).toBe(true);
    expect(records[0]?.entity_id).toBe("todo-1");
    expect(records[0]?.originator_device_id).toBe(DEVICE_ID);
    expect(typeof records[0]?.blob).toBe("string");
    expect(records[0]?.hard_delete).toBe(false);
  });

  it("rejects device-local records before creating a remote mutation", async () => {
    let pushAttempts = 0;
    const fetchSync = createDeviceBoundFetchMock((url) => {
      if (url.includes("/sync/push")) {
        pushAttempts += 1;
        return new Response(JSON.stringify({ accepted: true }), { status: 200 });
      }
      return new Response(JSON.stringify({ records: [], next_commit_seq: "0" }), {
        status: 200,
      });
    });

    const repo = createSyncBlobRepo<ContractRecord>({
      namespace: "todos",
      accountId: "acct-1",
      deviceId: DEVICE_ID,
      fetchSync,
      crypto: createMockCrypto<ContractRecord>(),
      newMutationId: createMutationIdFactory(),
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
    expect(repo.syncState()).toMatchObject({
      pendingMutationCount: 0,
      mirroredRecordCount: 0,
    });
  });

  it("maps /sync/push 401 responses to E_SYNC_BLOB_AUTH without retry", async () => {
    let pushAttempts = 0;
    const fetchSync = createDeviceBoundFetchMock((url) => {
      if (url.includes("/sync/push")) {
        pushAttempts += 1;
        return new Response(
          JSON.stringify({ code: "unknown_device", message: "unknown device" }),
          { status: 401 },
        );
      }
      return new Response(JSON.stringify({ records: [], next_commit_seq: "0" }), {
        status: 200,
      });
    });

    const repo = createSyncBlobRepo<ContractRecord>({
      namespace: "todos",
      accountId: "acct-1",
      deviceId: DEVICE_ID,
      fetchSync,
      crypto: createMockCrypto<ContractRecord>(),
      newMutationId: createMutationIdFactory(),
      retry: { maxAttempts: 4, baseDelayMs: 1, maxDelayMs: 5, jitterRatio: 0 },
      sleepMs: async () => undefined,
    });

    await expect(repo.put(makeRecord("todo-401"))).rejects.toThrow(
      /E_SYNC_BLOB_AUTH/,
    );
    expect(pushAttempts).toBe(1);
  });

  it("maps /sync/push 403 responses to E_SYNC_BLOB_DEVICE_REVOKED", async () => {
    const fetchSync = createDeviceBoundFetchMock((url) => {
      if (!url.includes("/sync/push")) {
        return new Response(JSON.stringify({ records: [], next_commit_seq: "0" }), {
          status: 200,
        });
      }
      return new Response(
        JSON.stringify({ code: "device_revoked", message: "device revoked" }),
        { status: 403 },
      );
    });

    const repo = createSyncBlobRepo<ContractRecord>({
      namespace: "todos",
      accountId: "acct-1",
      deviceId: DEVICE_ID,
      fetchSync,
      crypto: createMockCrypto<ContractRecord>(),
      newMutationId: createMutationIdFactory(),
      sleepMs: async () => undefined,
    });

    await expect(repo.put(makeRecord("todo-403"))).rejects.toThrow(
      /E_SYNC_BLOB_DEVICE_REVOKED/,
    );
  });

  it("retries 429 with stable mutation_id and Retry-After backoff", async () => {
    const pushBodies: Array<Array<Record<string, unknown>>> = [];
    const sleeps: number[] = [];
    let pushAttempts = 0;

    const fetchSync = createDeviceBoundFetchMock((url, init) => {
      if (!url.includes("/sync/push")) {
        return new Response(
          JSON.stringify({ records: [], next_commit_seq: "0", has_more: false }),
          { status: 200 },
        );
      }

      pushAttempts += 1;
      const body = JSON.parse(String(init?.body)) as {
        records: Array<Record<string, unknown>>;
      };
      pushBodies.push(body.records);

      if (pushAttempts <= 2) {
        return new Response(JSON.stringify({ message: "rate limited" }), {
          status: 429,
          headers: { "Retry-After": "0.005" },
        });
      }

      return new Response(JSON.stringify({ accepted: true }), { status: 200 });
    });

    const repo = createSyncBlobRepo<ContractRecord>({
      namespace: "todos",
      accountId: "acct-1",
      deviceId: DEVICE_ID,
      fetchSync,
      crypto: createMockCrypto<ContractRecord>(),
      newMutationId: createMutationIdFactory(),
      retry: { maxAttempts: 4, baseDelayMs: 3, maxDelayMs: 10, jitterRatio: 0 },
      sleepMs: async (ms) => {
        sleeps.push(ms);
      },
    });

    await repo.put(makeRecord("todo-rate-limit"));

    expect(pushAttempts).toBe(3);
    expect(sleeps).toEqual([5, 5]);
    expect(pushBodies).toHaveLength(3);
    expect(pushBodies[0]?.[0]?.mutation_id).toBe("m-1");
    expect(pushBodies[1]?.[0]?.mutation_id).toBe("m-1");
    expect(pushBodies[2]?.[0]?.mutation_id).toBe("m-1");
  });

  it("handles 409 by pulling latest revision and reusing mutation_id", async () => {
    const pullRequests: string[] = [];
    const pushBodies: Array<Array<Record<string, unknown>>> = [];
    const sleeps: number[] = [];
    let pushAttempts = 0;
    let pullAttempts = 0;

    const remoteRecord = makeRecord("todo-409", {
      title: "remote",
      priority: 9,
    });
    const remoteBlob = Buffer.from(JSON.stringify(remoteRecord), "utf8").toString(
      "base64",
    );

    const fetchSync = createDeviceBoundFetchMock((url, init) => {
      if (url.includes("/sync/pull")) {
        pullAttempts += 1;
        pullRequests.push(url);
        return new Response(
          JSON.stringify({
            records: [
              {
                entity_type: "productivity.todo",
                entity_id: "todo-409",
                revision: "5",
                key_id: 7,
                blob: remoteBlob,
                commit_seq: "42",
                soft_deleted: false,
                hard_deleted: false,
                originator_device_id: "peer-device",
              },
            ],
            next_commit_seq: "42",
            has_more: false,
          }),
          { status: 200 },
        );
      }

      if (url.includes("/sync/push")) {
        pushAttempts += 1;
        const body = JSON.parse(String(init?.body)) as {
          records: Array<Record<string, unknown>>;
        };
        pushBodies.push(body.records);
        if (pushAttempts === 1) {
          return new Response(JSON.stringify({ message: "revision conflict" }), {
            status: 409,
          });
        }
        return new Response(JSON.stringify({ accepted: true }), { status: 200 });
      }

      return new Response("unexpected", { status: 500 });
    });

    const repo = createSyncBlobRepo<ContractRecord>({
      namespace: "todos",
      accountId: "acct-1",
      deviceId: DEVICE_ID,
      fetchSync,
      crypto: createMockCrypto<ContractRecord>(),
      newMutationId: createMutationIdFactory(),
      retry: { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 5, jitterRatio: 0 },
      sleepMs: async (ms) => {
        sleeps.push(ms);
      },
    });

    const localWrite = makeRecord("todo-409", {
      title: "local-overwrite",
      priority: 1,
    });

    await repo.put(localWrite);

    expect(pushAttempts).toBe(2);
    expect(pullAttempts).toBe(1);
    expect(pullRequests[0]).toContain("/sync/pull?");
    expect(sleeps).toEqual([1]);
    expect(pushBodies[0]?.[0]?.mutation_id).toBe("m-1");
    expect(pushBodies[1]?.[0]?.mutation_id).toBe("m-1");
    expect(pushBodies[1]?.[0]?.base_revision).toBe("5");
    expect(pushBodies[1]?.[0]?.proposed_revision).toBe("6");
    const finalLocal = await repo.get("todo-409");
    expect(finalLocal?.title).toBe("local-overwrite");
  });

  it("maps version_required and 426 to E_SYNC_BLOB_UPGRADE_REQUIRED", async () => {
    const versionRequiredFetch = createDeviceBoundFetchMock((url) => {
      if (!url.includes("/sync/push")) {
        return new Response(JSON.stringify({ records: [], next_commit_seq: "0" }), {
          status: 200,
        });
      }
      return new Response(
        JSON.stringify({
          code: "version_required",
          message: "missing Accept-Version",
        }),
        { status: 400 },
      );
    });

    const upgradeFetch = createDeviceBoundFetchMock((url) => {
      if (!url.includes("/sync/push")) {
        return new Response(JSON.stringify({ records: [], next_commit_seq: "0" }), {
          status: 200,
        });
      }
      return new Response(JSON.stringify({ message: "upgrade required" }), {
        status: 426,
      });
    });

    const repoA = createSyncBlobRepo<ContractRecord>({
      namespace: "todos",
      accountId: "acct-1",
      deviceId: DEVICE_ID,
      fetchSync: versionRequiredFetch,
      crypto: createMockCrypto<ContractRecord>(),
      newMutationId: createMutationIdFactory(),
      sleepMs: async () => undefined,
    });
    const repoB = createSyncBlobRepo<ContractRecord>({
      namespace: "todos",
      accountId: "acct-1",
      deviceId: DEVICE_ID,
      fetchSync: upgradeFetch,
      crypto: createMockCrypto<ContractRecord>(),
      newMutationId: createMutationIdFactory(),
      sleepMs: async () => undefined,
    });

    await expect(repoA.put(makeRecord("todo-version-required"))).rejects.toThrow(
      /E_SYNC_BLOB_UPGRADE_REQUIRED/,
    );
    await expect(repoB.put(makeRecord("todo-upgrade"))).rejects.toThrow(
      /E_SYNC_BLOB_UPGRADE_REQUIRED/,
    );
  });

  it("exposes sync cursor state for downstream cache handoff", async () => {
    const fetchSync = createDeviceBoundFetchMock((url) => {
      if (url.includes("/sync/pull")) {
        return new Response(
          JSON.stringify({
            records: [
              {
                entity_type: "productivity.todo",
                entity_id: "todo-cursor",
                revision: "3",
                key_id: 7,
                blob: Buffer.from(
                  JSON.stringify(makeRecord("todo-cursor", { title: "pulled" })),
                  "utf8",
                ).toString("base64"),
                commit_seq: "11",
                soft_deleted: false,
                hard_deleted: false,
                originator_device_id: "peer-device",
              },
            ],
            next_commit_seq: "11",
            has_more: false,
          }),
          { status: 200 },
        );
      }

      return new Response(JSON.stringify({ accepted: true }), { status: 200 });
    });

    const repo = createSyncBlobRepo<ContractRecord>({
      namespace: "todos",
      accountId: "acct-1",
      deviceId: DEVICE_ID,
      fetchSync,
      crypto: createMockCrypto<ContractRecord>(),
      newMutationId: createMutationIdFactory(),
    });

    await repo.pull();
    await repo.put(makeRecord("todo-local", { title: "local" }));

    expect(repo.syncState()).toEqual({
      lastCommitSeq: "11",
      pendingMutationCount: 0,
      mirroredRecordCount: 2,
    });
  });

  it("keeps migrationVersion unchanged when migrate transaction push fails", async () => {
    const fetchSync = createDeviceBoundFetchMock((url) => {
      if (!url.includes("/sync/push")) {
        return new Response(JSON.stringify({ records: [], next_commit_seq: "0" }), {
          status: 200,
        });
      }
      return new Response(JSON.stringify({ message: "nope" }), { status: 401 });
    });

    const repo = createSyncBlobRepo<ContractRecord>({
      namespace: "todos",
      accountId: "acct-1",
      deviceId: DEVICE_ID,
      fetchSync,
      crypto: createMockCrypto<ContractRecord>(),
      newMutationId: createMutationIdFactory(),
      sleepMs: async () => undefined,
    });

    await expect(
      repo.migrate({
        id: "migrate-fail",
        fromVersion: 0,
        toVersion: 1,
        steps: [
          async (tx) => {
            await tx.put(makeRecord("todo-migrate-fail"));
          },
        ],
      }),
    ).rejects.toThrow(/E_SYNC_BLOB_AUTH/);

    await expect(repo.metadata()).resolves.toMatchObject({
      migrationVersion: 0,
      recordCount: 0,
    });
    expect(repo.syncState().pendingMutationCount).toBe(0);
  });
});

function createMutationIdFactory() {
  let value = 0;
  return () => {
    value += 1;
    return `m-${value}`;
  };
}

function createMockCrypto<T extends RepoRecord>(): SyncBlobCryptoAdapter<T> {
  return {
    async encryptRecord(input) {
      const payload = JSON.stringify(input.record);
      return {
        blobBase64: Buffer.from(payload, "utf8").toString("base64"),
      };
    },

    async decryptRecord(input) {
      const json = Buffer.from(input.blobBase64, "base64").toString("utf8");
      return JSON.parse(json) as T;
    },

    getCurrentKeyId() {
      return 7;
    },
  };
}

function createDeviceBoundFetchMock(
  responder: (
    url: string,
    init?: RequestInit,
  ) => Response | Promise<Response>,
) {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const headers = new Headers(init?.headers);
    if (!headers.has("Authorization")) {
      headers.set("Authorization", AUTH_HEADER);
    }
    if (!headers.has("X-Device-Id")) {
      headers.set("X-Device-Id", DEVICE_ID);
    }

    return responder(url, {
      ...init,
      headers,
    });
  };
}
