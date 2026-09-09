import { afterEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { accountScope, setPref } from "@repo/plugin-web-storage";
import { CalendarModule } from "../CalendarModule.js";

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

function seedCalendarEvents(events: Record<string, unknown>) {
  localStorage.setItem(accountScope.physicalKey("xai_calendar_events"), JSON.stringify(events));
}

function failWrites() {
  const original = Storage.prototype.setItem;
  const key = accountScope.physicalKey("xai_calendar_events");
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, name, value) {
    if (name === key) throw new DOMException("quota", "QuotaExceededError");
    original.call(this, name, value);
  });
  return key;
}
it("keeps a failed new event and its latest draft available for retry", async () => {
  render(<CalendarModule lang="en" />);
  fireEvent.click(screen.getByLabelText("Add event"));
  const input = document.getElementById("event-composer-title-input") as HTMLInputElement;
  fireEvent.change(input, { target: { value: "Unsaved calendar draft" } });
  const key = failWrites();
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
  await waitFor(() => {
    expect((document.querySelector("dialog.event-composer") as HTMLDialogElement).open).toBe(true);
    expect(input.value).toBe("Unsaved calendar draft");
    expect(screen.getByRole("alert").textContent).toMatch(/not saved/i);
    expect(localStorage.getItem(key)).toBeNull();
  });
  fireEvent.change(input, { target: { value: "Latest calendar draft" } });
  vi.restoreAllMocks();
  fireEvent.click(screen.getByRole("button", { name: /retry save/i }));
  await waitFor(() => expect(localStorage.getItem(key)).not.toBeNull());
  const events = Object.values(JSON.parse(localStorage.getItem(key)!).data) as { title: string }[];
  expect(events.map(event => event.title)).toEqual(["Latest calendar draft"]);
});
it("keeps the editor and record when deletion fails", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 4, 22, 10));
  setPref("xai_calendar_view", "week");
  seedCalendarEvents({ event: { id: "event", title: "Keep this record", startISO: "2026-05-22T09:00", endISO: "2026-05-22T10:00", colorPreset: "rose", recurrence: null, createdAt: "2026-05-22T00:00:00Z", updatedAt: "2026-05-22T00:00:00Z" } });
  render(<CalendarModule lang="en" />);
  fireEvent.click(screen.getByTitle("Keep this record"));
  const key = failWrites();
  const before = localStorage.getItem(key);
  fireEvent.click(screen.getByRole("button", { name: "Delete: Keep this record" }));
  await vi.advanceTimersByTimeAsync(0);
  expect((document.querySelector("dialog.event-composer") as HTMLDialogElement).open).toBe(true);
  expect(localStorage.getItem(key)).toBe(before);
  expect(screen.getByRole("alert").textContent).toMatch(/not saved/i);
});
it("exports the latest unsaved form and refuses old-account retry and export", async () => {
  vi.useFakeTimers();
  render(<CalendarModule lang="en" />);
  fireEvent.click(screen.getByLabelText("Add event"));
  const input = document.getElementById("event-composer-title-input") as HTMLInputElement;
  fireEvent.change(input, { target: { value: "First draft" } });
  const key = failWrites();
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
  await vi.advanceTimersByTimeAsync(0);
  expect(screen.getByRole("alert").textContent).toMatch(/not saved/i);
  fireEvent.change(input, { target: { value: "Latest export" } });
  let downloaded = "";
  const OriginalBlob = Blob;
  vi.stubGlobal("Blob", class extends OriginalBlob {
    constructor(parts: BlobPart[], options?: BlobPropertyBag) { super(parts, options); downloaded = parts.map(String).join(""); }
  });
  const createObjectURL = vi.fn(() => "blob:calendar");
  const revokeObjectURL = vi.fn();
  vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  fireEvent.click(screen.getByRole("button", { name: "Export current draft" }));
  expect(JSON.parse(downloaded).form.title).toBe("Latest export");
  accountScope.activate(accountScope.lock("B"), "new");
  fireEvent.click(screen.getByRole("button", { name: /retry save/i }));
  fireEvent.click(screen.getByRole("button", { name: "Export current draft" }));
  expect(createObjectURL).toHaveBeenCalledTimes(1);
  // Complete the owned download cleanup before restoring the URL test double.
  vi.advanceTimersByTime(1000);
  expect(revokeObjectURL).toHaveBeenCalledWith("blob:calendar");
  expect(localStorage.getItem(key)).toBeNull();
  expect(localStorage.getItem(accountScope.physicalKey("xai_calendar_events"))).toBeNull();
});
it("does not overwrite newer raw events when retrying a failed draft", async () => {
  render(<CalendarModule lang="en" />);
  fireEvent.click(screen.getByLabelText("Add event"));
  fireEvent.change(document.getElementById("event-composer-title-input")!, { target: { value: "Old draft" } });
  const key = failWrites();
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
  await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/not saved/i));
  vi.restoreAllMocks();
  const newer = '{"external":{"id":"external","title":"Newer data"}}';
  localStorage.setItem(key, newer);
  fireEvent.click(screen.getByRole("button", { name: /retry save/i }));
  await waitFor(() => {
    expect(localStorage.getItem(key)).toBe(newer);
    expect((document.querySelector("dialog.event-composer") as HTMLDialogElement).open).toBe(true);
  });
});
