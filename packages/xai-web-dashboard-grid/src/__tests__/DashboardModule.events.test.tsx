/**
 * AC-EVENT-1..4: DashboardModule emits the right events via the bus.
 * AC-REG-8 indirectly: DashboardSlotHost supplies a goTo that emits
 * web:shell:module-change with the correct source value.
 * AC-EVT-EXT-1..4: gap-closure row #5 — legacy event preserved + new event.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";

import { emitWebEvent, onWebEvent } from "@repo/xai-web-event-bus";
import { useWebShell, WebShellProvider } from "@repo/xai-web-shell";
import type { WebModuleId } from "@repo/core/types";
import { setPref } from "@repo/plugin-web-storage";

import { DashboardModule } from "../DashboardModule.js";
import type { WidgetRegistration } from "../types.js";
import { THREE_WIDGETS } from "./__fixtures__/widgets.js";

const EMPTY: WidgetRegistration[] = [];

const KNOWN_MODULE_IDS: ReadonlySet<WebModuleId> = new Set<WebModuleId>([
  "tasks", "habits", "pomodoro", "calendar", "matrix", "countdown",
  "settings", "board", "dashboard", "meditation", "statistics", "ai", "search",
]);

// Stub dialog methods so picker tests can open/close the native dialog.
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

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

    setPref("xai_dash_order", ["deep-link-test"]);
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

    setPref("xai_dash_order", ["deep-link-test"]);
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

// ---- AC-EVT-EXT-1..4: gap-closure row #5 event regression -----------------
// Verifies legacy event preserved + new event emits + cancel does NOT emit.

describe("DashboardModule events — gap-closure row #5 extension (AC-EVT-EXT)", () => {
  // AC-EVT-EXT-1: Add Widget button STILL emits legacy event (backward compat)
  it("AC-EVT-EXT-1: Add Widget button STILL emits web:dashboard:add-widget-clicked (source=add-widget-button)", () => {
    const listener = vi.fn();
    const off = onWebEvent("web:dashboard:add-widget-clicked", listener);
    render(<DashboardModule lang="en" widgets={THREE_WIDGETS} />);
    const addBtn = document
      .querySelector(".dash-head")!
      .querySelector("button[aria-label='Add a new dashboard widget']") as HTMLButtonElement;
    fireEvent.click(addBtn);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ source: "add-widget-button" });
    off();
  });

  // AC-EVT-EXT-2: Empty State CTA STILL emits legacy event (backward compat)
  it("AC-EVT-EXT-2: Empty State CTA STILL emits web:dashboard:add-widget-clicked (source=empty-state-cta)", () => {
    const listener = vi.fn();
    const off = onWebEvent("web:dashboard:add-widget-clicked", listener);
    render(<DashboardModule lang="en" widgets={EMPTY} />);
    const cta = document.querySelector(".dash-empty__cta") as HTMLButtonElement;
    fireEvent.click(cta);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ source: "empty-state-cta" });
    off();
  });

  // AC-EVT-EXT-3: picker card click emits web:dashboard:widget-added with correct payload
  // REC-1: emit-before-close — assert event fires synchronously before dialog.close()
  it("AC-EVT-EXT-3: picker card click emits web:dashboard:widget-added with {widgetId, source:'picker'} — fires before close()", () => {
    const addedEvents: Array<{ widgetId: string; source: string }> = [];

    // REC-1 ordering: track the sequence of "emit" vs "close" events during
    // the picker-add interaction (not counting the initial mount close).
    const interactionLog: string[] = [];

    // Spy on close to capture order relative to event emission.
    // Note: dialog.close() is ALSO called on initial render (open=false branch).
    // We reset the log right before the user interaction to isolate the sequence.
    const closeSpy = vi.fn(() => {
      interactionLog.push("close");
    });
    HTMLDialogElement.prototype.close = closeSpy;

    const off = onWebEvent("web:dashboard:widget-added", (payload) => {
      addedEvents.push(payload);
      interactionLog.push("emit");
    });

    // Use a single-widget catalog with empty localStorage so picker shows 1 card.
    // The registry defaults (["clock","minicalendar",...]) won't match "solo",
    // so rawOrder = defaults, and "solo" is NOT in that list → picker shows "solo" card.
    const ONE_WIDGET: WidgetRegistration[] = [
      { id: "solo", span: "w-stat", render: () => null },
    ];
    render(<DashboardModule lang="en" widgets={ONE_WIDGET} />);

    // Open picker
    const addBtn = document
      .querySelector(".dash-head")!
      .querySelector("button[aria-label='Add a new dashboard widget']") as HTMLButtonElement;
    fireEvent.click(addBtn);

    // Reset interaction log before the card click so we only observe the
    // emit→close sequence from the add action itself (REC-1 gate).
    interactionLog.length = 0;

    // Click first card
    const firstCard = document.querySelector(".awp-card") as HTMLButtonElement;
    expect(firstCard).toBeTruthy(); // guard: 1 card for "solo"
    fireEvent.click(firstCard);

    // Event was emitted
    expect(addedEvents).toHaveLength(1);
    expect(addedEvents[0]!.source).toBe("picker");
    expect(addedEvents[0]!.widgetId).toBe("solo");

    // REC-1: verify emit happened before close in the interaction sequence.
    // Expected interactionLog: ["emit", "close"] (emit synchronous, close via state→re-render).
    const emitIdx = interactionLog.indexOf("emit");
    const closeIdx = interactionLog.indexOf("close");
    expect(emitIdx).toBeGreaterThanOrEqual(0);
    expect(closeIdx).toBeGreaterThan(emitIdx);

    off();
  });

  // AC-EVT-EXT-4: picker Cancel does NOT emit web:dashboard:widget-added
  it("AC-EVT-EXT-4: picker Cancel does NOT emit web:dashboard:widget-added", () => {
    const listener = vi.fn();
    const off = onWebEvent("web:dashboard:widget-added", listener);

    render(<DashboardModule lang="en" widgets={THREE_WIDGETS} />);

    // Open picker
    const addBtn = document
      .querySelector(".dash-head")!
      .querySelector("button[aria-label='Add a new dashboard widget']") as HTMLButtonElement;
    fireEvent.click(addBtn);

    // Click Cancel
    const cancelBtn = document.querySelector(".awp-actions button") as HTMLButtonElement;
    fireEvent.click(cancelBtn);

    expect(listener).not.toHaveBeenCalled();
    off();
  });
});
