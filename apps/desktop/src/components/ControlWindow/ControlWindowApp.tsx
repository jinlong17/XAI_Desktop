import { useEffect, useMemo, useState } from "react";
import { emit } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import AiCube, { AnchorPosition } from "../AiAssistant/AiCube";
import SettingsPanel from "../Settings/SettingsPanel";
import { SettingsProvider } from "../../context/SettingsContext";

function ControlWindowContent() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState<AnchorPosition>({ x: 32, y: 120 });

  useEffect(() => {
    getCurrentWindow().setIgnoreCursorEvents(false);
  }, []);

  const handleCreateGrid = useMemo(
    () => (x: number, y: number) => {
      emit("create-grid-request", { x, y });
    },
    [],
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "transparent",
      }}
    >
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

export function ControlWindowApp() {
  return (
    <SettingsProvider>
      <ControlWindowContent />
    </SettingsProvider>
  );
}

export default ControlWindowApp;
