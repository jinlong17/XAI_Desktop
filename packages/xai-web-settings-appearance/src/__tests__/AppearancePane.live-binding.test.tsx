/**
 * AC-LIVE-1..AC-LIVE-8 — live DOM apply on each control onChange.
 *
 * CP-APPEARANCE-01 dispositions (contract r3 §11): the pane no longer emits
 * `web:settings:preference-changed`, so the emission assertions are dropped;
 * every write goes through the async engine and the real per-key Web Lock, so
 * the local lock fixture is installed and real completion is awaited before
 * the byte assertions. AC-LIVE-8 is replaced: choosing 简体中文 persists "zh".
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppearancePane } from "../AppearancePane.js";
import { getPref } from "@repo/plugin-web-storage";
import { flushAppearance, installAppearanceLockFixture } from "./appearanceLockFixture.js";

beforeEach(() => {
  installAppearanceLockFixture();
  // Reset DOM attrs
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-density");
  document.documentElement.style.fontSize = "";
});

describe("AppearancePane live binding", () => {
  it("AC-LIVE-1: clicking Dark theme card sets data-theme='dark'", async () => {
    render(<AppearancePane lang="en" />);
    const darkBtn = screen.getByRole("button", { name: /dark/i });
    fireEvent.click(darkBtn);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    await flushAppearance();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("xai_pref_theme")).toBe('"dark"');
  });

  it("AC-LIVE-2: clicking Compact density sets data-density='compact'", async () => {
    render(<AppearancePane lang="en" />);
    const compactBtn = screen.getByRole("button", { name: /compact/i });
    fireEvent.click(compactBtn);
    expect(document.documentElement.getAttribute("data-density")).toBe("compact");
    await flushAppearance();
    expect(document.documentElement.getAttribute("data-density")).toBe("compact");
    expect(localStorage.getItem("xai_pref_density")).toBe('"compact"');
  });

  it("AC-LIVE-3: dragging hue slider to 220 writes localStorage", async () => {
    render(<AppearancePane lang="en" />);
    const slider = document.querySelector<HTMLInputElement>(".hue-slider");
    expect(slider).not.toBeNull();
    fireEvent.change(slider!, { target: { value: "220" } });
    await flushAppearance();
    expect(getPref("xai_accent_hue")).toBe(220);
  });

  it("AC-LIVE-4: clicking Ocean swatch writes xai_accent_hue=230", async () => {
    render(<AppearancePane lang="en" />);
    const oceanSwatch = screen.getByRole("button", { name: /ocean/i });
    fireEvent.click(oceanSwatch);
    await flushAppearance();
    expect(getPref("xai_accent_hue")).toBe(230);
  });

  it("AC-LIVE-5: clicking Lavender bg-tone card writes bgTone + accentHue=295", async () => {
    render(<AppearancePane lang="en" />);
    const lavBtn = screen.getByRole("button", { name: /lavender/i });
    fireEvent.click(lavBtn);
    await flushAppearance();
    expect(getPref("xai_bg_tone")).toBe("lavender");
    expect(getPref("xai_accent_hue")).toBe(295);
  });

  it("AC-LIVE-6: clicking Right rail-position card writes xai_rail_pos='right'", async () => {
    render(<AppearancePane lang="en" />);
    const rightBtn = screen.getByRole("button", { name: /right/i });
    fireEvent.click(rightBtn);
    await flushAppearance();
    expect(getPref("xai_rail_pos")).toBe("right");
  });

  it("AC-LIVE-7: setting font slider to 0.85 applies font-size", async () => {
    render(<AppearancePane lang="en" />);
    const fontSlider = document.querySelector<HTMLInputElement>('input[type="range"][min="0.85"]');
    expect(fontSlider).not.toBeNull();
    fireEvent.change(fontSlider!, { target: { value: "0.85" } });
    // 0.85 * 16 = 13.6px
    expect(document.documentElement.style.fontSize).toBe("13.6px");
    await flushAppearance();
    expect(document.documentElement.style.fontSize).toBe("13.6px");
    expect(localStorage.getItem("xai_pref_font_scale")).toBe("0.85");
  });

  it("AC-LIVE-8: choosing 简体中文 persists \"zh\" and marks it selected; no DOM apply", async () => {
    render(<AppearancePane lang="en" />);
    const zhBtn = screen.getByRole("button", { name: /简体中文/i });
    fireEvent.click(zhBtn);
    await flushAppearance();
    expect(localStorage.getItem("xai_pref_lang")).toBe('"zh"');
    expect(screen.getByRole("button", { name: /简体中文/i }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("button", { name: /English/i }).getAttribute("aria-selected")).toBe("false");
    // No data-lang attribute on html (lang has no DOM apply channel)
    expect(document.documentElement.getAttribute("data-lang")).toBeNull();
  });
});
