import { useEffect, useState, useCallback, useMemo } from "react";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  DesktopItem,
  GridBox,
  SmartContainer,
  useFileDrop,
} from "@repo/plugin-organizer";
import GlobalDndProvider from "../DndProvider";
import { SettingsProvider, useSettings } from "../../context/SettingsContext";

// Event types for cross-window communication
interface GridUpdateEvent {
  gridId: string;
  grid: GridBox;
  items: Record<string, DesktopItem>;
}

interface GridDeleteEvent {
  gridId: string;
}

/**
 * GridWindowApp renders a single SmartContainer in its own window.
 * It communicates with the main window via Tauri events.
 */
function GridWindowContent({ gridId }: { gridId: string }) {
  const [grid, setGrid] = useState<GridBox | null>(null);
  const [items, setItems] = useState<Record<string, DesktopItem>>({});
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const { gridOpacity, gridBlur } = useSettings();

  // Listen for grid updates from main window
  useEffect(() => {
    const unlistenUpdate = listen<GridUpdateEvent>("grid-update", (event) => {
      if (event.payload.gridId === gridId) {
        setGrid(event.payload.grid);
        setItems(event.payload.items);
      }
    });

    const unlistenDelete = listen<GridDeleteEvent>("grid-delete", (event) => {
      if (event.payload.gridId === gridId) {
        // Close this window when grid is deleted
        getCurrentWindow().close();
      }
    });

    // Request initial data
    getCurrentWindow().emit("grid-window-ready", { gridId });

    return () => {
      unlistenUpdate.then((fn) => fn());
      unlistenDelete.then((fn) => fn());
    };
  }, [gridId]);

  // Emit update to main window
  const emitUpdate = useCallback(
    (patch: Partial<GridBox>) => {
      getCurrentWindow().emit("grid-window-update", {
        gridId,
        patch,
      });
    },
    [gridId]
  );

  // Handle grid updates
  const handleUpdate = useCallback(
    (_id: string, patch: Partial<GridBox>) => {
      // Update local state optimistically
      setGrid((prev) => (prev ? { ...prev, ...patch } : null));

      // Emit to main window
      emitUpdate(patch);
    },
    [emitUpdate]
  );

  // Handle grid close
  const handleClose = useCallback(
    (_id: string) => {
      getCurrentWindow().emit("grid-window-close", { gridId });
    },
    [gridId]
  );

  // Handle fold toggle
  const handleToggleFold = useCallback(
    (_id: string) => {
      emitUpdate({ isFolded: !grid?.isFolded });
    },
    [emitUpdate, grid?.isFolded]
  );

  // Handle lock toggle
  const handleToggleLock = useCallback(
    (_id: string) => {
      emitUpdate({ isLocked: !grid?.isLocked });
    },
    [emitUpdate, grid?.isLocked]
  );

  // Resolve items for the grid
  const resolvedItems = useMemo(() => {
    if (!grid) return [];
    return grid.itemIds.map((id) => items[id]).filter(Boolean);
  }, [grid, items]);

  // Handle file drop
  const handleFileDrop = useCallback(
    (paths: string[], _position: { x: number; y: number }) => {
      console.log("📂 Files dropped on grid window:", gridId, paths);

      // Emit file drop event to main window
      getCurrentWindow().emit("grid-window-file-drop", {
        gridId,
        paths,
      });
    },
    [gridId]
  );

  // Handle drag hover state
  const handleDragHover = useCallback((hovering: boolean) => {
    setIsDraggingFile(hovering);
  }, []);

  // Setup file drop listener
  useFileDrop({
    onDrop: handleFileDrop,
    onHover: handleDragHover,
    enabled: true,
  });

  if (!grid) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "#888",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        // Visual feedback when dragging files
        outline: isDraggingFile ? "3px dashed rgba(56, 189, 248, 0.6)" : "none",
        outlineOffset: "-3px",
        transition: "outline 150ms ease",
      }}
    >
      <SmartContainer
        data={{
          ...grid,
          // Reset position to 0,0 since window position handles placement
          rect: { ...grid.rect, x: 0, y: 0 },
        }}
        items={resolvedItems}
        onUpdate={handleUpdate}
        onClose={handleClose}
        onToggleFold={handleToggleFold}
        onToggleLock={handleToggleLock}
        onFocus={() => {}}
        gridOpacity={gridOpacity}
        gridBlur={gridBlur}
      />
    </div>
  );
}

/**
 * GridWindowApp is the root component for a grid window.
 * It wraps the content with necessary providers.
 */
export function GridWindowApp({ gridId }: { gridId: string }) {
  return (
    <SettingsProvider>
      <GlobalDndProvider>
        <GridWindowContent gridId={gridId} />
      </GlobalDndProvider>
    </SettingsProvider>
  );
}

export default GridWindowApp;
