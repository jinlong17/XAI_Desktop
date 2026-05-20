import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { emitTo } from "@tauri-apps/api/event";
import { getCurrentWindow, LogicalSize, PhysicalPosition } from "@tauri-apps/api/window";
import { ORGANIZER_GRID_CREATE_REQUEST_EVENT } from "@repo/plugin-organizer";
import AiCube, { AnchorPosition } from "../components/AiAssistant/AiCube";
import SettingsPanel from "../components/Settings/SettingsPanel";
import { SettingsProvider } from "../context/SettingsContext";

const CLEAR_ALL_REQUEST_EVENT = "organizer:clear-all-request";
const DEFAULT_GRID_SIZE = 220;

// Logical sizes. The control window's *transparent* region still captures
// clicks on macOS (transparency only affects rendering, not hit-test). So when
// the settings panel is closed we shrink the window down to roughly the cube,
// leaving Grid windows underneath fully clickable.
const CONTROL_CLOSED_SIZE = { width: 96, height: 96 };
const CONTROL_OPEN_SIZE = { width: 360, height: 560 };

// Each successive "+ New Grid" click cascades by this offset in CSS pixels so
// new grids don't pile up on top of one another invisibly.
const CASCADE_OFFSET_PX = 32;
const CASCADE_WRAP = 12;

function createId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `grid-${Math.random().toString(16).slice(2)}`;
}

function ControlWindowContent() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState<AnchorPosition>({ x: 24, y: 24 });
  const cascadeRef = useRef(0);

  useEffect(() => {
    getCurrentWindow().setIgnoreCursorEvents(false);
  }, []);

  // Resize the native control window to match panel state. macOS anchors
  // NSWindow.setContentSize at the bottom-left, so after resize we read the
  // pre-resize outerPosition and restore it — keeping the cube visually
  // anchored at the top-left of the (now larger or smaller) window.
  useEffect(() => {
    const apply = async () => {
      const win = getCurrentWindow();
      const before = await win.outerPosition().catch(() => null);
      const size = isPanelOpen ? CONTROL_OPEN_SIZE : CONTROL_CLOSED_SIZE;
      await win.setSize(new LogicalSize(size.width, size.height));
      if (before) {
        await win
          .setPosition(new PhysicalPosition(before.x, before.y))
          .catch(() => {
            /* best-effort: if reposition fails, the window may have shifted */
          });
      }
    };
    apply().catch((error) => {
      console.warn("[ControlWindow] setSize failed:", error);
    });
  }, [isPanelOpen]);

  // Auto-dismiss the settings panel when this window loses focus — typically
  // the user clicked somewhere outside the cube/panel (desktop, another app,
  // a Grid window). This is the closest we can get to "click outside to
  // dismiss" without an NSEvent global monitor.
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
      if (unlisten) unlisten();
    };
  }, []);

  const handleCreateGrid = useCallback(
    async (x: number, y: number) => {
      const currentWindow = getCurrentWindow();
      const dpr = typeof window !== "undefined" && window.devicePixelRatio
        ? window.devicePixelRatio
        : 1;

      // Default rect anchors at the control window's compile-time logical position
      // (24, 80) — see lib.rs setup — so + New Grid still works if `outerPosition`
      // is denied by capabilities or otherwise fails at runtime.
      let logicalX = 24;
      let logicalY = 80;
      try {
        const windowPosition = await currentWindow.outerPosition();
        logicalX = windowPosition.x / dpr;
        logicalY = windowPosition.y / dpr;
      } catch (error) {
        console.warn(
          "[ControlWindow] outerPosition unavailable; using fallback control position for grid placement",
          error,
        );
      }

      // Cascade: every click bumps the next grid down-and-right so multiple
      // creations don't stack invisibly at the same coordinate.
      const cascadeStep = cascadeRef.current;
      cascadeRef.current = (cascadeStep + 1) % CASCADE_WRAP;
      const offset = cascadeStep * CASCADE_OFFSET_PX;

      const rect = {
        x: Math.round(logicalX + x + offset),
        y: Math.round(logicalY + y + offset),
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

      // Auto-close the panel so the control window shrinks and the freshly
      // created grid is immediately clickable. The user re-opens settings with
      // a single click on the cube.
      setIsPanelOpen(false);
    },
    [],
  );

  const handleClearAll = useCallback(async () => {
    await emitTo("main", CLEAR_ALL_REQUEST_EVENT, {}).catch((error) => {
      console.error("Failed to request layout clear:", error);
    });
    cascadeRef.current = 0;
    setIsPanelOpen(false);
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", background: "transparent" }}>
      <AiCube
        isPanelOpen={isPanelOpen}
        onTogglePanel={() => setIsPanelOpen((prev) => !prev)}
        onAnchorChange={setAnchorPosition}
        nativeWindowDrag
      />
      <SettingsPanel
        isOpen={isPanelOpen}
        anchorPosition={anchorPosition}
        onCreateGrid={handleCreateGrid}
        onClearAll={handleClearAll}
        onClose={() => setIsPanelOpen(false)}
      />
    </div>
  );
}

/**
 * ControlWindow is the root component for the AI Cube control window.
 */
export function ControlWindow() {
  return (
    <SettingsProvider>
      <ControlWindowContent />
    </SettingsProvider>
  );
}

export default ControlWindow;
