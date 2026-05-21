import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { emitTo } from "@tauri-apps/api/event";
import {
  getCurrentWindow,
  LogicalSize,
  PhysicalPosition,
} from "@tauri-apps/api/window";
import { ControlHost } from "@repo/core/registry";
import {
  AiCubeControlProvider,
  type AiCubeControlBridge,
} from "@repo/plugin-ai-cube";
import { ORGANIZER_GRID_CREATE_REQUEST_EVENT } from "@repo/plugin-organizer";
import { SettingsProvider, useSettings } from "../context/SettingsContext";

const CLEAR_ALL_REQUEST_EVENT = "organizer:clear-all-request";
const DEFAULT_GRID_SIZE = 220;

const CONTROL_CLOSED_SIZE = { width: 96, height: 96 };
const CONTROL_OPEN_SIZE = { width: 360, height: 560 };

const CASCADE_OFFSET_PX = 32;
const CASCADE_WRAP = 12;

function createId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `grid-${Math.random().toString(16).slice(2)}`;
}

function ControlWindowContent() {
  const settings = useSettings();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const cascadeRef = useRef(0);

  useEffect(() => {
    getCurrentWindow().setIgnoreCursorEvents(false);
  }, []);

  useEffect(() => {
    const apply = async () => {
      const win = getCurrentWindow();
      const before = await win.outerPosition().catch(() => null);
      const size = isPanelOpen ? CONTROL_OPEN_SIZE : CONTROL_CLOSED_SIZE;
      await win.setSize(new LogicalSize(size.width, size.height));
      if (before) {
        await win.setPosition(new PhysicalPosition(before.x, before.y)).catch(() => {
          /* best-effort */
        });
      }
    };
    apply().catch((error) => {
      console.warn("[ControlWindow] setSize failed:", error);
    });
  }, [isPanelOpen]);

  useEffect(() => {
    let unlisten: (() => void) | null = null;
    getCurrentWindow()
      .onFocusChanged(({ payload: focused }) => {
        if (!focused) {
          setIsPanelOpen(false);
        }
      })
      .then((fn) => {
        unlisten = fn;
      })
      .catch((error) => {
        console.warn("[ControlWindow] onFocusChanged subscribe failed:", error);
      });

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  const handleCreateGrid = useCallback(async (anchor: { x: number; y: number }) => {
    const currentWindow = getCurrentWindow();
    const dpr =
      typeof window !== "undefined" && window.devicePixelRatio
        ? window.devicePixelRatio
        : 1;

    let logicalX = 24;
    let logicalY = 80;
    try {
      const windowPosition = await currentWindow.outerPosition();
      logicalX = windowPosition.x / dpr;
      logicalY = windowPosition.y / dpr;
    } catch (error) {
      console.warn(
        "[ControlWindow] outerPosition unavailable; using fallback position",
        error,
      );
    }

    const cascadeStep = cascadeRef.current;
    cascadeRef.current = (cascadeStep + 1) % CASCADE_WRAP;
    const offset = cascadeStep * CASCADE_OFFSET_PX;

    const rect = {
      x: Math.round(logicalX + anchor.x + offset),
      y: Math.round(logicalY + anchor.y + offset),
      width: DEFAULT_GRID_SIZE,
      height: DEFAULT_GRID_SIZE,
    };
    const gridId = createId();

    await emitTo("main", ORGANIZER_GRID_CREATE_REQUEST_EVENT, {
      gridId,
      rect,
      source: "control",
    }).catch((error) => {
      console.error("Failed to notify main window about grid creation:", error);
    });

    await invoke("create_grid_window", { gridId, rect }).catch((error) => {
      console.error("Failed to create grid window directly:", error);
    });

    setIsPanelOpen(false);
  }, []);

  const handleClearAll = useCallback(async () => {
    await emitTo("main", CLEAR_ALL_REQUEST_EVENT, {}).catch((error) => {
      console.error("Failed to request layout clear:", error);
    });
    cascadeRef.current = 0;
    setIsPanelOpen(false);
  }, []);

  const logPlaceholderAction = useCallback((kind: "clipboard" | "pomodoro" | "search") => {
    console.info(`[ControlWindow] ${kind} action remains disabled in F2 preview mode.`);
  }, []);

  const bridge = useMemo<AiCubeControlBridge>(
    () => ({
      shell: {
        isPanelOpen,
        togglePanel() {
          setIsPanelOpen((prev) => !prev);
        },
        closePanel() {
          setIsPanelOpen(false);
        },
        startWindowDrag() {
          return getCurrentWindow().startDragging();
        },
      },
      appearance: {
        cubeColor: settings.cubeColor,
        cubeTextColor: settings.cubeTextColor,
        cubeOpacity: settings.cubeOpacity,
        cubeSize: settings.cubeSize,
        cubeFontSize: settings.cubeFontSize,
        gridOpacity: settings.gridOpacity,
        gridBlur: settings.gridBlur,
        setCubeColor: settings.setCubeColor,
        setCubeTextColor: settings.setCubeTextColor,
        setCubeOpacity: settings.setCubeOpacity,
        setCubeSize: settings.setCubeSize,
        setCubeFontSize: settings.setCubeFontSize,
        setGridOpacity: settings.setGridOpacity,
        setGridBlur: settings.setGridBlur,
      },
      actions: {
        createGrid: handleCreateGrid,
        clearAllGrids: handleClearAll,
        openClipboard() {
          logPlaceholderAction("clipboard");
        },
        openPomodoro() {
          logPlaceholderAction("pomodoro");
        },
        openSearch() {
          void invoke("open_console_window").catch((error) => {
            console.error("Failed to open console window:", error);
          });
          setIsPanelOpen(false);
        },
        openSettings() {
          setIsPanelOpen(true);
        },
      },
    }),
    [
      handleClearAll,
      handleCreateGrid,
      isPanelOpen,
      logPlaceholderAction,
      settings.cubeColor,
      settings.cubeFontSize,
      settings.cubeOpacity,
      settings.cubeSize,
      settings.cubeTextColor,
      settings.gridBlur,
      settings.gridOpacity,
      settings.setCubeColor,
      settings.setCubeFontSize,
      settings.setCubeOpacity,
      settings.setCubeSize,
      settings.setCubeTextColor,
      settings.setGridBlur,
      settings.setGridOpacity,
    ],
  );

  return (
    <AiCubeControlProvider value={bridge}>
      <ControlHost />
    </AiCubeControlProvider>
  );
}

export function ControlWindow() {
  return (
    <SettingsProvider>
      <ControlWindowContent />
    </SettingsProvider>
  );
}

export default ControlWindow;
