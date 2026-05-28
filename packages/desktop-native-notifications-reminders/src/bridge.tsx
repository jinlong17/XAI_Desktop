import { useEffect, useState, type PropsWithChildren, type ReactElement } from "react";
import { getPref } from "@repo/plugin-web-storage";
import {
  SAMPLE_EVENTS,
  projectDesktopCalendarReminderEntries,
  type DisplayedMonth,
} from "@repo/plugin-web-calendar";
import {
  projectDesktopTaskReminderEntries,
  type TaskCol,
  type TaskDefaultReminderAll,
  type TaskDefaultReminderDue,
} from "@repo/plugin-web-tasks";
import { onWebEvent } from "@repo/xai-web-event-bus";
import type {
  DesktopNotificationRuntimeSnapshot,
  DesktopNotificationSource,
  DesktopNotificationRuntimeAdapter,
} from "./types";
import {
  getDesktopNotificationRuntimeSnapshot,
  refreshDesktopNotificationRuntimeSnapshot,
  subscribeDesktopNotificationRuntimeSnapshot,
  updateDesktopNotificationUnsupportedCounts,
} from "./runtime";

const RUNTIME_REFRESH_MS = 30_000;

interface NotificationPrefs {
  enabled: boolean;
  pushTask: boolean;
  pushPomodoro: boolean;
  pushCalendar: boolean;
  quiet: boolean;
  quietStart: string;
  quietEnd: string;
  defaultReminderAll: TaskDefaultReminderAll;
  defaultReminderDue: TaskDefaultReminderDue;
}

function readAdapter(): DesktopNotificationRuntimeAdapter | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.__XAI_DESKTOP_NOTIFICATION__ ?? null;
}

function readPrefs(): NotificationPrefs {
  return {
    enabled: Boolean(getPref("xai_pref_notif_enabled")),
    pushTask: Boolean(getPref("xai_pref_notif_push_task")),
    pushPomodoro: Boolean(getPref("xai_pref_notif_push_pomo")),
    pushCalendar: Boolean(getPref("xai_pref_notif_push_calendar")),
    quiet: Boolean(getPref("xai_pref_notif_quiet")),
    quietStart: String(getPref("xai_pref_notif_quiet_start") ?? "22:00"),
    quietEnd: String(getPref("xai_pref_notif_quiet_end") ?? "07:00"),
    defaultReminderAll: (getPref("xai_pref_more_default_rem_all") as TaskDefaultReminderAll | undefined) ?? "none",
    defaultReminderDue: (getPref("xai_pref_more_default_rem_due") as TaskDefaultReminderDue | undefined) ?? "on_time",
  };
}

function parseClock(value: string): number | null {
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return null;
  }
  const hour = Number.parseInt(match[1] ?? "", 10);
  const minute = Number.parseInt(match[2] ?? "", 10);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    return null;
  }
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }
  return hour * 60 + minute;
}

function inQuietHours(now: Date, quietStart: string, quietEnd: string): boolean {
  const start = parseClock(quietStart);
  const end = parseClock(quietEnd);
  if (start === null || end === null) {
    return false;
  }

  const current = now.getHours() * 60 + now.getMinutes();
  if (start === end) {
    return true;
  }
  if (start < end) {
    return current >= start && current < end;
  }
  return current >= start || current < end;
}

function sourceEnabled(source: DesktopNotificationSource, prefs: NotificationPrefs): boolean {
  if (source === "task") {
    return prefs.pushTask;
  }
  if (source === "pomodoro") {
    return prefs.pushPomodoro;
  }
  return prefs.pushCalendar;
}

function shouldDeliver(
  source: DesktopNotificationSource,
  prefs: NotificationPrefs,
  snapshot: DesktopNotificationRuntimeSnapshot,
  now: Date,
): boolean {
  if (!prefs.enabled) {
    return false;
  }
  if (!sourceEnabled(source, prefs)) {
    return false;
  }
  if (prefs.quiet && inQuietHours(now, prefs.quietStart, prefs.quietEnd)) {
    return false;
  }
  return snapshot.status === "ready";
}

function readTaskCols(): TaskCol[] {
  const raw = getPref("xai_task_cols") as unknown;
  return Array.isArray(raw) ? (raw as TaskCol[]) : [];
}

