import { PluginRegistry } from "@repo/core/registry";
import type { ConsoleWindowFrame } from "@repo/core/types";
import { ConsoleLayout } from "../../../../packages/plugin-console/src";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow, LogicalPosition, LogicalSize } from "@tauri-apps/api/window";
import { useEffect } from "react";

async function captureCurrentFrame(): Promise<ConsoleWindowFrame> {
  const currentWindow = getCurrentWindow();
  const [position, size, isFullscreen] = await Promise.all([
    currentWindow.outerPosition(),
    currentWindow.outerSize(),
    currentWindow.isFullscreen(),
  ]);
  return {
    x: position.x,
    y: position.y,
    width: size.width,
    height: size.height,
    isFullscreen,
    navStateVersion: 1,
  };
}

export function ConsoleWindow() {
  useEffect(() => {
    let cancelled = false;

    const restoreAndSync = async () => {
      const frame = await invoke<ConsoleWindowFrame>("get_console_window_frame").catch(
        () => null,
      );
      if (!frame || cancelled) return;
      const currentWindow = getCurrentWindow();
      await currentWindow
        .setPosition(new LogicalPosition(frame.x, frame.y))
        .catch(() => undefined);
      await currentWindow
        .setSize(new LogicalSize(frame.width, frame.height))
        .catch(() => undefined);
      if (frame.isFullscreen) {
        await currentWindow.setFullscreen(true).catch(() => undefined);
      }
    };

    const persist = async () => {
      const frame = await captureCurrentFrame().catch(() => null);
      if (!frame) return;
      await invoke("set_console_window_frame", { frame }).catch(() => undefined);
    };

    void restoreAndSync();
    const onUnload = () => {
      void persist();
    };
    window.addEventListener("beforeunload", onUnload);
    const interval = window.setInterval(() => {
      void persist();
    }, 2500);

    return () => {
      cancelled = true;
      window.removeEventListener("beforeunload", onUnload);
      window.clearInterval(interval);
      void persist();
    };
  }, []);

  return <ConsoleLayout views={PluginRegistry.getConsoleViewRegistrations()} />;
}

export default ConsoleWindow;
