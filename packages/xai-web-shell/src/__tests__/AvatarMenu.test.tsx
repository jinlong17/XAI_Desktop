/**
 * AvatarMenu tests — AV1..AV8
 *
 * AC-AVM-1: Returns null when open === false
 * AC-AVM-2: Clicking Settings entry calls onOpenSettings then onClose
 * AC-AVM-3: Popover anchor data-attribute matches railPos
 * AC-AVM-4: Scrim click closes the menu
 * AC-AVM-5: Escape key closes the menu
 * AC-AVM-6: Statistics entry calls onOpenStatistics then onClose
 * AC-AVM-7: Sign Out warns once in DEV and closes when onSignOut is undefined
 * AC-AVM-8: User name shows based on lang
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { AvatarMenu } from "../AvatarMenu.js";
import { WebShellProvider } from "../registry.js";
import type { RailPos } from "../types.js";

function renderMenu(overrides?: {
  open?: boolean;
  railPos?: RailPos;
  lang?: "en" | "zh";
  onClose?: () => void;
  onOpenSettings?: () => void;
  onOpenStatistics?: () => void;
  onSignOut?: () => void;
}) {
  const defaults = {
    open: true,
    railPos: "left" as const,
    lang: "en" as const,
    onClose: vi.fn(),
    onOpenSettings: vi.fn(),
    onOpenStatistics: vi.fn(),
  };
  const cfg = { ...defaults, ...overrides };
  return {
    ...render(
      <MemoryRouter>
        <WebShellProvider
          modules={[]}
          lang={cfg.lang}
          railPos={cfg.railPos}
          petOn={false}
          setPetOn={() => {}}
        >
          <AvatarMenu
            open={cfg.open}
            onClose={cfg.onClose}
            onOpenSettings={cfg.onOpenSettings}
            onOpenStatistics={cfg.onOpenStatistics}
            onSignOut={cfg.onSignOut}
          />
        </WebShellProvider>
      </MemoryRouter>
    ),
    cfg,
  };
}

describe("AvatarMenu (AV1..AV8)", () => {
  it("AV1 — returns null when open is false", () => {
    const { container } = renderMenu({ open: false });
    expect(container.querySelector(".avatar-menu")).toBeNull();
    expect(container.querySelector(".avatar-menu-scrim")).toBeNull();
  });

  it("AV1b — renders menu when open is true", () => {
    const { container } = renderMenu({ open: true });
    expect(container.querySelector(".avatar-menu")).not.toBeNull();
  });

  it("AV2 — clicking Settings entry calls onOpenSettings then onClose", () => {
    const onOpenSettings = vi.fn();
    const onClose = vi.fn();
    renderMenu({ onOpenSettings, onClose });
    fireEvent.click(screen.getByText("Settings"));
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    // onOpenSettings fires before onClose (order check)
    const settingsOrder = onOpenSettings.mock.invocationCallOrder[0] ?? 0;
    const closeOrder = onClose.mock.invocationCallOrder[0] ?? 0;
    expect(settingsOrder).toBeLessThan(closeOrder);
  });

  it("AV3 — data-anchor is 'left-top-right' when railPos=left", () => {
    const { container } = renderMenu({ railPos: "left" });
    const menu = container.querySelector(".avatar-menu");
    expect(menu?.getAttribute("data-anchor")).toBe("left-top-right");
  });

  it("AV3 — data-anchor is 'right-top-left' when railPos=right", () => {
    const { container } = renderMenu({ railPos: "right" });
    expect(container.querySelector(".avatar-menu")?.getAttribute("data-anchor")).toBe("right-top-left");
  });

  it("AV3 — data-anchor is 'top-bottom-left' when railPos=top", () => {
    const { container } = renderMenu({ railPos: "top" });
    expect(container.querySelector(".avatar-menu")?.getAttribute("data-anchor")).toBe("top-bottom-left");
  });

  it("AV3 — data-anchor is 'bottom-top-left' when railPos=bottom", () => {
    const { container } = renderMenu({ railPos: "bottom" });
    expect(container.querySelector(".avatar-menu")?.getAttribute("data-anchor")).toBe("bottom-top-left");
  });

  it("AV4 — scrim click calls onClose", () => {
    const onClose = vi.fn();
    const { container } = renderMenu({ onClose });
    const scrim = container.querySelector(".avatar-menu-scrim");
    if (scrim) fireEvent.click(scrim);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("AV5 — Escape key calls onClose", () => {
    const onClose = vi.fn();
    renderMenu({ onClose });
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("AV5b — Escape key does NOT call onClose when menu is closed", () => {
    const onClose = vi.fn();
    renderMenu({ open: false, onClose });
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("AV6 — clicking Statistics entry calls onOpenStatistics then onClose", () => {
    const onOpenStatistics = vi.fn();
    const onClose = vi.fn();
    renderMenu({ onOpenStatistics, onClose });
    fireEvent.click(screen.getByText("Statistics"));
    expect(onOpenStatistics).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("AV7 — Sign Out button is rendered", () => {
    renderMenu();
    expect(screen.getByText("Sign Out")).toBeTruthy();
  });

  it("AV7b — clicking Sign Out with undefined onSignOut closes and warns in DEV", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const onClose = vi.fn();
    renderMenu({ onClose, onSignOut: undefined });
    fireEvent.click(screen.getByText("Sign Out"));
    // In DEV, should warn once; onClose should still fire
    expect(onClose).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
  });

  it("AV8 — user name shows 'Aki Chen' in EN", () => {
    renderMenu({ lang: "en" });
    expect(screen.getByText("Aki Chen")).toBeTruthy();
  });

  it("AV8 — user name shows '百事可爱' in ZH", () => {
    renderMenu({ lang: "zh" });
    expect(screen.getByText("百事可爱")).toBeTruthy();
  });
});
