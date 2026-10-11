/**
 * AC-RENDER-1..AC-RENDER-8 — DOM contract for AppearancePane.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { setPref } from "@repo/plugin-web-storage";
import { AppearancePane } from "../AppearancePane.js";

beforeEach(() => {
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-density");
  document.documentElement.style.fontSize = "";
});

describe("AppearancePane rendering", () => {
  it("AC-RENDER-1: renders 7 SettingRow elements", () => {
    const { container } = render(<AppearancePane lang="en" />);
    const rows = container.querySelectorAll(".setting-row");
    expect(rows.length).toBe(7);
  });

  it("AC-RENDER-2: 3 theme cards + 6 hue swatches + 6 bg-tone cards + 4 rail-pos cards visible", () => {
    const { container } = render(<AppearancePane lang="en" />);
    expect(container.querySelectorAll(".theme-card").length).toBe(3);
    expect(container.querySelectorAll(".accent-sw").length).toBe(6);
    expect(container.querySelectorAll(".bg-tone-card").length).toBe(6);
    expect(container.querySelectorAll(".rail-pos-card").length).toBe(4);
  });

  it("AC-RENDER-3: theme card matching current data-theme has .active class", () => {
    // CP-APPEARANCE-01 disposition: seed stored bytes instead of DOM state.
    localStorage.setItem("xai_pref_theme", '"dark"');
    const { container } = render(<AppearancePane lang="en" />);
    const activeCards = container.querySelectorAll(".theme-card.active");
    expect(activeCards.length).toBe(1);
    // Find the dark card specifically
    const darkCard = Array.from(container.querySelectorAll(".theme-card")).find((c) =>
      c.querySelector(".tp-dark"),
    );
    expect(darkCard?.classList.contains("active")).toBe(true);
  });

  it("AC-RENDER-4: hue swatch with |accentHue - p.hue| < 3 has .active class", () => {
    // Set accentHue close to sage (165)
    setPref("xai_accent_hue", 166);
    const { container } = render(<AppearancePane lang="en" />);
    const activeSwatches = container.querySelectorAll(".accent-sw.active");
    expect(activeSwatches.length).toBe(1);
  });

  it("AC-RENDER-5: bg-tone card matching current xai_bg_tone has .active class", () => {
    setPref("xai_bg_tone", "mist");
    const { container } = render(<AppearancePane lang="en" />);
    const activeTones = container.querySelectorAll(".bg-tone-card.active");
    expect(activeTones.length).toBe(1);
    expect(activeTones[0]?.classList.contains("bgt-mist")).toBe(true);
  });

  it("AC-RENDER-6: rail-pos card matching current xai_rail_pos has .active class", () => {
    setPref("xai_rail_pos", "top");
    const { container } = render(<AppearancePane lang="en" />);
    const activeRails = container.querySelectorAll(".rail-pos-card.active");
    expect(activeRails.length).toBe(1);
    expect(activeRails[0]?.classList.contains("rp-top")).toBe(true);
  });

  it("AC-RENDER-7: hue slider value reflects accentHue; slider-val shows rounded degrees", () => {
    setPref("xai_accent_hue", 230);
    const { container } = render(<AppearancePane lang="en" />);
    const slider = container.querySelector<HTMLInputElement>(".hue-slider");
    expect(slider?.value).toBe("230");
    const val = container.querySelector(".hue-slider + .slider-val, .accent-slider-row .slider-val");
    expect(val?.textContent).toMatch(/230°/);
  });

  it("AC-RENDER-8: font slider value reflects fontScale; slider-val shows rounded %", () => {
    // CP-APPEARANCE-01 disposition: seed stored bytes instead of DOM state.
    localStorage.setItem("xai_pref_font_scale", "1.1");
    const { container } = render(<AppearancePane lang="en" />);
    const fontSlider = container.querySelector<HTMLInputElement>('input[type="range"][min="0.85"]');
    expect(parseFloat(fontSlider?.value ?? "0")).toBeCloseTo(1.1, 1);
    const vals = container.querySelectorAll(".slider-val");
    const pctVal = Array.from(vals).find((v) => v.textContent?.includes("%"));
    expect(pctVal?.textContent).toMatch(/110%/);
  });
});
