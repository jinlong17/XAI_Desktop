/**
 * Unit tests for apply* DOM helpers — AC-A1..AC-A13 (test.md §B)
 * Runs in jsdom environment (set via vitest.config.ts).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyAccentHue,
  applyBgTone,
  applyDensity,
  applyFontScale,
  applyRailPos,
  applyTheme,
} from "../apply.js";

describe("apply* DOM helpers", () => {
  beforeEach(() => {
    // Reset <html> attributes and inline style before each test
    const el = document.documentElement;
    el.removeAttribute("data-theme");
    el.removeAttribute("data-density");
    el.removeAttribute("data-bg-tone");
    el.removeAttribute("data-rail-pos");
    el.style.removeProperty("font-size");
    el.style.removeProperty("--accent-hue");
  });

  // AC-A1
  it("AC-A1: applyTheme('light') → data-theme='light'", () => {
    applyTheme("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  // AC-A2
  it("AC-A2: applyTheme('dark') → data-theme='dark'", () => {
    applyTheme("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  // AC-A3
  it("AC-A3: applyTheme('system') with light preference → data-theme='light'", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: false, // light preference
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    applyTheme("system");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    vi.unstubAllGlobals();
  });

  // AC-A4
  it("AC-A4: applyTheme('system') with dark preference → data-theme='dark'", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: true, // dark preference
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    applyTheme("system");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    vi.unstubAllGlobals();
  });

  // AC-A5
  it("AC-A5: applyDensity('compact') → data-density='compact'", () => {
    applyDensity("compact");
    expect(document.documentElement.getAttribute("data-density")).toBe("compact");
  });

  // AC-A6
  it("AC-A6: applyDensity('comfortable') → data-density='comfortable'", () => {
    applyDensity("comfortable");
    expect(document.documentElement.getAttribute("data-density")).toBe("comfortable");
  });

  // AC-A7
  it("AC-A7: applyFontScale(0.85) → font-size: 13.6px", () => {
    applyFontScale(0.85);
    expect(document.documentElement.style.fontSize).toBe("13.6px");
  });

  // AC-A8
  it("AC-A8: applyFontScale(1.15) → font-size: 18.4px", () => {
    applyFontScale(1.15);
    expect(document.documentElement.style.fontSize).toBe("18.4px");
  });

  // AC-A9
  it("AC-A9: applyFontScale(NaN) → throws RangeError", () => {
    expect(() => applyFontScale(NaN)).toThrow(RangeError);
  });

  // AC-A10
  it("AC-A10: applyAccentHue(295) → inline-style --accent-hue: 295", () => {
    applyAccentHue(295);
    expect(document.documentElement.style.getPropertyValue("--accent-hue")).toBe("295");
  });

  // AC-A11
  it("AC-A11: applyBgTone('cream') → data-bg-tone='cream'", () => {
    applyBgTone("cream");
    expect(document.documentElement.getAttribute("data-bg-tone")).toBe("cream");
  });

  // AC-A12
  it("AC-A12: applyBgTone('default') after cream → removes data-bg-tone attribute", () => {
    applyBgTone("cream");
    applyBgTone("default");
    expect(document.documentElement.hasAttribute("data-bg-tone")).toBe(false);
  });

  // AC-A13
  it("AC-A13: applyRailPos('right') → data-rail-pos='right'", () => {
    applyRailPos("right");
    expect(document.documentElement.getAttribute("data-rail-pos")).toBe("right");
  });
});
