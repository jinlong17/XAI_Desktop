import { memo, useCallback, useState, useEffect } from "react";
import { DesktopItem } from "./types";
import { useGridSystem } from "./useGridSystem";
import { useFileDrop, getFileInfoFromPath, getFileIcon } from "./hooks/useFileDrop";
import { useMultiWindowGrids } from "./hooks/useMultiWindowGrids";
import { listen } from "@tauri-apps/api/event";

function OrganizerContent() {
  const {
    grids,
    items,
    updateGrid,
    deleteGrid,
    createGrid,
    addItem,
    addItemToGrid,
    findGridAtPosition,
  } = useGridSystem();
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  // Detect Tauri environment
  const isTauri = typeof window !== "undefined" && "__TAURI__" in window;

  // Handle file drop for a specific grid (from grid windows)
  const handleGridFileDrop = useCallback(
    (gridId: string, paths: string[]) => {
      console.log(`📂 Files dropped on grid ${gridId}:`, paths);

      paths.forEach((filePath, index) => {
        const fileInfo = getFileInfoFromPath(filePath);
        const newItem: DesktopItem = {
          id: `file-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
          filename: fileInfo.name,
          filepath: filePath,
          type: fileInfo.type,
          icon: getFileIcon(fileInfo.extension, fileInfo.type),
          createdAt: Date.now(),
        };

        addItem(newItem);
        addItemToGrid(gridId, newItem.id);
        console.log(`✅ Added file "${fileInfo.name}" to grid ${gridId}`);
      });
    },
    [addItem, addItemToGrid]
  );

  // Use multi-window grid management in Tauri environment
  // This creates separate native windows for each grid
  useMultiWindowGrids(
    grids,
    items,
    updateGrid,
    deleteGrid,
    handleGridFileDrop,
    isTauri // Only enable in Tauri environment
  );

  // Handle file drop on main window (creates new grid)
  const handleMainWindowFileDrop = useCallback(
    (paths: string[], position: { x: number; y: number }) => {
      console.log("📂 Files dropped on main window at position:", position, paths);

      // Find the grid at drop position
      const targetGrid = findGridAtPosition(position.x, position.y);

      // If no grid at position, create a new one
      if (!targetGrid) {
        console.log("📂 No grid at position, creating new one");
        createGrid(position.x, position.y);
        return;
      }

      // If dropped on an existing grid area, forward to that grid's file drop handler
      handleGridFileDrop(targetGrid.id, paths);
    },
    [findGridAtPosition, createGrid, handleGridFileDrop]
  );

  // Handle drag hover state
  const handleDragHover = useCallback((hovering: boolean) => {
    setIsDraggingFile(hovering);
  }, []);

  // Setup file drop listener for main window
  useFileDrop({
    onDrop: handleMainWindowFileDrop,
    onHover: handleDragHover,
    enabled: true,
  });

  // Listen for create-grid requests from the control window
  useEffect(() => {
    const unlistenPromise = listen<{ x?: number; y?: number }>("create-grid-request", (event) => {
      const x = event.payload?.x ?? 64;
      const y = event.payload?.y ?? 120;
      createGrid(x, y);
    });
    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, [createGrid]);

  // Grid info display (for debugging/status)
  const gridCount = grids.length;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        outline: isDraggingFile ? "3px dashed rgba(56, 189, 248, 0.6)" : "none",
        outlineOffset: "-3px",
        transition: "outline 150ms ease",
      }}
      data-organizer-layer="true"
    >
      {/* Drop hint when dragging files and no grids exist */}
      {isDraggingFile && gridCount === 0 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "24px 32px",
            borderRadius: 16,
            background: "rgba(15, 23, 42, 0.8)",
            border: "2px dashed rgba(56, 189, 248, 0.6)",
            color: "#e7ecf3",
            fontSize: 16,
            fontWeight: 500,
            pointerEvents: "none",
          }}
        >
          Drop files here to create a new Grid
        </div>
      )}

      {isTauri && gridCount > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: 12,
            left: 12,
            padding: "6px 12px",
            borderRadius: 6,
            background: "rgba(15, 23, 42, 0.7)",
            color: "#94a3b8",
            fontSize: 12,
            pointerEvents: "none",
          }}
        >
          🪟 {gridCount} grid window{gridCount !== 1 ? "s" : ""} active
        </div>
      )}
    </div>
  );
}

/**
 * OrganizerLayer renders the organizer plugin's overlay on the main window.
 * Manages grid window lifecycle, file drops, and cross-window communication.
 */
export const OrganizerLayer = memo(function OrganizerLayer() {
  return <OrganizerContent />;
});

export default OrganizerLayer;
