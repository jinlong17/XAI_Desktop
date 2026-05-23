import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { UpcomingWidget } from "../widgets/UpcomingWidget.js";
import { UPCOMING } from "../internal/fixtures.js";

describe("UpcomingWidget", () => {
  it("AC-UPCOMING-1: renders 4 event rows", () => {
    const { container } = render(<UpcomingWidget lang="en" />);
    expect(container.querySelectorAll(".upc-row")).toHaveLength(4);
  });

  it("AC-UPCOMING-2: each row shows date + bilingual month + title + time", () => {
    const { container } = render(<UpcomingWidget lang="en" />);
    const rows = container.querySelectorAll(".upc-row");
    rows.forEach((row, i) => {
      const fix = UPCOMING[i]!;
      expect(row.querySelector(".upc-d")?.textContent).toBe(fix.date);
      expect(row.querySelector(".upc-m")?.textContent).toBe(fix.month.en);
      expect(row.querySelector(".upc-title")?.textContent).toBe(fix.title.en);
      expect(row.querySelector(".upc-time")?.textContent).toBe(fix.time);
    });
  });

  it("AC-UPCOMING-2: zh renders zh month + title", () => {
    const { container } = render(<UpcomingWidget lang="zh" />);
    const rows = container.querySelectorAll(".upc-row");
    rows.forEach((row, i) => {
      const fix = UPCOMING[i]!;
      expect(row.querySelector(".upc-m")?.textContent).toBe(fix.month.zh);
      expect(row.querySelector(".upc-title")?.textContent).toBe(fix.title.zh);
    });
  });
});
