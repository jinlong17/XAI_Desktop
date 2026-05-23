/**
 * @internal — usePref.ts
 * SSR-safe React hook for typed localStorage pref access.
 *
 * Reactivity model:
 * - Same-tab writes: setPref() publishes to the in-process same-tab bus;
 *   this hook subscribes to that bus so sibling hook instances in the same
 *   tab update immediately (AC-HOOK-10).
 * - Cross-tab writes: handled by the browser `storage` event (AC-HOOK-8).
 * - The `storage` event does NOT fire in the originating tab — that is why
 *   we need the same-tab bus for same-tab updates.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { PREF_REGISTRY, type WebPrefKey, type WebPrefValue } from "./registry.js";
import { getPref, setPref, removePref, subscribeSameTab } from "./storage.js";
import { decode } from "./codec.js";

// ---------------------------------------------------------------------------
// PrefMeta
// ---------------------------------------------------------------------------

export interface PrefMeta<T> {
  readonly schemaVersion: number;
  /** true when value is the registry default (key absent from storage). */
  readonly isDefault: boolean;
  /** setValue(default) + removePref. */
  readonly reset: () => void;
}

// ---------------------------------------------------------------------------
// usePref
// ---------------------------------------------------------------------------

export function usePref<K extends WebPrefKey>(
  key: K,
  defaultOverride?: WebPrefValue<K>,
): readonly [
  value: WebPrefValue<K>,
  setValue: (
    next:
      | WebPrefValue<K>
      | ((prev: WebPrefValue<K>) => WebPrefValue<K>),
  ) => void,
  meta: PrefMeta<WebPrefValue<K>>,
] {
  const entry = PREF_REGISTRY[key];
  const registryDefault = entry.default as WebPrefValue<K>;
  const effectiveDefault =
    defaultOverride !== undefined ? defaultOverride : registryDefault;

  // SSR: return static defaults with no-op setter.
  if (typeof window === "undefined") {
    const ssrMeta: PrefMeta<WebPrefValue<K>> = {
      schemaVersion: entry.schemaVersion,
      isDefault: true,
      reset: () => {
        /* SSR no-op */
      },
    };
    return [
      effectiveDefault,
      () => {
        console.warn(
          "[plugin-web-storage] setPref called during SSR; no-op.",
        );
      },
      ssrMeta,
    ] as const;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks -- SSR guard above
  return usePrefBrowser(key, effectiveDefault, registryDefault);
}

/**
 * Browser-only implementation. Pulled out so the SSR guard above can return
 * early without violating the Rules of Hooks inside the usePref body.
 *
 * NOTE: This function is always called when `typeof window !== "undefined"`,
 * so the hook count is stable per render environment.
 */
function usePrefBrowser<K extends WebPrefKey>(
  key: K,
  effectiveDefault: WebPrefValue<K>,
  registryDefault: WebPrefValue<K>,
): readonly [
  value: WebPrefValue<K>,
  setValue: (
    next:
      | WebPrefValue<K>
      | ((prev: WebPrefValue<K>) => WebPrefValue<K>),
  ) => void,
  meta: PrefMeta<WebPrefValue<K>>,
] {
  const entry = PREF_REGISTRY[key];

  // Read initial value from localStorage (or effectiveDefault).
  const readCurrent = useCallback((): WebPrefValue<K> => {
    const stored = getPref(key);
    // If localStorage had the value, getPref returns it; otherwise returns registryDefault.
    // We must honour effectiveDefault when the key is absent.
    const raw = localStorage.getItem(key);
    if (raw === null) return effectiveDefault;
    return stored;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, effectiveDefault]);

  const [value, setValueInternal] = useState<WebPrefValue<K>>(readCurrent);

  // Track isDefault: true iff the key is absent from storage.
  const [isDefault, setIsDefault] = useState<boolean>(
    () => localStorage.getItem(key) === null,
  );

  // We need a stable reference to the current value for functional updaters.
  const valueRef = useRef(value);
  valueRef.current = value;

  // ---- setValue -------------------------------------------------------

  const setValue = useCallback(
    (
      next:
        | WebPrefValue<K>
        | ((prev: WebPrefValue<K>) => WebPrefValue<K>),
    ) => {
      const prev = valueRef.current;
      const nextValue =
        typeof next === "function"
          ? (next as (prev: WebPrefValue<K>) => WebPrefValue<K>)(prev)
          : next;
      const ok = setPref(key, nextValue);
      if (ok) {
        setValueInternal(nextValue);
        setIsDefault(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  // ---- Cross-tab storage event listener ----------------------------------

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.storageArea !== localStorage) return;

      if (event.key === null) {
        // localStorage.clear() — reset to effective default
        setValueInternal(effectiveDefault);
        setIsDefault(true);
        return;
      }

      if (event.key !== key) return;

      if (event.newValue === null) {
        // Key was removed by another tab
        setValueInternal(effectiveDefault);
        setIsDefault(true);
      } else {
        // Decode the value from the event directly (avoids re-reading from
        // localStorage which may not be updated yet in all jsdom environments,
        // and faithfully reflects what the other tab wrote).
        const decoded = decode(entry.codec, event.newValue);
        if (decoded !== null) {
          setValueInternal(decoded as WebPrefValue<K>);
          setIsDefault(false);
        } else {
          // Decode failure — fall back to getPref which also falls back to default
          const next = getPref(key);
          setValueInternal(next);
          setIsDefault(localStorage.getItem(key) === null);
        }
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, effectiveDefault]);

  // ---- Same-tab pub/sub listener -----------------------------------------

  useEffect(() => {
    const unsub = subscribeSameTab(key, (newValue) => {
      const isDefaultNow = localStorage.getItem(key) === null;
      setValueInternal(newValue as WebPrefValue<K>);
      setIsDefault(isDefaultNow);
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // ---- reset --------------------------------------------------------------

  const reset = useCallback(() => {
    removePref(key);
    setValueInternal(effectiveDefault);
    setIsDefault(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, effectiveDefault, registryDefault]);

  const meta: PrefMeta<WebPrefValue<K>> = {
    schemaVersion: entry.schemaVersion,
    isDefault,
    reset,
  };

  return [value, setValue, meta] as const;
}
