import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { DesktopIcon } from "@repo/ui/icons";
import { designTokens } from "@repo/ui/tokens";
import { useAiCubeControlBridge } from "./ControlBridge";
import {
  PREVIEW_ACTIONS,
  PREVIEW_STATUS_TEXT,
  PREVIEW_TRANSCRIPT,
  type AiCubeActionId,
} from "./preview";

interface NativeDragState {
  pointerId: number;
  startScreenX: number;
  startScreenY: number;
  dragHandedOff: boolean;
}

const CUBE_POSITION = { x: 24, y: 24 };
const PANEL_OFFSET = { x: 78, y: 70 };
const DRAG_THRESHOLD_PX = 4;

async function runPreviewAction(
  actionId: AiCubeActionId,
  actions: ReturnType<typeof useAiCubeControlBridge>["actions"],
): Promise<void> {
  switch (actionId) {
    case "create-grid":
      await actions.createGrid({ x: 64, y: 120 });
      return;
    case "clear-grids":
      await actions.clearAllGrids();
      return;
    case "settings":
      actions.openSettings();
      return;
    case "clipboard":
      actions.openClipboard();
      return;
    case "pomodoro":
      actions.openPomodoro();
      return;
    case "search":
      actions.openSearch();
      return;
    case "plugins":
      actions.openPluginCenter();
      return;
    default:
      return;
  }
}

