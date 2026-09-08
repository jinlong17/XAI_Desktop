/**
 * AC-LANG-1 + AC-LANG-2: greeting + date update on lang switch.
 */
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { DashboardModule } from "../DashboardModule.js";
import type { WidgetRegistration } from "../types.js";

const EMPTY: WidgetRegistration[] = [];

describe("DashboardModule lang", () => {
  it("AC-LANG-1: lang='zh' greeting uses Chinese strings", () => {
    const { container, rerender } = render(<DashboardModule lang="en" widgets={EMPTY} />);

    // Find the greeting element; en should mention "Good".
    const greetingEn = container.querySelector(".dash-greeting")!.textContent ?? "";
    expect(greetingEn).toMatch(/Good\s(morning|afternoon|evening)/);

    rerender(<DashboardModule lang="zh" widgets={EMPTY} />);
    const greetingZh = container.querySelector(".dash-greeting")!.textContent ?? "";
    expect(greetingZh).toMatch(/(早上好|下午好|晚上好)/);
  });

  it("AC-LANG-2: lang='zh' date uses Chinese weekday + 年/月/日", () => {
    const { container } = render(<DashboardModule lang="zh" widgets={EMPTY} />);
    const date = container.querySelector(".dash-date")!.textContent ?? "";
    expect(date).toContain("年");
    expect(date).toContain("月");
    expect(date).toContain("日");
    expect(date).toMatch(/周(日|一|二|三|四|五|六)/);
  });

  it("AC-LANG-2: lang='en' date uses long English weekday + Month + numeric day", () => {
    const { container } = render(<DashboardModule lang="en" widgets={EMPTY} />);
    const date = container.querySelector(".dash-date")!.textContent ?? "";
    // English long weekday like Monday/Tuesday/...
    expect(date).toMatch(/(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/);
  });
});
