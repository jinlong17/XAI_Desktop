import type { DisplayedMonth } from "./types.js";
import type { CalEventsByDay } from "./internal/sampleEvents.js";

export type DesktopCalendarReminderUnsupportedReason =
  | "event_has_no_time"
  | "outside_active_month_dataset";

export type DesktopCalendarReminderEntry =
  | {
      status: "candidate";
      occurrenceKey: string;
      day: number;
      title: string;
      triggerAtIso: string;
    }
  | {
      status: "unsupported";
      day: number;
      title: string;
      reason: DesktopCalendarReminderUnsupportedReason;
    };

function parseTime(raw: string): { hour: number; minute: number } | null {
  const match = raw.match(/^(\d{1,2}):(\d{2})$/);
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
  return { hour, minute };
}

function dayLimit(displayedMonth: DisplayedMonth): number {
  return new Date(displayedMonth.year, displayedMonth.month, 0).getDate();
}

function eventTitle(day: number, index: number, titleEn: string, titleZh: string): string {
  if (titleEn.trim()) {
    return titleEn;
  }
  if (titleZh.trim()) {
    return titleZh;
  }
  return `Calendar reminder ${day}-${index + 1}`;
}

export function projectDesktopCalendarReminderEntries(
  displayedMonth: DisplayedMonth,
  eventsByDay: CalEventsByDay,
): DesktopCalendarReminderEntry[] {
  const limit = dayLimit(displayedMonth);
  const output: DesktopCalendarReminderEntry[] = [];

  for (const [rawDay, events] of Object.entries(eventsByDay)) {
    const day = Number.parseInt(rawDay, 10);
    if (!Number.isInteger(day) || day < 1 || day > limit) {
      for (const event of events) {
        output.push({
          status: "unsupported",
          day: Number.isInteger(day) ? day : -1,
          title: eventTitle(day, 0, event.t.en, event.t.zh),
          reason: "outside_active_month_dataset",
        });
      }
      continue;
    }

    for (let index = 0; index < events.length; index += 1) {
      const event = events[index];
      if (!event) {
        continue;
      }
      const title = eventTitle(day, index, event.t.en, event.t.zh);

      if (!event.time) {
        output.push({
          status: "unsupported",
          day,
          title,
          reason: "event_has_no_time",
        });
        continue;
      }

      const time = parseTime(event.time);
      if (!time) {
        output.push({
          status: "unsupported",
          day,
          title,
          reason: "event_has_no_time",
        });
        continue;
      }

      const triggerAt = new Date(
        displayedMonth.year,
        displayedMonth.month - 1,
        day,
        time.hour,
        time.minute,
        0,
        0,
      );

      const triggerAtIso = triggerAt.toISOString();
      output.push({
        status: "candidate",
        occurrenceKey: `${displayedMonth.year}-${displayedMonth.month}-${day}-${index + 1}`,
        day,
        title,
        triggerAtIso,
      });
    }
  }

  return output;
}
