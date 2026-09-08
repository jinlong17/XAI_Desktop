/**
 * AC-SAVE-1, AC-SAVE-2, AC-RESET-1..AC-RESET-6
 * — chassis SettingsFooter integration (Save + Reset).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { AppearancePane } from "../AppearancePane.js";
import { emitWebEvent } from "@repo/xai-web-event-bus";
import { getPref, setPref } from "@repo/plugin-web-storage";

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
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-density");
  document.documentElement.style.fontSize = "";
  vi.spyOn(window, "confirm").mockReturnValue(true);
});

describe("AppearancePane Save", () => {
  it("AC-SAVE-1: clicking Save → 7 emitWebEvent calls + .is-saved appears on button", () => {
    render(<AppearancePane lang="en" />);
    const saveBtn = screen.getByTestId("settings-footer-save");
    fireEvent.click(saveBtn);
    const prefKeys = mockEmit.mock.calls.map((c: unknown[]) => (c[1] as { key: string }).key);
    for (const key of ["lang", "theme", "density", "fontScale", "accentHue", "railPos", "bgTone"]) {
      expect(prefKeys, `missing key: ${key}`).toContain(key);
    }
    expect(saveBtn.classList.contains("is-saved")).toBe(true);
  });

  it("AC-SAVE-2: after 1800ms the .is-saved class is removed", () => {
    vi.useFakeTimers();
    render(<AppearancePane lang="en" />);
    const saveBtn = screen.getByTestId("settings-footer-save");
    fireEvent.click(saveBtn);
    expect(saveBtn.classList.contains("is-saved")).toBe(true);
    act(() => { vi.advanceTimersByTime(1800); });
    expect(saveBtn.classList.contains("is-saved")).toBe(false);
  });
});

describe("AppearancePane Reset", () => {
  it("AC-RESET-1: confirm=true → removePref called for 3 keys + applyX defaults for 3 dims", () => {
    setPref("xai_accent_hue", 300);
    setPref("xai_rail_pos", "top");
    setPref("xai_bg_tone", "peach");
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.setAttribute("data-density", "compact");

    render(<AppearancePane lang="en" />);
    const resetBtn = screen.getByTestId("settings-footer-reset");
    fireEvent.click(resetBtn);

    // Persisted keys should be removed → defaults restored
    expect(getPref("xai_accent_hue")).toBe(165);
    expect(getPref("xai_rail_pos")).toBe("left");
    expect(getPref("xai_bg_tone")).toBe("default");
    // DOM attrs reset
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-density")).toBe("comfortable");
  });

  it("AC-RESET-2: Reset → 6 emits with default values; NO lang emit", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<AppearancePane lang="en" />);
    const resetBtn = screen.getByTestId("settings-footer-reset");
    fireEvent.click(resetBtn);

    const emittedKeys = mockEmit.mock.calls.map((c: unknown[]) => (c[1] as { key: string }).key);
    expect(emittedKeys).toContain("theme");
    expect(emittedKeys).toContain("density");
    expect(emittedKeys).toContain("fontScale");
    expect(emittedKeys).toContain("accentHue");
    expect(emittedKeys).toContain("railPos");
    expect(emittedKeys).toContain("bgTone");
    expect(emittedKeys).not.toContain("lang");
  });

  it("AC-RESET-3: confirm=false → chassis aborts; NO removePref, NO emit", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    setPref("xai_accent_hue", 300);
    render(<AppearancePane lang="en" />);
    const resetBtn = screen.getByTestId("settings-footer-reset");
    fireEvent.click(resetBtn);

    // Pref unchanged
    expect(getPref("xai_accent_hue")).toBe(300);
    expect(mockEmit).not.toHaveBeenCalled();
  });

  it("AC-RESET-4: Reset re-paints DOM — data-theme='light', data-density='comfortable'", () => {
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.setAttribute("data-density", "compact");
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<AppearancePane lang="en" />);
    const resetBtn = screen.getByTestId("settings-footer-reset");
    fireEvent.click(resetBtn);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-density")).toBe("comfortable");
  });

  it("AC-RESET-5: calling Reset twice yields the same end state (idempotent)", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<AppearancePane lang="en" />);
    const resetBtn = screen.getByTestId("settings-footer-reset");
    fireEvent.click(resetBtn);
    const after1 = getPref("xai_accent_hue");
    fireEvent.click(resetBtn);
    const after2 = getPref("xai_accent_hue");
    expect(after1).toBe(after2);
  });

  it("AC-RESET-6: confirm called EXACTLY ONCE (no pane-level double-prompt)", () => {
    const spy = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<AppearancePane lang="en" />);
    const resetBtn = screen.getByTestId("settings-footer-reset");
    fireEvent.click(resetBtn);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
