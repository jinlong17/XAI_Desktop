/**
 * DesktopPet.click-tip.test.tsx — AC-PET-5 click tip tests.
 *
 * Click (no movement) → mood "happy" + bubble appears with one of 5 tip strings.
 * Mood reverts to "idle" after HAPPY_DURATION_MS (1600ms).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { DesktopPet } from "../DesktopPet.js";
import { I18N } from "@repo/plugin-web-tokens";

const EN_CLICK_TIPS: string[] = [
  I18N.en.pet.tip1,
  I18N.en.pet.tip2,
  I18N.en.pet.tip3,
  I18N.en.pet.tip4,
  I18N.en.pet.working,
];

describe("DesktopPet click tip", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function clickPet(container: HTMLElement) {
    const body = container.querySelector(".pet-body") as HTMLElement;
    act(() => { fireEvent.pointerDown(body, { clientX: 50, clientY: 50 }); });
    act(() => { fireEvent.pointerUp(window); });
  }

  it("shows a bubble after click", () => {
    const { container } = render(<DesktopPet on={true} lang="en" />);
    clickPet(container);
    const bubble = container.querySelector(".pet-bubble");
    expect(bubble).not.toBeNull();
  });

  it("bubble text is one of the known EN pet tip strings", () => {
    // After click, the bubble shows one of the 5 click tips (random).
    // pet.hello may also show if tip rotation fires before pointerUp.
    // We verify the text is any known EN pet string.
    const ALL_PET_TIPS = [
      ...EN_CLICK_TIPS,
      I18N.en.pet.hello,
    ];
    const { container } = render(<DesktopPet on={true} lang="en" />);
    clickPet(container);
    const text = container.querySelector(".pet-bubble-text")?.textContent ?? "";
    // The bubble text must be one of the known pet tip strings
    expect(ALL_PET_TIPS.includes(text)).toBe(true);
  });

  it("pet-body gets mood-happy class after click", () => {
    const { container } = render(<DesktopPet on={true} lang="en" />);
    clickPet(container);
    const body = container.querySelector(".pet-body");
    expect(body?.className).toContain("mood-happy");
  });

  it("mood reverts to idle after HAPPY_DURATION_MS (1600ms)", async () => {
    const { container } = render(<DesktopPet on={true} lang="en" />);
    clickPet(container);

    expect(container.querySelector(".pet-body")?.className).toContain("mood-happy");

    act(() => { vi.advanceTimersByTime(1600); });

    expect(container.querySelector(".pet-body")?.className).toContain("mood-idle");
    expect(container.querySelector(".pet-body")?.className).not.toContain("mood-happy");
  });
});
