import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent } from "@testing-library/react";
import { accountCases, cases, controlValue, deviceCases, download, editField, encode, expectedDraft, flush, guard, hold, mount, nativeGet, nativeRemove, nativeSet, physical, setup } from "./fixture";

beforeEach(setup); afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const batchReset = (ui: ReturnType<typeof mount>) => fireEvent.click(ui.getByTestId("more-reset-default"));

for (const entry of [deviceCases[0]!, accountCases[0]!]) {
  it(`${entry.owner} pending set then reset preserves reset as the latest operation`, async () => {
    const ui = mount(); await flush(); const release = await hold(entry); editField(ui, entry, entry.first); batchReset(ui); await flush(12); expect(controlValue(ui, entry)).toBe(entry.default); expect(guard()?.isBlocking()).toBe(true); await release(); await flush(30); expect(nativeGet.call(localStorage, physical(entry))).toBeNull(); expect(controlValue(ui, entry)).toBe(entry.default); expect(guard()?.isBlocking()).toBe(false);
  });

  it(`${entry.owner} pending reset then set preserves set as the latest operation`, async () => {
    const ui = mount(); await flush(); const release = await hold(entry); batchReset(ui); editField(ui, entry, entry.latest); await flush(12); expect(controlValue(ui, entry)).toBe(entry.latest); await release(); await flush(30); expect(nativeGet.call(localStorage, physical(entry))).toBe(encode(entry.latest)); expect(guard()?.isBlocking()).toBe(false);
  });
}

it("reset then edit then reset keeps distinct operation attribution even when the displayed value equals default", async () => {
  const entry = deviceCases[0]!, ui = mount(); await flush(); const release = await hold(entry); batchReset(ui); editField(ui, entry, entry.first); batchReset(ui); await flush(12); expect(controlValue(ui, entry)).toBe(entry.default); const file = download(); guard()?.exportDraft(); const data = await file.read(); expect(data.changes.device[entry.field]).toEqual({ operation: "reset" }); await release(); await flush(30); expect(nativeGet.call(localStorage, physical(entry))).toBeNull(); expect(guard()?.isBlocking()).toBe(false);
});

it("a failed set predecessor cannot acknowledge its queued reset and repeated recovery remains ordered", async () => {
  const entry = deviceCases[0]!, ui = mount(); await flush(); const release = await hold(entry); let failSet = true, failReset = true; const set = Storage.prototype.setItem, remove = Storage.prototype.removeItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { if (String(key) === physical(entry) && value === encode(entry.first) && failSet) throw new Error("set quota"); set.call(this, key, value); });
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation(function (this: Storage, key) { if (String(key) === physical(entry) && failReset) throw new Error("reset quota"); remove.call(this, key); });
  editField(ui, entry, entry.first); batchReset(ui); await release(); await flush(24); expect(controlValue(ui, entry)).toBe(entry.default); expect(nativeGet.call(localStorage, physical(entry))).toBe(encode(entry.initial)); expect(guard()?.isBlocking()).toBe(true);
  fireEvent.click(ui.getByRole("button", { name: `Retry ${entry.label}` })); await flush(24); expect(nativeGet.call(localStorage, physical(entry))).toBe(encode(entry.initial)); expect(guard()?.isBlocking()).toBe(true);
  failSet = false; fireEvent.click(ui.getByRole("button", { name: `Retry ${entry.label}` })); await flush(24); expect(nativeGet.call(localStorage, physical(entry))).toBe(encode(entry.first)); expect(guard()?.isBlocking()).toBe(true);
  failReset = false; fireEvent.click(ui.getByRole("button", { name: `Retry ${entry.label}` })); await flush(24); expect(nativeGet.call(localStorage, physical(entry))).toBeNull(); expect(guard()?.isBlocking()).toBe(false);
});

