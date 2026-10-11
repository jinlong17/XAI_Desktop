import { describe, it, expect } from "vitest";
import { dateForCol, dateFields } from "../internal/dateForCol.js";
describe("explicit date presets", () => {
  const now = new Date(2026, 11, 31, 23, 30);
  it.each([["overdue", "2026-12-31"], ["next7", "2027-01-01"], ["later", "2027-01-08"]] as const)("%s schedules %s", (bucket, due) => {
    expect(dateForCol(bucket, now)?.dueDate).toBe(due);
  });
  it("clears the date for nodate", () => expect(dateForCol("nodate", now)).toBeNull());
  it("preserves date identity and rejects impossible dates", () => {
    expect(dateFields("2028-02-29")).toEqual({ dueDate: "2028-02-29", date: "2/29", dateZh: "2 月 29 日" });
    expect(dateFields("2027-02-29")).toBeNull();
    expect(dateFields("02/29")).toBeNull();
  });
});
