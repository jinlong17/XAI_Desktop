/**
 * Topbar tests — TP1..TP6
 *
 * AC-TOPBAR-1: EN/中文 segment sets lang via setLang prop
 * AC-TOPBAR-2: Light/Dark/System segment sets theme via setTheme prop
 * AC-TOPBAR-3: Comfortable/Compact segment sets density via setDensity prop
 * AC-TOPBAR-4: Settings gear icon click calls onOpenSettings()
 * AC-TOPBAR-5: Search input renders with placeholder (i18n: common.search_placeholder)
 * AC-TOPBAR-6: ⌘K kbd hint is rendered (decorative; no handler)
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

describe("Topbar", () => {
  it("TP1 — EN/中文 segment: clicking 中文 calls setLang('zh')", () => {
    const { props } = renderTopbar({ lang: "en" });
    fireEvent.click(screen.getByText("中文"));
    expect(props.setLang).toHaveBeenCalledWith("zh");
  });

  it("TP1b — clicking EN calls setLang('en')", () => {
    const { props } = renderTopbar({ lang: "zh" });
    fireEvent.click(screen.getByText("EN"));
    expect(props.setLang).toHaveBeenCalledWith("en");
  });

  it("TP1c — active lang button has aria-selected=true", () => {
    renderTopbar({ lang: "en" });
    const enBtn = screen.getByText("EN");
    expect(enBtn.getAttribute("aria-selected")).toBe("true");
  });

  it("TP2 — Dark button calls setTheme('dark')", () => {
    const { props } = renderTopbar({ theme: "light" });
    const darkBtn = screen.getByTitle("Dark");
    fireEvent.click(darkBtn);
    expect(props.setTheme).toHaveBeenCalledWith("dark");
  });

  it("TP2b — System button calls setTheme('system')", () => {
    const { props } = renderTopbar({ theme: "light" });
    const sysBtn = screen.getByTitle("System");
    fireEvent.click(sysBtn);
    expect(props.setTheme).toHaveBeenCalledWith("system");
  });

  it("TP2c — active theme button has aria-selected=true", () => {
    renderTopbar({ theme: "dark" });
    const darkBtn = screen.getByTitle("Dark");
    expect(darkBtn.getAttribute("aria-selected")).toBe("true");
  });

  it("TP3 — Compact button calls setDensity('compact')", () => {
    const { props } = renderTopbar({ density: "comfortable" });
    fireEvent.click(screen.getByText("Compact"));
    expect(props.setDensity).toHaveBeenCalledWith("compact");
  });

  it("TP3b — active density button has aria-selected=true", () => {
    renderTopbar({ density: "comfortable" });
    expect(screen.getByText("Comfortable").getAttribute("aria-selected")).toBe("true");
  });

  it("TP4 — Settings gear icon click calls onOpenSettings", () => {
    const { props } = renderTopbar();
    // The settings button has title from i18n nav.settings = "Settings"
    fireEvent.click(screen.getByTitle("Settings"));
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
});
