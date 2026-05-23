/**
 * DesktopPet.resize.test.tsx — AC-PET-13 window resize re-clamp test.
 *
 * Simulate `resize` shrinking viewport below pos → pos re-clamped + persisted.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import { DesktopPet } from "../DesktopPet.js";

describe("DesktopPet window resize", () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1280,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 800,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1280,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 800,
    });
  });

  it("re-clamps position when viewport shrinks below pet position", () => {
    // Start with pet near bottom-right of 1280×800
    localStorage.setItem("xai_pet_pos", JSON.stringify({ x: 1100, y: 700 }));
    const { container } = render(<DesktopPet on={true} lang="en" />);

    // Shrink viewport to 400×400 — pet at (1100,700) is out of bounds
    act(() => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 400,
      });
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 400,
      });
      window.dispatchEvent(new Event("resize"));
    });

    const wrap = container.querySelector(".pet-wrap") as HTMLElement | null;
    const transform = wrap?.style.transform ?? "";

    // Parse the translate values
    const match = /translate\((-?\d+(?:\.\d+)?)px,\s*(-?\d+(?:\.\d+)?)px\)/.exec(transform);
    expect(match).not.toBeNull();
    const x = parseFloat(match?.[1] ?? "9999");
    const y = parseFloat(match?.[2] ?? "9999");

    // With w=400, h=400: max_x = 400 - 84 - 8 = 308; max_y = 308
    expect(x).toBeLessThanOrEqual(308);
    expect(y).toBeLessThanOrEqual(308);
  });

  it("does not change position if it is still within bounds after resize", () => {
    // Pet at (100, 100) — should stay there after resize to 500×500
    localStorage.setItem("xai_pet_pos", JSON.stringify({ x: 100, y: 100 }));
    const { container } = render(<DesktopPet on={true} lang="en" />);

    act(() => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 500,
      });
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 500,
      });
      window.dispatchEvent(new Event("resize"));
    });

    const wrap = container.querySelector(".pet-wrap") as HTMLElement | null;
    expect(wrap?.style.transform).toBe("translate(100px, 100px)");
  });
});
