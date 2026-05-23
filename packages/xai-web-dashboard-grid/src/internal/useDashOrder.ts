/**
 * useDashOrder — wraps usePref("xai_dash_order") + sanitize-on-mount (F1).
 *
 * Returns the working order + a setter. On mount, if the persisted value
 * differs from the sanitized value, writes the sanitized value back so
 * future reads are stable.
 *
 * Caller invariant (R5): widgets[].id should be unique. Duplicates are
 * deduped silently here; a dev warning fires from the host module when
 * import.meta.env.DEV is true (see DashboardGrid).
 *
 * api.md §S5 + §S6.
 */
import { useEffect, useRef } from "react";

import { usePref } from "@repo/plugin-web-storage";

import type { WidgetRegistration } from "../types.js";
import { arraysEqual, sanitizeOrder } from "./sanitizeOrder.js";

export interface UseDashOrderResult {
  /** Working order — the sanitized id list to render. */
  order: string[];
  /** Setter — writes the next order to storage. */
  setOrder: (next: string[]) => void;
}

export function useDashOrder(widgets: readonly WidgetRegistration[]): UseDashOrderResult {
  const [persisted, setPref] = usePref("xai_dash_order");
  const sanitized = sanitizeOrder(persisted, widgets);

  // Write back the sanitized value once on mount (and again when widgets
  // mutates such that sanitize would differ from persisted). Use a ref to
  // avoid re-firing if persisted is already equal to sanitized — usePref's
  // localStorage write is idempotent but we still avoid the cross-tab
  // BroadcastChannel chatter.
  const lastWrittenRef = useRef<string[] | null>(null);
  useEffect(() => {
    if (arraysEqual(persisted, sanitized)) return;
    if (lastWrittenRef.current && arraysEqual(lastWrittenRef.current, sanitized)) return;
    lastWrittenRef.current = sanitized;
    setPref(sanitized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persisted.join("|"), sanitized.join("|")]);

  return { order: sanitized, setOrder: setPref };
}
