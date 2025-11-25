import {
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { Resizable, ResizeCallbackData, ResizeHandle } from "react-resizable";
import { useDroppable } from "@dnd-kit/core";
import { DesktopItem, GridBox } from "./types";
import GridItem from "./GridItem";

const RESIZE_HANDLES: ResizeHandle[] = ["s", "e", "se", "w", "n", "nw", "ne", "sw"];
const MIN_SIZE = 150;
const TITLE_BAR_HEIGHT = 40;
const HEADER_COLOR = "#111827";

const handleStyles: Record<ResizeHandle, CSSProperties> = {
  s: { bottom: -6, left: "50%", transform: "translateX(-50%)", cursor: "ns-resize" },
  n: { top: -6, left: "50%", transform: "translateX(-50%)", cursor: "ns-resize" },
  e: { right: -6, top: "50%", transform: "translateY(-50%)", cursor: "ew-resize" },
  w: { left: -6, top: "50%", transform: "translateY(-50%)", cursor: "ew-resize" },
  se: { bottom: -6, right: -6, cursor: "nwse-resize" },
  sw: { bottom: -6, left: -6, cursor: "nesw-resize" },
  ne: { top: -6, right: -6, cursor: "nesw-resize" },
  nw: { top: -6, left: -6, cursor: "nwse-resize" },
};

export interface SmartContainerProps {
  data: GridBox;
  items: DesktopItem[];
  onUpdate: (id: string, patch: Partial<GridBox>) => void;
  onClose: (id: string) => void;
  onToggleFold: (id: string) => void;
  onToggleLock: (id: string) => void;
  onFocus?: (id: string) => void;
  gridOpacity?: number;
  gridBlur?: boolean;
}

type ContextMenuState = { x: number; y: number } | null;

/**
 * ## SmartContainer (Independent File Fence)
 *
 * Each instance is a free-floating, resizable organizer that does not know
 * about other plugins. It only reads/writes its own record through
 * `onUpdate/onClose`, keeping the host micro-kernel clean.
 */
export function SmartContainer({
  data,
  items,
  onUpdate,
  onClose,
  onToggleFold,
  onToggleLock,
  onFocus,
  gridOpacity = 0.8,
  gridBlur = true,
}: SmartContainerProps) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(data.title || "新建画布");
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    setTitleDraft(data.title || "新建画布");
  }, [data.title]);

  const commitTitle = () => {
    const nextTitle = titleDraft.trim() || "新建画布";
    setIsEditingTitle(false);
    onUpdate(data.id, { title: nextTitle });
  };

  const handleTitleKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      commitTitle();
    } else if (event.key === "Escape") {
      setIsEditingTitle(false);
      setTitleDraft(data.title);
    }
  };

  const toggleView = () => {
    const nextView: GridBox["viewMode"] = data.viewMode === "grid" ? "list" : "grid";
    onUpdate(data.id, { viewMode: nextView });
  };

  const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const rect = nodeRef.current?.getBoundingClientRect();
    setContextMenu({
      x: event.clientX - (rect?.left ?? 0),
      y: event.clientY - (rect?.top ?? 0),
    });
  };

  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    document.addEventListener("click", close);
    document.addEventListener("contextmenu", close);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("contextmenu", close);
    };
  }, [contextMenu]);

  const handleDragStop = (_event: DraggableEvent, dataEvent: DraggableData) => {
    setIsDragging(false);
    onUpdate(data.id, { rect: { ...data.rect, x: dataEvent.x, y: dataEvent.y } });
  };

  const handleDrag = (_event: DraggableEvent, dataEvent: DraggableData) => {
    setIsDragging(true);
    onUpdate(data.id, { rect: { ...data.rect, x: dataEvent.x, y: dataEvent.y } });
  };

  const handleResize = (_event: unknown, { size }: ResizeCallbackData) => {
    const width = Math.max(MIN_SIZE, size.width);
    const height = Math.max(MIN_SIZE, size.height);
    onUpdate(data.id, { rect: { ...data.rect, width, height } });
  };

  const containerStyle = useMemo<CSSProperties>(() => {
    const expandedHeight =
      data.isFolded && !isHovering ? TITLE_BAR_HEIGHT : Math.max(TITLE_BAR_HEIGHT, data.rect.height);
    return {
      width: data.rect.width,
      height: expandedHeight,
      display: "flex",
      flexDirection: "column",
      backgroundColor: `rgba(255,255,255,${gridOpacity})`,
      border: `1px solid ${data.themeColor ?? "rgba(255,255,255,0.12)"}`,
      borderRadius: 16,
      boxShadow:
        isDragging
          ? "0 16px 40px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.1)"
          : "0 12px 32px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.08)",
      backdropFilter: gridBlur ? "blur(12px)" : "none",
      WebkitBackdropFilter: gridBlur ? "blur(12px)" : "none",
      color: "#0b1220",
      overflow: "hidden",
      pointerEvents: "auto", // keep the desktop click-through intact elsewhere.
      position: "relative",
      transition: "box-shadow 160ms ease, border-color 160ms ease, height 120ms ease",
      zIndex: isDragging ? 100 : 1,
    };
  }, [
    data.isFolded,
    data.rect.height,
    data.rect.width,
    data.themeColor,
    gridBlur,
    gridOpacity,
    isDragging,
    isHovering,
  ]);

  const { isOver, setNodeRef } = useDroppable({
    id: data.id,
    data: { gridId: data.id },
  });

  const headerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    cursor: "grab",
    userSelect: "none",
    gap: 8,
    height: TITLE_BAR_HEIGHT,
    color: HEADER_COLOR,
  };

  const viewToggleStyle: CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: 8,
    border: "1px solid rgba(17,24,39,0.14)",
    background: "rgba(17,24,39,0.06)",
    color: HEADER_COLOR,
    display: "grid",
    placeItems: "center",
    fontSize: 12,
    cursor: "pointer",
    transition: "transform 120ms ease, box-shadow 120ms ease",
    display: "grid",
    placeItems: "center",
  };

  const actionsWrapperStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
  };

  const foldIconStyle: CSSProperties = {
    display: "grid",
    placeItems: "center",
    width: "100%",
    height: "100%",
    color: HEADER_COLOR,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.5,
  };

  const gridIconStyle: CSSProperties = {
    width: 14,
    height: 14,
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gridTemplateRows: "repeat(2, 1fr)",
    gap: 2,
  };

  const listIconStyle: CSSProperties = {
    width: 14,
    height: 14,
    display: "grid",
    gridTemplateRows: "repeat(3, 1fr)",
    gap: 2,
  };

  const dotStyle: CSSProperties = {
    background: HEADER_COLOR,
    borderRadius: 3,
  };

  const bodyStyle: CSSProperties = {
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    flex: 1,
    overflow: "hidden",
  };

  const gridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
    gap: 10,
    flex: 1,
    overflow: "auto",
  };

  const listStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    flex: 1,
    overflow: "auto",
  };

  const iconBoxStyle: CSSProperties = {
    borderRadius: 12,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    minHeight: 72,
    padding: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontSize: 12,
    color: "#dbeafe",
  };

  const listRowStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "6px 8px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      position={{ x: data.rect.x, y: data.rect.y }}
      onStop={handleDragStop}
      onDrag={handleDrag}
      onStart={() => {
        setIsDragging(true);
        onFocus?.(data.id);
      }}
      handle=".grid-title-bar"
      cancel=".smart-container__input"
      disabled={data.isLocked}
    >
      <div
        ref={nodeRef}
        className="smart-container border border-red-500 opacity-50"
        style={{ position: "absolute", pointerEvents: "auto" }}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Resizable
          width={data.rect.width}
          height={data.rect.height}
          onResize={handleResize}
          onResizeStop={handleResize}
          resizeHandles={data.isLocked ? [] : RESIZE_HANDLES}
          handle={(axis) => (
            <span
              key={axis}
              style={{
                position: "absolute",
                width: 12,
                height: 12,
                borderRadius: 10,
                background: "rgba(255,255,255,0.28)",
                ...handleStyles[axis],
              }}
            />
          )}
          minConstraints={[MIN_SIZE, MIN_SIZE]}
          draggableOpts={{ disabled: data.isLocked }}
        >
          <div
            ref={setNodeRef}
            style={{
              ...containerStyle,
              borderColor: isOver ? "#38bdf8" : containerStyle.border?.toString(),
              boxShadow: isOver
                ? "0 0 0 2px rgba(56,189,248,0.5), 0 16px 40px rgba(0,0,0,0.35)"
                : containerStyle.boxShadow,
            }}
          >
            <div className="smart-container__header grid-title-bar group" style={headerStyle}>
              {isEditingTitle ? (
                <input
                  className="smart-container__input"
                  autoFocus
                  value={titleDraft}
                  onChange={(event) => setTitleDraft(event.target.value)}
                  onBlur={commitTitle}
                  onKeyDown={handleTitleKey}
                  style={{
                    flex: 1,
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(0,0,0,0.25)",
                    color: "#f8fafc",
                    padding: "6px 8px",
                    outline: "none",
                  }}
                />
              ) : (
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "text",
                    flex: 1,
                    color: HEADER_COLOR,
                  }}
                  onDoubleClick={() => setIsEditingTitle(true)}
                  title="Double-click to rename"
                >
                  {data.title || "新建画布"}
                </span>
              )}
              <div className="group-hover:opacity-100 group-hover:opacity-100 transition-opacity" style={{ ...actionsWrapperStyle, opacity: 0 }}>
                <button
                  type="button"
                  style={viewToggleStyle}
                  onClick={(event) => {
                    event.stopPropagation();
                    const rect = nodeRef.current?.getBoundingClientRect();
                    setContextMenu({
                      x: (rect?.width ?? 180) - 80,
                      y: 32,
                    });
                  }}
                  aria-label="More options"
                >
                  <span style={foldIconStyle}>···</span>
                </button>
                <button
                  type="button"
                  style={viewToggleStyle}
                  onClick={() => onToggleLock(data.id)}
                  aria-label="Lock/Unlock"
                >
                  <span style={foldIconStyle}>{data.isLocked ? "🔒" : "🔓"}</span>
                </button>
                <button
                  type="button"
                  style={viewToggleStyle}
                  onClick={() => onToggleFold(data.id)}
                  aria-label="Fold/Unfold"
                >
                  <span style={foldIconStyle}>{data.isFolded ? "⌄" : "⌃"}</span>
                </button>
                <button
                  type="button"
                  style={viewToggleStyle}
                  onClick={toggleView}
                  aria-label="Toggle view"
                >
                  {data.viewMode === "grid" ? (
                    <div style={gridIconStyle} aria-hidden>
                      <span style={dotStyle} />
                      <span style={dotStyle} />
                      <span style={dotStyle} />
                      <span style={dotStyle} />
                    </div>
                  ) : (
                    <div style={listIconStyle} aria-hidden>
                      <span style={{ ...dotStyle, height: 3 }} />
                      <span style={{ ...dotStyle, height: 3 }} />
                      <span style={{ ...dotStyle, height: 3 }} />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {(!data.isFolded || isHovering) && (
              <div style={bodyStyle}>
                {data.viewMode === "grid" ? (
                  <div style={gridStyle}>
                    {items.map((file) => (
                      <GridItem key={file.id} item={file} variant="grid" />
                    ))}
                  </div>
                ) : (
                  <div style={listStyle}>
                    {items.map((file) => (
                      <GridItem key={file.id} item={file} variant="list" />
                    ))}
                  </div>
                )}
              </div>
            )}

            {contextMenu && (
              <div
                style={{
                  position: "absolute",
                  top: contextMenu.y,
                  left: contextMenu.x,
                  background: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 12,
                  padding: "6px 8px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                  zIndex: 10,
                  minWidth: 120,
                }}
                role="menu"
              >
                <button
                  type="button"
                  onClick={() => onClose(data.id)}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    color: "#fca5a5",
                    fontWeight: 600,
                    padding: "6px 8px",
                    borderRadius: 10,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </Resizable>
      </div>
    </Draggable>
  );
}

export default SmartContainer;
