/**
 * dateForCol.test.ts — T-DC-1..5
 *
 * Clock is pinned to 2026-05-23 14:30 local by vitest.setup.ts (vi.useFakeTimers).
 * Phase: P2
 */

import { describe, it, expect } from "vitest";
import { dateForCol } from "../internal/dateForCol.js";

// Reference "now" for explicit-parameter tests (matches vitest.setup.ts TEST_NOW)
const NOW = new Date(2026, 4, 23, 14, 30, 0); // 2026-05-23 14:30 local

describe("dateForCol", () => {
  // T-DC-1: overdue → today − 3 days
  it("T-DC-1: overdue returns date for today − 3 days (5/20 when now=2026-05-23)", () => {
    const result = dateForCol("overdue", NOW);
    expect(result).not.toBeNull();
    expect(result!.date).toBe("5/20");
    expect(result!.dateZh).toBe("5 月 20 日");
  });

  // T-DC-2: next7 → today + 2 days
  it("T-DC-2: next7 returns date for today + 2 days (5/25 when now=2026-05-23)", () => {
    const result = dateForCol("next7", NOW);
    expect(result).not.toBeNull();
    expect(result!.date).toBe("5/25");
    expect(result!.dateZh).toBe("5 月 25 日");
  });

  // T-DC-3: later → today + 30 days, EN short-month format
  it("T-DC-3: later returns date for today + 30 days in short-month format (Jun 22)", () => {
    const result = dateForCol("later", NOW);
    expect(result).not.toBeNull();
    // Jun 22, 2026 (5/23 + 30 = 6/22)
    expect(result!.date).toBe("Jun 22");
    expect(result!.dateZh).toBe("6 月 22 日");
  });

  // T-DC-4: nodate → null
  it("T-DC-4: nodate returns null", () => {
    expect(dateForCol("nodate", NOW)).toBeNull();
  });

  // T-DC-5: explicit now parameter is honoured (use a different date)
  it("T-DC-5: honours explicit now param — overdue returns day-3 from that date", () => {
    const customNow = new Date(2026, 0, 15, 12, 0, 0); // 2026-01-15
    const result = dateForCol("overdue", customNow);
    expect(result).not.toBeNull();
    expect(result!.date).toBe("1/12"); // Jan 12
  });
});
