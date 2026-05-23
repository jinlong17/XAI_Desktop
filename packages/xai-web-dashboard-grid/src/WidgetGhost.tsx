/**
 * WidgetGhost — floating dragged-widget layer.
 *
 * Rendered as a fixed-position <div className="widget-ghost"> following
 * the cursor while a drag is active. Mirrors the dragged widget's body
 * (so the user sees what they are dragging) with a slight rotate + scale
 * for the "lifted" feel matching DESIGN.md §4.4.
 *
 * The actual transform values are derived from useGridDrag's drag state.
 */
import type { ReactNode } from "react";

import type { WidgetGridDragState } from "./types.js";

export interface WidgetGhostProps {
  drag: WidgetGridDragState;
  children: ReactNode;
}

export function WidgetGhost({ drag, children }: WidgetGhostProps) {
  const style: React.CSSProperties = {
    transform: `translate(${drag.x}px, ${drag.y}px) rotate(-2deg) scale(1.03)`,
    width: `${drag.width}px`,
    height: `${drag.height}px`,
  };
  return (
    <div className="widget-ghost" data-testid="widget-ghost" style={style}>
      {children}
    </div>
  );
}
