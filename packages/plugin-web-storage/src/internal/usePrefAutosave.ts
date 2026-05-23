/**
 * @internal — usePrefAutosave.ts
 * Write-only Settings autosave hook for the open-ended `xai_pref_*` family.
 *
 * Semantics:
 * - Writes `xai_pref_${suffix}` to localStorage on every change to `value`.
 * - Does NOT read the key; consumers seed their state from getPref themselves.
 * - SSR-safe: useEffect does not run during SSR, and we also guard explicitly.
 *
 * Design note (Q-OPEN-2): autosave is opt-in via this hook rather than
 * bundled into usePref, to avoid accidentally persisting every useState in
 * Settings panels.
 */

import { useEffect, useRef } from "react";
import type { PrefCodec } from "./registry.js";
import { encode } from "./codec.js";
import { isPrefKey } from "./storage.js";
import { publishSameTab } from "./storage.js";

export interface UsePrefAutosaveOptions {
  /** Codec used to serialize the value. Default: "json". */
  codec?: PrefCodec;
}

/**
 * Autosave `value` to `xai_pref_${suffix}` whenever it changes.
 *
 * @param suffix - The suffix appended to `xai_pref_` to form the key.
 *   Must not contain `/`. Runtime error in dev mode.
 * @param value - The live React state to persist.
 * @param options - Optional codec override (default: "json").
 */
export function usePrefAutosave<T>(
  suffix: string,
  value: T,
  options?: UsePrefAutosaveOptions,
): void {
  const codec: PrefCodec = options?.codec ?? "json";
  const key = `xai_pref_${suffix}`;

  // Dev-mode validation: suffix must not contain '/'
  if (process.env.NODE_ENV !== "production" && suffix.includes("/")) {
    throw new Error(
      `[plugin-web-storage] usePrefAutosave: suffix must not contain "/". Got: "${suffix}"`,
    );
  }

  // Verify it matches the xai_pref_* pattern (runtime guard)
  if (!isPrefKey(key)) {
    throw new Error(
      `[plugin-web-storage] usePrefAutosave: produced key "${key}" does not match xai_pref_* pattern.`,
    );
  }

  // Keep a ref to the previous raw encoded value to implement idempotency
  const prevEncodedRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    // SSR guard (belt-and-suspenders: useEffect never runs at SSR anyway)
    if (typeof window === "undefined") return;

    const encoded = encode(codec, value);
    if (encoded === null) return;

    // Idempotency: skip write if value is unchanged
    if (prevEncodedRef.current === encoded) return;

    const existing = localStorage.getItem(key);
    if (existing === encoded) {
      prevEncodedRef.current = encoded;
      return;
    }

    try {
      localStorage.setItem(key, encoded);
      prevEncodedRef.current = encoded;
      // Notify same-tab subscribers
      publishSameTab(key, value);
    } catch (err) {
      if (
        err instanceof DOMException &&
        (err.name === "QuotaExceededError" ||
          err.name === "NS_ERROR_DOM_QUOTA_REACHED")
      ) {
        console.warn(`[plugin-web-storage] quota exceeded for ${key}.`);
      } else {
        console.warn(`[plugin-web-storage] setItem failed for ${key}:`, err);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
}
