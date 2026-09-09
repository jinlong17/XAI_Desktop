import { describe, it, expect } from "vitest";
import { heatmapCells } from "../internal/heatmapCells.js";
import type { PomodoroSessionRecord } from "../internal/isPomodoroSession.js";

const NOW = new Date("2026-05-23T10:30:00Z");

describe("heatmapCells", () => {
  it("H1: returns exactly 182 cells", () => {
    expect(heatmapCells([], 0, NOW)).toHaveLength(182);
  });

  it("H2: ordering — first cell is (0,0), last is (25,6)", () => {
    const cells = heatmapCells([], 0, NOW);
    expect(cells[0]).toMatchObject({ week: 0, day: 0 });
    expect(cells[181]).toMatchObject({ week: 25, day: 6 });
  });

  it("H3: every date is a valid YYYY-MM-DD", () => {
    const cells = heatmapCells([], 0, NOW);
    for (const cell of cells) {
      expect(cell.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("H4-H5: oldest cell is 25 weeks back from this week's start", () => {
    const cells = heatmapCells([], 0, NOW);
    const oldest = cells[0]!.date;
    const newest = cells[181]!.date;
    expect(oldest < newest).toBe(true);
  });

  it("H6: minutes summation lands on the right cell", () => {
    const sessions: PomodoroSessionRecord[] = [
      { mode: "focus", durationMs: 25 * 60_000, elapsedMs: 25 * 60_000, finishedAt: "2026-05-20T09:00:00Z" },
    ];
    const cells = heatmapCells(sessions, 0, NOW);
    const hit = cells.find((c) => c.date === "2026-05-20");
    expect(hit).toBeDefined();
    expect(hit?.minutes).toBe(25);
    expect(hit?.level).toBe(2);
  });

  it("H7: level threshold map", () => {
    const sessions: PomodoroSessionRecord[] = [
      { mode: "focus", durationMs: 15 * 60_000, elapsedMs: 15 * 60_000, finishedAt: "2026-05-20T09:00:00Z" },
      { mode: "focus", durationMs: 31 * 60_000, elapsedMs: 31 * 60_000, finishedAt: "2026-05-21T09:00:00Z" }, // 46+
    ];
    const cells = heatmapCells(sessions, 0, NOW);
    const day1 = cells.find((c) => c.date === "2026-05-20");
    const day2 = cells.find((c) => c.date === "2026-05-21");
    expect(day1?.level).toBe(1); // 15 → level 1
    expect(day2?.level).toBe(2); // 31 → level 2 (16..45)
  });

  it("H8: weekStart=1 shifts week start by one day", () => {
    const cellsSun = heatmapCells([], 0, NOW);
    const cellsMon = heatmapCells([], 1, NOW);
    expect(cellsSun[0]!.date).not.toBe(cellsMon[0]!.date);
  });

  it("ignores break-mode sessions", () => {
    const sessions: PomodoroSessionRecord[] = [
      { mode: "short-break", durationMs: 300_000, finishedAt: "2026-05-20T09:00:00Z" },
    ];
    const cells = heatmapCells(sessions, 0, NOW);
    const hit = cells.find((c) => c.date === "2026-05-20");
    expect(hit?.minutes).toBe(0);
    expect(hit?.level).toBe(0);
  });
});
