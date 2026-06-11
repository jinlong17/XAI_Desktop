// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import { flushSync } from "react-dom";
import { DesktopNativeNotificationsBridge } from "./bridge";

const state = vi.hoisted(() => ({
  prefs: new Map<string, unknown>(),
  sendNotification: vi.fn(),
  refreshSnapshot: vi.fn(async () => ({
    status: "ready",
    runtimeProfile: "desktop-phase1-offline",
    permissionState: "granted",
    adapterAvailable: true,
    unsupported: { task: 0, calendar: 0 },
    lastUpdatedAt: "2026-05-28T00:00:00.000Z",
  })),
  updateUnsupported: vi.fn(),
  onWebEvent: vi.fn(() => () => undefined),
  projectTaskEntries: vi.fn(() => []),
  projectCalendarEntries: vi.fn(() => []),
}));

vi.mock("@repo/plugin-web-storage", () => ({
  getPref: (key: string) => state.prefs.get(key),
}));

vi.mock("@repo/plugin-web-tasks", () => ({
  projectDesktopTaskReminderEntries: (...args: unknown[]) => state.projectTaskEntries(...args),
}));

vi.mock("@repo/plugin-web-calendar", () => ({
  SAMPLE_EVENTS: {},
  projectDesktopCalendarReminderEntries: (...args: unknown[]) => state.projectCalendarEntries(...args),
}));

vi.mock("@repo/xai-web-event-bus", () => ({
  onWebEvent: (...args: unknown[]) => state.onWebEvent(...args),
}));

vi.mock("./runtime", () => ({
  getDesktopNotificationRuntimeSnapshot: () => ({
    status: "ready",
    runtimeProfile: "desktop-phase1-offline",
    permissionState: "granted",
    adapterAvailable: true,
    unsupported: { task: 0, calendar: 0 },
    lastUpdatedAt: "2026-05-28T00:00:00.000Z",
  }),
  refreshDesktopNotificationRuntimeSnapshot: (...args: unknown[]) => state.refreshSnapshot(...args),
  subscribeDesktopNotificationRuntimeSnapshot: () => () => undefined,
  updateDesktopNotificationUnsupportedCounts: (...args: unknown[]) => state.updateUnsupported(...args),
}));

describe("DesktopNativeNotificationsBridge delivery policy", () => {
  let root: Root | null = null;
  let container: HTMLDivElement | null = null;

  beforeEach(() => {
    state.sendNotification.mockReset();
    state.refreshSnapshot.mockClear();
    state.updateUnsupported.mockReset();
    state.onWebEvent.mockClear();
    state.projectTaskEntries.mockReset();
    state.projectCalendarEntries.mockReset();

    state.prefs.clear();
    state.prefs.set("xai_pref_notif_enabled", true);
    state.prefs.set("xai_pref_notif_push_task", false);
    state.prefs.set("xai_pref_notif_push_pomo", false);
    state.prefs.set("xai_pref_notif_push_calendar", true);
    state.prefs.set("xai_pref_notif_quiet", false);
    state.prefs.set("xai_pref_notif_quiet_start", "22:00");
    state.prefs.set("xai_pref_notif_quiet_end", "07:00");
    state.prefs.set("xai_pref_more_default_rem_all", "none");
    state.prefs.set("xai_pref_more_default_rem_due", "on_time");
    state.prefs.set("xai_task_cols", []);

    state.projectTaskEntries.mockReturnValue([
      {
        status: "candidate",
        occurrenceKey: "task-1",
        taskId: "t-1",
        title: "Task A",
        triggerAtIso: "2026-05-28T00:00:00.000Z",
        allDay: true,
      },
    ]);
    state.projectCalendarEntries.mockReturnValue([
      {
        status: "candidate",
        occurrenceKey: "cal-1",
        day: 28,
        title: "Calendar A",
        triggerAtIso: "2026-05-28T00:00:00.000Z",
      },
    ]);

    window.__XAI_DESKTOP_NOTIFICATION__ = {
      isPermissionGranted: async () => true,
      requestPermission: async () => "granted",
      sendNotification: state.sendNotification,
    };
  });

  afterEach(() => {
    if (root && container) {
      root?.unmount();
    }
    root = null;
    container = null;
    delete window.__XAI_DESKTOP_NOTIFICATION__;
  });

  it("delivers calendar reminders even when task source is disabled", async () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    flushSync(() => {
      root?.render(
        <DesktopNativeNotificationsBridge>
          <div>child</div>
        </DesktopNativeNotificationsBridge>,
      );
    });
    for (let index = 0; index < 40; index += 1) {
      if (state.sendNotification.mock.calls.length > 0) {
        break;
      }
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 0);
      });
    }

    expect(state.sendNotification).toHaveBeenCalledTimes(1);
    expect(state.sendNotification).toHaveBeenCalledWith({
      title: "Calendar reminder",
      body: "Calendar A",
      tag: "calendar:28:cal-1",
    });
  });
});
