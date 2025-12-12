import { useEffect, useMemo, useState } from "react";
import AiCube, { AnchorPosition } from "./components/AiAssistant/AiCube";
import SettingsPanel from "./components/Settings/SettingsPanel";
import { SettingsProvider } from "./context/SettingsContext";
import OrganizerLayer from "./plugins/OrganizerLayer";
import { GridSystemProvider } from "@repo/plugin-organizer";
import GlobalDndProvider from "./components/DndProvider";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import "./App.css";
import { testClickThrough } from "./test-click-through";

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
      return;
    }

    // Run test to verify API works
    testClickThrough();

    // Enable click-through for desktop interaction
    let cleanup: (() => void) | undefined;
    
    const setupClickThrough = async () => {
      try {
        const appWindow = getCurrentWebviewWindow();
        
        // Initially ignore cursor events (click-through enabled)
        await appWindow.setIgnoreCursorEvents(true);
        console.log("✅ Click-through enabled - desktop files are accessible");

        // Track mouse position to enable/disable click-through
        const handleMouseMove = async (e: MouseEvent) => {
          const target = e.target as HTMLElement;
          
          // Check if mouse is over interactive elements
          const isOverInteractive = 
            target.closest('.ai-cube') ||
            target.closest('.settings-panel') ||
            target.closest('.smart-container');

          if (isOverInteractive) {
            // Disable click-through when over our UI
            await appWindow.setIgnoreCursorEvents(false);
          } else {
            // Enable click-through when over empty space
            await appWindow.setIgnoreCursorEvents(true);
          }
        };

        // Use throttle to avoid too many API calls
        let throttleTimeout: NodeJS.Timeout | null = null;
        const throttledMouseMove = (e: MouseEvent) => {
          if (!throttleTimeout) {
            throttleTimeout = setTimeout(() => {
              handleMouseMove(e);
              throttleTimeout = null;
            }, 50); // 50ms throttle
          }
        };

        document.addEventListener('mousemove', throttledMouseMove);

        cleanup = () => {
          document.removeEventListener('mousemove', throttledMouseMove);
          if (throttleTimeout) clearTimeout(throttleTimeout);
        };
      } catch (error) {
        console.error("Failed to setup click-through:", error);
      }
    };

    setupClickThrough();
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [isTauri]);

  // Close settings panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isPanelOpen) return;

      const target = event.target as HTMLElement;
      
      // Check if click is on settings panel or AI cube
      const settingsPanel = document.querySelector('.settings-panel');
      const aiCube = document.querySelector('.ai-cube');
      
      if (settingsPanel && settingsPanel.contains(target)) return;
      if (aiCube && aiCube.contains(target)) return;
      
      // Click is outside, close panel
      setIsPanelOpen(false);
    };

    if (isPanelOpen) {
      // Use capture phase to catch clicks before other handlers
      document.addEventListener('mousedown', handleClickOutside, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [isPanelOpen]);

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
