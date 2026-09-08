import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { LineChart } from "../LineChart.js";

describe("LineChart", () => {
  it("L1: renders <path> for line + <path> for area", () => {
    const { container } = render(
      <LineChart
        labels={["a", "b", "c"]}
        data={[1, 4, 2]}
        colorVar="var(--accent)"
      />,
    );
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBe(2);
  });

  it("L2: 7-element data produces 7 <circle> markers (plus 7 halo circles)", () => {
    const { container } = render(
      <LineChart
        labels={["a", "b", "c", "d", "e", "f", "g"]}
        data={[1, 4, 2, 5, 3, 6, 2]}
        colorVar="var(--accent)"
      />,
    );
    const circles = container.querySelectorAll("circle");
    // each datapoint produces 2 circles (dot + halo)
    expect(circles.length).toBe(14);
  });

  it("L3: empty data renders an empty-state placeholder, no NaN", () => {
    const { container } = render(
      <LineChart labels={[]} data={[]} colorVar="var(--accent)" />,
    );
    const html = container.innerHTML;
    expect(html).not.toContain("NaN");
    expect(container.querySelector(".line-chart")).not.toBeNull();
  });

  it("L4: max equals min produces a flat line with no NaN", () => {
    const { container } = render(
      <LineChart
        labels={["a", "b", "c"]}
        data={[5, 5, 5]}
        colorVar="var(--accent)"
      />,
    );
    expect(container.innerHTML).not.toContain("NaN");
  });
});
