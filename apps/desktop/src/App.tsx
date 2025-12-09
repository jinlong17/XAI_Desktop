import { useEffect, useMemo, useState } from "react";
import AiCube, { AnchorPosition } from "./components/AiAssistant/AiCube";
import SettingsPanel from "./components/Settings/SettingsPanel";
import { SettingsProvider } from "./context/SettingsContext";
import OrganizerLayer from "./plugins/OrganizerLayer";
import { GridSystemProvider } from "@repo/plugin-organizer";
import GlobalDndProvider from "./components/DndProvider";
import "./App.css";

declare global {
  interface Window {
    __TAURI__?: unknown;
  }
}

function AppInner() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState<AnchorPosition>({ x: 32, y: 120 });

  const isTauri = useMemo(() => typeof window !== "undefined" && Boolean(window.__TAURI__), []);

  useEffect(() => {
    if (!isTauri) {
      // Allows browser testing without crashing when Tauri APIs are missing.
      console.info("Running in browser mock mode: Tauri APIs are stubbed.");
    }
  }, [isTauri]);

  return (
    <GridSystemProvider>
      <GlobalDndProvider>
        <div className="app-shell">
          <div className="interactive-layer">
            <AiCube
              isPanelOpen={isPanelOpen}
              onTogglePanel={() => setIsPanelOpen((prev) => !prev)}
              onAnchorChange={setAnchorPosition}
            />
            <SettingsPanel isOpen={isPanelOpen} anchorPosition={anchorPosition} />
            <OrganizerLayer />
          </div>
        </div>
      </GlobalDndProvider>
    </GridSystemProvider>
  );
}

function App() {
  return (
    <SettingsProvider>
      <AppInner />
    </SettingsProvider>
  );
}

export default App;
