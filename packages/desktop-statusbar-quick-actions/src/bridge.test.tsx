// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import { flushSync } from "react-dom";
import { DesktopStatusbarQuickActionsBridge } from "./bridge";

const state = vi.hoisted(() => ({
  prefs: new Map<string, unknown>(),
  refreshSnapshot: vi.fn(async () => undefined),
  subscribeActions: vi.fn(() => () => undefined),
  emitWebEvent: vi.fn(),
}));

vi.mock("@repo/plugin-web-storage", () => ({
  usePref: (key: string) => [state.prefs.get(key)],
}));

vi.mock("@repo/xai-web-event-bus", () => ({
  emitWebEvent: (...args: unknown[]) => state.emitWebEvent(...args),
}));

vi.mock("./runtime", () => ({
  refreshDesktopStatusbarSnapshot: (...args: unknown[]) => state.refreshSnapshot(...args),
  subscribeDesktopStatusbarQuickActions: (...args: unknown[]) => state.subscribeActions(...args),
}));

describe("DesktopStatusbarQuickActionsBridge", () => {
  let root: Root | null = null;
  let container: HTMLDivElement | null = null;

  beforeEach(() => {
    state.refreshSnapshot.mockReset();
    state.subscribeActions.mockReset();
    state.emitWebEvent.mockReset();
    state.prefs.clear();
    state.prefs.set("xai_pref_features_tasks", true);
    state.prefs.set("xai_pref_features_pomodoro", true);
    window.history.replaceState({}, "", "/app/settings");
  });

  afterEach(() => {
    if (root && container) {
      root.unmount();
    }
    root = null;
    container = null;
  });

  it("publishes feature availability snapshot and subscribes for incoming quick actions", async () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    flushSync(() => {
      root?.render(
        <DesktopStatusbarQuickActionsBridge>
          <div>child</div>
        </DesktopStatusbarQuickActionsBridge>,
      );
    });

    expect(state.refreshSnapshot).toHaveBeenCalledWith({
      tasksFeatureEnabled: true,
      pomodoroFeatureEnabled: true,
    });
    expect(state.subscribeActions).toHaveBeenCalledTimes(1);
  });

  it("navigates and emits module-change when start-pomodoro action arrives", async () => {
    let handler: ((action: "start-pomodoro" | "open-app" | "view-today-tasks") => void) | null = null;
    state.subscribeActions.mockImplementation((callback) => {
      handler = callback as (action: "start-pomodoro" | "open-app" | "view-today-tasks") => void;
      return () => undefined;
    });

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    flushSync(() => {
      root?.render(
        <DesktopStatusbarQuickActionsBridge>
          <div>child</div>
        </DesktopStatusbarQuickActionsBridge>,
      );
    });

    expect(handler).toBeTruthy();
    handler?.("start-pomodoro");

    expect(window.location.pathname).toBe("/app/pomodoro");
    expect(window.location.search).toBe("?desktopAction=start-focus");
    expect(state.emitWebEvent).toHaveBeenCalledWith("web:shell:module-change", {
      moduleId: "pomodoro",
      source: "programmatic",
    });
  });
});
