import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent } from "@testing-library/react";
import { accountScope } from "@repo/plugin-web-storage";
import { activate, download, flush, guard, hold, keys, mount, nativeGet, nativeSet, physical, setup, unload } from "./fixture";

beforeEach(setup); afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("sparse memory export works under complete storage denial and retains guard", async () => {
  const ui = mount(); await flush(); const release = await hold(keys[0]); fireEvent.change(ui.select(), { target: { value: "saturday" } }); const file = download(); vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("denied"); }); vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("denied"); }); guard()?.exportDraft(); expect(await file.read()).toEqual({ version: 1, kind: "date-time-draft", values: { device: { start_week: "saturday" } } }); expect(guard()?.isBlocking()).toBe(true); await release();
});

it("all-current discard performs zero writes and stale completion cannot resurrect recovery", async () => {
  const ui = mount(); await flush(); const release = await hold(keys[4]); const writes = vi.spyOn(Storage.prototype, "setItem"), removes = vi.spyOn(Storage.prototype, "removeItem"); fireEvent.click(ui.toggle("Time Zone")); expect(guard()?.isBlocking()).toBe(true); guard()?.discardDraft(); expect(writes.mock.calls.filter(([key]) => keys.includes(key as never))).toEqual([]); expect(removes).not.toHaveBeenCalled(); expect(guard()?.isBlocking()).toBe(false); await release(); await flush(16); expect(nativeGet.call(localStorage, keys[4])).toBe("true"); expect(guard()?.isBlocking()).toBe(false);
});

it("old capability refuses after A to B while fresh locked permission keeps device draft", async () => {
  const ui = mount(); await flush(); const release = await hold(keys[3]); fireEvent.click(ui.toggle("Show Holidays")); const old = guard()!; act(() => activate("dt-sol-B")); expect(old.isCurrent()).toBe(false); expect(old.isBlocking()).toBe(false); old.discardDraft(); accountScope.lock("locked"); await flush(); expect(guard()?.isCurrent()).toBe(true); expect(guard()?.isBlocking()).toBe(true); await release();
});

it("synchronous owner change during URL setup cancels stale click and cleans URL", async () => {
  const ui = mount(); await flush(); const release = await hold(keys[2]); fireEvent.click(ui.toggle("Show Week Numbers (W)")); const old = guard()!; const file = download(); (URL.createObjectURL as ReturnType<typeof vi.fn>).mockImplementation((blob: Blob) => { act(() => activate("dt-sol-B")); return "blob:stale"; }); old.exportDraft(); expect(file.click).not.toHaveBeenCalled(); expect(file.revoke).toHaveBeenCalledWith("blob:stale"); expect(physical()[2]).toBe("true"); await release();
});

it("one-write uncertain commit keeps recovery until unchanged Retry verifies it", async () => {
  const ui = mount(); await flush(); let armed = false, writes = 0; vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { nativeSet.call(this,key,value); if (key === keys[1]) { armed = true; writes++; } }); vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key) { if (key === keys[1] && armed) { armed = false; throw new Error("readback"); } return nativeGet.call(this,key); }); fireEvent.click(ui.toggle("Show Lunar Calendar")); await flush(16); expect(nativeGet.call(localStorage,keys[1])).toBe("false"); expect(guard()?.isBlocking()).toBe(true); fireEvent.click(ui.getByRole("button", { name: /Retry.*Show Lunar Calendar/i })); await flush(16); expect(writes).toBe(1); expect(guard()?.isBlocking()).toBe(false); expect(unload()).toBe(false);
});
