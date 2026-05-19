import { useEffect, useMemo, useState } from "react";
import { emitTo } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import AiCube, { AnchorPosition } from "../components/AiAssistant/AiCube";
import SettingsPanel from "../components/Settings/SettingsPanel";
import { SettingsProvider } from "../context/SettingsContext";

const CREATE_GRID_REQUEST_EVENT = "organizer:create-grid-request";
const DEFAULT_GRID_SIZE = 220;

function ControlWindowContent() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState<AnchorPosition>({ x: 32, y: 120 });

  useEffect(() => {
    getCurrentWindow().setIgnoreCursorEvents(false);
  }, []);

  const handleCreateGrid = useMemo(
    () => (x: number, y: number) => {
      emitTo("main", CREATE_GRID_REQUEST_EVENT, {
        rect: {
          x,
          y,
          width: DEFAULT_GRID_SIZE,
          height: DEFAULT_GRID_SIZE,
        },
      }).catch((error) => {
        console.error("Failed to request grid creation:", error);
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
