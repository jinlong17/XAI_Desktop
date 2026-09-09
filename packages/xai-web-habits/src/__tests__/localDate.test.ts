import { expect, it } from "vitest";
import { utcDateKey, weekDates } from "../internal/dateKeys.js";
import { computeStreak } from "../internal/computeStreak.js";
it("uses the device local day at UTC boundaries and walks civil dates", () => {
 const now = new Date("2026-09-09T06:30:00Z");
 const key = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
 expect(utcDateKey(now)).toBe(key);
 expect(computeStreak({[key]: true}, now)).toBe(1);
 const week = weekDates(new Date(2026, 2, 8, 12));
 expect(week.every(d=>d.getHours()===0)).toBe(true);
 expect(week[0]!.getDay()).toBe(0);
});
