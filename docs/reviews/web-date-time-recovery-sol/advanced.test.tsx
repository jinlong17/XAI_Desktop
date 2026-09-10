import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent } from "@testing-library/react";
import { accountScope } from "@repo/plugin-web-storage";
import { activate, changeAll, download, flush, guard, hold, keys, mount, nativeGet, nativeSet, physical, setup } from "./fixture";

beforeEach(setup); afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("a previous equal Sunday success cannot clear a later Sunday failure", async () => {
  const ui = mount(); await flush(); fireEvent.change(ui.select(), { target: { value: "sunday" } }); await flush(16); fireEvent.change(ui.select(), { target: { value: "saturday" } }); await flush(16); const base = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { if (key === keys[0] && value === "sunday") throw new Error("latest Sunday quota"); base.call(this,key,value); });
  fireEvent.change(ui.select(), { target: { value: "sunday" } }); await flush(16);
  expect(ui.select().value).toBe("sunday"); expect(nativeGet.call(localStorage,keys[0])).toBe("saturday"); expect(guard()?.isBlocking()).toBe(true);
});

it("repeated Retry during a pending toggle cannot duplicate or settle a newer intent", async () => {
  const ui = mount(); await flush(); const release = await hold(keys[1]); const base = Storage.prototype.setItem; let writes = 0; vi.spyOn(Storage.prototype,"setItem").mockImplementation(function(this:Storage,key,value){if(key===keys[1])writes++;base.call(this,key,value)});
  fireEvent.click(ui.toggle("Show Lunar Calendar")); const retry = ui.getByRole("button", { name: /Retry.*Show Lunar Calendar/i }); fireEvent.click(retry); fireEvent.click(retry); fireEvent.click(ui.toggle("Show Lunar Calendar")); expect(ui.toggle("Show Lunar Calendar").getAttribute("aria-checked")).toBe("true"); await release(); await flush(24);
  expect(nativeGet.call(localStorage,keys[1])).toBe("true"); expect(writes).toBeLessThanOrEqual(2); expect(guard()?.isBlocking()).toBe(false);
});

it("external raw replacement under the real key lock is preserved as conflict", async () => {
  const ui = mount(); await flush(); const release = await hold(keys[0]); fireEvent.change(ui.select(), { target: { value: "sunday" } }); nativeSet.call(localStorage,keys[0],"saturday"); await release(); await flush(20);
  expect(nativeGet.call(localStorage,keys[0])).toBe("saturday"); expect(ui.select().value).toBe("sunday"); expect(guard()?.isBlocking()).toBe(true); expect(ui.getByText(/Start week on was not saved/i)).toBeTruthy();
});

it("targeted discard rereads only its field with zero writes and preserves failed sibling export", async () => {
  const ui = mount(); await flush(); const base = Storage.prototype.setItem; vi.spyOn(Storage.prototype,"setItem").mockImplementation(function(this:Storage,key,value){if(key===keys[1]||key===keys[2])throw new Error("quota");base.call(this,key,value)}); fireEvent.click(ui.toggle("Show Lunar Calendar")); fireEvent.click(ui.toggle("Show Week Numbers (W)")); await flush(16); vi.restoreAllMocks(); const gets=vi.spyOn(Storage.prototype,"getItem"),sets=vi.spyOn(Storage.prototype,"setItem"),removes=vi.spyOn(Storage.prototype,"removeItem"); fireEvent.click(ui.getByRole("button",{name:/Discard.*Show Lunar Calendar/i})); await flush();
  expect(gets.mock.calls.filter(([key])=>keys.includes(key as never)).map(([key])=>key)).toEqual([keys[1]]); expect(sets.mock.calls.filter(([key])=>keys.includes(key as never))).toEqual([]); expect(removes).not.toHaveBeenCalled(); expect(guard()?.isBlocking()).toBe(true); const file=download(); guard()?.exportDraft(); expect(await file.read()).toEqual({version:1,kind:"date-time-draft",values:{device:{week_numbers:false}}});
});

it("source-only repair does not discard or retry an unrelated actual failure", async () => {
  nativeSet.call(localStorage,keys[0],"invalid"); const ui=mount(); await flush(); const base=Storage.prototype.setItem; vi.spyOn(Storage.prototype,"setItem").mockImplementation(function(this:Storage,key,value){if(key===keys[1])throw new Error("quota");base.call(this,key,value)}); fireEvent.click(ui.toggle("Show Lunar Calendar")); await flush(); vi.restoreAllMocks(); nativeSet.call(localStorage,keys[0],"monday"); fireEvent.click(ui.getByRole("button",{name:/Reload.*Start week on/i})); await flush();
  expect(ui.queryByRole("button",{name:/Reload.*Start week on/i})).toBeNull(); expect(ui.toggle("Show Lunar Calendar").getAttribute("aria-checked")).toBe("false"); expect(nativeGet.call(localStorage,keys[1])).toBe("true"); expect(guard()?.isBlocking()).toBe(true);
});

it("fresh locked capability exports surviving device draft while stale capability refuses", async () => {
  const ui=mount(); await flush(); const release=await hold(keys[3]); fireEvent.click(ui.toggle("Show Holidays")); const old=guard()!; act(()=>activate("dt-sol-B")); accountScope.lock("locked"); await flush(); const file=download(); old.exportDraft(); expect(file.click).not.toHaveBeenCalled(); guard()?.exportDraft(); expect(await file.read()).toEqual({version:1,kind:"date-time-draft",values:{device:{holidays:false}}}); expect(guard()?.isBlocking()).toBe(true); await release();
});

it("all-five full-denial export is exact and remains guarded", async () => {
  const ui=mount(); await flush(); const releases=[]; for(const key of keys)releases.push(await hold(key)); changeAll(ui); const file=download(); vi.spyOn(Storage.prototype,"getItem").mockImplementation(()=>{throw new Error("denied")});vi.spyOn(Storage.prototype,"setItem").mockImplementation(()=>{throw new Error("denied")});guard()?.exportDraft();expect(await file.read()).toEqual({version:1,kind:"date-time-draft",values:{device:{start_week:"sunday",lunar:false,week_numbers:false,holidays:false,timezone:false}}});expect(guard()?.isBlocking()).toBe(true);for(const release of releases)await release();
});

it("changed external bytes after uncertain commit remain preserved and unresolved on Retry", async () => {
  const ui=mount();await flush();let armed=false;vi.spyOn(Storage.prototype,"setItem").mockImplementation(function(this:Storage,key,value){nativeSet.call(this,key,value);if(key===keys[4])armed=true});vi.spyOn(Storage.prototype,"getItem").mockImplementation(function(this:Storage,key){if(key===keys[4]&&armed){armed=false;throw new Error("readback")};return nativeGet.call(this,key)});fireEvent.click(ui.toggle("Time Zone"));await flush(16);vi.restoreAllMocks();nativeSet.call(localStorage,keys[4],"true");fireEvent.click(ui.getByRole("button",{name:/Retry.*Time Zone/i}));await flush(16);expect(nativeGet.call(localStorage,keys[4])).toBe("true");expect(ui.toggle("Time Zone").getAttribute("aria-checked")).toBe("false");expect(guard()?.isBlocking()).toBe(true);
});
