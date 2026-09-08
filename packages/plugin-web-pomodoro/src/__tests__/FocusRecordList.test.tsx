/**
 * FRL1..FRL6 — FocusRecordList component tests.
 * test.md §2
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { FocusRecordList } from "../FocusRecordList.js";
import type { PomodoroSession } from "../types.js";
import {
  FIXTURE_FOCUS_TODAY,
  FIXTURE_FOCUS_YESTERDAY,
  FIXTURE_FOCUS_TODAY_PARTIAL,
  FIXTURE_SHORT_BREAK_TODAY,
} from "../__fixtures__/sessions.js";

describe("FocusRecordList", () => {
  // FRL1: empty array → empty list (no group headers)
  it("FRL1: empty sessions → no groups rendered", () => {
    const { container } = render(<FocusRecordList sessions={[]} lang="en" />);
    const groups = container.querySelectorAll(".record-group");
    expect(groups).toHaveLength(0);
  });

  // FRL2: single today session → 1 group with 1 row
  it("FRL2: single today session → 1 group, 1 row", () => {
    const { container } = render(<FocusRecordList sessions={[FIXTURE_FOCUS_TODAY]} lang="en" />);
    const groups = container.querySelectorAll(".record-group");
    expect(groups).toHaveLength(1);
    expect(groups.item(0).querySelectorAll(".record-row")).toHaveLength(1);
  });

  // FRL3: sessions across 3 days → 3 groups, today first
  it("FRL3: sessions across 3 days → 3 groups, today first", () => {
    const twoDaysAgo: PomodoroSession = {
      ...FIXTURE_FOCUS_YESTERDAY,
      id: "pomo_2dago",
      startedAt: "2026-05-21T10:00:00.000Z",
      finishedAt: "2026-05-21T10:25:00.000Z",
    };
    const { container } = render(
      <FocusRecordList
        sessions={[FIXTURE_FOCUS_TODAY, FIXTURE_FOCUS_YESTERDAY, twoDaysAgo]}
        lang="en"
      />,
    );
    const groups = container.querySelectorAll(".record-group");
    expect(groups).toHaveLength(3);
    // First group should be "Today"
    const firstDateLabel = groups.item(0).querySelector(".record-date");
    expect(firstDateLabel?.textContent).toBe("Today");
  });

  // FRL4: >7 days → truncates to 7 groups
  it("FRL4: more than 7 days → only first 7 groups shown", () => {
    const sessions: PomodoroSession[] = Array.from({ length: 10 }, (_, i) => ({
      ...FIXTURE_FOCUS_TODAY,
      id: `pomo_day${i}`,
      startedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      finishedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000 + 25 * 60 * 1000).toISOString(),
    }));
    const { container } = render(<FocusRecordList sessions={sessions} lang="en" />);
    const groups = container.querySelectorAll(".record-group");
    expect(groups.length).toBeLessThanOrEqual(7);
  });

  // FRL5: rows show formatted time + duration
  it("FRL5: row shows formatted time and duration", () => {
    const { container } = render(<FocusRecordList sessions={[FIXTURE_FOCUS_TODAY]} lang="en" />);
    const timeEl = container.querySelector(".rec-time");
    const durEl = container.querySelector(".rec-dur");
    expect(timeEl).toBeTruthy();
    expect(durEl).toBeTruthy();
    // Duration should be "25:00"
    expect(durEl?.textContent).toBe("25:00");
    // Time should match HH:MM format
    expect(timeEl?.textContent).toMatch(/^\d{2}:\d{2}$/);
  });

  // FRL6: bilingual date labels (en + zh)
  it("FRL6: 'Today' in EN, '今天' in ZH", () => {
    const { container: en } = render(
      <FocusRecordList sessions={[FIXTURE_FOCUS_TODAY]} lang="en" />,
    );
    const { container: zh } = render(
      <FocusRecordList sessions={[FIXTURE_FOCUS_TODAY]} lang="zh" />,
    );
    expect(en.querySelector(".record-date")?.textContent).toBe("Today");
    expect(zh.querySelector(".record-date")?.textContent).toBe("今天");
  });

  // Non-completed sessions excluded
  it("non-completed focus sessions excluded", () => {
    const { container } = render(
      <FocusRecordList sessions={[FIXTURE_FOCUS_TODAY_PARTIAL]} lang="en" />,
    );
    expect(container.querySelectorAll(".record-group")).toHaveLength(0);
  });

  // Non-focus sessions excluded
  it("short-break sessions excluded from record list", () => {
    const { container } = render(
      <FocusRecordList sessions={[FIXTURE_SHORT_BREAK_TODAY]} lang="en" />,
    );
    expect(container.querySelectorAll(".record-group")).toHaveLength(0);
  });
});
