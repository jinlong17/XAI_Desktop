import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BarChart } from "../BarChart.js";

describe("BarChart", () => {
  it("B1: renders one column per data entry", () => {
    const { container } = render(
      <BarChart
        labels={["Mon", "Tue", "Wed"]}
        data={[3, 6, 2]}
        colorVar="var(--blue)"
      />,
    );
    expect(container.querySelectorAll(".bar-col").length).toBe(3);
  });

  it("B2: tallest bar has 100% height", () => {
    const { container } = render(
      <BarChart labels={["a", "b"]} data={[5, 10]} colorVar="var(--blue)" />,
    );
    const fills = container.querySelectorAll<HTMLElement>(".bar-fill");
    expect(fills[1]?.style.height).toBe("100%");
  });

  it("B3: zero data renders 0% bars without NaN", () => {
    const { container } = render(
      <BarChart labels={["a", "b"]} data={[0, 0]} colorVar="var(--blue)" />,
    );
    const fills = container.querySelectorAll<HTMLElement>(".bar-fill");
    expect(fills[0]?.style.height).toBe("0%");
    expect(fills[1]?.style.height).toBe("0%");
  });

  it("B4: labels rendered below bars", () => {
    const { container } = render(
      <BarChart labels={["Mon", "Tue"]} data={[3, 6]} colorVar="var(--blue)" />,
    );
    const labels = container.querySelectorAll(".bar-label");
    expect(labels[0]?.textContent).toBe("Mon");
    expect(labels[1]?.textContent).toBe("Tue");
  });
});