function currentDisplayedMonth(now: Date): DisplayedMonth {
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

async function sendIfDue(
  adapter: DesktopNotificationRuntimeAdapter,
  deliveredKeys: Set<string>,
  occurrenceKey: string,
  triggerAtIso: string,
  title: string,
  body: string,
  tag: string,
  now: Date,
): Promise<void> {
  const triggerAt = new Date(triggerAtIso);
  if (Number.isNaN(triggerAt.getTime())) {
    return;
  }
  if (triggerAt > now) {
    return;
  }
  if (deliveredKeys.has(occurrenceKey)) {
    return;
  }

  deliveredKeys.add(occurrenceKey);
  await adapter.sendNotification({ title, body, tag });
}

export function useDesktopNotificationRuntimeSnapshot(): DesktopNotificationRuntimeSnapshot {
  const [snapshot, setSnapshot] = useState<DesktopNotificationRuntimeSnapshot>(
    getDesktopNotificationRuntimeSnapshot(),
  );

  useEffect(() => {
    const unsubscribe = subscribeDesktopNotificationRuntimeSnapshot(setSnapshot);
    return unsubscribe;
  }, []);

  return snapshot;
}

export function DesktopNativeNotificationsBridge({
  children,
}: PropsWithChildren): ReactElement {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const deliveredKeys = new Set<string>();

    const pumpCandidates = async (): Promise<void> => {
      const snapshot = await refreshDesktopNotificationRuntimeSnapshot();
      const prefs = readPrefs();
      const now = new Date();
      const adapter = readAdapter();

      const taskEntries = projectDesktopTaskReminderEntries(readTaskCols(), {
        now,
        defaultReminderAll: prefs.defaultReminderAll,
        defaultReminderDue: prefs.defaultReminderDue,
      });

      const calendarEntries = projectDesktopCalendarReminderEntries(
        currentDisplayedMonth(now),
        SAMPLE_EVENTS,
      );

      const taskUnsupported = taskEntries.filter(
        (entry) => entry.status === "unsupported",
      ).length;
      const calendarUnsupported = calendarEntries.filter(
        (entry) => entry.status === "unsupported",
      ).length;
      updateDesktopNotificationUnsupportedCounts({
        task: taskUnsupported,
        calendar: calendarUnsupported,
      });

      if (!adapter || !shouldDeliver("task", prefs, snapshot, now)) {
        return;
      }

      for (const entry of taskEntries) {
        if (entry.status !== "candidate") {
          continue;
        }

        await sendIfDue(
          adapter,
          deliveredKeys,
          entry.occurrenceKey,
          entry.triggerAtIso,
          "Task reminder",
          entry.title,
          `task:${entry.taskId}`,
          now,
        );
      }

      if (!shouldDeliver("calendar", prefs, snapshot, now)) {
        return;
      }

      for (const entry of calendarEntries) {
        if (entry.status !== "candidate") {
          continue;
        }

        await sendIfDue(
          adapter,
          deliveredKeys,
          entry.occurrenceKey,
          entry.triggerAtIso,
          "Calendar reminder",
          entry.title,
          `calendar:${entry.day}:${entry.occurrenceKey}`,
          now,
        );
      }
    };

    const unsubscribePomodoro = onWebEvent(
      "web:pomodoro:session-finished",
      async (payload) => {
        const snapshot = await refreshDesktopNotificationRuntimeSnapshot();
        const prefs = readPrefs();
        const now = new Date();
        const adapter = readAdapter();
        if (!adapter || !shouldDeliver("pomodoro", prefs, snapshot, now)) {
          return;
        }

        const occurrenceKey = `pomodoro:${payload.finishedAt}:${payload.mode}:${payload.durationMs}`;
        if (deliveredKeys.has(occurrenceKey)) {
          return;
        }

        deliveredKeys.add(occurrenceKey);
        await adapter.sendNotification({
          title: "Pomodoro complete",
          body: payload.mode === "focus" ? "Focus session finished" : "Break finished",
          tag: occurrenceKey,
        });
      },
    );

    void pumpCandidates();
    const timer = window.setInterval(() => {
      void pumpCandidates();
    }, RUNTIME_REFRESH_MS);

    return () => {
      unsubscribePomodoro();
      window.clearInterval(timer);
    };
  }, []);

  return <>{children}</>;
}
