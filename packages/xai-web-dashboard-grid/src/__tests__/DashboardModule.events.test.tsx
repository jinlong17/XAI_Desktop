/**
 * AC-EVENT-1..4: DashboardModule emits the right events via the bus.
 * AC-REG-8 indirectly: DashboardSlotHost supplies a goTo that emits
 * web:shell:module-change with the correct source value.
 */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";

import { emitWebEvent, onWebEvent } from "@repo/xai-web-event-bus";
import { useWebShell, WebShellProvider } from "@repo/xai-web-shell";
import type { WebModuleId } from "@repo/core/types";

import { DashboardModule } from "../DashboardModule.js";
import type { WidgetRegistration } from "../types.js";

const EMPTY: WidgetRegistration[] = [];

const KNOWN_MODULE_IDS: ReadonlySet<WebModuleId> = new Set<WebModuleId>([
  "tasks", "habits", "pomodoro", "calendar", "matrix", "countdown",
  "settings", "board", "dashboard", "meditation", "statistics", "ai", "search",
]);

describe("DashboardModule events (P3)", () => {
  it("AC-EVENT-1: Add-widget header button click emits add-widget-button event", () => {
    const listener = vi.fn();
    const off = onWebEvent("web:dashboard:add-widget-clicked", listener);
    render(<DashboardModule lang="en" widgets={EMPTY} />);
    const header = document
      .querySelector(".dash-head")!
      .querySelector("button[aria-label='Add a new dashboard widget']") as HTMLButtonElement;
    fireEvent.click(header);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ source: "add-widget-button" });
    off();
  });

  it("AC-EVENT-2: empty-state CTA click emits empty-state-cta event", () => {
    const listener = vi.fn();
    const off = onWebEvent("web:dashboard:add-widget-clicked", listener);
    render(<DashboardModule lang="en" widgets={EMPTY} />);
    const cta = document.querySelector(".dash-empty__cta") as HTMLButtonElement;
    fireEvent.click(cta);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ source: "empty-state-cta" });
    off();
  });

  it("AC-EVENT-1 + AC-EVENT-2: both buttons emit when both clicked", () => {
    const listener = vi.fn();
    const off = onWebEvent("web:dashboard:add-widget-clicked", listener);
    render(<DashboardModule lang="en" widgets={EMPTY} />);
    const header = document
      .querySelector(".dash-head")!
      .querySelector("button[aria-label='Add a new dashboard widget']") as HTMLButtonElement;
    const cta = document.querySelector(".dash-empty__cta") as HTMLButtonElement;
    fireEvent.click(header);
    fireEvent.click(cta);
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener.mock.calls[0]?.[0]).toEqual({ source: "add-widget-button" });
    expect(listener.mock.calls[1]?.[0]).toEqual({ source: "empty-state-cta" });
    off();
  });

  it("AC-EVENT-4: no events fire on initial render (mount must be quiet)", () => {
    const listener = vi.fn();
    const off = onWebEvent("web:dashboard:add-widget-clicked", listener);
    render(<DashboardModule lang="en" widgets={EMPTY} />);
    expect(listener).not.toHaveBeenCalled();
    off();
  });

  it("AC-EVENT-3 / AC-REG-8: widget goTo(moduleId) emits web:shell:module-change with mini-cal source", () => {
    const listener = vi.fn();
    const off = onWebEvent("web:shell:module-change", listener);

    function makeGoTo(): (moduleId: string) => void {
      return (moduleId: string) => {
        if (!KNOWN_MODULE_IDS.has(moduleId as WebModuleId)) return;
        emitWebEvent("web:shell:module-change", {
          moduleId: moduleId as WebModuleId,
          source: "mini-cal",
        });
      };
    }

    const widgets: WidgetRegistration[] = [
      {
        id: "deep-link-test",
        span: "w-mini-cal",
        render: (ctx) => (
          <button data-testid="goto-calendar" onClick={() => ctx.goTo("calendar")}>
            jump
          </button>
        ),
      },
    ];

    function HostWrapper() {
      const { lang } = useWebShell();
      return <DashboardModule lang={lang} widgets={widgets} goTo={makeGoTo()} />;
    }

    const { getByTestId } = render(
      <WebShellProvider
        modules={[]}
        lang="en"
        railPos="left"
        petOn={false}
        setPetOn={() => {}}
      >
        <HostWrapper />
      </WebShellProvider>,
    );
    fireEvent.click(getByTestId("goto-calendar"));
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ moduleId: "calendar", source: "mini-cal" }),
    );
    off();
  });

  it("AC-EVENT-3: goTo with unknown moduleId is silently ignored (matches DashboardSlotHost guard)", () => {
    const listener = vi.fn();
    const off = onWebEvent("web:shell:module-change", listener);

    function makeGoTo(): (moduleId: string) => void {
      return (moduleId: string) => {
        if (!KNOWN_MODULE_IDS.has(moduleId as WebModuleId)) return;
        emitWebEvent("web:shell:module-change", {
          moduleId: moduleId as WebModuleId,
          source: "mini-cal",
        });
      };
    }

    const widgets: WidgetRegistration[] = [
      {
        id: "deep-link-test",
        span: "w-mini-cal",
        render: (ctx) => (
          <button data-testid="bad-goto" onClick={() => ctx.goTo("not-a-real-module")}>
            jump
          </button>
        ),
      },
    ];

    function HostWrapper() {
      const { lang } = useWebShell();
      return <DashboardModule lang={lang} widgets={widgets} goTo={makeGoTo()} />;
    }

    const { getByTestId } = render(
      <WebShellProvider
        modules={[]}
        lang="en"
        railPos="left"
        petOn={false}
        setPetOn={() => {}}
      >
        <HostWrapper />
      </WebShellProvider>,
    );
    fireEvent.click(getByTestId("bad-goto"));
    expect(listener).not.toHaveBeenCalled();
    off();
  });
});
