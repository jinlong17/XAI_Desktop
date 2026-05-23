/**
 * DashboardModule — the dashboard module root.
 *
 * Composition:
 * - <DashHeader> renders the greeting + bilingual date + Add-widget button.
 * - When widgets.length > 0, <DashboardGrid> renders the 12-col FLIP grid.
 * - When widgets.length === 0, <EmptyState> renders the bilingual placeholder.
 *
 * The module ticks `now` once per second to drive the greeting band +
 * date subline + widget render context. Per ADR-0007 §S5, all state is
 * typed; no `useState<any>` and no `defaultProps`.
 */
import { useCallback, useEffect, useState } from "react";

import "./styles.css";

import { DashboardGrid } from "./DashboardGrid.js";
import { DashHeader } from "./DashHeader.js";
import { EmptyState } from "./EmptyState.js";
import type { DashboardModuleProps } from "./types.js";

export function DashboardModule({ lang, widgets, goTo }: DashboardModuleProps) {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // P3 wires this to emitWebEvent("web:dashboard:add-widget-clicked", ...).
  // For now (still P2 land) it is a no-op so both callers exercise the path.
  const handleAddWidget = useCallback(() => {
    /* P3 wires this to emitWebEvent("web:dashboard:add-widget-clicked", ...) */
  }, []);

  // Default goTo is a no-op when caller omitted; registration.tsx always
  // supplies a real one in production.
  const goToCb = useCallback(
    (moduleId: string) => {
      if (goTo) goTo(moduleId);
    },
    [goTo],
  );

  return (
    <div className="module module-dashboard">
      <DashHeader lang={lang} now={now} onAddWidget={handleAddWidget} />
      {widgets.length === 0 ? (
        <EmptyState lang={lang} onAddWidget={handleAddWidget} />
      ) : (
        <DashboardGrid widgets={widgets} lang={lang} now={now} goTo={goToCb} />
      )}
    </div>
  );
}

export default DashboardModule;
