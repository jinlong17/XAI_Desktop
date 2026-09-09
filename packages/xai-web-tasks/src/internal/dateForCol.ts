import { addLocalDays, localDateKey, parseLocalDateKey } from "@repo/plugin-web-tokens";
import type { BucketId } from "../types.js";

/** Explicit date presets for a user-requested time-bucket move. */
export function dateForCol(bucketId: BucketId, now: Date = new Date()) {
  if (bucketId === "nodate") return null;
  return dateFields(localDateKey(addLocalDays(now, bucketId === "overdue" ? 0 : bucketId === "next7" ? 1 : 8)));
}

export function dateFields(dueDate: string): { dueDate: string; date: string; dateZh: string } | null {
  const d = parseLocalDateKey(dueDate);
  if (!d) return null;
  return { dueDate, date: `${d.getMonth() + 1}/${d.getDate()}`, dateZh: `${d.getMonth() + 1} 月 ${d.getDate()} 日` };
}
