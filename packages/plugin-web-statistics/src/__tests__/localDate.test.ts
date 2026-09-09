import { expect, it } from "vitest";
import { rangeWindow } from "../internal/rangeWindow.js";
import { dateKeyOfFinishedAt, computeStreak } from "../internal/aggregators.js";
it("localizes absolute records and uses natural midnight buckets", () => {
 const iso="2026-09-09T06:30:00Z";
 const now=new Date(iso);
 const key=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
 expect(dateKeyOfFinishedAt(iso)).toBe(key);
 expect(computeStreak({[key]:true},now)).toBe(1);
 for(const date of [new Date(2026,2,8,12),new Date(2026,10,1,12)]) {
  const window=rangeWindow("week",date,0,"en");
  expect(window.start.getHours()).toBe(0);
  expect(window.end.getHours()).toBe(23);
  expect(window.bucketBoundaries.every(d=>d.getHours()===0)).toBe(true);
 }
});
