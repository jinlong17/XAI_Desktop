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

interface G0GridPrototypeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface G0GridPrototypePing {
  gridId: string;
  windowLabel: string;
  rect: G0GridPrototypeRect | null;
  count: number;
  sentAt: string;
}

const G0_GRID_PROTOTYPE_EVENT = "g0-grid-prototype:scoped-ping";

/**
 * GridWindowContent renders a single SmartContainer in its own native window.
 * Communicates with the main window via Tauri events.
 */
function GridWindowContent({ gridId }: { gridId: string }) {
  const [grid, setGrid] = useState<GridBox | null>(null);
  const [items, setItems] = useState<Record<string, DesktopItem>>({});
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [windowLabel, setWindowLabel] = useState("");
  const [windowRect, setWindowRect] = useState<G0GridPrototypeRect | null>(null);
  const [spikeEventCount, setSpikeEventCount] = useState(0);
  const [lastSpikeEvent, setLastSpikeEvent] = useState<G0GridPrototypePing | null>(null);
  const { gridOpacity, gridBlur } = useSettings();

  useEffect(() => {
    let cancelled = false;

    const refreshWindowMeta = async () => {
      const currentWindow = getCurrentWindow();
      try {
        const [position, size] = await Promise.all([
          currentWindow.outerPosition(),
          currentWindow.innerSize(),
        ]);

        if (!cancelled) {
          setWindowLabel(currentWindow.label);
          setWindowRect({
            x: position.x,
            y: position.y,
            width: size.width,
            height: size.height,
          });
        }
      } catch (error) {
        console.warn("[G0 grid prototype] failed to read window metadata", error);
        if (!cancelled) {
          setWindowLabel(currentWindow.label);
        }
      }
    };

    refreshWindowMeta();
    const timer = window.setInterval(refreshWindowMeta, 1000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const unlistenSpike = listen<G0GridPrototypePing>(
      G0_GRID_PROTOTYPE_EVENT,
      (event) => {
        if (event.payload.gridId !== gridId) {
          console.warn("[G0 grid prototype] ignored out-of-scope event", {
            currentGridId: gridId,
            payload: event.payload,
          });
          return;
        }

        console.log("[G0 grid prototype] received scoped event", event.payload);
        setLastSpikeEvent(event.payload);
      }
    );

    return () => {
      unlistenSpike.then((fn) => fn());
    };
  }, [gridId]);

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

  const handleSendSpikeEvent = useCallback(async () => {
    const currentWindow = getCurrentWindow();
    const label = windowLabel || currentWindow.label;
    const nextCount = spikeEventCount + 1;
    const payload: G0GridPrototypePing = {
      gridId,
      windowLabel: label,
      rect: windowRect,
      count: nextCount,
      sentAt: new Date().toISOString(),
    };

    console.log("[G0 grid prototype] sending scoped event", payload);
    await currentWindow.emitTo(label, G0_GRID_PROTOTYPE_EVENT, payload);
    setSpikeEventCount(nextCount);
  }, [gridId, spikeEventCount, windowLabel, windowRect]);

  useFileDrop({
    onDrop: handleFileDrop,
    onHover: handleDragHover,
    enabled: true,
  });

  if (!grid) {
    return (
      <div
        data-g0-grid-prototype="true"
        style={{
          boxSizing: "border-box",
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
          gap: 10,
          width: "100%",
          height: "100%",
          padding: 14,
          background: "rgba(10, 14, 22, 0.82)",
          color: "#e7ecf3",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: 12,
          overflow: "hidden",
        }}
      >
        <div style={{ display: "grid", gap: 2 }}>
          <strong style={{ fontSize: 13, fontWeight: 650 }}>G0 Grid Prototype</strong>
          <span style={{ color: "#9ca3af" }}>Waiting for Organizer state; spike fallback is active.</span>
        </div>

        <dl
          style={{
            display: "grid",
            gridTemplateColumns: "74px 1fr",
            alignContent: "start",
            gap: "6px 10px",
            minWidth: 0,
            margin: 0,
          }}
        >
          <dt style={{ color: "#9ca3af" }}>gridId</dt>
          <dd style={{ margin: 0, overflowWrap: "anywhere" }}>{gridId}</dd>
          <dt style={{ color: "#9ca3af" }}>label</dt>
          <dd style={{ margin: 0, overflowWrap: "anywhere" }}>{windowLabel || "unknown"}</dd>
          <dt style={{ color: "#9ca3af" }}>rect</dt>
          <dd style={{ margin: 0, overflowWrap: "anywhere" }}>
            {windowRect
              ? `x=${windowRect.x}, y=${windowRect.y}, ${windowRect.width}x${windowRect.height}`
              : "unknown"}
          </dd>
          <dt style={{ color: "#9ca3af" }}>events</dt>
          <dd style={{ margin: 0 }}>{spikeEventCount}</dd>
          <dt style={{ color: "#9ca3af" }}>last</dt>
          <dd style={{ margin: 0, overflowWrap: "anywhere" }}>
            {lastSpikeEvent
              ? `${lastSpikeEvent.gridId} #${lastSpikeEvent.count} ${lastSpikeEvent.sentAt}`
              : "none"}
          </dd>
        </dl>

        <button
          type="button"
          onClick={handleSendSpikeEvent}
          style={{
            width: "100%",
            minHeight: 34,
            border: "1px solid rgba(148, 163, 184, 0.45)",
            borderRadius: 8,
            background: "rgba(30, 41, 59, 0.9)",
            color: "#f8fafc",
            cursor: "pointer",
            font: "inherit",
            fontWeight: 650,
          }}
        >
          Send Scoped Event
        </button>
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
