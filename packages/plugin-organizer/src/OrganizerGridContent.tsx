import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TauriEvent, useTauriEvent, useTauriWindow } from "@repo/core/hooks";
import { colorTokens, motionTokens, radiusTokens, spaceTokens, typographyTokens } from "@repo/ui/tokens";
import type { DesktopItem, GridBox } from "./types";
import { SmartContainer } from "./SmartContainer";
import type { FinderClient } from "./finderClient";
import {
  ORGANIZER_FILE_DROP_EVENT,
  ORGANIZER_GRID_CLOSE_EVENT,
  ORGANIZER_GRID_DELETE_EVENT,
  ORGANIZER_GRID_READY_EVENT,
  ORGANIZER_GRID_STATE_EVENT,
  ORGANIZER_GRID_UPDATE_EVENT,
  isGridClosePayload,
  isGridStatePayload,
  toDroppedFile,
} from "./gridEvents";

interface TauriDragDropPayload {
  paths?: unknown;
  position?: {
    x?: unknown;
    y?: unknown;
  };
}

export interface OrganizerGridContentProps {
  gridId: string;
  gridOpacity?: number;
  gridBlur?: boolean;
  /**
   * Optional Finder client used to register a user-authorized path
   * bookmark for every dropped path (G3-E3 / P0-Foxtrot — honest
   * provenance).
   */
  finderClient?: FinderClient;
}

function coerceDragDropPaths(payload: TauriDragDropPayload): string[] {
  if (!Array.isArray(payload.paths)) return [];
  return payload.paths.filter((path): path is string => typeof path === "string" && path.length > 0);
}

/**
 * Public Organizer-owned content for a single native Grid window.
 *
 * The desktop Host owns native window providers and drag chrome; this component
 * owns Grid business UI, cross-window state events, and path-first drop wiring.
 */
