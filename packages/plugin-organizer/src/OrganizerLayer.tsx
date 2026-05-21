import { memo, useCallback, useState, useEffect, useMemo, useRef } from "react";
import { DesktopItem } from "./types";
import { useGridSystem } from "./useGridSystem";
import { useFileDrop, getFileInfoFromPath, getFileIcon } from "./hooks/useFileDrop";
import { useMultiWindowGrids } from "./hooks/useMultiWindowGrids";
import { listen } from "@tauri-apps/api/event";
import { isTauri } from "@tauri-apps/api/core";
import { useTauriInvoke } from "@repo/core/hooks";
import { createFinderClient } from "./finderClient";
import { FolderGrid } from "./FolderGrid";
import { OrganizerOneClick } from "./OrganizerOneClick";
import {
  LEGACY_CREATE_GRID_REQUEST_EVENT,
  LEGACY_ORGANIZER_CREATE_GRID_REQUEST_EVENT,
  ORGANIZER_GRID_CREATE_REQUEST_EVENT,
  isGridCreateRequestPayload,
} from "./gridEvents";

const CLEAR_ALL_REQUEST_EVENT = "organizer:clear-all-request";

interface CreateGridRequestEvent {
  gridId?: string;
  rect?: {
    x?: number;
    y?: number;
  };
}

