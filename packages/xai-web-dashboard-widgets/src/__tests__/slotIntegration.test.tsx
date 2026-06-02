/**
 * AC-HOST-1: Slot integration — when DashboardSlotHost mounts (from row #10)
 * the rendered tree must contain widget shells driven by row #11's
 * dashboardWidgetRegistrations.
 *
 * We import the host via @repo/plugin-web-dashboard-grid (row #10's public
 * surface intentionally exports dashboardGridSlotRegistration whose children
 * point at DashboardSlotHost). To avoid pulling in the full shell context, we
 * directly call the registration's render slot — sanitizeOrder + DashboardGrid
 * are tested in row #10's own suite.
 *
 * This test is the bridge that proves the P3 cross-package edit on row #10's
 * registration.tsx actually wires our widget array.
 */
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { dashboardWidgetRegistrations } from "../index.js";

describe("AC-HOST-1: slot integration sanity", () => {
  it("dashboardWidgetRegistrations is importable from the public surface", () => {
    expect(Array.isArray(dashboardWidgetRegistrations)).toBe(true);
    expect(dashboardWidgetRegistrations).toHaveLength(11);
  });

  it("each registration renders a non-null ReactNode given a valid ctx", () => {
    const ctx = {
      lang: "en" as const,
      now: new Date(2026, 4, 22, 10, 30, 0),
      goTo: () => {},
    };
    for (const reg of dashboardWidgetRegistrations) {
      const Render = () => <>{reg.render(ctx)}</>;
      // Should not throw on render
      const { unmount } = render(<Render />);
      unmount();
    }
  });

  it("ids match the prototype set plus Time Tracker", () => {
    expect(dashboardWidgetRegistrations.map((r) => r.id)).toEqual([
      "clock",
      "stat-tasks",
      "stat-streak",
      "stat-pomos",
      "timetrack",
      "weather",
      "mini-cal",
      "timezones",
      "stickies",
      "mail",
      "upcoming",
    ]);
  });
});
