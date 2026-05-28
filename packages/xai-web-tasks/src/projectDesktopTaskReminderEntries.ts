import type { TaskCol, TaskCard } from "./types.js";

export type TaskDefaultReminderAll = "none" | "9am" | "day_before";
export type TaskDefaultReminderDue = "none" | "on_time" | "5min" | "15min";

export type DesktopTaskReminderUnsupportedReason =
  | "missing_absolute_date"
  | "relative_label_only"
  | "date_parse_failed"
  | "no_public_due_time";

export type DesktopTaskReminderEntry =
  | {
      status: "candidate";
      occurrenceKey: string;
      taskId: string;
      title: string;
      triggerAtIso: string;
      allDay: true;
    }
  | {
      status: "unsupported";
      taskId: string;
      reason: DesktopTaskReminderUnsupportedReason;
    };

const MONTH_SHORT_TO_INDEX: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

function parseAbsoluteMonthDay(raw: string): { month: number; day: number } | null {
  const numeric = raw.match(/^\s*(\d{1,2})\/(\d{1,2})\s*$/);
  if (numeric) {
    const month = Number.parseInt(numeric[1] ?? "", 10);
    const day = Number.parseInt(numeric[2] ?? "", 10);
    if (Number.isInteger(month) && Number.isInteger(day) && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { month, day };
    }
    return null;
  }

  const shortMonth = raw.match(/^\s*([A-Za-z]{3})\s+(\d{1,2})\s*$/);
  if (!shortMonth) {
    return null;
  }

  const month = MONTH_SHORT_TO_INDEX[(shortMonth[1] ?? "").toLowerCase()];
  const day = Number.parseInt(shortMonth[2] ?? "", 10);
  if (!month || !Number.isInteger(day) || day < 1 || day > 31) {
    return null;
  }

  return { month, day };
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function resolveOccurrenceDate(
  month: number,
  day: number,
  now: Date,
): Date {
  const currentYear = now.getFullYear();
  const today = startOfDay(now);
  const sameYear = new Date(currentYear, month - 1, day, 0, 0, 0, 0);
  if (sameYear >= today) {
    return sameYear;
  }
  return new Date(currentYear + 1, month - 1, day, 0, 0, 0, 0);
}

function toReminderTimestamp(
  occurrence: Date,
  defaultReminderAll: TaskDefaultReminderAll,
): string | null {
  if (defaultReminderAll === "none") {
    return null;
  }

  if (defaultReminderAll === "9am") {
    return new Date(
      occurrence.getFullYear(),
      occurrence.getMonth(),
      occurrence.getDate(),
      9,
      0,
      0,
      0,
    ).toISOString();
  }

  const dayBefore = new Date(
    occurrence.getFullYear(),
    occurrence.getMonth(),
    occurrence.getDate() - 1,
    9,
    0,
    0,
    0,
  );
  return dayBefore.toISOString();
}

function taskTitle(card: TaskCard): string {
  return card.title.en || card.title.zh || "Task reminder";
}

function projectCard(
  card: TaskCard,
  now: Date,
  defaultReminderAll: TaskDefaultReminderAll,
  defaultReminderDue: TaskDefaultReminderDue,
): DesktopTaskReminderEntry | null {
  if (!card.date) {
    if (card.dateLabel) {
      return { status: "unsupported", taskId: card.id, reason: "relative_label_only" };
    }
    return { status: "unsupported", taskId: card.id, reason: "missing_absolute_date" };
  }

  const monthDay = parseAbsoluteMonthDay(card.date);
  if (!monthDay) {
    return { status: "unsupported", taskId: card.id, reason: "date_parse_failed" };
  }

  const occurrence = resolveOccurrenceDate(monthDay.month, monthDay.day, now);
  const triggerAtIso = toReminderTimestamp(occurrence, defaultReminderAll);
  if (triggerAtIso) {
    return {
      status: "candidate",
      occurrenceKey: `${card.id}:${triggerAtIso}`,
      taskId: card.id,
      title: taskTitle(card),
      triggerAtIso,
      allDay: true,
    };
  }

  if (defaultReminderDue !== "none") {
    return { status: "unsupported", taskId: card.id, reason: "no_public_due_time" };
  }

  return null;
}

export function projectDesktopTaskReminderEntries(
  taskCols: ReadonlyArray<TaskCol>,
  options?: {
    now?: Date;
    defaultReminderAll?: TaskDefaultReminderAll;
    defaultReminderDue?: TaskDefaultReminderDue;
  },
): DesktopTaskReminderEntry[] {
  const now = options?.now ?? new Date();
  const defaultReminderAll = options?.defaultReminderAll ?? "none";
  const defaultReminderDue = options?.defaultReminderDue ?? "on_time";

  const output: DesktopTaskReminderEntry[] = [];
  for (const col of taskCols) {
    for (const card of col.tasks) {
      const projected = projectCard(card, now, defaultReminderAll, defaultReminderDue);
      if (projected) {
        output.push(projected);
      }
    }
  }
  return output;
}
