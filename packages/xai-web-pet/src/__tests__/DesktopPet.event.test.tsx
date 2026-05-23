/**
 * DesktopPet.event.test.tsx — AC-PET-10 web:shell:pet-toggle event tests.
 *
 * Verifies: emitting web:shell:pet-toggle with on:false hides the pet body
 * even while prop on=true; prop change re-reconciles the internal state.
 */

import { describe, it, expect } from "vitest";
import { render, act } from "@testing-library/react";
import { emitWebEvent } from "@repo/xai-web-event-bus";
import { DesktopPet } from "../DesktopPet.js";

describe("DesktopPet web:shell:pet-toggle event", () => {
  it("pet is visible when on=true and no event", () => {
    const { container } = render(<DesktopPet on={true} lang="en" />);
    expect(container.querySelector(".pet-wrap")).not.toBeNull();
  });

  it("pet hides when event fires with on:false (prop still true)", () => {
    const { container } = render(<DesktopPet on={true} lang="en" />);

    act(() => {
      emitWebEvent("web:shell:pet-toggle", { on: false, source: "rail-bottom" });
    });

    expect(container.querySelector(".pet-wrap")).toBeNull();
  });

  it("pet shows when event fires with on:true (prop was false)", () => {
    const { container } = render(<DesktopPet on={false} lang="en" />);
    expect(container.querySelector(".pet-wrap")).toBeNull();

    act(() => {
      emitWebEvent("web:shell:pet-toggle", { on: true, source: "shortcut" });
    });

    expect(container.querySelector(".pet-wrap")).not.toBeNull();
  });

  it("prop change reconciles after event (prop is authoritative)", () => {
    const { container, rerender } = render(<DesktopPet on={true} lang="en" />);

    // Event hides pet
    act(() => {
      emitWebEvent("web:shell:pet-toggle", { on: false, source: "settings" });
    });
    expect(container.querySelector(".pet-wrap")).toBeNull();

    // Prop change to false, then back to true → should show pet
    act(() => {
      rerender(<DesktopPet on={false} lang="en" />);
    });
    act(() => {
      rerender(<DesktopPet on={true} lang="en" />);
    });
    expect(container.querySelector(".pet-wrap")).not.toBeNull();
  });

  it("ignores source field (only consumes on)", () => {
    const { container } = render(<DesktopPet on={true} lang="en" />);

    // All source values should work the same
    act(() => {
      emitWebEvent("web:shell:pet-toggle", { on: false, source: "settings" });
    });
    expect(container.querySelector(".pet-wrap")).toBeNull();

    act(() => {
      emitWebEvent("web:shell:pet-toggle", { on: true, source: "shortcut" });
    });
    expect(container.querySelector(".pet-wrap")).not.toBeNull();
  });
});
