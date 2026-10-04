import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, waitFor } from "@testing-library/react";
import { accountPrefix, generationMarkerKey } from "@repo/plugin-web-storage";
import { accountCases, cases, controlValue, deviceCases, download, editField, encode, expectedDraft, flush, guard, hold, holdAccount, mount, nativeGet, nativeRemove, nativeSet, physical, setup } from "./fixture";

beforeEach(setup); afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const reset = (ui: ReturnType<typeof mount>) => fireEvent.click(ui.getByTestId("more-reset-default"));

it("missing and rejected Web Locks retain exact device/account edit and reset intents", async () => {
  const device = deviceCases[0]!, account = accountCases[0]!, ui = mount(); await flush(); const liveLocks = navigator.locks;
  vi.stubGlobal("navigator", {}); editField(ui, device, device.latest); await flush(18); expect(nativeGet.call(localStorage, physical(device))).toBe(encode(device.initial)); expect(controlValue(ui, device)).toBe(device.latest); expect(guard()?.isBlocking()).toBe(true);
  vi.stubGlobal("navigator", { locks: liveLocks }); fireEvent.click(ui.getByRole("button", { name: `Retry ${device.label}` })); await flush(20); expect(nativeGet.call(localStorage, physical(device))).toBe(encode(device.latest));
  vi.spyOn(navigator.locks, "request").mockRejectedValueOnce(new Error("lock rejected")); editField(ui, account, account.first); await flush(18); expect(nativeGet.call(localStorage, physical(account))).toBe(encode(account.initial)); expect(guard()?.isBlocking()).toBe(true); vi.restoreAllMocks(); fireEvent.click(ui.getByRole("button", { name: `Retry ${account.label}` })); await flush(20); expect(nativeGet.call(localStorage, physical(account))).toBe(encode(account.first));
  vi.stubGlobal("navigator", {}); reset(ui); await flush(20); expect(guard()?.isBlocking()).toBe(true); const file = download(); guard()?.exportDraft(); const data = await file.read(); expect(Object.values(data.changes.device)).toHaveLength(13); expect(Object.values(data.changes.account)).toHaveLength(2);
});

it("invalid and unavailable sources retain requested reset intents without purging raw bytes", async () => {
  const invalid = deviceCases[1]!, unavailable = accountCases[0]!; nativeSet.call(localStorage, physical(invalid), "invalid-bool"); const base = Storage.prototype.getItem; const unavailableKey = physical(unavailable);
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key) { if (String(key) === unavailableKey) throw new Error("unavailable"); return base.call(this, key); }); const ui = mount(); await flush(); reset(ui); await flush(30);
  await waitFor(() => { for (const entry of cases) if (entry !== invalid && entry !== unavailable) expect(nativeGet.call(localStorage, physical(entry)), entry.field).toBeNull(); });
  expect(nativeGet.call(localStorage, physical(invalid))).toBe("invalid-bool"); expect(nativeGet.call(localStorage, physical(unavailable))).toBe(encode(unavailable.initial)); expect(controlValue(ui, invalid)).toBe(invalid.default); expect(controlValue(ui, unavailable)).toBe(unavailable.default); expect(guard()?.isBlocking()).toBe(true);
  const file = download(); guard()?.exportDraft(); expect(await file.read()).toEqual(expectedDraft([{ entry: invalid, operation: "reset" }, { entry: unavailable, operation: "reset" }]));
});

it.each(["missing committed marker", "deleted tombstone"] as const)("%s lets device resets settle but retains both private reset intents", async denial => {
  const privateKeys = accountCases.map(entry => physical(entry));
  if (denial === "missing committed marker") nativeRemove.call(localStorage, generationMarkerKey("more-sol-A"));
  else nativeSet.call(localStorage, `${accountPrefix("more-sol-A")}deleted`, "receipt");
  const ui = mount(); await flush(); reset(ui); await flush(30);
  for (const entry of deviceCases) expect(nativeGet.call(localStorage, physical(entry))).toBeNull();
  for (const [index, entry] of accountCases.entries()) expect(nativeGet.call(localStorage, privateKeys[index]!)).toBe(encode(entry.initial));
  const file = download(); guard()?.exportDraft(); expect(await file.read()).toEqual(expectedDraft(accountCases.map(entry => ({ entry, operation: "reset" }))));
  if (denial === "missing committed marker") nativeSet.call(localStorage, generationMarkerKey("more-sol-A"), JSON.stringify({ generation: "g1", migrationId: "more-sol", previous: null })); else nativeRemove.call(localStorage, `${accountPrefix("more-sol-A")}deleted`);
  for (const entry of accountCases) fireEvent.click(ui.getByRole("button", { name: `Retry ${entry.label}` })); await flush(30);
  if (denial === "missing committed marker") { for (const key of privateKeys) expect(nativeGet.call(localStorage, key)).toBeNull(); expect(guard()?.isBlocking()).toBe(false); }
  else { for (const [index, entry] of accountCases.entries()) expect(nativeGet.call(localStorage, privateKeys[index]!)).toBe(encode(entry.initial)); expect(guard()?.isBlocking()).toBe(true); guard()?.discardDraft(); await flush(20); reset(ui); await flush(30); for (const key of privateKeys) expect(nativeGet.call(localStorage, key)).toBeNull(); expect(guard()?.isBlocking()).toBe(false); }
});

