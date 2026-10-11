import { afterEach, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { accountScope } from "@repo/plugin-web-storage";
import { PomodoroModule } from "../PomodoroModule.js";
import type { PomodoroDepartureGuard } from "../types.js";

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
it("reports failed preferences and exports/retries the latest choice", async () => {
  render(<PomodoroModule lang="en" />);
  const before = localStorage.getItem("xai_pref_pomodoro_theme");
  const original = Storage.prototype.setItem;
  const fault = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
    if (key === "xai_pref_pomodoro_theme") throw new DOMException("quota", "QuotaExceededError");
    original.call(this, key, value);
  });
  await act(async () => { fireEvent.click(screen.getByTestId("theme-blue")); });
  expect(screen.getByRole("alert").textContent).toContain("preferences were not saved");
  expect(localStorage.getItem("xai_pref_pomodoro_theme")).toBe(before);
  await act(async () => { fireEvent.click(screen.getByTestId("theme-violet")); });
  let exported = "";
  const OriginalBlob = Blob;
  vi.stubGlobal("Blob", class extends OriginalBlob {
    constructor(parts: BlobPart[], options?: BlobPropertyBag) { super(parts, options); exported = parts.map(String).join(""); }
  });
  vi.stubGlobal("URL", { createObjectURL: () => "blob:prefs", revokeObjectURL: vi.fn() });
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  fireEvent.click(screen.getByRole("button", { name: "Export current preferences" }));
  expect(JSON.parse(exported).values.theme).toBe("violet");
  fault.mockRestore();
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Retry preferences" })); });
  expect(localStorage.getItem("xai_pref_pomodoro_theme")).toBe('"violet"');
  expect(screen.queryByRole("alert")).toBeNull();
});

it("old epoch capability refuses synchronous export and discard while the device draft survives", async () => {
  const guards: PomodoroDepartureGuard[] = [];
  render(<PomodoroModule lang="en" registerDepartureGuard={(guard) => { guards.push(guard); return () => {}; }} />);
  const original = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
    if (key === "xai_pref_pomodoro_theme") throw new DOMException("quota", "QuotaExceededError");
    original.call(this, key, value);
  });
  await act(async () => { fireEvent.click(screen.getByTestId("theme-blue")); });
  const oldGuard = guards.at(-1)!;
  const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  vi.stubGlobal("URL", {
    createObjectURL: () => { accountScope.lock("next-account"); return "blob:stale"; },
    revokeObjectURL: vi.fn(),
  });
  await act(async () => { oldGuard.exportDraft(); });
  expect(click).not.toHaveBeenCalled();
  await act(async () => { oldGuard.discardDraft(); });
  expect(screen.getByTestId("theme-blue").getAttribute("aria-pressed")).toBe("true");
  expect(screen.getByRole("alert").textContent).toContain("preferences were not saved");
});

it("registers an actual-draft guard and exports all six memory values under storage denial", async () => {
  let guard: PomodoroDepartureGuard | null = null;
  render(<PomodoroModule lang="en" registerDepartureGuard={(next) => { guard = next; return () => {}; }} />);
  const originalGet = Storage.prototype.getItem;
  const originalSet = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
    if (key === "xai_pref_pomodoro_theme") throw new DOMException("quota", "QuotaExceededError");
    originalSet.call(this, key, value);
  });
  await act(async () => { fireEvent.click(screen.getByTestId("theme-blue")); });
  expect(guard).not.toBeNull();
  expect((guard as PomodoroDepartureGuard | null)?.isBlocking()).toBe(true);
  const unload = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(unload);
  expect(unload.defaultPrevented).toBe(true);

  vi.restoreAllMocks();
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("denied"); });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("denied"); });
  let exported = "";
  const OriginalBlob = Blob;
  vi.stubGlobal("Blob", class extends OriginalBlob {
    constructor(parts: BlobPart[], options?: BlobPropertyBag) { super(parts, options); exported = parts.map(String).join(""); }
  });
  const revoke = vi.fn();
  vi.stubGlobal("URL", { createObjectURL: () => "blob:prefs", revokeObjectURL: revoke });
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  await act(async () => { (guard as PomodoroDepartureGuard | null)?.exportDraft(); });
  const payload = JSON.parse(exported);
  expect(payload).toEqual({
    version: 1,
    kind: "pomodoro-preference-draft",
    values: { preset: "focus-25", customMinutes: 45, displayStyle: "apple", theme: "blue", sound: "soft-chime", muted: false },
  });
  expect(revoke).toHaveBeenCalledWith("blob:prefs");
  expect(originalGet.call(localStorage, "xai_pomodoro_active")).toBeNull();
});