export function AiCubeControlWidget() {
  const { shell, appearance, actions } = useAiCubeControlBridge();
  const [isHovering, setIsHovering] = useState(false);
  const nativeDragRef = useRef<NativeDragState | null>(null);

  const textColor = useMemo(() => {
    if (appearance.cubeTextColor) {
      return appearance.cubeTextColor;
    }

    return designTokens.color.textOnDark;
  }, [appearance.cubeTextColor]);

  const cubeStyle = useMemo<CSSProperties>(
    () => ({
      pointerEvents: "auto",
      position: "absolute",
      left: CUBE_POSITION.x,
      top: CUBE_POSITION.y,
      width: appearance.cubeSize,
      height: appearance.cubeSize,
      borderRadius: designTokens.radius.pill,
      border: `1px solid ${designTokens.color.borderSubtle}`,
      background: appearance.cubeColor,
      color: textColor,
      opacity: isHovering ? Math.min(1, appearance.cubeOpacity + 0.08) : appearance.cubeOpacity,
      fontSize: appearance.cubeFontSize,
      lineHeight: 1,
      fontFamily: designTokens.typography.fontFamilySans,
      fontWeight: designTokens.typography.fontWeightSemibold,
      boxShadow: designTokens.shadow.panelDragging,
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      display: "grid",
      placeItems: "center",
      touchAction: "none",
      cursor: "pointer",
      transition: `transform ${designTokens.motion.durationFastMs}ms ${designTokens.motion.easingStandard}, opacity ${designTokens.motion.durationFastMs}ms ${designTokens.motion.easingStandard}`,
      transform: shell.isPanelOpen ? "scale(1.03)" : "scale(1)",
    }),
    [
      appearance.cubeColor,
      appearance.cubeFontSize,
      appearance.cubeOpacity,
      appearance.cubeSize,
      isHovering,
      shell.isPanelOpen,
      textColor,
    ],
  );

  const panelStyle = useMemo<CSSProperties>(
    () => ({
      pointerEvents: "auto",
      position: "absolute",
      left: PANEL_OFFSET.x,
      top: PANEL_OFFSET.y,
      width: 256,
      maxHeight: 472,
      overflow: "auto",
      borderRadius: designTokens.radius.xl,
      border: `1px solid ${designTokens.color.borderSubtle}`,
      background: designTokens.color.surfaceOverlay,
      color: designTokens.color.textOnDark,
      boxShadow: designTokens.shadow.overlay,
      padding: designTokens.space.lg,
      display: "grid",
      gap: designTokens.space.md,
      fontFamily: designTokens.typography.fontFamilySans,
    }),
    [],
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    nativeDragRef.current = {
      pointerId: event.pointerId,
      startScreenX: event.screenX,
      startScreenY: event.screenY,
      dragHandedOff: false,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = nativeDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || drag.dragHandedOff) return;

    const deltaX = event.screenX - drag.startScreenX;
    const deltaY = event.screenY - drag.startScreenY;
    if (Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD_PX) return;

    drag.dragHandedOff = true;
    event.preventDefault();
    void shell.startWindowDrag().catch((error) => {
      console.error("[AiCubeControlWidget] startWindowDrag failed:", error);
    });
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = nativeDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    event.preventDefault();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const wasDragged = drag.dragHandedOff;
    nativeDragRef.current = null;
    if (!wasDragged) {
      shell.togglePanel();
    }
  };

  return (
    <div style={{ width: "100%", height: "100%", background: "transparent" }}>
      <button
        type="button"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={cubeStyle}
        aria-pressed={shell.isPanelOpen}
        aria-label="Toggle AI Cube control surface"
        title="AI Cube"
      >
        AI
      </button>

      {shell.isPanelOpen ? (
        <section style={panelStyle} role="dialog" aria-label="AI Cube control panel">
          <div style={{ display: "flex", justifyContent: "space-between", gap: designTokens.space.sm }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: designTokens.typography.fontWeightSemibold }}>
                AI Cube
              </div>
              <div style={{ fontSize: 11, color: "rgba(248, 250, 252, 0.78)", marginTop: 4 }}>
                {PREVIEW_STATUS_TEXT}
              </div>
            </div>
            <button
              type="button"
              onClick={shell.closePanel}
              aria-label="Close panel"
              style={{
                borderRadius: designTokens.radius.sm,
                border: `1px solid ${designTokens.color.borderSubtle}`,
                background: "rgba(15, 23, 42, 0.72)",
                color: designTokens.color.textOnDark,
                width: 24,
                height: 24,
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>

          <div style={{ display: "grid", gap: designTokens.space.sm }}>
            <div style={{ fontSize: 12, fontWeight: designTokens.typography.fontWeightSemibold }}>
              Tray Actions
            </div>
            <div style={{ display: "grid", gap: 6, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
              {PREVIEW_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  disabled={!action.enabled}
                  onClick={() => {
                    void runPreviewAction(action.id, actions);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    borderRadius: designTokens.radius.md,
                    border: `1px solid ${designTokens.color.borderSubtle}`,
                    background: action.enabled
                      ? "rgba(15, 23, 42, 0.72)"
                      : "rgba(100, 116, 139, 0.28)",
                    color: designTokens.color.textOnDark,
                    minHeight: 34,
                    fontSize: 12,
                    cursor: action.enabled ? "pointer" : "not-allowed",
                    opacity: action.enabled ? 1 : 0.66,
                  }}
                >
                  <DesktopIcon name={action.icon} size={14} />
                  {action.label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "rgba(248, 250, 252, 0.72)" }}>
              Clipboard and pomodoro remain disabled placeholders in F2.
            </div>
          </div>

          <div style={{ display: "grid", gap: designTokens.space.sm }}>
            <div style={{ fontSize: 12, fontWeight: designTokens.typography.fontWeightSemibold }}>
              Conversation Preview
            </div>
            {PREVIEW_TRANSCRIPT.map((line, index) => (
              <div
                key={line}
                style={{
                  fontSize: 12,
                  border: `1px solid ${designTokens.color.borderSubtle}`,
                  borderRadius: designTokens.radius.md,
                  padding: "8px 10px",
                  background:
                    index % 2 === 0
                      ? "rgba(59, 130, 246, 0.18)"
                      : "rgba(148, 163, 184, 0.24)",
                }}
              >
                {line}
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
              <input
                value=""
                readOnly
                disabled
                placeholder="Phase 4 will enable live prompt send"
                style={{
                  minHeight: 34,
                  borderRadius: designTokens.radius.md,
                  border: `1px solid ${designTokens.color.borderSubtle}`,
                  background: "rgba(15, 23, 42, 0.6)",
                  color: "rgba(248, 250, 252, 0.72)",
                  padding: "0 10px",
                }}
              />
              <button
                type="button"
                disabled
                style={{
                  borderRadius: designTokens.radius.md,
                  border: `1px solid ${designTokens.color.borderSubtle}`,
                  background: "rgba(100, 116, 139, 0.3)",
                  color: designTokens.color.textOnDark,
                  padding: "0 10px",
                  cursor: "not-allowed",
                }}
              >
                Disabled
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontSize: 12, fontWeight: designTokens.typography.fontWeightSemibold }}>
              Appearance
            </div>
            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
              Cube Color
              <input
                type="color"
                value={appearance.cubeColor}
                onChange={(event) => appearance.setCubeColor(event.target.value)}
                aria-label="Cube color"
              />
            </label>
            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
              Text Color
              <input
                type="color"
                value={appearance.cubeTextColor}
                onChange={(event) => appearance.setCubeTextColor(event.target.value)}
                aria-label="Cube text color"
              />
            </label>
            <label style={{ display: "grid", gap: 6, fontSize: 12 }}>
              Cube Opacity ({appearance.cubeOpacity.toFixed(1)})
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.1}
                value={appearance.cubeOpacity}
                onChange={(event) => appearance.setCubeOpacity(Number(event.target.value))}
                aria-label="Cube opacity"
              />
            </label>
            <label style={{ display: "grid", gap: 6, fontSize: 12 }}>
              Cube Size ({appearance.cubeSize}px)
              <input
                type="range"
                min={40}
                max={120}
                step={4}
                value={appearance.cubeSize}
                onChange={(event) => appearance.setCubeSize(Number(event.target.value))}
                aria-label="Cube size"
              />
            </label>
            <label style={{ display: "grid", gap: 6, fontSize: 12 }}>
              Grid Opacity ({appearance.gridOpacity.toFixed(2)})
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={appearance.gridOpacity}
                onChange={(event) => appearance.setGridOpacity(Number(event.target.value))}
                aria-label="Grid opacity"
              />
            </label>
            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
              Grid Blur
              <input
                type="checkbox"
                checked={appearance.gridBlur}
                onChange={(event) => appearance.setGridBlur(event.target.checked)}
                aria-label="Grid blur"
              />
            </label>
          </div>
        </section>
      ) : null}
    </div>
  );
}