export function OrganizerGridContent({
  gridId,
  gridOpacity = 0.8,
  gridBlur = true,
  finderClient,
}: OrganizerGridContentProps) {
  const [grid, setGrid] = useState<GridBox | null>(null);
  const [items, setItems] = useState<Record<string, DesktopItem>>({});
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const lastDropKeyRef = useRef<{ key: string; receivedAt: number } | null>(null);
  const gridRef = useRef<GridBox | null>(null);
  const finderClientRef = useRef<FinderClient | undefined>(finderClient);
  const lastRectEmitAtRef = useRef(0);
  const pendingRectPatchRef = useRef<Partial<GridBox> | null>(null);
  const rectEmitTimerRef = useRef<number | null>(null);

  const tauriWindow = useTauriWindow();

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  useEffect(() => {
    finderClientRef.current = finderClient;
  }, [finderClient]);

  useEffect(() => {
    return () => {
      if (rectEmitTimerRef.current !== null) {
        window.clearTimeout(rectEmitTimerRef.current);
      }
    };
  }, []);

  useTauriEvent<unknown>(ORGANIZER_GRID_STATE_EVENT, (event) => {
    if (!isGridStatePayload(event.payload)) {
      return;
    }
    if (event.payload.gridId === gridId) {
      setGrid(event.payload.grid);
      setItems(event.payload.items);
    }
  });

  useTauriEvent<unknown>(ORGANIZER_GRID_CLOSE_EVENT, (event) => {
    if (!isGridClosePayload(event.payload)) {
      return;
    }
    if (event.payload.gridId === gridId) {
      tauriWindow.close();
    }
  });

  useEffect(() => {
    tauriWindow.emit(ORGANIZER_GRID_READY_EVENT, { gridId });
  }, [gridId, tauriWindow]);

  const emitUpdate = useCallback(
    (patch: Partial<GridBox>) => {
      tauriWindow.emit(ORGANIZER_GRID_UPDATE_EVENT, { gridId, changes: patch });
    },
    [gridId, tauriWindow],
  );

  const handleUpdate = useCallback(
    (_id: string, patch: Partial<GridBox>) => {
      const prev = gridRef.current;
      if (!prev) return;
      let safePatch: Partial<GridBox> = patch;
      if (patch.rect) {
        safePatch = {
          ...patch,
          rect: {
            ...prev.rect,
            width: patch.rect.width,
            height: patch.rect.height,
          },
        };
      }
      setGrid({ ...prev, ...safePatch });

      if (!safePatch.rect) {
        emitUpdate(safePatch);
        return;
      }

      const now = Date.now();
      const elapsed = now - lastRectEmitAtRef.current;
      const budgetMs = 120;

      const emitPatch = (nextPatch: Partial<GridBox>) => {
        lastRectEmitAtRef.current = Date.now();
        emitUpdate(nextPatch);
      };

      if (elapsed >= budgetMs) {
        emitPatch(safePatch);
        return;
      }

      pendingRectPatchRef.current = safePatch;
      if (rectEmitTimerRef.current !== null) {
        return;
      }

      rectEmitTimerRef.current = window.setTimeout(() => {
        rectEmitTimerRef.current = null;
        const pending = pendingRectPatchRef.current;
        pendingRectPatchRef.current = null;
        if (pending) {
          emitPatch(pending);
        }
      }, budgetMs - elapsed);
    },
    [emitUpdate],
  );

  const handleClose = useCallback(
    (_id: string) => {
      tauriWindow.emit(ORGANIZER_GRID_CLOSE_EVENT, { gridId });
    },
    [gridId, tauriWindow],
  );

  const handleDelete = useCallback(
    (_id: string) => {
      tauriWindow.emit(ORGANIZER_GRID_DELETE_EVENT, { gridId });
    },
    [gridId, tauriWindow],
  );

  const handleToggleFold = useCallback(
    (_id: string) => {
      emitUpdate({ isFolded: !grid?.isFolded });
    },
    [emitUpdate, grid?.isFolded],
  );

  const handleToggleLock = useCallback(
    (_id: string) => {
      emitUpdate({ isLocked: !grid?.isLocked });
    },
    [emitUpdate, grid?.isLocked],
  );

  const handleUpdateItem = useCallback((itemId: string, patch: Partial<DesktopItem>) => {
    setItems((prev) => {
      const item = prev[itemId];
      if (!item) return prev;
      return {
        ...prev,
        [itemId]: { ...item, ...patch },
      };
    });
  }, []);

  const resolvedItems = useMemo(() => {
    if (!grid) return [];
    return grid.itemIds
      .map((id) => items[id])
      .filter((item): item is DesktopItem => Boolean(item));
  }, [grid, items]);

  const handleFileDrop = useCallback(
    (paths: string[]) => {
      const dropKey = JSON.stringify(paths);
      const now = Date.now();
      const lastDropKey = lastDropKeyRef.current;
      if (lastDropKey?.key === dropKey && now - lastDropKey.receivedAt < 1000) {
        return;
      }
      lastDropKeyRef.current = { key: dropKey, receivedAt: now };

      const client = finderClientRef.current;
      if (client) {
        for (const path of paths) {
          void client.registerBookmark(path).catch(() => {
            // Bookmark failures are intentionally non-fatal for drop UX.
          });
        }
      }

      tauriWindow.emit(ORGANIZER_FILE_DROP_EVENT, {
        gridId,
        files: paths.map(toDroppedFile),
      });
    },
    [gridId, tauriWindow],
  );

  useTauriEvent<TauriDragDropPayload>(TauriEvent.DRAG_DROP, (event) => {
    const paths = coerceDragDropPaths(event.payload);
    setIsDraggingFile(false);
    if (paths.length === 0) {
      return;
    }
    handleFileDrop(paths);
  });
  useTauriEvent(TauriEvent.DRAG_ENTER, () => setIsDraggingFile(true));
  useTauriEvent(TauriEvent.DRAG_OVER, () => setIsDraggingFile(true));
  useTauriEvent(TauriEvent.DRAG_LEAVE, () => setIsDraggingFile(false));

  if (!grid) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "grid",
          placeItems: "center",
          padding: spaceTokens.xl,
          background: colorTokens.surfaceGlass,
          color: colorTokens.textSecondary,
          fontFamily: typographyTokens.fontFamilySans,
          borderRadius: radiusTokens.xl,
          border: `1px solid ${colorTokens.borderSubtle}`,
          backdropFilter: gridBlur ? "blur(12px)" : "none",
          WebkitBackdropFilter: gridBlur ? "blur(12px)" : "none",
        }}
      >
        <span
          style={{
            fontSize: typographyTokens.fontSizeLabelPx,
            letterSpacing: typographyTokens.letterSpacingTight,
            transition: `opacity ${motionTokens.durationBaseMs}ms ${motionTokens.easingStandard}`,
          }}
        >
          Loading organizer grid...
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        outline: isDraggingFile ? `2px dashed ${colorTokens.accentPrimary}` : "none",
        outlineOffset: "-2px",
        transition: `outline ${motionTokens.durationFastMs}ms ${motionTokens.easingStandard}`,
      }}
    >
      <SmartContainer
        data={{ ...grid, rect: { ...grid.rect, x: 0, y: 0 } }}
        items={resolvedItems}
        onUpdate={handleUpdate}
        onClose={handleClose}
        onDelete={handleDelete}
        onToggleFold={handleToggleFold}
        onToggleLock={handleToggleLock}
        onUpdateItem={handleUpdateItem}
        onFocus={() => {}}
        gridOpacity={gridOpacity}
        gridBlur={gridBlur}
      />
    </div>
  );
}

export default OrganizerGridContent;
