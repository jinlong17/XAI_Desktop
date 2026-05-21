import {
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { useDroppable } from "@dnd-kit/core";
import { DesktopIcon, type DesktopIconName } from "@repo/ui/icons";
import {
  colorTokens,
  motionTokens,
  radiusTokens,
  shadowTokens,
  spaceTokens,
  typographyTokens,
} from "@repo/ui/tokens";
import { DesktopItem, GridBox } from "./types";
import GridItem from "./GridItem";
import { emitOrganizerGridCreateTask } from "./taskEvents";
import { useCustomResize, RESIZE_HANDLE_STYLES, ResizeDirection } from "./hooks/useCustomResize";
import "./resize-handles.css";

const RESIZE_DIRECTIONS: ResizeDirection[] = ["s", "e", "se", "w", "n", "nw", "ne", "sw"];
const MIN_SIZE = 150;
const TITLE_BAR_HEIGHT = 40;

export interface SmartContainerProps {
  data: GridBox;
  items: DesktopItem[];
  onUpdate: (id: string, patch: Partial<GridBox>) => void;
  onClose: (id: string) => void;
  onToggleFold: (id: string) => void;
  onToggleLock: (id: string) => void;
  onUpdateItem?: (itemId: string, patch: Partial<DesktopItem>) => void;
  onFocus?: (id: string) => void;
  gridOpacity?: number;
  gridBlur?: boolean;
}

type ContextMenuState = { x: number; y: number } | null;
type GridMenuAction = {
  key: string;
  label: string;
  icon?: DesktopIconName;
  onClick: () => void;
  tone?: "default" | "danger";
};

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
  onUpdateItem,
  onFocus,
  gridOpacity = 0.8,
  gridBlur = true,
}: SmartContainerProps) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(data.title || "New Grid");
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const hoverTimerRef = useRef<number | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: data.rect.x, y: data.rect.y });

  useEffect(() => {
    setTitleDraft(data.title || "New Grid");
  }, [data.title]);

  useEffect(() => {
    setDragPosition({ x: data.rect.x, y: data.rect.y });
  }, [data.rect.x, data.rect.y]);

  const commitTitle = () => {
    const nextTitle = titleDraft.trim() || "New Grid";
    setIsEditingTitle(false);
    onUpdate(data.id, { title: nextTitle });
  };

  const handleTitleKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      commitTitle();
    } else if (event.key === "Escape") {
      setIsEditingTitle(false);
      setTitleDraft(data.title || "New Grid");
    }
  };

  const toggleView = () => {
    const nextView: GridBox["viewMode"] = data.viewMode === "grid" ? "list" : "grid";
    onUpdate(data.id, { viewMode: nextView });
  };

  const createTaskFromItem = (item: DesktopItem) => {
    void emitOrganizerGridCreateTask({
      gridItemId: item.id,
      title: item.filename,
      path: item.filepath,
    });
  };

  const removeItemFromGrid = (itemId: string) => {
    onUpdate(data.id, {
      itemIds: data.itemIds.filter((current) => current !== itemId),
    });
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
    setDragPosition({ x: dataEvent.x, y: dataEvent.y });
    onUpdate(data.id, { rect: { ...data.rect, x: dataEvent.x, y: dataEvent.y } });
  };

  const handleDrag = (_event: DraggableEvent, dataEvent: DraggableData) => {
    setIsDragging(true);
    setDragPosition({ x: dataEvent.x, y: dataEvent.y });
  };

  const handleContainerMouseEnter = useCallback(() => {
    if (!data.isFolded) {
      setIsHovering(true);
      return;
    }
    if (hoverTimerRef.current !== null) {
      window.clearTimeout(hoverTimerRef.current);
    }
    hoverTimerRef.current = window.setTimeout(() => {
      setIsHovering(true);
      hoverTimerRef.current = null;
    }, 120);
  }, [data.isFolded]);

  const handleContainerMouseLeave = useCallback(() => {
    if (hoverTimerRef.current !== null) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setIsHovering(false);
  }, []);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current !== null) {
        window.clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  const { handleMouseDown: handleResizeStart } = useCustomResize({
    onResize: (width, height, x, y) => {
      const newRect = { ...data.rect, width, height };
      if (x !== undefined) newRect.x = x;
      if (y !== undefined) newRect.y = y;
      onUpdate(data.id, { rect: newRect });
    },
    minWidth: MIN_SIZE,
    minHeight: MIN_SIZE,
    disabled: data.isLocked,
  });

  const containerStyle = useMemo<CSSProperties>(() => {
    const expandedHeight =
      data.isFolded && !isHovering ? TITLE_BAR_HEIGHT : Math.max(TITLE_BAR_HEIGHT, data.rect.height);
    return {
      width: data.rect.width,
      height: expandedHeight,
      display: "flex",
      flexDirection: "column",
      backgroundColor: `rgba(255,255,255,${gridOpacity})`,
      border: `1px solid ${data.themeColor ?? colorTokens.borderSubtle}`,
      borderRadius: radiusTokens.xl,
      boxShadow: isDragging ? shadowTokens.panelDragging : shadowTokens.panel,
      backdropFilter: gridBlur ? "blur(12px)" : "none",
      WebkitBackdropFilter: gridBlur ? "blur(12px)" : "none",
      color: colorTokens.textPrimary,
      overflow: "hidden",
      pointerEvents: "auto",
      position: "relative",
      transition: `box-shadow ${motionTokens.durationBaseMs}ms ${motionTokens.easingStandard}, border-color ${motionTokens.durationBaseMs}ms ${motionTokens.easingStandard}, height ${motionTokens.durationFastMs}ms ${motionTokens.easingStandard}`,
      zIndex: isDragging ? 100 : 1,
      fontFamily: typographyTokens.fontFamilySans,
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
  const containerBorderColor = data.themeColor ?? colorTokens.borderSubtle;

  const headerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: `${spaceTokens.sm}px ${spaceTokens.md}px`,
    borderBottom: `1px solid ${colorTokens.borderSubtle}`,
    cursor: "grab",
    userSelect: "none",
    gap: spaceTokens.sm,
    height: TITLE_BAR_HEIGHT,
    color: colorTokens.textPrimary,
    fontSize: typographyTokens.fontSizeBodyPx,
  };

  const iconButtonStyle: CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: radiusTokens.md,
    border: `1px solid ${colorTokens.borderStrong}`,
    background: "rgba(255,255,255,0.85)",
    color: colorTokens.textPrimary,
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    transition: `transform ${motionTokens.durationFastMs}ms ${motionTokens.easingStandard}, box-shadow ${motionTokens.durationFastMs}ms ${motionTokens.easingStandard}, background ${motionTokens.durationFastMs}ms ${motionTokens.easingStandard}`,
  };

  const actionsWrapperStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
  };

  const directCloseStyle: CSSProperties = {
    ...iconButtonStyle,
    color: "#dc2626",
    fontSize: 16,
    lineHeight: 1,
    fontWeight: typographyTokens.fontWeightSemibold,
  };

  const bodyStyle: CSSProperties = {
    padding: 10,
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

  const menuButtonStyle: CSSProperties = {
    width: "100%",
    background: "transparent",
    border: "none",
    color: colorTokens.textOnDark,
    fontWeight: typographyTokens.fontWeightMedium,
    padding: "6px 8px",
    borderRadius: 10,
    cursor: "pointer",
    textAlign: "left",
    fontFamily: typographyTokens.fontFamilySans,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const menuActions: GridMenuAction[] = [
    {
      key: "rename",
      label: "Rename Grid",
      onClick: () => {
        setIsEditingTitle(true);
      },
    },
    {
      key: "view",
      label: data.viewMode === "grid" ? "Switch to List" : "Switch to Grid",
      icon: data.viewMode === "grid" ? "list" : "grid",
      onClick: () => {
        toggleView();
      },
    },
    {
      key: "lock",
      label: data.isLocked ? "Unlock Grid" : "Lock Grid",
      icon: data.isLocked ? "unlock" : "lock",
      onClick: () => {
        onToggleLock(data.id);
      },
    },
    {
      key: "fold",
      label: data.isFolded ? "Expand Grid" : "Fold Grid",
      icon: data.isFolded ? "chevronDown" : "chevronUp",
      onClick: () => {
        onToggleFold(data.id);
      },
    },
    {
      key: "settings",
      label: "Grid Settings",
      icon: "settings",
      onClick: () => {},
    },
    {
      key: "close",
      label: "Close Grid",
      onClick: () => {
        onClose(data.id);
      },
      tone: "danger",
    },
  ];

  return (
    <Draggable
      nodeRef={nodeRef}
      position={dragPosition}
      onStop={handleDragStop}
      onDrag={handleDrag}
      onStart={() => {
        setIsDragging(true);
        onFocus?.(data.id);
      }}
      handle=".grid-title-bar"
      cancel=".smart-container__input, .resize-handle, .react-resizable-handle"
      disabled={data.isLocked}
    >
      <div
        ref={nodeRef}
        className="smart-container"
        style={{ position: "absolute", pointerEvents: "auto" }}
        onContextMenu={handleContextMenu}
        onMouseEnter={handleContainerMouseEnter}
        onMouseLeave={handleContainerMouseLeave}
      >
        <div
          ref={setNodeRef}
          style={{
            ...containerStyle,
            borderColor: isOver ? colorTokens.accentPrimary : containerBorderColor,
            boxShadow: isOver
              ? "0 0 0 2px rgba(56,189,248,0.5), 0 16px 40px rgba(0,0,0,0.35)"
              : containerStyle.boxShadow,
          }}
        >
          {!data.isLocked && RESIZE_DIRECTIONS.map((direction) => (
            <div
              key={direction}
              className={`resize-handle resize-handle--${direction}`}
              style={{
                ...RESIZE_HANDLE_STYLES[direction],
              }}
              onMouseDown={(event) =>
                handleResizeStart(direction, event, data.rect.width, data.rect.height, data.rect.x, data.rect.y)
              }
            />
          ))}

          <div className="smart-container__header grid-title-bar group" style={headerStyle}>
            <div style={{ display: "grid", gap: 2, minWidth: 0, flex: 1 }}>
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
                    borderRadius: radiusTokens.md,
                    border: `1px solid ${colorTokens.borderStrong}`,
                    background: "rgba(255,255,255,0.9)",
                    color: colorTokens.textPrimary,
                    padding: "6px 8px",
                    outline: "none",
                    fontFamily: typographyTokens.fontFamilySans,
                  }}
                />
              ) : (
                <span
                  style={{
                    fontWeight: typographyTokens.fontWeightSemibold,
                    fontSize: typographyTokens.fontSizeBodyPx,
                    cursor: "text",
                    flex: 1,
                    color: colorTokens.textPrimary,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  onDoubleClick={() => setIsEditingTitle(true)}
                  title="Double-click to rename"
                >
                  {data.title || "New Grid"}
                </span>
              )}
              <span
                style={{
                  color: colorTokens.textSecondary,
                  fontSize: 11,
                  letterSpacing: typographyTokens.letterSpacingTight,
                }}
              >
                {items.length} item{items.length === 1 ? "" : "s"} · {data.viewMode}
              </span>
            </div>
            <div className="transition-opacity" style={{ ...actionsWrapperStyle, opacity: 1 }}>
              <button
                type="button"
                style={directCloseStyle}
                onClick={(event) => {
                  event.stopPropagation();
                  onClose(data.id);
                }}
                aria-label="Close grid"
                title="Close grid"
              >
                ×
              </button>
              <button
                type="button"
                style={iconButtonStyle}
                onClick={(event) => {
                  event.stopPropagation();
                  const rect = nodeRef.current?.getBoundingClientRect();
                  setContextMenu({
                    x: Math.max(8, (rect?.width ?? 180) - 136),
                    y: 34,
                  });
                }}
                aria-label="More options"
              >
                <DesktopIcon name="more" size={14} />
              </button>
              <button
                type="button"
                style={iconButtonStyle}
                onClick={() => onToggleLock(data.id)}
                aria-label="Lock/Unlock"
              >
                <DesktopIcon name={data.isLocked ? "lock" : "unlock"} size={14} />
              </button>
              <button
                type="button"
                style={iconButtonStyle}
                onClick={() => onToggleFold(data.id)}
                aria-label="Fold/Unfold"
              >
                <DesktopIcon name={data.isFolded ? "chevronDown" : "chevronUp"} size={14} />
              </button>
              <button
                type="button"
                style={iconButtonStyle}
                onClick={toggleView}
                aria-label="Toggle view"
              >
                <DesktopIcon name={data.viewMode === "grid" ? "list" : "grid"} size={14} />
              </button>
            </div>
          </div>

          {(!data.isFolded || isHovering) && (
            <div style={bodyStyle}>
              {data.viewMode === "grid" ? (
                <div style={gridStyle}>
                  {items.map((file) => (
                    <GridItem
                      key={file.id}
                      item={file}
                      variant="grid"
                      onUpdate={onUpdateItem}
                      onCreateTask={createTaskFromItem}
                      onRemove={removeItemFromGrid}
                    />
                  ))}
                </div>
              ) : (
                <div style={listStyle}>
                  {items.map((file) => (
                    <GridItem
                      key={file.id}
                      item={file}
                      variant="list"
                      onUpdate={onUpdateItem}
                      onCreateTask={createTaskFromItem}
                      onRemove={removeItemFromGrid}
                    />
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
                background: colorTokens.surfaceOverlay,
                border: `1px solid ${colorTokens.borderSubtle}`,
                borderRadius: 12,
                padding: "6px 8px",
                boxShadow: shadowTokens.overlay,
                zIndex: 10,
                minWidth: 120,
              }}
              role="menu"
            >
              {menuActions.map((action) => (
                <button
                  key={action.key}
                  type="button"
                  onClick={() => {
                    setContextMenu(null);
                    action.onClick();
                  }}
                  style={{
                    ...menuButtonStyle,
                    color: action.tone === "danger" ? "#fca5a5" : colorTokens.textOnDark,
                  }}
                >
                  <span>{action.label}</span>
                  {action.icon ? <DesktopIcon name={action.icon} size={13} /> : null}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Draggable>
  );
}

export default SmartContainer;
