import "./accountTestHarness.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { accountScope } from "../internal/accountScope.js";
import {
  findCanonicalCommandReceipt,
  readCanonicalCommandSnapshot,
  readCanonicalCommandState,
  type CanonicalCommandEnvelope,
} from "../internal/canonicalCommandState.js";
import { _clearAllListeners, getPref, removePref, setPref } from "../internal/storage.js";
import { usePref } from "../internal/usePref.js";
import { testStorage } from "./accountTestHarness.js";

const receipt = {
  operationVersion: 1 as const,
  signature: "tasks:create:v1",
  result: { ok: true as const, targetId: "task-1" },
  committedAt: "2026-09-09T12:00:00.000Z",
};

function envelope<T>(data: T): CanonicalCommandEnvelope<T> {
  return {
    format: "xai-command-state",
    version: 1,
    revision: 3,
    data,
    receipts: { "ai:request-1": receipt },
  };
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  localStorage.clear();
  _clearAllListeners();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("canonical command state B1 reader", () => {
  it("keeps legacy data readable without materializing an envelope", () => {
    const legacy = { todo: true };
    expect(readCanonicalCommandState(legacy)).toEqual({ status: "legacy", data: legacy });
  });

  it("requires the basic envelope shape and safe durable receipt fields", () => {
    expect(readCanonicalCommandState({
      format: "xai-command-state", version: 1, revision: 0, receipts: {},
    })).toEqual({ status: "corrupt", reason: "missing data" });
    expect(readCanonicalCommandState({
      ...envelope({}), receipts: { "\u0000bad": receipt },
    }).status).toBe("corrupt");
    expect(readCanonicalCommandState({
      ...envelope({}), receipts: { "ai:request-1": { ...receipt, signature: "" } },
    }).status).toBe("corrupt");
    expect(readCanonicalCommandState({
      ...envelope({}), receipts: { "ai:request-1": { ...receipt, committedAt: "never" } },
    }).status).toBe("corrupt");
  });

  it("uses safe own-property lookup for a __proto__ receipt", () => {
    const parsed = JSON.parse(`{
      "format":"xai-command-state","version":1,"revision":3,
      "data":{"todo":true},"receipts":{"__proto__":${JSON.stringify(receipt)}}
    }`) as CanonicalCommandEnvelope<{ todo: boolean }>;
    const state = readCanonicalCommandState(parsed);
    expect(state.status).toBe("envelope");
    if (state.status !== "envelope") throw new Error("expected envelope");
    expect(findCanonicalCommandReceipt(state.envelope, "__proto__")).toEqual(receipt);
  });

  it("distinguishes raw absent, corrupt, unsupported, and unavailable snapshots", () => {
    expect(readCanonicalCommandSnapshot("xai_task_cols")).toEqual({ status: "absent" });
    testStorage.setItem("xai_task_cols", "{not json");
    expect(readCanonicalCommandSnapshot("xai_task_cols")).toEqual({ status: "corrupt", reason: "invalid JSON" });
    testStorage.setItem("xai_task_cols", JSON.stringify({ ...envelope({}), version: 2 }));
    expect(readCanonicalCommandSnapshot("xai_task_cols")).toMatchObject({ status: "unsupported", version: 2 });
    vi.spyOn(Storage.prototype, "getItem").mockImplementationOnce(() => { throw new Error("denied"); });
    expect(readCanonicalCommandSnapshot("xai_task_cols")).toEqual({ status: "unavailable", reason: "storage unavailable" });
  });

  it("projects an envelope to ordinary readers but blocks old sync writers and removal", () => {
    const raw = JSON.stringify(envelope({ todo: true }));
    testStorage.setItem("xai_task_cols", raw);
    expect(getPref("xai_task_cols")).toEqual({ todo: true });
    expect(setPref("xai_task_cols", { later: true })).toBe(false);
    removePref("xai_task_cols");
    expect(testStorage.getItem("xai_task_cols")).toBe(raw);
  });

  it("fails closed when an envelope cannot be read before removal", () => {
    const raw = JSON.stringify(envelope({ todo: true }));
    testStorage.setItem("xai_task_cols", raw);
    const physicalKey = accountScope.physicalKey("xai_task_cols");
    const nativeGet = Storage.prototype.getItem;
    const removeSpy = vi.spyOn(Storage.prototype, "removeItem");
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key: string) {
      if (key === physicalKey) throw new DOMException("denied", "SecurityError");
      return nativeGet.call(this, key);
    });
    removePref("xai_task_cols");
    expect(removeSpy).not.toHaveBeenCalledWith(physicalKey);
    vi.restoreAllMocks();
    expect(localStorage.getItem(physicalKey)).toBe(raw);
  });

  it("projects a canonical StorageEvent through usePref without exposing receipts", async () => {
    const node = document.createElement("div");
    const root = createRoot(node);
    const observed: { value: unknown } = { value: undefined };
    function Probe() {
      const [value] = usePref("xai_calendar_events");
      observed.value = value;
      return null;
    }
    await act(async () => root.render(createElement(Probe)));
    const raw = JSON.stringify(envelope({ "event-1": { title: "Review" } }));
    const physicalKey = accountScope.physicalKey("xai_calendar_events");
    localStorage.setItem(physicalKey, raw);
    await act(async () => window.dispatchEvent(new StorageEvent("storage", {
      key: physicalKey, newValue: raw, storageArea: localStorage,
    })));
    expect(observed.value).toEqual({ "event-1": { title: "Review" } });
    await act(async () => root.unmount());
  });
});
