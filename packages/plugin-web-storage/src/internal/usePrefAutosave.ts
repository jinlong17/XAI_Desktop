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

import { useCallback, useEffect, useRef, useState } from "react";
import type { PrefCodec } from "./registry.js";
import { encode } from "./codec.js";
import { isPrefKey, setPrefAutosave } from "./storage.js";
import { accountScope } from "./accountScope.js";


export interface UsePrefAutosaveOptions {
  /** Codec used to serialize the value. Default: "json". */
  codec?: PrefCodec;
}

export interface PrefAutosaveResult {
  /** null before the first effect; false means the current value was not saved. */
  readonly saved: boolean | null;
  readonly retry: () => boolean;
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
): PrefAutosaveResult {
  const scope = useRef(accountScope.capture()).current;
  const codec: PrefCodec = options?.codec ?? "json";
  const key = `xai_pref_${suffix}`;
  const [saved, setSaved] = useState<boolean | null>(null);

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

  const write = useCallback((force = false) => {
    // SSR guard (belt-and-suspenders: useEffect never runs at SSR anyway)
    if (typeof window === "undefined") return false;

    const encoded = encode(codec, value);
    if (encoded === null) { setSaved(false); return false; }
    const descriptor = JSON.stringify([key, codec, encoded]);

    // Idempotency: skip write if value is unchanged
    if (!force && prevEncodedRef.current === descriptor) { setSaved(true); return true; }

    const success = setPrefAutosave(suffix, value, { codec, scope });
    if (success) prevEncodedRef.current = descriptor;
    setSaved(success);
    return success;
  }, [codec, key, scope, suffix, value]);
  useEffect(() => { write(); }, [write]);
  const retry = useCallback(() => write(true), [write]);
  return { saved, retry };
}
