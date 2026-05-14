import { useEffect, useState, useCallback, useMemo } from "react";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  DesktopItem,
  GridBox,
  SmartContainer,
  useFileDrop,
} from "@repo/plugin-organizer";
import { GlobalDndProvider } from "../providers/DndProvider";
import { SettingsProvider, useSettings } from "../context/SettingsContext";

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
 * GridWindowContent renders a single SmartContainer in its own native window.
 * Communicates with the main window via Tauri events.
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

  const emitUpdate = useCallback(
    (patch: Partial<GridBox>) => {
      getCurrentWindow().emit("grid-window-update", { gridId, patch });
    },
    [gridId]
  );

  const handleUpdate = useCallback(
    (_id: string, patch: Partial<GridBox>) => {
      setGrid((prev) => (prev ? { ...prev, ...patch } : null));
      emitUpdate(patch);
    },
    [emitUpdate]
  );

  const handleClose = useCallback(
    (_id: string) => {
      getCurrentWindow().emit("grid-window-close", { gridId });
    },
    [gridId]
  );

  const handleToggleFold = useCallback(
    (_id: string) => {
      emitUpdate({ isFolded: !grid?.isFolded });
    },
    [emitUpdate, grid?.isFolded]
  );

  const handleToggleLock = useCallback(
    (_id: string) => {
      emitUpdate({ isLocked: !grid?.isLocked });
    },
    [emitUpdate, grid?.isLocked]
  );

  const resolvedItems = useMemo(() => {
    if (!grid) return [];
    return grid.itemIds.map((id) => items[id]).filter(Boolean);
  }, [grid, items]);

  const handleFileDrop = useCallback(
    (paths: string[], _position: { x: number; y: number }) => {
      getCurrentWindow().emit("grid-window-file-drop", { gridId, paths });
    },
    [gridId]
  );

  const handleDragHover = useCallback((hovering: boolean) => {
    setIsDraggingFile(hovering);
  }, []);

  useFileDrop({
    onDrop: handleFileDrop,
    onHover: handleDragHover,
    enabled: true,
  });

  if (!grid) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#888" }}>
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        outline: isDraggingFile ? "3px dashed rgba(56, 189, 248, 0.6)" : "none",
        outlineOffset: "-3px",
        transition: "outline 150ms ease",
      }}
    >
      <SmartContainer
        data={{ ...grid, rect: { ...grid.rect, x: 0, y: 0 } }}
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
 * GridWindow is the root component for a grid window.
 * Wraps content with necessary providers.
 */
export function GridWindow({ gridId }: { gridId: string }) {
  return (
    <SettingsProvider>
      <GlobalDndProvider>
        <GridWindowContent gridId={gridId} />
      </GlobalDndProvider>
    </SettingsProvider>
  );
}

export default GridWindow;
