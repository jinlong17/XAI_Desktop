import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent } from "@testing-library/react";
import { accountScope } from "@repo/plugin-web-storage";
import { activate, download, flush, guard, hold, keys, mount, nativeGet, nativeSet, setup, unload } from "./fixture";

beforeEach(setup);
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

const labels = ["Start week on", "Show Lunar Calendar", "Show Week Numbers (W)", "Show Holidays", "Time Zone"] as const;
const draftValue = (index: number) => index === 0 ? "sunday" : "false";
const editField = (ui: ReturnType<typeof mount>, index: number) => index === 0
  ? fireEvent.change(ui.select(), { target: { value: "sunday" } })
  : fireEvent.click(ui.toggle(labels[index]));

describe.each(keys.map((key, index) => ({ key, index, label: labels[index] }))) ("$label public field recovery", ({ key, index, label }) => {
  it("retains a rejected write and Retry persists only that field", async () => {
    const ui = mount(); await flush(); const base = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, name, value) { if (name === key) throw new DOMException("quota", "QuotaExceededError"); base.call(this, name, value); });
    editField(ui, index); await flush(16); expect(nativeGet.call(localStorage, key)).toBe(index === 0 ? "monday" : "true"); expect(guard()?.isBlocking()).toBe(true);
    vi.restoreAllMocks(); fireEvent.click(ui.getByRole("button", { name: new RegExp(`Retry.*${label.replace(/[()]/g, "\\$&")}`, "i") })); await flush(16);
    expect(nativeGet.call(localStorage, key)).toBe(draftValue(index)); expect(guard()?.isBlocking()).toBe(false);
  });
});

it("absent sources mount without writes and invalid DOM input never becomes a draft", async () => {
  localStorage.clear(); activate("dt-sol-A"); const writes = vi.spyOn(Storage.prototype, "setItem"), removes = vi.spyOn(Storage.prototype, "removeItem");
  const ui = mount(); await flush(); expect(writes.mock.calls.filter(([key]) => keys.includes(key as never))).toEqual([]); expect(removes).not.toHaveBeenCalled();
  fireEvent.change(ui.select(), { target: { value: "tuesday" } }); await flush(); expect(keys.map(key => nativeGet.call(localStorage, key))).toEqual([null, null, null, null, null]); expect(guard()?.isBlocking()).toBe(false); expect(unload()).toBe(false);
});

it("all three select values and both boolean directions persist through public controls", async () => {
  const ui = mount(); await flush();
  for (const value of ["sunday", "saturday", "monday"]) { fireEvent.change(ui.select(), { target: { value } }); await flush(12); expect(nativeGet.call(localStorage, keys[0])).toBe(value); }
  for (let index = 1; index < keys.length; index++) { fireEvent.click(ui.toggle(labels[index])); await flush(12); expect(nativeGet.call(localStorage, keys[index])).toBe("false"); fireEvent.click(ui.toggle(labels[index])); await flush(12); expect(nativeGet.call(localStorage, keys[index])).toBe("true"); }
  expect(guard()?.isBlocking()).toBe(false); expect(unload()).toBe(false);
});

it("named-lock request rejection retains the edit and a later Retry succeeds", async () => {
  const ui = mount(); await flush(); const request = vi.spyOn(navigator.locks, "request").mockRejectedValueOnce(new Error("lock unavailable"));
  fireEvent.click(ui.toggle(labels[4])); await flush(16); expect(nativeGet.call(localStorage, keys[4])).toBe("true"); expect(guard()?.isBlocking()).toBe(true);
  request.mockRestore(); fireEvent.click(ui.getByRole("button", { name: /Retry.*Time Zone/i })); await flush(16); expect(nativeGet.call(localStorage, keys[4])).toBe("false"); expect(guard()?.isBlocking()).toBe(false);
});

