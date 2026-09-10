import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent } from "@testing-library/react";
import { changeAll, defaults, flush, guard, hold, keys, mount, nativeGet, nativeSet, physical, setup, unload, visible } from "./fixture";

beforeEach(setup); afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("normal five-field edits preserve codecs and start-week domain without mount writes", async () => {
  const spy = vi.spyOn(Storage.prototype, "setItem"); const ui = mount(); await flush(); expect(spy.mock.calls.filter(([key]) => keys.includes(key as never))).toEqual([]);
  changeAll(ui); await flush(); expect(physical()).toEqual(["sunday", "false", "false", "false", "false"]); expect(visible(ui)).toEqual(["sunday", "false", "false", "false", "false"]); expect(unload()).toBe(false);
});

it("all five quota failures retain latest visible values, old bytes and host truth", async () => {
  const ui = mount(); await flush(); vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { if (keys.includes(key as never)) throw new DOMException("quota", "QuotaExceededError"); nativeSet.call(this, key, value); });
  changeAll(ui); await flush(16); expect(visible(ui)).toEqual(["sunday", "false", "false", "false", "false"]); expect(physical()).toEqual(defaults); expect(guard()?.isBlocking()).toBe(true); expect(unload()).toBe(true);
});

it("five real held device-key locks retain all pending choices before physical commit", async () => {
  const ui = mount(); await flush(); const releases = []; for (const key of keys) releases.push(await hold(key)); changeAll(ui); await flush(); expect(visible(ui)).toEqual(["sunday", "false", "false", "false", "false"]); expect(physical()).toEqual(defaults); expect(guard()?.isBlocking()).toBe(true); for (const release of releases) await release(); await flush(16); expect(physical()).toEqual(["sunday", "false", "false", "false", "false"]); expect(guard()?.isBlocking()).toBe(false);
});

it("select failure with boolean success and reverse preserve only the failed sibling", async () => {
  const ui = mount(); await flush(); let failed = keys[0]; vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { if (key === failed) throw new Error("quota"); nativeSet.call(this, key, value); }); fireEvent.change(ui.select(), { target: { value: "saturday" } }); fireEvent.click(ui.toggle("Show Lunar Calendar")); await flush(); expect(physical().slice(0,2)).toEqual(["monday","false"]); expect(guard()?.isBlocking()).toBe(true);
  vi.restoreAllMocks(); failed = keys[2]; vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { if (key === failed) throw new Error("quota"); nativeSet.call(this, key, value); }); fireEvent.click(ui.getByRole("button", { name: /Retry.*Start week on/i })); await flush(); fireEvent.click(ui.toggle("Show Week Numbers (W)")); fireEvent.change(ui.select(), { target: { value: "sunday" } }); await flush(); expect(nativeGet.call(localStorage, keys[0])).toBe("sunday"); expect(nativeGet.call(localStorage, keys[2])).toBe("true"); expect(guard()?.isBlocking()).toBe(true);
});

it("invalid and unavailable sources are field-specific reload-only state without draft guard", async () => {
  nativeSet.call(localStorage, keys[0], "tuesday"); const base = Storage.prototype.getItem; vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key) { if (key === keys[1]) throw new DOMException("denied", "SecurityError"); return base.call(this, key); }); const ui = mount(); await flush(); expect(ui.getByRole("button", { name: /Reload.*Start week on/i })).toBeTruthy(); expect(ui.getByRole("button", { name: /Reload.*Show Lunar Calendar/i })).toBeTruthy(); expect(guard()?.isBlocking()).toBe(false); expect(unload()).toBe(false); expect(physical().slice(2)).toEqual(["true","true","true"]);
});
