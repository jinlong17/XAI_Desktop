import { describe, expect, it } from "vitest";
import {
  createBrowserTodoRepo,
  getTodoCryptoSnapshot,
  isTodoWriteReady,
  setTodoCryptoSnapshot,
} from "./browserTodoRepo";

describe("browserTodoRepo crypto/session guards", () => {
  it("requires account/device/fetch session options", () => {
    expect(() => createBrowserTodoRepo()).toThrowError("todo_device_session_missing");
    expect(() => createBrowserTodoRepo({ accountId: "acct" })).toThrowError("todo_device_session_missing");
    expect(() => createBrowserTodoRepo({ accountId: "acct", deviceId: "dev" })).toThrowError(
      "todo_device_session_missing",
    );
  });

  it("normalizes and clears todo crypto snapshot", () => {
    setTodoCryptoSnapshot(null);
    expect(isTodoWriteReady()).toBe(false);

    setTodoCryptoSnapshot({
      dekBase64: "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
      keyId: 1,
      encryptionDeviceId: "1001",
      nextCounter: 7,
      leaseEnd: 9,
    });
    expect(isTodoWriteReady()).toBe(true);
    expect(getTodoCryptoSnapshot()).toMatchObject({
      keyId: 1,
      encryptionDeviceId: "1001",
      nextCounter: 7,
      leaseEnd: 9,
    });

    setTodoCryptoSnapshot({ dekBase64: "", keyId: 0 });
    expect(isTodoWriteReady()).toBe(false);
    expect(getTodoCryptoSnapshot()).toEqual({});

    setTodoCryptoSnapshot(null);
    expect(getTodoCryptoSnapshot()).toEqual({});
  });

  it("requires a numeric encryption device id and nonce counter before writes", () => {
    setTodoCryptoSnapshot({
      dekBase64: "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
      keyId: 1,
      encryptionDeviceId: "device-1",
    });

    expect(isTodoWriteReady()).toBe(false);
    expect(() =>
      createBrowserTodoRepo({
        accountId: "acct",
        deviceId: "device-1",
        fetchSync: async () =>
          new Response(JSON.stringify({ records: [], next_commit_seq: "0" }), {
            status: 200,
          }),
      }),
    ).not.toThrow();

    setTodoCryptoSnapshot(null);
  });

  it("pushes sync-v1 envelope headers with server-parseable nonce metadata", async () => {
    const pushes: Array<Record<string, unknown>> = [];
    setTodoCryptoSnapshot({
      dekBase64: "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
      keyId: 9,
      encryptionDeviceId: "1001",
      nextCounter: 11,
      leaseEnd: 12,
    });

    const repo = createBrowserTodoRepo({
      accountId: "acct",
      deviceId: "device-1",
      fetchSync: async (input, init) => {
        const url = String(input);
        if (url.includes("/sync/push")) {
          pushes.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
          return new Response(JSON.stringify({ accepted: true }), { status: 200 });
        }
        return new Response(
          JSON.stringify({
            records: [],
            next_commit_seq: "0",
            current_account_commit_seq: "0",
            has_more: false,
          }),
          { status: 200 },
        );
      },
    });

    await repo.put({
      id: "todo-1",
      entityType: "productivity.todo",
      schemaVersion: 1,
      syncScope: "account-sync",
      title: "server envelope",
      done: false,
      labelIds: [],
      createdAt: "2026-05-31T00:00:00.000Z",
      updatedAt: "2026-05-31T00:00:00.000Z",
    });

    const records = pushes[0]?.records as Array<Record<string, unknown>>;
    const bytes = Buffer.from(String(records[0]?.blob), "base64");
    expect([...bytes.subarray(0, 2)]).toEqual([1, 1]);
    expect(bytes.readUInt32LE(2)).toBe(9);
    expect(bytes.readBigUInt64LE(6)).toBe(1001n);
    expect(bytes.readUInt32LE(14)).toBe(11);
    expect(getTodoCryptoSnapshot().nextCounter).toBe(12);
    expect(isTodoWriteReady()).toBe(true);

    setTodoCryptoSnapshot(null);
  });
});
