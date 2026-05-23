import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { TzClock } from "../internal/TzClock.js";

describe("TzClock", () => {
  it("renders an svg with viewBox 0 0 100 100", () => {
    const { container } = render(<TzClock h={3} m={0} s={0} />);
    const svg = container.querySelector("svg.tz-clock");
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute("viewBox")).toBe("0 0 100 100");
  });

  it("rotates hour hand to 90° at 03:00:00", () => {
    const { container } = render(<TzClock h={3} m={0} s={0} />);
    const hour = container.querySelector("line[data-tz-hand='hour']");
    expect(hour?.getAttribute("transform")).toBe("rotate(90 50 50)");
  });

  it("rotates hour hand to 180° at 06:00:00", () => {
    const { container } = render(<TzClock h={6} m={0} s={0} />);
    const hour = container.querySelector("line[data-tz-hand='hour']");
    expect(hour?.getAttribute("transform")).toBe("rotate(180 50 50)");
  });
});
