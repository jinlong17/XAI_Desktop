import { describe, it, expect, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";

import { WorldClocks } from "../widgets/WorldClocks.js";

const MAY_22_2026 = new Date(2026, 4, 22, 10, 30, 0);

beforeEach(() => {
  try {
    localStorage.clear();
  } catch {
    /* ignore */
  }
});

describe("WorldClocks", () => {
  it("AC-WORLDCLOCKS-1: default shows 4 zones in list view", () => {
    const { container } = render(<WorldClocks lang="en" now={MAY_22_2026} />);
    const rows = container.querySelectorAll(".tz-row-list");
    expect(rows).toHaveLength(4);
    const ids = Array.from(rows).map((r) => r.getAttribute("data-tz-id"));
    expect(ids).toEqual(["shanghai", "london", "new_york", "tokyo"]);
  });

  it("AC-WORLDCLOCKS-2: view toggle list/analog/grid swaps rendered shape", () => {
    const { container } = render(<WorldClocks lang="en" now={MAY_22_2026} />);
    fireEvent.click(container.querySelector("[data-tz-view='analog']")!);
    expect(container.querySelectorAll(".tz-row-analog").length).toBeGreaterThan(0);
    fireEvent.click(container.querySelector("[data-tz-view='grid']")!);
    expect(container.querySelectorAll(".tz-card").length).toBeGreaterThan(0);
    fireEvent.click(container.querySelector("[data-tz-view='list']")!);
    expect(container.querySelectorAll(".tz-row-list").length).toBeGreaterThan(0);
  });

  it("AC-WORLDCLOCKS-3: add-city picker shows the 8 unselected cities", () => {
    const { container } = render(<WorldClocks lang="en" now={MAY_22_2026} />);
    fireEvent.click(container.querySelector("[data-tz-add]")!);
    const pickerRows = container.querySelectorAll(".tz-picker-row");
    expect(pickerRows).toHaveLength(8);
  });

  it("AC-WORLDCLOCKS-4: selecting a city adds it to xai_zones", () => {
    const { container } = render(<WorldClocks lang="en" now={MAY_22_2026} />);
    fireEvent.click(container.querySelector("[data-tz-add]")!);
    fireEvent.click(container.querySelector("[data-tz-add-id='paris']")!);
    expect(localStorage.getItem("xai_zones")).toContain("paris");
    // Picker closes after selection
    expect(container.querySelector(".tz-picker")).toBeNull();
  });

  it("AC-WORLDCLOCKS-5: per-row remove button removes the zone", () => {
    const { container } = render(<WorldClocks lang="en" now={MAY_22_2026} />);
    fireEvent.click(container.querySelector("[data-tz-remove='shanghai']")!);
    expect(container.querySelectorAll(".tz-row-list")).toHaveLength(3);
  });

  it("AC-WORLDCLOCKS-6: .tz-view-toggle and .tz-picker carry data-no-drag", () => {
    const { container } = render(<WorldClocks lang="en" now={MAY_22_2026} />);
    expect(container.querySelector(".tz-view-toggle")?.getAttribute("data-no-drag")).not.toBeNull();
    fireEvent.click(container.querySelector("[data-tz-add]")!);
    expect(container.querySelector(".tz-picker")?.getAttribute("data-no-drag")).not.toBeNull();
  });

  it("AC-WORLDCLOCKS-7: removing the last zone is prevented", () => {
    // Pre-populate with single zone
    localStorage.setItem("xai_zones", JSON.stringify(["shanghai"]));
    const { container } = render(<WorldClocks lang="en" now={MAY_22_2026} />);
    expect(container.querySelectorAll(".tz-row-list")).toHaveLength(1);
    fireEvent.click(container.querySelector("[data-tz-remove='shanghai']")!);
    // Should still have 1 row (remove was prevented)
    expect(container.querySelectorAll(".tz-row-list")).toHaveLength(1);
  });

  it("AC-WORLDCLOCKS-9: persistence round-trip", () => {
    const { container, unmount } = render(<WorldClocks lang="en" now={MAY_22_2026} />);
    fireEvent.click(container.querySelector("[data-tz-add]")!);
    fireEvent.click(container.querySelector("[data-tz-add-id='paris']")!);
    unmount();
    const { container: c2 } = render(<WorldClocks lang="en" now={MAY_22_2026} />);
    const ids = Array.from(c2.querySelectorAll(".tz-row-list")).map((r) =>
      r.getAttribute("data-tz-id"),
    );
    expect(ids).toContain("paris");
  });

  it("AC-WORLDCLOCKS-8: dayDelta label uses i18n strings", () => {
    const { container } = render(<WorldClocks lang="en" now={MAY_22_2026} />);
    // Shanghai is +8 vs local; at 10:30 local with offset shift, expect "Today" most of the time.
    const dayLabels = Array.from(container.querySelectorAll(".tz-day")).map((d) => d.textContent);
    // At least one row should produce a label that is one of: Today/Tomorrow/Yesterday or ±Nd.
    for (const lab of dayLabels) {
      expect(
        ["Today", "Tomorrow", "Yesterday"].includes(lab!) || /^[+-]?\d+d$/.test(lab!),
      ).toBe(true);
    }
  });

  it("filters unknown zone ids from storage on render", () => {
    localStorage.setItem("xai_zones", JSON.stringify(["shanghai", "atlantis", "london"]));
    const { container } = render(<WorldClocks lang="en" now={MAY_22_2026} />);
    const ids = Array.from(container.querySelectorAll(".tz-row-list")).map((r) =>
      r.getAttribute("data-tz-id"),
    );
    expect(ids).toEqual(["shanghai", "london"]);
  });
});
