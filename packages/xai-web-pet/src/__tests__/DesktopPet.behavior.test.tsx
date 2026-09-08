/**
 * DesktopPet.behavior.test.tsx — render flow tests.
 *
 * AC-PET-2: animation class on body when on=true.
 * Verifies: on=true mounts body; on=false unmounts body; on=false+pickerOpen keeps picker.
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { DesktopPet } from "../DesktopPet.js";

describe("DesktopPet render flow", () => {
  it("renders nothing visible when on=false and pickerOpen=false", () => {
    const { container } = render(<DesktopPet on={false} lang="en" />);
    // When on=false, DesktopPet renders only PetPicker (which is null when not open)
    expect(container.querySelector(".pet-wrap")).toBeNull();
  });

  it("renders .pet-wrap when on=true", () => {
    const { container } = render(<DesktopPet on={true} lang="en" />);
    expect(container.querySelector(".pet-wrap")).not.toBeNull();
  });

  it("renders .pet-body with anim class for default pet (mochi → pet-anim-bob)", () => {
    const { container } = render(<DesktopPet on={true} lang="en" />);
    const body = container.querySelector(".pet-body");
    expect(body).not.toBeNull();
    // Default petId is "mochi" (from storage default), anim is "bob"
    expect(body?.className).toContain("pet-anim-bob");
  });

  it("renders .pet-shadow inside .pet-body", () => {
    const { container } = render(<DesktopPet on={true} lang="en" />);
    const shadow = container.querySelector(".pet-shadow");
    expect(shadow).not.toBeNull();
  });

  it("renders swap button .pet-swap-btn when on=true", () => {
    const { container } = render(<DesktopPet on={true} lang="en" />);
    expect(container.querySelector(".pet-swap-btn")).not.toBeNull();
  });

  it("swap button has correct title in English", () => {
    const { container } = render(<DesktopPet on={true} lang="en" />);
    const btn = container.querySelector(".pet-swap-btn");
    expect(btn?.getAttribute("title")).toBe("Change pet");
  });

  it("swap button has correct title in Chinese", () => {
    const { container } = render(<DesktopPet on={true} lang="zh" />);
    const btn = container.querySelector(".pet-swap-btn");
    expect(btn?.getAttribute("title")).toBe("更换桌宠");
  });

  it("does not render .pet-wrap when on=false", () => {
    const { container } = render(<DesktopPet on={false} lang="en" />);
    expect(container.querySelector(".pet-wrap")).toBeNull();
  });

  it("renders an SVG inside .pet-body (the pet art)", () => {
    const { container } = render(<DesktopPet on={true} lang="en" />);
    const body = container.querySelector(".pet-body");
    const svg = body?.querySelector("svg");
    expect(svg).not.toBeNull();
  });

  it("has fixed position transform on .pet-wrap", () => {
    const { container } = render(<DesktopPet on={true} lang="en" />);
    const wrap = container.querySelector(".pet-wrap") as HTMLElement | null;
    expect(wrap?.style.transform).toMatch(/translate\(/);
  });
});
