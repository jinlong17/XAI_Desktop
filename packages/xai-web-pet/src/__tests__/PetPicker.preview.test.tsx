/**
 * PetPicker.preview.test.tsx — AC-PET-8: live animation preview in picker.
 *
 * Verifies:
 * - Each row's avatar has class `pet-anim-<animid>` (live animation)
 * - Each row's avatar renders the idle mood SVG (PetArt)
 * - All 8 pets are represented
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { PetPicker } from "../PetPicker.js";
import { PET_DEFS } from "../internal/petDefs.js";
import { vi } from "vitest";

const noop = vi.fn();

describe("PetPicker live preview (AC-PET-8)", () => {
  it("each row avatar has the correct pet-anim-<animid> class", () => {
    const { container } = render(
      <PetPicker
        open={true}
        onClose={noop}
        current="mochi"
        onSelect={noop}
        lang="en"
      />,
    );

    for (const def of PET_DEFS) {
      const avatarWithClass = container.querySelector(
        `.pp-avatar.pet-anim-${def.anim}`,
      );
      expect(avatarWithClass).not.toBeNull();
    }
  });

  it("all 8 pets have an avatar with an animation class", () => {
    const { container } = render(
      <PetPicker
        open={true}
        onClose={noop}
        current="mochi"
        onSelect={noop}
        lang="en"
      />,
    );

    const avatars = container.querySelectorAll(".pp-avatar");
    expect(avatars).toHaveLength(8);

    for (const avatar of avatars) {
      const hasAnimClass = Array.from(avatar.classList).some((cls) =>
        cls.startsWith("pet-anim-"),
      );
      expect(hasAnimClass).toBe(true);
    }
  });

  it("each avatar renders an SVG (the idle PetArt)", () => {
    const { container } = render(
      <PetPicker
        open={true}
        onClose={noop}
        current="mochi"
        onSelect={noop}
        lang="en"
      />,
    );

    const avatars = container.querySelectorAll(".pp-avatar");
    for (const avatar of avatars) {
      const svg = avatar.querySelector("svg");
      expect(svg).not.toBeNull();
    }
  });

  it("each SVG inside avatars has width=84 height=84", () => {
    const { container } = render(
      <PetPicker
        open={true}
        onClose={noop}
        current="mochi"
        onSelect={noop}
        lang="en"
      />,
    );

    const avatars = container.querySelectorAll(".pp-avatar");
    for (const avatar of avatars) {
      const svg = avatar.querySelector("svg");
      expect(svg?.getAttribute("width")).toBe("84");
      expect(svg?.getAttribute("height")).toBe("84");
    }
  });

  it("mochi avatar (bob) has animation class pet-anim-bob", () => {
    const { container } = render(
      <PetPicker
        open={true}
        onClose={noop}
        current="mochi"
        onSelect={noop}
        lang="en"
      />,
    );

    const mochiRow = Array.from(container.querySelectorAll(".pp-row")).find(
      (r) => r.textContent?.includes("Mochi"),
    );
    expect(mochiRow).toBeDefined();
    const avatar = mochiRow?.querySelector(".pp-avatar");
    expect(avatar?.classList).toContain("pet-anim-bob");
  });

  it("ember avatar has animation class pet-anim-flicker", () => {
    const { container } = render(
      <PetPicker
        open={true}
        onClose={noop}
        current="mochi"
        onSelect={noop}
        lang="en"
      />,
    );

    const emberRow = Array.from(container.querySelectorAll(".pp-row")).find(
      (r) => r.textContent?.includes("Ember"),
    );
    expect(emberRow).toBeDefined();
    const avatar = emberRow?.querySelector(".pp-avatar");
    expect(avatar?.classList).toContain("pet-anim-flicker");
  });

  it("pebble avatar has animation class pet-anim-still (no-op)", () => {
    const { container } = render(
      <PetPicker
        open={true}
        onClose={noop}
        current="mochi"
        onSelect={noop}
        lang="en"
      />,
    );

    const pebbleRow = Array.from(container.querySelectorAll(".pp-row")).find(
      (r) => r.textContent?.includes("Pebble"),
    );
    expect(pebbleRow).toBeDefined();
    const avatar = pebbleRow?.querySelector(".pp-avatar");
    expect(avatar?.classList).toContain("pet-anim-still");
  });
});
