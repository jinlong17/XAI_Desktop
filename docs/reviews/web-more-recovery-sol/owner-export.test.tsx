import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent } from "@testing-library/react";
import { accountScope, generationKey } from "@repo/plugin-web-storage";
import { accountCases, activate, cases, deviceCases, download, editField, encode, expectedDraft, flush, guard, hold, holdAccount, mount, nativeGet, nativeSet, physical, setup, unload } from "./fixture";

let scopeA: ReturnType<typeof accountScope.capture>;
beforeEach(() => { scopeA = setup(); }); afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const reset = (ui: ReturnType<typeof mount>) => fireEvent.click(ui.getByTestId("more-reset-default"));

it("all15 held reset intents export exact13device plus2account operation envelopes from memory", async () => {
  const ui = mount(); await flush(); const releases: Array<() => Promise<void>> = []; for (const entry of cases) releases.push(await hold(entry));
  try { reset(ui); await flush(14); expect(guard()?.isBlocking()).toBe(true); expect(unload()).toBe(true); const file = download(); const reads = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("deny read"); }); const writes = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("deny write"); }); const removes = vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => { throw new Error("deny remove"); }); guard()?.exportDraft(); expect(await file.read()).toEqual(expectedDraft(cases.map(entry => ({ entry, operation: "reset" })))); expect(reads).not.toHaveBeenCalled(); expect(writes).not.toHaveBeenCalled(); expect(removes).not.toHaveBeenCalled(); }
  finally { vi.restoreAllMocks(); for (const release of releases) await release(); }
});

it("partial reset plus a separate failed set exports only current sparse mixed set/reset work", async () => {
  const resetEntry = accountCases[0]!, setEntry = deviceCases[0]!, ui = mount(); await flush(); const remove = Storage.prototype.removeItem, set = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation(function (this: Storage, key) { if (String(key) === physical(resetEntry)) throw new Error("reset quota"); remove.call(this, key); });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { if (String(key) === physical(setEntry) && value === encode(setEntry.latest)) throw new Error("set quota"); set.call(this, key, value); });
  reset(ui); await flush(30); editField(ui, setEntry, setEntry.latest); await flush(20); const file = download(); guard()?.exportDraft(); expect(await file.read()).toEqual(expectedDraft([{ entry: setEntry, operation: "set", value: setEntry.latest }, { entry: resetEntry, operation: "reset" }]));
});

it("a valid A reset admits device continuity across B and locked while delayed A-private work refuses", async () => {
  const device = deviceCases[0]!, privateEntry = accountCases[0]!, privateKeyA = physical(privateEntry, scopeA), ui = mount(); await flush(); const releaseDevice = await hold(device), releasePrivate = await hold(privateEntry); const old = guard();
  reset(ui); await flush(12); activate("more-sol-B", "gB"); nativeSet.call(localStorage, generationKey("more-sol-B", "gB", privateEntry.key), "personal"); accountScope.lock("more-sol-locked"); await flush(18);
  expect(old?.isCurrent()).toBe(false); expect(old?.isBlocking()).toBe(false); const staleFile = download(); old?.exportDraft(); expect(staleFile.click).not.toHaveBeenCalled();
  await releasePrivate(); await releaseDevice(); await flush(30); expect(nativeGet.call(localStorage, physical(device))).toBeNull(); expect(nativeGet.call(localStorage, privateKeyA)).toBe(encode(privateEntry.initial)); expect(nativeGet.call(localStorage, generationKey("more-sol-B", "gB", privateEntry.key))).toBe("personal");
  const current = guard(); expect(current?.isBlocking()).toBe(false); const currentFile = download(); current?.exportDraft(); expect(currentFile.click).not.toHaveBeenCalled();
});

it("a device edit survives A to B to locked and remains exportable only through fresh permission", async () => {
  const entry = deviceCases[0]!, ui = mount(); await flush(); const release = await hold(entry); editField(ui, entry, entry.latest); const old = guard(); activate("more-sol-B", "gB"); accountScope.lock("more-sol-locked"); await flush(18);
  const oldFile = download(); old?.exportDraft(); expect(oldFile.click).not.toHaveBeenCalled(); expect(old?.isCurrent()).toBe(false); const fresh = guard(); expect(fresh?.isBlocking()).toBe(true); const freshFile = download(); fresh?.exportDraft(); expect(await freshFile.read()).toEqual(expectedDraft([{ entry, operation: "set", value: entry.latest }])); await release(); await flush(24); expect(nativeGet.call(localStorage, physical(entry))).toBe(encode(entry.latest)); expect(guard()?.isBlocking()).toBe(false);
});

it("an A-private failed draft is hidden immediately under B and never exports or writes B", async () => {
  const entry = accountCases[1]!, ui = mount(); await flush(); const originalB = "today"; nativeSet.call(localStorage, generationKey("more-sol-B", "gB", entry.key), originalB); const set = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { if (String(key) === physical(entry, scopeA)) throw new Error("A quota"); set.call(this, key, value); }); editField(ui, entry, entry.first); await flush(20); expect(guard()?.isBlocking()).toBe(true); const old = guard(); activate("more-sol-B", "gB"); await flush(18);
  expect(old?.isCurrent()).toBe(false); expect(old?.isBlocking()).toBe(false); const file = download(); old?.exportDraft(); expect(file.click).not.toHaveBeenCalled(); expect(nativeGet.call(localStorage, generationKey("more-sol-B", "gB", entry.key))).toBe(originalB); expect(guard()?.isBlocking()).toBe(false);
});

