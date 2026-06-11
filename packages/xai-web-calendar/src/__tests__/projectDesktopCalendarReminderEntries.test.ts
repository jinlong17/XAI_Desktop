import { describe, expect, it } from "vitest";
import { projectDesktopCalendarReminderEntries } from "../projectDesktopCalendarReminderEntries.js";

const DISPLAYED_MONTH = { year: 2026, month: 5 } as const;

describe("projectDesktopCalendarReminderEntries", () => {
  it("projects timed events into candidate reminders", () => {
    const entries = projectDesktopCalendarReminderEntries(DISPLAYED_MONTH, {
      3: [
        {
          c: "mint",
          t: { en: "Family dinner", zh: "家庭聚餐" },
          time: "19:00",
        },
      ],
    });

    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      status: "candidate",
      day: 3,
      title: "Family dinner",
    });
  });

  it("returns unsupported for events without time", () => {
    const entries = projectDesktopCalendarReminderEntries(DISPLAYED_MONTH, {
      4: [
        {
          c: "mint",
          t: { en: "All-day planning", zh: "全天规划" },
        },
      ],
    });

    expect(entries).toEqual([
      {
        status: "unsupported",
        day: 4,
        title: "All-day planning",
        reason: "event_has_no_time",
      },
    ]);
  });

  it("returns unsupported for day keys outside the active month dataset", () => {
    const entries = projectDesktopCalendarReminderEntries(DISPLAYED_MONTH, {
      32: [
        {
          c: "mint",
          t: { en: "Out-of-range", zh: "超出范围" },
          time: "09:00",
        },
      ],
    });

    expect(entries).toEqual([
      {
        status: "unsupported",
        day: 32,
        title: "Out-of-range",
        reason: "outside_active_month_dataset",
      },
    ]);
  });
});
