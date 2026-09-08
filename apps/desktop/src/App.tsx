import { SettingsProvider } from "./context/SettingsContext";
import { InteractiveProvider } from "./context/InteractiveContext";
import { OrganizerLayer, GridSystemProvider } from "@repo/plugin-organizer";
import GlobalDndProvider from "./providers/DndProvider";
import { useSyncMenuBarStatus } from "./sync/useSyncMenuBarStatus";
import "./App.css";

declare global {
  interface Window {
    __TAURI__?: unknown;
  }
}

function AppInner() {
  useSyncMenuBarStatus();

  return (
    <GridSystemProvider>
      <GlobalDndProvider>
        <div className="app-shell">
          {/* Main window is mostly non-interactive (click-through) */}
          <div className="interactive-layer" style={{ pointerEvents: "none" }}>
            {/* OrganizerLayer handles grid window management */}
            {/* Note: OrganizerLayer manages its own pointerEvents for interactive elements */}
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
      <InteractiveProvider>
        <AppInner />
      </InteractiveProvider>
    </SettingsProvider>
  );
}

export default App;
