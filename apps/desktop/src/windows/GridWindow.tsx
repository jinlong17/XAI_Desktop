import { MouseEvent as ReactMouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { listen, TauriEvent } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  DesktopItem,
  GridBox,
  SmartContainer,
} from "@repo/plugin-organizer";
import { GlobalDndProvider } from "../providers/DndProvider";
import { SettingsProvider, useSettings } from "../context/SettingsContext";

const DRAG_THRESHOLD_PX = 4;

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

interface G0FinderDropTelemetry {
  gridId: string;
  source: "tauri://drag-drop";
  paths: string[];
  kinds: Array<"file" | "folder" | "app" | "alias" | "unknown">;
  position: { x: number; y: number } | null;
  receivedAt: string;
}

interface TauriDragDropPayload {
  paths?: unknown;
  position?: {
    x?: unknown;
    y?: unknown;
  };
}

const G0_GRID_PROTOTYPE_EVENT = "g0-grid-prototype:scoped-ping";

function classifyDroppedPath(path: string): G0FinderDropTelemetry["kinds"][number] {
  const lower = path.toLowerCase();
  if (lower.endsWith(".app")) return "app";
  if (lower.endsWith(".alias")) return "alias";
  if (path.includes(".")) return "file";
  return "folder";
}

function coerceDragDropPaths(payload: TauriDragDropPayload): string[] {
  if (!Array.isArray(payload.paths)) return [];
  return payload.paths.filter((path): path is string => typeof path === "string" && path.length > 0);
}

function coerceDragDropPosition(payload: TauriDragDropPayload): G0FinderDropTelemetry["position"] {
  const x = payload.position?.x;
  const y = payload.position?.y;
  if (typeof x !== "number" || typeof y !== "number") return null;
  return { x, y };
}

