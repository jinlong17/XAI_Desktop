/**
 * @internal — resetAllPrefs.ts
 *
 * Side-effect function: clears every `xai_*` storage key that is registered
 * in `@repo/plugin-web-storage`'s PREF_REGISTRY (excluding `proposed: true`
 * entries), then emits 7 `web:settings:preference-changed` events — one per
 * canonical WebPreferenceKey — at the compile-time defaults table.
 *
 * Idempotent. Safe to call repeatedly.
 *
 * API contract: packages/xai-web-settings-shell/docs/api.md §5.1
 */

import { PREF_REGISTRY, removePref, type WebPrefKey } from "@repo/plugin-web-storage";
import { emitWebEvent } from "@repo/xai-web-event-bus";
import { RESET_DEFAULTS } from "./defaults.js";

/**
 * Minimal duck-type view of a PREF_REGISTRY entry — every entry has a `key`
 * + may optionally carry `proposed: true` (per `PrefEntry<T>` interface). The
 * registry's structural types are narrowed per-literal in TS, so we widen to
 * this view to read uniformly.
 */
interface RegistryEntryView {
  readonly key: string;
  readonly proposed?: true;
}

export function resetAllPrefs(): void {
  // ---- Phase 1: clear registered xai_* keys --------------------------------
  const entries = Object.values(PREF_REGISTRY) as readonly RegistryEntryView[];
  for (const entry of entries) {
    if (entry.proposed === true) continue;
    if (!entry.key.startsWith("xai_")) continue;
    try {
      removePref(entry.key as WebPrefKey);
    } catch (err) {
      if (
        typeof import.meta !== "undefined" &&
        (import.meta as { env?: { DEV?: boolean } }).env?.DEV
      ) {
        console.warn("[resetAllPrefs] removePref failed", entry.key, err);
      }
    }
  }

  // ---- Phase 2: broadcast canonical defaults -------------------------------
  const changedAt = new Date().toISOString();
  for (const change of RESET_DEFAULTS) {
    // Cast: `change` is `WebPreferenceChange`, the bus expects the union plus changedAt
    // The spread below preserves the discriminated-key narrowing across the union.
    if (change.key === "theme") {
      emitWebEvent("web:settings:preference-changed", { ...change, changedAt });
    } else if (change.key === "density") {
      emitWebEvent("web:settings:preference-changed", { ...change, changedAt });
    } else if (change.key === "fontScale") {
      emitWebEvent("web:settings:preference-changed", { ...change, changedAt });
    } else if (change.key === "accentHue") {
      emitWebEvent("web:settings:preference-changed", { ...change, changedAt });
    } else if (change.key === "railPos") {
      emitWebEvent("web:settings:preference-changed", { ...change, changedAt });
    } else if (change.key === "bgTone") {
      emitWebEvent("web:settings:preference-changed", { ...change, changedAt });
    } else if (change.key === "lang") {
      emitWebEvent("web:settings:preference-changed", { ...change, changedAt });
    }
  }
}
