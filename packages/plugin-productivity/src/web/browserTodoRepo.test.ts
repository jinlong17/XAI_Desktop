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
      encryptionDeviceId: "device-1",
    });
    expect(isTodoWriteReady()).toBe(true);
    expect(getTodoCryptoSnapshot()).toMatchObject({
      keyId: 1,
      encryptionDeviceId: "device-1",
    });

    setTodoCryptoSnapshot({ dekBase64: "", keyId: 0 });
    expect(isTodoWriteReady()).toBe(false);
    expect(getTodoCryptoSnapshot()).toEqual({});

    setTodoCryptoSnapshot(null);
    expect(getTodoCryptoSnapshot()).toEqual({});
  });
});
