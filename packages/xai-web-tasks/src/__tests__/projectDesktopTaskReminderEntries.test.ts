import { describe, expect, it } from "vitest";
import { projectDesktopTaskReminderEntries } from "../projectDesktopTaskReminderEntries.js";
import type { TaskCol } from "../types.js";

function colsWithTasks(tasks: ReadonlyArray<unknown>): TaskCol[] {
  return [
    {
      id: "overdue",
      key: "overdue",
      count: tasks.length,
      tasks: tasks as TaskCol["tasks"],
    },
    { id: "next7", key: "next_7_days", count: 0, tasks: [] },
    { id: "later", key: "later", count: 0, tasks: [] },
    { id: "nodate", key: "no_date", count: 0, tasks: [] },
  ];
}

describe("projectDesktopTaskReminderEntries", () => {
  it("projects parseable M/D date into a candidate at 9am", () => {
    const now = new Date("2026-05-28T12:00:00.000Z");
    const entries = projectDesktopTaskReminderEntries(
      colsWithTasks([
        { id: "t-1", title: { en: "Pay rent", zh: "交租" }, date: "6/1" },
      ]),
      {
        now,
        defaultReminderAll: "9am",
        defaultReminderDue: "none",
      },
    );

    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      status: "candidate",
      taskId: "t-1",
      allDay: true,
    });
  });

  it("rolls short-month dates to next year when already passed", () => {
    const now = new Date("2026-12-20T08:00:00.000Z");
    const entries = projectDesktopTaskReminderEntries(
      colsWithTasks([
        { id: "t-2", title: { en: "Renew docs", zh: "更新资料" }, date: "Jan 2" },
      ]),
      {
        now,
        defaultReminderAll: "9am",
        defaultReminderDue: "none",
      },
    );

    expect(entries).toHaveLength(1);
    const candidate = entries[0];
    if (candidate.status === "candidate") {
      expect(new Date(candidate.triggerAtIso).getFullYear()).toBe(2027);
      expect(candidate.occurrenceKey.startsWith("t-2:")).toBe(true);
    }
  });

  it("returns relative_label_only for dateLabel-only cards", () => {
    const entries = projectDesktopTaskReminderEntries(
      colsWithTasks([
        {
          id: "t-3",
          title: { en: "Follow up", zh: "跟进" },
          dateLabel: { en: "Next Mon", zh: "下周一" },
        },
      ]),
      {
        now: new Date("2026-05-28T12:00:00.000Z"),
        defaultReminderAll: "9am",
        defaultReminderDue: "none",
      },
    );

    expect(entries).toEqual([
      {
        status: "unsupported",
        taskId: "t-3",
        reason: "relative_label_only",
      },
    ]);
  });

  it("returns no_public_due_time when due reminder exists but no public due-time field", () => {
    const entries = projectDesktopTaskReminderEntries(
      colsWithTasks([
        { id: "t-4", title: { en: "Book meeting", zh: "安排会议" }, date: "6/20" },
      ]),
      {
        now: new Date("2026-05-28T12:00:00.000Z"),
        defaultReminderAll: "none",
        defaultReminderDue: "on_time",
      },
    );

    expect(entries).toEqual([
      {
        status: "unsupported",
        taskId: "t-4",
        reason: "no_public_due_time",
      },
    ]);
  });
});
