/**
 * useToggleSync — listens to web:shell:pet-toggle and syncs an internal
 * visibility mirror with the authoritative `propOn` value.
 *
 * Contract (api.md §3.1, §4.1):
 * - Subscribes to "web:shell:pet-toggle" via useWebEventListener.
 * - Returns internalOn (boolean) — the freshest of (event-payload, prop).
 * - When propOn changes, a useEffect reconciles internalOn to the prop.
 *   Rationale: prop is authoritative; event is a "defensive sync" channel.
 * - StrictMode safe: useWebEventListener handles double-mount cleanup.
 */

import { useState, useEffect } from "react";
import { useWebEventListener } from "@repo/xai-web-event-bus";

export function useToggleSync(propOn: boolean): boolean {
  const [internalOn, setInternalOn] = useState(propOn);

  // Reconcile to prop whenever prop changes (prop is authoritative)
  useEffect(() => {
    setInternalOn(propOn);
  }, [propOn]);

  // Subscribe to event bus — updates internal mirror on external toggle
  useWebEventListener("web:shell:pet-toggle", (payload) => {
    // Only consume the `on` field; ignore `source` in v1 (api.md §4.1)
    setInternalOn(payload.on);
  });

  return internalOn;
}
