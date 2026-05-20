import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TauriEvent, useTauriEvent, useTauriWindow } from "@repo/core/hooks";
import type { DesktopItem, GridBox } from "./types";
import { SmartContainer } from "./SmartContainer";
import {
  ORGANIZER_FILE_DROP_EVENT,
  ORGANIZER_GRID_CLOSE_EVENT,
  ORGANIZER_GRID_READY_EVENT,
  ORGANIZER_GRID_STATE_EVENT,
  ORGANIZER_GRID_UPDATE_EVENT,
  isGridClosePayload,
  isGridStatePayload,
  toDroppedFile,
} from "./gridEvents";

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

export interface OrganizerGridContentProps {
  gridId: string;
  gridOpacity?: number;
  gridBlur?: boolean;
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
 * Public Organizer-owned content for a single native Grid window.
 *
 * The desktop Host owns native window providers and drag chrome; this component
 * owns Grid business UI, cross-window state events, and path-first drop wiring.
 */
export function OrganizerGridContent({
  gridId,
  gridOpacity = 0.8,
  gridBlur = true,
}: OrganizerGridContentProps) {
  const [grid, setGrid] = useState<GridBox | null>(null);
  const [items, setItems] = useState<Record<string, DesktopItem>>({});
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [windowLabel, setWindowLabel] = useState("");
  const [windowRect, setWindowRect] = useState<G0GridPrototypeRect | null>(null);
  const [spikeEventCount, setSpikeEventCount] = useState(0);
  const [lastSpikeEvent, setLastSpikeEvent] = useState<G0GridPrototypePing | null>(null);
  const [dropEventCount, setDropEventCount] = useState(0);
  const [lastDropTelemetry, setLastDropTelemetry] = useState<G0FinderDropTelemetry | null>(null);
  const lastDropKeyRef = useRef<{ key: string; receivedAt: number } | null>(null);
  const gridRef = useRef<GridBox | null>(null);

  const tauriWindow = useTauriWindow();

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  useEffect(() => {
    let cancelled = false;

    const refreshWindowMeta = async () => {
      try {
        const [position, size] = await Promise.all([
          tauriWindow.outerPosition(),
          tauriWindow.innerSize(),
        ]);

        if (!cancelled) {
          setWindowLabel(tauriWindow.label);
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
          setWindowLabel(tauriWindow.label);
        }
      }
    };

    refreshWindowMeta();
    const timer = window.setInterval(refreshWindowMeta, 1000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [tauriWindow]);

  useTauriEvent<G0GridPrototypePing>(G0_GRID_PROTOTYPE_EVENT, (event) => {
    if (event.payload.gridId !== gridId) {
      console.warn("[G0 grid prototype] ignored out-of-scope event", {
        currentGridId: gridId,
        payload: event.payload,
      });
      return;
    }

    console.log("[G0 grid prototype] received scoped event", event.payload);
    setLastSpikeEvent(event.payload);
  });

  useTauriEvent<unknown>(ORGANIZER_GRID_STATE_EVENT, (event) => {
    if (!isGridStatePayload(event.payload)) {
      console.warn("[OrganizerGridContent] ignored invalid grid state event", event.payload);
      return;
    }
    if (event.payload.gridId === gridId) {
      setGrid(event.payload.grid);
      setItems(event.payload.items);
    }
  });

  useTauriEvent<unknown>(ORGANIZER_GRID_CLOSE_EVENT, (event) => {
    if (!isGridClosePayload(event.payload)) {
      console.warn("[OrganizerGridContent] ignored invalid grid close event", event.payload);
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
    [gridId, tauriWindow]
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
      emitUpdate(safePatch);
    },
    [emitUpdate]
  );

  const handleClose = useCallback(
    (_id: string) => {
      tauriWindow.emit(ORGANIZER_GRID_CLOSE_EVENT, { gridId });
    },
    [gridId, tauriWindow]
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
    return grid.itemIds
      .map((id) => items[id])
      .filter((item): item is DesktopItem => Boolean(item));
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
      tauriWindow.emit(ORGANIZER_FILE_DROP_EVENT, {
        gridId,
        files: paths.map(toDroppedFile),
      });
    },
    [gridId, tauriWindow]
  );

  const handleSendSpikeEvent = useCallback(async () => {
    const label = windowLabel || tauriWindow.label;
    const nextCount = spikeEventCount + 1;
    const payload: G0GridPrototypePing = {
      gridId,
      windowLabel: label,
      rect: windowRect,
      count: nextCount,
      sentAt: new Date().toISOString(),
    };

    console.log("[G0 grid prototype] sending scoped event", payload);
    await tauriWindow.emitTo(label, G0_GRID_PROTOTYPE_EVENT, payload);
    setSpikeEventCount(nextCount);
  }, [gridId, spikeEventCount, tauriWindow, windowLabel, windowRect]);

  useTauriEvent<TauriDragDropPayload>(TauriEvent.DRAG_DROP, (event) => {
    const paths = coerceDragDropPaths(event.payload);
    setIsDraggingFile(false);
    if (paths.length === 0) {
      console.warn("[G0 Finder DnD] drag-drop payload had no paths", event.payload);
      return;
    }
    handleFileDrop(paths, coerceDragDropPosition(event.payload) ?? { x: 0, y: 0 });
  });
  useTauriEvent(TauriEvent.DRAG_ENTER, () => setIsDraggingFile(true));
  useTauriEvent(TauriEvent.DRAG_OVER, () => setIsDraggingFile(true));
  useTauriEvent(TauriEvent.DRAG_LEAVE, () => setIsDraggingFile(false));

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

export default OrganizerGridContent;