function canUseTauriRuntime() {
  if (typeof window === "undefined") return false;
  return isTauri() || Boolean((window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);
}

function normalizeDroppedPath(path: string): string {
  return path.trim().replace(/\/+$/, "");
}

function toGridPathKey(gridId: string, path: string): string {
  return `${gridId}:${path}`;
}

function OrganizerContent() {
  const {
    grids,
    items,
    updateGrid,
    deleteGrid,
    createGrid,
    clearAll,
    addItem,
    addItemToGrid,
    findGridAtPosition,
  } = useGridSystem();
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const hasTauriRuntime = canUseTauriRuntime();
  const recentGridPathDrops = useRef<Map<string, number>>(new Map());

  // Finder client for defensive bookmark registration on the
  // main-window side of `ORGANIZER_FILE_DROP_EVENT`. The grid window
  // is the primary registrant (it receives `tauri://drag-drop` first
  // and registers there inside `OrganizerGridContent`), but registering
  // again here is idempotent on the Rust side (`HashSet<PathBuf>::insert`)
  // and gives us a second line of defense if a future refactor moves
  // the cross-window event seam.
  const { invoke } = useTauriInvoke();
  const finderClient = useMemo(() => createFinderClient(invoke), [invoke]);
  const finderClientRef = useRef(finderClient);
  useEffect(() => {
    finderClientRef.current = finderClient;
  }, [finderClient]);

  const ensureGrid = useCallback(
    (x: number, y: number, title?: string) => {
      const id = createGrid(x, y);
      if (title) updateGrid(id, { title });
      return id;
    },
    [createGrid, updateGrid],
  );

  const addItemToSpecificGrid = useCallback(
    (item: DesktopItem, gridId: string) => {
      const alreadyMapped = Object.values(items).some((current) => current.filepath === item.filepath);
      if (alreadyMapped) return;
      addItem(item);
      addItemToGrid(gridId, item.id);
    },
    [addItem, addItemToGrid, items],
  );

  // Handle file drop for a specific grid (from grid windows)
  const handleGridFileDrop = useCallback(
    (gridId: string, paths: string[]) => {
      const now = Date.now();
      const recentDropTtlMs = 5000;
      const targetGrid = grids.find((grid) => grid.id === gridId);
      const existingPaths = new Set(
        targetGrid?.itemIds
          .map((itemId) => items[itemId]?.filepath)
          .filter((path): path is string => typeof path === "string")
          .map(normalizeDroppedPath) ?? [],
      );

      recentGridPathDrops.current.forEach((receivedAt, key) => {
        if (now - receivedAt > recentDropTtlMs) {
          recentGridPathDrops.current.delete(key);
        }
      });

      paths.forEach((rawPath, index) => {
        const filePath = normalizeDroppedPath(rawPath);
        if (!filePath) return;

        const dedupeKey = toGridPathKey(gridId, filePath);
        const recentDropAt = recentGridPathDrops.current.get(dedupeKey);
        if (existingPaths.has(filePath) || (recentDropAt !== undefined && now - recentDropAt < recentDropTtlMs)) {
          return;
        }

        existingPaths.add(filePath);
        recentGridPathDrops.current.set(dedupeKey, now);

        // G3-E3 / P0-Foxtrot — defensive bookmark registration on the
        // main-window receiver of `ORGANIZER_FILE_DROP_EVENT`. The grid
        // window already registered each path before emitting (see
        // `OrganizerGridContent.handleFileDrop`); registering again here
        // is idempotent on the Rust side (`HashSet<PathBuf>::insert`).
        // Only absolute paths reach this branch — relative paths and
        // basenames are filtered out by `validate_user_path` in the
        // Rust handler, so a basename will simply be rejected on the
        // Rust side without polluting the registry.
        if (filePath.startsWith("/")) {
          void finderClientRef.current
            .registerBookmark(filePath)
            .catch(() => undefined);
        }

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
      });
    },
    [addItem, addItemToGrid, grids, items]
  );

  // Use multi-window grid management in Tauri environment
  // This creates separate native windows for each grid
  useMultiWindowGrids(
    grids,
    items,
    updateGrid,
    deleteGrid,
    handleGridFileDrop,
    hasTauriRuntime // Only enable native windows in the Tauri runtime
  );

  // Handle file drop on main window (creates new grid)
  const handleMainWindowFileDrop = useCallback(
    (paths: string[], position: { x: number; y: number }) => {
      // Find the grid at drop position
      const targetGrid = findGridAtPosition(position.x, position.y);

      // If no grid at position, create a new one
      if (!targetGrid) {
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

  // Listen for create-grid requests from the control window.
  useEffect(() => {
    const unlistenPromise = listen<unknown>(ORGANIZER_GRID_CREATE_REQUEST_EVENT, (event) => {
      if (!isGridCreateRequestPayload(event.payload)) {
        return;
      }
      createGrid(event.payload.rect.x, event.payload.rect.y, event.payload.gridId);
    });
    const unlistenLegacyOrganizerPromise = listen<CreateGridRequestEvent>(
      LEGACY_ORGANIZER_CREATE_GRID_REQUEST_EVENT,
      (event) => {
        const x = event.payload?.rect?.x ?? 64;
        const y = event.payload?.rect?.y ?? 120;
        createGrid(x, y, event.payload?.gridId);
      }
    );
    const unlistenLegacyPromise = listen<{ x?: number; y?: number }>(LEGACY_CREATE_GRID_REQUEST_EVENT, (event) => {
      const x = event.payload?.x ?? 64;
      const y = event.payload?.y ?? 120;
      createGrid(x, y);
    });
    const unlistenClearPromise = listen(CLEAR_ALL_REQUEST_EVENT, () => {
      clearAll();
    });
    return () => {
      unlistenPromise.then((unlisten) => unlisten());
      unlistenLegacyOrganizerPromise.then((unlisten) => unlisten());
      unlistenLegacyPromise.then((unlisten) => unlisten());
      unlistenClearPromise.then((unlisten) => unlisten());
    };
  }, [createGrid, clearAll]);

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
      <div
        style={{
          display: "flex",
          gap: 8,
          left: 12,
          pointerEvents: "auto",
          position: "fixed",
          top: 12,
          zIndex: 20,
        }}
      >
        <OrganizerOneClick grids={grids} onEnsureGrid={ensureGrid} onAddItem={addItemToSpecificGrid} />
        <FolderGrid grids={grids} onEnsureGrid={ensureGrid} onAddItem={addItemToSpecificGrid} />
      </div>

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
