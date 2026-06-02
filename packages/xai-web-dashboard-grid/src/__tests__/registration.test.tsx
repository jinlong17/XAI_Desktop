/**
 * AC-REG-1..7: dashboardGridSlotRegistration shape + DashboardSlotHost lang plumbing.
 *
 * AC-REG-8 (goTo emits web:shell:module-change) is exercised in
 * DashboardModule.events.test.tsx (added in P3) — keeping registration.test
 * focused on shape + presence.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render } from "@testing-library/react";

import { WebShellProvider } from "@repo/xai-web-shell";
import { removePref, setPref } from "@repo/plugin-web-storage";

import { dashboardGridSlotRegistration, DashboardSlotHost } from "../registration.js";

beforeEach(() => {
  removePref("xai_dash_order");
  window.history.replaceState(null, "", "/app/dashboard");
});

afterEach(() => {
  removePref("xai_dash_order");
  window.history.replaceState(null, "", "/app/dashboard");
});

describe("dashboardGridSlotRegistration", () => {
  it("AC-REG-1: moduleId === 'dashboard'", () => {
    expect(dashboardGridSlotRegistration.moduleId).toBe("dashboard");
  });

  it("AC-REG-2: icon === 'layout'", () => {
    expect(dashboardGridSlotRegistration.icon).toBe("layout");
  });

  it("AC-REG-3: i18nKey === 'nav.dashboard'", () => {
    expect(dashboardGridSlotRegistration.i18nKey).toBe("nav.dashboard");
  });

  it("AC-REG-4: railOrder === 4", () => {
    expect(dashboardGridSlotRegistration.railOrder).toBe(4);
  });

  it("AC-REG-5: showInRail === true", () => {
    expect(dashboardGridSlotRegistration.showInRail).toBe(true);
  });

  it("AC-REG-6: children[0].path === '' and children[1].path === '*'", () => {
    expect(dashboardGridSlotRegistration.children).toHaveLength(2);
    expect(dashboardGridSlotRegistration.children[0]?.path).toBe("");
    expect(dashboardGridSlotRegistration.children[1]?.path).toBe("*");
  });

  it("AC-REG-6: children render functions are functions", () => {
    expect(typeof dashboardGridSlotRegistration.children[0]?.render).toBe("function");
    expect(typeof dashboardGridSlotRegistration.children[1]?.render).toBe("function");
  });

  it("label === 'Dashboard'", () => {
    expect(dashboardGridSlotRegistration.label).toBe("Dashboard");
  });

  it("defaultChildPath === ''", () => {
    expect(dashboardGridSlotRegistration.defaultChildPath).toBe("");
  });
});

describe("DashboardSlotHost", () => {
  it("AC-REG-7: reads lang from useWebShell() (en path)", () => {
    const { container } = render(
      <WebShellProvider
        modules={[dashboardGridSlotRegistration]}
        lang="en"
        railPos="left"
        petOn={false}
        setPetOn={() => {}}
      >
        <DashboardSlotHost />
      </WebShellProvider>,
    );
    const greeting = container.querySelector(".dash-greeting")?.textContent ?? "";
    expect(greeting).toMatch(/Good\s(morning|afternoon|evening)/);
  });

  it("AC-REG-7: reads lang from useWebShell() (zh path)", () => {
    const { container } = render(
      <WebShellProvider
        modules={[dashboardGridSlotRegistration]}
        lang="zh"
        railPos="left"
        petOn={false}
        setPetOn={() => {}}
      >
        <DashboardSlotHost />
      </WebShellProvider>,
    );
    const greeting = container.querySelector(".dash-greeting")?.textContent ?? "";
    expect(greeting).toMatch(/(早上好|下午好|晚上好)/);
  });

  it("renders row #11 dashboardWidgetRegistrations (10 widget shells, not empty state)", () => {
    const { container } = render(
      <WebShellProvider
        modules={[dashboardGridSlotRegistration]}
        lang="en"
        railPos="left"
        petOn={false}
        setPetOn={() => {}}
      >
        <DashboardSlotHost />
      </WebShellProvider>,
    );
    // Post-row-#11 P3 wiring: empty state is no longer rendered; the 10
    // widget shells from dashboardWidgetRegistrations mount instead.
    expect(container.querySelector(".dash-empty")).toBeNull();
    const shells = container.querySelectorAll(".widget-shell");
    expect(shells.length).toBe(10);
  });

  it("deep-links from calendar widget change the app route", () => {
    setPref("xai_dash_order", ["mini-cal"]);
    const { container } = render(
      <WebShellProvider
        modules={[dashboardGridSlotRegistration]}
        lang="en"
        railPos="left"
        petOn={false}
        setPetOn={() => {}}
      >
        <DashboardSlotHost />
      </WebShellProvider>,
    );

    fireEvent.click(container.querySelector(".mc-jump") as HTMLButtonElement);

    expect(window.location.pathname).toBe("/app/calendar");
  });
});
