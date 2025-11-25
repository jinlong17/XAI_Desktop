import { useEffect, useMemo, useState } from "react";
import AiCube, { AnchorPosition } from "./components/AiAssistant/AiCube";
import SettingsPanel from "./components/Settings/SettingsPanel";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import OrganizerLayer from "./plugins/OrganizerLayer";
import { GridSystemProvider } from "@repo/plugin-organizer";
import GlobalDndProvider from "./components/DndProvider";
import "./App.css";

declare global {
  interface Window {
    __TAURI__?: unknown;
  }
}

const WALLPAPER_URL =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80";

const MOCK_DATA = [
  { task: "Buy Milk", context: "Groceries plugin quick task" },
  { task: "Email Boss", context: "Send daily digest after focus session" },
  { task: "Project X.pdf", context: "Pin reference for overlay view" },
  { task: "Prep Deck", context: "Launch meeting notes plugin" },
];

function CanvasLayer({ isTauri }: { isTauri: boolean }) {
  const { canvasOpacity, isBlurEnabled } = useSettings();

  const layerStyle = useMemo(() => {
    const isTransparent = canvasOpacity <= 0.001;
    const tint = `rgba(15, 23, 42, ${canvasOpacity})`;
    const wallpaperStyles = {
      backgroundImage: `url(${WALLPAPER_URL})`,
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
    } as const;

    return {
      backgroundColor: isTransparent ? "transparent" : tint,
      filter: isBlurEnabled ? "blur(12px)" : "none",
      backdropFilter: isBlurEnabled ? "blur(12px)" : "none",
      ...(isTauri ? {} : isTransparent ? {} : wallpaperStyles),
    };
  }, [canvasOpacity, isBlurEnabled, isTauri]);

  return (
    <div
      className="background-layer border border-red-500"
      style={layerStyle}
      aria-hidden
    />
  );
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
        <div className="app-shell border border-red-500 opacity-50">
          <CanvasLayer isTauri={isTauri} />
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
  useMemo(() => MOCK_DATA, []);

  return (
    <SettingsProvider>
      <AppInner />
    </SettingsProvider>
  );
}

export default App;
