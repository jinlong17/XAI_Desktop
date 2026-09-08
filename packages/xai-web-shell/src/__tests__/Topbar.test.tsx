/**
 * Topbar tests — TP1..TP6 + TP*-Persist
 *
 * AC-TOPBAR-1: Appearance popover sets lang via setLang prop
 * AC-TOPBAR-2: Appearance popover sets theme via setTheme prop
 * AC-TOPBAR-3: Appearance popover sets density via setDensity prop
 * AC-TOPBAR-4: Settings gear icon click calls onOpenSettings()
 * AC-TOPBAR-5: Search input renders with placeholder (i18n: common.search_placeholder)
 * AC-TOPBAR-6: ⌘K kbd hint is rendered (decorative; no handler)
 *
 * TP*-Persist: clicking a dim toggle also writes the value to localStorage
 *   (Bugfix Tb-02/Tb-03/Tb-04 — Topbar theme/lang/density 切换不持久)
 * TP-Persist-Quota-Safe: localStorage.setItem failure is silently swallowed;
 *   in-memory setter still fires.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Topbar } from "../Topbar.js";

function renderTopbar(overrides?: Partial<React.ComponentProps<typeof Topbar>>) {
  const defaults = {
    lang: "en" as const,
    setLang: vi.fn(),
    theme: "light" as const,
    setTheme: vi.fn(),
    density: "comfortable" as const,
    setDensity: vi.fn(),
    onOpenSettings: vi.fn(),
  };
  const props = { ...defaults, ...overrides };
  return { ...render(<Topbar {...props} />), props };
}

function openPreferences(): void {
  const trigger = document.querySelector(".topbar-pref-trigger") as HTMLButtonElement;
  fireEvent.click(trigger);
}

describe("Topbar", () => {
  it("TP0 — preferences trigger opens the appearance popover", () => {
    renderTopbar({ lang: "en" });
    const trigger = document.querySelector(".topbar-pref-trigger") as HTMLButtonElement;
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("dialog", { name: "Appearance" })).toBeTruthy();
  });

  it("TP1 — appearance popover: clicking 中文 calls setLang('zh')", () => {
    const { props } = renderTopbar({ lang: "en" });
    openPreferences();
    fireEvent.click(screen.getByRole("menuitemradio", { name: "中文" }));
    expect(props.setLang).toHaveBeenCalledWith("zh");
  });

  it("TP1b — clicking EN calls setLang('en')", () => {
    const { props } = renderTopbar({ lang: "zh" });
    openPreferences();
    fireEvent.click(screen.getByRole("menuitemradio", { name: "English" }));
    expect(props.setLang).toHaveBeenCalledWith("en");
  });

  it("TP1c — active lang option has aria-checked=true", () => {
    renderTopbar({ lang: "en" });
    openPreferences();
    const enBtn = screen.getByRole("menuitemradio", { name: "English" });
    expect(enBtn.getAttribute("aria-checked")).toBe("true");
  });

  it("TP2 — Dark button calls setTheme('dark')", () => {
    const { props } = renderTopbar({ theme: "light" });
    openPreferences();
    const darkBtn = screen.getByRole("menuitemradio", { name: "Dark" });
    fireEvent.click(darkBtn);
    expect(props.setTheme).toHaveBeenCalledWith("dark");
  });

  it("TP2b — System button calls setTheme('system')", () => {
    const { props } = renderTopbar({ theme: "light" });
    openPreferences();
    const sysBtn = screen.getByRole("menuitemradio", { name: "System" });
    fireEvent.click(sysBtn);
    expect(props.setTheme).toHaveBeenCalledWith("system");
  });

  it("TP2c — active theme option has aria-checked=true", () => {
    renderTopbar({ theme: "dark" });
    openPreferences();
    const darkBtn = screen.getByRole("menuitemradio", { name: "Dark" });
    expect(darkBtn.getAttribute("aria-checked")).toBe("true");
  });

  it("TP3 — Compact button calls setDensity('compact')", () => {
    const { props } = renderTopbar({ density: "comfortable" });
    openPreferences();
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Compact" }));
    expect(props.setDensity).toHaveBeenCalledWith("compact");
  });

  it("TP3b — active density option has aria-checked=true", () => {
    renderTopbar({ density: "comfortable" });
    openPreferences();
    expect(screen.getByRole("menuitemradio", { name: "Comfortable" }).getAttribute("aria-checked")).toBe("true");
  });

  it("TP4 — Settings row click calls onOpenSettings", () => {
    const { props } = renderTopbar();
    openPreferences();
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    expect(props.onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it("TP5a — no onOpenSearch prop → renders readOnly input with EN placeholder (backwards-compat)", () => {
    renderTopbar({ lang: "en" });
    // onOpenSearch not provided → readOnly input rendered
    const input = screen.getByPlaceholderText("Search tasks, habits, notes…");
    expect(input).toBeTruthy();
    expect(input.tagName).toBe("INPUT");
    expect((input as HTMLInputElement).readOnly).toBe(true);
  });

  it("TP5b — onOpenSearch prop provided → renders <button class='search-box'>", () => {
    const onOpenSearch = vi.fn();
    renderTopbar({ lang: "en", onOpenSearch });
    // Button rendered instead of input
    const btn = screen.getByRole("button", { name: "Search tasks, habits, notes…" });
    expect(btn).toBeTruthy();
    expect(btn.tagName).toBe("BUTTON");
    // readOnly input should NOT be present
    expect(screen.queryByPlaceholderText("Search tasks, habits, notes…")).toBeNull();
  });

  it("TP6 — ⌘K kbd hint is rendered", () => {
    renderTopbar();
    expect(screen.getByText("⌘K")).toBeTruthy();
  });

  it("TP7 — button click calls onOpenSearch()", () => {
    const onOpenSearch = vi.fn();
    renderTopbar({ lang: "en", onOpenSearch });
    const btn = screen.getByRole("button", { name: "Search tasks, habits, notes…" });
    fireEvent.click(btn);
    expect(onOpenSearch).toHaveBeenCalledTimes(1);
  });

  it("TB-PREMIUM-1 — premiumBadge render-prop renders in Topbar when provided", () => {
    // Simulate the badge being passed from the app layer (avoiding circular dep)
    const badgeNode = <span data-testid="premium-tier-badge">Premium (stub)</span>;
    renderTopbar({ lang: "en", premiumBadge: badgeNode });

    // The badge should be visible with "Premium (stub)" text
    const badge = screen.getByTestId("premium-tier-badge");
    expect(badge).toBeTruthy();
    expect(badge.textContent).toContain("Premium (stub)");
  });

  // ---- Persistence tests (TP*-Persist) — Bugfix Tb-02/Tb-03/Tb-04 -----

  it("TP1-Persist — clicking 中文 writes xai_pref_lang='zh' to localStorage", () => {
    renderTopbar({ lang: "en" });
    openPreferences();
    fireEvent.click(screen.getByRole("menuitemradio", { name: "中文" }));
    expect(localStorage.getItem("xai_pref_lang")).toBe('"zh"');
  });

  it("TP1b-Persist — clicking EN writes xai_pref_lang='en' to localStorage", () => {
    renderTopbar({ lang: "zh" });
    openPreferences();
    fireEvent.click(screen.getByRole("menuitemradio", { name: "English" }));
    expect(localStorage.getItem("xai_pref_lang")).toBe('"en"');
  });

  it("TP2-Persist — clicking Dark writes xai_pref_theme='dark' to localStorage", () => {
    renderTopbar({ theme: "light" });
    openPreferences();
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Dark" }));
    expect(localStorage.getItem("xai_pref_theme")).toBe('"dark"');
  });

  it("TP2b-Persist — clicking System writes xai_pref_theme='system' to localStorage", () => {
    renderTopbar({ theme: "light" });
    openPreferences();
    fireEvent.click(screen.getByRole("menuitemradio", { name: "System" }));
    expect(localStorage.getItem("xai_pref_theme")).toBe('"system"');
  });

  it("TP2c-Persist — clicking Light writes xai_pref_theme='light' to localStorage", () => {
    renderTopbar({ theme: "dark" });
    openPreferences();
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Light" }));
    expect(localStorage.getItem("xai_pref_theme")).toBe('"light"');
  });

  it("TP3-Persist — clicking Compact writes xai_pref_density='compact' to localStorage", () => {
    renderTopbar({ density: "comfortable" });
    openPreferences();
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Compact" }));
    expect(localStorage.getItem("xai_pref_density")).toBe('"compact"');
  });

  it("TP3b-Persist — clicking Comfortable writes xai_pref_density='comfortable' to localStorage", () => {
    renderTopbar({ density: "compact" });
    openPreferences();
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Comfortable" }));
    expect(localStorage.getItem("xai_pref_density")).toBe('"comfortable"');
  });

  it("TP-Persist-Quota-Safe — localStorage.setItem throwing QuotaExceededError still calls setter and does not throw", () => {
    const setThemeFn = vi.fn();
    renderTopbar({ theme: "light", setTheme: setThemeFn });

    // Simulate localStorage being unavailable / quota exceeded
    const origSetItem = localStorage.setItem.bind(localStorage);
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });

    // Should not throw; setter must still be called
    openPreferences();
    expect(() => fireEvent.click(screen.getByRole("menuitemradio", { name: "Dark" }))).not.toThrow();
    expect(setThemeFn).toHaveBeenCalledWith("dark");

    spy.mockRestore();
    // Restore original in case the mock broke other tests
    void origSetItem;
  });
});
