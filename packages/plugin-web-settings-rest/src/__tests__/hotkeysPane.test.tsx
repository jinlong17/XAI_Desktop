/**
 * HK1..HK4 — hotkeysPane tests (desktop quick-open + read-only web table)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { hotkeysPane } from "../panes/hotkeysPane.js";

const desktopHotkeyMock = vi.hoisted(() => ({
  snapshot: {
    preference: {
      presetId: "default",
      accelerator: "CommandOrControl+Shift+Space",
      enabled: true,
    },
    runtime: {
      state: "ready",
      label: "Shortcut active",
      recoverable: true,
    },
  },
  setPreference: vi.fn(async () => undefined),
}));

vi.mock("@repo/desktop-global-hotkey-quick-open/web", () => ({
  useDesktopQuickOpenSnapshot: () => desktopHotkeyMock.snapshot,
  setDesktopQuickOpenPreference: desktopHotkeyMock.setPreference,
}));

describe("hotkeysPane", () => {
  beforeEach(() => {
    desktopHotkeyMock.setPreference.mockClear();
    desktopHotkeyMock.snapshot = {
      preference: {
        presetId: "default",
        accelerator: "CommandOrControl+Shift+Space",
        enabled: true,
      },
      runtime: {
        state: "ready",
        label: "Shortcut active",
        recoverable: true,
      },
    };
  });

  it("HK1: renders 10 rows in the web hotkeys list", () => {
    const { container } = render(hotkeysPane.render({ lang: "en" }));
    const rows = container.querySelectorAll(".hk-row");
    expect(rows.length).toBe(10);
  });

  it("HK2: renders desktop quick-open section with status and shortcut", () => {
    render(hotkeysPane.render({ lang: "en" }));
    expect(screen.getByText("Desktop quick open")).toBeInTheDocument();
    expect(screen.getByText("Ready")).toBeInTheDocument();
    expect(screen.getByText("CommandOrControl+Shift+Space")).toBeInTheDocument();
  });

  it("HK3: changing preset invokes desktop preference action", async () => {
    render(hotkeysPane.render({ lang: "en" }));
    const select = screen.getByLabelText("Preset");
    fireEvent.change(select, { target: { value: "alt-1" } });
    await waitFor(() => {
      expect(desktopHotkeyMock.setPreference).toHaveBeenCalledWith({
        presetId: "alt-1",
        enabled: true,
      });
    });
  });

  it("HK4: bilingual — ZH shows desktop quick-open labels", () => {
    desktopHotkeyMock.snapshot.runtime.state = "conflict";
    render(hotkeysPane.render({ lang: "zh" }));
    expect(screen.getByText("桌面快速唤起")).toBeInTheDocument();
    expect(screen.getByText("冲突")).toBeInTheDocument();
    expect(screen.getByText("用于显示或聚焦桌面主窗口的全局快捷键。")).toBeInTheDocument();
  });
});
