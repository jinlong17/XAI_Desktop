/**
 * AC-PKG-4: index.ts only exports dashboardWidgetRegistrations.
 */
import { describe, it, expect } from "vitest";

import * as Barrel from "../index.js";

describe("AC-PKG-4: public surface is single export", () => {
  it("exports exactly dashboardWidgetRegistrations", () => {
    const keys = Object.keys(Barrel).sort();
    expect(keys).toEqual(["dashboardWidgetRegistrations"]);
  });

  it("dashboardWidgetRegistrations is an array", () => {
    expect(Array.isArray(Barrel.dashboardWidgetRegistrations)).toBe(true);
  });
});
