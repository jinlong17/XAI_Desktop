// @vitest-environment jsdom
import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DesktopGlobalHotkeyQuickOpenBridge, useDesktopQuickOpenSnapshot } from "./bridge";
import type { DesktopQuickOpenRuntimeAdapter } from "./types";

function Probe() {
  const snapshot = useDesktopQuickOpenSnapshot();
  return <div data-testid="probe">{snapshot.runtime.state}</div>;
}

describe("DesktopGlobalHotkeyQuickOpenBridge", () => {
  it("hydrates and subscribes once", async () => {
    const getSnapshot = vi.fn(async () => ({
      preference: {
        presetId: "default",
        accelerator: "CommandOrControl+Shift+Space",
        enabled: true,
      },
      runtime: {
        state: "ready",
        label: "ok",
        recoverable: true,
      },
    }));

    const subscribe = vi.fn(() => () => undefined);

    (window as Window & { __XAI_DESKTOP_GLOBAL_HOTKEY__?: DesktopQuickOpenRuntimeAdapter }).__XAI_DESKTOP_GLOBAL_HOTKEY__ = {
      getSnapshot,
      setPreference: vi.fn(async () => ({
        preference: {
          presetId: "default",
          accelerator: "CommandOrControl+Shift+Space",
          enabled: true,
        },
        runtime: {
          state: "ready",
          label: "ok",
          recoverable: true,
        },
      })),
      subscribe,
    };

    const { getByTestId } = render(
      <DesktopGlobalHotkeyQuickOpenBridge>
        <Probe />
      </DesktopGlobalHotkeyQuickOpenBridge>,
    );

    await waitFor(() => {
      expect(getSnapshot).toHaveBeenCalledTimes(1);
      expect(subscribe).toHaveBeenCalledTimes(1);
      expect(getByTestId("probe").textContent).toBe("ready");
    });
  });
});
