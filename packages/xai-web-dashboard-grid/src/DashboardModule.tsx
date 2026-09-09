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
 * Audit Top-10 #9 (D-06): Widget remove wired here via removeWidgetFromOrder.
 */
import { useCallback, useEffect, useMemo, useState } from "react";

import { emitWebEvent } from "@repo/xai-web-event-bus";
import { sanitizeOrder, arraysEqual } from "./internal/sanitizeOrder.js";
import { useOrderSaveRecovery } from "./internal/useOrderSaveRecovery.js";
import { DashboardSaveRecovery } from "./DashboardSaveRecovery.js";
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
  // The picker hides widgets that are explicitly present in the user's stored
  // order. Missing registered widgets remain available to add later.
  const [rawOrder, rawSetOrder] = usePref("xai_dash_order");
  const orderSave = useOrderSaveRecovery(rawOrder, rawSetOrder);
  const sanitizedOrder = sanitizeOrder(rawOrder, widgets);
  useEffect(() => {
    if (!arraysEqual(rawOrder, sanitizedOrder)) orderSave.save(sanitizedOrder, undefined, 'sanitize');
    // Reconciliation belongs to this order owner, not a second grid subscription.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawOrder.join('|'), sanitizedOrder.join('|')]);

  // Session-remove set (Audit Top-10 #9, D-06):
  // Tracks ids explicitly removed in this session so rendering updates before
  // the persisted-order subscription settles. Cleared when re-added via picker.
  const [removedInSession, setRemovedInSession] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );

  // addWidget helper: appends id to the raw persisted order if not already
  // present and if the id exists in the registered widgets catalog.
  const addWidgetToOrder = useCallback(
    (id: string, after?: () => void) => {
      const knownIds = new Set(widgets.map((w) => w.id));
      if (!knownIds.has(id)) return;
      if (rawOrder.includes(id)) return;
      orderSave.save([...rawOrder, id], () => {
      // Clear from session-remove set so the widget re-appears in the grid.
      setRemovedInSession((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      after?.();
      }, `add:${id}`);
    },
    [widgets, rawOrder, orderSave],
  );

  // removeWidget helper (Audit Top-10 #9, D-06):
  // 1. Writes the filtered array to rawOrder (persisted storage).
  // 2. Adds the id to removedInSession so activeWidgets filters it immediately.
  const removeWidgetFromOrder = useCallback(
    (id: string) => {
      if (!rawOrder.includes(id)) return; // idempotent no-op
      orderSave.save(rawOrder.filter((x) => x !== id), () => {
      setRemovedInSession((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      }, `remove:${id}`);
    },
    [rawOrder, orderSave],
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
      addWidgetToOrder(widgetId, () => {
        emitWebEvent("web:dashboard:widget-added", { widgetId, source: "picker" });
        setPickerOpen(false);
      });
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

  // activeWidgets: exclude session-removed ids from the catalog passed to DashboardGrid.
  const activeWidgets = useMemo(
    () =>
      removedInSession.size === 0
        ? widgets
        : widgets.filter((w) => !removedInSession.has(w.id)),
    [widgets, removedInSession],
  );

  return (
    <div className="module module-dashboard">
      <DashHeader lang={lang} now={now} onAddWidget={handleAddFromHeader} />
      {widgets.length === 0 ? (
        <EmptyState lang={lang} onAddWidget={handleAddFromEmpty} />
      ) : (
        <DashboardGrid
          orderState={{ order: sanitizedOrder, setOrder: orderSave.save, recovery: orderSave.recovery }}
          widgets={activeWidgets}
          lang={lang}
          now={now}
          goTo={goToCb}
          onRemove={removeWidgetFromOrder}
        />
      )}
      {!pickerOpen && <DashboardSaveRecovery recovery={orderSave.recovery} lang={lang} label="Order" />}
      <AddWidgetPicker
        recovery={<DashboardSaveRecovery recovery={orderSave.recovery} lang={lang} label="Order" />}
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
