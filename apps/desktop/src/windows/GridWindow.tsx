import { MouseEvent as ReactMouseEvent, useCallback, useEffect, useMemo, useRef } from "react";
import { emit, listen } from "@tauri-apps/api/event";
import { getCurrentWindow, LogicalPosition } from "@tauri-apps/api/window";
import { useTauriInvoke } from "@repo/core/hooks";
import {
  ORGANIZER_GRID_STATE_EVENT,
  ORGANIZER_GRID_UPDATE_EVENT,
  OrganizerGridContent,
  createFinderClient,
  isGridStatePayload,
} from "@repo/plugin-organizer";
import { GlobalDndProvider } from "../providers/DndProvider";
import { SettingsProvider, useSettings } from "../context/SettingsContext";

const DRAG_THRESHOLD_PX = 4;
const NATIVE_MOVE_SYNC_DELAY_MS = 120;
const EDGE_SNAP_THRESHOLD = 24;
const EDGE_HIDE_REVEAL_PX = 52;

type NativeWindowRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function applyNativeEdgeSnap(rect: NativeWindowRect, isFolded: boolean): NativeWindowRect {
  if (typeof window === "undefined") {
    return rect;
  }

  const screenWidth = window.screen?.availWidth || window.innerWidth;
  const screenHeight = window.screen?.availHeight || window.innerHeight;
  const maxX = Math.max(0, screenWidth - rect.width);
  const maxY = Math.max(0, screenHeight - rect.height);
  let x = rect.x;
  let y = rect.y;

  if (x <= EDGE_SNAP_THRESHOLD) {
    x = isFolded ? Math.min(0, EDGE_HIDE_REVEAL_PX - rect.width) : 0;
  } else if (x >= maxX - EDGE_SNAP_THRESHOLD) {
    x = isFolded ? Math.max(0, screenWidth - EDGE_HIDE_REVEAL_PX) : maxX;
  }

  if (y <= EDGE_SNAP_THRESHOLD) {
    y = 0;
  } else if (y >= maxY - EDGE_SNAP_THRESHOLD) {
    y = maxY;
  }

  return { ...rect, x, y };
}

/**
 * Native Grid window shell.
 *
 * Host owns provider wiring and AppKit drag handoff. Organizer owns the Grid
 * content, item rendering, drop semantics, and cross-window state events.
 */
function GridWindowShell({ gridId }: { gridId: string }) {
  const { gridOpacity, gridBlur } = useSettings();
  const { invoke } = useTauriInvoke();
  const nativeMoveSyncTimerRef = useRef<number | null>(null);
  const lastEmittedRectRef = useRef<NativeWindowRect | null>(null);
  const latestGridRef = useRef<{ isFolded: boolean; rect: NativeWindowRect } | null>(null);
  // Construct once per shell mount. The Finder client is the IPC bridge
  // for `register_path_bookmark` (G3-E3 / P0-Foxtrot honest provenance).
  // The grid window is the only surface that receives absolute paths
  // from a user drag-drop (Tauri `tauri://drag-drop` event), so it is
  // the only place that can honestly register the bookmark before the
  // path is forwarded cross-window via `ORGANIZER_FILE_DROP_EVENT`.
  const finderClient = useMemo(() => createFinderClient(invoke), [invoke]);

  const emitNativeWindowRect = useCallback(async () => {
    const currentWindow = getCurrentWindow();
    const dpr =
      typeof window !== "undefined" && window.devicePixelRatio
        ? window.devicePixelRatio
        : 1;

    const [position, size] = await Promise.all([currentWindow.outerPosition(), currentWindow.outerSize()]);
    const latestGrid = latestGridRef.current;

    const measuredRect = {
      x: Math.round(position.x / dpr),
      y: Math.round(position.y / dpr),
      width: latestGrid?.rect.width ?? Math.round(size.width / dpr),
      height: latestGrid?.rect.height ?? Math.round(size.height / dpr),
    };
    const rect = applyNativeEdgeSnap(measuredRect, latestGrid?.isFolded ?? false);

    if (rect.x !== measuredRect.x || rect.y !== measuredRect.y) {
      await currentWindow.setPosition(new LogicalPosition(rect.x, rect.y));
    }

    const lastRect = lastEmittedRectRef.current;
    if (
      lastRect &&
      lastRect.x === rect.x &&
      lastRect.y === rect.y &&
      lastRect.width === rect.width &&
      lastRect.height === rect.height
    ) {
      return;
    }

    lastEmittedRectRef.current = rect;
    await emit(ORGANIZER_GRID_UPDATE_EVENT, {
      gridId,
      changes: { rect },
    });
  }, [gridId]);

  const scheduleNativeWindowRectSync = useCallback(() => {
    if (nativeMoveSyncTimerRef.current !== null) {
      window.clearTimeout(nativeMoveSyncTimerRef.current);
    }

    nativeMoveSyncTimerRef.current = window.setTimeout(() => {
      nativeMoveSyncTimerRef.current = null;
      void emitNativeWindowRect().catch((error) => {
        console.error("[GridWindow] native move sync failed:", error);
      });
    }, NATIVE_MOVE_SYNC_DELAY_MS);
  }, [emitNativeWindowRect]);

  useEffect(() => {
    const unlistenStatePromise = listen<unknown>(ORGANIZER_GRID_STATE_EVENT, (event) => {
      if (!isGridStatePayload(event.payload)) {
        return;
      }
      if (event.payload.gridId === gridId) {
        latestGridRef.current = {
          isFolded: event.payload.grid.isFolded,
          rect: event.payload.grid.rect,
        };
        if (event.payload.grid.isFolded) {
          scheduleNativeWindowRectSync();
        }
      }
    });

    return () => {
      unlistenStatePromise.then((unlisten) => unlisten());
    };
  }, [gridId, scheduleNativeWindowRectSync]);

  useEffect(() => {
    const currentWindow = getCurrentWindow();
    const unlistenMovedPromise = currentWindow.onMoved(() => {
      scheduleNativeWindowRectSync();
    });

    return () => {
      if (nativeMoveSyncTimerRef.current !== null) {
        window.clearTimeout(nativeMoveSyncTimerRef.current);
        nativeMoveSyncTimerRef.current = null;
      }
      unlistenMovedPromise.then((unlisten) => unlisten());
    };
  }, [scheduleNativeWindowRectSync]);

  // Intercept mousedown on the Organizer title bar (or the G0 fallback
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
          .then(scheduleNativeWindowRectSync)
          .catch((err) => {
            console.error("[GridWindow] startDragging failed:", err);
          });
        cleanup();
      }
    };

    const onUp = () => cleanup();

    window.addEventListener("mousemove", onMove, true);
    window.addEventListener("mouseup", onUp, true);
  }, [scheduleNativeWindowRectSync]);

  return (
    <div
      onMouseDownCapture={handleHeaderDragStart}
      style={{ width: "100%", height: "100%" }}
    >
      <OrganizerGridContent
        gridId={gridId}
        gridOpacity={gridOpacity}
        gridBlur={gridBlur}
        finderClient={finderClient}
      />
    </div>
  );
}

export function GridWindow({ gridId }: { gridId: string }) {
  return (
    <SettingsProvider>
      <GlobalDndProvider>
        <GridWindowShell gridId={gridId} />
      </GlobalDndProvider>
    </SettingsProvider>
  );
}

export default GridWindow;