it("all five unavailable sources are reload-only and malformed boolean bytes never seed drafts", async () => {
  for (const key of keys.slice(1)) nativeSet.call(localStorage, key, "FALSE"); const base = Storage.prototype.getItem;
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key) { if (keys.includes(key as never)) throw new DOMException("denied", "SecurityError"); return base.call(this, key); });
  const ui = mount(); await flush(); for (const label of labels) expect(ui.getByRole("button", { name: new RegExp(`Reload.*${label.replace(/[()]/g, "\\$&")}`, "i") })).toBeTruthy();
  expect(guard()?.isBlocking()).toBe(false); expect(unload()).toBe(false);
});

it("a valid edit after an unavailable source is exportable work when its write is refused", async () => {
  const baseGet = Storage.prototype.getItem, baseSet = Storage.prototype.setItem; let denyRead = true;
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key) { if (key === keys[1] && denyRead) throw new DOMException("denied", "SecurityError"); return baseGet.call(this, key); });
  const ui = mount(); await flush(); denyRead = false; vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { if (key === keys[1]) throw new Error("quota"); baseSet.call(this, key, value); });
  fireEvent.click(ui.toggle(labels[1])); await flush(16); const file = download(); guard()?.exportDraft(); expect(await file.read()).toEqual({ version: 1, kind: "date-time-draft", values: { device: { lunar: false } } }); expect(guard()?.isBlocking()).toBe(true);
});

it("a Retry read denial preserves the uncertain token and a later Retry verifies with one write", async () => {
  const ui = mount(); await flush(); let readback = false, retryDenied = false, writes = 0;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { nativeSet.call(this, key, value); if (key === keys[2]) { writes++; readback = true; } });
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key) { if (key === keys[2] && readback) { readback = false; throw new Error("readback"); } if (key === keys[2] && retryDenied) { retryDenied = false; throw new Error("retry denied"); } return nativeGet.call(this, key); });
  fireEvent.click(ui.toggle(labels[2])); await flush(16); retryDenied = true; const retry = () => fireEvent.click(ui.getByRole("button", { name: /Retry.*Show Week Numbers/i }));
  retry(); await flush(16); expect(writes).toBe(1); expect(guard()?.isBlocking()).toBe(true); retry(); await flush(16); expect(writes).toBe(1); expect(guard()?.isBlocking()).toBe(false);
});

it("conflict discard rereads only the select and leaves a quota sibling retryable", async () => {
  const ui = mount(); await flush(); const release = await hold(keys[0]); const base = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { if (key === keys[1]) throw new Error("quota"); base.call(this, key, value); });
  fireEvent.change(ui.select(), { target: { value: "sunday" } }); fireEvent.click(ui.toggle(labels[1])); nativeSet.call(localStorage, keys[0], "saturday"); await release(); await flush(16); vi.restoreAllMocks();
  const gets = vi.spyOn(Storage.prototype, "getItem"), sets = vi.spyOn(Storage.prototype, "setItem"), removes = vi.spyOn(Storage.prototype, "removeItem");
  fireEvent.click(ui.getByRole("button", { name: /Discard.*Start week on/i })); await flush(); expect(gets.mock.calls.filter(([key]) => keys.includes(key as never)).map(([key]) => key)).toEqual([keys[0]]); expect(sets).not.toHaveBeenCalled(); expect(removes).not.toHaveBeenCalled(); expect(guard()?.isBlocking()).toBe(true);
  vi.restoreAllMocks(); fireEvent.click(ui.getByRole("button", { name: /Retry.*Show Lunar Calendar/i })); await flush(16); expect(nativeGet.call(localStorage, keys[1])).toBe("false"); expect(guard()?.isBlocking()).toBe(false);
});