it("a successful set predecessor cannot acknowledge a failed latest reset", async () => {
  const entry = deviceCases[0]!, ui = mount(); await flush(); const release = await hold(entry); let deny = true; const remove = Storage.prototype.removeItem;
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation(function (this: Storage, key) { if (String(key) === physical(entry) && deny) throw new Error("reset quota"); remove.call(this, key); });
  editField(ui, entry, entry.first); batchReset(ui); await release(); await flush(30); expect(controlValue(ui, entry)).toBe(entry.default); expect(nativeGet.call(localStorage, physical(entry))).toBe(encode(entry.first)); expect(guard()?.isBlocking()).toBe(true);
  deny = false; fireEvent.click(ui.getByRole("button", { name: `Retry ${entry.label}` })); await flush(24); expect(nativeGet.call(localStorage, physical(entry))).toBeNull(); expect(guard()?.isBlocking()).toBe(false);
});

it("a failed reset predecessor cannot clear its queued latest set", async () => {
  const entry = accountCases[0]!, ui = mount(); await flush(); const release = await hold(entry); let deny = true; const remove = Storage.prototype.removeItem;
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation(function (this: Storage, key) { if (String(key) === physical(entry) && deny) throw new Error("reset quota"); remove.call(this, key); });
  batchReset(ui); editField(ui, entry, entry.first); await release(); await flush(24); expect(controlValue(ui, entry)).toBe(entry.first); expect(nativeGet.call(localStorage, physical(entry))).toBe(encode(entry.initial)); expect(guard()?.isBlocking()).toBe(true);
  deny = false; fireEvent.click(ui.getByRole("button", { name: `Retry ${entry.label}` })); await flush(30); expect(nativeGet.call(localStorage, physical(entry))).toBe(encode(entry.first)); expect(controlValue(ui, entry)).toBe(entry.first); expect(guard()?.isBlocking()).toBe(false);
});

it("a successful reset predecessor cannot acknowledge a failed latest set", async () => {
  const entry = accountCases[0]!, ui = mount(); await flush(); const release = await hold(entry); let deny = true; const set = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { if (String(key) === physical(entry) && value === encode(entry.first) && deny) throw new Error("set quota"); set.call(this, key, value); });
  batchReset(ui); editField(ui, entry, entry.first); await release(); await flush(30); expect(controlValue(ui, entry)).toBe(entry.first); expect(nativeGet.call(localStorage, physical(entry))).toBeNull(); expect(guard()?.isBlocking()).toBe(true);
  deny = false; fireEvent.click(ui.getByRole("button", { name: `Retry ${entry.label}` })); await flush(24); expect(nativeGet.call(localStorage, physical(entry))).toBe(encode(entry.first)); expect(guard()?.isBlocking()).toBe(false);
});

it("a repeatedly failed reset predecessor and failed queued set require ordered recovery", async () => {
  const entry = accountCases[0]!, ui = mount(); await flush(); const release = await hold(entry); let failReset = true, failSet = true; const remove = Storage.prototype.removeItem, set = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation(function (this: Storage, key) { if (String(key) === physical(entry) && failReset) throw new Error("reset quota"); remove.call(this, key); });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { if (String(key) === physical(entry) && value === encode(entry.first) && failSet) throw new Error("set quota"); set.call(this, key, value); });
  batchReset(ui); editField(ui, entry, entry.first); await release(); await flush(24); expect(nativeGet.call(localStorage, physical(entry))).toBe(encode(entry.initial)); expect(guard()?.isBlocking()).toBe(true);
  fireEvent.click(ui.getByRole("button", { name: `Retry ${entry.label}` })); await flush(24); expect(nativeGet.call(localStorage, physical(entry))).toBe(encode(entry.initial)); expect(guard()?.isBlocking()).toBe(true);
  failReset = false; fireEvent.click(ui.getByRole("button", { name: `Retry ${entry.label}` })); await flush(30); expect(nativeGet.call(localStorage, physical(entry))).toBeNull(); expect(controlValue(ui, entry)).toBe(entry.first); expect(guard()?.isBlocking()).toBe(true);
  failSet = false; fireEvent.click(ui.getByRole("button", { name: `Retry ${entry.label}` })); await flush(24); expect(nativeGet.call(localStorage, physical(entry))).toBe(encode(entry.first)); expect(guard()?.isBlocking()).toBe(false);
});

