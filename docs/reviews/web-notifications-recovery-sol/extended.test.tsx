import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent } from "@testing-library/react";
import { accountLifecycleLockName } from "@repo/plugin-web-storage";
import { cases, controlValue, download, editField, flush, guard, hold, keys, mount, nativeGet, nativeSet, setup } from "./fixture";

beforeEach(setup);
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("missing and rejected Web Locks retain their exact fields and recover through current Retry", async () => {
  const ui = mount(); await flush(); const liveLocks = navigator.locks;
  vi.stubGlobal("navigator", {}); editField(ui, cases[0], false); await flush(16);
  expect(controlValue(ui, cases[0])).toBe(false); expect(nativeGet.call(localStorage, cases[0].key)).toBe("true"); expect(guard()?.isBlocking()).toBe(true);
  vi.stubGlobal("navigator", { locks: liveLocks }); fireEvent.click(ui.getByRole("button", { name: "Retry Enable notifications" })); await flush(20);
  expect(nativeGet.call(localStorage, cases[0].key)).toBe("false"); expect(guard()?.isBlocking()).toBe(false);

  const rejected = vi.spyOn(navigator.locks, "request").mockRejectedValueOnce(new Error("lock rejected"));
  editField(ui, cases[1], "chime"); await flush(16);
  expect(controlValue(ui, cases[1])).toBe("chime"); expect(nativeGet.call(localStorage, cases[1].key)).toBe("subtle"); expect(guard()?.isBlocking()).toBe(true);
  rejected.mockRestore(); fireEvent.click(ui.getByRole("button", { name: "Retry Sound" })); await flush(20);
  expect(nativeGet.call(localStorage, cases[1].key)).toBe("chime"); expect(guard()?.isBlocking()).toBe(false);
});

it("mixed boolean, select and time failures settle independently in both directions", async () => {
  nativeSet.call(localStorage, cases[5].key, "true"); const ui = mount(); await flush(); const base = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { if (key === cases[0].key) throw new Error("boolean quota"); base.call(this, key, value); });
  editField(ui, cases[0], false); editField(ui, cases[1], "chime"); editField(ui, cases[6], "23:15"); await flush(24);
  expect(nativeGet.call(localStorage, cases[0].key)).toBe("true"); expect(nativeGet.call(localStorage, cases[1].key)).toBe("chime"); expect(nativeGet.call(localStorage, cases[6].key)).toBe("23:15");
  let file = download(); guard()?.exportDraft(); expect(await file.read()).toEqual({ version: 1, kind: "notifications-draft", values: { device: { enabled: false } } });
  vi.restoreAllMocks(); fireEvent.click(ui.getByRole("button", { name: "Retry Enable notifications" })); await flush(20); expect(guard()?.isBlocking()).toBe(false);

  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { if (key === cases[1].key || key === cases[6].key) throw new Error("string quota"); base.call(this, key, value); });
  editField(ui, cases[0], true); editField(ui, cases[1], "bell"); editField(ui, cases[6], "21:45"); await flush(24);
  expect(nativeGet.call(localStorage, cases[0].key)).toBe("true"); expect(nativeGet.call(localStorage, cases[1].key)).toBe("chime"); expect(nativeGet.call(localStorage, cases[6].key)).toBe("23:15");
  file = download(); guard()?.exportDraft(); expect(await file.read()).toEqual({ version: 1, kind: "notifications-draft", values: { device: { done_sound: "bell", quiet_start: "21:45" } } });
  vi.restoreAllMocks(); fireEvent.click(ui.getByRole("button", { name: "Retry Sound" })); fireEvent.click(ui.getByRole("button", { name: "Retry Quiet hours start" })); await flush(24);
  expect(nativeGet.call(localStorage, cases[1].key)).toBe("bell"); expect(nativeGet.call(localStorage, cases[6].key)).toBe("21:45"); expect(guard()?.isBlocking()).toBe(false);
});

it("external restoration after uncertain commit is preserved until distinct new input supplies authority", async () => {
  const ui = mount(); await flush(); let armed = false, writes = 0;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { nativeSet.call(this, key, value); if (key === cases[3].key) { armed = true; writes += 1; } });
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key) { if (key === cases[3].key && armed) { armed = false; throw new Error("readback"); } return nativeGet.call(this, key); });
  editField(ui, cases[3], false); await flush(20); expect(writes).toBe(1); expect(guard()?.isBlocking()).toBe(true);
  vi.restoreAllMocks(); nativeSet.call(localStorage, cases[3].key, "true"); const retryWrites = vi.spyOn(Storage.prototype, "setItem");
  fireEvent.click(ui.getByRole("button", { name: "Retry Pomodoro complete" })); await flush(20);
  expect(nativeGet.call(localStorage, cases[3].key)).toBe("true"); expect(controlValue(ui, cases[3])).toBe(false); expect(retryWrites).not.toHaveBeenCalled(); expect(guard()?.isBlocking()).toBe(true);
  editField(ui, cases[3], true); await flush(20); expect(nativeGet.call(localStorage, cases[3].key)).toBe("true"); expect(guard()?.isBlocking()).toBe(false);
});

