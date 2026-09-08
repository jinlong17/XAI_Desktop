import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { Donut } from "../internal/Donut.js";

describe("Donut helper", () => {
  it("renders an svg with class 'donut'", () => {
    const { container } = render(<Donut value={0.5} />);
    const svg = container.querySelector("svg.donut");
    expect(svg).not.toBeNull();
  });

  it("strokeDashoffset reflects 1-value", () => {
    const { container } = render(<Donut value={0.25} size={48} />);
    const filled = container.querySelector("circle[data-value]");
    expect(filled?.getAttribute("data-value")).toBe("0.25");
  });

  it("clamps out-of-range values to [0, 1]", () => {
    const { container } = render(<Donut value={2} />);
    const filled = container.querySelector("circle[data-value]");
    expect(filled?.getAttribute("data-value")).toBe("1");
  });

  it("treats NaN as 0", () => {
    const { container } = render(<Donut value={NaN} />);
    const filled = container.querySelector("circle[data-value]");
    expect(filled?.getAttribute("data-value")).toBe("0");
  });
});
