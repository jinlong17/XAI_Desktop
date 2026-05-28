/**
 * NF1..NF9 — notificationsPane tests (test.md §3 P2)
 */
import { beforeEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { notificationsPane } from "../panes/notificationsPane.js";
import { getPref } from "@repo/plugin-web-storage";

const state = vi.hoisted(() => ({
  runtimeSnapshot: {
    status: "permission-required" as const,
    runtimeProfile: "desktop-phase1-offline",
    permissionState: "prompt" as const,
    adapterAvailable: true,
    unsupported: { task: 0, calendar: 0 },
    lastUpdatedAt: "2026-05-28T00:00:00.000Z",
  },
}));

vi.mock("@repo/desktop-native-notifications-reminders/web", () => ({
  requestDesktopNotificationPermission: vi.fn(),
  useDesktopNotificationRuntimeSnapshot: () => state.runtimeSnapshot,
}));

describe("notificationsPane", () => {
  beforeEach(() => {
    state.runtimeSnapshot = {
      status: "permission-required",
      runtimeProfile: "desktop-phase1-offline",
      permissionState: "prompt",
      adapterAvailable: true,
      unsupported: { task: 0, calendar: 0 },
      lastUpdatedAt: "2026-05-28T00:00:00.000Z",
    };
  });

  it("NF1: renders without error", () => {
    const { container } = render(notificationsPane.render({ lang: "en" }));
    expect(container.querySelector(".notif-pane")).toBeTruthy();
  });

  it("NF2: bilingual — EN labels", () => {
    render(notificationsPane.render({ lang: "en" }));
    expect(screen.getByText("Enable notifications")).toBeInTheDocument();
    expect(screen.getByText("Enable quiet hours")).toBeInTheDocument();
  });

  it("NF3: bilingual — ZH labels", () => {
    render(notificationsPane.render({ lang: "zh" }));
    expect(screen.getByText("启用通知")).toBeInTheDocument();
    expect(screen.getByText("启用勿扰")).toBeInTheDocument();
  });

  it("NF4: time-range inputs are hidden when quiet=false (default)", () => {
    const { container } = render(notificationsPane.render({ lang: "en" }));
    const timeInputs = container.querySelectorAll('input[type="time"]');
    expect(timeInputs.length).toBe(0);
  });

  it("NF5: enabling quiet hours shows time inputs", () => {
    const { container } = render(notificationsPane.render({ lang: "en" }));
    const quietToggle = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Enable quiet hours"]',
    );
    expect(quietToggle).not.toBeNull();
    fireEvent.click(quietToggle!);
    const timeInputs = container.querySelectorAll('input[type="time"]');
    expect(timeInputs.length).toBe(2);
  });

  it("NF6: toggling enabled toggle flips xai_pref_notif_enabled pref", () => {
    const { container } = render(notificationsPane.render({ lang: "en" }));
    expect(getPref("xai_pref_notif_enabled")).toBe(true);
    const toggle = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Enable notifications"]',
    );
    fireEvent.click(toggle!);
    expect(getPref("xai_pref_notif_enabled")).toBe(false);
  });

  it("NF7: sound select has 5 options (none/subtle/chime/bell/pop)", () => {
    const { container } = render(notificationsPane.render({ lang: "en" }));
    const sel = container.querySelector<HTMLSelectElement>(
      'select[aria-label="Sound"]',
    );
    expect(sel).not.toBeNull();
    expect(sel!.options.length).toBe(5);
  });

  it("NF8: changing sound select persists xai_pref_notif_done_sound", () => {
    const { container } = render(notificationsPane.render({ lang: "en" }));
    const sel = container.querySelector<HTMLSelectElement>(
      'select[aria-label="Sound"]',
    );
    fireEvent.change(sel!, { target: { value: "chime" } });
    expect(getPref("xai_pref_notif_done_sound")).toBe("chime");
  });

  it("NF9: pane id, icon, i18nKey are correct", () => {
    expect(notificationsPane.id).toBe("notifications");
    expect(notificationsPane.icon).toBe("bell");
    expect(notificationsPane.i18nKey).toBe("settings.notifications");
  });

  it("NF10: calendar toggle persists xai_pref_notif_push_calendar", () => {
    const { container } = render(notificationsPane.render({ lang: "en" }));
    const toggle = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Calendar reminder"]',
    );
    expect(getPref("xai_pref_notif_push_calendar")).toBe(true);
    fireEvent.click(toggle!);
    expect(getPref("xai_pref_notif_push_calendar")).toBe(false);
  });

  it("NF11: renders denied desktop-status copy", () => {
    state.runtimeSnapshot = {
      status: "denied",
      runtimeProfile: "desktop-phase1-offline",
      permissionState: "denied",
      adapterAvailable: true,
      unsupported: { task: 0, calendar: 0 },
      lastUpdatedAt: "2026-05-28T00:00:00.000Z",
    };
    render(notificationsPane.render({ lang: "en" }));
    expect(
      screen.getByText("Permission denied. Enable notifications in macOS System Settings."),
    ).toBeInTheDocument();
  });

  it("NF12: renders unsupported desktop-status copy", () => {
    state.runtimeSnapshot = {
      status: "unsupported",
      runtimeProfile: "web-live",
      permissionState: "unknown",
      adapterAvailable: false,
      unsupported: { task: 2, calendar: 1 },
      lastUpdatedAt: "2026-05-28T00:00:00.000Z",
    };
    render(notificationsPane.render({ lang: "en" }));
    expect(
      screen.getByText("Desktop notification bridge unavailable in this runtime."),
    ).toBeInTheDocument();
  });
});