it("a same-account new epoch invalidates old capabilities, preserves device work and never revives private work", async () => {
  const device = deviceCases[0]!, privateEntry = accountCases[0]!, ui = mount(); await flush(); const releaseDevice = await hold(device), releasePrivate = await hold(privateEntry); editField(ui, device, device.latest); editField(ui, privateEntry, privateEntry.first); const old = guard();
  activate("more-sol-A", "g2"); await flush(18); expect(old?.isCurrent()).toBe(false); expect(old?.isBlocking()).toBe(false); const fresh = guard(); expect(fresh?.isBlocking()).toBe(true); const file = download(); fresh?.exportDraft(); expect(await file.read()).toEqual(expectedDraft([{ entry: device, operation: "set", value: device.latest }]));
  await releasePrivate(); await releaseDevice(); await flush(30); expect(nativeGet.call(localStorage, physical(device))).toBe(encode(device.latest)); expect(nativeGet.call(localStorage, generationKey("more-sol-A", "g1", privateEntry.key))).toBe(encode(privateEntry.initial)); expect(guard()?.isBlocking()).toBe(false);
  activate("more-sol-A", "g1"); await flush(18); expect(guard()?.isBlocking()).toBe(false); const returned = download(); guard()?.exportDraft(); expect(returned.click).not.toHaveBeenCalled();
});

it("an unrelated held account lifecycle lock does not serialize a device edit", async () => {
  const entry = deviceCases[2]!, ui = mount(); await flush(); const release = await holdAccount(); try { editField(ui, entry, entry.latest); await flush(20); expect(nativeGet.call(localStorage, physical(entry))).toBe(encode(entry.latest)); } finally { await release(); }
});

it("old guard capabilities and pending work detach on unmount without reviving UI state", async () => {
  const entry = deviceCases[3]!, ui = mount(); await flush(); const release = await hold(entry); editField(ui, entry, entry.latest); const old = guard()!; ui.unmount(); const file = download(), reads = vi.spyOn(Storage.prototype, "getItem"), writes = vi.spyOn(Storage.prototype, "setItem"), removes = vi.spyOn(Storage.prototype, "removeItem");
  expect(old.isCurrent()).toBe(false); expect(old.isBlocking()).toBe(false); old.exportDraft(); old.discardDraft(); expect(file.click).not.toHaveBeenCalled(); expect(reads).not.toHaveBeenCalled(); expect(writes).not.toHaveBeenCalled(); expect(removes).not.toHaveBeenCalled(); await release(); await flush(20); expect(nativeGet.call(localStorage, physical(entry))).toBe(encode(entry.initial));
});

it.each(["blob", "url", "append"] as const)("%s-time owner invalidation cancels obsolete export and cleans resources", async stage => {
  const entry = deviceCases[0]!, ui = mount(); await flush(); const release = await hold(entry); editField(ui, entry, entry.latest); await flush(12); const old = guard()!, file = download(), NativeBlob = Blob;
  const invalidate = () => act(() => { activate("more-sol-B", "gB"); });
  if (stage === "blob") vi.stubGlobal("Blob", class extends NativeBlob { constructor(parts?: BlobPart[], options?: BlobPropertyBag) { super(parts, options); invalidate(); } });
  if (stage === "url") (URL.createObjectURL as ReturnType<typeof vi.fn>).mockImplementation(() => { invalidate(); return "blob:more-sol"; });
  if (stage === "append") { const append = document.body.appendChild.bind(document.body); vi.spyOn(document.body, "appendChild").mockImplementation(node => { const result = append(node); invalidate(); return result; }); }
  old.exportDraft(); expect(file.click).not.toHaveBeenCalled(); expect(old.isCurrent()).toBe(false); if (stage !== "blob") expect(file.revoke).toHaveBeenCalledWith("blob:more-sol"); expect(document.querySelector('a[download="more-draft.json"]')).toBeNull(); await release();
});

it.each(["url", "click"] as const)("%s export failure preserves the draft, reports recovery and can be retried", async stage => {
  const entry = deviceCases[0]!, ui = mount(); await flush(); const set = Storage.prototype.setItem; vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { if (String(key) === physical(entry)) throw new Error("quota"); set.call(this, key, value); }); editField(ui, entry, entry.latest); await flush(20); vi.restoreAllMocks();
  const file = download(); if (stage === "url") (URL.createObjectURL as ReturnType<typeof vi.fn>).mockImplementationOnce(() => { throw new Error("url setup"); }); else file.click.mockImplementationOnce(() => { throw new Error("click"); });
  guard()?.exportDraft(); await flush(12); expect(ui.getAllByRole("alert").some(alert => alert.textContent?.includes("Export failed"))).toBe(true); expect(guard()?.isBlocking()).toBe(true); expect(document.querySelector('a[download="more-draft.json"]')).toBeNull();
  guard()?.exportDraft(); expect(file.click).toHaveBeenCalledTimes(stage === "click" ? 2 : 1); expect(guard()?.isBlocking()).toBe(true);
});