function G0DropTelemetryPanel({
  count,
  telemetry,
}: {
  count: number;
  telemetry: G0FinderDropTelemetry | null;
}) {
  return (
    <div
      style={{
        border: "1px solid rgba(56, 189, 248, 0.28)",
        borderRadius: 8,
        padding: "8px 10px",
        background: "rgba(8, 47, 73, 0.42)",
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <strong style={{ color: "#bae6fd" }}>Finder DnD</strong>
        <span style={{ color: "#7dd3fc" }}>drops {count}</span>
      </div>
      <div style={{ marginTop: 6, color: "#cbd5e1", overflowWrap: "anywhere" }}>
        {telemetry ? (
          <>
            <div>{telemetry.source}</div>
            <div>{telemetry.kinds.join(", ") || "unknown"}</div>
            <div>{telemetry.paths.join(" | ")}</div>
          </>
        ) : (
          "Drop Finder file/folder/app/alias here"
        )}
      </div>
    </div>
  );
}

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
  const [dropEventCount, setDropEventCount] = useState(0);
  const [lastDropTelemetry, setLastDropTelemetry] = useState<G0FinderDropTelemetry | null>(null);
  const { gridOpacity, gridBlur } = useSettings();
  const lastDropKeyRef = useRef<{ key: string; receivedAt: number } | null>(null);
  // gridRef mirrors `grid` so handleUpdate can read the latest rect without
  // running side-effects inside a setState updater (multi-window position
  // sync is sensitive to stale x/y from the SmartContainer's DOM drag).
  const gridRef = useRef<GridBox | null>(null);
  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

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
      // In multi-window mode the *window* owns its on-screen position via the
      // OS-native drag (see GridWindow's onMouseDownCapture handler below).
      // SmartContainer always sees rect.x/y as 0 (GridWindow overrides them)
      // so any rect.x/y coming back through react-draggable's onStop is just
      // DOM-relative noise — if we propagated it, the window would teleport
      // to logical (0, 0) on every header click. Strip x/y from the patch
      // and merge size/other fields against the latest known rect.
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
      emitUpdate(safePatch);
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
    (paths: string[], position: { x: number; y: number }) => {
      const dropKey = JSON.stringify(paths);
      const now = Date.now();
      const lastDropKey = lastDropKeyRef.current;
      if (lastDropKey?.key === dropKey && now - lastDropKey.receivedAt < 1000) {
        console.warn("[G0 Finder DnD] ignored duplicate drag-drop payload", paths);
        return;
      }
      lastDropKeyRef.current = { key: dropKey, receivedAt: now };

      const telemetry: G0FinderDropTelemetry = {
        gridId,
        source: "tauri://drag-drop",
        paths,
        kinds: paths.map(classifyDroppedPath),
        position,
        receivedAt: new Date().toISOString(),
      };

      console.log("[G0 Finder DnD] path-first drop", telemetry);
      setLastDropTelemetry(telemetry);
      setDropEventCount((count) => count + 1);
      getCurrentWindow().emit("grid-window-file-drop", { gridId, paths });
    },
    [gridId]
  );

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

  useEffect(() => {
    const unlistenDrop = listen<TauriDragDropPayload>(TauriEvent.DRAG_DROP, (event) => {
      const paths = coerceDragDropPaths(event.payload);
      setIsDraggingFile(false);
      if (paths.length === 0) {
        console.warn("[G0 Finder DnD] drag-drop payload had no paths", event.payload);
        return;
      }
      handleFileDrop(paths, coerceDragDropPosition(event.payload) ?? { x: 0, y: 0 });
    });
    const unlistenEnter = listen(TauriEvent.DRAG_ENTER, () => setIsDraggingFile(true));
    const unlistenOver = listen(TauriEvent.DRAG_OVER, () => setIsDraggingFile(true));
    const unlistenLeave = listen(TauriEvent.DRAG_LEAVE, () => setIsDraggingFile(false));

    return () => {
      unlistenDrop.then((fn) => fn());
      unlistenEnter.then((fn) => fn());
      unlistenOver.then((fn) => fn());
      unlistenLeave.then((fn) => fn());
    };
  }, [handleFileDrop]);

  if (!grid) {
    return (
      <div
        data-g0-grid-prototype="true"
        style={{
          boxSizing: "border-box",
          display: "grid",
          gridTemplateRows: "auto 1fr auto auto",
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

        <G0DropTelemetryPanel count={dropEventCount} telemetry={lastDropTelemetry} />

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
      <div
        style={{
          position: "fixed",
          left: 8,
          bottom: 8,
          width: "calc(100% - 16px)",
          pointerEvents: "none",
          fontSize: 11,
        }}
      >
        <G0DropTelemetryPanel count={dropEventCount} telemetry={lastDropTelemetry} />
      </div>
    </div>
  );
}

/**
 * GridWindow is the root component for a grid window.
 * Wraps content with necessary providers.
 */
export function GridWindow({ gridId }: { gridId: string }) {
  // Intercept mousedown on the SmartContainer title bar (or the G0 fallback
  // panel) in CAPTURE phase. We stopPropagation so react-draggable's
  // onMouseDown synthetic handler never fires — its DOM-drag is meaningless
  // in multi-window mode and emits bogus rect.x/y that warp the window. Past
  // DRAG_THRESHOLD_PX we hand off to Tauri startDragging, which drives the
  // window from AppKit's mouse-drag loop and gives unrestricted screen-wide
  // movement (same pattern as the AI cube in 7b7ff35).
  const handleHeaderDragStart = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const onGridDragHandle =
      Boolean(target.closest(".grid-title-bar")) ||
      Boolean(target.closest("[data-g0-grid-prototype]"));
    if (!onGridDragHandle) return;

    // Don't hijack interactive children: buttons (lock/fold/view/close/etc.),
    // the title edit input, the rename span's dblclick, or the resize handles.
    if (target.closest("button, input, select, textarea, .resize-handle")) return;

    event.preventDefault();
    event.stopPropagation();

    const startScreenX = event.screenX;
    const startScreenY = event.screenY;
    let handed = false;

    const cleanup = () => {
      window.removeEventListener("mousemove", onMove, true);
      window.removeEventListener("mouseup", onUp, true);
    };

    const onMove = (ev: MouseEvent) => {
      if (handed) return;
      const dx = ev.screenX - startScreenX;
      const dy = ev.screenY - startScreenY;
      if (Math.hypot(dx, dy) >= DRAG_THRESHOLD_PX) {
        handed = true;
        void getCurrentWindow()
          .startDragging()
          .catch((err) => {
            console.error("[GridWindow] startDragging failed:", err);
          });
        cleanup();
      }
    };

    const onUp = () => cleanup();

    window.addEventListener("mousemove", onMove, true);
    window.addEventListener("mouseup", onUp, true);
  }, []);

  return (
    <SettingsProvider>
      <GlobalDndProvider>
        <div
          onMouseDownCapture={handleHeaderDragStart}
          style={{ width: "100%", height: "100%" }}
        >
          <GridWindowContent gridId={gridId} />
        </div>
      </GlobalDndProvider>
    </SettingsProvider>
  );
}

export default GridWindow;