it("an unrelated held account lifecycle lock never blocks a device preference write", async () => {
  const ui = mount(); await flush(); let release!: () => void, entered!: () => void;
  const ready = new Promise<void>(resolve => { entered = resolve; }), gate = new Promise<void>(resolve => { release = resolve; });
  const held = navigator.locks.request(accountLifecycleLockName("notif-sol-A"), { mode: "exclusive" }, () => { entered(); return gate; }); await ready;
  try {
    editField(ui, cases[4], true); await flush(20);
    expect(nativeGet.call(localStorage, cases[4].key)).toBe("true"); expect(controlValue(ui, cases[4])).toBe(true);
  } finally { await act(async () => { release(); await held; }); }
});

it("all eight absent bindings mount at registry defaults without seeding storage", async () => {
  localStorage.clear(); const writes = vi.spyOn(Storage.prototype, "setItem"); const ui = mount(); await flush(16);
  expect(ui.getAllByRole("switch").map(control => control.getAttribute("aria-checked"))).toEqual(["true", "true", "true", "false", "false"]);
  expect((ui.getByLabelText("Sound") as HTMLSelectElement).value).toBe("subtle");
  expect(keys.map(key => nativeGet.call(localStorage, key))).toEqual(Array(8).fill(null)); expect(writes).not.toHaveBeenCalled();
  fireEvent.click(ui.getByRole("switch", { name: "Enable quiet hours" })); await flush(20);
  expect((ui.getByLabelText("Quiet hours start") as HTMLInputElement).value).toBe("22:00"); expect((ui.getByLabelText("Quiet hours end") as HTMLInputElement).value).toBe("07:00");
  expect(nativeGet.call(localStorage, cases[5].key)).toBe("true"); expect(keys.filter(key => key !== cases[5].key).map(key => nativeGet.call(localStorage, key))).toEqual(Array(7).fill(null));
});

it("boolean, sound and time invalid or unavailable sources stay defaulted and Reload-only", async () => {
  nativeSet.call(localStorage, cases[0].key, "yes"); nativeSet.call(localStorage, cases[1].key, "loud"); nativeSet.call(localStorage, cases[5].key, "true"); nativeSet.call(localStorage, cases[6].key, "25:00");
  let writes = vi.spyOn(Storage.prototype, "setItem"); let ui = mount(); await flush(16);
  expect(controlValue(ui, cases[0])).toBe(true); expect(controlValue(ui, cases[1])).toBe("subtle"); expect((ui.getByLabelText("Quiet hours start") as HTMLInputElement).value).toBe("22:00");
  for (const label of ["Enable notifications", "Sound", "Quiet hours start"]) expect(ui.getByRole("button", { name: `Reload ${label}` })).toBeTruthy();
  expect(ui.queryByRole("button", { name: "Export Notifications draft" })).toBeNull(); expect(guard()?.isBlocking()).toBe(false); expect(writes).not.toHaveBeenCalled();

  ui.unmount(); vi.restoreAllMocks(); localStorage.clear(); for (const entry of cases) nativeSet.call(localStorage, entry.key, String(entry.initial)); nativeSet.call(localStorage, cases[5].key, "true");
  const unavailable = new Set([cases[0].key, cases[1].key, cases[6].key]);
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key) { if (unavailable.has(String(key))) throw new Error("read unavailable"); return nativeGet.call(this, key); });
  writes = vi.spyOn(Storage.prototype, "setItem"); ui = mount(); await flush(16);
  expect(controlValue(ui, cases[0])).toBe(true); expect(controlValue(ui, cases[1])).toBe("subtle"); expect((ui.getByLabelText("Quiet hours start") as HTMLInputElement).value).toBe("22:00");
  for (const label of ["Enable notifications", "Sound", "Quiet hours start"]) expect(ui.getByRole("button", { name: `Reload ${label}` })).toBeTruthy();
  expect(guard()?.isBlocking()).toBe(false); expect(writes).not.toHaveBeenCalled();
});

