/**
 * DashboardModule — the dashboard module root.
 *
 * Composition:
 * - <DashHeader> renders the greeting + bilingual date + Add-widget button.
 * - When widgets.length > 0, P2 will render <DashboardGrid> here.
 * - When widgets.length === 0, render <EmptyState>.
 *
 * The module ticks `now` once per second to drive the greeting band +
 * date subline + widget render context. Per ADR-0007 §S5, all state is
 * typed; no `useState<any>` and no `defaultProps`.
 */
import { useEffect, useState } from "react";

import "./styles.css";

import { DashHeader } from "./DashHeader.js";
import { EmptyState } from "./EmptyState.js";
import type { DashboardModuleProps } from "./types.js";

export function DashboardModule({ lang, widgets, goTo }: DashboardModuleProps) {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // P3 will replace these with bus emits; P1 leaves them as silent no-ops so
  // every render path is exercised by tests. The DashHeader/EmptyState
  // components are wired to call them.
  const handleAddWidget = () => {
    /* P3 wires this to emitWebEvent("web:dashboard:add-widget-clicked", ...) */
  };

  // Avoid an unused-variable warning on `goTo` in P1; P2 will pass it into
  // the grid context so widgets can deep-link.
  void goTo;

  return (
    <div className="module module-dashboard">
      <DashHeader lang={lang} now={now} onAddWidget={handleAddWidget} />
      {widgets.length === 0 ? (
        <EmptyState lang={lang} onAddWidget={handleAddWidget} />
      ) : (
        <div className="dash-grid" data-testid="dash-grid">
          {/* P2: render <DashboardGrid widgets={widgets} lang={lang} now={now} goTo={goTo} /> */}
        </div>
      )}
    </div>
  );
}

export default DashboardModule;
