import { afterEach, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { PomodoroModule } from "../PomodoroModule.js";

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
