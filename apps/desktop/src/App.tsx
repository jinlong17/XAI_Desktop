import { SettingsProvider } from "./context/SettingsContext";
import { InteractiveProvider } from "./context/InteractiveContext";
import { OrganizerLayer, GridSystemProvider } from "@repo/plugin-organizer";
import GlobalDndProvider from "./providers/DndProvider";
import "./App.css";

declare global {
  interface Window {
    __TAURI__?: unknown;
  }
}

function AppInner() {
  return (
    <GridSystemProvider>
      <GlobalDndProvider>
        <div className="app-shell">
          {/* Main window is mostly non-interactive (click-through) */}
          <div className="interactive-layer" style={{ pointerEvents: "none" }}>
            {/* Status indicator for multi-window mode */}
            <div
              style={{
                position: "fixed",
                top: 20,
                left: "50%",
                transform: "translateX(-50%)",
                padding: "8px 16px",
                background: "rgba(0, 0, 0, 0.7)",
                color: "#94a3b8",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                zIndex: 9999,
                pointerEvents: "none",
              }}
            >
              Multi-Window Mode - Grids render in separate windows
            </div>

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
