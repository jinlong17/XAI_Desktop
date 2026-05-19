import {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cursorPosition, getCurrentWindow, PhysicalPosition } from "@tauri-apps/api/window";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { useSettings } from "../../context/SettingsContext";

type DockSide = "left" | "right" | null;

interface NativeDragState {
  pointerId: number;
  startCursorX: number;
  startCursorY: number;
  startWindowX: number;
  startWindowY: number;
  dragging: boolean;
}

export interface AiCubeProps {
  isPanelOpen: boolean;
  onTogglePanel: () => void;
  onAnchorChange?: (position: { x: number; y: number }) => void;
  nativeWindowDrag?: boolean;
}

export interface AnchorPosition {
  x: number;
  y: number;
}

const EDGE_THRESHOLD = 64;
const NATIVE_CUBE_POSITION: AnchorPosition = { x: 24, y: 24 };
const DRAG_THRESHOLD_PX = 4;

export const MOCK_DATA = [
  { title: "Quick Capture", hint: "Drop a note to Sticky plugin" },
  { title: "Deep Focus", hint: "Enable blur to isolate work" },
  { title: "Edge Dock", hint: "Hover to reveal the controller" },
  { title: "Plugin Hub", hint: "Tap to open the settings panel" },
];

/**
 * ## AiCube (Floating Controller)
 *
+ * Draggable AI entry point that lives on top of the transparent canvas. It is
 * responsible for toggling the Settings panel and docking when near the edges.
 *
 * - Pointer-events are `auto` here to keep the canvas click-through by default.
 * - Docking leaves a visible tab and hovers slide the cube back onto the screen.
 */
