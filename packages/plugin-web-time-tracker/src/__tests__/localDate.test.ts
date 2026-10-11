import { expect, it } from "vitest";
import { dayKey, addDays, keyToDate, startOfDay } from "../internal/time.js";
it("uses local civil identity and navigates DST without fixed-day drift", () => {
 const now=new Date("2026-09-09T06:30:00Z");
 const key=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
 expect(dayKey(now.getTime())).toBe(key);
 expect(dayKey(startOfDay(now.getTime()))).toBe(key);
 expect(addDays("2026-03-08",1)).toBe("2026-03-09");
 expect(addDays("2026-11-01",1)).toBe("2026-11-02");
 expect(new Date(keyToDate("2026-03-09")).getHours()).toBe(0);
});
