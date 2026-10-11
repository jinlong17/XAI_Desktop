/**
 * useDashOrder — wraps usePref("xai_dash_order") + sanitize-on-mount (F1).
 *
 * Returns a 4-element tuple: [order, setOrder, addWidget, removeWidget].
 * - order: working order (sanitized id list to render)
 * - setOrder: replaces the entire order (used by drag-to-reorder)
 * - addWidget: appends a single id if not already present and registered
 * - removeWidget: removes a single id from the order (idempotent; no-op if absent)
 *
 * On mount, if the persisted value differs from the sanitized value, writes
 * the sanitized value back so future reads are stable.
 *
 * Caller invariant (R5): widgets[].id should be unique. Duplicates are
 * deduped silently here; a dev warning fires from the host module when
 * import.meta.env.DEV is true (see DashboardGrid).
 *
 * api.md §S5 + §S6 + §S14.3 (addWidget semantics, gap-closure row #5).
 * Audit Top-10 #9 (D-06): removeWidget added at tuple position 3.
 * Tuple-at-end extension is non-breaking (R7 precedent from gap-closure row #5).
 */
import { useCallback, useEffect, useRef } from "react";

import { useOrderSaveRecovery } from "./useOrderSaveRecovery.js";
import type { DashboardRecovery } from "../DashboardSaveRecovery.js";
import { usePref } from "@repo/plugin-web-storage";

import type { WidgetRegistration } from "../types.js";
import { arraysEqual, sanitizeOrder } from "./sanitizeOrder.js";

/** The 4-element tuple returned by useDashOrder. */
export type UseDashOrderTuple = readonly [
  /** Working order — the sanitized id list to render. */
  order: string[],
  /** Setter — replaces the entire order (drag-to-reorder). */
  setOrder: (next: string[]) => boolean,
  /** addWidget — appends id if not already present and registered. No-op otherwise. */
  addWidget: (id: string) => void,
  /** removeWidget — removes id from order if present. No-op if absent (idempotent). */
  removeWidget: (id: string) => void,
] & { readonly recovery: DashboardRecovery };

export function useDashOrder(widgets: readonly WidgetRegistration[], reconcile = true): UseDashOrderTuple {
  const [persisted, setPref] = usePref("xai_dash_order");
  const { save, recovery } = useOrderSaveRecovery(persisted, setPref);
  const sanitized = sanitizeOrder(persisted, widgets);

  // Write back the sanitized value once on mount (and again when widgets
  // mutates such that sanitize would differ from persisted). Use a ref to
  // avoid re-firing if persisted is already equal to sanitized — usePref's
  // localStorage write is idempotent but we still avoid the cross-tab
  // BroadcastChannel chatter.
  const lastWrittenRef = useRef<string[] | null>(null);
  useEffect(() => {
    if (!reconcile || arraysEqual(persisted, sanitized)) return;
    if (lastWrittenRef.current && arraysEqual(lastWrittenRef.current, sanitized)) return;
    if (save(sanitized)) lastWrittenRef.current = sanitized;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persisted.join("|"), sanitized.join("|"), reconcile]);

  // addWidget — api.md §S14.3 semantics:
  //   - if id is already in order → no-op
  //   - if id is not in widgets[].id → no-op (unknown id guard)
  //   - otherwise → call setPref([...sanitized, id])
  //
  // Uses sanitized (the current working order) as the base so it is always
  // consistent with what's rendered; avoids a stale closure on persisted.
  const sanitizedRef = useRef<string[]>(sanitized);
  sanitizedRef.current = sanitized;

  const addWidget = useCallback(
    (id: string) => {
      const knownIds = new Set(widgets.map((w) => w.id));
      if (!knownIds.has(id)) return; // unknown id guard (AC-AWO-4)
      const current = sanitizedRef.current;
      if (current.includes(id)) return; // dedupe guard (AC-AWO-3)
      save([...current, id]);
    },
    [widgets, save],
  );

  // removeWidget — Audit Top-10 #9 (D-06):
  //   - if id is not in the persisted order → no-op (idempotent; AC-RM-4)
  //   - otherwise → write persisted.filter(x => x !== id) to storage
  //
  // NOTE: This hook's removeWidget only handles the persistence write.
  // The rendering-level exclusion is handled by DashboardModule's `activeWidgets`
  // filter + `removedInSession` state, which keep the same render cycle stable.
  const persistedRef = useRef<string[]>(persisted as string[]);
  persistedRef.current = persisted as string[];

  const removeWidget = useCallback(
    (id: string) => {
      const current = persistedRef.current;
      if (!current.includes(id)) return; // idempotent no-op (AC-RM-4)
      save(current.filter((x) => x !== id));
    },
    [save],
  );

  return Object.assign([sanitized, save, addWidget, removeWidget] as const, { recovery });
}
