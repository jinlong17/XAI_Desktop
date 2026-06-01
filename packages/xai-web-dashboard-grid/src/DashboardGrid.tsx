/**
 * DashboardGrid — the .dash-grid container + per-widget WidgetShell instances.
 *
 * Renders widgets in `order` (sanitized by useDashOrder). Wires:
 *   - useFlipReorder for 380ms cubic-bezier FLIP animation
 *   - useGridDrag for pointer-event drag + over-other-widget swap
 *   - WidgetGhost when a drag is active
 *
 * The grid itself does NOT know widget internals — it calls
 * registration.render(ctx) and renders the result inside <WidgetShell>.
 */
import { useMemo, useRef } from "react";

import type { Lang } from "@repo/plugin-web-tokens";

import { useDashOrder } from "./internal/useDashOrder.js";
import { useFlipReorder } from "./internal/useFlipReorder.js";
import { useGridDrag } from "./internal/useGridDrag.js";
import type { WidgetRegistration, WidgetRenderContext } from "./types.js";
import { WidgetGhost } from "./WidgetGhost.js";
import { WidgetShell } from "./WidgetShell.js";

export interface DashboardGridProps {
  /** Caller-supplied widget registrations. */
  widgets: WidgetRegistration[];
  /** Active language for widget render context. */
  lang: Lang;
  /** Current tick for widget render context. */
  now: Date;
  /** Optional deep-link callback. */
  goTo: (moduleId: string) => void;
  /**
   * Optional remove callback — forwarded to each WidgetShell as onRemove.
   * When provided, each shell renders a remove button.
   * Owned by DashboardModule (uses rawSetOrder directly to bypass sanitize).
   */
  onRemove?: (id: string) => void;
}

/**
 * Build a deduped + memoized registration map. Caller-supplied duplicate
 * ids (R5) → keep first occurrence + dev-warn.
 */
function useRegistryMap(widgets: WidgetRegistration[]): Map<string, WidgetRegistration> {
  return useMemo(() => {
    const map = new Map<string, WidgetRegistration>();
    for (const reg of widgets) {
      if (map.has(reg.id)) {
        // Dev-time warning per api.md §S2 (caller invariant: unique ids).
        // Guard against import.meta.env being undefined in non-Vite envs.
        const meta = import.meta as ImportMeta & { env?: { DEV?: boolean } };
        if (meta.env?.DEV) {
          console.warn(
            `[@repo/plugin-web-dashboard-grid] Duplicate widget id "${reg.id}" — keeping first occurrence, dropping later one(s).`,
          );
        }
        continue;
      }
      map.set(reg.id, reg);
    }
    return map;
  }, [widgets]);
}

export function DashboardGrid({ widgets, lang, now, goTo, onRemove }: DashboardGridProps) {
  const registryMap = useRegistryMap(widgets);

  // Deduped widgets in their original registration order (used by sanitizeOrder).
  const dedupedWidgets = useMemo(() => Array.from(registryMap.values()), [registryMap]);

  const [order, setOrder] = useDashOrder(dedupedWidgets);

  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lastRects = useRef<Record<string, DOMRect>>({});

  useFlipReorder(order, itemRefs, lastRects);
  const { drag, startDrag } = useGridDrag({ order, setOrder, itemRefs });

  const ctx: WidgetRenderContext = { lang, now, goTo };

  const draggedReg = drag ? registryMap.get(drag.id) : null;

  return (
    <>
      <div className={`dash-grid${drag ? " is-dragging" : ""}`} data-testid="dash-grid">
        {order.map((id) => {
          const reg = registryMap.get(id);
          if (!reg) return null;
          return (
            <WidgetShell
              key={id}
              id={id}
              span={reg.span}
              lang={lang}
              ariaLabel={reg.ariaLabel}
              isDragging={drag?.id === id}
              setRef={(rid, el) => {
                itemRefs.current[rid] = el;
              }}
              onPointerDown={startDrag}
              onRemove={onRemove}
            >
              {reg.render(ctx)}
            </WidgetShell>
          );
        })}
      </div>
      {drag && draggedReg && (
        <WidgetGhost drag={drag}>{draggedReg.render(ctx)}</WidgetGhost>
      )}
    </>
  );
}
