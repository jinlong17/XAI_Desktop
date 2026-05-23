import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SettingsModule, paneRegistry } from "../index.js";

/**
 * M1..M10 — SettingsModule composition.
 */
describe("<SettingsModule>", () => {
  it("M1: renders root .module.module-settings > .settings-shell.panel", () => {
    render(<SettingsModule lang="en" />);
    expect(document.querySelector(".module.module-settings")).not.toBeNull();
    expect(
      document.querySelector(".module-settings .settings-shell.panel"),
    ).not.toBeNull();
  });

  it("M2: renders 13 sidebar list-row entries", () => {
    render(<SettingsModule lang="en" />);
    const rows = document.querySelectorAll(".module-settings .list-row");
    expect(rows.length).toBe(13);
  });

  it("M3: sidebar entries grouped into 4 .settings-group containers", () => {
    render(<SettingsModule lang="en" />);
    const groups = document.querySelectorAll(".module-settings .settings-group");
    expect(groups.length).toBe(4);
  });

  it("M4: default active pane is 'account' (data-active=true on first row)", () => {
    render(<SettingsModule lang="en" />);
    const rows = document.querySelectorAll(".module-settings .list-row");
    expect(rows[0]?.getAttribute("data-active")).toBe("true");
  });

  it("M5: clicking the appearance entry switches active", () => {
    render(<SettingsModule lang="en" />);
    const rows = Array.from(
      document.querySelectorAll(".module-settings .list-row"),
    ) as HTMLElement[];
    // appearance is index 6 in the paneRegistry order (Group 2, item 5 of 6)
    const appearanceIdx = paneRegistry.findIndex((p) => p.id === "appearance");
    expect(appearanceIdx).toBeGreaterThanOrEqual(0);
    fireEvent.click(rows[appearanceIdx]!);
    expect(rows[appearanceIdx]!.getAttribute("data-active")).toBe("true");
    expect(rows[0]!.getAttribute("data-active")).toBe("false");
  });

  it("M6: detail container renders the active pane's render output", () => {
    render(<SettingsModule lang="en" />);
    const detail = document.querySelector(".module-settings .settings-detail");
    expect(detail?.getAttribute("data-pane")).toBe("account");
    expect(detail?.textContent).toContain("This pane is not yet available.");
  });

  it("M7: clicking through all 13 entries switches active each time without errors", () => {
    render(<SettingsModule lang="en" />);
    const rows = Array.from(
      document.querySelectorAll(".module-settings .list-row"),
    ) as HTMLElement[];
    for (let i = 0; i < rows.length; i++) {
      fireEvent.click(rows[i]!);
      expect(rows[i]!.getAttribute("data-active")).toBe("true");
    }
  });

  it("M8: EN labels — first sidebar entry is 'Account'", () => {
    render(<SettingsModule lang="en" />);
    expect(screen.getByText("Account")).toBeInTheDocument();
  });

  it("M9: switching lang en → zh re-renders ZH labels", () => {
    const { rerender } = render(<SettingsModule lang="en" />);
    expect(screen.getByText("Account")).toBeInTheDocument();
    rerender(<SettingsModule lang="zh" />);
    expect(screen.getByText("账户")).toBeInTheDocument();
  });

  it("M10: settings title shows I18N.<lang>.settings.title", () => {
    render(<SettingsModule lang="en" />);
    expect(
      document.querySelector(".module-settings .settings-h")?.textContent,
    ).toBe("Settings");
  });
});