it("duplicate Reset Default and pending Retry do not enqueue duplicate removes", async () => {
  const entry = deviceCases[1]!, ui = mount(); await flush(); const release = await hold(entry); const removes = vi.spyOn(Storage.prototype, "removeItem"); batchReset(ui); batchReset(ui); const retry = ui.getByRole("button", { name: `Retry ${entry.label}` }); fireEvent.click(retry); fireEvent.click(retry); await flush(12); expect(removes.mock.calls.filter(([key]) => String(key) === physical(entry))).toHaveLength(0); await release(); await flush(30); expect(removes.mock.calls.filter(([key]) => String(key) === physical(entry))).toHaveLength(1); expect(guard()?.isBlocking()).toBe(false);
});

it("remove-success readback uncertainty reconciles through Retry with one total remove", async () => {
  const entry = deviceCases[2]!, ui = mount(); await flush(); let armed = false, removes = 0; const get = Storage.prototype.getItem;
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation(function (this: Storage, key) { nativeRemove.call(this, key); if (String(key) === physical(entry)) { armed = true; removes += 1; } });
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key) { if (String(key) === physical(entry) && armed) { armed = false; throw new Error("readback"); } return get.call(this, key); });
  batchReset(ui); await flush(30); expect(nativeGet.call(localStorage, physical(entry))).toBeNull(); expect(removes).toBe(1); expect(guard()?.isBlocking()).toBe(true); vi.restoreAllMocks();
  fireEvent.click(ui.getByRole("button", { name: `Retry ${entry.label}` })); await flush(24); expect(nativeGet.call(localStorage, physical(entry))).toBeNull(); expect(guard()?.isBlocking()).toBe(false);
});

it("temporary denial preserves an uncertain reset grant, but restored external bytes remain a conflict", async () => {
  const entry = deviceCases[3]!, ui = mount(); await flush(); let armed = false, denyRetry = false, removes = 0; const get = Storage.prototype.getItem;
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation(function (this: Storage, key) { nativeRemove.call(this, key); if (String(key) === physical(entry)) { armed = true; removes += 1; } });
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key) { if (String(key) === physical(entry) && armed) { armed = false; throw new Error("readback"); } if (String(key) === physical(entry) && denyRetry) { denyRetry = false; throw new Error("retry read"); } return get.call(this, key); });
  batchReset(ui); await flush(24); denyRetry = true; fireEvent.click(ui.getByRole("button", { name: `Retry ${entry.label}` })); await flush(24); expect(removes).toBe(1); expect(guard()?.isBlocking()).toBe(true);
  vi.restoreAllMocks(); nativeSet.call(localStorage, physical(entry), encode(entry.initial)); fireEvent.click(ui.getByRole("button", { name: `Retry ${entry.label}` })); await flush(24); expect(nativeGet.call(localStorage, physical(entry))).toBe(encode(entry.initial)); expect(guard()?.isBlocking()).toBe(true); batchReset(ui); await flush(24); expect(nativeGet.call(localStorage, physical(entry))).toBe(encode(entry.initial)); expect(guard()?.isBlocking()).toBe(true);
});

it("Discard all followed by same-field new set cannot be erased by the older held reset", async () => {
  const entry = deviceCases[0]!, ui = mount(); await flush(); const release = await hold(entry); const set = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { if (String(key) === physical(entry) && value === encode(entry.latest)) throw new Error("new quota"); set.call(this, key, value); });
  batchReset(ui); guard()?.discardDraft(); editField(ui, entry, entry.latest); await flush(12); await release(); await flush(30); expect(controlValue(ui, entry)).toBe(entry.latest); expect(guard()?.isBlocking()).toBe(true); const file = download(); guard()?.exportDraft(); expect(await file.read()).toEqual(expectedDraft([{ entry, operation: "set", value: entry.latest }]));
});
