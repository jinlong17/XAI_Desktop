import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent } from "@testing-library/react";
import { accountScope } from "@repo/plugin-web-storage";
import { activate, cases, controlValue, download, editField, flush, guard, hold, mount, nativeGet, nativeSet, setup } from "./fixture";

beforeEach(setup);
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("a failed predecessor can be retried without acknowledging its queued latest sound choice", async () => {
  const ui = mount(); await flush(); const release = await hold(cases[1].key); let failFirst = true, failLatest = true;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
    if (key === cases[1].key && ((value === "chime" && failFirst) || (value === "bell" && failLatest))) throw new Error("quota"); nativeSet.call(this, key, value);
  });
  editField(ui, cases[1], "chime"); editField(ui, cases[1], "bell"); await release(); await flush(24);
  expect(nativeGet.call(localStorage, cases[1].key)).toBe("subtle"); expect(controlValue(ui, cases[1])).toBe("bell"); expect(guard()?.isBlocking()).toBe(true);
  failFirst = false; fireEvent.click(ui.getByRole("button", { name: "Retry Sound" })); await flush(24);
  expect(nativeGet.call(localStorage, cases[1].key)).toBe("chime"); expect(controlValue(ui, cases[1])).toBe("bell"); expect(guard()?.isBlocking()).toBe(true);
  failLatest = false; fireEvent.click(ui.getByRole("button", { name: "Retry Sound" })); await flush(24);
  expect(nativeGet.call(localStorage, cases[1].key)).toBe("bell"); expect(guard()?.isBlocking()).toBe(false);
});

it("device draft survives A to B to locked while the old capability refuses and the fresh one exports", async () => {
  nativeSet.call(localStorage, cases[5].key, "true");
  const ui = mount(); await flush(); const release = await hold(cases[6].key);
  try {
    editField(ui, cases[6], "23:15"); const old = guard(); expect(old).not.toBeNull();
    act(() => activate("notif-sol-B")); accountScope.lock("locked"); await flush(16);
    const file = download(); old!.exportDraft(); expect(file.click).not.toHaveBeenCalled(); expect(old!.isCurrent()).toBe(false);
    expect(guard()?.isBlocking()).toBe(true); guard()?.exportDraft(); expect(await file.read()).toEqual({ version: 1, kind: "notifications-draft", values: { device: { quiet_start: "23:15" } } });
  } finally { await release(); }
  await flush(20); expect(nativeGet.call(localStorage, cases[6].key)).toBe("23:15"); expect(guard()?.isBlocking()).toBe(false);
});
