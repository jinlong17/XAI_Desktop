import { MouseEvent as ReactMouseEvent, useCallback } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { OrganizerGridContent } from "@repo/plugin-organizer";
import { GlobalDndProvider } from "../providers/DndProvider";
import { SettingsProvider, useSettings } from "../context/SettingsContext";

const DRAG_THRESHOLD_PX = 4;

/**
 * Native Grid window shell.
 *
 * Host owns provider wiring and AppKit drag handoff. Organizer owns the Grid
 * content, item rendering, drop semantics, and cross-window state events.
 */
function GridWindowShell({ gridId }: { gridId: string }) {
  const { gridOpacity, gridBlur } = useSettings();

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
    <div
      onMouseDownCapture={handleHeaderDragStart}
      style={{ width: "100%", height: "100%" }}
    >
      <OrganizerGridContent gridId={gridId} gridOpacity={gridOpacity} gridBlur={gridBlur} />
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
