import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent } from "@testing-library/react";
import { cases, controlValue, editField, encode, ensureQuiet, flush, guard, hold, mount, nativeGet, nativeSet, setup, unload } from "./fixture";

beforeEach(setup);
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("healthy native controls persist all sound values and strict boundary, overnight and equal times", async () => {
  const ui = mount(); await flush();
  const sound = cases[1];
  for (const value of ["none", "subtle", "chime", "bell", "pop"]) { editField(ui, sound, value); await flush(10); expect(nativeGet.call(localStorage, sound.key)).toBe(value); }
  await ensureQuiet(ui);
  const start = cases[6], end = cases[7];
  for (const [left, right] of [["00:00", "23:59"], ["23:15", "06:30"], ["12:00", "12:00"]]) {
    editField(ui, start, left); editField(ui, end, right); await flush(12);
    expect(nativeGet.call(localStorage, start.key)).toBe(left); expect(nativeGet.call(localStorage, end.key)).toBe(right);
  }
  expect(unload()).toBe(false);
});

describe.each(cases)("$label latest-choice failure", entry => {
  it("retains the latest public value, old physical bytes and field Retry, then recovers only that field", async () => {
    const ui = mount(); await flush();
    if (entry.field === "quiet_start" || entry.field === "quiet_end") await ensureQuiet(ui);
    const release = await hold(entry.key);
    const base = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
      if (key === entry.key && value === encode(entry.latest)) throw new DOMException("quota", "QuotaExceededError");
      base.call(this, key, value);
    });
    editField(ui, entry, entry.first); editField(ui, entry, entry.latest);
    await release(); await flush(24);
    expect(controlValue(ui, entry)).toBe(entry.latest);
    expect(nativeGet.call(localStorage, entry.key)).toBe(encode(entry.first));
    expect(guard()?.isBlocking()).toBe(true); expect(unload()).toBe(true);
    expect(ui.getByRole("button", { name: new RegExp(`Retry.*${entry.label.replace(/[()]/g, "\\$&")}`, "i") })).toBeTruthy();
    vi.restoreAllMocks();
    fireEvent.click(ui.getByRole("button", { name: new RegExp(`Retry.*${entry.label.replace(/[()]/g, "\\$&")}`, "i") }));
    await flush(24);
    expect(nativeGet.call(localStorage, entry.key)).toBe(encode(entry.latest)); expect(guard()?.isBlocking()).toBe(false);
  });
});

it("strict invalid native values never persist or become exportable drafts", async () => {
  nativeSet.call(localStorage, cases[5].key, "true");
  const ui = mount(); await flush();
  fireEvent.change(ui.getByLabelText("Quiet hours start"), { target: { value: "7:00" } });
  fireEvent.change(ui.getByLabelText("Quiet hours end"), { target: { value: "24:00" } });
  fireEvent.change(ui.getByLabelText("Sound"), { target: { value: "loud" } });
  await flush(12);
  expect(nativeGet.call(localStorage, cases[6].key)).toBe("22:00"); expect(nativeGet.call(localStorage, cases[7].key)).toBe("07:00"); expect(nativeGet.call(localStorage, cases[1].key)).toBe("subtle");
  expect(guard()?.isBlocking()).toBe(false); expect(ui.queryByRole("button", { name: "Export Notifications draft" })).toBeNull();
});

it("hidden invalid and unavailable time sources stay labelled Reload-only and repair with zero writes", async () => {
  nativeSet.call(localStorage, cases[6].key, "7:00");
  let denyEnd = true; const baseGet = Storage.prototype.getItem;
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key) { if (key === cases[7].key && denyEnd) throw new DOMException("denied", "SecurityError"); return baseGet.call(this, key); });
  const ui = mount(); await flush();
  expect(ui.queryByLabelText("Quiet hours start")).toBeNull(); expect(ui.queryByLabelText("Quiet hours end")).toBeNull();
  expect(ui.getByRole("button", { name: "Reload Quiet hours start" })).toBeTruthy(); expect(ui.getByRole("button", { name: "Reload Quiet hours end" })).toBeTruthy();
  expect(guard()?.isBlocking()).toBe(false); expect(unload()).toBe(false); expect(ui.queryByRole("button", { name: "Export Notifications draft" })).toBeNull();
  denyEnd = false; nativeSet.call(localStorage, cases[6].key, "23:59"); nativeSet.call(localStorage, cases[7].key, "00:00");
  const writes = vi.spyOn(Storage.prototype, "setItem");
  fireEvent.click(ui.getByRole("button", { name: "Reload Quiet hours start" })); fireEvent.click(ui.getByRole("button", { name: "Reload Quiet hours end" })); await flush(16);
  expect(writes).not.toHaveBeenCalled();
  fireEvent.click(ui.getByRole("switch", { name: "Enable quiet hours" })); await flush(16);
  expect((ui.getByLabelText("Quiet hours start") as HTMLInputElement).value).toBe("23:59"); expect((ui.getByLabelText("Quiet hours end") as HTMLInputElement).value).toBe("00:00");
});
