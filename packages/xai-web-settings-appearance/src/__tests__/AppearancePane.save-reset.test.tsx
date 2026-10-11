/**
 * AC-SAVE-1, AC-SAVE-2, AC-RESET-1..AC-RESET-6 — the pane-local bottom action
 * area (CP-APPEARANCE-01, contract r3 §11 dispositions).
 *
 * AC-SAVE-1/2 are retired with the shared footer ("Save & apply" and its
 * unconditional "Saved" flash) and replaced by Retry all tests. AC-RESET-* now
 * drive the pane-local Reset to defaults: six verified removals, language
 * untouched, zero `web:settings:preference-changed` emissions.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppearancePane } from "../AppearancePane.js";
import { emitWebEvent } from "@repo/xai-web-event-bus";
import { getPref, setPref } from "@repo/plugin-web-storage";
import { flushAppearance, installAppearanceLockFixture } from "./appearanceLockFixture.js";

vi.mock("@repo/xai-web-event-bus", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@repo/xai-web-event-bus")>();
  return {
    ...actual,
    emitWebEvent: vi.fn(actual.emitWebEvent),
  };
});

const mockEmit = emitWebEvent as ReturnType<typeof vi.fn>;
const nativeGet = Storage.prototype.getItem;
const nativeSet = Storage.prototype.setItem;
const nativeRemove = Storage.prototype.removeItem;
type Attempt = { readonly op: "get" | "set" | "remove"; readonly key: string };
let attempts: Attempt[] = [];
let failSet = new Set<string>();
const RESET_KEYS = ["xai_pref_theme", "xai_pref_density", "xai_pref_font_scale", "xai_accent_hue", "xai_rail_pos", "xai_bg_tone"];
const writes = (from: number) => attempts.slice(from).filter((item) => item.op !== "get");

beforeEach(() => {
  mockEmit.mockClear();
  attempts = [];
  failSet = new Set();
  installAppearanceLockFixture();
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-density");
  document.documentElement.removeAttribute("data-bg-tone");
  document.documentElement.style.fontSize = "";
  vi.spyOn(window, "confirm").mockReturnValue(true);
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key: string) {
    if (this === localStorage) attempts.push({ op: "get", key });
    return nativeGet.call(this, key);
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key: string, value: string) {
    if (this === localStorage) {
      attempts.push({ op: "set", key });
      if (failSet.has(key)) throw new DOMException("quota", "QuotaExceededError");
    }
    return nativeSet.call(this, key, value);
  });
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation(function (this: Storage, key: string) {
    if (this === localStorage) attempts.push({ op: "remove", key });
    return nativeRemove.call(this, key);
  });
});

const retryAll = () => screen.getByTestId("appearance-retry-all");
const statusLine = () => screen.getByTestId("appearance-status-line");

describe("AppearancePane Retry all (replaces Save & apply)", () => {
  it("AC-SAVE-1: with no settled unsuccessful draft Retry all is rendered disabled (aria-disabled only), no 'Save & apply' or 'Saved', and one activation makes zero storage attempts", async () => {
    render(<AppearancePane lang="en" />);
    await flushAppearance();
    const button = retryAll();
    expect(button.textContent).toBe("Retry all");
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.hasAttribute("disabled")).toBe(false);
    expect(button.getAttribute("aria-describedby")).toBeNull();
    expect(screen.queryByRole("button", { name: "Save & apply" })).toBeNull();
    expect(screen.queryByText("Saved")).toBeNull();
    expect(screen.queryByText("已保存")).toBeNull();
    const from = attempts.length;
    fireEvent.click(button);
    await flushAppearance();
    expect(attempts.slice(from)).toEqual([]);
    expect(statusLine().textContent).toBe("");
    expect(button.classList.contains("is-saved")).toBe(false);
  });

  it("AC-SAVE-2: with a failed draft Retry all is enabled and one activation re-attempts exactly the failed field once; no Saved claim without a genuine latest success", async () => {
    render(<AppearancePane lang="en" />);
    failSet.add("xai_accent_hue");
    fireEvent.click(screen.getByRole("button", { name: /ocean/i }));
    await flushAppearance();
    expect(getPref("xai_accent_hue")).toBe(165);
    const button = retryAll();
    expect(button.getAttribute("aria-disabled")).toBeNull();
    expect(statusLine().textContent).toBe("1 appearance change is not saved.");
    // Still denied: one attempt on the failed key only, no success line.
    let from = attempts.length;
    fireEvent.click(button);
    await flushAppearance();
    expect(writes(from)).toEqual([{ op: "set", key: "xai_accent_hue" }]);
    expect(statusLine().textContent).toBe("1 appearance change is not saved.");
    expect(screen.queryByText("Appearance settings saved.")).toBeNull();
    // Lifted: the genuine latest success is the only Saved claim.
    failSet.clear();
    from = attempts.length;
    fireEvent.click(button);
    await flushAppearance();
    expect(writes(from)).toEqual([{ op: "set", key: "xai_accent_hue" }]);
    expect(getPref("xai_accent_hue")).toBe(230);
    expect(statusLine().textContent).toBe("Appearance settings saved.");
    expect(button.getAttribute("aria-disabled")).toBe("true");
  });
});

describe("AppearancePane Reset", () => {
  it("AC-RESET-1: confirm=true → six verified absences, DOM defaults, and xai_pref_lang bytes unchanged", async () => {
    setPref("xai_accent_hue", 300);
    setPref("xai_rail_pos", "top");
    setPref("xai_bg_tone", "peach");
    localStorage.setItem("xai_pref_theme", '"dark"');
    localStorage.setItem("xai_pref_density", '"compact"');
    localStorage.setItem("xai_pref_font_scale", "1.1");
    localStorage.setItem("xai_pref_lang", '"en"');

    render(<AppearancePane lang="en" />);
    await flushAppearance();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    const resetBtn = screen.getByRole("button", { name: "Reset to defaults" });
    fireEvent.click(resetBtn);
    await flushAppearance();

    for (const key of RESET_KEYS) expect(nativeGet.call(localStorage, key), key).toBeNull();
    expect(nativeGet.call(localStorage, "xai_pref_lang")).toBe('"en"');
    expect(getPref("xai_accent_hue")).toBe(165);
    expect(getPref("xai_rail_pos")).toBe("left");
    expect(getPref("xai_bg_tone")).toBe("default");
    // DOM attrs reset
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-density")).toBe("comfortable");
    expect(document.documentElement.style.fontSize).toBe("16px");
    expect(document.documentElement.getAttribute("data-bg-tone")).toBeNull();
    expect(statusLine().textContent).toBe("Defaults restored.");
  });

  it("AC-RESET-2: Reset → six reset intents, zero preference-changed emissions, language untouched", async () => {
    for (const key of RESET_KEYS) localStorage.setItem(key, key === "xai_accent_hue" ? "300" : key === "xai_rail_pos" ? "top" : key === "xai_bg_tone" ? "peach" : key === "xai_pref_font_scale" ? "1.1" : key === "xai_pref_theme" ? '"dark"' : '"compact"');
    localStorage.setItem("xai_pref_lang", '"zh"');
    render(<AppearancePane lang="zh" />);
    await flushAppearance();
    const from = attempts.length;
    fireEvent.click(screen.getByRole("button", { name: "恢复默认" }));
    await flushAppearance();
    const removed = writes(from).map((item) => `${item.op}:${item.key}`).sort();
    expect(removed).toEqual(RESET_KEYS.map((key) => `remove:${key}`).sort());
    expect(attempts.slice(from).filter((item) => item.key === "xai_pref_lang")).toEqual([]);
    expect(nativeGet.call(localStorage, "xai_pref_lang")).toBe('"zh"');
    const emitted = mockEmit.mock.calls.filter((call: unknown[]) => call[0] === "web:settings:preference-changed");
    expect(emitted).toEqual([]);
  });

  it("AC-RESET-3: confirm=false → zero storage attempts and no state change", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    setPref("xai_accent_hue", 300);
    render(<AppearancePane lang="en" />);
    await flushAppearance();
    const lineBefore = statusLine().textContent;
    const from = attempts.length;
    fireEvent.click(screen.getByRole("button", { name: "Reset to defaults" }));
    expect(attempts.slice(from)).toEqual([]);
    await flushAppearance();
    expect(attempts.slice(from)).toEqual([]);

    // Pref unchanged
    expect(getPref("xai_accent_hue")).toBe(300);
    expect(statusLine().textContent).toBe(lineBefore);
    expect(document.querySelector("[data-appearance-recovery]")).toBeNull();
    expect(mockEmit).not.toHaveBeenCalled();
  });

  it("AC-RESET-4: Reset re-paints DOM — data-theme='light', data-density='comfortable'", async () => {
    localStorage.setItem("xai_pref_theme", '"dark"');
    localStorage.setItem("xai_pref_density", '"compact"');
    render(<AppearancePane lang="en" />);
    await flushAppearance();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.getAttribute("data-density")).toBe("compact");
    fireEvent.click(screen.getByRole("button", { name: "Reset to defaults" }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-density")).toBe("comfortable");
    await flushAppearance();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-density")).toBe("comfortable");
  });

  it("AC-RESET-5: calling Reset twice yields the same end state (idempotent)", async () => {
    setPref("xai_accent_hue", 300);
    render(<AppearancePane lang="en" />);
    await flushAppearance();
    const resetBtn = screen.getByRole("button", { name: "Reset to defaults" });
    fireEvent.click(resetBtn);
    await flushAppearance();
    const after1 = getPref("xai_accent_hue");
    fireEvent.click(resetBtn);
    await flushAppearance();
    const after2 = getPref("xai_accent_hue");
    expect(after1).toBe(after2);
    expect(nativeGet.call(localStorage, "xai_accent_hue")).toBeNull();
  });

  it("AC-RESET-6: confirm called EXACTLY ONCE with the truthful text (no double-prompt)", async () => {
    const spy = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<AppearancePane lang="en" />);
    await flushAppearance();
    fireEvent.click(screen.getByRole("button", { name: "Reset to defaults" }));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      "Reset theme, density, font scale, accent color, background palette and sidebar position to their defaults? Language is kept.",
    );
    await flushAppearance();
  });
});
