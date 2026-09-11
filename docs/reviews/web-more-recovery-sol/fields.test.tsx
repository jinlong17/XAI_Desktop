import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent } from "@testing-library/react";
import { accountCases, cases, controlValue, deviceCases, editField, encode, flush, guard, hold, mount, nativeGet, nativeSet, physical, selectCases, setup, unload } from "./fixture";

beforeEach(setup); afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("all15 valid domains persist exact codec bytes", async () => {
  const ui = mount(); await flush();
  for (const entry of cases) for (const value of entry.domain) { editField(ui, entry, value); await flush(12); expect(controlValue(ui, entry), entry.field).toBe(value); expect(nativeGet.call(localStorage, physical(entry)), entry.field).toBe(encode(value)); }
});

it("both span-only checkbox controls expose operable accessible pressed-state buttons", async () => {
  const ui = mount(); await flush();
  for (const entry of cases.filter(row => row.field === "remove_date_text" || row.field === "remove_tags")) {
    const control = ui.getByRole("button", { name: entry.label });
    expect(control).toHaveAttribute("aria-pressed", String(entry.initial));
  }
});

it("all15 absent sources render registry defaults with zero mount writes or removes", async () => {
  localStorage.clear(); setup(); for (const entry of cases) localStorage.removeItem(physical(entry)); const sets = vi.spyOn(Storage.prototype, "setItem"), removes = vi.spyOn(Storage.prototype, "removeItem");
  const ui = mount(); await flush(16); for (const entry of cases) { expect(controlValue(ui, entry), entry.field).toBe(entry.default); expect(nativeGet.call(localStorage, physical(entry)), entry.field).toBeNull(); }
  expect(sets).not.toHaveBeenCalled(); expect(removes).not.toHaveBeenCalled();
});

it("all15 absent sources are nonblocking and do not warn beforeunload", async () => {
  localStorage.clear(); setup(); for (const entry of cases) localStorage.removeItem(physical(entry)); const ui = mount(); await flush(16);
  expect(guard()?.isBlocking()).toBe(false); expect(unload()).toBe(false);
});

it("all15 invalid sources preserve bytes and remain Reload-only without drafts", async () => {
  for (const entry of cases) nativeSet.call(localStorage, physical(entry), typeof entry.default === "boolean" ? "maybe" : "__invalid__"); const sets = vi.spyOn(Storage.prototype, "setItem"), removes = vi.spyOn(Storage.prototype, "removeItem");
  const ui = mount(); await flush(16); for (const entry of cases) { expect(controlValue(ui, entry), entry.field).toBe(entry.default); expect(ui.getByRole("button", { name: `Reload ${entry.label}` }), entry.field).toBeTruthy(); expect(nativeGet.call(localStorage, physical(entry))).toBe(typeof entry.default === "boolean" ? "maybe" : "__invalid__"); }
  expect(sets).not.toHaveBeenCalled(); expect(removes).not.toHaveBeenCalled(); expect(guard()?.isBlocking()).toBe(false); expect(unload()).toBe(false);
});

it("device and account unavailable sources remain defaulted, nonblocking and Reload-only", async () => {
  const targets = new Set([physical(deviceCases[0]!), physical(accountCases[0]!), physical(accountCases[1]!)]); const base = Storage.prototype.getItem;
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key) { if (targets.has(String(key))) throw new Error("unavailable"); return base.call(this, key); });
  const ui = mount(); await flush(16); for (const entry of [deviceCases[0]!, ...accountCases]) { expect(controlValue(ui, entry)).toBe(entry.default); expect(ui.getByRole("button", { name: `Reload ${entry.label}` })).toBeTruthy(); }
  expect(guard()?.isBlocking()).toBe(false); expect(unload()).toBe(false);
});

describe.each(cases)("$field latest edit", entry => {
  it("retains the latest same-turn choice when its later write fails, then Retry recovers", async () => {
    const ui = mount(); await flush(); const release = await hold(entry); let failLatest = true; const base = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { if (String(key) === physical(entry) && value === encode(entry.latest) && failLatest) throw new Error("quota"); base.call(this, key, value); });
    editField(ui, entry, entry.first); editField(ui, entry, entry.latest); await release(); await flush(24);
    expect(controlValue(ui, entry)).toBe(entry.latest); expect(nativeGet.call(localStorage, physical(entry))).toBe(encode(entry.first)); expect(guard()?.isBlocking()).toBe(true); expect(unload()).toBe(true);
    failLatest = false; fireEvent.click(ui.getByRole("button", { name: `Retry ${entry.label}` })); await flush(24); expect(nativeGet.call(localStorage, physical(entry))).toBe(encode(entry.latest)); expect(guard()?.isBlocking()).toBe(false);
  });
});

it("malformed device and account select edits keep independent field errors and prior values", async () => {
  const ui = mount(); await flush(); const targets = [selectCases[0]!, accountCases[0]!, accountCases[1]!];
  for (const entry of targets) fireEvent.change(ui.getByLabelText(entry.label), { target: { value: "__invalid__" } }); await flush(12);
  for (const entry of targets) { expect(controlValue(ui, entry)).toBe(entry.initial); expect(ui.getAllByRole("alert").some(alert => alert.textContent?.includes(entry.label) && alert.textContent.includes("invalid"))).toBe(true); expect(nativeGet.call(localStorage, physical(entry))).toBe(encode(entry.initial)); }
  editField(ui, selectCases[1]!, selectCases[1]!.first); await flush(16); for (const entry of targets) expect(ui.getAllByRole("alert").some(alert => alert.textContent?.includes(entry.label) && alert.textContent.includes("invalid"))).toBe(true); expect(guard()?.isBlocking()).toBe(false);
});
