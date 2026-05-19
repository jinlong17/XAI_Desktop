import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { emitTo } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import AiCube, { AnchorPosition } from "../components/AiAssistant/AiCube";
import SettingsPanel from "../components/Settings/SettingsPanel";
import { SettingsProvider } from "../context/SettingsContext";

const CREATE_GRID_REQUEST_EVENT = "organizer:create-grid-request";
const DEFAULT_GRID_SIZE = 220;

function createId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `grid-${Math.random().toString(16).slice(2)}`;
}

function ControlWindowContent() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState<AnchorPosition>({ x: 24, y: 24 });

  useEffect(() => {
    getCurrentWindow().setIgnoreCursorEvents(false);
  }, []);

  const handleCreateGrid = useCallback(
    async (x: number, y: number) => {
      const currentWindow = getCurrentWindow();
      const [windowPosition, scaleFactor] = await Promise.all([
        currentWindow.outerPosition(),
        currentWindow.scaleFactor(),
      ]);
      const rect = {
        x: Math.round(windowPosition.x / scaleFactor + x),
        y: Math.round(windowPosition.y / scaleFactor + y),
        width: DEFAULT_GRID_SIZE,
        height: DEFAULT_GRID_SIZE,
      };
      const gridId = createId();

      await emitTo("main", CREATE_GRID_REQUEST_EVENT, { gridId, rect }).catch((error) => {
        console.error("Failed to notify main window about grid creation:", error);
      });

      await invoke("create_grid_window", { gridId, rect }).catch((error) => {
        console.error("Failed to create grid window directly:", error);
      });
    },
    [],
  );

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