it("a held account lifecycle lock leaves device reset independent and private reset pending", async () => {
  const privateKeys = accountCases.map(entry => physical(entry)), ui = mount(); await flush(); const release = await holdAccount(); reset(ui); await flush(24);
  for (const entry of deviceCases) expect(nativeGet.call(localStorage, physical(entry))).toBeNull(); for (const [index, entry] of accountCases.entries()) expect(nativeGet.call(localStorage, privateKeys[index]!)).toBe(encode(entry.initial)); expect(guard()?.isBlocking()).toBe(true);
  await release(); await flush(30); for (const key of privateKeys) expect(nativeGet.call(localStorage, key)).toBeNull(); expect(guard()?.isBlocking()).toBe(false);
});

it("setting an exact registry default stores bytes while Reset Default removes them", async () => {
  const entry = deviceCases[0]!, ui = mount(); await flush(); editField(ui, entry, entry.default); await flush(20); expect(nativeGet.call(localStorage, physical(entry))).toBe(encode(entry.default)); expect(guard()?.isBlocking()).toBe(false); reset(ui); await flush(30); expect(nativeGet.call(localStorage, physical(entry))).toBeNull(); expect(controlValue(ui, entry)).toBe(entry.default);
});

it("a same-field source Reload cannot erase an actual failed edit draft", async () => {
  const entry = deviceCases[0]!, ui = mount(); await flush(); const set = Storage.prototype.setItem; vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { if (String(key) === physical(entry)) throw new Error("quota"); set.call(this, key, value); });
  editField(ui, entry, entry.latest); await flush(20); const reads = vi.spyOn(Storage.prototype, "getItem"); const reload = ui.queryByRole("button", { name: `Reload ${entry.label}` }); if (reload) fireEvent.click(reload); await flush(16); expect(controlValue(ui, entry)).toBe(entry.latest); expect(guard()?.isBlocking()).toBe(true); expect(reads.mock.calls.filter(([key]) => String(key) === physical(entry))).toHaveLength(0);
});

it("targeted discard rereads only its field with zero mutations and preserves a failed sibling", async () => {
  const first = deviceCases[0]!, second = accountCases[1]!, ui = mount(); await flush(); const set = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { if (String(key) === physical(first) || String(key) === physical(second)) throw new Error("quota"); set.call(this, key, value); }); editField(ui, first, first.latest); editField(ui, second, second.first); await flush(20); vi.restoreAllMocks();
  const reads = vi.spyOn(Storage.prototype, "getItem"), writes = vi.spyOn(Storage.prototype, "setItem"), removes = vi.spyOn(Storage.prototype, "removeItem"); fireEvent.click(ui.getByRole("button", { name: `Discard ${first.label}` })); await flush(18);
  expect(reads.mock.calls.filter(([key]) => cases.some(entry => physical(entry) === String(key))).map(([key]) => key)).toEqual([physical(first)]); expect(writes).not.toHaveBeenCalled(); expect(removes).not.toHaveBeenCalled(); expect(guard()?.isBlocking()).toBe(true); const file = download(); guard()?.exportDraft(); expect(await file.read()).toEqual(expectedDraft([{ entry: second, operation: "set", value: second.first }]));
});

it("an external conflict coexists with an unrelated quota failure and Retry preserves external bytes", async () => {
  const conflict = deviceCases[0]!, quota = accountCases[0]!, ui = mount(); await flush(); const release = await hold(conflict), set = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { if (String(key) === physical(quota)) throw new Error("quota"); set.call(this, key, value); }); editField(ui, conflict, conflict.latest); editField(ui, quota, quota.first); nativeSet.call(localStorage, physical(conflict), encode(conflict.first)); await release(); await flush(24);
  expect(nativeGet.call(localStorage, physical(conflict))).toBe(encode(conflict.first)); expect(nativeGet.call(localStorage, physical(quota))).toBe(encode(quota.initial)); const file = download(); guard()?.exportDraft(); expect(await file.read()).toEqual(expectedDraft([{ entry: conflict, operation: "set", value: conflict.latest }, { entry: quota, operation: "set", value: quota.first }]));
  vi.restoreAllMocks(); fireEvent.click(ui.getByRole("button", { name: `Retry ${conflict.label}` })); await flush(20); expect(nativeGet.call(localStorage, physical(conflict))).toBe(encode(conflict.first)); expect(guard()?.isBlocking()).toBe(true);
});

it("all-discard visits only current drafts and a later same-field reset survives old completion", async () => {
  const entry = deviceCases[0]!, ui = mount(); await flush(); const release = await hold(entry); editField(ui, entry, entry.latest); guard()?.discardDraft(); reset(ui); await flush(12); await release(); await flush(30); expect(controlValue(ui, entry)).toBe(entry.default); expect(guard()?.isBlocking()).toBe(false); expect(nativeGet.call(localStorage, physical(entry))).toBeNull();
});
