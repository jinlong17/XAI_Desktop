import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent } from "@testing-library/react";
import { cases, download, editField, flush, guard, hold, mount, nativeGet, nativeSet, setup, unload } from "./fixture";

beforeEach(setup);
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("quiet=false keeps failed hidden time drafts exportable and independently recoverable when re-enabled", async () => {
  nativeSet.call(localStorage, cases[5].key, "true");
  const ui = mount(); await flush();
  const startRelease = await hold(cases[6].key), endRelease = await hold(cases[7].key);
  const base = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { if (key === cases[6].key || key === cases[7].key) throw new Error("quota"); base.call(this, key, value); });
  editField(ui, cases[6], "23:15"); editField(ui, cases[7], "06:30"); editField(ui, cases[5], false);
  await startRelease(); await endRelease(); await flush(24);
  expect(ui.queryByLabelText("Quiet hours start")).toBeNull(); expect(ui.queryByLabelText("Quiet hours end")).toBeNull();
  expect(guard()?.isBlocking()).toBe(true); expect(unload()).toBe(true);
  const file = download(); guard()?.exportDraft(); expect(await file.read()).toEqual({ version: 1, kind: "notifications-draft", values: { device: { quiet_start: "23:15", quiet_end: "06:30" } } });
  vi.restoreAllMocks();
  fireEvent.click(ui.getByRole("button", { name: "Retry Quiet hours start" })); fireEvent.click(ui.getByRole("button", { name: "Discard Quiet hours end" })); await flush(24);
  expect(nativeGet.call(localStorage, cases[6].key)).toBe("23:15"); expect(nativeGet.call(localStorage, cases[7].key)).toBe("07:00"); expect(guard()?.isBlocking()).toBe(false);
  editField(ui, cases[5], true); await flush(16);
  expect((ui.getByLabelText("Quiet hours start") as HTMLInputElement).value).toBe("23:15"); expect((ui.getByLabelText("Quiet hours end") as HTMLInputElement).value).toBe("07:00");
});

it("all eight held drafts export exact device-only memory including hidden times", async () => {
  nativeSet.call(localStorage, cases[5].key, "true");
  const ui = mount(); await flush();
  const releases = [] as Array<() => Promise<void>>;
  for (const entry of cases) releases.push(await hold(entry.key));
  try {
    editField(ui, cases[0], false); editField(ui, cases[1], "chime"); editField(ui, cases[2], false); editField(ui, cases[3], false); editField(ui, cases[4], true);
    editField(ui, cases[6], "23:15"); editField(ui, cases[7], "06:30"); editField(ui, cases[5], false);
    await flush(12); expect(ui.queryByLabelText("Quiet hours start")).toBeNull(); expect(guard()?.isBlocking()).toBe(true);
    const file = download(); guard()?.exportDraft();
    expect(await file.read()).toEqual({ version: 1, kind: "notifications-draft", values: { device: { enabled: false, done_sound: "chime", push_task: false, push_pomo: false, push_habit: true, quiet: false, quiet_start: "23:15", quiet_end: "06:30" } } });
  } finally { for (const release of releases) await release(); }
});

it("uncertain readback and a temporarily denied Retry retain one-write authority until verification", async () => {
  const ui = mount(); await flush(); let readback = false, denyRetry = false, writes = 0;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) { nativeSet.call(this, key, value); if (key === cases[2].key) { writes += 1; readback = true; } });
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key) { if (key === cases[2].key && readback) { readback = false; throw new Error("readback"); } if (key === cases[2].key && denyRetry) { denyRetry = false; throw new Error("retry denied"); } return nativeGet.call(this, key); });
  editField(ui, cases[2], false); await flush(20); expect(nativeGet.call(localStorage, cases[2].key)).toBe("false"); expect(writes).toBe(1); expect(guard()?.isBlocking()).toBe(true);
  denyRetry = true; const retry = () => fireEvent.click(ui.getByRole("button", { name: "Retry Task due" }));
  retry(); await flush(20); expect(writes).toBe(1); expect(guard()?.isBlocking()).toBe(true);
  retry(); await flush(20); expect(writes).toBe(1); expect(guard()?.isBlocking()).toBe(false);
});
