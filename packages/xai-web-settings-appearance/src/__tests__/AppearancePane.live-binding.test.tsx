/**
 * AC-LIVE-1..AC-LIVE-8 — live DOM apply on each control onChange.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppearancePane } from "../AppearancePane.js";
import { emitWebEvent } from "@repo/xai-web-event-bus";
import { getPref } from "@repo/plugin-web-storage";

vi.mock("@repo/xai-web-event-bus", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@repo/xai-web-event-bus")>();
  return {
    ...actual,
    emitWebEvent: vi.fn(actual.emitWebEvent),
  };
});

const mockEmit = emitWebEvent as ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockEmit.mockClear();
  // Reset DOM attrs
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-density");
  document.documentElement.style.fontSize = "";
});

describe("AppearancePane live binding", () => {
  it("AC-LIVE-1: clicking Dark theme card sets data-theme='dark' + emits", () => {
    render(<AppearancePane lang="en" />);
    const darkBtn = screen.getByRole("button", { name: /dark/i });
    fireEvent.click(darkBtn);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(mockEmit).toHaveBeenCalledWith(
      "web:settings:preference-changed",
      expect.objectContaining({ key: "theme", value: "dark" }),
    );
  });

  it("AC-LIVE-2: clicking Compact density sets data-density='compact' + emits", () => {
    render(<AppearancePane lang="en" />);
    const compactBtn = screen.getByRole("button", { name: /compact/i });
    fireEvent.click(compactBtn);
    expect(document.documentElement.getAttribute("data-density")).toBe("compact");
    expect(mockEmit).toHaveBeenCalledWith(
      "web:settings:preference-changed",
      expect.objectContaining({ key: "density", value: "compact" }),
    );
  });

  it("AC-LIVE-3: dragging hue slider to 220 writes localStorage + emits", () => {
    render(<AppearancePane lang="en" />);
    const slider = document.querySelector<HTMLInputElement>(".hue-slider");
    expect(slider).not.toBeNull();
    fireEvent.change(slider!, { target: { value: "220" } });
    expect(getPref("xai_accent_hue")).toBe(220);
    expect(mockEmit).toHaveBeenCalledWith(
      "web:settings:preference-changed",
      expect.objectContaining({ key: "accentHue", value: 220 }),
    );
  });

  it("AC-LIVE-4: clicking Ocean swatch writes xai_accent_hue=230 + emits", () => {
    render(<AppearancePane lang="en" />);
    const oceanSwatch = screen.getByRole("button", { name: /ocean/i });
    fireEvent.click(oceanSwatch);
    expect(getPref("xai_accent_hue")).toBe(230);
    expect(mockEmit).toHaveBeenCalledWith(
      "web:settings:preference-changed",
      expect.objectContaining({ key: "accentHue", value: 230 }),
    );
  });

  it("AC-LIVE-5: clicking Lavender bg-tone card writes bgTone + accentHue=295 + TWO emits", () => {
    render(<AppearancePane lang="en" />);
    const lavBtn = screen.getByRole("button", { name: /lavender/i });
    fireEvent.click(lavBtn);
    expect(getPref("xai_bg_tone")).toBe("lavender");
    expect(getPref("xai_accent_hue")).toBe(295);
    const bgToneEmit = mockEmit.mock.calls.find(
      (c: unknown[]) =>
        (c[1] as { key: string }).key === "bgTone" &&
        (c[1] as { value: unknown }).value === "lavender",
    );
    const accentEmit = mockEmit.mock.calls.find(
      (c: unknown[]) =>
        (c[1] as { key: string }).key === "accentHue" &&
        (c[1] as { value: unknown }).value === 295,
    );
    expect(bgToneEmit).toBeDefined();
    expect(accentEmit).toBeDefined();
  });

  it("AC-LIVE-6: clicking Right rail-position card writes xai_rail_pos='right' + emits", () => {
    render(<AppearancePane lang="en" />);
    const rightBtn = screen.getByRole("button", { name: /right/i });
    fireEvent.click(rightBtn);
    expect(getPref("xai_rail_pos")).toBe("right");
    expect(mockEmit).toHaveBeenCalledWith(
      "web:settings:preference-changed",
      expect.objectContaining({ key: "railPos", value: "right" }),
    );
  });

  it("AC-LIVE-7: setting font slider to 0.85 applies font-size + emits", () => {
    render(<AppearancePane lang="en" />);
    const fontSlider = document.querySelector<HTMLInputElement>('input[type="range"][min="0.85"]');
    expect(fontSlider).not.toBeNull();
    fireEvent.change(fontSlider!, { target: { value: "0.85" } });
    // 0.85 * 16 = 13.6px
    expect(document.documentElement.style.fontSize).toBe("13.6px");
    expect(mockEmit).toHaveBeenCalledWith(
      "web:settings:preference-changed",
      expect.objectContaining({ key: "fontScale", value: 0.85 }),
    );
  });

  it("AC-LIVE-8: clicking 简体中文 segment emits lang event, no DOM apply", () => {
    render(<AppearancePane lang="en" />);
    const zhBtn = screen.getByRole("button", { name: /简体中文/i });
    fireEvent.click(zhBtn);
    expect(mockEmit).toHaveBeenCalledWith(
      "web:settings:preference-changed",
      expect.objectContaining({ key: "lang", value: "zh" }),
    );
    // No data-lang attribute on html (lang has no DOM apply channel)
    expect(document.documentElement.getAttribute("data-lang")).toBeNull();
  });
});
