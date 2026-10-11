import { accountScope } from "@repo/plugin-web-storage";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { TimeTrackerModule } from "../TimeTrackerModule.js";
import { createTimeTrackerEntry, readTimeTrackerEntries, writeTimeTrackerEntries } from "../internal/storage.js";
const at = (value: string) => new Date(value).getTime();
function seed() {
  vi.setSystemTime(at("2026-06-01T12:00:00"));
  const source = createTimeTrackerEntry("cat_work", null, at("2026-05-31T23:50:00"), at("2026-06-01T00:10:00"), { en: "Cross-boundary source", zh: "跨日原记录" });
  const future = createTimeTrackerEntry("cat_work", null, at("2026-06-02T01:00:00"), at("2026-06-02T02:00:00"), { en: "Future source", zh: "未来" });
  writeTimeTrackerEntries([source, future]);
  return source;
}
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
it.each([
  "today-total", "week-total", "month-total", "avg-day", "donut-today", "donut-range", "cat-ranking", "goal-progress", "sub-split", "by-weekday", "trend-7d", "by-hour", "trend-30d", "heatmap", "range-summary", "category-mosaic", "focus-rhythm",
])("%s uses intersecting contributions in text/tooltips", type => {
  seed();
  localStorage.setItem(accountScope.physicalKey("xai_tt_insights_v1"), JSON.stringify([{ iid: "test", type, catId: "cat_work" }]));
  render(<TimeTrackerModule lang="en" />);
  fireEvent.click(screen.getAllByText("Insights")[0]!);
  const card = document.querySelector(".tt-ins-card")!;
  expect(card).toBeTruthy();
  const evidence = card.textContent + Array.from(card.querySelectorAll("[data-tip]")).map(node => node.getAttribute("data-tip")).join("\n");
  expect(evidence).toContain("10m");
  expect(evidence).not.toContain("1h 00m");
});
it("days-tracked counts the intersecting day; current and recent retain their distinct lifecycle meaning", () => {
  seed();
  localStorage.setItem(accountScope.physicalKey("xai_tt_insights_v1"), JSON.stringify(["days-tracked", "current", "recent-sessions"].map(type => ({ iid: type, type, catId: null }))));
  render(<TimeTrackerModule lang="en" />);
  fireEvent.click(screen.getAllByText("Insights")[0]!);
  const cards = document.querySelectorAll(".tt-ins-card");
  expect(cards[0]!.querySelector(".tt-ins-num strong")!.textContent).toBe("1");
  expect(cards[1]!.querySelector(".tt-ins-num strong")!.textContent).toBe("—");
  expect(cards[2]!.textContent).toContain("20m");
  expect(cards[2]!.textContent).not.toContain("Future source");
});
it("range delete explicitly deletes the original crossing record and preserves future source", () => {
  const source = seed();
  render(<TimeTrackerModule lang="en" />);
  fireEvent.click(screen.getAllByText("Insights")[0]!);
  fireEvent.click(screen.getByText("Delete range"));
  const dialog = screen.getByRole("dialog");
  expect(dialog.textContent).toContain("Time outside this range in those records will also be deleted.");
  expect(readTimeTrackerEntries().find(entry => entry.id === source.id)?.segments).toEqual(source.segments);
  fireEvent.click(within(dialog).getByText("Delete"));
  expect(readTimeTrackerEntries().map(entry => entry.note.en)).toEqual(["Future source"]);
});

it("CSV records exact contribution and report/timezone metadata without rewriting raw source times", () => {
  const source = seed();
  let csv = "";
  const NativeBlob = Blob;
  vi.stubGlobal("Blob", class extends NativeBlob {
    constructor(parts: BlobPart[] = [], options?: BlobPropertyBag) {
      super(parts, options);
      csv = parts.map(String).join("");
    }
  });
  const NativeURL = URL;
  vi.stubGlobal("URL", class extends NativeURL {
    static createObjectURL() { return "blob:test"; }
    static revokeObjectURL() { /* browser download transport only */ }
  });
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
  render(<TimeTrackerModule lang="en" />);
  fireEvent.click(screen.getAllByText("Insights")[0]!);
  fireEvent.click(screen.getByText("Export CSV"));
  expect(csv).toContain("Range end exclusive");
  expect(csv).toContain("Contribution ms");
  expect(csv).toContain(source.id);
  expect(csv).toContain(new Date(source.segments[0]!.start).toISOString());
  expect(csv).toContain(new Date(source.segments[0]!.end!).toISOString());
  expect(csv).toContain(Intl.DateTimeFormat().resolvedOptions().timeZone);
  expect(csv).toContain("600000");
  expect(csv).not.toContain("Future source");
  expect(readTimeTrackerEntries().find(entry => entry.id === source.id)?.segments).toEqual(source.segments);
});
it.each([["Week", "10m"], ["Month", "10m"], ["Year", "20m"], ["All", "20m"]])("%s report excludes future records and preserves intersecting totals", (range, expected) => {
  seed();
  render(<TimeTrackerModule lang="en" />);
  fireEvent.click(screen.getAllByText("Insights")[0]!);
  fireEvent.click(screen.getByText("Filters"));
  fireEvent.click(within(document.querySelector(".tt-report-filters") as HTMLElement).getByText(range));
  expect(document.querySelector(".tt-report-copy em")?.textContent).toBe(`${expected} · 1 entry`);
});
it("custom reversed dates use civil inclusive dates and clip the crossing source", () => {
  seed();
  render(<TimeTrackerModule lang="en" />);
  fireEvent.click(screen.getAllByText("Insights")[0]!);
  fireEvent.click(screen.getByText("Filters"));
  fireEvent.click(within(document.querySelector(".tt-report-filters") as HTMLElement).getByText("Custom"));
  fireEvent.change(screen.getByLabelText("From"), { target: { value: "2026-06-02" } });
  fireEvent.change(screen.getByLabelText("To"), { target: { value: "2026-06-01" } });
  expect(document.querySelector(".tt-report-copy em")?.textContent).toBe("10m · 1 entry");
});
it("day record row shows its daily contribution and retains full-session edit times", () => {
  const source = seed();
  render(<TimeTrackerModule lang="en" />);
  expect(document.querySelector(".tt-record-list b[title]")?.textContent).toBe("10m");
  expect(document.querySelector(".tt-record-list b[title]")?.getAttribute("title")).toContain("Complete record: 20m");
  expect(screen.getByLabelText("Adjust time").textContent).toContain("23:50:00 - 00:10:00");
  expect(readTimeTrackerEntries().find(entry => entry.id === source.id)?.segments).toEqual(source.segments);
});
