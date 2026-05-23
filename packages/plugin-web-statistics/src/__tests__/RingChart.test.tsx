import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { RingChart } from "../RingChart.js";

describe("RingChart", () => {
  it("R1: 3 segments produce 1 background + 3 segment circles", () => {
    const { container } = render(
      <RingChart
        segments={[
          { percent: 40, color: "var(--accent)" },
          { percent: 35, color: "var(--blue)" },
          { percent: 25, color: "var(--amber)" },
        ]}
      />,
    );
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBe(4);
  });

  it("R2: empty segments renders only the background circle", () => {
    const { container } = render(<RingChart segments={[]} />);
    expect(container.querySelectorAll("circle").length).toBe(1);
  });

  it("R3: works when percentages sum to less than 100", () => {
    const { container } = render(
      <RingChart
        segments={[{ percent: 30, color: "var(--accent)" }]}
      />,
    );
    expect(container.querySelectorAll("circle").length).toBe(2);
  });
});
