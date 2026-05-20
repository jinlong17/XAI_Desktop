import { useEffect, useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import type { WidgetDensity, WidgetEntity, WidgetSize } from "../types";

export interface WidgetFrameProps {
  widget: WidgetEntity;
  title: string;
  density: WidgetDensity;
  children: ReactNode;
  onChange(widgetId: string, patch: Partial<Pick<WidgetEntity, "position" | "size">>): void;
  onHide(widgetId: string): void;
}

const frameBase: CSSProperties = {
  position: "absolute",
  display: "grid",
  gridTemplateRows: "auto 1fr",
  overflow: "hidden",
  border: "1px solid var(--xai-widget-border)",
  borderRadius: "var(--xai-widget-radius)",
  background: "var(--xai-widget-bg)",
  color: "var(--xai-widget-fg)",
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.18)",
};

export function WidgetFrame({ widget, title, density, children, onChange, onHide }: WidgetFrameProps) {
  const padding = density === "compact" ? 8 : 12;
  const activeMoveRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => activeMoveRef.current?.abort();
  }, []);

  function startMove(event: PointerEvent<HTMLDivElement>): void {
    activeMoveRef.current?.abort();
    const controller = new AbortController();
    activeMoveRef.current = controller;
    const startX = event.clientX;
    const startY = event.clientY;
    const startPosition = widget.position;
    event.currentTarget.setPointerCapture(event.pointerId);

    function move(moveEvent: globalThis.PointerEvent): void {
      onChange(widget.id, {
        position: {
          x: Math.max(0, startPosition.x + moveEvent.clientX - startX),
          y: Math.max(0, startPosition.y + moveEvent.clientY - startY),
        },
      });
    }

    function end(): void {
      controller.abort();
      if (activeMoveRef.current === controller) {
        activeMoveRef.current = null;
      }
    }

    window.addEventListener("pointermove", move, { signal: controller.signal });
    window.addEventListener("pointerup", end, { signal: controller.signal });
  }

  function resize(delta: WidgetSize): void {
    onChange(widget.id, {
      size: {
        width: Math.max(180, widget.size.width + delta.width),
        height: Math.max(120, widget.size.height + delta.height),
      },
    });
  }

  return (
    <section
      aria-label={title}
      style={{
        ...frameBase,
        left: widget.position.x,
        top: widget.position.y,
        width: widget.size.width,
        height: widget.size.height,
      }}
    >
      <div
        onPointerDown={startMove}
        style={{
          cursor: "move",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding,
          borderBottom: "1px solid var(--xai-widget-border)",
          fontSize: density === "compact" ? 12 : 13,
          fontWeight: 700,
        }}
      >
        <span>{title}</span>
        <span style={{ display: "inline-flex", gap: 4 }}>
          <button type="button" aria-label="Shrink widget" onClick={() => resize({ width: -24, height: -18 })}>
            -
          </button>
          <button type="button" aria-label="Grow widget" onClick={() => resize({ width: 24, height: 18 })}>
            +
          </button>
          <button type="button" aria-label="Hide widget" onClick={() => onHide(widget.id)}>
            x
          </button>
        </span>
      </div>
      <div style={{ padding, minHeight: 0 }}>{children}</div>
    </section>
  );
}
