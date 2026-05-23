/**
 * dateForCol.ts — pure bucket date-rewrite helper.
 *
 * Returns the display date string pair for a task moved to the given bucket.
 * Bucket date rules (api.md §5.1, design.md §1):
 *   overdue → today − 3 days   (M/D format)
 *   next7   → today + 2 days   (M/D format)
 *   later   → today + 30 days  (Mon D format — toLocaleString "en-US" short month)
 *   nodate  → null (caller strips date fields)
 *
 * The `now` parameter allows deterministic testing (vi.setSystemTime compatible).
 *
 * API contract: packages/xai-web-tasks/docs/api.md §5.1
 * Test: T-DC-1..5 in src/__tests__/dateForCol.test.ts
 *
 * @internal
 */

import type { BucketId } from "../types.js";

/**
 * Returns `{ date: "M/D" | "Mon D", dateZh: "M 月 D 日" }` for dated buckets,
 * or `null` for `nodate`.
 */
export function dateForCol(
  bucketId: BucketId,
  now: Date = new Date(),
): { date: string; dateZh: string } | null {
  if (bucketId === "nodate") return null;

  const fmt = (d: Date): string => `${d.getMonth() + 1}/${d.getDate()}`;
  const fmtZh = (d: Date): string => `${d.getMonth() + 1} 月 ${d.getDate()} 日`;

  if (bucketId === "overdue") {
    const d = new Date(now);
    d.setDate(d.getDate() - 3);
    return { date: fmt(d), dateZh: fmtZh(d) };
  }

  if (bucketId === "next7") {
    const d = new Date(now);
    d.setDate(d.getDate() + 2);
    return { date: fmt(d), dateZh: fmtZh(d) };
  }

  if (bucketId === "later") {
    const d = new Date(now);
    d.setDate(d.getDate() + 30);
    const enDate = d.toLocaleString("en-US", { month: "short", day: "numeric" });
    return { date: enDate, dateZh: fmtZh(d) };
  }

  // Unreachable — TypeScript exhaustiveness guard
  const _never: never = bucketId;
  return _never;
}
