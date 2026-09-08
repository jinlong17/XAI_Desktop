/**
 * DesktopPet.bubble-side.test.tsx — AC-PET-11 bubble side-flip tests.
 *
 * When pos.x > innerWidth - BUBBLE_GUARD_PX (280), bubble has class pet-bubble-left.
 * Otherwise, bubble has class pet-bubble-right.
 *
 * Default innerWidth = 1280, BUBBLE_GUARD_PX = 280 → threshold = 1000.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { DesktopPet } from "../DesktopPet.js";

const VIEWPORT_W = 1280;
const BUBBLE_GUARD = 280;
const THRESHOLD = VIEWPORT_W - BUBBLE_GUARD; // 1000

describe("DesktopPet bubble side-flip", () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: VIEWPORT_W,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1280,
    });
  });

  function triggerBubble(container: HTMLElement) {
    const body = container.querySelector(".pet-body") as HTMLElement;
    act(() => { fireEvent.pointerDown(body, { clientX: 50, clientY: 50 }); });
    act(() => { fireEvent.pointerUp(window); });
  }

  it("bubble gets pet-bubble-right when pos.x is small (24px, far from right)", () => {
    // Default pos {x:24, y:24} is well below threshold 1000
    localStorage.setItem("xai_pet_pos", JSON.stringify({ x: 24, y: 24 }));
    const { container } = render(<DesktopPet on={true} lang="en" />);
    triggerBubble(container);
    const bubble = container.querySelector(".pet-bubble");
    expect(bubble?.className).toContain("pet-bubble-right");
    expect(bubble?.className).not.toContain("pet-bubble-left");
  });

  it("bubble gets pet-bubble-left when pos.x > threshold (1050 > 1000)", () => {
    // Set pos near right edge
    localStorage.setItem("xai_pet_pos", JSON.stringify({ x: 1050, y: 24 }));
    const { container } = render(<DesktopPet on={true} lang="en" />);
    triggerBubble(container);
    const bubble = container.querySelector(".pet-bubble");
    expect(bubble?.className).toContain("pet-bubble-left");
    expect(bubble?.className).not.toContain("pet-bubble-right");
  });

  it("bubble is right at exactly threshold - 1 (999)", () => {
    localStorage.setItem("xai_pet_pos", JSON.stringify({ x: THRESHOLD - 1, y: 24 }));
    const { container } = render(<DesktopPet on={true} lang="en" />);
    triggerBubble(container);
    const bubble = container.querySelector(".pet-bubble");
    expect(bubble?.className).toContain("pet-bubble-right");
  });
});
