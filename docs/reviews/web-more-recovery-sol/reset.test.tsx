import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent } from "@testing-library/react";
import { accountScope, generationKey } from "@repo/plugin-web-storage";
import { accountCases, activate, cases, controlValue, deviceCases, download, encode, expectedDraft, flush, guard, mount, nativeGet, nativeRemove, nativeSet, physical, seed, setup, unload } from "./fixture";

let scopeA: ReturnType<typeof accountScope.capture>;
beforeEach(() => { scopeA = setup(); }); afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const reset = (ui: ReturnType<typeof mount>) => fireEvent.click(ui.getByTestId("more-reset-default"));

it("Reset Default removes all15 physical values, renders defaults and preserves B, legacy and unrelated bytes", async () => {
  nativeSet.call(localStorage, generationKey("more-sol-B", "gB", accountCases[0]!.key), "personal"); nativeSet.call(localStorage, generationKey("more-sol-B", "gB", accountCases[1]!.key), "today");
  nativeSet.call(localStorage, accountCases[0]!.key, "legacy-tag"); nativeSet.call(localStorage, accountCases[1]!.key, "legacy-list"); nativeSet.call(localStorage, "xai_pref_notif_enabled", "false");
  const sets = vi.spyOn(Storage.prototype, "setItem"), removes = vi.spyOn(Storage.prototype, "removeItem"); const ui = mount(); await flush(); reset(ui); await flush(30);
  for (const entry of cases) { expect(nativeGet.call(localStorage, physical(entry, scopeA)), entry.field).toBeNull(); expect(controlValue(ui, entry), entry.field).toBe(entry.default); }
  expect(removes.mock.calls.map(([key]) => key).filter(key => cases.some(entry => physical(entry, scopeA) === key))).toHaveLength(15); expect(sets).not.toHaveBeenCalled();
  expect(nativeGet.call(localStorage, generationKey("more-sol-B", "gB", accountCases[0]!.key))).toBe("personal"); expect(nativeGet.call(localStorage, generationKey("more-sol-B", "gB", accountCases[1]!.key))).toBe("today");
  expect(nativeGet.call(localStorage, accountCases[0]!.key)).toBe("legacy-tag"); expect(nativeGet.call(localStorage, accountCases[1]!.key)).toBe("legacy-list"); expect(nativeGet.call(localStorage, "xai_pref_notif_enabled")).toBe("false"); expect(guard()?.isBlocking()).toBe(false);
});

it("all15 already-absent reset is a verified no-op without seeding defaults", async () => {
  for (const entry of cases) nativeRemove.call(localStorage, physical(entry)); const sets = vi.spyOn(Storage.prototype, "setItem"), removes = vi.spyOn(Storage.prototype, "removeItem"); const ui = mount(); await flush(); reset(ui); await flush(24);
  for (const entry of cases) { expect(nativeGet.call(localStorage, physical(entry))).toBeNull(); expect(controlValue(ui, entry)).toBe(entry.default); } expect(sets).not.toHaveBeenCalled(); expect(removes).not.toHaveBeenCalled(); expect(guard()?.isBlocking()).toBe(false);
});

describe.each(cases)("$field reset refusal", entry => {
  it("keeps only its failed reset recoverable and Retry removes exactly that field", async () => {
    const target = physical(entry), base = Storage.prototype.removeItem; let deny = true;
    const removes = vi.spyOn(Storage.prototype, "removeItem").mockImplementation(function (this: Storage, key) { if (String(key) === target && deny) throw new Error("remove quota"); base.call(this, key); });
    const ui = mount(); await flush(); reset(ui); await flush(30);
    for (const sibling of cases) expect(nativeGet.call(localStorage, physical(sibling)), sibling.field).toBe(sibling === entry ? encode(entry.initial) : null);
    expect(controlValue(ui, entry)).toBe(entry.default); expect(guard()?.isBlocking()).toBe(true); expect(unload()).toBe(true); const file = download(); guard()?.exportDraft(); expect(await file.read()).toEqual(expectedDraft([{ entry, operation: "reset" }]));
    const before = removes.mock.calls.length; deny = false; fireEvent.click(ui.getByRole("button", { name: `Retry ${entry.label}` })); await flush(24); expect(nativeGet.call(localStorage, target)).toBeNull(); expect(removes.mock.calls.length).toBe(before + 1); expect(guard()?.isBlocking()).toBe(false);
  });
});

it("locked or absent account refuses the full15 reset before every mutation, while a reopened active pane succeeds", async () => {
  const ui = mount(); await flush(); const keys = Object.fromEntries(cases.map(entry => [entry.field, physical(entry, scopeA)])); const snapshot = Object.fromEntries(cases.map(entry => [entry.field, nativeGet.call(localStorage, keys[entry.field])])) as Record<string, string | null>; accountScope.lock("more-sol-locked"); const removes = vi.spyOn(Storage.prototype, "removeItem"), sets = vi.spyOn(Storage.prototype, "setItem");
  reset(ui); await flush(16); expect(removes).not.toHaveBeenCalled(); expect(sets).not.toHaveBeenCalled(); expect(ui.getAllByRole("alert").some(alert => alert.textContent?.includes("Account changed"))).toBe(true); for (const entry of cases) expect(nativeGet.call(localStorage, keys[entry.field])).toBe(snapshot[entry.field]);
  ui.unmount(); activate("more-sol-B", "gB"); const scopeB = accountScope.capture(); seed(scopeB); const fresh = mount(); await flush(); reset(fresh); await flush(30); for (const entry of cases) expect(nativeGet.call(localStorage, physical(entry, scopeB))).toBeNull();
});

it("an A-mounted reset first clicked under B makes zero mutations to all15, B, device and legacy bytes", async () => {
  const ui = mount(); await flush(); activate("more-sol-B", "gB"); const scopeB = accountScope.capture(); seed(scopeB, entry => entry.latest); nativeSet.call(localStorage, accountCases[0]!.key, "legacy-tag");
  const before = Object.fromEntries(Object.keys(localStorage).map(name => [name, nativeGet.call(localStorage, name)])); const removes = vi.spyOn(Storage.prototype, "removeItem"), sets = vi.spyOn(Storage.prototype, "setItem"); reset(ui); await flush(20);
  expect(removes).not.toHaveBeenCalled(); expect(sets).not.toHaveBeenCalled(); expect(Object.fromEntries(Object.keys(localStorage).map(name => [name, nativeGet.call(localStorage, name)]))).toEqual(before); expect(ui.getByRole("alert")).toHaveTextContent("Account changed");
});

it("partial reset settles successful siblings and preserves independent device and account failures", async () => {
  const failed = [deviceCases[0]!, accountCases[0]!], targets = new Set(failed.map(entry => physical(entry))); const base = Storage.prototype.removeItem;
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation(function (this: Storage, key) { if (targets.has(String(key))) throw new Error("quota"); base.call(this, key); }); const ui = mount(); await flush(); reset(ui); await flush(30);
  for (const entry of cases) expect(nativeGet.call(localStorage, physical(entry))).toBe(targets.has(physical(entry)) ? encode(entry.initial) : null); const file = download(); guard()?.exportDraft(); expect(await file.read()).toEqual(expectedDraft(failed.map(entry => ({ entry, operation: "reset" })))); expect(guard()?.isBlocking()).toBe(true);
});
