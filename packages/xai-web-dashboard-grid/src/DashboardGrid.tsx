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
import { useCallback, useMemo, useRef, type PointerEvent as ReactPointerEvent } from "react";

import type { Lang } from "@repo/plugin-web-tokens";

import { useDashOrder } from "./internal/useDashOrder.js";
import { useFlipReorder } from "./internal/useFlipReorder.js";
import { useGridDrag } from "./internal/useGridDrag.js";
import { useWidgetAppearance } from "./internal/useWidgetAppearance.js";
import { layoutFromResize, useWidgetLayout } from "./internal/useWidgetLayout.js";
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
  const gridRef = useRef<HTMLDivElement | null>(null);

  useFlipReorder(order, itemRefs, lastRects);
  const { drag, startDrag } = useGridDrag({ order, setOrder, itemRefs });
  const { getLayout, setWidgetLayout, createResizeSnapshot } = useWidgetLayout(dedupedWidgets);
  const { getAppearance, setWidgetAppearance, resetWidgetAppearance } =
    useWidgetAppearance(dedupedWidgets);

  const startResize = useCallback(
    (id: string, event: ReactPointerEvent<HTMLButtonElement>) => {
      const reg = registryMap.get(id);
      if (!reg) return;
      const snapshot = createResizeSnapshot(id, reg.span, event, gridRef.current);

      const onMove = (moveEvent: PointerEvent) => {
        setWidgetLayout(id, layoutFromResize(snapshot, moveEvent.clientX, moveEvent.clientY));
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [createResizeSnapshot, registryMap, setWidgetLayout],
  );

  const ctx: WidgetRenderContext = { lang, now, goTo };

  const draggedReg = drag ? registryMap.get(drag.id) : null;

  return (
    <>
      <div
        ref={gridRef}
        className={`dash-grid${drag ? " is-dragging" : ""}`}
        data-testid="dash-grid"
      >
        {order.map((id) => {
          const reg = registryMap.get(id);
          if (!reg) return null;
          const layout = getLayout(id, reg.span);
          const appearance = getAppearance(id);
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
              layout={layout}
              onResizePointerDown={startResize}
              appearance={appearance}
              onAppearanceChange={setWidgetAppearance}
              onAppearanceReset={resetWidgetAppearance}
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
