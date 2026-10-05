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
 * TP*-Persist (CP-APPEARANCE-01 disposition): each choice calls its setter
 *   exactly once with its value and makes zero Storage attempts. Persistence
 *   now belongs to the host's App-scoped Appearance controller and is asserted
 *   at App level (apps/web/src/__tests__/App.appearance.test.tsx), which also
 *   replaces TP-Persist-Quota-Safe.
 * TP-STATUS-*: the optional appearanceStatus slot renders immediately after
 *   the premium badge in .topbar-controls, before the appearance popover.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, onTestFinished } from "vitest";
import { Topbar } from "../Topbar.js";

/**
 * Storage attempt counter for the TP*-Persist dispositions: records every
 * getItem/setItem/removeItem attempt, then delegates exactly once. Installed
 * per test and restored when that test finishes.
 */
function countStorage(): string[] {
  const attempts: string[] = [];
  const nativeGet = Storage.prototype.getItem;
  const nativeSet = Storage.prototype.setItem;
  const nativeRemove = Storage.prototype.removeItem;
  const spies = [
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key: string) {
      attempts.push(`get:${key}`);
      return nativeGet.call(this, key);
    }),
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key: string, value: string) {
      attempts.push(`set:${key}`);
      return nativeSet.call(this, key, value);
    }),
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(function (this: Storage, key: string) {
      attempts.push(`remove:${key}`);
      return nativeRemove.call(this, key);
    }),
  ];
  onTestFinished(() => { for (const spy of spies) spy.mockRestore(); });
  return attempts;
}

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

  // ---- Persistence dispositions (TP*-Persist) — CP-APPEARANCE-01 -----
  // Each choice calls its setter exactly once with the option's value and
  // makes zero Storage attempts; persistence is asserted at App level.

  it("TP1-Persist — clicking 中文 calls setLang('zh') once and makes zero Storage attempts", () => {
    const { props } = renderTopbar({ lang: "en" });
    openPreferences();
    const storageAttempts = countStorage();
    fireEvent.click(screen.getByRole("menuitemradio", { name: "中文" }));
    expect(props.setLang).toHaveBeenCalledTimes(1);
    expect(props.setLang).toHaveBeenCalledWith("zh");
    expect(storageAttempts).toEqual([]);
  });

  it("TP1b-Persist — clicking EN calls setLang('en') once and makes zero Storage attempts", () => {
    const { props } = renderTopbar({ lang: "zh" });
    openPreferences();
    const storageAttempts = countStorage();
    fireEvent.click(screen.getByRole("menuitemradio", { name: "English" }));
    expect(props.setLang).toHaveBeenCalledTimes(1);
    expect(props.setLang).toHaveBeenCalledWith("en");
    expect(storageAttempts).toEqual([]);
  });

  it("TP2-Persist — clicking Dark calls setTheme('dark') once and makes zero Storage attempts", () => {
    const { props } = renderTopbar({ theme: "light" });
    openPreferences();
    const storageAttempts = countStorage();
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Dark" }));
    expect(props.setTheme).toHaveBeenCalledTimes(1);
    expect(props.setTheme).toHaveBeenCalledWith("dark");
    expect(storageAttempts).toEqual([]);
  });

  it("TP2b-Persist — clicking System calls setTheme('system') once and makes zero Storage attempts", () => {
    const { props } = renderTopbar({ theme: "light" });
    openPreferences();
    const storageAttempts = countStorage();
    fireEvent.click(screen.getByRole("menuitemradio", { name: "System" }));
    expect(props.setTheme).toHaveBeenCalledTimes(1);
    expect(props.setTheme).toHaveBeenCalledWith("system");
    expect(storageAttempts).toEqual([]);
  });

  it("TP2c-Persist — clicking Light calls setTheme('light') once and makes zero Storage attempts", () => {
    const { props } = renderTopbar({ theme: "dark" });
    openPreferences();
    const storageAttempts = countStorage();
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Light" }));
    expect(props.setTheme).toHaveBeenCalledTimes(1);
    expect(props.setTheme).toHaveBeenCalledWith("light");
    expect(storageAttempts).toEqual([]);
  });

  it("TP3-Persist — clicking Compact calls setDensity('compact') once and makes zero Storage attempts", () => {
    const { props } = renderTopbar({ density: "comfortable" });
    openPreferences();
    const storageAttempts = countStorage();
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Compact" }));
    expect(props.setDensity).toHaveBeenCalledTimes(1);
    expect(props.setDensity).toHaveBeenCalledWith("compact");
    expect(storageAttempts).toEqual([]);
  });

  it("TP3b-Persist — clicking Comfortable calls setDensity('comfortable') once and makes zero Storage attempts", () => {
    const { props } = renderTopbar({ density: "compact" });
    openPreferences();
    const storageAttempts = countStorage();
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Comfortable" }));
    expect(props.setDensity).toHaveBeenCalledTimes(1);
    expect(props.setDensity).toHaveBeenCalledWith("comfortable");
    expect(storageAttempts).toEqual([]);
  });

  // ---- Appearance status slot (CP-APPEARANCE-01) -----------------------

  it("TP-STATUS-1 — appearanceStatus renders immediately after the premium badge, before the appearance popover", () => {
    renderTopbar({
      premiumBadge: <span data-testid="premium-tier-badge">Premium (stub)</span>,
      appearanceStatus: <button type="button" data-testid="appearance-status">Not saved</button>,
    });
    const controls = document.querySelector(".topbar-controls")!;
    const children = Array.from(controls.children);
    const badge = screen.getByTestId("premium-tier-badge");
    const status = screen.getByTestId("appearance-status");
    expect(children.indexOf(status)).toBe(children.indexOf(badge) + 1);
    expect(status.nextElementSibling?.classList.contains("topbar-pref")).toBe(true);
  });

  it("TP-STATUS-2 — without appearanceStatus (or when it renders nothing) the controls are unchanged", () => {
    const Empty = () => null;
    const { container, unmount } = renderTopbar({ premiumBadge: <span data-testid="premium-tier-badge">P</span> });
    const before = container.querySelector(".topbar")!.outerHTML;
    unmount();
    const second = renderTopbar({ premiumBadge: <span data-testid="premium-tier-badge">P</span>, appearanceStatus: <Empty /> });
    expect(second.container.querySelector(".topbar")!.outerHTML).toBe(before);
  });
});
