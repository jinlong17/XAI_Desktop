/**
 * @internal — usePremiumTier.ts
 *
 * React hook that reads the effective premium tier with a 30-day client-clock
 * filter applied on every call.
 *
 * PURE READ-SIDE FILTER (FA-5):
 *   - NO setInterval, NO setTimeout, NO fetch.
 *   - Re-evaluates on every call — deterministic per call-site.
 *   - SSR-safe: returns "free" if localStorage is unavailable.
 *
 * 30-day expiry logic:
 *   If stored tier is "premium_stub" AND (Date.now() - started_at) >= PREMIUM_TIER_TTL_MS:
 *     → effective tier is "free" (lazy cleanup: also writes "free" + clears started_at)
 *   Otherwise: returns stored tier as-is.
 *
 * API contract: packages/plugin-web-settings-rest/docs/api.md §7.3
 * Extension 2026-05-26 — Premium Pane Stripe Checkout Stub (gap-closure row #8)
 */

import { usePref } from "@repo/plugin-web-storage";
import { type PremiumTier, PREMIUM_TIER_TTL_MS } from "./premiumTier.js";

/**
 * Returns the effective premium tier after applying the 30-day TTL filter.
 *
 * Tier value union: "free" | "pending" | "premium_stub"
 *
 * Returns "free" when:
 *   - No stored tier (default).
 *   - Stored tier is "premium_stub" but 30 days have elapsed.
 *   - localStorage is unavailable (SSR-safe path).
 *
 * @example
 * const { effectiveTier, setTier } = usePremiumTier();
 * if (effectiveTier === "premium_stub") { ... }
 */
export function usePremiumTier(): {
  effectiveTier: PremiumTier;
  setTier: (tier: PremiumTier) => void;
  startedAt: number;
  setStartedAt: (ts: number) => void;
} {
  const [storedTier, setStoredTier] = usePref("xai_pref_premium_tier");
  const [startedAt, setStartedAt] = usePref("xai_pref_premium_started_at");

  // Compute effective tier with 30-day TTL filter.
  // storedTier is string (from "string" codec registry entry).
  const storedTierStr: string = storedTier;
  let effectiveTier: PremiumTier;

  if (storedTierStr === "premium_stub") {
    const elapsed = Date.now() - startedAt;
    if (elapsed >= PREMIUM_TIER_TTL_MS) {
      // 30-day window expired — effective tier is "free".
      // No timer needed; re-evaluates on every render (pure read-side filter).
      effectiveTier = "free";
    } else {
      effectiveTier = "premium_stub";
    }
  } else if (storedTierStr === "pending") {
    effectiveTier = "pending";
  } else {
    // "free" or anything else (default/unknown) → "free"
    effectiveTier = "free";
  }

  const setTier = (tier: PremiumTier): void => {
    setStoredTier(tier);
  };

  return { effectiveTier, setTier, startedAt, setStartedAt };
}