it("a failed quiet toggle leaves successful time writes settled independently", async () => {
  nativeSet.call(localStorage, cases[5].key, "true"); const ui = mount(); await flush(); const base = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { if (key === cases[5].key) throw new Error("quiet quota"); base.call(this, key, value); });
  editField(ui, cases[6], "23:15"); editField(ui, cases[7], "06:30"); editField(ui, cases[5], false); await flush(24);
  expect(nativeGet.call(localStorage, cases[5].key)).toBe("true"); expect(nativeGet.call(localStorage, cases[6].key)).toBe("23:15"); expect(nativeGet.call(localStorage, cases[7].key)).toBe("06:30");
  expect(ui.queryByLabelText("Quiet hours start")).toBeNull(); const file = download(); guard()?.exportDraft(); expect(await file.read()).toEqual({ version: 1, kind: "notifications-draft", values: { device: { quiet: false } } });
  vi.restoreAllMocks(); fireEvent.click(ui.getByRole("button", { name: "Retry Enable quiet hours" })); await flush(20); expect(nativeGet.call(localStorage, cases[5].key)).toBe("false"); expect(guard()?.isBlocking()).toBe(false);
});

it("a successful global disable does not clear failed subordinate choices", async () => {
  const ui = mount(); await flush(); const base = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { if (key === cases[1].key || key === cases[2].key) throw new Error("subordinate quota"); base.call(this, key, value); });
  editField(ui, cases[0], false); editField(ui, cases[1], "chime"); editField(ui, cases[2], false); await flush(24);
  expect(nativeGet.call(localStorage, cases[0].key)).toBe("false"); expect(nativeGet.call(localStorage, cases[1].key)).toBe("subtle"); expect(nativeGet.call(localStorage, cases[2].key)).toBe("true");
  expect(controlValue(ui, cases[1])).toBe("chime"); expect(controlValue(ui, cases[2])).toBe(false); const file = download(); guard()?.exportDraft();
  expect(await file.read()).toEqual({ version: 1, kind: "notifications-draft", values: { device: { done_sound: "chime", push_task: false } } });
  vi.restoreAllMocks(); fireEvent.click(ui.getByRole("button", { name: "Retry Sound" })); fireEvent.click(ui.getByRole("button", { name: "Retry Task due" })); await flush(24); expect(guard()?.isBlocking()).toBe(false);
});

it("a sound conflict and an unrelated quota failure remain independently recoverable", async () => {
  const ui = mount(); await flush(); const release = await hold(cases[1].key); const base = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { if (key === cases[0].key) throw new Error("enabled quota"); base.call(this, key, value); });
  editField(ui, cases[1], "chime"); editField(ui, cases[0], false); nativeSet.call(localStorage, cases[1].key, "bell"); await release(); await flush(24);
  expect(nativeGet.call(localStorage, cases[1].key)).toBe("bell"); expect(nativeGet.call(localStorage, cases[0].key)).toBe("true"); expect(controlValue(ui, cases[1])).toBe("chime"); expect(controlValue(ui, cases[0])).toBe(false);
  let file = download(); guard()?.exportDraft(); expect(await file.read()).toEqual({ version: 1, kind: "notifications-draft", values: { device: { enabled: false, done_sound: "chime" } } });
  vi.restoreAllMocks(); fireEvent.click(ui.getByRole("button", { name: "Retry Sound" })); await flush(20); expect(nativeGet.call(localStorage, cases[1].key)).toBe("bell"); expect(guard()?.isBlocking()).toBe(true);
  fireEvent.click(ui.getByRole("button", { name: "Retry Enable notifications" })); await flush(20); expect(nativeGet.call(localStorage, cases[0].key)).toBe("false"); expect(guard()?.isBlocking()).toBe(true);
  file = download(); guard()?.exportDraft(); expect(await file.read()).toEqual({ version: 1, kind: "notifications-draft", values: { device: { done_sound: "chime" } } });
});

it("Discard all cannot let an older completion erase a same-field new draft", async () => {
  const ui = mount(); await flush(); const release = await hold(cases[1].key); const base = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { if (key === cases[1].key && value === "bell") throw new Error("latest quota"); base.call(this, key, value); });
  editField(ui, cases[1], "chime"); guard()?.discardDraft(); editField(ui, cases[1], "bell"); await flush(12); expect(controlValue(ui, cases[1])).toBe("bell"); expect(guard()?.isBlocking()).toBe(true);
  await release(); await flush(28); expect(nativeGet.call(localStorage, cases[1].key)).toBe("subtle"); expect(controlValue(ui, cases[1])).toBe("bell"); expect(guard()?.isBlocking()).toBe(true);
  const file = download(); guard()?.exportDraft(); expect(await file.read()).toEqual({ version: 1, kind: "notifications-draft", values: { device: { done_sound: "bell" } } });
});
