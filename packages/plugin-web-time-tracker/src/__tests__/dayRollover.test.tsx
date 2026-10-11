import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { TimeTrackerModule } from "../TimeTrackerModule.js";
import { createTimeTrackerEntry, writeTimeTrackerEntries } from "../internal/storage.js";

afterEach(cleanup);
function mount() {
  vi.setSystemTime(new Date(2026, 5, 1, 23, 59, 59));
  writeTimeTrackerEntries([createTimeTrackerEntry("cat_work", null,
    new Date(2026, 5, 1, 12).getTime(), new Date(2026, 5, 1, 13).getTime(),
    { en: "Yesterday work", zh: "Yesterday work" })]);
  render(<TimeTrackerModule lang="en" />);
}
function heading() { return document.querySelector(".tt-day-head")!.textContent; }
it("idle midnight follows today and removes yesterday's completed contribution", () => {
  mount();
  expect(heading()).toContain("1h 00m");
  act(() => { vi.advanceTimersByTime(1500); });
  expect(heading()).toContain("Today");
  expect(heading()).not.toContain("1h 00m");
  expect(screen.getByRole("button", { name: "Next day" })).toBeDisabled();
});
it.each(["focus", "pageshow"])("resamples today after %s without timer delivery", event => {
  mount();
  act(() => {
    vi.setSystemTime(new Date(2026, 5, 2, 9));
    window.dispatchEvent(new Event(event));
  });
  expect(heading()).toContain("Today");
  expect(heading()).not.toContain("1h 00m");
});
it("keeps an explicitly selected historical day across midnight", () => {
  mount();
  fireEvent.click(screen.getByRole("button", { name: "Previous day" }));
  const prior = heading();
  act(() => { vi.advanceTimersByTime(1500); });
  expect(heading()).toBe(prior);
});
