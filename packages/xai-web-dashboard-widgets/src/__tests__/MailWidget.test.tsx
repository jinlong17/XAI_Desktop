/**
 * MailWidget tests — AC-MAIL-REAL-1..4 + AC-MAIL-EMPTY-1 + AC-MAIL-READONLY-1
 *
 * REWRITTEN for §G-B: fixture assertions (AC-MAIL-1..3 from SHIPPED row #11)
 * are removed; replaced by real-store assertions (read-only aggregation).
 * MAILS fixture export is kept; fixtures.test.ts still passes (RW4 analog).
 *
 * 🔴 AC-MAIL-READONLY-1 is the single most important guard in Phase B:
 *    BOTH xai_task_cols AND xai_calendar_events must be byte-unchanged after render.
 *
 * Design: packages/xai-web-dashboard-widgets/docs/design.md §G
 * Test:   packages/xai-web-dashboard-widgets/docs/test.md §G.3 AC-MAIL-REAL/EMPTY/READONLY
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { getPref, setPref } from "@repo/plugin-web-storage";
import { MailWidget } from "../widgets/MailWidget.js";
import { STR_NOTIFICATIONS } from "../internal/strings.js";

const NOW = new Date("2026-05-29T14:30:00"); // local 2026-05-29 14:30

beforeEach(() => {
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// AC-MAIL-EMPTY-1 — honest "All clear" when both stores empty
// ---------------------------------------------------------------------------

describe("AC-MAIL-EMPTY-1: both stores empty → honest 'All clear' / '暂无通知'; no .mail-row; badge=0", () => {
  it("lang=en: shows All clear text, no rows, badge=0", () => {
    const { container } = render(<MailWidget lang="en" now={NOW} />);
    expect(container.textContent).toContain(STR_NOTIFICATIONS.empty.en);
    expect(container.querySelectorAll(".mail-row")).toHaveLength(0);
    expect(container.querySelector("[data-mail-badge]")?.textContent).toBe("0");
  });

  it("lang=zh: shows zh empty text", () => {
    const { container } = render(<MailWidget lang="zh" now={NOW} />);
    expect(container.textContent).toContain(STR_NOTIFICATIONS.empty.zh);
  });

  it("empty state is NOT a fixture row (not from MAILS fixture — RM6)", () => {
    const { container } = render(<MailWidget lang="en" now={NOW} />);
    // The empty state is a div .notif-empty, NOT a .mail-row li
    expect(container.querySelector(".notif-empty")).not.toBeNull();
    expect(container.querySelector(".mail-row")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// AC-MAIL-REAL-1 — real overdue + today signals → correct row count + badge
// ---------------------------------------------------------------------------

describe("AC-MAIL-REAL-1: seed xai_task_cols (2 overdue) + xai_calendar_events (1 today) → 3 .mail-rows, badge=3", () => {
  it("3 signals render as 3 .mail-row items with badge=3", () => {
    // Seed 2 overdue tasks
    const taskStore = {
      overdue: {
        tasks: [
          { id: "t1", title: { en: "Task A", zh: "任务A" }, done: false },
          { id: "t2", title: { en: "Task B", zh: "任务B" } },
        ],
      },
      next7: { tasks: [] },
      later: { tasks: [] },
      nodate: { tasks: [] },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setPref("xai_task_cols", taskStore as any);

    // Seed 1 today event
    const calStore = {
      ev1: {
        id: "ev1",
        title: "Today meeting",
        startISO: "2026-05-29T10:00",
        endISO: "2026-05-29T11:00",
        colorPreset: "mint",
        recurrence: null,
      },
    };
    setPref("xai_calendar_events", calStore as unknown as Record<string, unknown>);

    const { container } = render(<MailWidget lang="en" now={NOW} />);
    const rows = container.querySelectorAll(".mail-row");
    expect(rows).toHaveLength(3);
    expect(container.querySelector("[data-mail-badge]")?.textContent).toBe("3");
  });

  it("clicking notification rows deep-links to the owning module", () => {
    const goTo = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setPref("xai_task_cols", {
      overdue: { tasks: [{ id: "t1", title: { en: "Task A", zh: "任务A" } }] },
    } as any);
    setPref("xai_calendar_events", {
      ev1: {
        id: "ev1",
        title: "Today meeting",
        startISO: "2026-05-29T10:00",
        endISO: "2026-05-29T11:00",
        colorPreset: "mint",
        recurrence: null,
      },
    } as unknown as Record<string, unknown>);

    const { container } = render(<MailWidget lang="en" now={NOW} goTo={goTo} />);
    const rows = container.querySelectorAll(".mail-row");
    fireEvent.click(rows[0]!);
    fireEvent.click(rows[1]!);
    expect(goTo).toHaveBeenCalledWith("tasks");
    expect(goTo).toHaveBeenCalledWith("calendar");
  });
});

// ---------------------------------------------------------------------------
// AC-MAIL-REAL-2 — rows show label + source-type dot
// ---------------------------------------------------------------------------

describe("AC-MAIL-REAL-2: each row shows label + time for events; source-type visually distinguished", () => {
  it("overdue task row shows task title; calendar event row shows event time", () => {
    const taskStore = {
      overdue: { tasks: [{ id: "t1", title: { en: "Fix bug", zh: "修复缺陷" } }] },
    };
    const calStore = {
      ev1: {
        id: "ev1",
        title: "Design review",
        startISO: "2026-05-29T15:00",
        endISO: "2026-05-29T16:00",
        colorPreset: "blue",
        recurrence: null,
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setPref("xai_task_cols", taskStore as any);
    setPref("xai_calendar_events", calStore as unknown as Record<string, unknown>);

    const { container } = render(<MailWidget lang="en" now={NOW} />);
    expect(container.textContent).toContain("Fix bug");
    expect(container.textContent).toContain("15:00");

    // Source-type dots present
    expect(container.querySelector(".notif-dot--task-overdue")).not.toBeNull();
    expect(container.querySelector(".notif-dot--calendar-today")).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// AC-MAIL-REAL-3 — now-threaded determinism (fixed now makes signals deterministic)
// ---------------------------------------------------------------------------

describe("AC-MAIL-REAL-3: now-threaded determinism — fixed now makes today signals deterministic", () => {
  it("a tomorrow event does NOT appear with fixed NOW=today", () => {
    const calStore = {
      ev_tomorrow: {
        id: "ev_tomorrow",
        title: "Future event",
        startISO: "2026-05-30T10:00",
        endISO: "2026-05-30T11:00",
        colorPreset: "amber",
        recurrence: null,
      },
    };
    setPref("xai_calendar_events", calStore as unknown as Record<string, unknown>);

    const { container } = render(<MailWidget lang="en" now={NOW} />);
    // Tomorrow event should NOT appear
    expect(container.textContent).not.toContain("Future event");
    expect(container.querySelector(".mail-row")).toBeNull();
  });

  it("uses now prop not wall-clock: render with different now values gives different results", () => {
    const calStore = {
      ev1: {
        id: "ev1",
        title: "Today only",
        startISO: "2026-05-29T10:00",
        endISO: "2026-05-29T11:00",
        colorPreset: "mint",
        recurrence: null,
      },
    };
    setPref("xai_calendar_events", calStore as unknown as Record<string, unknown>);

    // With NOW on 2026-05-29 → event appears
    const { container: c1 } = render(<MailWidget lang="en" now={NOW} />);
    expect(c1.querySelectorAll(".mail-row")).toHaveLength(1);

    // With now on 2026-05-30 → event disappears (different day)
    const { container: c2 } = render(
      <MailWidget lang="en" now={new Date("2026-05-30T14:30:00")} />,
    );
    expect(c2.querySelectorAll(".mail-row")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// AC-MAIL-REAL-4 — bilingual
// ---------------------------------------------------------------------------

describe("AC-MAIL-REAL-4: bilingual — overdue labels in zh use title.zh; title + source labels render en/zh", () => {
  it("zh: overdue task label uses title.zh", () => {
    const taskStore = {
      overdue: { tasks: [{ id: "t1", title: { en: "Report", zh: "报告" } }] },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setPref("xai_task_cols", taskStore as any);

    const { container } = render(<MailWidget lang="zh" now={NOW} />);
    expect(container.textContent).toContain("报告");
    expect(container.textContent).not.toContain("Report");
  });

  it("zh: widget title + source labels are zh", () => {
    render(<MailWidget lang="zh" now={NOW} />);
    expect(screen.getByText(STR_NOTIFICATIONS.title.zh)).toBeTruthy();
  });

  it("en: widget title is en", () => {
    render(<MailWidget lang="en" now={NOW} />);
    expect(screen.getByText(STR_NOTIFICATIONS.title.en)).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// AC-MAIL-READONLY-1 — THE CRITICAL GUARD: both stores byte-unchanged after render
// ---------------------------------------------------------------------------

describe("AC-MAIL-READONLY-1: BOTH xai_task_cols + xai_calendar_events byte-unchanged after render (RM1)", () => {
  it("rendering MailWidget with seeded stores does NOT mutate either store", () => {
    const taskStore = {
      overdue: {
        tasks: [{ id: "t1", title: { en: "Task", zh: "任务" }, done: false }],
      },
      next7: { tasks: [] },
    };
    const calStore = {
      ev1: {
        id: "ev1",
        title: "Meeting",
        startISO: "2026-05-29T10:00",
        endISO: "2026-05-29T11:00",
        colorPreset: "mint",
        recurrence: null,
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setPref("xai_task_cols", taskStore as any);
    setPref("xai_calendar_events", calStore as unknown as Record<string, unknown>);

    // Snapshot BEFORE render
    const taskBefore = JSON.stringify(getPref("xai_task_cols"));
    const calBefore = JSON.stringify(getPref("xai_calendar_events"));

    // Render
    render(<MailWidget lang="en" now={NOW} />);

    // Snapshot AFTER render
    const taskAfter = JSON.stringify(getPref("xai_task_cols"));
    const calAfter = JSON.stringify(getPref("xai_calendar_events"));

    // BOTH must be byte-identical (no mutation — RM1)
    expect(taskAfter).toBe(taskBefore);
    expect(calAfter).toBe(calBefore);
  });

  it("no setPref call touches xai_task_cols or xai_calendar_events (store identity check)", () => {
    // Additional belt-and-suspenders: seed and verify no write occurred
    const TASK_SENTINEL = { overdue: { tasks: [{ id: "sentinel-t", title: { en: "S", zh: "S" } }] } };
    const CAL_SENTINEL = {
      "sentinel-ev": {
        id: "sentinel-ev",
        title: "SentinelEv",
        startISO: "2026-05-29T08:00",
        endISO: "2026-05-29T09:00",
        colorPreset: "mint",
        recurrence: null,
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setPref("xai_task_cols", TASK_SENTINEL as any);
    setPref("xai_calendar_events", CAL_SENTINEL as unknown as Record<string, unknown>);

    render(<MailWidget lang="en" now={NOW} />);

    // getPref must still return the sentinel values (not cleared/overwritten)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const taskRead = getPref("xai_task_cols") as any as typeof TASK_SENTINEL;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const calRead = getPref("xai_calendar_events") as any as typeof CAL_SENTINEL;

    expect(taskRead.overdue.tasks[0]!.id).toBe("sentinel-t");
    expect(calRead["sentinel-ev"]!.title).toBe("SentinelEv");
  });
});
