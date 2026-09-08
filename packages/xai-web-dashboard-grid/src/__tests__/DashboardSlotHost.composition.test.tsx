/**
 * DashboardSlotHost.composition — REGRESSION TEST for the row-#10 ↔ row-#11
 * widget-composition contract.
 *
 * Why this file exists:
 *   The 2026-05-24 Codex gpt-5.5-thinking cross-vendor cold-read flagged
 *   that row #10's docs were stale against the row-#11 integration; sub-fix
 *   S1 synced design.md + api.md. Sub-fix S3 (this file) adds a unit-test
 *   lock so the contract does not silently drift again. If a future agent
 *   reverts DashboardSlotHost to widgets={[]} or row #11 changes the
 *   public shape, these tests fail FAST at PR time instead of waiting for
 *   a manual cross-vendor smoke that may never run.
 *
 * Contract being locked (all assertions in one file for easy grep):
 *   1. dashboardWidgetRegistrations is re-exported by the row #11 barrel
 *      and is a non-empty array (was 10 at row #11 ship — we assert ≥ 1
 *      so the test does not break on legitimate widget add/remove).
 *   2. Every entry has the WidgetRegistration shape (id: string,
 *      span: WidgetSpanClass, render: function).
 *   3. All ids are unique (so sanitize-on-mount does not dedupe a stable
 *      registration, which would silently change persisted-order behavior).
 *   4. Every span string is one of the 9 declared WidgetSpanClass literals
 *      — catches accidental introduction of an undeclared span.
 *   5. DashboardSlotHost forwards the array (not the empty default) — the
 *      shell renders the grid path, NOT the empty-state path.
 *   6. The 4 exported types are present on the public surface.
 *
 * Companion docs: api.md §S2 + §S3 + §S10, design.md §1.1 frozen-assumption #14.
 */
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { dashboardWidgetRegistrations } from "@repo/plugin-web-dashboard-widgets";
import { WebShellProvider } from "@repo/xai-web-shell";

import {
  DashboardSlotHost,
  dashboardGridSlotRegistration,
} from "../registration.js";
import type {
  DashboardModuleProps,
  WidgetRegistration,
  WidgetRenderContext,
  WidgetSpanClass,
} from "../types.js";

// The 9 declared span literals from api.md §S3. Keep this list in sync with
// types.ts WidgetSpanClass union — drift here means drift in api.md.
const DECLARED_SPAN_CLASSES: ReadonlySet<WidgetSpanClass> = new Set<WidgetSpanClass>([
  "w-clock",
  "w-stat",
  "w-weather",
  "w-timetrack",
  "w-mini-cal",
  "w-timezones",
  "w-stickies",
  "w-mail",
  "w-upcoming",
]);

describe("DashboardSlotHost composition — row-#10 ↔ row-#11 contract (regression for 2026-05-24 cold-read)", () => {
  it("locks invariant 1: dashboardWidgetRegistrations is a non-empty array", () => {
    expect(Array.isArray(dashboardWidgetRegistrations)).toBe(true);
    expect(dashboardWidgetRegistrations.length).toBeGreaterThanOrEqual(1);
  });

  it("locks invariant 2: every entry has the WidgetRegistration shape", () => {
    for (const reg of dashboardWidgetRegistrations) {
      expect(typeof reg.id).toBe("string");
      expect(reg.id.length).toBeGreaterThan(0);
      expect(typeof reg.span).toBe("string");
      expect(typeof reg.render).toBe("function");
      // ariaLabel is optional; when present must be { en, zh }.
      if (reg.ariaLabel !== undefined) {
        expect(typeof reg.ariaLabel.en).toBe("string");
        expect(typeof reg.ariaLabel.zh).toBe("string");
      }
    }
  });

  it("locks invariant 3: all registered ids are unique (no dedupe drift)", () => {
    const ids = dashboardWidgetRegistrations.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("locks invariant 4: every span is one of the 9 declared WidgetSpanClass literals", () => {
    for (const reg of dashboardWidgetRegistrations) {
      expect(DECLARED_SPAN_CLASSES.has(reg.span)).toBe(true);
    }
  });

  it("locks invariant 5: DashboardSlotHost forwards the array, NOT the empty default", () => {
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

    // Empty state would render `.dash-empty`. Grid path renders
    // `.widget-shell` for each registration. If a future agent reverts
    // to `widgets={[]}` this assertion fails IMMEDIATELY.
    expect(container.querySelector(".dash-empty")).toBeNull();
    const shells = container.querySelectorAll(".widget-shell");
    expect(shells.length).toBe(dashboardWidgetRegistrations.length);
  });

  it("locks invariant 5b: DashboardSlotHost still works under lang=zh (no en-only regression)", () => {
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

    expect(container.querySelector(".dash-empty")).toBeNull();
    const shells = container.querySelectorAll(".widget-shell");
    expect(shells.length).toBe(dashboardWidgetRegistrations.length);
  });

  it("locks invariant 6: 4 type aliases compile against the row #11 registrations", () => {
    // Compile-time only — if the types drift, this file fails to typecheck.
    // The runtime assertions below also exercise the structure so the test
    // is not optimised away as type-only.
    const widgets: WidgetRegistration[] = dashboardWidgetRegistrations;
    const props: DashboardModuleProps = {
      lang: "en",
      widgets,
      goTo: () => {},
    };
    const ctxShape: WidgetRenderContext = { lang: "en", now: new Date(), goTo: () => {} };

    expect(props.widgets).toBe(widgets);
    expect(ctxShape.lang).toBe("en");
  });

  it("locks invariant 7: every render(ctx) returns something React can mount (no early-throw on row #11 widgets)", () => {
    // Use the slot host so each registration mounts under a realistic
    // WebShellProvider / DashboardModule shell. We are not asserting visual
    // correctness here; we only assert that render() does not throw.
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

    // The grid mounted N shells == N registrations — if any render() had
    // thrown, react would have unmounted the boundary and the shells would
    // be missing.
    expect(container.querySelectorAll(".widget-shell").length).toBe(
      dashboardWidgetRegistrations.length,
    );
  });
});
