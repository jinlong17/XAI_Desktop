/**
 * TR1..TR4 — TimerRing component tests.
 * test.md §2
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TimerRing } from "../TimerRing.js";

describe("TimerRing", () => {
  // TR1: renders grey track + accent progress arc
  it("TR1: renders the progress arc and accent dot", () => {
    const { container } = render(<TimerRing progress={0.5} running={false} />);
    const arc = container.querySelector('[data-testid="ring-progress-arc"]');
    const dot = container.querySelector('[data-testid="ring-accent-dot"]');
    expect(arc).toBeTruthy();
    expect(dot).toBeTruthy();
  });

  // TR2: strokeDashoffset interpolated from progress prop
  it("TR2: strokeDashoffset changes with progress", () => {
    const circumference = 2 * Math.PI * 140;
    const { container: c0 } = render(<TimerRing progress={0} running={false} />);
    const { container: c1 } = render(<TimerRing progress={1} running={false} />);

    const arc0 = c0.querySelector('[data-testid="ring-progress-arc"]') as SVGCircleElement;
    const arc1 = c1.querySelector('[data-testid="ring-progress-arc"]') as SVGCircleElement;

    const offset0 = parseFloat(arc0.getAttribute("stroke-dashoffset")!);
    const offset1 = parseFloat(arc1.getAttribute("stroke-dashoffset")!);

    // At progress=0: offset = circumference (arc is empty)
    expect(offset0).toBeCloseTo(circumference, 1);
    // At progress=1: offset = 0 (arc is full)
    expect(offset1).toBeCloseTo(0, 1);
  });

  // TR3: accent dot transform rotates as progress increases
  it("TR3: dot cx/cy changes as progress increases", () => {
    const { container: c25 } = render(<TimerRing progress={0.25} running={false} />);
    const { container: c75 } = render(<TimerRing progress={0.75} running={false} />);

    const dot25 = c25.querySelector('[data-testid="ring-accent-dot"]') as SVGCircleElement;
    const dot75 = c75.querySelector('[data-testid="ring-accent-dot"]') as SVGCircleElement;

    const cx25 = parseFloat(dot25.getAttribute("cx")!);
    const cx75 = parseFloat(dot75.getAttribute("cx")!);

    // At 0.25 (90 deg from top = 3 o'clock), cx should be near 300 (160 + 140)
    // At 0.75 (270 deg from top = 9 o'clock), cx should be near 20 (160 - 140)
    expect(cx25).toBeGreaterThan(cx75);
  });

  // TR4: progress=0 dot at top (cy near 160-140=20, cx near 160)
  it("TR4: progress=0 dot near 12 o'clock", () => {
    const { container } = render(<TimerRing progress={0} running={false} />);
    const dot = container.querySelector('[data-testid="ring-accent-dot"]') as SVGCircleElement;
    const cx = parseFloat(dot.getAttribute("cx")!);
    const cy = parseFloat(dot.getAttribute("cy")!);
    // At angle -90 (top): cx=160, cy=160-140=20
    expect(cx).toBeCloseTo(160, 0);
    expect(cy).toBeCloseTo(20, 0);
  });
});
