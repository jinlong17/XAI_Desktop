/**
 * BreathingOrb component tests.
 *
 * Design: packages/xai-web-ai-chat/docs/test.md §3 — BO
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BreathingOrb } from "../BreathingOrb.js";

describe("BreathingOrb (BO)", () => {
  it("BO1: renders .orb containing 3 .orb-layer and 1 .orb-noise", () => {
    const { container } = render(<BreathingOrb thinking={false} />);
    const orb = container.querySelector(".orb");
    expect(orb).not.toBeNull();
    expect(container.querySelectorAll(".orb-layer").length).toBe(3);
    expect(container.querySelector(".orb-1")).not.toBeNull();
    expect(container.querySelector(".orb-2")).not.toBeNull();
    expect(container.querySelector(".orb-3")).not.toBeNull();
    expect(container.querySelector(".orb-noise")).not.toBeNull();
  });

  it("BO2: adds .orb-thinking modifier when thinking=true", () => {
    const { container } = render(<BreathingOrb thinking={true} />);
    const orb = container.querySelector(".orb");
    expect(orb?.className).toBe("orb orb-thinking");
  });

  it("BO3: does NOT render .ai-aurora (separation of concerns)", () => {
    const { container } = render(<BreathingOrb thinking={false} />);
    expect(container.querySelector(".ai-aurora")).toBeNull();
  });
});
