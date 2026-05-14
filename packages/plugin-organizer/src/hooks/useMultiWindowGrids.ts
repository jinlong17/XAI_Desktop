import { useEffect, useRef, useCallback } from "react";
import { listen } from "@tauri-apps/api/event";
import { emit } from "@tauri-apps/api/event";
import { GridBox, DesktopItem } from "../types";
import {
  createGridWindow,
  updateGridWindow,
  closeGridWindow,
  GridWindowRect,
} from "./useGridWindow";

// Debug logging helper - only console.log to avoid infinite loops
const debugLog = (msg: string) => {
  console.log(msg);
};

interface GridWindowUpdateEvent {
  gridId: string;
  patch: Partial<GridBox>;
}

interface GridWindowCloseEvent {
  gridId: string;
}

interface GridWindowFileDropEvent {
  gridId: string;
  paths: string[];
}

interface GridWindowReadyEvent {
  gridId: string;
}

/**
 * Hook to manage grid windows in multi-window architecture.
 * Creates/updates/closes native windows when grids change.
 */
export function useMultiWindowGrids(
  grids: GridBox[],
  items: Record<string, DesktopItem>,
  onGridUpdate: (id: string, patch: Partial<GridBox>) => void,
  onGridDelete: (id: string) => void,
  onFileDrop: (gridId: string, paths: string[]) => void,
  enabled: boolean = true
) {
  // Track which windows are currently open
  const openWindows = useRef<Set<string>>(new Set());
  // Track pending window creations to avoid duplicates
  const pendingCreations = useRef<Set<string>>(new Set());
  // Debounce timer for window updates
  const updateTimers = useRef<Map<string, number>>(new Map());
  // Queue for serialized window creation
  const creationQueue = useRef<GridBox[]>([]);
  const isProcessingQueue = useRef(false);

  // Convert GridBox rect to window rect
  const toWindowRect = useCallback((grid: GridBox): GridWindowRect => {
    return {
      x: grid.rect.x,
      y: grid.rect.y,
      width: grid.rect.width,
      height: grid.rect.height,
    };
  }, []);

  // Process creation queue one at a time
  const processCreationQueue = useCallback(async () => {
    if (isProcessingQueue.current || creationQueue.current.length === 0) {
      return;
    }

    isProcessingQueue.current = true;

    while (creationQueue.current.length > 0) {
      const grid = creationQueue.current.shift()!;
      const shortId = grid.id.slice(0, 8);
      const windowRect = toWindowRect(grid);

      if (openWindows.current.has(grid.id)) {
        debugLog(`⏭️ Skip existing: ${shortId}...`);
        continue;
      }

      debugLog(`🆕 Creating window: ${shortId}...`);
      pendingCreations.current.add(grid.id);

      try {
        await createGridWindow(grid.id, windowRect);
        openWindows.current.add(grid.id);
        debugLog(`🪟 Window created: ${shortId}...`);

        // Small delay between window creations to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        debugLog(`❌ Create failed: ${error}`);
      } finally {
        pendingCreations.current.delete(grid.id);
      }
    }

    isProcessingQueue.current = false;
  }, [toWindowRect]);

  // Create or update window for a grid
  const syncGridWindow = useCallback(
    async (grid: GridBox) => {
      if (!enabled) {
        debugLog(`⚠️ syncGridWindow skipped - disabled`);
        return;
      }

      const windowRect = toWindowRect(grid);
      const shortId = grid.id.slice(0, 8);

      if (openWindows.current.has(grid.id)) {
        // Window exists, update it (debounced)
        const existingTimer = updateTimers.current.get(grid.id);
        if (existingTimer) {
          window.clearTimeout(existingTimer);
        }

        const timer = window.setTimeout(async () => {
          try {
            await updateGridWindow(grid.id, windowRect);
          } catch (error) {
            debugLog(`❌ Update failed: ${shortId}...`);
          }
          updateTimers.current.delete(grid.id);
        }, 50);

        updateTimers.current.set(grid.id, timer);
      } else if (!pendingCreations.current.has(grid.id)) {
        // Queue window creation instead of creating immediately
        if (!creationQueue.current.some(g => g.id === grid.id)) {
          creationQueue.current.push(grid);
          processCreationQueue();
        }
      } else {
        debugLog(`⏳ Pending: ${shortId}...`);
      }
    },
    [enabled, toWindowRect, processCreationQueue]
  );

  // Close window for a grid
  const closeWindow = useCallback(
    async (gridId: string) => {
      if (!enabled) return;

      // Clear any pending update timer
      const timer = updateTimers.current.get(gridId);
      if (timer) {
        window.clearTimeout(timer);
        updateTimers.current.delete(gridId);
      }

      if (openWindows.current.has(gridId)) {
        try {
          await closeGridWindow(gridId);
          openWindows.current.delete(gridId);
          console.log(`🗑️ Closed window for grid: ${gridId}`);
        } catch (error) {
          console.error(`Failed to close window for grid ${gridId}:`, error);
        }
      }
    },
    [enabled]
  );

  // Sync windows when grids change
  useEffect(() => {
    debugLog(`📊 sync - enabled: ${enabled}, grids: ${grids.length}`);

    if (!enabled) {
      debugLog("⚠️ Multi-window disabled");
      return;
    }

    const currentGridIds = new Set(grids.map((g) => g.id));

    // Create/update windows for existing grids
    grids.forEach((grid) => {
      debugLog(`🔄 Syncing: ${grid.id.slice(0, 8)}...`);
      syncGridWindow(grid);
    });

    // Close windows for deleted grids
    openWindows.current.forEach((gridId) => {
      if (!currentGridIds.has(gridId)) {
        debugLog(`🗑️ Closing: ${gridId.slice(0, 8)}...`);
        closeWindow(gridId);
      }
    });
  }, [grids, enabled, syncGridWindow, closeWindow]);

  // Listen for events from grid windows
  useEffect(() => {
    if (!enabled) return;

    // Listen for update events from grid windows
    const unlistenUpdate = listen<GridWindowUpdateEvent>(
      "grid-window-update",
      (event) => {
        const { gridId, patch } = event.payload;
        console.log(`📨 Received update from grid window: ${gridId}`, patch);
        onGridUpdate(gridId, patch);
      }
    );

    // Listen for close events from grid windows
    const unlistenClose = listen<GridWindowCloseEvent>(
      "grid-window-close",
      (event) => {
        const { gridId } = event.payload;
        console.log(`📨 Received close from grid window: ${gridId}`);
        onGridDelete(gridId);
      }
    );

    // Listen for file drop events from grid windows
    const unlistenFileDrop = listen<GridWindowFileDropEvent>(
      "grid-window-file-drop",
      (event) => {
        const { gridId, paths } = event.payload;
        console.log(`📨 Received file drop from grid window: ${gridId}`, paths);
        onFileDrop(gridId, paths);
      }
    );

    // Listen for grid window ready events (to send initial data)
    const unlistenReady = listen<GridWindowReadyEvent>(
      "grid-window-ready",
      (event) => {
        const { gridId } = event.payload;
        console.log(`📨 Grid window ready: ${gridId}`);

        // Find the grid and send its data
        const grid = grids.find((g) => g.id === gridId);
        if (grid) {
          emit("grid-update", {
            gridId,
            grid,
            items,
          });
        }
      }
    );

    return () => {
      unlistenUpdate.then((fn) => fn());
      unlistenClose.then((fn) => fn());
      unlistenFileDrop.then((fn) => fn());
      unlistenReady.then((fn) => fn());
    };
  }, [enabled, grids, items, onGridUpdate, onGridDelete, onFileDrop]);

  // Broadcast grid updates to all windows
  useEffect(() => {
    if (!enabled) return;

    // When grids or items change, broadcast to all grid windows
    grids.forEach((grid) => {
      if (openWindows.current.has(grid.id)) {
        emit("grid-update", {
          gridId: grid.id,
          grid,
          items,
        });
      }
    });
  }, [grids, items, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all timers
      updateTimers.current.forEach((timer) => window.clearTimeout(timer));
      updateTimers.current.clear();

      // Close all windows
      if (enabled) {
        openWindows.current.forEach((gridId) => {
          closeGridWindow(gridId).catch(console.error);
        });
      }
    };
  }, [enabled]);

  return {
    openWindows: openWindows.current,
  };
}
