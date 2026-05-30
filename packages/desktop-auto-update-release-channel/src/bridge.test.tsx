// @vitest-environment jsdom
import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  DesktopAutoUpdateReleaseChannelBridge,
  useDesktopUpdaterActions,
  useDesktopUpdaterSnapshot,
} from "./bridge";
import type { DesktopUpdaterRuntimeAdapter } from "./types";

function setEnv(key: string, value: string | undefined): void {
  const env = import.meta.env as Record<string, string | undefined>;
  if (value === undefined) {
    delete env[key];
    return;
  }
  env[key] = value;
}

function Probe() {
  const snapshot = useDesktopUpdaterSnapshot();
  const actions = useDesktopUpdaterActions();
  return (
    <div>
      <div data-testid="availability">{snapshot.availability}</div>
      <button onClick={() => void actions.check()} type="button">
        check
      </button>
    </div>
  );
}

describe("DesktopAutoUpdateReleaseChannelBridge", () => {
  it("hydrates and subscribes once", async () => {
    setEnv("VITE_XAI_DESKTOP_HOST", "tauri");

    const getSnapshot = vi.fn(async () => ({
      channel: "internal-rc" as const,
      currentVersion: "1.0.0-rc.1",
      availability: "ready" as const,
    }));

    const subscribe = vi.fn(() => () => undefined);

    (window as Window & { __XAI_DESKTOP_UPDATER__?: DesktopUpdaterRuntimeAdapter }).__XAI_DESKTOP_UPDATER__ = {
      getSnapshot,
      check: vi.fn(async () => ({
        channel: "internal-rc" as const,
        currentVersion: "1.0.0-rc.1",
        availability: "up-to-date" as const,
      })),
      subscribe,
    };

    const { getByTestId } = render(
      <DesktopAutoUpdateReleaseChannelBridge>
        <Probe />
      </DesktopAutoUpdateReleaseChannelBridge>,
    );

    await waitFor(() => {
      expect(getSnapshot).toHaveBeenCalledTimes(1);
      expect(subscribe).toHaveBeenCalledTimes(1);
      expect(getByTestId("availability").textContent).toBe("ready");
    });

    setEnv("VITE_XAI_DESKTOP_HOST", undefined);
  });
});
