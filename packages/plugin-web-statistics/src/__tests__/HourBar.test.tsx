import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { HourBar } from "../HourBar.js";

describe("HourBar", () => {
  const data24 = new Array(24).fill(0).map((_, i) => i * 2);

  it("HB1: 24 columns", () => {
    const { container } = render(<HourBar data={data24} peak={null} />);
    expect(container.querySelectorAll(".hbar-col").length).toBe(24);
  });

  it("HB2: peak=9 → that column gets the peak class", () => {
    const peakedData = [...data24];
    peakedData[9] = 100;
    const { container } = render(<HourBar data={peakedData} peak={9} />);
    const cols = container.querySelectorAll(".hbar-col");
    expect(cols[9]?.classList.contains("peak")).toBe(true);
  });

  it("HB3: peak=null → no peak class on any column", () => {
    const { container } = render(<HourBar data={data24} peak={null} />);
    expect(container.querySelectorAll(".hbar-col.peak").length).toBe(0);
  });

  it("HB4: every 3rd label rendered (8 labels for 0,3,...,21)", () => {
    const { container } = render(<HourBar data={data24} peak={null} />);
    expect(container.querySelectorAll(".hbar-label").length).toBe(8);
  });

  it("HB5: all zeros with peak=null renders without throwing", () => {
    const zeros = new Array(24).fill(0);
    const { container } = render(<HourBar data={zeros} peak={null} />);
    expect(container.querySelectorAll(".hbar-col").length).toBe(24);
  });
});