export function AiCube({ isPanelOpen, onTogglePanel, onAnchorChange, nativeWindowDrag = false }: AiCubeProps) {
  const { cubeOpacity, cubeSize, cubeFontSize, cubeColor, cubeTextColor } = useSettings();
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const nativeDragRef = useRef<NativeDragState | null>(null);
  const [position, setPosition] = useState<AnchorPosition>({ x: 32, y: 120 });
  const [dockedSide, setDockedSide] = useState<DockSide>(null);
  const [isHovering, setIsHovering] = useState(false);
  const hoverHint = useMemo(() => MOCK_DATA[0]?.hint ?? "AI Assistant", []);

  const dockOffset = cubeSize / 2;

  const clampY = (y: number) => Math.min(window.innerHeight - cubeSize - 12, Math.max(12, y));

  const resolveDockedPosition = (current: AnchorPosition): AnchorPosition => {
    if (!dockedSide) return current;

    const y = clampY(current.y);
    if (dockedSide === "left") {
      return { x: isHovering ? 12 : -dockOffset, y };
    }
    return { x: isHovering ? window.innerWidth - cubeSize - 12 : window.innerWidth - dockOffset, y };
  };

  const handleStop = (_e: DraggableEvent, data: DraggableData) => {
    const { x, y } = data;
    const nearLeft = x < EDGE_THRESHOLD;
    const nearRight = window.innerWidth - (x + cubeSize) < EDGE_THRESHOLD;
    const nextDock: DockSide = nearLeft ? "left" : nearRight ? "right" : null;
    setDockedSide(nextDock);

    const nextPos: AnchorPosition =
      nextDock === "left"
        ? { x: -dockOffset, y: clampY(y) }
        : nextDock === "right"
          ? { x: window.innerWidth - dockOffset, y: clampY(y) }
          : { x, y: clampY(y) };

    setPosition(nextPos);
  };

  const handleDrag = (_e: DraggableEvent, data: DraggableData) => {
    setDockedSide(null);
    setPosition({ x: data.x, y: clampY(data.y) });
  };

  const renderPosition = useMemo(
    () => (nativeWindowDrag ? NATIVE_CUBE_POSITION : resolveDockedPosition(position)),
    [dockedSide, isHovering, nativeWindowDrag, position, cubeSize],
  );

  const textColor = useMemo(() => {
    // Prefer explicit user choice; fallback to contrast if absent.
    if (cubeTextColor) return cubeTextColor;
    const hex = cubeColor.replace("#", "");
    if (hex.length !== 6) return "#f8fafc";
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 186 ? "#0b1220" : "#f8fafc";
  }, [cubeColor, cubeTextColor]);

  const cubeStyle = useMemo<CSSProperties>(
    () => ({
      pointerEvents: "auto",
      position: nativeWindowDrag ? "absolute" : undefined,
      left: nativeWindowDrag ? renderPosition.x : undefined,
      top: nativeWindowDrag ? renderPosition.y : undefined,
      width: cubeSize,
      height: cubeSize,
      fontSize: cubeFontSize,
      opacity: isHovering ? Math.min(1, cubeOpacity + 0.1) : cubeOpacity,
      transition: "transform 160ms ease, box-shadow 200ms ease, opacity 120ms ease",
      background: cubeColor, // override default gradient to respect user color
      color: textColor,
      backdropFilter: "blur(22px)",
      WebkitBackdropFilter: "blur(22px)",
      boxShadow:
        "0 10px 40px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.4)",
      border: "1px solid rgba(255,255,255,0.28)",
      touchAction: "none",
    }),
    [
      cubeFontSize,
      cubeOpacity,
      cubeColor,
      cubeSize,
      isHovering,
      nativeWindowDrag,
      renderPosition.x,
      renderPosition.y,
      textColor,
    ],
  );

  useEffect(() => {
    if (onAnchorChange) {
      onAnchorChange(renderPosition);
    }
  }, [onAnchorChange, renderPosition]);

  const handleNativePointerDown = async (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!nativeWindowDrag || event.button !== 0) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    try {
      const [cursor, windowPosition] = await Promise.all([
        cursorPosition(),
        getCurrentWindow().outerPosition(),
      ]);
      nativeDragRef.current = {
        pointerId: event.pointerId,
        startCursorX: cursor.x,
        startCursorY: cursor.y,
        startWindowX: windowPosition.x,
        startWindowY: windowPosition.y,
        dragging: false,
      };
    } catch (error) {
      nativeDragRef.current = null;
      console.error("Failed to start AI cube native drag:", error);
    }
  };

  const handleNativePointerMove = async (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = nativeDragRef.current;
    if (!nativeWindowDrag || !drag || drag.pointerId !== event.pointerId) return;

    event.preventDefault();

    try {
      const cursor = await cursorPosition();
      const deltaX = cursor.x - drag.startCursorX;
      const deltaY = cursor.y - drag.startCursorY;
      if (!drag.dragging && Math.hypot(deltaX, deltaY) >= DRAG_THRESHOLD_PX) {
        drag.dragging = true;
      }
      if (!drag.dragging) return;

      await getCurrentWindow().setPosition(
        new PhysicalPosition(drag.startWindowX + deltaX, drag.startWindowY + deltaY),
      );
    } catch (error) {
      console.error("Failed to move AI cube native window:", error);
    }
  };

  const handleNativePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = nativeDragRef.current;
    if (!nativeWindowDrag || !drag || drag.pointerId !== event.pointerId) return;

    event.preventDefault();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    nativeDragRef.current = null;

    if (!drag.dragging) {
      onTogglePanel();
    }
  };

  const cube = (
    <div
      ref={nodeRef}
      className="ai-cube"
      style={cubeStyle}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onPointerDown={nativeWindowDrag ? handleNativePointerDown : undefined}
      onPointerMove={nativeWindowDrag ? handleNativePointerMove : undefined}
      onPointerUp={nativeWindowDrag ? handleNativePointerUp : undefined}
      onPointerCancel={nativeWindowDrag ? handleNativePointerUp : undefined}
      onClick={nativeWindowDrag ? undefined : onTogglePanel}
      role="button"
      aria-pressed={isPanelOpen}
      title={hoverHint}
    >
      {dockedSide && !nativeWindowDrag && (
        <span
          className={`ai-cube__tab ${
            dockedSide === "left" ? "ai-cube__tab--left" : "ai-cube__tab--right"
          }`}
        />
      )}
      <span className="ai-cube__glyph">AI</span>
    </div>
  );

  return (
    <div className="assistant-layer">
      {nativeWindowDrag ? (
        cube
      ) : (
        <Draggable nodeRef={nodeRef} position={renderPosition} onStop={handleStop} onDrag={handleDrag}>
          {cube}
        </Draggable>
      )}
    </div>
  );
}

export default AiCube;
