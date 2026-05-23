import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { PomoDots } from "../internal/PomoDots.js";

describe("PomoDots helper", () => {
  it("renders `total` dot spans", () => {
    const { container } = render(<PomoDots count={3} total={8} />);
    expect(container.querySelectorAll(".pd-dot")).toHaveLength(8);
  });

  it("first `count` dots carry the 'on' class", () => {
    const { container } = render(<PomoDots count={3} total={8} />);
    const onDots = container.querySelectorAll(".pd-dot.on");
    expect(onDots).toHaveLength(3);
  });

  it("clamps count to total", () => {
    const { container } = render(<PomoDots count={20} total={5} />);
    expect(container.querySelectorAll(".pd-dot.on")).toHaveLength(5);
  });

  it("clamps negative count to 0", () => {
    const { container } = render(<PomoDots count={-3} total={5} />);
    expect(container.querySelectorAll(".pd-dot.on")).toHaveLength(0);
  });
});
