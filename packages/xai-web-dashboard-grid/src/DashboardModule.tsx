/**
 * DashboardModule — the dashboard module root.
 *
 * Composition:
 * - <DashHeader> renders the greeting + bilingual date + Add-widget button.
 * - When widgets.length > 0, <DashboardGrid> renders the 12-col FLIP grid.
 * - When widgets.length === 0, <EmptyState> renders the bilingual placeholder.
 * - <AddWidgetPicker> is always mounted (controlled by pickerOpen state);
 *   it opens/closes via the native <dialog> showModal/close API.
 *
 * The module ticks `now` once per second to drive the greeting band +
 * date subline + widget render context. Per ADR-0007 §S5, all state is
 * typed; no `useState<any>` and no `defaultProps`.
 *
 * gap-closure row #5: Add Widget picker wired here (api.md §S14, design.md §E3).
 */
import { useCallback, useEffect, useMemo, useState } from "react";

import { emitWebEvent } from "@repo/xai-web-event-bus";
import { usePref } from "@repo/plugin-web-storage";

import "./styles.css";

import { AddWidgetPicker } from "./AddWidgetPicker.js";
import { DashboardGrid } from "./DashboardGrid.js";
import { DashHeader } from "./DashHeader.js";
import { EmptyState } from "./EmptyState.js";
import type { DashboardModuleProps } from "./types.js";

export function DashboardModule({ lang, widgets, goTo }: DashboardModuleProps) {
  const [now, setNow] = useState<Date>(() => new Date());
  const [pickerOpen, setPickerOpen] = useState<boolean>(false);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Read the raw persisted order to use as the picker's currentOrder filter.
  // We use usePref directly (not useDashOrder) so that the picker shows widgets
  // that are registered but not YET in the user's explicit order —
  // i.e. widgets the user hasn't personally added yet.
  //
  // useDashOrder (in DashboardGrid) auto-appends missing registered widgets
  // via sanitize-on-mount (F1). That is intentional for the grid display.
  // The picker, however, should only hide widgets that are EXPLICITLY in the
  // user's stored order (HC5 / C1 hide pattern). This distinction lets the
  // picker remain useful: after removing a widget (future feature) or when
  // the user has a partial order stored, the picker shows the missing ones.
  const [rawOrder, rawSetOrder] = usePref("xai_dash_order");

  // addWidget helper: appends id to the raw persisted order if not already
  // present and if the id exists in the registered widgets catalog.
  const addWidgetToOrder = useCallback(
    (id: string) => {
      const knownIds = new Set(widgets.map((w) => w.id));
      if (!knownIds.has(id)) return;
      if (rawOrder.includes(id)) return;
      rawSetOrder([...rawOrder, id]);
    },
    [widgets, rawOrder, rawSetOrder],
  );

  // Emit web:dashboard:add-widget-clicked on every Add-widget interaction;
  // the source tells listeners which entry point fired (legacy compat — §S14.6).
  // ALSO opens the picker (HC3 — replace no-op handler).
  const handleAddFromHeader = useCallback(() => {
    emitWebEvent("web:dashboard:add-widget-clicked", { source: "add-widget-button" });
    setPickerOpen(true);
  }, []);

  const handleAddFromEmpty = useCallback(() => {
    emitWebEvent("web:dashboard:add-widget-clicked", { source: "empty-state-cta" });
    setPickerOpen(true);
  }, []);

  // handlePickerAdd — called by AddWidgetPicker when a card is clicked.
  // Order per api.md §S14.6 (REC-1): addWidget → emit → close.
  const handlePickerAdd = useCallback(
    (widgetId: string) => {
      addWidgetToOrder(widgetId);
      emitWebEvent("web:dashboard:widget-added", { widgetId, source: "picker" });
      setPickerOpen(false);
    },
    [addWidgetToOrder],
  );

  const handlePickerClose = useCallback(() => {
    setPickerOpen(false);
  }, []);

  // Default goTo is a no-op when caller omitted; registration.tsx always
  // supplies a real one in production.
  const goToCb = useCallback(
    (moduleId: string) => {
      if (goTo) goTo(moduleId);
    },
    [goTo],
  );

  // Memoize rawOrder to avoid unnecessary picker re-renders.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableCurrentOrder = useMemo(() => rawOrder, [rawOrder.join(",")]);

  return (
    <div className="module module-dashboard">
      <DashHeader lang={lang} now={now} onAddWidget={handleAddFromHeader} />
      {widgets.length === 0 ? (
        <EmptyState lang={lang} onAddWidget={handleAddFromEmpty} />
      ) : (
        <DashboardGrid widgets={widgets} lang={lang} now={now} goTo={goToCb} />
      )}
      <AddWidgetPicker
        open={pickerOpen}
        lang={lang}
        widgets={widgets}
        currentOrder={stableCurrentOrder}
        onAdd={handlePickerAdd}
        onClose={handlePickerClose}
      />
    </div>
  );
}

export default DashboardModule;
