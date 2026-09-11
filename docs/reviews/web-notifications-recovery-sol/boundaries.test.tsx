import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent } from "@testing-library/react";
import { cases, download, editField, flush, guard, hold, keys, mount, nativeGet, nativeSet, setup, unload } from "./fixture";

beforeEach(setup);
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("malformed time feedback remains field-specific until that field receives a valid edit", async () => {
  nativeSet.call(localStorage, cases[5].key, "true");
  const ui = mount(); await flush();
  fireEvent.change(ui.getByLabelText("Quiet hours start"), { target: { value: "7:00" } });
  fireEvent.change(ui.getByLabelText("Quiet hours end"), { target: { value: "24:00" } });
  await flush(12);
  expect(ui.getByText("Quiet hours start has an invalid format.")).toBeTruthy(); expect(ui.getByText("Quiet hours end has an invalid format.")).toBeTruthy();
  editField(ui, cases[1], "chime"); await flush(16);
  expect(ui.getByText("Quiet hours start has an invalid format.")).toBeTruthy(); expect(ui.getByText("Quiet hours end has an invalid format.")).toBeTruthy();
  expect(ui.queryByText("Notification settings saved.")).toBeNull(); expect(guard()?.isBlocking()).toBe(false); expect(unload()).toBe(false);
  editField(ui, cases[6], "23:15"); await flush(16);
  expect(ui.queryByText("Quiet hours start has an invalid format.")).toBeNull(); expect(ui.getByText("Quiet hours end has an invalid format.")).toBeTruthy();
});

it("targeted hidden-time discard rereads only that field with zero writes and preserves a failed sound sibling", async () => {
  nativeSet.call(localStorage, cases[5].key, "true");
  const ui = mount(); await flush(); const base = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { if (key === cases[1].key || key === cases[6].key) throw new Error("quota"); base.call(this, key, value); });
  editField(ui, cases[1], "chime"); editField(ui, cases[6], "23:15"); editField(ui, cases[5], false); await flush(20);
  vi.restoreAllMocks(); const gets = vi.spyOn(Storage.prototype, "getItem"), sets = vi.spyOn(Storage.prototype, "setItem"), removes = vi.spyOn(Storage.prototype, "removeItem");
  fireEvent.click(ui.getByRole("button", { name: "Discard Quiet hours start" })); await flush(16);
  expect(gets.mock.calls.filter(([key]) => keys.includes(String(key))).map(([key]) => key)).toEqual([cases[6].key]); expect(sets).not.toHaveBeenCalled(); expect(removes).not.toHaveBeenCalled();
  expect(guard()?.isBlocking()).toBe(true); const file = download(); guard()?.exportDraft(); expect(await file.read()).toEqual({ version: 1, kind: "notifications-draft", values: { device: { done_sound: "chime" } } });
  vi.restoreAllMocks(); fireEvent.click(ui.getByRole("button", { name: "Retry Sound" })); await flush(20); expect(nativeGet.call(localStorage, cases[1].key)).toBe("chime"); expect(guard()?.isBlocking()).toBe(false);
});

it("an external raw replacement under the real sound-key lock remains preserved as conflict", async () => {
  const ui = mount(); await flush(); const release = await hold(cases[1].key);
  editField(ui, cases[1], "chime"); nativeSet.call(localStorage, cases[1].key, "bell"); await release(); await flush(20);
  expect(nativeGet.call(localStorage, cases[1].key)).toBe("bell"); expect((ui.getByLabelText("Sound") as HTMLSelectElement).value).toBe("chime"); expect(guard()?.isBlocking()).toBe(true); expect(unload()).toBe(true);
  fireEvent.click(ui.getByRole("button", { name: "Retry Sound" })); await flush(20); expect(nativeGet.call(localStorage, cases[1].key)).toBe("bell"); expect(guard()?.isBlocking()).toBe(true);
});

it("duplicate Retry while a current edit is pending performs only the one authorized write", async () => {
  const ui = mount(); await flush(); const release = await hold(cases[0].key); let writes = 0; const base = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { if (key === cases[0].key) writes += 1; base.call(this, key, value); });
  editField(ui, cases[0], false); const retry = ui.getByRole("button", { name: "Retry Enable notifications" }); fireEvent.click(retry); fireEvent.click(retry); await flush(10); expect(writes).toBe(0); expect(guard()?.isBlocking()).toBe(true);
  await release(); await flush(20); expect(writes).toBe(1); expect(nativeGet.call(localStorage, cases[0].key)).toBe("false"); expect(guard()?.isBlocking()).toBe(false);
});
