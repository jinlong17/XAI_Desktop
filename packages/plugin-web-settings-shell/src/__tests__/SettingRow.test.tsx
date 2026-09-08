import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SettingRow } from "../index.js";

/**
 * SR1..SR4 — SettingRow atom.
 */
describe("<SettingRow>", () => {
  it("SR1: label rendered in .sr-label", () => {
    render(
      <SettingRow label="Theme">
        <span>ctrl</span>
      </SettingRow>,
    );
    const label = document.querySelector(".sr-label");
    expect(label?.textContent).toBe("Theme");
  });

  it("SR2: desc rendered in .sr-desc only when provided", () => {
    const { rerender } = render(
      <SettingRow label="Theme" desc="Light or dark mode">
        <span>ctrl</span>
      </SettingRow>,
    );
    expect(document.querySelector(".sr-desc")?.textContent).toBe(
      "Light or dark mode",
    );

    rerender(
      <SettingRow label="Theme">
        <span>ctrl</span>
      </SettingRow>,
    );
    expect(document.querySelector(".sr-desc")).toBeNull();
  });

  it("SR3: children rendered in .sr-ctrl", () => {
    render(
      <SettingRow label="Theme">
        <button>Apply</button>
      </SettingRow>,
    );
    const ctrl = document.querySelector(".sr-ctrl");
    expect(ctrl?.contains(screen.getByText("Apply"))).toBe(true);
  });

  it("SR4: style prop applied to root .setting-row", () => {
    render(
      <SettingRow label="Theme" style={{ marginTop: "20px" }}>
        <span>ctrl</span>
      </SettingRow>,
    );
    const root = document.querySelector(".setting-row") as HTMLElement;
    expect(root.style.marginTop).toBe("20px");
  });
});