it.each(["blob", "url", "append", "click"] as const)("%s export setup failure retains recovery and cleans created resources", async stage => {
  const ui = mount(); await flush(); const release = await hold(keys[3]); fireEvent.click(ui.toggle(labels[3])); const NativeBlob = Blob; const revoke = vi.fn(), url = vi.fn(() => "blob:failure"); vi.stubGlobal("URL", { createObjectURL: url, revokeObjectURL: revoke });
  if (stage === "blob") vi.stubGlobal("Blob", class { constructor() { throw new Error("blob"); } });
  if (stage === "url") url.mockImplementation(() => { throw new Error("url"); });
  const append = vi.spyOn(document.body, "appendChild"); if (stage === "append") append.mockImplementation(() => { throw new Error("append"); });
  const click = vi.spyOn(HTMLAnchorElement.prototype, "click"); if (stage === "click") click.mockImplementation(() => { throw new Error("click"); });
  fireEvent.click(ui.getByRole("button", { name: "Export Date & Time draft" })); await flush(); expect(guard()?.isBlocking()).toBe(true); expect(ui.getByText("Export failed. Please retry.")).toBeTruthy(); if (stage === "append" || stage === "click") expect(revoke).toHaveBeenCalledWith("blob:failure");
  vi.stubGlobal("Blob", NativeBlob); await release();
});

it.each(["blob", "append"] as const)("synchronous owner change during %s setup prevents stale download", async stage => {
  const ui = mount(); await flush(); const release = await hold(keys[1]); fireEvent.click(ui.toggle(labels[1])); const old = guard()!, NativeBlob = Blob, file = download();
  if (stage === "blob") vi.stubGlobal("Blob", class extends NativeBlob { constructor(parts?: BlobPart[], options?: BlobPropertyBag) { super(parts, options); act(() => activate("dt-sol-B")); } });
  else { const append = document.body.appendChild.bind(document.body); vi.spyOn(document.body, "appendChild").mockImplementation(node => { act(() => activate("dt-sol-B")); return append(node); }); }
  old.exportDraft(); expect(file.click).not.toHaveBeenCalled(); expect(old.isCurrent()).toBe(false); if (stage === "append") expect(file.revoke).toHaveBeenCalledWith("blob:dt-sol"); await release();
});

it("device edits use only the registered device key and its physical lock", async () => {
  const ui = mount(); await flush(); const gets = vi.spyOn(Storage.prototype, "getItem"), sets = vi.spyOn(Storage.prototype, "setItem"), request = vi.spyOn(navigator.locks, "request");
  fireEvent.click(ui.toggle(labels[1])); await flush(16); const storageKeys = [...gets.mock.calls, ...sets.mock.calls].map(([key]) => String(key)); expect(storageKeys.length).toBeGreaterThan(0); expect(storageKeys.every(key => keys.includes(key as never))).toBe(true);
  const lockNames = request.mock.calls.map(([name]) => String(name)); expect(lockNames.length).toBeGreaterThan(0); expect(lockNames.every(name => name.includes(keys[1]))).toBe(true);
});

it("unmounted and old-owner capabilities independently refuse every operation", async () => {
  const ui = mount(); await flush(); const release = await hold(keys[4]); fireEvent.click(ui.toggle(labels[4])); const old = guard()!, file = download(); const reads = vi.spyOn(Storage.prototype, "getItem"), writes = vi.spyOn(Storage.prototype, "setItem");
  ui.unmount(); expect(old.isCurrent()).toBe(false); expect(old.isBlocking()).toBe(false); old.exportDraft(); old.discardDraft(); expect(file.click).not.toHaveBeenCalled(); expect(reads).not.toHaveBeenCalled(); expect(writes).not.toHaveBeenCalled();
  await release();
});

it("fresh locked permission can discard surviving device work with zero writes", async () => {
  const ui = mount(); await flush(); const release = await hold(keys[3]); fireEvent.click(ui.toggle(labels[3])); const stale = guard()!; act(() => activate("dt-sol-B")); accountScope.lock("locked"); await flush();
  expect(stale.isBlocking()).toBe(false); const writes = vi.spyOn(Storage.prototype, "setItem"), removes = vi.spyOn(Storage.prototype, "removeItem"); guard()?.discardDraft(); await flush(); expect(writes).not.toHaveBeenCalled(); expect(removes).not.toHaveBeenCalled(); expect(guard()?.isBlocking()).toBe(false); await release(); await flush(8); expect(nativeGet.call(localStorage, keys[3])).toBe("true");
});
