import { expect, it } from "vitest";
import { rangeWindow } from "../internal/date.js";
it("ends a date range at the next civil midnight even on DST days", () => {
  for (const key of ["2026-03-08", "2026-11-01", "2026-04-05", "2026-10-04"]) {
    const now = new Date(`${key}T12:00:00`);
    const result = rangeWindow("7d", now);
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    expect(result.end!.getTime()).toBe(tomorrow.getTime() - 1);
    expect(result.end!.getDate()).toBe(now.getDate());
  }
});
