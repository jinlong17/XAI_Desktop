import {
  MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { listen } from "@tauri-apps/api/event";
import { emitEvent } from "@repo/core/events";
import { currentMonitor, getCurrentWindow, LogicalPosition } from "@tauri-apps/api/window";
import { useTauriInvoke } from "@repo/core/hooks";
import {
  createPluginInstanceStore,
  createWebStoragePluginInstanceAdapter,
} from "@repo/core/registry";
import type { PluginInstance } from "@repo/core/types";
import {
  ORGANIZER_GRID_STATE_EVENT,
  ORGANIZER_GRID_UPDATE_EVENT,
  RECT_SYNC_EPSILON,
  OrganizerGridContent,
  applyNativeEdgeSnap,
  createFinderClient,
  isGridStatePayload,
  rectsNearlyEqual,
  type NativeMonitorBounds,
  type NativeWindowRect,
} from "@repo/plugin-organizer";
import { GlobalDndProvider } from "../providers/DndProvider";
import { SettingsProvider, useSettings } from "../context/SettingsContext";
import {
  isSampleWidgetInstance,
  SampleWidgetGridContent,
} from "../plugin-center/sampleWidget";

const DRAG_THRESHOLD_PX = 4;
const NATIVE_MOVE_SYNC_DELAY_MS = 120;

function usePluginInstanceForGrid(
  gridId: string,
): PluginInstance | null | undefined {
  const [instance, setInstance] = useState<PluginInstance | null>();

  useEffect(() => {
    if (typeof window === "undefined") {
      setInstance(null);
      return;
    }
    let cancelled = false;
    setInstance(undefined);
    const store = createPluginInstanceStore({
      adapter: createWebStoragePluginInstanceAdapter(window.localStorage),
    });

    void store
      .load()
      .then(() => {
        if (!cancelled) {
          setInstance(store.get(gridId) ?? null);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("[GridWindow] plugin instance load failed:", error);
          setInstance(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [gridId]);

  return instance;
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
  const pluginInstance = usePluginInstanceForGrid(gridId);
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

    const [position, size, monitor] = await Promise.all([
      currentWindow.outerPosition(),
      currentWindow.outerSize(),
      currentMonitor(),
    ]);
    const latestGrid = latestGridRef.current;
    const scaleFactor = monitor?.scaleFactor ?? dpr;
    const screen = window.screen as Screen & { availLeft?: number; availTop?: number };
    const monitorBounds: NativeMonitorBounds = monitor
      ? {
          x: monitor.workArea.position.x / scaleFactor,
          y: monitor.workArea.position.y / scaleFactor,
          width: monitor.workArea.size.width / scaleFactor,
          height: monitor.workArea.size.height / scaleFactor,
        }
      : {
          // Rare fallback for currentMonitor() failures; WebKit may omit
          // availLeft/availTop, which degrades to primary-screen coordinates.
          x: screen.availLeft ?? 0,
          y: screen.availTop ?? 0,
          width: screen.availWidth || window.innerWidth,
          height: screen.availHeight || window.innerHeight,
        };

    const measuredRect = {
      x: Math.round(position.x / scaleFactor),
      y: Math.round(position.y / scaleFactor),
      width: latestGrid?.rect.width ?? Math.round(size.width / scaleFactor),
      height: latestGrid?.rect.height ?? Math.round(size.height / scaleFactor),
    };
    const rect = applyNativeEdgeSnap(measuredRect, latestGrid?.isFolded ?? false, monitorBounds);

    if (
      Math.abs(rect.x - measuredRect.x) > RECT_SYNC_EPSILON ||
      Math.abs(rect.y - measuredRect.y) > RECT_SYNC_EPSILON
    ) {
      await currentWindow.setPosition(new LogicalPosition(rect.x, rect.y));
    }

    const lastRect = lastEmittedRectRef.current;
    if (lastRect && rectsNearlyEqual(lastRect, rect)) {
      return;
    }

    lastEmittedRectRef.current = rect;
    await emitEvent(ORGANIZER_GRID_UPDATE_EVENT, {
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
        const wasFolded = latestGridRef.current?.isFolded;
        const isFolded = event.payload.grid.isFolded;
        latestGridRef.current = {
          isFolded,
          rect: event.payload.grid.rect,
        };
        if ((wasFolded === undefined && isFolded) || (wasFolded !== undefined && wasFolded !== isFolded)) {
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
      {pluginInstance === undefined ? (
        <div style={{ height: "100%", width: "100%" }} />
      ) : isSampleWidgetInstance(pluginInstance) ? (
        <SampleWidgetGridContent gridId={gridId} instance={pluginInstance} />
      ) : (
        <OrganizerGridContent
          gridId={gridId}
          gridOpacity={gridOpacity}
          gridBlur={gridBlur}
          finderClient={finderClient}
        />
      )}
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
