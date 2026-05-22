import { describe, expect, it } from "vitest";

import { createSyncBlobRepo, type SyncBlobCryptoAdapter } from "../src/sync-blob";
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
    const fetchSync = createDeviceBoundFetchMock(async (url, init) => {
      urls.push(url);
      if (url.includes("/sync/push")) {
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

    const records = pushes[0]?.records as Array<Record<string, unknown>>;
    expect(Array.isArray(records)).toBe(true);
    expect(records[0]?.entity_id).toBe("todo-1");
    expect(typeof records[0]?.blob).toBe("string");
    expect(records[0]?.hard_delete).toBe(false);
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
